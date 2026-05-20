<script lang="ts">
	import { resolve } from '$app/paths';

	interface Props {
		activity: any;
	}

	let { activity }: Props = $props();
</script>

<div class="mb-6">
	<a
		href={resolve('/activities')}
		class="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 text-xs font-semibold text-neutral-400 transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-800 hover:text-neutral-200"
	>
		<svg
			class="h-4 w-4 transition-transform group-hover:-translate-x-1"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
		</svg>
		Back to activities
	</a>
</div>

<header class="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
	<div>
		<div class="flex items-center gap-2">
			<span class="text-xs text-neutral-500">
				{activity.startDate} · {activity.startTime}
			</span>
		</div>
		<h1 class="mt-2 text-3xl font-extrabold tracking-tight text-neutral-50 md:text-4xl">
			{activity.title}
		</h1>
	</div>
</header>
