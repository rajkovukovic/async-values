<script lang="ts">
	import type { AVStreamEvent } from '$lib';
	import { AVStreamEventType, EventTree } from '$lib';

	export let event: AVStreamEvent;
	export let showDetails: boolean;
</script>

<div>
	{#if event.type === AVStreamEventType.error || event.type === AVStreamEventType.avError}
		<span style="color: var(--errorColor);">({event.type})</span>
	{:else if event.type === AVStreamEventType.complete || event.type === AVStreamEventType.avPending}
		<span>({event.type})</span>
	{/if}
</div>
<EventTree {event} {showDetails} />
