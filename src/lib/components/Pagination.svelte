<script lang="ts">
	import { resolve } from '$app/paths';

	interface Props {
		page: number;
		totalPages: number;
		baseHref: string;
	}

	let { page, totalPages, baseHref }: Props = $props();
</script>

{#if totalPages > 1}
	<nav class="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
		{#if page > 1}
			<a
				href={resolve(`${baseHref}?page=${page - 1}`)}
				class="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:border-neutral-600 hover:bg-neutral-800"
			>
				Previous
			</a>
		{:else}
			<span class="rounded-lg border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-600">
				Previous
			</span>
		{/if}

		<span class="px-2 text-sm text-neutral-500">{page} / {totalPages}</span>

		{#if page < totalPages}
			<a
				href={resolve(`${baseHref}?page=${page + 1}`)}
				class="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:border-neutral-600 hover:bg-neutral-800"
			>
				Next
			</a>
		{:else}
			<span class="rounded-lg border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-600">
				Next
			</span>
		{/if}
	</nav>
{/if}
