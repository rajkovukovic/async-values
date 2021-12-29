<script lang="ts">
	import { AVStreamEvent, AVStreamEventType, MarbleInfo } from '$lib';

	export let size: number = 10;
	export let event: AVStreamEvent;

	$: error = event.type === AVStreamEventType.avError;
	$: pending = event.type === AVStreamEventType.avPending;
</script>

<g class:rotate={pending && !error}>
	<circle fill="none" stroke="silver" stroke-width="1.2" stroke-dasharray="4 4" r={size * 0.7} />
	<circle
		class:pulse={pending && !error}
		fill={error ? '#9B3030' : pending ? 'silver' : '#007ACC'}
		r={size * 0.5}
	/>
</g>
<MarbleInfo info={event?.ordinal ?? '-'} />

<style>
	.rotate {
		opacity: 0.4;
		/* animation: rotate 8s infinite linear; */
	}

	.pulse {
		/* transform: scale(0.7); */
		display: none;
		/* animation: pulse 2s infinite ease-out; */
	}

	@keyframes rotate {
		from {
			transform: scale(1) rotate(0deg);
		}
		to {
			transform: scale(1) rotate(360deg);
		}
	}

	@keyframes pulse {
		0% {
			transform: scale(0);
		}
		50% {
			transform: scale(1);
		}
		70% {
			transform: scale(0.32);
		}
		100% {
			transform: scale(0);
		}
	}
</style>
