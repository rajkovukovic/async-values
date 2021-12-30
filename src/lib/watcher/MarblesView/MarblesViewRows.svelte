<script lang="ts">
	import type { Observable } from 'rxjs';

	export let rowLayoutsStream: Observable<Map<string, any>>;
</script>

<div class="marble-view-rows">
	{#each Array.from($rowLayoutsStream.values()) as rowLayout}
		<div
			class="row"
			class:header-row={rowLayout.header}
			class:even={rowLayout.even}
			style="left: 0; top: {rowLayout.top}px; height: {rowLayout.height}px;"
		/>
	{/each}
</div>

<style lang="scss">
	.marble-view-rows {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		// filter: grayscale(1);
	}

	.row {
		position: absolute;
		right: 0;
		padding: 6px;
		background: #152733;
		color: rgba(255, 255, 255, 0.7);
	}

	.row.even {
		background: #1b2b34;
	}

	.header-row {
		background: rgb(5, 26, 39);
		color: white;
		font-size: 1.25em;
		font-weight: bold;
	}
</style>
