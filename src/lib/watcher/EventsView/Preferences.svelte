<script lang="ts">
	import { TimeStampView, timestampViewStream } from '$lib';

	const timestampMap = {
		[TimeStampView.absoluteDateAndTime]: 'Absolute Date and Time',
		[TimeStampView.absoluteTime]: 'Absolute Time',
		[TimeStampView.timeSinceAppStart]: 'Time Since App Start',
		[TimeStampView.timeSincePreviousEvent]: 'Time Since Previous Event'
	};
</script>

<div>
	<label for="timestamp-display">Timestamp format:</label>
	<select id="timestamp-display" bind:value={$timestampViewStream}>
		{#each Object.keys(TimeStampView) as view (view)}
			<option value={view}>{timestampMap[view]}</option>
		{/each}
	</select>
</div>
