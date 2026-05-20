<script lang="ts">
	interface Props {
		label: string;
		value: string | number | null | undefined;
		unit?: string;
		size?: 'sm' | 'md';
	}

	let { label, value, unit, size = 'md' }: Props = $props();
</script>

<div class="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
	<p class="text-xs font-medium tracking-wide text-neutral-500 uppercase">{label}</p>
	<p class="mt-1 font-semibold text-neutral-100 tabular-nums {size === 'sm' ? 'text-xl' : 'text-2xl'}">
		{value ?? '—'}
		{#if value != null && unit}
			<span class="text-sm font-normal text-neutral-500">{unit}</span>
		{/if}
	</p>
</div>
