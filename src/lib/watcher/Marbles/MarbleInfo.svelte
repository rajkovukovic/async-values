<script lang="ts">
	export let info: any;
	export let alignmentBaseline:
		| 'middle'
		| 'auto'
		| 'baseline'
		| 'before-edge'
		| 'text-before-edge'
		| 'central'
		| 'after-edge'
		| 'text-after-edge'
		| 'ideographic'
		| 'alphabetic'
		| 'hanging'
		| 'mathematical'
		| 'inherit' = 'middle';
</script>

<text alignment-baseline={alignmentBaseline} fill="white" text-anchor="middle">
	{info}
</text>

<style>
	text {
		font-family: Arial, Helvetica, sans-serif;
		font-size: 0.8em;
	}
</style>
