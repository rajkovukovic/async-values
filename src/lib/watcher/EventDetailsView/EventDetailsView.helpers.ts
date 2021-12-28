import { AVWatch } from '$lib/watcher/AVWatch/AVWatch';
import type { AVStreamEvent, StreamRenderingInfo } from '$lib/watcher/AVWatch/AVWatch';

export function getAppStateAtEvent(
	streams: StreamRenderingInfo[],
	event: AVStreamEvent,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_: AVStreamEvent[]
): Map<string, Map<string, AVStreamEvent>> {
	const streamMap = new Map<string, Map<string, AVStreamEvent>>();

	streams.forEach((stream) => {
		const phasesMap = new Map();
		stream.phases.forEach((phase) =>
			phasesMap.set(
				phase,
				event
					? AVWatch.eventByIdOrOlder(stream.name, phase, event.id)
					: AVWatch.latestEventByPhase(stream.name, phase)
			)
		);
		streamMap.set(stream.name, phasesMap);
	});

	return streamMap;
}
