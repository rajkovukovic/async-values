<script context="module" lang="ts">
	import type { AVStreamEvent } from '$lib';
	import { AVStreamEventType, AVValueMarble, CompleteMarble, ErrorMarble, ValueMarble } from '$lib';

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
	export let size: number = 10;
	export let event: AVStreamEvent;
</script>

{#if asyncValueTypes.get(event?.type)}
	<svelte:component this={asyncValueTypes.get(event.type)} {event} {size} />
{/if}
