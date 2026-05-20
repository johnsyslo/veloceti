<script lang="ts">
	interface Props {
		title: string;
		subtitle?: string;
		children?: import('svelte').Snippet;
	}

	let { title, subtitle, children }: Props = $props();
</script>

<header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
	<div>
		<h1 class="text-3xl font-semibold tracking-tight text-neutral-50">{title}</h1>
		{#if subtitle}
			<p class="mt-1 text-neutral-500">{subtitle}</p>
		{/if}
	</div>
	{#if children}
		{@render children()}
	{/if}
</header>
