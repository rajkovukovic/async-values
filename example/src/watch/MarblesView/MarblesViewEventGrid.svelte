<script lang="ts">
	import type { Observable } from 'rxjs';
	import { fade } from 'svelte/transition';
	import { AVStreamEvent, AVStreamEventType } from '../AVWatch';
	import type { StreamRowLayout } from './MarblesView.helpers';
	import ValueMarble from './marbles/ValueMarble.svelte';
	import ErrorMarble from './marbles/ErrorMarble.svelte';
	import CompleteMarble from './marbles/CompleteMarble.svelte';

	export let eventsStream: Observable<AVStreamEvent[]>;
	export let gridWidthStream: Observable<number>;
	export let gridHeightStream: Observable<number>;
	export let eventToRowLayout: (AVStreamEvent) => StreamRowLayout;
	export let eventCellWidth;
	export let eventCellHeight;
</script>

<svg
	width={$gridWidthStream}
	height={$gridHeightStream}
	viewBox="0 0 {$gridWidthStream} {$gridHeightStream}"
>
	{#each $eventsStream as event, index}
		<g
			transition:fade
			transform="translate({(index + 0.5) * eventCellWidth} {eventToRowLayout(event).top +
				eventCellHeight / 2})"
		>
			{#if event.type === AVStreamEventType.value}
				<ValueMarble size={eventCellWidth / 2} />
			{:else if event.type === AVStreamEventType.error}
				<ErrorMarble size={eventCellWidth / 2} />
			{:else}
				<CompleteMarble size={eventCellWidth / 2} />
			{/if}
		</g>
	{/each}
</svg>
