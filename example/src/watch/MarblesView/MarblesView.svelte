<script lang="ts">
	import animateScrollTo from 'animated-scroll-to';
	import type { RxCollection } from 'rxdb';
	import { Observable, interval, BehaviorSubject } from 'rxjs';
	import { distinctUntilChanged, filter, map, shareReplay, take } from 'rxjs/operators';
	import { afterUpdate, beforeUpdate } from 'svelte';
	import { watch } from '../../watch/AVWatch';
	import type { AVStreamEvent, StreamRenderingInfo } from '../../watch/AVWatch';
	import { calcRowsLayout } from './MarblesView.helpers';
	import MarblesViewRowHeaders from './MarblesViewRowHeaders.svelte';
	import MarblesViewEventGrid from './MarblesViewEventGrid.svelte';

	interval(0.1 * 2000)
		.pipe(
			take(30),
			watch('interval-2s', 'all'),
			filter((v: number) => v % 2 === 0),
			watch('interval-2s', 'even'),
			map((v: number) => v * 1000),
			watch('interval-2s', 'mapped')
		)
		.subscribe();

	// interval(1328)
	// 	.pipe(
	// 		watch('interval-1.328', 'all'),
	// 		filter((v: number) => v % 3 === 0),
	// 		watch('interval-1.328', 'n-th(3)')
	// 	)
	// 	.subscribe();

	// interval(1 * 3328)
	// 	.pipe(
	// 		watch('interval-3.328', 'all'),
	// 		filter((v: number) => v % 3 === 0),
	// 		watch('interval-3.328', 'n-th(3)')
	// 	)
	// 	.subscribe();

	export let eventsCollectionStream: Observable<RxCollection<any, any, any, any>>;
	export let visibleStreamsStream: Observable<StreamRenderingInfo[]>;

	const streamGroupSpacing = 10;
	const streamGroupHeaderHeight = 30;
	const eventCellWidth = 40;
	const eventCellHeight = 40;

	let eventsStream: Observable<AVStreamEvent[]>;
	$: eventsStream = $eventsCollectionStream?.find().$;

	$: eventsCount = $eventsStream?.length ?? 0;

	$: firstEventStream = $eventsCollectionStream?.findOne().sort({ id: 'asc' }).$;
	$: lastEventStream = $eventsCollectionStream?.findOne().sort({ id: 'desc' }).$;

	const rowLayoutsStream = visibleStreamsStream.pipe(
		map((streams) =>
			calcRowsLayout(streams, streamGroupHeaderHeight, eventCellHeight, streamGroupSpacing)
		),
		shareReplay(1)
	);

	let viewWidthStream: Observable<number>;
	$: viewWidthStream =
		eventsStream?.pipe(
			map((events) => events.length * eventCellWidth),
			distinctUntilChanged(),
			shareReplay(1)
		) ?? new BehaviorSubject(0);

	let viewHeightStream: Observable<number> = rowLayoutsStream.pipe(
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

	// $: console.log('$clientWidthStream', $clientWidthStream);
	// $: console.log('Array.from($rowLayouts.values())', Array.from($rowLayoutsStream.values()));
	// $: console.log('scrollContainer', scrollContainer);
	// $: console.log('$viewWidth', $viewWidth);
	// $: console.log('$viewHeight', $viewHeight);
	// $: console.log('$eventsStream', $eventsStream);
</script>

<div bind:clientWidth={$clientWidthStream} class="marbles-diagram">
	<MarblesViewRowHeaders {rowLayoutsStream} />
	<div bind:this={scrollContainer} class="scroll-container">
		<div
			class="marbles-container"
			style="width: {$viewWidthStream || 0}px; height: {$viewHeightStream || 0}px;"
		>
			<div class="marbles-animation-container">
				{#if $viewWidthStream > 0 && $viewHeightStream > 0 && eventsCount > 0}
					<MarblesViewEventGrid
						{eventCellWidth}
						{eventCellHeight}
						{eventsStream}
						eventToRowLayout={(event) =>
							$rowLayoutsStream.get(`${event.streamName}::${event.streamPhase}`)}
						{viewWidthStream}
						{viewHeightStream}
					/>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.marbles-diagram {
		position: relative;
		height: 100vh;
		overflow: hidden auto;
		font-family: Arial, Helvetica, sans-serif;
		font-size: 12px;
		background: rgb(23, 23, 23);
		color: white;
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
</style>
