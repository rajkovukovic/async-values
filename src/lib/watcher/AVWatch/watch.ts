import type { MonoTypeOperatorFunction } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AVStreamEvent, AVStreamEventType, AVWatch, MultiStateAsyncValue } from '$lib';

export function watch<T>(streamName: string, streamPhase: string): MonoTypeOperatorFunction<T> {
	AVWatch.addWatch(streamName, streamPhase);

	return tap({
		next: (value) => {
			let type = AVStreamEventType.value;

			if (value instanceof MultiStateAsyncValue) {
				type = value.error
					? AVStreamEventType.avError
					: value.pending
					? AVStreamEventType.avPending
					: AVStreamEventType.avValue;
			}

			AVWatch.addEvent(new AVStreamEvent(Date.now(), streamName, streamPhase, type, value));
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
