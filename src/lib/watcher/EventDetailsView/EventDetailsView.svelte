<script lang="ts">
	import animateScrollTo from 'animated-scroll-to';
	import type { Observable } from 'rxjs';
	import { afterUpdate } from 'svelte';
	import { slide } from 'svelte/transition';
	import {
		AVStreamEvent,
		AVStreamEventType,
		AVWatch,
		EventDetailsHeadline,
		EventTree,
		getAppStateAtEvent,
		hiddenStreams,
		showAppFullStateStream,
		showEventDetailsStream,
		StreamRenderingInfo,
		toggleStreamVisibility,
	} from '$lib';

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

	let eventViewContent: HTMLDivElement;
	let lastScrolledTo = {
		streamName: null,
	};

	afterUpdate(() => {
		if (selectedEvent) {
			if (
				lastScrolledTo.streamName !== selectedEvent.streamName &&
				$showAppFullStateStream &&
				eventViewContent
			) {
			}
			// delay scrollTo animation after svelte slide transition is completed
			setTimeout(
				() =>
					animateScrollTo(document.getElementById(`stream-info-${selectedEvent.streamName}`), {
						elementToScroll: eventViewContent,
						// verticalOffset: 20,
					}),
				200,
			);
			lastScrolledTo = {
				streamName: selectedEvent.streamName,
			};
		} else {
			lastScrolledTo = {
				streamName: null,
			};
		}
	});
</script>

<div class="event-view">
	<div class="event-view-header">
		<span class="event-view-label">View Mode: </span>
		<span class="clickable" on:click={() => ($showAppFullStateStream = !$showAppFullStateStream)}>
			{#if $showAppFullStateStream}
				App State
			{:else}
				Selection
			{/if}
		</span>
		<span
			class="event-view-label clickable"
			on:click={() => ($showEventDetailsStream = !$showEventDetailsStream)}
		>
			{#if $showEventDetailsStream}
				With Details
			{:else}
				No Details
			{/if}
		</span>
	</div>

	<div bind:this={eventViewContent} class="event-view-content">
		{#if $showAppFullStateStream}
			{#if appState}
				{#each [...appState.entries()] as [streamName, phaseMap]}
					<div
						id="stream-info-{streamName}"
						class="stream-info"
						class:hidden={$hiddenStreams.has(streamName)}
						class:selected={selectedEvent?.streamName === streamName}
					>
						<div class="stream-name clickable" on:click={() => toggleStreamVisibility(streamName)}>
							{streamName}
						</div>
						{#if !$hiddenStreams.has(streamName)}
							{#each [...phaseMap.entries()] as [phaseName, event], index (phaseName)}
								<div class="phase-info" class:selected={selectedEvent?.streamName === streamName}>
									<div class="phase-name">
										{phaseName}
									</div>
									{#if !event}
										<span class="no-events">
											- no events
										</span>
									{:else if !$showEventDetailsStream}
										{#if event.type === AVStreamEventType.error || event.type === AVStreamEventType.avError}
											<span style="color: var(--errorColor);">({event.type})</span>
										{:else if event.type === AVStreamEventType.complete || event.type === AVStreamEventType.avPending}
											<span>({event.type})</span>
										{/if}
									{/if}
									{#if event}
										{#key event?.id}
											<div transition:slide>
												<EventTree {event} showDetails={$showEventDetailsStream} />
											</div>
										{/key}
									{/if}
								</div>
							{/each}
						{/if}
					</div>
				{/each}
			{/if}
		{:else if selectedEvent}
			<div class="selected-event-view">
				<div><span class="event-view-label">streamName : </span>{selectedEvent.streamName}</div>
				<div><span class="event-view-label">streamPhase: </span>{selectedEvent.streamPhase}</div>

				<div class="event-view-headline">Selected Event:</div>
				<EventDetailsHeadline event={selectedEvent} showDetails={$showEventDetailsStream} />

				<div class="event-view-headline">
					{#if !previousEvent}
						No previous event
					{:else}
						Previous event of same phase:
					{/if}
				</div>
				{#if previousEvent}
					<EventDetailsHeadline event={previousEvent} showDetails={$showEventDetailsStream} />
				{/if}
			</div>
		{:else}
			<div class="selected-event-view">Select an event to see info</div>
		{/if}
	</div>
</div>

<style lang="scss">
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
	}

	.event-view-content {
		position: relative;
		overflow: auto;
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
		&:not(.hidden) {
			margin-bottom: 2em;
		}
		&.hidden {
			& > .stream-name {
				filter: brightness(140%) grayscale(90%);
			}
		}
		&.selected > .stream-name {
			background: var(--accentColor);
			color: black;
			font-weight: bold;
		}
	}

	.stream-name {
		position: sticky;
		z-index: 1;
		padding: 8px 16px;
		background: rgb(5, 26, 39);
	}

	.phase-info {
		padding-top: 1em;
		padding-left: 2ch;
		&.selected {
			background: rgba(255, 166, 0, 0.15);
		}
	}

	.phase-name {
		color: #bc80b3;
	}

	// .event-tree,
	.selected-event-view {
		padding: 16px;
	}

	.no-events {
		font-style: italic;
		opacity: 0.3;
	}
</style>
