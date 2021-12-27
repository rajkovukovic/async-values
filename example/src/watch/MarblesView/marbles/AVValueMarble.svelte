<script lang="ts">
	export let size: number = 10;
	export let pending: boolean = false;
	export let error: boolean = false;
</script>

<g class:rotate={pending && !error}>
  <circle
    fill="none"
    stroke="silver"
    stroke-width="1.2"
    stroke-dasharray="4 4"
    r={size * 0.7}
  />
  <!-- <g
    class="animation-container"
    class:rotate={pending && !error}
    on:click
    style="transform-origin: 0 0"
  >
    <g transform-origin="0 0" transform="scale({size / 256}) translate(-256 -256)">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M441.192 299.246C444.923 300.26 447.124 304.107 446.109 307.838C423.353 391.484 346.87 453 256.002 453C190.552 453 132.56 421.077 96.7455 371.98L65.3557 386.499L72.65 306L138.717 352.567L109.722 365.978C143.127 410.338 196.219 439 256.002 439C340.394 439 411.459 381.87 432.6 304.162C433.615 300.432 437.462 298.231 441.192 299.246Z"
        fill="silver"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M256.003 73C171.611 73 100.545 130.13 79.4045 207.838C78.3896 211.568 74.5428 213.769 70.8124 212.754C67.082 211.74 64.8806 207.893 65.8955 204.162C88.6522 120.516 165.135 59 256.003 59C321.453 59 379.444 90.9234 415.259 140.02L446.649 125.501L439.354 206L373.287 159.433L402.282 146.022C368.877 101.662 315.786 73 256.003 73Z"
        fill="silver"
      />
    </g>
  </g> -->
  <circle
    class:pulse={pending && !error}
    fill={error ? '#9B3030' : pending ? 'silver' : '#007ACC'}
    r={size * 0.5}
  />
</g>

<style>
	.rotate {
		animation: rotate 8s infinite linear;
	}

	.pulse {
		transform: scale(0.7);
		/* animation: pulse 2s infinite ease-out; */
	}

	@keyframes rotate {
		from {
			transform: scale(0.5) rotate(0deg);
		}
		to {
			transform: scale(0.5) rotate(360deg);
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
