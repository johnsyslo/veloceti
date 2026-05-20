<script lang="ts">
	import type { ActivityStreams } from '$lib/server/db/db-streams';

	interface Props {
		streams: ActivityStreams;
		hoveredIndex: number | null;
	}

	let { streams, hoveredIndex = $bindable(null) }: Props = $props();

	const MAX_RENDER_POINTS = 400;

	interface ChartPanel {
		id: string;
		label: string;
		unit: string;
		color: string;
		fillGradient: string;
		values: number[];
		min: number;
		max: number;
		format: (v: number) => string;
	}

	const processedData = $derived.by(() => {
		const originalLen = streams.time_offsets.length;
		if (originalLen === 0) return { panels: [], originalIndices: [] };

		const step = Math.max(1, Math.ceil(originalLen / MAX_RENDER_POINTS));
		const indices: number[] = [];

		for (let i = 0; i < originalLen; i += step) {
			indices.push(i);
		}
		if (indices[indices.length - 1] !== originalLen - 1) {
			indices.push(originalLen - 1);
		}

		const configs = [
			{
				key: 'speeds' as const,
				id: 'speed',
				label: 'Speed',
				unit: 'mph',
				color: '#06b6d4',
				fillGradient: 'url(#grad-speed)',
				transform: (v: number) => Number((v * 2.23694).toFixed(1)),
				getMinMax: (vals: number[]) => {
					const max = Math.max(...vals);
					return { min: 0, max: max * 1.15 || 20 };
				},
				format: (v: number) => `${v.toFixed(1)} mph`
			},
			{
				key: 'cadence' as const,
				id: 'cadence',
				label: 'Cadence',
				unit: 'rpm',
				color: '#a855f7',
				fillGradient: 'url(#grad-cadence)',
				transform: (v: number) => v,
				getMinMax: (vals: number[]) => {
					const max = Math.max(...vals);
					return { min: 0, max: Math.max(max * 1.1, 120) };
				},
				format: (v: number) => `${v} rpm`
			},
			{
				key: 'altitudes' as const,
				id: 'altitude',
				label: 'Elevation',
				unit: 'ft',
				color: '#10b981',
				fillGradient: 'url(#grad-elevation)',
				transform: (v: number) => Math.round(v * 3.28084),
				getMinMax: (vals: number[]) => {
					const min = Math.min(...vals);
					const max = Math.max(...vals);
					return {
						min: Math.max(0, min - (max - min) * 0.1),
						max: max + (max - min) * 0.1 || min + 10
					};
				},
				format: (v: number) => `${v.toLocaleString()} ft`
			},
			{
				key: 'heartrate' as const,
				id: 'heartrate',
				label: 'Heart Rate',
				unit: 'bpm',
				color: '#f43f5e',
				fillGradient: 'url(#grad-heartrate)',
				transform: (v: number) => v,
				getMinMax: (vals: number[]) => {
					const min = Math.min(...vals);
					const max = Math.max(...vals);
					return {
						min: Math.max(0, min - 10),
						max: max + 10 || 180
					};
				},
				format: (v: number) => `${v} bpm`
			},
			{
				key: 'watts' as const,
				id: 'watts',
				label: 'Power',
				unit: 'W',
				color: '#f59e0b',
				fillGradient: 'url(#grad-watts)',
				transform: (v: number) => v,
				getMinMax: (vals: number[]) => {
					const max = Math.max(...vals);
					return { min: 0, max: max * 1.15 || 300 };
				},
				format: (v: number) => `${v} W`
			}
		];

		const panels: ChartPanel[] = [];

		for (const conf of configs) {
			const streamData = streams[conf.key];
			if (streamData && streamData.length === originalLen) {
				const values = indices.map((idx) => conf.transform(streamData[idx]));
				const { min, max } = conf.getMinMax(values);
				panels.push({
					id: conf.id,
					label: conf.label,
					unit: conf.unit,
					color: conf.color,
					fillGradient: conf.fillGradient,
					values,
					min,
					max,
					format: conf.format
				});
			}
		}

		return { panels, originalIndices: indices };
	});

	let containerEl: HTMLElement | null = $state(null);
	let localHoveredSubIndex: number | null = $state(null);
	let hoverXPercent = $state(0);

	function handleMouseMove(e: MouseEvent) {
		if (!containerEl || processedData.panels.length === 0) return;

		const rect = containerEl.getBoundingClientRect();
		const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
		const pct = x / rect.width;

		const subLen = processedData.originalIndices.length;
		const subIdx = Math.max(0, Math.min(Math.round(pct * (subLen - 1)), subLen - 1));

		localHoveredSubIndex = subIdx;
		hoverXPercent = pct * 100;

		hoveredIndex = processedData.originalIndices[subIdx];
	}

	function handleMouseLeave() {
		localHoveredSubIndex = null;
		hoveredIndex = null;
	}

	function formatTime(sec: number): string {
		const h = Math.floor(sec / 3600);
		const m = Math.floor((sec % 3600) / 60);
		const s = sec % 60;
		const pad = (n: number) => String(n).padStart(2, '0');
		if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
		return `${m}:${pad(s)}`;
	}

	function generatePath(
		panel: ChartPanel,
		width: number,
		height: number
	): { line: string; area: string } {
		const vals = panel.values;
		const len = vals.length;
		if (len < 2) return { line: '', area: '' };

		const points = vals.map((val, i) => {
			const x = (i / (len - 1)) * width;
			const y = height - ((val - panel.min) / (panel.max - panel.min)) * height;
			return { x, y };
		});

		const linePath = points
			.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
			.join(' ');

		const areaPath = `${linePath} L${width.toFixed(1)},${height.toFixed(1)} L0,${height.toFixed(1)} Z`;

		return { line: linePath, area: areaPath };
	}

	const width = 1000;
	const panelHeight = 120;
