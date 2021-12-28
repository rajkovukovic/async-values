import type { MonoTypeOperatorFunction } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AVStreamEvent } from './AVStreamEvent';
import { AVStreamEventType } from './AVStreamEventType';
import { AVWatch } from './AVWatch';

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
