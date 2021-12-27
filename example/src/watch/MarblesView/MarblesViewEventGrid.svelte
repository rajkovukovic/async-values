<script lang="ts">
	import type { Observable } from 'rxjs';
	import { fade } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	import type { StreamRowLayout } from './MarblesView.helpers';
	import { AVStreamEvent, AVStreamEventType } from '../AVWatch/AVWatch';
	import ValueMarble from './marbles/ValueMarble.svelte';
	import AVValueMarble from './marbles/AVValueMarble.svelte';
	import ErrorMarble from './marbles/ErrorMarble.svelte';
	import CompleteMarble from './marbles/CompleteMarble.svelte';

	export let eventsStream: Observable<AVStreamEvent[]>;
	export let gridWidthStream: Observable<number>;
	export let gridHeightStream: Observable<number>;
	export let eventToRowLayout: (AVStreamEvent) => StreamRowLayout;
	export let eventCellWidth;
	export let eventCellHeight;
	export let selectedEvent = null;

	const dispatch = createEventDispatcher();
</script>

<svg
	width={$gridWidthStream}
	height={$gridHeightStream}
	viewBox="0 0 {$gridWidthStream} {$gridHeightStream}"
>
	{#each $eventsStream as event, index}
		<g
			class:selected={selectedEvent === event}
			on:click={() => dispatch('select', event)}
			transition:fade
			transform="translate({(index + 0.5) * eventCellWidth} {(eventToRowLayout(event)?.top ?? 0) +
				eventCellHeight / 2})"
		>
			<rect
				x={-eventCellWidth / 2}
				y={-eventCellWidth / 2}
				width={eventCellWidth}
				height={eventCellWidth}
			/>
			{#if event.type === AVStreamEventType.value}
				<AVValueMarble
					size={eventCellWidth / 2}
					error={Math.random() > 0.66}
					pending={Math.random() < 0.34}
				/>
			{:else if event.type === AVStreamEventType.error}
				<ErrorMarble size={eventCellWidth / 2} />
			{:else}
				<CompleteMarble size={eventCellWidth / 2} />
			{/if}
		</g>
	{/each}
</svg>

<style lang="scss">
	g {
		cursor: pointer;
		&.selected rect {
			stroke-width: 1px;
			fill: rgba(255, 255, 255, 0.1);
			stroke: orange;
		}
		&:hover rect {
			fill: rgba(255, 255, 255, 0.4);
		}
	}

	rect {
		fill: rgba(255, 255, 255, 0.004);
		transition: fill 0.3s;
	}
</style>
