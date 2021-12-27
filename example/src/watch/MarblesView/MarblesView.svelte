<script lang="ts">
	import animateScrollTo from 'animated-scroll-to';
	import type { RxCollection } from 'rxdb';
	import { Observable, interval, BehaviorSubject, of, throwError } from 'rxjs';
	import { catchError, distinctUntilChanged, filter, map, shareReplay, switchMap, take } from 'rxjs/operators';
	import { afterUpdate, beforeUpdate } from 'svelte';
	import { watch } from '../../watch/AVWatch';
	import type { AVStreamEvent, StreamRenderingInfo } from '../../watch/AVWatch';
	import { calcRowsLayout } from './MarblesView.helpers';
	import MarblesViewRowHeaders from './MarblesViewRowHeaders.svelte';
	import MarblesViewEventGrid from './MarblesViewEventGrid.svelte';

	interval(2000)
		.pipe(
			take(10),
			watch('interval-2s', 'all'),
			filter((v: number) => v % 2 === 0),
			watch('interval-2s', 'even'),
			switchMap((v: number) => {
				if (v > 5) return of(v * 1000);
				return throwError(() => 'noo');
			}),
			watch('interval-2s', 'mapped'),
			catchError(() => interval(100).pipe(take(4))),
			watch('interval-2s', 'mapped'),
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

	export let eventsCollectionStream: Observable<RxCollection<any, any, any, any>>;
	export let visibleStreamsStream: Observable<StreamRenderingInfo[]>;

	const streamGroupSpacing = 10;
	const streamGroupHeaderHeight = 30;
	const eventCellWidth = 40;
	const eventCellHeight = 40;
	const gridHorzPadding = 2 * eventCellWidth;

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
						eventToRowLayout={(event) =>
							$rowLayoutsStream.get(`${event.streamName}::${event.streamPhase}`)}
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
