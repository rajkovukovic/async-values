<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { interval, BehaviorSubject } from 'rxjs';
	import { filter, map, take } from 'rxjs/operators';
	import { browser } from '$app/env';

	import { watch } from '$lib/watcher/AVWatch/AVWatch';
	import MarblesView from '$lib/watcher/MarblesView/MarblesView.svelte';

	export let visible = false;

	onMount(() => setKeyboardShorcuts(true));
	onDestroy(() => setKeyboardShorcuts(false));

	interval(2021 / 10)
		.pipe(
			take(10),
			watch('medium', 'all'),
			filter((v: number) => v % 2 === 0),
			watch('medium', 'even'),
			map((v: number) => new BehaviorSubject(v * 1000)),
			watch('medium', 'mapped')
		)
		.subscribe();

	interval(1021 / 10)
		.pipe(
			take(10),
			watch('fast', 'all'),
			filter((v: number) => v % 3 === 0),
			watch('fast', 'n-th(3)')
		)
		.subscribe();

	interval(3328 / 10)
		.pipe(
			take(10),
			watch('slow', 'all'),
			filter((v: number) => v % 3 === 0),
			watch('slow', 'n-th(3)')
		)
		.subscribe();

	function handleKeyDown(event: KeyboardEvent) {
		let isShortcut = true;

		if ((event.key === 'Alt' && event.ctrlKey) || (event.key === 'Control' && event.altKey)) {
			visible = !visible;
		} else if (visible) {
			switch (event.key) {
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
		if (browser) {
			if (state) {
				window.addEventListener('keydown', handleKeyDown, true);
				console.log('AsyncValues Watcher: keyboard shortcuts activated');
			} else {
				window.removeEventListener('keydown', handleKeyDown, true);
				console.log('AsyncValues Watcher: keyboard shortcuts deactivated');
			}
		}
	}

	let marblesView: MarblesView;
</script>

<div class="events-view" class:visible>
	<!-- <Preferences /> -->
	<MarblesView bind:this={marblesView} />
</div>

<style>
	.events-view {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1000000000;
	}

	.events-view:not(.visible) {
		display: none;
	}
</style>
