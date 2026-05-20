<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import StatCard from '$lib/components/StatCard.svelte';

	let isSyncing = $state(false);

	const summary = $derived($page.data.summary);
	const hasActivities = $derived(summary.rideCount > 0);
</script>

<div class="mx-auto max-w-5xl px-4 py-8">
	<PageHeader title="Dashboard" subtitle="Welcome back, {$page.data.session?.user?.name || 'User'}">
		<form
			method="POST"
			action="?/sync"
			use:enhance={() => {
				isSyncing = true;
				return async ({ update }) => {
					await update();
					isSyncing = false;
				};
			}}
		>
			<button
				type="submit"
				disabled={isSyncing}
				class="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-100 transition-colors hover:border-neutral-600 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
			>
				{isSyncing ? 'Syncing...' : 'Sync from Strava'}
			</button>
		</form>
	</PageHeader>

	{#if $page.form?.success}
		<p
			class="mb-6 rounded-lg border border-green-900/50 bg-green-950/30 px-4 py-3 text-sm text-green-400"
		>
			Synced {$page.form.synced ?? 0} activities from Strava.
		</p>
	{/if}
	{#if $page.form?.error}
		<p
			class="mb-6 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400"
		>
			{$page.form.error}
		</p>
	{/if}

	{#if !hasActivities}
		<EmptyState body="Sync from Strava to import your rides and see stats here." />
	{:else}
		<section class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
			<StatCard label="Rides" value={summary.rideCount} />
			<StatCard label="Distance" value={summary.totalDistanceMiles} unit="mi" />
			<StatCard label="Moving time" value={summary.totalMovingTime} />
			<StatCard label="Latest ride" value={summary.latestRideDate} />
		</section>

		<section class="rounded-xl border border-neutral-800 bg-neutral-900/60">
			<div class="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
				<h2 class="text-lg font-semibold text-neutral-100">Recent activities</h2>
				<a
					href={resolve('/activities')}
					class="text-sm font-medium text-neutral-400 transition-colors hover:text-neutral-200"
				>
					View all
				</a>
			</div>

			<ul class="divide-y divide-neutral-800">
				{#each $page.data.recentActivities as activity (activity.id)}
					<li class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
						<div class="min-w-0">
							<p class="truncate font-medium text-neutral-100">{activity.title}</p>
							<p class="mt-0.5 text-sm text-neutral-500">
								{activity.startDate}
								<span class="text-neutral-700">·</span>
								{activity.type}
							</p>
						</div>
						<div class="flex shrink-0 gap-6 text-sm tabular-nums">
							<div class="text-right">
								<p class="text-neutral-500">Distance</p>
								<p class="font-medium text-neutral-200">{activity.distanceMiles} mi</p>
							</div>
							<div class="text-right">
								<p class="text-neutral-500">Duration</p>
								<p class="font-medium text-neutral-200">{activity.duration}</p>
							</div>
						</div>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</div>
