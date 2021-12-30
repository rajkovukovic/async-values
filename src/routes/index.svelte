<script context="module">
	export const ssr = false;
</script>

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { combineLatest, of, ReplaySubject } from 'rxjs';
	import { delay, shareReplay, startWith, switchMap } from 'rxjs/operators';

	import {
		AsyncValue,
		AVWatch,
		BehaviorSubjectWithSet,
		switchMapWhenFulfilled,
		watch,
		watchStream,
	} from '$lib';
	import UserList from './components/UserList.svelte';
	import TodoList from './components/TodoList.svelte';

	onMount(() => AVWatch.activate(true));

	onDestroy(() => AVWatch.deactivate());

	const forceReFetch = new BehaviorSubjectWithSet<boolean>(true);
	let fetchDelay = 0;

	let recursiveObject = {};
	Object.assign(recursiveObject, {
		a: [recursiveObject],
		b: 2,
		c: {
			d: { self: recursiveObject },
		},
		m: new Map([['some key', recursiveObject]]),
	});

	const recursiveDataStream = new BehaviorSubjectWithSet(recursiveObject);
	// watchStream('recursiveData', recursiveDataStream);

	const users = forceReFetch.pipe(
		switchMapWhenFulfilled((shouldSucceed) =>
			AsyncValue.fetchAndParseResponse(
				`https://${shouldSucceed ? '' : 'no-'}jsonplaceholder.typicode.com/users`,
			),
		),
		switchMap((av) => (!av.pending ? of(av).pipe(delay(fetchDelay * 1000)) : of(av))),
		watch('users', ''),
		shareReplay(1),
	);

	const selectedUserId = new ReplaySubject<number>(1);
	watchStream('selectedUserId', selectedUserId);

	const selectedUserTodos = combineLatest([selectedUserId, forceReFetch]).pipe(
		switchMapWhenFulfilled(([selectedUserId, shouldSucceed]) =>
			AsyncValue.fetchAndParseResponse(
				`https://${
					shouldSucceed ? '' : 'no-'
				}jsonplaceholder.typicode.com/todos?userId=${selectedUserId}`,
			),
		),
		switchMap((av) => (!av.pending ? of(av).pipe(delay(fetchDelay * 1000)) : of(av))),
		startWith(AsyncValue.valueOnly(null)),
		watch('selectedUserTodos', ''),
		shareReplay(1),
	);
</script>

<ion-app class="app">
	<ion-header class="header">
		<h1>Async Values demo</h1>
		<p>
			This project is using <a href="https://jsonplaceholder.typicode.com/">
				jsonplaceholder.typicode.com
			</a> to demonstrate debugging of async App state using async-values.
		</p>
		<p>Press Ctrl + Alt to show Watcher.</p>
		<p>While Watcher is open, press H to show/hide Help page.</p>
		<div style="display: flex; align-items: center; padding-bottom: 10px;">
			<label for="delay">Simulate Fetch delay</label>
			<input
				type="range"
				id="delay"
				name="delay"
				bind:value={fetchDelay}
				min="0"
				max="2"
				step="0.5"
				style="margin: 0 8px;"
			/>
			<label for="delay">{fetchDelay} seconds</label>
		</div>
		<ion-button on:click={() => forceReFetch.next(true)}>Refetch</ion-button>
		<ion-button on:click={() => forceReFetch.next(false)} color="danger"
			>Refetch With Error</ion-button
		>
	</ion-header>

	<ion-content fullscreen>
		<div class="content">
			<UserList {users} {selectedUserId} />
			<TodoList todos={selectedUserTodos} />
		</div>
	</ion-content>
</ion-app>

<style lang="scss">
	:global(*) {
		box-sizing: border-box;
		--ion-color-primary: #3880ff;
		--ion-color-primary-contrast: #fff;
	}

	ion-header {
		background-color: white;
		padding: 16px;
	}

	.content {
		height: 100%;
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr;
	}
</style>
