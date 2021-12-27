<script lang="ts">
	import animateScrollTo from 'animated-scroll-to';
	import { Observable, interval, BehaviorSubject } from 'rxjs';
	import { distinctUntilChanged, filter, map, shareReplay, take } from 'rxjs/operators';
	import { afterUpdate, beforeUpdate } from 'svelte';
	import { watch } from '../../watch/AVWatch/AVWatch';
	import type { AVStreamEvent, StreamRenderingInfo } from '../../watch/AVWatch/AVWatch';
	import { calcRowsLayout } from './MarblesView.helpers';
	import MarblesViewRowHeaders from './MarblesViewRowHeaders.svelte';
	import MarblesViewEventGrid from './MarblesViewEventGrid.svelte';
	import JSONTree from '../json-tree/Root.svelte';

	interval(2000)
		.pipe(
			take(10),
			watch('interval-2s', 'all'),
			filter((v: number) => v % 2 === 0),
			watch('interval-2s', 'even'),
			map((v: number) => new BehaviorSubject(v * 1000)),
			watch('interval-2s', 'mapped')
		)
		.subscribe();

	interval(1328)
		.pipe(
			take(10),
			watch('interval-1.328', 'all'),
			filter((v: number) => v % 3 === 0),
			watch('interval-1.328', 'n-th(3)')
		)
		.subscribe();

	interval(1 * 3328)
		.pipe(
			take(10),
			watch('interval-3.328', 'all'),
			filter((v: number) => v % 3 === 0),
			watch('interval-3.328', 'n-th(3)')
		)
		.subscribe();

	export let eventsStream: Observable<AVStreamEvent[]>;
	export let visibleStreams: Observable<StreamRenderingInfo[]>;

	const streamGroupSpacing = 10;
	const streamGroupHeaderHeight = 30;
	const eventCellWidth = 40;
	const eventCellHeight = 40;
	const gridHorzPadding = 2 * eventCellWidth;

	$: eventsCount = $eventsStream?.length ?? 0;

	const rowLayoutsStream = visibleStreams.pipe(
		map((streams) =>
			calcRowsLayout(streams, streamGroupHeaderHeight, eventCellHeight, streamGroupSpacing)
		),
		shareReplay(1)
	);

	let gridWidthStream: Observable<number>;
	$: gridWidthStream =
		eventsStream?.pipe(
			map((events) => events.length * eventCellWidth),
			distinctUntilChanged(),
			shareReplay(1)
		) ?? new BehaviorSubject(0);

	let gridHeightStream: Observable<number> = rowLayoutsStream.pipe(
		map((rowLayouts) =>
			Array.from(rowLayouts.values()).reduce(
				(acc, layout) => (layout.top + layout.height > acc ? layout.top + layout.height : acc),
				0
			)
		),
		distinctUntilChanged(),
		shareReplay(1)
	) as Observable<number>;

	const clientWidthStream = new BehaviorSubject(0);
	(clientWidthStream as any).set = clientWidthStream.next.bind(clientWidthStream);

	let scrollContainer: HTMLDivElement;
	let shouldScrollToLatest = false;
	let isScrolling = false;

	beforeUpdate(() => {
		shouldScrollToLatest = scrollContainer
			? isScrolling ||
			  scrollContainer.offsetWidth + scrollContainer.scrollLeft >=
					scrollContainer.scrollWidth - eventCellWidth
			: isScrolling;
	});

	afterUpdate(() => {
		if (shouldScrollToLatest) {
			isScrolling = true;
			animateScrollTo([scrollContainer.scrollWidth, 0], {
				elementToScroll: scrollContainer,
				speed: 500
			}).then(() => (isScrolling = false));
		}
	});

	let selectedEvent;

	// $: console.log('$clientWidthStream', $clientWidthStream);
	// $: console.log('Array.from($rowLayouts.values())', Array.from($rowLayoutsStream.values()));
	// $: console.log('scrollContainer', scrollContainer);
	// $: console.log('$viewWidth', $viewWidth);
	// $: console.log('$viewHeight', $viewHeight);
	// $: console.log('$eventsStream', $eventsStream);
</script>

<div class="marbles-view">
	<div bind:clientWidth={$clientWidthStream} class="marbles-diagram">
		<MarblesViewRowHeaders {rowLayoutsStream} />
		<div bind:this={scrollContainer} class="scroll-container">
			<div
				class="marbles-container"
				style="padding-left: {gridHorzPadding}px; width: {($gridWidthStream || 0) +
					gridHorzPadding * 2}px; height: {($gridHeightStream || 0) + gridHorzPadding * 2}px;"
			>
				<div class="marbles-animation-container">
					{#if $gridWidthStream > 0 && $gridHeightStream > 0 && eventsCount > 0}
						<MarblesViewEventGrid
							{gridWidthStream}
							{gridHeightStream}
							{eventCellWidth}
							{eventCellHeight}
							{eventsStream}
							eventToRowLayout={(event) => {
								const map = $rowLayoutsStream;
								const result = $rowLayoutsStream.get(`${event.streamName}::${event.streamPhase}`);
								if (!result) {
									// debugger;
								}
								return result;
							}}
							on:select={(event) => (selectedEvent = event.detail)}
							{selectedEvent}
						/>
					{/if}
				</div>
			</div>
		</div>
	</div>
	<div class="event-view">
		{#if selectedEvent}
			{#key selectedEvent.id}
				<JSONTree
					value={{
						streamName: selectedEvent.streamName,
						streamPhase: selectedEvent.streamPhase,
						timestamp: new Date(selectedEvent.timestamp).toISOString().split('T')[1].split('Z')[0],
						type: selectedEvent.type,
						data: selectedEvent.data
					}}
				/>
			{/key}
		{:else}
			Select an event to see details
		{/if}
	</div>
</div>

<style>
	:global(:root) {
		/* color */
		--json-tree-string-color: #99c794;
		--json-tree-symbol-color: #fbc863;
		--json-tree-boolean-color: #f99157;
		--json-tree-function-color: #c594c5;
		--json-tree-number-color: #f99157;
		--json-tree-label-color: #cdd3de;
		--json-tree-arrow-color: #999898;
		--json-tree-null-color: #f99157;
		--json-tree-undefined-color: #f99157;
		--json-tree-date-color: #6699cc;
		/* position */
		--json-tree-li-indentation: 1em;
		--json-tree-li-line-height: 1.3;
		/* font */
		--json-tree-font-size: 12px;
		--json-tree-font-family: 'Courier New', Courier, monospace;
	}

	.marbles-view {
		display: grid;
		grid-template-columns: 1fr 300px;
		grid-template-rows: 1fr;
		background: rgb(23, 23, 23);
		color: white;
	}

	.marbles-diagram {
		position: relative;
		height: 100vh;
		overflow: hidden auto;
		font-family: Arial, Helvetica, sans-serif;
		font-size: 12px;
	}

	.scroll-container {
		position: relative;
		min-height: 100%;
		overflow: auto hidden;
		z-index: 1;
	}

	.marbles-animation-container {
		overflow: hidden;
	}

	.event-view {
		background: #1b2b34;
		border-left: 1px solid black;
		padding: 16px;
		font-family: var(--json-tree-font-family);
		font-size: var(--json-tree-font-size);
	}
</style>
