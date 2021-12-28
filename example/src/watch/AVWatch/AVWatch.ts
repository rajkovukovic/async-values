import { BehaviorSubject, combineLatest, from, Observable, Subscription } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

import type { AVStreamEvent } from './AVStreamEvent';
import type { StreamRenderingInfo } from './StreamRenderingInfo';
import { StreamWatcher } from './StreamWatcher';
import { sortedEventIndex } from './AVWatch.helpers';
import type EventsView from '../EventsView/EventsView.svelte';

export * from './AVStreamEvent';
export * from './StreamRenderingInfo';
export * from './AVStreamEventType';
export * from './StreamWatcher';

class AVWatchClass {
	/**
	 * timestamp of the first watched event
	 */
	private _initTimestamp: number | null = null;

	/**
	 * all events from all the streams and all the phases
	 */
	private _events = new BehaviorSubject<AVStreamEvent[]>([]);
	private _eventCount = this._events.pipe(map((events) => events.length));

	/**
	 * all the streams being watched
	 */
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

	public get eventCount(): Observable<number> {
		return this._eventCount;
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

	public latestEventByPhase(streamName: string, streamPhase: string): AVStreamEvent | null {
		const phaseEvents = this._streams.value
			?.get(streamName)
			?.currentPhases.get(streamPhase)?.currentEvents;

		return phaseEvents[phaseEvents.length - 1] ?? null;
	}

	/**
	 *
	 * @param streamName name of the stream to search
	 * @param streamPhase phase of the stream to search
	 * @param eventId eventId to search for
	 * @returns event with eventId or latest event older than event[id=eventId]
	 */
	public eventByIdOrOlder(
		streamName: string,
		streamPhase: string,
		eventId: number
	): AVStreamEvent | null {
		const phaseEvents = this._streams.value
			?.get(streamName)
			?.currentPhases.get(streamPhase)?.currentEvents;

		const index = sortedEventIndex(phaseEvents, eventId);

		return phaseEvents[index]?.id === eventId ? phaseEvents[index] : phaseEvents[index - 1] ?? null;
	}

	/**
	 * @param event - starting event
	 * @param offset - i.e. if offset=-1, find previous event of same phase
	 * @returns AVStreamEvent if found, null otherwise
	 */
	public eventInSamePhase(event: AVStreamEvent | null, offset: number): AVStreamEvent | null {
		if (!event) return null;

		const phaseEvents = this._streams.value
			?.get(event.streamName)
			?.currentPhases.get(event.streamPhase)?.currentEvents;

		const index = sortedEventIndex(phaseEvents, event.id);

		if (phaseEvents[index].id !== event.id) {
			throw new Error(
				`Can not find event id[${event.id}] in stream[${event.streamName}], phase[${event.streamPhase}]`
			);
		}

		return phaseEvents[index + offset] ?? null;
	}

	private _eventsView: EventsView = null;
	private _eventsViewMountingSubsriber: Subscription = null;

	public activate(showWatcherOnMount = false): void {
		if (this._eventsViewMountingSubsriber && !this._eventsViewMountingSubsriber.closed) {
			this.deactivate();
		}

		this._eventsViewMountingSubsriber = from(import('../EventsView/EventsView.svelte'))
			.pipe(map((module) => module.default))
			.subscribe({
				next: (EventsViewComponent) => {
					this._eventsView = new EventsViewComponent({
						target: document.body,
						props: { visible: showWatcherOnMount }
					});
				}
			});
	}

	public deactivate(): void {
		this._eventsViewMountingSubsriber?.unsubscribe();
		this._eventsViewMountingSubsriber = null;
		this._eventsView?.$destroy();
		this._eventsView = null;
	}
}

export const AVWatch = new AVWatchClass();

export * from './watch';
