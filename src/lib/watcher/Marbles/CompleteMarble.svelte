<script lang="ts">
	import type { AVStreamEvent } from '$lib';
	import { MarbleInfo } from '$lib';

	export let size: number = 10;
	export let event: AVStreamEvent;
</script>

<line x1={size / 2} y1={-size / 2} x2={size / 2} y2={size / 2} stroke="white" stroke-width="1" />
<MarbleInfo info={event?.ordinal ?? '-'} />
