import { BehaviorSubject, combineLatest, firstValueFrom, Observable } from 'rxjs';
import { tap, map, distinctUntilChanged, shareReplay, filter, switchMap } from 'rxjs/operators';
import { dbStream } from './db';

export enum AVStreamEventType {
	value = 'value',
	error = 'error',
	complete = 'complete',
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
	private _eventsCollection = new BehaviorSubject(null);

	private _eventsBuffer = [];

	/**
	 *
	 */
	private _streams: BehaviorSubject<Map<string, Set<string>>> = new BehaviorSubject(new Map());
	private _streamNameQuery = new BehaviorSubject<string>('');
	private _visibleStreams = combineLatest([this._streams, this._streamNameQuery]).pipe(
		map(([streams, query]) =>
			(query
				? Array.from(streams.keys()).filter((name) => name.toLocaleLowerCase().includes(query))
				: Array.from(streams.keys())
			).sort()
		),
		distinctUntilChanged((a, b) => a.join() === b.join()),
		map((streamNames) =>
			streamNames.map((streamName) => ({
				name: streamName,
				phases: Array.from(this._streams.value.get(streamName))
			}))
		),
		shareReplay(1)
	);

	constructor() {
		this._initTimestamp = Date.now();
		firstValueFrom(dbStream)
			.then(db => {
				console.log('db init success');
				this._eventsCollection.next(db.events);
				if (this._eventsBuffer.length > 0) {
					this._eventsCollection.value.bulkInsert(this._eventsBuffer);
					this._eventsBuffer.length = 0;
				}
			})
			.catch((error) => console.error(error));
	}

	private internalAddEvent(event: AVStreamEvent) {
		if (this._eventsCollection.value) {
			return this._eventsCollection.value.insert(event);
		} else {
			this._eventsBuffer.push(event);
		}
	}

	public addEvent(event: AVStreamEvent) {
		const existingStreams = this._streams.value;
		if (!existingStreams.has(event.streamName)) {
			existingStreams.set(event.streamName, new Set());
		}

		if (!existingStreams.get(event.streamName).has(event.streamPhase)) {
			existingStreams.get(event.streamName).add(event.streamPhase);
			this._streams.next(this._streams.value);
		}

		return this.internalAddEvent(event);
	}

	public filterByStreamName(query: string) {
		this._streamNameQuery.next(query.trim().toLocaleLowerCase());
	}

	public get visibleStreams() {
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
export function watch(streamName: string, streamPhase?: string) {
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
