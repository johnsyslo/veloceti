<script lang="ts">
	import { browser } from '$app/environment';

	interface Props {
		latitudes: number[] | null | undefined;
		longitudes: number[] | null | undefined;
		hoveredIndex: number | null | undefined;
	}

	let { latitudes, longitudes, hoveredIndex }: Props = $props();

	let InteractiveRouteMapComponent: any = $state(null);

	$effect.pre(() => {
		if (browser && !InteractiveRouteMapComponent) {
			import('./InteractiveRouteMap.svelte').then((mod) => {
				InteractiveRouteMapComponent = mod.default;
			});
		}
	});
</script>

{#if browser && InteractiveRouteMapComponent}
	<InteractiveRouteMapComponent {latitudes} {longitudes} {hoveredIndex} />
{:else}
	<div
		class="relative flex h-full min-h-[300px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 text-center shadow-lg backdrop-blur-md"
	>
		<svg
			class="h-10 w-10 animate-pulse text-neutral-700"
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
		<p class="text-xs text-neutral-500">Loading map component...</p>
	</div>
{/if}
