<script lang="ts">
	import StatCard from '$lib/components/StatCard.svelte';

	interface Props {
		activity: any;
		analytics: any;
	}

	let { activity, analytics }: Props = $props();

	const cards = $derived([
		{ label: 'Distance', value: activity.distanceMiles, unit: 'mi' },
		{ label: 'Moving Time', value: activity.duration, unit: '' },
		{ label: 'Avg Speed', value: activity.avgSpeedMph, unit: 'mph' },
		{ label: 'Elevation', value: activity.elevationGainFt, unit: 'ft' },
		{ label: 'Avg Power', value: analytics.power ? analytics.power.activeAvg : null, unit: 'W' },
		{ label: 'Avg Heart Rate', value: analytics.heartrate ? analytics.heartrate.avg : null, unit: 'bpm' }
	]);
</script>

<section class="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
	{#each cards as card}
		<StatCard label={card.label} value={card.value} unit={card.unit} />
	{/each}
</section>
