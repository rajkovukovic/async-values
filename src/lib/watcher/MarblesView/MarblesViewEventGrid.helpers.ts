import type { StreamRowLayout } from '$lib';

interface DashData {
	offset: number;
	dashArray: string;
}

export function rowLayoutsToDashData(rowLayouts: Map<string, StreamRowLayout>): DashData {
	const dashes = [...rowLayouts.values()].reduce((acc: { top: number; bottom: number }[], row) => {
		if (!row.header) {
			if (acc.length === 0) acc = [{ top: row.top, bottom: row.top + row.height }];
			else if (acc[acc.length - 1].bottom >= row.top) {
				acc[acc.length - 1].bottom = row.top + row.height;
			} else {
				acc.push({ top: row.top, bottom: row.top + row.height });
			}
		}

		return acc;
	}, []);

	return dashes.reduce(
		(acc, dash, index, dashes) => {
			if (index === 0) {
				acc.offset = dash.top;
				acc.dashArray += ` ${dash.bottom - dash.top}`;
			} else {
				const prevDash = dashes[index - 1];
				acc.dashArray += ` ${dash.top - prevDash.bottom} ${dash.bottom - dash.top}`;
			}
			return acc;
		},
		{ offset: 0, dashArray: '' }
	);
}
