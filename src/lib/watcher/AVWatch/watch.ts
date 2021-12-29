import type { MonoTypeOperatorFunction, Observable, PartialObserver, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AVStreamEvent, AVStreamEventType, AVWatch, MultiStateAsyncValue } from '$lib';

function createOberver<T>(streamName: string, streamPhase: string): PartialObserver<T> {
	return {
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
	};
}

export function watch<T>(streamName: string, streamPhase: string): MonoTypeOperatorFunction<T> {
	AVWatch.addWatch(streamName, streamPhase);
	return tap(createOberver<T>(streamName, streamPhase));
}

export function watchStream<T>(streamName: string, stream: Observable<T>): Subscription {
	AVWatch.addWatch(streamName, '');
	return stream.subscribe(createOberver<T>(streamName, ''));
}
