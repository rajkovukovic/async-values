<script lang="ts">
	import animateScrollTo from 'animated-scroll-to';
	import { asyncScheduler, Observable, BehaviorSubject } from 'rxjs';
	import { distinctUntilChanged, map, shareReplay, throttleTime } from 'rxjs/operators';
	import { afterUpdate } from 'svelte';
	import { AVStreamEvent, hiddenStreams, MarblesViewRowNames, StreamRenderingInfo } from '$lib';
	import {
		AVWatch,
		EventDetailsView,
		calcRowsLayout,
		MarblesViewRowHeaders,
		MarblesViewEventGrid
	} from '$lib';

	export let hidden = false;

	$: AVWatch.setHiddenStreams($hiddenStreams);

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

	export const selectFirstEvent = (startingFromIndex: number) => {
		for (let index = startingFromIndex ?? 0; index < $eventsStream.length; index++) {
			const event = $eventsStream[index];
			if (!$hiddenStreams.has(event.streamName)) {
				selectEvent(index);
				break;
			}
		}
	};

	export const selectLastEvent = (startingFromIndex: number) => {
		for (let index = startingFromIndex ?? $eventsStream.length - 1; index >= 0; index--) {
			const event = $eventsStream[index];
			if (!$hiddenStreams.has(event.streamName)) {
				selectEvent(index);
				break;
			}
		}
	};

	export const selectPrevEvent = (ofSamePhase = false) =>
		ofSamePhase
			? selectEvent(
					AVWatch.eventInSamePhase(selectedEvent, -1)?.id ??
						selectedEvent?.id ??
						$eventsStream.length - 1
			  )
			: selectLastEvent(selectedEvent ? selectedEvent.id - 1 : null);

	export const selectNextEvent = (ofSamePhase = false) =>
		ofSamePhase
			? selectEvent(AVWatch.eventInSamePhase(selectedEvent, 1)?.id ?? selectedEvent?.id ?? 0)
			: selectFirstEvent(selectedEvent ? selectedEvent.id + 1 : null);

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

	$: if (selectedEvent && $hiddenStreams.has(selectedEvent.streamName)) {
		selectedEvent = null;
	}

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

<div class="marbles-view" class:hidden>
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
							{rowLayoutsStream}
							on:select={(event) => (selectedEvent = event.detail)}
							{selectedEvent}
						/>
					{/if}
				</div>
			</div>
			<MarblesViewRowNames {rowLayoutsStream} />
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
		color: white;
		&.hidden {
			display: none;
		}
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
