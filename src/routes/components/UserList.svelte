<script lang="ts">
	import type { Observable, ReplaySubject } from 'rxjs';
	import type { AsyncValue } from '$lib';
	import Spinner from './Spinner.svelte';

	export let users: Observable<AsyncValue<any>>;
	export let selectedUserId: ReplaySubject<number>;

	// $: console.log('users', $users);
</script>

<ion-list>
	<ion-list-header>Users</ion-list-header>
	{#if $users?.error}
		<ion-item class="error-item">{$users.error}</ion-item>
	{:else if $users?.pending}
		<ion-item>
			<Spinner />
		</ion-item>
	{:else if $users?.value}
		{#each $users?.value as user}
			<ion-item
				class:selected={$selectedUserId === user.id}
				on:click={selectedUserId.next($selectedUserId === user.id ? null : user.id)}
			>
				{user.name}
			</ion-item>
		{/each}
	{/if}
</ion-list>

<style src="./list.scss"></style>
