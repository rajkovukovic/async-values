<script lang="ts">
	import type { Observable } from 'rxjs';
	import { AVWatch, StreamRenderingInfo } from '../AVWatch/AVWatch';
	import type { AVStreamEvent } from '../../watch/AVWatch/AVWatch';
	import { showAppFullStateStream, showEventDetailsStream } from '../EventsView/preferences';
	import EventTree from './EventTree.svelte';
	import { getAppStateAtEvent } from './EventDetailsView.helpers';

	export let selectedEvent: AVStreamEvent;
	export let eventsStream: Observable<AVStreamEvent[]>;
	const visibleStreams: Observable<StreamRenderingInfo[]> = AVWatch.visibleStreams;

	let previousEvent: AVStreamEvent;
	$: previousEvent =
		selectedEvent && !$showAppFullStateStream ? AVWatch.eventInSamePhase(selectedEvent, -1) : null;

	let appState: Map<string, Map<string, AVStreamEvent>>;
	$: appState =
		$showAppFullStateStream && $visibleStreams
			? getAppStateAtEvent($visibleStreams, selectedEvent, $eventsStream)
			: null;
</script>

<div class="event-view">
	<div class="event-view-header">
		<span class="event-view-label">View Mode: </span>
		<span on:click={() => ($showAppFullStateStream = !$showAppFullStateStream)}>
			{#if $showAppFullStateStream}
				App State
			{:else}
				Selection
			{/if}
		</span>
		<span
			class="event-view-label"
			on:click={() => ($showEventDetailsStream = !$showEventDetailsStream)}
		>
			{#if $showEventDetailsStream}
				With Details
			{:else}
				No Details
			{/if}
		</span>
	</div>

	<div class="event-view-content">
		{#if $showAppFullStateStream}
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
									<EventTree {event} showDetails={$showEventDetailsStream} />
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
			<EventTree event={selectedEvent} showDetails={$showEventDetailsStream} />

			<div class="event-view-headline">
				{#if !previousEvent}
					No previous event
				{:else}
					Previous event of same phase:
				{/if}
			</div>
			{#if previousEvent}
				<EventTree event={previousEvent} showDetails={$showEventDetailsStream} />
			{/if}
		{:else}
			Select an event to see info
		{/if}
	</div>
</div>

<style>
	.event-view {
		min-height: 0;
		display: grid;
		grid-template-rows: auto 1fr;
		grid-template-columns: 1fr;
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
		position: relative;
		overflow: auto;
		padding: 16px;
	}

	.event-view-headline {
		margin-top: 1em;
		padding: 0.5em 0;
		/* font-weight: bold; */
		color: #bc80b3;
	}

	.event-view-label {
		opacity: 0.4;
	}

	.stream-info {
		margin-bottom: 2em;
	}

	.stream-name {
		position: sticky;
		top: -16px;
		z-index: 1;
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
