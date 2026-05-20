<script lang="ts">
	interface Props {
		heading?: string;
		body?: string;
	}

	let { heading = 'No activities yet', body }: Props = $props();
</script>

<div class="rounded-xl border border-dashed border-neutral-800 bg-neutral-900/40 px-8 py-16 text-center">
	<p class="text-lg text-neutral-300">{heading}</p>
	{#if body}
		<p class="mt-2 text-sm text-neutral-500">{body}</p>
	{/if}
</div>
