<script lang="ts">
	import type { AVStreamEvent } from '../AVWatch/AVWatch';

	import JSONTree from '../json-tree/Root.svelte';

	export let event: AVStreamEvent;
	export let showDetails = false;
</script>

{#if event}
	<JSONTree
		value={showDetails
			? {
					id: event.id,
					timestamp: new Date(event.timestamp),
					type: event.type,
					data: event.data
			  }
			: event.data}
	/>
{/if}

<style>
	:global(:root) {
		/* color */
		--json-tree-string-color: #99c794;
		--json-tree-symbol-color: #fbc863;
		--json-tree-boolean-color: #f99157;
		--json-tree-function-color: #c594c5;
		--json-tree-number-color: #f99157;
		--json-tree-label-color: #cdd3de;
		--json-tree-arrow-color: #999898;
		--json-tree-null-color: #f99157;
		--json-tree-undefined-color: #f99157;
		--json-tree-date-color: #6699cc;
		/* position */
		--json-tree-li-indentation: 1em;
		--json-tree-li-line-height: 1.3;
		/* font */
		--json-tree-font-size: 12px;
		--json-tree-font-family: 'Courier New', Courier, monospace;
	}
</style>
