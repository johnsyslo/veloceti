<script lang="ts">
	import { onMount } from 'svelte';
	import type { Map } from 'leaflet';
	import { decodePolyline } from '$lib/utils/polyline';

	interface Props {
		polyline?: string | null;
	}

	let { polyline }: Props = $props();

	let coordinates: [number, number][] = $state([]);
	let mapComponent: { getMap: () => Map | undefined } | null = $state(null);
	let isLoaded = $state(false);

	let LeafletMap: any = $state(null);
	let Polyline: any = $state(null);
	let TileLayer: any = $state(null);

	onMount(async () => {
		// Only on client
		if (polyline) {
			try {
				const decoded = decodePolyline(polyline);
				coordinates = decoded.map(([lat, lng]) => [lat, lng]);
			} catch {
				coordinates = [];
			}
		}

		// Dynamically import Leaflet components only on client
		const mod = await import('svelte-leafletjs');
		LeafletMap = mod.LeafletMap;
		Polyline = mod.Polyline;
		TileLayer = mod.TileLayer;

		await import('leaflet/dist/leaflet.css');

		isLoaded = true;
	});

	$effect(() => {
		if (mapComponent && coordinates.length > 0) {
			const map = mapComponent.getMap?.();
			if (map) {
				const lats = coordinates.map((c) => c[0]);
				const lngs = coordinates.map((c) => c[1]);
				const bounds: [[number, number], [number, number]] = [
					[Math.min(...lats), Math.min(...lngs)],
					[Math.max(...lats), Math.max(...lngs)]
				];
				map.fitBounds(bounds);
				map.dragging.disable();
				map.touchZoom.disable();
				map.doubleClickZoom.disable();
				map.scrollWheelZoom.disable();
			}
		}
	});

	const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
</script>

{#if isLoaded && coordinates.length > 0 && LeafletMap}
	<div class="pointer-events-none relative aspect-4/3 w-full lg:aspect-auto lg:h-full lg:min-h-55">
		<LeafletMap bind:this={mapComponent} options={{ zoom: 12 }}>
			<TileLayer
				url={tileUrl}
				options={{
					attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
				}}
			/>
			<Polyline latLngs={coordinates} options={{ color: '#0ea5e9', weight: 3, opacity: 0.8 }} />
		</LeafletMap>
	</div>
{:else}
	<div
		class="pointer-events-none relative flex aspect-4/3 h-full min-h-[160px] w-full flex-col items-center justify-center gap-2 p-6 text-center lg:aspect-auto lg:h-full lg:min-h-55"
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

<style>
	:global(.leaflet-container) {
		background-color: rgb(23, 23, 23);
		height: 100%;
		z-index: 1;
	}

	:global(.leaflet-control) {
		display: none !important;
	}

	:global(.leaflet-bottom, .leaflet-top) {
		display: none !important;
	}
</style>
