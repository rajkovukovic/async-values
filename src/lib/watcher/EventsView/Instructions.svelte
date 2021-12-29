<script lang="ts">
	import { GenericMarble, AVStreamEvent, AVStreamEventType } from '$lib';

	export let hidden = false;

	const legendItemSize = 32;

	function generateSample(type: AVStreamEventType) {
		return {
			ordinal: 1,
			type
		} as unknown as AVStreamEvent;
	}

	let legendData: Array<[string, AVStreamEvent]> = [
		['AsyncValue.value', generateSample(AVStreamEventType.avValue)],
		['AsyncValue.pending', generateSample(AVStreamEventType.avPending)],
		['AsyncValue.error', generateSample(AVStreamEventType.avError)],
		['Plain Value event', generateSample(AVStreamEventType.value)],
		['Stream error event', generateSample(AVStreamEventType.error)],
		['Stream completed event', generateSample(AVStreamEventType.complete)]
	];
</script>

<div class="instructions" class:hidden>
	<div class="content">
		<h1>AsyncValues Watcher Help</h1>

		<div class="segment">
			<h2>Keyboard Shortcuts</h2>
			<table class="shortcuts">
				<tr>
					<td>Ctrl + Alt</td>
					<td>Show/Hide AsyncValues Watcher</td>
				</tr>
				<tr>
					<td>H</td>
					<td>Show/Hide Help page</td>
				</tr>
				<tr>
					<td>F</td>
					<td>Select first event</td>
				</tr>
				<tr>
					<td>L</td>
					<td>Select last event</td>
				</tr>
				<tr>
					<td>Arrow Left</td>
					<td>Go to previous event in the same stream/phase</td>
				</tr>
				<tr>
					<td>Arrow Right</td>
					<td>Go to next event in the same stream/phase</td>
				</tr>
				<tr>
					<td>Alt + Arrow Left</td>
					<td>Go to previous event in the timeline</td>
				</tr>
				<tr>
					<td>Alt + Arrow Right</td>
					<td>Go to next event in the timeline</td>
				</tr>
			</table>
		</div>

		<div class="segment">
			<h2>Legend: Stream Events</h2>
			<table class="shortcuts">
				{#each legendData as [label, event]}
					<tr>
						<td>
							<svg
								width={legendItemSize}
								height={legendItemSize}
								viewBox="0 0 {legendItemSize} {legendItemSize}"
							>
								<g transform="translate(16, 16)">
									<GenericMarble {event} size={legendItemSize / 2} />
								</g>
							</svg>
						</td>
						<td>{label}</td>
					</tr>
				{/each}
			</table>
		</div>
	</div>
</div>

<style lang="scss">
	.instructions {
		position: absolute;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		overflow: auto;
		padding: 64px 32px;
		&.hidden {
			display: none;
		}
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}

	.segment {
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}

	table {
		border-collapse: separate;
		border-spacing: 1px;
	}

	.shortcuts {
		tr {
			background-color: rgba(255, 255, 255, 0.1);
			&:nth-child(2n) {
				background-color: rgba(255, 255, 255, 0.2);
			}
		}

		td {
			padding: 10px;
			&:first-child {
				text-align: right;
			}
		}
	}
</style>
