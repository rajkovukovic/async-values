import { BehaviorSubject, map, Observable } from 'rxjs';
import type { AVStreamEvent } from './AVStreamEvent';

export class StreamPhaseWatcher {
	private _events = new BehaviorSubject<AVStreamEvent[]>([]);
	private _eventCount = this._events.pipe(map((events) => events.length));

	constructor(public phaseName: string) {}

	public get events(): Observable<AVStreamEvent[]> {
		return this._events.asObservable();
	}

	public get eventCount(): Observable<number> {
		return this._eventCount;
	}

	public addEvent(event: AVStreamEvent): void {
		this._events.value.push(event);
		this._events.next(this._events.value);
	}
}
