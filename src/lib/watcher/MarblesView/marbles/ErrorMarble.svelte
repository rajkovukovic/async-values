<script lang="ts">
	import type { AVStreamEvent } from '../../AVWatch/AVWatch';
	import MarbleInfo from './MarbleInfo.svelte';

	export let size: number = 10;
	export let event: AVStreamEvent;
</script>

<polygon points="0,{-size / 2} {-size / 2},{size / 2} {size / 2},{size / 2}" fill="#9B3030" />
<MarbleInfo info={event?.ordinal ?? '-'} />
