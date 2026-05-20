<script lang="ts">
	import { onMount } from 'svelte';
	import type { Map } from 'leaflet';

	interface Props {
		latitudes?: number[] | null;
		longitudes?: number[] | null;
		hoveredIndex?: number | null;
	}

	let { latitudes = null, longitudes = null, hoveredIndex = null }: Props = $props();

	let coordinates: [number, number][] = $derived.by(() => {
		if (!latitudes || !longitudes) return [];
		const len = Math.min(latitudes.length, longitudes.length);
		const points: [number, number][] = [];
		for (let i = 0; i < len; i++) {
			points.push([latitudes[i], longitudes[i]]);
		}
		return points;
	});

	let hoveredCoords: [number, number] | null = $derived.by(() => {
		if (hoveredIndex === null || hoveredIndex === undefined) return null;
		if (hoveredIndex < 0 || hoveredIndex >= coordinates.length) return null;
		return coordinates[hoveredIndex];
	});

	let mapComponent: { getMap: () => Map | undefined } | null = $state(null);
	let isLoaded = $state(false);

	let LeafletMap: any = $state(null);
	let Polyline: any = $state(null);
	let TileLayer: any = $state(null);
	let CircleMarker: any = $state(null);

	onMount(async () => {
		// Dynamically import Leaflet components only on client
		const mod = await import('svelte-leafletjs');
		LeafletMap = mod.LeafletMap;
		Polyline = mod.Polyline;
		TileLayer = mod.TileLayer;
		CircleMarker = mod.CircleMarker;

		await import('leaflet/dist/leaflet.css');

		isLoaded = true;
	});

	// Fit bounds when map is loaded and coordinates are available
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
				// Add padding to ensure the whole route fits nicely inside the container
				map.fitBounds(bounds, { padding: [16, 16] });
				
				// Allow panning but disable scroll zoom to keep standard dashboard interactions smooth
				map.scrollWheelZoom.disable();
			}
		}
	});

	const tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'; // Curated beautiful dark map tiles
</script>

{#if isLoaded && coordinates.length > 0 && LeafletMap}
	<div class="relative h-full min-h-[300px] w-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-lg">
		<LeafletMap bind:this={mapComponent} options={{ zoom: 13, attributionControl: false }}>
			<TileLayer
				url={tileUrl}
				options={{
					attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
				}}
			/>
			
			<!-- Main Route Polyline -->
			<Polyline 
				latLngs={coordinates} 
				options={{ 
					color: '#10b981', /* Beautiful emerald green matching --primary */
					weight: 4, 
					opacity: 0.85,
					lineJoin: 'round',
					lineCap: 'round'
				}} 
			/>

			<!-- Hover Cursor Marker -->
			{#if hoveredCoords && CircleMarker}
				<!-- Outer Pulse effect -->
				<CircleMarker
					latLng={hoveredCoords}
					options={{
						radius: 9,
						color: '#10b981',
						fillColor: '#10b981',
						fillOpacity: 0.3,
						weight: 1
					}}
				/>
				<!-- Inner Core -->
				<CircleMarker
					latLng={hoveredCoords}
					options={{
						radius: 5,
						color: '#ffffff',
						fillColor: '#10b981',
						fillOpacity: 1,
						weight: 2
					}}
				/>
			{/if}
		</LeafletMap>
	</div>
{:else}
	<div
		class="relative flex h-full min-h-[300px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 text-center shadow-lg backdrop-blur-md"
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
		<p class="text-xs text-neutral-600">No route coordinates available for this activity</p>
	</div>
{/if}

<style>
	:global(.leaflet-container) {
		background-color: #0a0a0a;
		height: 100%;
		width: 100%;
		z-index: 1;
	}

	:global(.leaflet-control-zoom) {
		border: 1px solid rgb(38, 38, 38) !important;
		background: rgba(23, 23, 23, 0.8) !important;
		backdrop-filter: blur(8px);
	}
	
	:global(.leaflet-control-zoom a) {
		background: transparent !important;
		color: rgb(212, 212, 212) !important;
		border-bottom: 1px solid rgb(38, 38, 38) !important;
	}

	:global(.leaflet-control-zoom a:hover) {
		background: rgba(38, 38, 38, 0.8) !important;
		color: #ffffff !important;
	}
</style>
