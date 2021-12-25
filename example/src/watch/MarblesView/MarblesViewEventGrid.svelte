<script lang="ts">
	import type { Observable } from 'rxjs';
	import type { AVStreamEvent } from '../AVWatch';
  import type { StreamRowLayout } from './MarblesView.helpers';

	export let eventsStream: Observable<AVStreamEvent[]>;
	export let viewWidthStream: Observable<number>;
	export let viewHeightStream: Observable<number>;
	export let eventToRowLayout: (AVStreamEvent) => StreamRowLayout;
	export let eventCellWidth;
	export let eventCellHeight;
</script>

<svg
	width={$viewWidthStream}
	height={$viewHeightStream}
	viewBox="0 0 {$viewWidthStream} {$viewHeightStream}"
>
	{#each $eventsStream as event, index}
		<circle
			cx={(index + 0.5) * eventCellWidth}
			cy={eventToRowLayout(event).top + eventCellHeight / 2}
			r={eventCellWidth / 4}
			fill="orange"
			opacity="0.9"
			on:click={() => alert(JSON.stringify(event.data))}
		/>
	{/each}
</svg>
