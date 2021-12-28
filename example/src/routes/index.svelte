<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	import { AVWatch } from '../watch/AVWatch/AVWatch';

	onMount(() => AVWatch.activate(true));

	onDestroy(() => AVWatch.deactivate());
</script>
