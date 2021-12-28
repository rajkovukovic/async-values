<script>
	export let key,
		isParentExpanded,
		isParentArray = false,
		colon = ':';

	$: showKey = isParentExpanded || !isParentArray || key != +key;
</script>

{#if showKey && key}
	<label class:spaced={isParentExpanded} on:click>
		<span>{key}{colon}</span>
	</label>
{/if}

<style>
	label {
		display: inline-block;
		color: var(--label-color);
		padding: 0;
	}
	.spaced {
		padding-right: var(--li-colon-space);
	}
</style>
