<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';

	let isSyncing = $state(false);

	const summary = $derived($page.data.summary);
	const hasActivities = $derived(summary.rideCount > 0);
</script>

<div class="mx-auto max-w-5xl px-4 py-8">
	<header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight text-neutral-50">Dashboard</h1>
			<p class="mt-1 text-neutral-500">
				Welcome back, {$page.data.session?.user?.name || 'User'}
			</p>
		</div>

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
	</header>

	{#if $page.form?.success}
		<p class="mb-6 rounded-lg border border-green-900/50 bg-green-950/30 px-4 py-3 text-sm text-green-400">
			Synced {$page.form.synced ?? 0} activities from Strava.
		</p>
	{/if}
	{#if $page.form?.error}
		<p class="mb-6 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
			{$page.form.error}
		</p>
	{/if}

	{#if !hasActivities}
		<div
			class="rounded-xl border border-dashed border-neutral-800 bg-neutral-900/40 px-8 py-16 text-center"
		>
			<p class="text-lg text-neutral-300">No activities yet</p>
			<p class="mt-2 text-sm text-neutral-500">
				Sync from Strava to import your rides and see stats here.
			</p>
		</div>
	{:else}
		<section class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
			<div class="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
				<p class="text-xs font-medium tracking-wide text-neutral-500 uppercase">Rides</p>
				<p class="mt-1 tabular-nums text-2xl font-semibold text-neutral-100">
					{summary.rideCount}
				</p>
			</div>
			<div class="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
				<p class="text-xs font-medium tracking-wide text-neutral-500 uppercase">Distance</p>
				<p class="mt-1 tabular-nums text-2xl font-semibold text-neutral-100">
					{summary.totalDistanceMiles}
					<span class="text-sm font-normal text-neutral-500">mi</span>
				</p>
			</div>
			<div class="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
				<p class="text-xs font-medium tracking-wide text-neutral-500 uppercase">Moving time</p>
				<p class="mt-1 tabular-nums text-2xl font-semibold text-neutral-100">
					{summary.totalMovingTime}
				</p>
			</div>
			<div class="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
				<p class="text-xs font-medium tracking-wide text-neutral-500 uppercase">Latest ride</p>
				<p class="mt-1 text-2xl font-semibold text-neutral-100">
					{summary.latestRideDate ?? '—'}
				</p>
			</div>
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
