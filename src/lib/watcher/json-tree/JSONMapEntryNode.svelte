<script>
	import JSONNested from './JSONNested.svelte';

	export let key, value, isParentExpanded, isParentArray, depth;
	export let expanded = false;

	const keys = ['key', 'value'];

	function getValue(key) {
		return value[key];
	}
</script>

<JSONNested
	depth={depth + 1}
	{expanded}
	{isParentExpanded}
	{isParentArray}
	key={isParentExpanded ? String(key) : value.key}
	{keys}
	{getValue}
	label={isParentExpanded ? 'Entry ' : '=> '}
	bracketOpen={'{'}
	bracketClose={'}'}
/>
