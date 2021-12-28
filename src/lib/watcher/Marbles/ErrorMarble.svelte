<script lang="ts">
	import type { AVStreamEvent } from '$lib';
	import { MarbleInfo } from '$lib';

	export let size: number = 10;
	export let event: AVStreamEvent;
</script>

<polygon points="0,{-size / 2} {-size / 2},{size / 2} {size / 2},{size / 2}" fill="#9B3030" />
<MarbleInfo info={event?.ordinal ?? '-'} />
