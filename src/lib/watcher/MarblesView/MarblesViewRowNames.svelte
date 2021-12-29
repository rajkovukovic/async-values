<script lang="ts">
	import { toggleStreamVisibility } from '$lib';

	import type { Observable } from 'rxjs';

	export let rowLayoutsStream: Observable<Map<string, any>>;
</script>

<div class="marble-view-row-names">
	{#each Array.from($rowLayoutsStream.values()) as rowLayout}
		<div
			class="header-row-label clickable"
			style="left: 0; top: {rowLayout.top}px;"
			class:clickable={rowLayout.header}
			on:click={() => rowLayout.header && toggleStreamVisibility(rowLayout.label)}
		>
			{rowLayout.label}
		</div>
	{/each}
</div>

<style lang="scss">
	.marble-view-row-names {
		position: absolute;
		top: 0;
		left: 0;
		width: 0;
		height: 0;
		overflow: visible;
		z-index: 2;
	}

	.header-row-label {
		position: absolute;
		padding: 8px;
		white-space: nowrap;
		&.clickable {
			background: rgb(5, 26, 39);
		}
		&:not(.clickable) {
			pointer-events: none;
		}
	}
</style>
