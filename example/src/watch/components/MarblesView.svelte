<script lang="ts">
	import animateScrollTo from 'animated-scroll-to';
	import type { RxCollection } from 'rxdb';
	import { Observable, interval, BehaviorSubject } from 'rxjs';
	import {
		distinctUntilChanged,
		filter,
		map,
		shareReplay,
		switchMap,
		take,
		throttleTime
	} from 'rxjs/operators';
	import { watch } from '../../watch/AVWatch';
	import type { StreamRenderingInfo } from '../../watch/AVWatch';
	import { afterUpdate, beforeUpdate } from 'svelte';

	interval(1 * 2000)
		.pipe(
			watch('interval-2s', 'all'),
			filter((v: number) => v % 2 === 0),
			watch('interval-2s', 'even'),
			map((v: number) => v * 1000),
			watch('interval-2s', 'mapped')
		)
		.subscribe();

	interval(1328)
		.pipe(
			watch('interval-1.328', 'all'),
			filter((v: number) => v % 3 === 0),
			watch('interval-1.328', 'n-th(3)')
		)
		.subscribe();

	interval(1 * 3328)
		.pipe(
			watch('interval-3.328', 'all'),
			filter((v: number) => v % 3 === 0),
			watch('interval-3.328', 'n-th(3)')
		)
		.subscribe();

	export let eventsCollectionStream: Observable<RxCollection<any, any, any, any>>;
	export let visibleStreamsStream: Observable<StreamRenderingInfo[]>;

	$: eventsCollectionStreamThrottled = eventsCollectionStream.pipe(throttleTime(0), shareReplay(1));

	let eventsStream: Observable<any[]>;
	$: eventsStream = $eventsCollectionStreamThrottled?.find().$;

	$: eventsCount = $eventsStream?.length ?? 0;

	$: firstEventStream = $eventsCollectionStreamThrottled?.findOne().sort({ id: 'asc' }).$;
	$: lastEventStream = $eventsCollectionStreamThrottled?.findOne().sort({ id: 'desc' }).$;

	const streamNameContainerHeight = 30;
	const eventCellWidth = 48;
	const eventCellHeight = 48;

	const rowLayouts = visibleStreamsStream.pipe(
		map((streams) => {
			let top = 0;
			return streams.reduce((acc: Map<string, any>, stream) => {
				acc.set(stream.name, {
					header: true,
					top,
					height: streamNameContainerHeight,
					label: stream.name
				});
				top += streamNameContainerHeight;
				let phaseIndex = 0;
				for (let phase of stream.phases) {
					acc.set(`${stream.name}::${phase}`, {
						even: phaseIndex++ % 2 === 0,
						top: top,
						height: eventCellHeight,
						label: phase
					});
					top += eventCellHeight;
				}
				return acc;
			}, new Map());
		}),
		shareReplay(1)
	);

	let viewWidth: Observable<number>;
	$: viewWidth =
		eventsStream?.pipe(
			map((events) => events.length * eventCellWidth),
			distinctUntilChanged(),
			shareReplay(1)
		) ?? new BehaviorSubject(0);

	const viewHeight: Observable<number> = rowLayouts.pipe(
		map((rowLayouts) =>
			Array.from(rowLayouts.values()).reduce(
				(acc, layout: any) => (layout.top + layout.height > acc ? layout.top + layout.height : acc),
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
	// $: console.log('Array.from($rowLayouts.values())', Array.from($rowLayouts.values()));
	// $: console.log('scrollContainer', scrollContainer);
	// $: console.log('$viewWidth', $viewWidth);
	// $: console.log('$viewHeight', $viewHeight);
	// $: console.log('$eventsStream', $eventsStream);
</script>

<div bind:clientWidth={$clientWidthStream} class="marbles-diagram">
	<div class="row-labels-container">
		{#each Array.from($rowLayouts.values()) as rowLayout}
			<div
				class="row"
				class:header-row={rowLayout.header}
				class:even={rowLayout.even}
				style="left: 0; top: {rowLayout.top}px; height: {rowLayout.height}px;"
			>
				{rowLayout.label}
			</div>
		{/each}
	</div>
	<div bind:this={scrollContainer} class="scroll-container">
		<div
			class="marbles-container"
			style="width: {$viewWidth || 0}px; height: {$viewHeight || 0}px;"
		>
			<div class="marbles-animation-container">
				{#if $viewWidth > 0 && $viewHeight > 0 && $eventsStream}
					<svg width={$viewWidth} height={$viewHeight} viewBox="0 0 {$viewWidth} {$viewHeight}">
						{#each $eventsStream as event, index}
							<circle
								cx={(index + 0.5) * eventCellWidth}
								cy={$rowLayouts.get(`${event.streamName}::${event.streamPhase}`).top +
									eventCellHeight / 2}
								r={eventCellWidth / 4}
								fill="orange"
								opacity="0.9"
								on:click={() => alert(JSON.stringify(event.data))}
							/>
						{/each}
					</svg>
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

	.row-labels-container {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	.row {
		position: absolute;
		right: 0;
		padding: 4px;
		background: rgba(255, 255, 255, 0.05);
		color: rgba(255, 255, 255, 0.7);
	}

	.row.even {
		background: rgba(255, 255, 255, 0.08);
	}

	.header-row {
		background: #007acc;
		color: white;
		font-size: 1.5em;
		font-weight: bold;
	}
</style>
