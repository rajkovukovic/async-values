<script context="module" lang="ts">
	import { AVStreamEventType } from '../../AVWatch/AVWatch';
	import AVValueMarble from './AVValueMarble.svelte';
	import CompleteMarble from './CompleteMarble.svelte';
	import ErrorMarble from './ErrorMarble.svelte';
	import ValueMarble from './ValueMarble.svelte';

	const asyncValueTypes = new Map([
		[AVStreamEventType.avError, AVValueMarble],
		[AVStreamEventType.avPending, AVValueMarble],
		[AVStreamEventType.avValue, AVValueMarble],
		[AVStreamEventType.complete, CompleteMarble],
		[AVStreamEventType.error, ErrorMarble],
		[AVStreamEventType.value, ValueMarble]
	]);
</script>

<script lang="ts">
	import type { AVStreamEvent } from '../../AVWatch/AVWatch';

	export let size: number = 10;
	export let event: AVStreamEvent;
</script>

{#if asyncValueTypes.get(event?.type)}
	<svelte:component this={asyncValueTypes.get(event.type)} {event} {size} />
{/if}
