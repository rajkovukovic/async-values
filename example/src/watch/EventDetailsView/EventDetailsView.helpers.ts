import { AVWatch } from '../AVWatch/AVWatch';
import type { AVStreamEvent, StreamRenderingInfo } from '../AVWatch/AVWatch';

export function getAppStateAtEvent(
	streams: StreamRenderingInfo[],
	event: AVStreamEvent,
	_: AVStreamEvent[],
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
