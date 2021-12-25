import type { StreamRenderingInfo } from '../AVWatch';

export interface StreamRowLayout {
	header: boolean;
	top: number;
	height: number;
	label: string;
}

export function calcRowsLayout(
	streams: StreamRenderingInfo[],
	streamGroupHeaderHeight: number,
	eventCellHeight: number,
	streamGroupSpacing: number
): Map<string, StreamRowLayout> {
	return new Map(
		streams.reduce((acc, stream) => {
			const rowTop =
				acc.length === 0
					? 0
					: acc[acc.length - 1][1].top + acc[acc.length - 1][1].height + streamGroupSpacing;

			acc.push([
				stream.name,
				{
					header: true,
					top: rowTop,
					height: streamGroupHeaderHeight,
					label: stream.name
				}
			]);

			stream.phases.forEach((phase, index) => {
				acc.push([
					`${stream.name}::${phase}`,
					{
						even: index % 2 !== 0,
						top: rowTop + streamGroupHeaderHeight + index * eventCellHeight,
						height: eventCellHeight,
						label: phase
					}
				]);
			});

			return acc;
		}, [])
	);
}
