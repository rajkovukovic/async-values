<script>
	import JSONNested from './JSONNested.svelte';

	export let key, value, isParentExpanded, isParentArray, depth;
	export let expanded = false;
	const filteredKey = new Set(['length']);

	$: keys = Object.getOwnPropertyNames(value);
	$: previewKeys = keys.filter((key) => !filteredKey.has(key));

	function getValue(key) {
		return value[key];
	}
</script>

<JSONNested
	{key}
	depth={depth + 1}
	{expanded}
	{isParentExpanded}
	{isParentArray}
	isArray={true}
	{keys}
	{previewKeys}
	{getValue}
	label="Array({value.length})"
	bracketOpen="["
	bracketClose="]"
/>
