import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { AVStreamEvent } from '$lib';

export class StreamPhaseWatcher {
	private _events = new BehaviorSubject<AVStreamEvent[]>([]);
	private _eventCount = this._events.pipe(map((events) => events.length));

	constructor(public phaseName: string) {}

	public get currentEvents(): AVStreamEvent[] {
		return this._events.value;
	}

	public get events(): Observable<AVStreamEvent[]> {
		return this._events.asObservable();
	}

	public get eventCount(): Observable<number> {
		return this._eventCount;
	}

	public addEvent(event: AVStreamEvent): void {
		event.ordinal = this._events.value.length;
		this._events.value.push(event);
		this._events.next(this._events.value);
	}
}
