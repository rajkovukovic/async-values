import { BehaviorSubject } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';
// import { browser } from '$app/env';
import { TimeStampView } from '$lib';

export class BehaviorSubjectWithSet<T> extends BehaviorSubject<T> {
	set(value: T): void {
		super.next(value);
	}
}

export const timestampViewStream = createLocalStorageStream(
	TimeStampView.sinceAppStart,
	'TimeStampView',
);

export const appStartTimestamp = new BehaviorSubject(Date.now());

export const showAppFullStateStream = createLocalStorageStream(true, 'ShowAppFullState');

export const showEventDetailsStream = createLocalStorageStream(false, 'ShowEventDetails');

export const jsonTreeExpandedLevel = createLocalStorageStream(1, 'JsonTreeExpandedLevel');

const hiddenStreamsArray = createLocalStorageStream([], 'HiddenStreams');
export const hiddenStreams = hiddenStreamsArray.pipe(
	map((hiddenStreamsArray) => new Set(hiddenStreamsArray)),
	shareReplay(1),
);

/**
 *
 * Toggles visibility of a stream
 * @param streamName
 * @returns true if the stream is visible after toggling
 */
export function toggleStreamVisibility(streamName: string): boolean {
	const index = hiddenStreamsArray.value.indexOf(streamName);
	if (index < 0) hiddenStreamsArray.value.push(streamName);
	else hiddenStreamsArray.value.splice(index, 1);
	hiddenStreamsArray.next(hiddenStreamsArray.value);
	return index < 0;
}

/**
 *
 * @param initialValue value used as stream seed if localStorage has invalid or no value
 * @param localStorageKey key used to read/write stream values from/to localStorage
 * @returns BehaviorSubject seeded with localStorage.getItem(localStorageKey) || initialValue
 */
function createLocalStorageStream<T>(
	initialValue: T,
	localStorageKey: string,
): BehaviorSubjectWithSet<T> {
	localStorageKey = `async-value:watch:${localStorageKey}`;

	let existingValue: T = null;
	const localStorage = typeof window !== 'undefined' ? window?.localStorage : null;

	// if (browser) {
	try {
		const raw = localStorage?.getItem(localStorageKey);
		if (typeof raw === 'string') existingValue = JSON.parse(raw);
	} catch (_) {
		// noop
	}
	// }

	const stream = new BehaviorSubjectWithSet<T>(existingValue ?? initialValue);

	stream
		.pipe(filter((value) => localStorage?.getItem(localStorageKey) !== JSON.stringify(value)))
		.subscribe((value) => localStorage?.setItem(localStorageKey, JSON.stringify(value)));

	return stream;
}
