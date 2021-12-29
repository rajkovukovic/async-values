<script lang="ts">
	import type { Observable } from 'rxjs';
	import type { AsyncValue } from '$lib';
	import Spinner from './Spinner.svelte';

	export let todos: Observable<AsyncValue<any>>;

	// $: console.log('todos', $todos);
</script>

<ion-list>
	<ion-list-header>Selected User Todos</ion-list-header>
	{#if $todos?.error}
		<ion-item class="error-item">{$todos.error}</ion-item>
	{:else if $todos?.pending}
		<ion-item>
			<Spinner />
		</ion-item>
	{:else if $todos?.value}
		{#each $todos?.value as todo (todo.id)}
			<ion-item>
				{todo.completed ? '✓' : '⌑'}&nbsp;&nbsp;&nbsp;
				<ion-text>
					{todo.title}
				</ion-text>
			</ion-item>
		{/each}
	{/if}
</ion-list>

<style src="./list.scss"></style>
