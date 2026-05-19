<script lang="ts">
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import { decodePolyline, polylineToSvgPath } from '$lib/utils/polyline';

	function routePath(polyline: string | null | undefined): string | null {
		if (!polyline) return null;
		try {
			return polylineToSvgPath(decodePolyline(polyline));
		} catch {
			return null;
		}
	}
</script>

<div class="mx-auto max-w-5xl px-4 py-8">
	<header class="mb-8">
		<h1 class="text-3xl font-semibold tracking-tight text-neutral-50">Activities</h1>
		<p class="mt-1 text-neutral-500">Your recent rides from Strava</p>
	</header>

	{#if $page.data.totalCount === 0}
		<div
			class="rounded-xl border border-dashed border-neutral-800 bg-neutral-900/40 px-8 py-16 text-center"
		>
			<p class="text-lg text-neutral-300">No activities yet</p>
			<p class="mt-2 text-sm text-neutral-500">
				Sync from the dashboard to pull in your Strava rides.
			</p>
		</div>
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
				{@const path = routePath(activity.summary_polyline)}
				<li
					class="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/60 shadow-sm"
				>
					<div class="flex flex-col lg:flex-row">
						<div class="min-w-0 flex-1 p-5 sm:p-6">
							<div class="mb-5 flex flex-wrap items-start justify-between gap-3">
								<div class="min-w-0">
									<h2 class="truncate text-lg font-semibold text-neutral-100">
										{activity.title}
									</h2>
									<p class="mt-0.5 text-sm text-neutral-500">
										{activity.startDate} · {activity.startTime}
									</p>
								</div>
							</div>

							<dl class="grid grid-cols-3 gap-x-6 gap-y-4">
								<div>
									<dt class="text-xs font-medium tracking-wide text-neutral-500 uppercase">
										Distance
									</dt>
									<dd class="mt-0.5 tabular-nums text-xl font-semibold text-neutral-100">
										{activity.distanceMiles}
										<span class="text-sm font-normal text-neutral-500">mi</span>
									</dd>
								</div>
								<div>
									<dt class="text-xs font-medium tracking-wide text-neutral-500 uppercase">
										Max Speed
									</dt>
									<dd class="mt-0.5 tabular-nums text-xl font-semibold text-neutral-100">
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
									<dd class="mt-0.5 tabular-nums text-xl font-semibold text-neutral-100">
										{activity.duration}
									</dd>
								</div>
								<div>
									<dt class="text-xs font-medium tracking-wide text-neutral-500 uppercase">
										Elevation
									</dt>
									<dd class="mt-0.5 tabular-nums text-xl font-semibold text-neutral-100">
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
									<dd class="mt-0.5 tabular-nums text-xl font-semibold text-neutral-100">
										{activity.avgSpeedMph}
										<span class="text-sm font-normal text-neutral-500">mph</span>
									</dd>
								</div>
								<div>
									<dt class="text-xs font-medium tracking-wide text-neutral-500 uppercase">
										Total Elapsed Time
									</dt>
									<dd class="mt-0.5 tabular-nums text-xl font-semibold text-neutral-100">
										{activity.elapsedTime}
									</dd>
								</div>
							</dl>
						</div>

						<div
							class="border-t border-neutral-800 bg-neutral-950/80 lg:w-72 lg:shrink-0 lg:border-t-0 lg:border-l xl:w-80"
						>
							<div class="relative aspect-[4/3] w-full lg:aspect-auto lg:h-full lg:min-h-[220px]">
								{#if path}
									<svg
										class="h-full w-full p-4"
										viewBox="0 0 100 100"
										preserveAspectRatio="xMidYMid meet"
										aria-label="Route map for {activity.title}"
									>
										<path
											d={path}
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											class="text-sky-400/90"
										/>
									</svg>
								{:else}
									<div
										class="flex h-full min-h-[160px] flex-col items-center justify-center gap-2 p-6 text-center"
									>
										<svg
											class="h-10 w-10 text-neutral-700"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											stroke-width="1.5"
											aria-hidden="true"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
											/>
										</svg>
										<p class="text-xs text-neutral-600">No route data</p>
									</div>
								{/if}
							</div>
						</div>
					</div>
				</li>
			{/each}
		</ul>

		{#if $page.data.totalPages > 1}
			<nav class="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
				{#if $page.data.page > 1}
					<a
						href={resolve(`/activities?page=${$page.data.page - 1}`)}
						class="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:border-neutral-600 hover:bg-neutral-800"
					>
						Previous
					</a>
				{:else}
					<span
						class="rounded-lg border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-600"
					>
						Previous
					</span>
				{/if}

				<span class="px-2 text-sm text-neutral-500">
					{$page.data.page} / {$page.data.totalPages}
				</span>

				{#if $page.data.page < $page.data.totalPages}
					<a
						href={resolve(`/activities?page=${$page.data.page + 1}`)}
						class="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:border-neutral-600 hover:bg-neutral-800"
					>
						Next
					</a>
				{:else}
					<span
						class="rounded-lg border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-600"
					>
						Next
					</span>
				{/if}
			</nav>
		{/if}
	{/if}
</div>
