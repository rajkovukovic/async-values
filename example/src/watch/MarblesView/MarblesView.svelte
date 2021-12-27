<script lang="ts">
	import animateScrollTo from 'animated-scroll-to';
	import { Observable, interval, BehaviorSubject, combineLatest } from 'rxjs';
	import {
		distinctUntilChanged,
		filter,
		map,
		shareReplay,
		take,
		throttleTime
	} from 'rxjs/operators';
	import { asyncScheduler } from 'rxjs';
	import { AVWatch } from '../AVWatch/AVWatch';
	import { afterUpdate } from 'svelte';
	import { watch } from '../../watch/AVWatch/AVWatch';
	import type { AVStreamEvent, StreamRenderingInfo } from '../../watch/AVWatch/AVWatch';
	import { calcRowsLayout } from './MarblesView.helpers';
	import MarblesViewRowHeaders from './MarblesViewRowHeaders.svelte';
	import MarblesViewEventGrid from './MarblesViewEventGrid.svelte';
	import JSONTree from '../json-tree/Root.svelte';

	interval(2000 / 10)
		.pipe(
			take(20),
			watch('medium', 'all'),
			filter((v: number) => v % 2 === 0),
			watch('medium', 'even'),
			map((v: number) => new BehaviorSubject(v * 1000)),
			watch('medium', 'mapped')
		)
		.subscribe();

	interval(1021 / 10)
		.pipe(
			take(20),
			watch('fast', 'all'),
			filter((v: number) => v % 3 === 0),
			watch('fast', 'n-th(3)')
		)
		.subscribe();

	interval(3328 / 10)
		.pipe(
			take(20),
			watch('slow', 'all'),
			filter((v: number) => v % 3 === 0),
			watch('slow', 'n-th(3)')
		)
		.subscribe();

	const eventsStream: Observable<AVStreamEvent[]> = AVWatch.events.pipe(
		throttleTime(300, asyncScheduler, { leading: true, trailing: true }),
		shareReplay(1)
	);

	const visibleStreams: Observable<StreamRenderingInfo[]> = AVWatch.visibleStreams;

	export const selectEvent = (index: number) => {
		if (index >= 0 && index < $eventsStream.length) {
			selectedEvent = $eventsStream[index] ?? null;
			scrollToEvent(index);
		}
	};

	export const selectPrevEvent = (ofSamePhase = false) =>
		selectEvent(
			selectedEvent && !ofSamePhase
				? selectedEvent.id - 1
				: AVWatch.eventInSamePhase(selectedEvent?.id, -1)?.id ??
						selectedEvent?.id ??
						$eventsStream.length - 1
		);

	export const selectNextEvent = (ofSamePhase = false) =>
		selectEvent(
			selectedEvent && !ofSamePhase
				? selectedEvent.id + 1
				: AVWatch.eventInSamePhase(selectedEvent?.id, 1)?.id ?? selectedEvent?.id ?? 0
		);

	export const scrollToEvent = (indexOrEventId: number) => {
		const scrollX = indexOrEventId * eventCellWidth - $clientWidthStream / 2 + gridHorzPadding;
		setTimeout(() => {
			animateScrollTo([scrollX, 0], animatedScrollProps);
			autoScrollToLatest = false;
		}, 20);
	};

	export const scrollToPrevEvent = () => scrollToEvent(selectedEvent ? selectedEvent.id - 1 : 0);
	export const scrollToNextEvent = () => scrollToEvent(selectedEvent ? selectedEvent.id + 1 : 0);

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

	const gridWidthStream: Observable<number> = eventsStream.pipe(
		map((events) => events.length * eventCellWidth),
		distinctUntilChanged(),
		shareReplay(1)
	);

	const gridHeightStream: Observable<number> = rowLayoutsStream.pipe(
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
	let scrollPosition = 0;
	let autoScrollToLatest = true;
	$: animatedScrollProps = {
		elementToScroll: scrollContainer,
		maxDuration: 250,
		speed: 500
	};

	afterUpdate(() => {
		if (animatedScrollProps?.elementToScroll && autoScrollToLatest) {
			animateScrollTo([scrollContainer.scrollWidth, 0], animatedScrollProps);
		}
	});

	function handleScroll(
		event: UIEvent & {
			currentTarget: EventTarget & HTMLDivElement;
		}
	) {
		const delta = scrollContainer.scrollLeft - scrollPosition;
		scrollPosition = scrollContainer.scrollLeft;
		if (autoScrollToLatest && delta < 0) {
			autoScrollToLatest = false;
		} else if (
			!autoScrollToLatest &&
			delta > 0 &&
			scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth
		) {
			autoScrollToLatest = true;
		}
		scrollPositionStream.next(event.currentTarget.scrollLeft);
	}

	let selectedEvent: AVStreamEvent;

	const scrollPositionStream = new BehaviorSubject(0);

	const firstVisibleEventIndex = scrollPositionStream.pipe(
		map((scrollPosition) => Math.floor((scrollPosition - gridHorzPadding) / eventCellWidth)),
		distinctUntilChanged(),
		shareReplay(1)
	);

	const lastVisibleEventIndex = combineLatest([clientWidthStream, scrollPositionStream]).pipe(
		map(
			([clientWidth, scrollPosition]) =>
				Math.ceil((scrollPosition + clientWidth - gridHorzPadding) / eventCellWidth) - 1
		),
		distinctUntilChanged(),
		shareReplay(1)
	);

	// $: console.log('$clientWidthStream', $clientWidthStream);
	// $: console.log('$eventsStream', $eventsStream.length);
	// $: console.log('$viewWidth', $gridWidthStream);
	// $: console.log('$viewHeight', $viewHeight);
	// $: console.log('$scrollPositionStream', $scrollPositionStream);
	// $: console.log('$firstVisibleEventIndex', $firstVisibleEventIndex);
	// $: console.log('$lastVisibleEventIndex', $lastVisibleEventIndex);
	// $: console.log('autoScrollToLatest', autoScrollToLatest);
</script>

<div class="marbles-view">
	<div bind:clientWidth={$clientWidthStream} class="marbles-diagram">
		{#if $visibleStreams}
			<MarblesViewRowHeaders {rowLayoutsStream} />
			<div bind:this={scrollContainer} class="scroll-container" on:scroll={handleScroll}>
				<div
					class="marbles-container"
					style="padding-left: {gridHorzPadding}px; width: {($gridWidthStream || 0) +
						gridHorzPadding * 2}px; height: {$gridHeightStream || 0}px;"
				>
					{#if $gridWidthStream > 0 && $gridHeightStream > 0 && eventsCount > 0}
						<MarblesViewEventGrid
							{gridWidthStream}
							{gridHeightStream}
							{eventCellWidth}
							{eventCellHeight}
							{eventsStream}
							eventToRowLayout={(event) =>
								$rowLayoutsStream.get(`${event.streamName}::${event.streamPhase}`)}
							on:select={(event) => (selectedEvent = event.detail)}
							{selectedEvent}
						/>
					{/if}
				</div>
			</div>
		{/if}
	</div>
	<div class="event-view">
		{#if selectedEvent}
			<JSONTree
				value={{
					id: selectedEvent.id,
					timestamp: new Date(selectedEvent.timestamp),
					type: selectedEvent.type,
					data: selectedEvent.data
				}}
			/>
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
		grid-template-columns: 1fr 320px;
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

	.event-view {
		background: #1b2b34;
		border-left: 1px solid black;
		padding: 16px;
		font-family: var(--json-tree-font-family);
		font-size: var(--json-tree-font-size);
	}
</style>