</script>

{#if processedData.panels.length === 0}
	<div
		class="flex h-64 flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/40 text-neutral-500"
	>
		<svg
			class="mb-2 h-10 w-10 text-neutral-700"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="1.5"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M11.25 11.25l.041-.02a.75.75 0 111.085 1.085l-.04.04m-1.085 1.085l.04-.04a.75.75 0 111.085 1.085l-.041.02m-2.17-2.17a9 9 0 1112.73 12.73 9 9 0 01-12.73-12.73z"
			/>
		</svg>
		<p class="text-sm">No telemetry stream data available to graph</p>
	</div>
{:else}
	<div
		bind:this={containerEl}
		class="relative flex flex-col gap-5 select-none"
		onmousemove={handleMouseMove}
		onmouseleave={handleMouseLeave}
		role="presentation"
	>
		<svg class="absolute h-0 w-0">
			<defs>
				<linearGradient id="grad-elevation" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#10b981" stop-opacity="0.3" />
					<stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
				</linearGradient>
				<linearGradient id="grad-speed" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#06b6d4" stop-opacity="0.3" />
					<stop offset="100%" stop-color="#06b6d4" stop-opacity="0.0" />
				</linearGradient>
				<linearGradient id="grad-heartrate" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#f43f5e" stop-opacity="0.3" />
					<stop offset="100%" stop-color="#f43f5e" stop-opacity="0.0" />
				</linearGradient>
				<linearGradient id="grad-watts" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#f59e0b" stop-opacity="0.3" />
					<stop offset="100%" stop-color="#f59e0b" stop-opacity="0.0" />
				</linearGradient>
				<linearGradient id="grad-cadence" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#a855f7" stop-opacity="0.3" />
					<stop offset="100%" stop-color="#a855f7" stop-opacity="0.0" />
				</linearGradient>
			</defs>
		</svg>

		<!-- Stacked SVG Chart Panels -->
		{#each processedData.panels as panel (panel.id)}
			{@const paths = generatePath(panel, width, panelHeight)}
			<div
				class="relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 shadow-inner backdrop-blur-sm transition-all duration-300 hover:border-neutral-700"
			>
				<!-- Header info -->
				<div class="absolute top-3 left-4 z-10 flex items-baseline gap-2">
					<span class="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
						{panel.label}
					</span>
					{#if localHoveredSubIndex !== null}
						<span class="text-sm font-semibold tabular-nums" style="color: {panel.color}">
							{panel.format(panel.values[localHoveredSubIndex])}
						</span>
					{/if}
				</div>

				<!-- Grid Y-axis tags (only min/max for minimal aesthetics) -->
				<div class="absolute top-3 right-4 text-[10px] font-medium text-neutral-600 tabular-nums">
					MAX {Math.round(panel.max)}
					{panel.unit}
				</div>
				<div
					class="absolute right-4 bottom-4 text-[10px] font-medium text-neutral-600 tabular-nums"
				>
					MIN {Math.round(panel.min)}
					{panel.unit}
				</div>

				<!-- Chart SVG -->
				<div class="w-full pt-6">
					<svg
						viewBox="0 0 {width} {panelHeight}"
						class="w-full overflow-visible"
						height={panelHeight}
					>
						<!-- Subtle horizontal grid lines -->
						<line
							x1="0"
							y1={panelHeight * 0.25}
							x2={width}
							y2={panelHeight * 0.25}
							stroke="#262626"
							stroke-dasharray="3,6"
							stroke-width="1"
						/>
						<line
							x1="0"
							y1={panelHeight * 0.5}
							x2={width}
							y2={panelHeight * 0.5}
							stroke="#262626"
							stroke-dasharray="3,6"
							stroke-width="1"
						/>
						<line
							x1="0"
							y1={panelHeight * 0.75}
							x2={width}
							y2={panelHeight * 0.75}
							stroke="#262626"
							stroke-dasharray="3,6"
							stroke-width="1"
						/>

						<!-- Filled area path -->
						<path d={paths.area} fill={panel.fillGradient} />

						<!-- Line path -->
						<path
							d={paths.line}
							fill="none"
							stroke={panel.color}
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>

						<!-- Active hovering indicator circle -->
						{#if localHoveredSubIndex !== null}
							{@const hVal = panel.values[localHoveredSubIndex]}
							{@const hX = (localHoveredSubIndex / (panel.values.length - 1)) * width}
							{@const hY =
								panelHeight - ((hVal - panel.min) / (panel.max - panel.min)) * panelHeight}

							<!-- Pulse glow -->
							<circle
								cx={hX}
								cy={hY}
								r="7"
								fill={panel.color}
								opacity="0.3"
								class="transition-all duration-75"
							/>
							<!-- Center core -->
							<circle
								cx={hX}
								cy={hY}
								r="4.5"
								fill="#ffffff"
								stroke={panel.color}
								stroke-width="2.5"
								class="transition-all duration-75"
							/>
						{/if}
					</svg>
				</div>
			</div>
		{/each}

		<!-- Sync cursor and floating global timeline tooltip overlay -->
		{#if localHoveredSubIndex !== null}
			<!-- Vertical Sync Line spanning all charts -->
			<div
				class="pointer-events-none absolute top-0 bottom-0 w-[1.5px] border-l border-dashed border-neutral-400 opacity-40 transition-all duration-75"
				style="left: {hoverXPercent}%"
			></div>

			<!-- Dynamic global floating time popup card -->
			{@const rawSeconds = streams.time_offsets[hoveredIndex ?? 0]}
			<div
				class="pointer-events-none absolute top-[-34px] z-30 -translate-x-1/2 rounded-md border border-neutral-700 bg-neutral-900/90 px-2 py-1 text-xs font-semibold text-neutral-200 tabular-nums shadow-md backdrop-blur-sm transition-all duration-75"
				style="left: {hoverXPercent}%"
			>
				⏱️ {formatTime(rawSeconds)}
			</div>
		{/if}
	</div>
{/if}
