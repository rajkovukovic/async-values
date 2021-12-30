<script lang="ts">
	import JSONNested from './JSONNested.svelte';
	import { jsonTreeExpandedLevel } from '$lib';

	export let key, value, isParentExpanded, isParentArray, nodeType, depth;
	export let expanded;

	$: keys = Object.getOwnPropertyNames(value);

	function getValue(key) {
		return value[key];
	}
</script>

<JSONNested
	{key}
	expanded={expanded ?? depth < $jsonTreeExpandedLevel}
	{isParentExpanded}
	{isParentArray}
	{keys}
	depth={depth + 1}
	previewKeys={keys}
	{getValue}
	label="{nodeType} "
	bracketOpen={'{'}
	bracketClose={'}'}
/>
