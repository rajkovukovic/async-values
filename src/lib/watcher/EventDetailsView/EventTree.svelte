<script lang="ts">
	import type { AVStreamEvent } from '$lib/watcher/AVWatch/AVWatch';
	import { AVStreamEventType } from '$lib/watcher/AVWatch/AVWatch';
	import JSONTree from '$lib/watcher/json-tree/Root.svelte';

	export let event: AVStreamEvent;
	export let showDetails = false;

	function getRelevantData(event: AVStreamEvent) {
		switch (event?.type) {
			case AVStreamEventType.avPending:
				return event.data.value;
			case AVStreamEventType.avError:
				return event.data.error;
			default:
				return undefined;
		}
	}

	function getDisplayInfo(event: AVStreamEvent) {
		switch (event?.type) {
			case AVStreamEventType.avPending:
			case AVStreamEventType.complete:
				return {
					id: event.id,
					ordinal: event.ordinal,
					timestamp: new Date(event.timestamp),
					type: event.type
				};
			case AVStreamEventType.avValue:
			case AVStreamEventType.avError:
				return {
					id: event.id,
					ordinal: event.ordinal,
					timestamp: new Date(event.timestamp),
					type: event.type,
					data: event.data.error ?? event.data.value
				};
			default:
				return {
					id: event.id,
					ordinal: event.ordinal,
					timestamp: new Date(event.timestamp),
					type: event.type,
					data: event.data
				};
		}
	}
</script>

{#if event}
	<JSONTree value={showDetails ? getDisplayInfo(event) : event.data} />
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
