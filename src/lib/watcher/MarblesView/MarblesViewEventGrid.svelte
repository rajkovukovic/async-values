<script lang="ts">
	import type { Observable } from 'rxjs';
	import { fade } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	import type { AVStreamEvent, StreamRowLayout } from '$lib';
	import { GenericMarble } from '$lib';

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
			class="grid-row"
			class:selected={selectedEvent === event}
			on:click={() => dispatch('select', event)}
			transition:fade
			transform="translate({(index + 0.5) * eventCellWidth} 0)"
		>
			<rect
				class="row-rect"
				x={-eventCellWidth / 2 + 0.5}
				width={eventCellWidth - 1}
				height={$gridHeightStream}
				fill="rgba(255, 255, 255, {(1 + (index % 5)) * 0.01})"
			/>
			<g
				class="grid-cell"
				transform="translate(0 {(eventToRowLayout(event)?.top ?? 0) + eventCellHeight / 2})"
			>
				<rect
					class="cell-rect"
					x={-eventCellWidth / 2}
					y={-eventCellHeight / 2}
					fill="none"
					width={eventCellWidth}
					height={eventCellHeight}
				/>
				<GenericMarble {event} size={eventCellWidth / 2} />
			</g>
		</g>
	{/each}
</svg>

<style lang="scss">
	.grid-row {
		cursor: pointer;
		&.selected {
			& > .row-rect {
				fill: rgba(255, 165, 0, 0.2);
			}
			& .cell-rect {
				stroke-width: 1px;
				stroke: orange;
			}
		}
		&:hover {
			& > .row-rect {
				fill: rgba(255, 255, 255, 0.4);
			}
			& .cell-rect {
				fill: rgba(255, 165, 0, 0.15);
			}
		}
	}

	rect {
		transition: fill 0.3s;
	}
</style>
