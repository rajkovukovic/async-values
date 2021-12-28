<script lang="ts">
	import animateScrollTo from 'animated-scroll-to';
	import { Observable, BehaviorSubject } from 'rxjs';
	import { distinctUntilChanged, map, shareReplay, throttleTime } from 'rxjs/operators';
	import { asyncScheduler } from 'rxjs';
	import { AVWatch } from '../AVWatch/AVWatch';
	import { afterUpdate } from 'svelte';
	import type { AVStreamEvent, StreamRenderingInfo } from '../../watch/AVWatch/AVWatch';
	import { calcRowsLayout } from './MarblesView.helpers';
	import MarblesViewRowHeaders from './MarblesViewRowHeaders.svelte';
	import MarblesViewEventGrid from './MarblesViewEventGrid.svelte';
	import EventDetailsView from '../EventDetailsView/EventDetailsView.svelte';

	const eventsStream: Observable<AVStreamEvent[]> = AVWatch.events.pipe(
		throttleTime(850, asyncScheduler, { leading: true, trailing: true }),
		shareReplay(1)
	);

	const visibleStreams: Observable<StreamRenderingInfo[]> = AVWatch.visibleStreams;

	export const selectEvent = (index: number) => {
		if (index >= 0 && index < $eventsStream.length) {
			selectedEvent = $eventsStream[index] ?? null;
			scrollToEvent(index);
		}
	};

	export const selectFirstEvent = () => selectEvent(0);

	export const selectLastEvent = () => selectEvent($eventsStream.length - 1);

	export const selectPrevEvent = (ofSamePhase = false) =>
		selectEvent(
			selectedEvent && !ofSamePhase
				? selectedEvent.id - 1
				: AVWatch.eventInSamePhase(selectedEvent, -1)?.id ??
						selectedEvent?.id ??
						$eventsStream.length - 1
		);

	export const selectNextEvent = (ofSamePhase = false) =>
		selectEvent(
			selectedEvent && !ofSamePhase
				? selectedEvent.id + 1
				: AVWatch.eventInSamePhase(selectedEvent, 1)?.id ?? selectedEvent?.id ?? 0
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
				(acc, { top, height }) => (top + height > acc ? top + height : acc),
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
		maxDuration: 150,
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

	// const firstVisibleEventIndex = scrollPositionStream.pipe(
	// 	map((scrollPosition) => Math.floor((scrollPosition - gridHorzPadding) / eventCellWidth)),
	// 	distinctUntilChanged(),
	// 	shareReplay(1)
	// );

	// const lastVisibleEventIndex = combineLatest([clientWidthStream, scrollPositionStream]).pipe(
	// 	map(
	// 		([clientWidth, scrollPosition]) =>
	// 			Math.ceil((scrollPosition + clientWidth - gridHorzPadding) / eventCellWidth) - 1
	// 	),
	// 	distinctUntilChanged(),
	// 	shareReplay(1)
	// );
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

	<EventDetailsView {eventsStream} {selectedEvent} />
</div>

<style lang="scss">
	.marbles-view {
		display: grid;
		grid-template-columns: 1fr 320px;
		grid-template-rows: 1fr;
		max-height: 100%;
		background: rgb(12, 12, 12);
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

	:global(.clickable) {
		background: inherit;
		&:hover {
			cursor: pointer;
			filter: brightness(200%);
		}
		&:active {
			filter: blur(1px);
		}
	}
</style>
