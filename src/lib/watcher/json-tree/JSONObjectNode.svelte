<script lang="ts">
	import JSONNested from './JSONNested.svelte';

	export let key, value, isParentExpanded, isParentArray, nodeType, depth;
	export let expanded;

	$: keys = Object.getOwnPropertyNames(value);

	function getValue(key) {
		return value[key];
	}
</script>

<JSONNested
	{key}
	expanded={expanded ?? depth <= 6}
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
