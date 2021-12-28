import type { AVStreamEvent } from './AVStreamEvent';

export function sortedEventIndex(events: AVStreamEvent[], eventId: number): number {
	if (!events || events.length === 0) return 0;

	let start = 0;
	let end = events.length - 1;

	while (start < end) {
		const mid = (start + end) >>> 1;
		if (events[mid].id < eventId) start = mid + 1;
		else end = mid;
	}

	return start;
}
