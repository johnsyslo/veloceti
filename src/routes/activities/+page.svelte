<script lang="ts">
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<h1 class="text-5xl font-bold text-white">Activities</h1>
		<p class="mt-2 text-neutral-400">Track and analyze your cycling activities</p>
	</div>

	{#if $page.data.totalCount === 0}
		<div class="rounded-lg border border-dashed border-neutral-600 bg-neutral-900 p-12 text-center">
			<p class="text-lg text-neutral-400">🚴 No activities yet</p>
			<p class="mt-2 text-sm text-neutral-500">
				Sync activities from your Strava account on the dashboard to get started.
			</p>
		</div>
	{:else}
		<div
			class="mb-6 flex flex-col items-center justify-between gap-4 rounded-lg bg-neutral-900 px-4 py-3 md:flex-row"
		>
			<div class="text-sm text-neutral-400">
				Showing {($page.data.page - 1) * 20 + 1} - {Math.min(
					$page.data.page * 20,
					$page.data.totalCount
				)} of {$page.data.totalCount}
				activities
			</div>
		</div>

		<div class="space-y-6">
			{#each $page.data.activities as activity (activity.id)}
				<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
					<div
						class="rounded-2xl border p-8 transition-all duration-300 md:col-span-2"
						style="border-color: var(--primary); background-color: var(--quaternary); box-shadow: 0 0 30px rgba(59, 110, 76, 0.2);"
					>
						<div class="mb-6">
							<div class="mb-3 flex items-start justify-between gap-3">
								<div class="flex-1">
									<h3 class="text-2xl font-bold text-neutral-100">{activity.title}</h3>
									<p class="mt-1 text-xs text-neutral-500">
										📅 {activity.startDate} at {activity.startTime}
									</p>
								</div>
								<div
									class="flex-shrink-0 rounded-full px-3 py-1 text-sm font-semibold text-white"
									style="background-color: var(--primary);"
								>
									{activity.type}
								</div>
							</div>
						</div>

						<div class="grid grid-cols-2 gap-6 md:grid-cols-3">
							<div>
								<p class="text-xs font-medium tracking-wide text-neutral-400 uppercase">Distance</p>
								<p class="mt-2 text-3xl font-bold text-neutral-100">{activity.distanceMiles}</p>
								<p class="text-sm text-neutral-500">miles</p>
							</div>
							<div>
								<p class="text-xs font-medium tracking-wide text-neutral-400 uppercase">Duration</p>
								<p class="mt-2 text-3xl font-bold text-neutral-100">
									{activity.movingTimeHours}:{String(activity.movingTimeMinutes % 60).padStart(
										2,
										'0'
									)}
								</p>
								<p class="text-sm text-neutral-500">hours</p>
							</div>
							<div>
								<p class="text-xs font-medium tracking-wide text-neutral-400 uppercase">
									Avg Speed
								</p>
								<p class="mt-2 text-3xl font-bold text-neutral-100">{activity.avgSpeedMph}</p>
								<p class="text-sm text-neutral-500">mph</p>
							</div>
							<div>
								<p class="text-xs font-medium tracking-wide text-neutral-400 uppercase">
									Max Speed
								</p>
								<p class="mt-2 text-3xl font-bold text-neutral-100">
									{activity.maxSpeedMph ?? 'N/A'}
								</p>
								<p class="text-sm text-neutral-500">mph</p>
							</div>
							<div>
								<p class="text-xs font-medium tracking-wide text-neutral-400 uppercase">
									Elevation
								</p>
								<p class="mt-2 text-3xl font-bold text-neutral-100">
									{activity.elevationGainFt ?? 0}
								</p>
								<p class="text-sm text-neutral-500">ft</p>
							</div>
						</div>
					</div>

					<div
						class="overflow-hidden rounded-2xl border transition-all duration-300"
						style="border-color: var(--secondary); background-color: var(--primary); box-shadow: 0 0 30px rgba(59, 110, 76, 0.2);"
					>
						<div class="flex aspect-square h-full w-full items-center justify-center">
							<div class="text-center">
								<p class="mb-2 text-5xl">🗺️</p>
								<p class="text-sm text-neutral-400">Map preview</p>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>

		{#if $page.data.totalPages > 1}
			<div class="mt-8 flex items-center justify-center gap-4">
				{#if $page.data.page > 1}
					<a
						href={resolve(`/activities?page=${$page.data.page - 1}`)}
						class="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
						style="background-color: var(--primary);"
					>
						← Previous
					</a>
				{:else}
					<button disabled class="rounded-lg px-4 py-2 text-sm font-semibold opacity-50">
						← Previous
					</button>
				{/if}

				<span class="text-sm text-neutral-400">
					Page {$page.data.page} of {$page.data.totalPages}
				</span>

				{#if $page.data.page < $page.data.totalPages}
					<a
						href={resolve(`/activities?page=${$page.data.page + 1}`)}
						class="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
						style="background-color: var(--primary);"
					>
						Next →
					</a>
				{:else}
					<button disabled class="rounded-lg px-4 py-2 text-sm font-semibold opacity-50">
						Next →
					</button>
				{/if}
			</div>
		{/if}
	{/if}
</div>
