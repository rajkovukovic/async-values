<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	import { Instructions, KeyboardShortcut, MarblesView } from '$lib';

	export let visible = false;
	export let showHideShortcut: string;
	export let showInstructions = false;

	$: shortcut = new KeyboardShortcut(showHideShortcut || 'Ctrl + Alt + W');

	onMount(() => setKeyboardShorcuts(true));
	onDestroy(() => setKeyboardShorcuts(false));

	function handleKeyDown(event: KeyboardEvent) {
		let isShortcut = true;

		if (shortcut?.matchFromEvent(event)) {
			visible = !visible;
		} else if (visible) {
			switch (event.key) {
				case 'h':
				case 'H':
					showInstructions = !showInstructions;
					break;
				case 'ArrowLeft':
					marblesView?.selectPrevEvent(!event.altKey);
					break;
				case 'ArrowRight':
					marblesView?.selectNextEvent(!event.altKey);
					break;
				case 'f':
				case 'F':
					marblesView?.selectFirstEvent();
					break;
				case 'l':
				case 'L':
					marblesView?.selectLastEvent();
					break;
				default:
					isShortcut = false;
			}
		} else {
			isShortcut = false;
		}

		if (isShortcut) {
			event.stopPropagation();
			event.preventDefault();
		}
	}

	function setKeyboardShorcuts(state: boolean) {
		// if (browser) {
		if (state) {
			window?.addEventListener('keydown', handleKeyDown, true);
			// console.log('AsyncValues Watcher: keyboard shortcuts activated');
		} else {
			window?.removeEventListener('keydown', handleKeyDown, true);
			// console.log('AsyncValues Watcher: keyboard shortcuts deactivated');
		}
		// }
	}

	let marblesView: MarblesView;
</script>

<div class="events-view" class:visible>
	<!-- <Preferences /> -->
	<MarblesView bind:this={marblesView} hidden={showInstructions} />
	<Instructions hidden={!showInstructions} />
</div>

<style>
	.events-view {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1000000000;
		background: rgb(12, 12, 12);
		color: white;
		font-family: 'Courier New', Courier, monospace;
		font-size: 12px;
		--accentColorRGB: 255, 165, 0;
		--accentColor: rgb(var(--accentColorRGB));
		--errorColorRGB: 255, 0, 0;
		--errorColor: rgb(var(--errorColorRGB));
	}

	.events-view:not(.visible) {
		display: none;
	}
</style>
