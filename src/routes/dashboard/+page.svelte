<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	let isSyncing = $state(false);
</script>

<div class="mx-auto max-w-5xl px-4 py-8">
	<header class="mb-8">
		<h1 class="text-3xl font-semibold tracking-tight text-neutral-50">Dashboard</h1>
		<p class="mt-1 text-neutral-500">Welcome, {$page.data.session?.user?.name || 'User'}!</p>
	</header>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div class="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
			<h2 class="mb-2 text-xl font-semibold text-neutral-100">Strava Connected</h2>
			<p class="text-sm text-neutral-400">
				Your Strava account is connected and ready to sync activities.
			</p>

			<form
				method="POST"
				action="?/sync"
				class="mt-4 flex flex-col gap-3"
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
					class="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-100 transition-colors hover:border-neutral-600 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{isSyncing ? 'Syncing...' : 'Sync Activities'}
				</button>

				{#if $page.form?.success}
					<p class="text-sm text-green-400">
						Synced {$page.form.synced ?? 0} activities.
					</p>
				{/if}
				{#if $page.form?.error}
					<p class="text-sm text-red-400">{$page.form.error}</p>
				{/if}
			</form>
		</div>
	</div>
</div>
