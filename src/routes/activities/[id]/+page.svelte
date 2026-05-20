<script lang="ts">
	import InteractiveRouteMapWrapper from '$lib/components/map/InteractiveRouteMapWrapper.svelte';
	import TelemetryCharts from '$lib/components/charts/TelemetryCharts.svelte';
	import ActivityHeader from '$lib/components/activity/ActivityHeader.svelte';
	import ActivityMetricsGrid from '$lib/components/activity/ActivityMetricsGrid.svelte';
	import ActivitySummaryTable from '$lib/components/activity/ActivitySummaryTable.svelte';

	let { data } = $props();

	let hoveredIndex: number | null = $state(null);

	const activity = $derived(data.activity);
	const streams = $derived(data.streams);
	const analytics = $derived(data.analytics);
	const hasStreams = $derived(!!streams && streams.time_offsets.length > 0);
</script>

<div class="mx-auto max-w-7xl px-4 py-8">
	<ActivityHeader {activity} />

	<ActivityMetricsGrid {activity} {analytics} />

	{#if !hasStreams}
		<div
			class="rounded-2xl border border-yellow-900/50 bg-yellow-950/20 px-6 py-5 text-yellow-400 shadow-md backdrop-blur-md"
		>
			<div class="flex gap-3">
				<span class="text-xl">⚠️</span>
				<div>
					<h3 class="font-bold text-yellow-300">Telemetry Data Synced without Coordinates</h3>
					<p class="mt-1 text-sm text-yellow-400/80">
						This activity is successfully cached locally, but no GPS telemetry stream records were
						found or loaded. This can happen if the ride was recorded indoors, on a stationary
						trainer, or if Strava has not finished processing stream files yet.
					</p>
				</div>
			</div>
		</div>
	{/if}

	{#if hasStreams}
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
			<div class="lg:sticky lg:top-8 lg:col-span-5 lg:h-[calc(100vh-140px)]">
				<div class="flex h-full flex-col gap-3">
					<div class="flex items-center justify-between px-1">
						<h2 class="text-sm font-bold tracking-wider text-neutral-400 uppercase">
							Route Analysis
						</h2>
						{#if hoveredIndex !== null && streams?.latitudes && streams?.longitudes}
							<div class="text-[10px] font-bold text-neutral-500 uppercase tabular-nums">
								GPS: {streams.latitudes[hoveredIndex].toFixed(5)}, {streams.longitudes[
									hoveredIndex
								].toFixed(5)}
							</div>
						{/if}
					</div>
					<div class="min-h-[350px] flex-1">
						<InteractiveRouteMapWrapper
							latitudes={streams?.latitudes}
							longitudes={streams?.longitudes}
							{hoveredIndex}
						/>
					</div>
				</div>
			</div>

			<div class="lg:col-span-7">
				<div class="flex flex-col gap-3">
					<h2 class="px-1 text-sm font-bold tracking-wider text-neutral-400 uppercase">
						Sensor Telemetry
					</h2>
					<TelemetryCharts streams={streams!} bind:hoveredIndex />
				</div>
			</div>
		</div>
	{/if}

	<ActivitySummaryTable {activity} {analytics} />
</div>
