import { BehaviorSubject, combineLatest, firstValueFrom, Observable } from 'rxjs';
import { tap, map, distinctUntilChanged, shareReplay, filter, switchMap } from 'rxjs/operators';
import type { RxCollection } from 'rxdb';
import { dbStream } from './db';

export enum AVStreamEventType {
	value = 'value',
	error = 'error',
	complete = 'complete'
}

export interface StreamRenderingInfo {
	name: string;
	phases: string[];
}

export class AVStreamEvent {
	private static _nextId = 1;
	public id: string;

	constructor(
		public readonly timestamp: number,
		public readonly streamName: string,
		public readonly streamPhase: string,
		public readonly type: AVStreamEventType,
		public readonly data?: any
	) {
		this.id = (AVStreamEvent._nextId++).toString().padStart(9, '0');
	}
}

class AVWatchClass {
	/**
	 * timestamp of the first watched event
	 */
	private _initTimestamp: number | null = null;

	/**
	 * collection of events wrapped in BehaviorSubject
	 * BehaviorSubject is used to notify all listeners when database changes
	 */
	private _eventsCollection = new BehaviorSubject<RxCollection<any, any, any, any>>(null);

	private _eventsBuffer = [];

	/**
	 *
	 */
	private _streams: BehaviorSubject<Map<string, Set<string>>> = new BehaviorSubject(new Map());
	private _streamNameQuery = new BehaviorSubject<string>('');
	private _visibleStreams = this._streams.pipe(
		map((streams: Map<string, Set<string>>) =>
			Array.from(streams.entries()).sort((a, b) =>
				a[0].toLocaleLowerCase().localeCompare(b[0].toLocaleLowerCase())
			)
		),
		map((streams) =>
			streams.map(([streamName, streamPhases]) => ({
				name: streamName,
				phases: Array.from(streamPhases.values())
			}))
		),
		shareReplay(1)
	);

	constructor() {
		this._initTimestamp = Date.now();
		firstValueFrom(dbStream)
			.then((db) => {
				console.log('db init success');
				this._eventsCollection.next(db.events);
				if (this._eventsBuffer.length > 0) {
					this._eventsCollection.value.bulkInsert(this._eventsBuffer);
					this._eventsBuffer.length = 0;
				}
			})
			.catch((error) => console.error(error));
	}

	public addEvent(event: AVStreamEvent) {
		if (this._eventsCollection.value) {
			return this._eventsCollection.value.insert(event);
		} else {
			this._eventsBuffer.push(event);
		}
	}

	public addWatch(streamName: string, streamPhase: string) {
		const existingStreams = this._streams.value;

		if (!existingStreams.has(streamName)) {
			existingStreams.set(streamName, new Set());
		}

		if (!existingStreams.get(streamName).has(streamPhase)) {
			existingStreams.get(streamName).add(streamPhase);
			this._streams.next(this._streams.value);
		}
	}

	public filterByStreamName(query: string) {
		this._streamNameQuery.next(query.trim().toLocaleLowerCase());
	}

	public get visibleStreams(): Observable<StreamRenderingInfo[]> {
		return this._visibleStreams;
	}

	public get eventsCollection(): Observable<any> {
		return this._eventsCollection;
	}

	public get events(): Observable<any> {
		return this._eventsCollection.pipe(
			filter(Boolean),
			switchMap((collection) => collection.find().$),
			shareReplay(1)
		);
	}
}

export const AVWatch = new AVWatchClass();

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function watch(streamName: string, streamPhase: string) {
	AVWatch.addWatch(streamName, streamPhase);
	return tap(
		// onNext
		(value) => {
			AVWatch.addEvent(
				new AVStreamEvent(Date.now(), streamName, streamPhase, AVStreamEventType.value, value)
			);
		},
		// onError
		(error) => {
			AVWatch.addEvent(
				new AVStreamEvent(Date.now(), streamName, streamPhase, AVStreamEventType.error, error)
			);
		},
		// onComplete
		() => {
			AVWatch.addEvent(
				new AVStreamEvent(Date.now(), streamName, streamPhase, AVStreamEventType.complete)
			);
		}
	);
}
