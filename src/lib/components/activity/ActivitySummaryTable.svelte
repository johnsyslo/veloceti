<script lang="ts">
	import summarySchema from './summary-schema.json';

	interface Props {
		activity: any;
		analytics: any;
	}

	let { activity, analytics }: Props = $props();

	function getPathValue(obj: any, path: string): any {
		const parts = path.split('.');
		let current = obj;
		for (const part of parts) {
			if (current === null || current === undefined) return null;
			current = current[part];
		}
		return current;
	}

	const sections = $derived(
		summarySchema.map((section) => ({
			title: section.title,
			items: section.items.map((item) => {
				const val = getPathValue({ activity, analytics }, item.path);
				return {
					label: item.label,
					value: val !== null && val !== undefined ? `${val}${item.suffix}` : '—'
				};
			})
		}))
	);
</script>

<section class="mt-12 rounded-2xl border border-neutral-800 bg-neutral-900/20 p-6 backdrop-blur-sm">
	<h2 class="mb-5 text-lg font-bold text-neutral-100">Ride Analysis Summary</h2>

	<div class="grid grid-cols-1 gap-8 sm:grid-cols-3">
		{#each sections as section}
			<div class="space-y-4">
				<h3 class="text-xs font-extrabold tracking-wider text-emerald-500 uppercase">
					{section.title}
				</h3>
				<dl class="divide-y divide-neutral-800/60">
					{#each section.items as item}
						<div class="flex justify-between py-2.5 text-sm">
							<dt class="text-neutral-500">{item.label}</dt>
							<dd class="font-bold text-neutral-300 tabular-nums">{item.value}</dd>
						</div>
					{/each}
				</dl>
			</div>
		{/each}
	</div>
</section>
