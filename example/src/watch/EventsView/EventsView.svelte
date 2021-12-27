<script lang="ts">
	import { onDestroy } from 'svelte';
	import { browser } from '$app/env';

	import MarblesView from '../MarblesView/MarblesView.svelte';
	import Preferences from './Preferences.svelte';

	export let enabled = true;

	onDestroy(() => setKeyboardShorcuts(false));

	let keyboardShortcutsActive = false;

	$: if (browser && Boolean(enabled) !== keyboardShortcutsActive) {
		setKeyboardShorcuts(Boolean(enabled));
	}

	function handleKeyDown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowLeft':
				return marblesView?.selectPrevEvent(event.altKey);
			case 'ArrowRight':
				return marblesView?.selectNextEvent(event.altKey);
			default:
			// noop
		}
	}

	function setKeyboardShorcuts(state: boolean) {
		if (state !== keyboardShortcutsActive) {
			if (keyboardShortcutsActive) {
				window.removeEventListener('keydown', handleKeyDown, true);
				console.log('AsyncValues Watcher: keyboard shortcuts deactivated');
			} else {
				window.addEventListener('keydown', handleKeyDown, true);
				console.log('AsyncValues Watcher: keyboard shortcuts activated');
			}
			keyboardShortcutsActive = !keyboardShortcutsActive;
		}
	}

	let marblesView: MarblesView;
</script>

<Preferences />
<MarblesView bind:this={marblesView} />
