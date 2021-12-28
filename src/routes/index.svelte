<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	import { AVWatch } from '$lib';

	onMount(() => AVWatch.activate(true));

	onDestroy(() => AVWatch.deactivate());
</script>
