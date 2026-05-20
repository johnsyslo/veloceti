<script lang="ts">
	import { page } from '$app/stores';
	import RouteMap from '$lib/components/map/RouteMapWrapper.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import { resolve } from '$app/paths';
</script>

<div class="mx-auto max-w-5xl px-4 py-8">
	<PageHeader title="Activities" subtitle="Your recent rides from Strava" />

	{#if $page.data.totalCount === 0}
		<EmptyState body="Sync from the dashboard to pull in your Strava rides." />
	{:else}
		<p class="mb-5 text-sm text-neutral-500">
			Showing {($page.data.page - 1) * $page.data.itemsPerPage + 1}–{Math.min(
				$page.data.page * $page.data.itemsPerPage,
				$page.data.totalCount
			)}
			of {$page.data.totalCount}
		</p>

		<ul class="space-y-4">
			{#each $page.data.activities as activity (activity.id)}
				<li class="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/60 shadow-sm">
					<div class="flex flex-col lg:flex-row">
						<div class="min-w-0 flex-1 p-5 sm:p-6">
							<div class="mb-5 flex flex-wrap items-start justify-between gap-3">
								<div class="min-w-0">
									<h2 class="truncate text-lg font-semibold text-neutral-100">
										<a
											href={resolve(`/activities/${activity.id}`)}
											class="transition-colors hover:text-emerald-400"
										>
											{activity.title}
										</a>
									</h2>
									<p class="mt-0.5 text-sm text-neutral-500">
										{activity.startDate} · {activity.startTime}
									</p>
								</div>
								<div>
									<a
										href={resolve(`/activities/${activity.id}`)}
										class="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-300 transition-all hover:border-neutral-600 hover:bg-neutral-700 hover:text-white"
									>
										Analyze
										<svg
											class="h-3.5 w-3.5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											stroke-width="2.5"
										>
											<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
										</svg>
									</a>
								</div>
							</div>

							<dl class="grid grid-cols-3 gap-x-6 gap-y-4">
								<div>
									<dt class="text-xs font-medium tracking-wide text-neutral-500 uppercase">
										Distance
									</dt>
									<dd class="mt-0.5 text-xl font-semibold text-neutral-100 tabular-nums">
										{activity.distanceMiles}
										<span class="text-sm font-normal text-neutral-500">mi</span>
									</dd>
								</div>
								<div>
									<dt class="text-xs font-medium tracking-wide text-neutral-500 uppercase">
										Max Speed
									</dt>
									<dd class="mt-0.5 text-xl font-semibold text-neutral-100 tabular-nums">
										{activity.maxSpeedMph ?? '—'}
										{#if activity.maxSpeedMph}
											<span class="text-sm font-normal text-neutral-500">mph</span>
										{/if}
									</dd>
								</div>
								<div>
									<dt class="text-xs font-medium tracking-wide text-neutral-500 uppercase">
										Duration
									</dt>
									<dd class="mt-0.5 text-xl font-semibold text-neutral-100 tabular-nums">
										{activity.duration}
									</dd>
								</div>
								<div>
									<dt class="text-xs font-medium tracking-wide text-neutral-500 uppercase">
										Elevation
									</dt>
									<dd class="mt-0.5 text-xl font-semibold text-neutral-100 tabular-nums">
										{activity.elevationGainFt ?? '—'}
										{#if activity.elevationGainFt}
											<span class="text-sm font-normal text-neutral-500">ft</span>
										{/if}
									</dd>
								</div>
								<div>
									<dt class="text-xs font-medium tracking-wide text-neutral-500 uppercase">
										Average Speed
									</dt>
									<dd class="mt-0.5 text-xl font-semibold text-neutral-100 tabular-nums">
										{activity.avgSpeedMph}
										<span class="text-sm font-normal text-neutral-500">mph</span>
									</dd>
								</div>
								<div>
									<dt class="text-xs font-medium tracking-wide text-neutral-500 uppercase">
										Total Elapsed Time
									</dt>
									<dd class="mt-0.5 text-xl font-semibold text-neutral-100 tabular-nums">
										{activity.elapsedTime}
									</dd>
								</div>
							</dl>
						</div>

						<div
							class="border-t border-neutral-800 bg-neutral-950/80 lg:w-72 lg:shrink-0 lg:border-t-0 lg:border-l xl:w-80"
						>
							<RouteMap polyline={activity.summary_polyline} />
						</div>
					</div>
				</li>
			{/each}
		</ul>

		<Pagination
			page={$page.data.page}
			totalPages={$page.data.totalPages}
			baseHref="/activities"
		/>
	{/if}
</div>
