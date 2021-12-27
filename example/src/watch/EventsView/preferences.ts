import { BehaviorSubject, skip } from 'rxjs';
import { TimeStampView } from './TimeStampView';

export const timestampViewStore = new BehaviorSubject(
	localStorage.getItem('async-value:watch:TimeStampView') ?? TimeStampView.timeSincePreviousEvent
);
(timestampViewStore as any).set = timestampViewStore.next.bind(timestampViewStore);

timestampViewStore
	.pipe(skip(1))
	.subscribe((value) => localStorage.setItem('async-value:watch:TimeStampView', value));
