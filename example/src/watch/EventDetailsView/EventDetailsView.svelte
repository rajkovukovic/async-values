<script lang="ts">
	import type { Observable } from 'rxjs';
	import { AVWatch, StreamRenderingInfo } from '../AVWatch/AVWatch';
	import type { AVStreamEvent } from '../../watch/AVWatch/AVWatch';
	import EventTree from './EventTree.svelte';
	import { getAppStateAtEvent } from './EventDetailsView.helpers';

	export let selectedEvent: AVStreamEvent;
	export let eventsStream: Observable<AVStreamEvent[]>;
	const visibleStreams: Observable<StreamRenderingInfo[]> = AVWatch.visibleStreams;

	let showAppFullState = true;
	let expandPreviousEvent = true;
	let showDetails = false;

	let previousEvent: AVStreamEvent;
	$: previousEvent =
		selectedEvent && !showAppFullState ? AVWatch.eventInSamePhase(selectedEvent, -1) : null;

	let appState: Map<string, Map<string, AVStreamEvent>>;
	$: appState =
		showAppFullState && $visibleStreams
			? getAppStateAtEvent($visibleStreams, selectedEvent, $eventsStream)
			: null;
</script>

<div class="event-view">
	<div class="event-view-header">
		<span class="event-view-label">View Mode: </span>
		<span on:click={() => (showAppFullState = !showAppFullState)}>
			{#if showAppFullState}
				App State
			{:else}
				Selection
			{/if}
		</span>
		<span class="event-view-label" on:click={() => (showDetails = !showDetails)}>
			{#if showDetails}
				With Details
			{:else}
				No Details
			{/if}
		</span>
	</div>

	<div class="event-view-content">
		{#if showAppFullState}
			{#if appState}
				{#each [...appState.entries()] as [streamName, phaseMap]}
					<div class="stream-info">
						<div class="stream-name">{streamName}</div>
						{#each [...phaseMap.entries()] as [phaseName, event]}
							<div class="phase-info">
								<span class="phase-name">
									{phaseName}
								</span>
								{#if !event}
									- no events
								{/if}
								{#if event}
									<EventTree {event} {showDetails} />
								{/if}
							</div>
						{/each}
					</div>
				{/each}
			{/if}
		{:else if selectedEvent}
			<div><span class="event-view-label">streamName : </span>{selectedEvent.streamName}</div>
			<div><span class="event-view-label">streamPhase: </span>{selectedEvent.streamPhase}</div>

			<div class="event-view-headline">Selected Event:</div>
			<EventTree event={selectedEvent} />

			<div
				class="event-view-headline"
				on:click={() => (expandPreviousEvent = !expandPreviousEvent)}
			>
				{#if !previousEvent}
					No previous event
				{:else if expandPreviousEvent}
					Previous event of same phase:
				{:else}
					Click to show previous event
				{/if}
			</div>
			{#if expandPreviousEvent && previousEvent}
				<EventTree event={previousEvent} {showDetails} />
			{/if}
		{:else}
			Select an event to see info
		{/if}
	</div>
</div>

<style>
	.event-view {
		background: #1b2b34;
		border-left: 1px solid black;
		font-family: var(--json-tree-font-family);
		font-size: var(--json-tree-font-size);
	}

	.event-view-header {
		padding: 10px 16px 6px;
		background: rgb(23, 23, 23);
		cursor: pointer;
	}

	.event-view-content {
		padding: 16px;
	}

	.event-view-headline {
		margin-top: 1em;
		padding: 0.5em 0;
		/* font-weight: bold; */
		color: #bc80b3;
		cursor: pointer;
	}

	.event-view-label {
		opacity: 0.4;
	}

	.stream-info {
		margin-bottom: 2em;
	}

	.stream-name {
		margin: -8px -16px;
		padding: 8px 16px;
		background: rgb(5, 26, 39);
	}

	.phase-info {
		padding-top: 1em;
		padding-left: 2ch;
	}

	.phase-name {
		color: #bc80b3;
	}
</style>
