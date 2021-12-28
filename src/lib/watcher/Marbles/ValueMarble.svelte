<script lang="ts">
	import type { AVStreamEvent } from '$lib';
	import { MarbleInfo } from '$lib';

	export let x: number = 0;
	export let y: number = 0;
	export let size: number = 10;
	export let event: AVStreamEvent;
</script>

<circle cx={x} cy={y} r={size / 2} fill="#007ACC" on:click />
<MarbleInfo info={event?.ordinal ?? '-'} />
