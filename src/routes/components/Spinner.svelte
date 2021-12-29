<script>
	import { Firework } from 'svelte-loading-spinners';

	export let size = 32;
</script>

<Firework {size} color="var(--ion-color-primary)" unit="px" duration="1s" />
