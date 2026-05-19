<script lang="ts">
	import { page } from '$app/stores';

	let isSyncing = $state(false);
	let syncMessage = $state<string | null>(null);
	let syncError = $state<string | null>(null);

	const syncActivities = async () => {
		isSyncing = true;
		syncMessage = null;
		syncError = null;
		try {
			const response = await fetch('/api/strava/sync', { method: 'POST' });
			const data = await response.json();
			if (!response.ok) {
				syncError = data?.error || 'Sync failed.';
				return;
			}
			syncMessage = `Synced ${data?.synced ?? 0} activities.`;
		} catch (error) {
			syncError = error instanceof Error ? error.message : 'Sync failed.';
		} finally {
			isSyncing = false;
		}
	};
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-6 text-4xl font-bold">Dashboard</h1>
	<p class="mb-4">Welcome, {$page.data.session?.user?.name || 'User'}!</p>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div class="rounded-lg border p-6" style="border-color: var(--primary);">
			<h2 class="mb-2 text-xl font-bold">Strava Connected</h2>
			<p>Your Strava account is connected and ready to sync activities.</p>
			<div class="mt-4 flex flex-col gap-3">
				<button
					onclick={syncActivities}
					disabled={isSyncing}
					class="w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
					style="background-color: var(--primary);"
				>
					{isSyncing ? 'Syncing...' : 'Sync Activities'}
				</button>
				{#if syncMessage}
					<p class="text-sm text-green-400">{syncMessage}</p>
				{/if}
				{#if syncError}
					<p class="text-sm text-red-400">{syncError}</p>
				{/if}
			</div>
		</div>
	</div>
</div>
