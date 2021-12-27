import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import type { MonoTypeOperatorFunction } from 'rxjs';
import { tap, map, shareReplay, switchMap } from 'rxjs/operators';

import { AVStreamEvent } from './AVStreamEvent';
import type { StreamRenderingInfo } from './StreamRenderingInfo';
import { AVStreamEventType } from './AVStreamEventType';
import { StreamWatcher } from './StreamWatcher';
import type { StreamPhaseWatcher } from './StreamPhaseWatcher';

export * from './AVStreamEvent';
export * from './StreamRenderingInfo';
export * from './AVStreamEventType';
export * from './StreamWatcher';

class AVWatchClass {
	/**
	 * timestamp of the first watched event
	 */
	private _initTimestamp: number | null = null;

	private _events = new BehaviorSubject<AVStreamEvent[]>([]);
	private _eventCount = this._events.pipe(map((events) => events.length));

	public get eventCount(): Observable<number> {
		return this._eventCount;
	}
	private _streams = new BehaviorSubject(new Map<string, StreamWatcher>());
	private _streamCount = this._streams.pipe(map((streams) => streams.size));

	private _streamNameQuery = new BehaviorSubject<string>('');
	private _visibleStreams = this._streams.pipe(
		map((streamsMap) => [...streamsMap.values()]),
		switchMap((streams) =>
			combineLatest(
				streams.map((stream) =>
					stream.phases.pipe(
						map((phases) => Array.from(phases.values()).map((phase) => phase.phaseName)),
						map((phaseNames) => ({ name: stream.streamName, phases: phaseNames }))
					)
				)
			)
		),
		shareReplay(1)
	);

	constructor() {
		this._initTimestamp = Date.now();
	}

	public get events(): Observable<AVStreamEvent[]> {
		return this._events.asObservable();
	}

	public addEvent(event: AVStreamEvent) {
		const stream = this._streams.value.get(event.streamName);
		if (!stream) {
			throw new Error(`Seems like AVWather does not have a stream of name "${event.streamName}"`);
		}

		const phase = stream.currentPhases.get(event.streamPhase);
		phase.addEvent(event);

		this._events.value.push(event);
		this._events.next(this._events.value);
	}

	public addWatch(streamName: string, streamPhase: string) {
		let stream = this._streams.value.get(streamName);

		if (!stream) {
			stream = new StreamWatcher(streamName);
			this._streams.value.set(streamName, stream);
			this._streams.next(this._streams.value);
		}

		stream.addPhase(streamPhase);
	}

	public get streamCount(): Observable<number> {
		return this._streamCount;
	}

	public get initTimestamp(): number {
		return this._initTimestamp;
	}

	public filterByStreamName(query: string) {
		this._streamNameQuery.next(query.trim().toLocaleLowerCase());
	}

	public get visibleStreams(): Observable<StreamRenderingInfo[]> {
		return this._visibleStreams;
	}
}

export const AVWatch = new AVWatchClass();

export function watch<T>(streamName: string, streamPhase: string): MonoTypeOperatorFunction<T> {
	AVWatch.addWatch(streamName, streamPhase);

	return tap({
		next: (value) => {
			AVWatch.addEvent(
				new AVStreamEvent(Date.now(), streamName, streamPhase, AVStreamEventType.value, value)
			);
		},

		error: (error) => {
			AVWatch.addEvent(
				new AVStreamEvent(Date.now(), streamName, streamPhase, AVStreamEventType.error, error)
			);
		},

		complete: () => {
			AVWatch.addEvent(
				new AVStreamEvent(
					Date.now(),
					streamName,
					streamPhase,
					AVStreamEventType.complete,
					undefined
				)
			);
		}
	});
}
