import type { AVStreamEventType } from './AVStreamEventType';

export class AVStreamEvent {
	private static _nextId = 0;
	public id: number;
	public ordinal: number;

	constructor(
		public readonly timestamp: number,
		public readonly streamName: string,
		public readonly streamPhase: string,
		public readonly type: AVStreamEventType,
		public readonly data?: any,
	) {
		this.id = AVStreamEvent._nextId++;
	}
}
