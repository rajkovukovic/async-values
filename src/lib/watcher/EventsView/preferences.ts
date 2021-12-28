import { browser } from '$app/env';
import { BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';
import { TimeStampView } from './TimeStampView';

class BehaviorSubjectWithSet<T> extends BehaviorSubject<T> {
	set(value: T): void {
		super.next(value);
	}
}

export const timestampViewStream = createLocalStorageStream(
	TimeStampView.absoluteTime,
	'TimeStampView'
);

export const showAppFullStateStream = createLocalStorageStream(true, 'ShowAppFullState');

export const showEventDetailsStream = createLocalStorageStream(false, 'ShowEventDetails');

/**
 *
 * @param initialValue value used as stream seed if localStorage has invalid or no value
 * @param localStorageKey key used to read/write stream values from/to localStorage
 * @returns BehaviorSubject seeded with localStorage.getItem(localStorageKey) || initialValue
 */
function createLocalStorageStream<T>(
	initialValue: T,
	localStorageKey: string
): BehaviorSubjectWithSet<T> {
	localStorageKey = `async-value:watch:${localStorageKey}`;

	let existingValue: T = null;

	if (browser) {
		try {
			const raw = localStorage.getItem(localStorageKey);
			if (typeof raw === 'string') existingValue = JSON.parse(raw);
		} catch (_) {
			// noop
		}
	}

	const stream = new BehaviorSubjectWithSet<T>(existingValue ?? initialValue);

	stream
		.pipe(skip(1))
		.subscribe((value) => localStorage.setItem(localStorageKey, JSON.stringify(value)));

	return stream;
}
