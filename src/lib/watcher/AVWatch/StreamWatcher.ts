import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { AVStreamEvent } from '$lib';
import { StreamPhaseWatcher } from '$lib';

export class StreamWatcher {
	private _events = new BehaviorSubject<AVStreamEvent[]>([]);
	private _eventCount = this._events.pipe(map((events) => events.length));

	public get eventCount(): Observable<number> {
		return this._eventCount;
	}
	private _phases = new BehaviorSubject(new Map<string, StreamPhaseWatcher>());
	private _phaseCount = this._phases.pipe(map((phases) => phases.size));

	constructor(public streamName: string) {}

	public get events(): Observable<AVStreamEvent[]> {
		return this._events.asObservable();
	}

	public get phases(): Observable<Map<string, StreamPhaseWatcher>> {
		return this._phases.asObservable();
	}

	public get phaseCount(): Observable<number> {
		return this._phaseCount;
	}

	public get currentPhasesArray(): StreamPhaseWatcher[] {
		return Array.from(Object.values(this._phases.value));
	}

	public get currentPhases(): Map<string, StreamPhaseWatcher> {
		return this._phases.value;
	}

	public addEvent(event: AVStreamEvent): void {
		const phase = this._phases.value.get(event.streamPhase);

		if (!phase) {
			throw new Error(
				`StreamWatcher of name "${this.streamName}" does not have a phase named "${event.streamPhase}"`
			);
		}

		this._events.value.push(event);
		this._events.next(this._events.value);
		phase.addEvent(event);
	}

	public addPhase(phaseName: string): void {
		const phase = this._phases.value.get(phaseName);

		// if (phase) {
		// 	throw new Error(
		// 		`StreamWatcher of name "${this.streamName}" already have a phase named "${phaseName}". Make sure all phase names within a StreamWatcher are unique.`
		// 	);
		// }

		this._phases.value.set(phaseName, new StreamPhaseWatcher(phaseName));
		this._phases.next(this._phases.value);
	}
}
