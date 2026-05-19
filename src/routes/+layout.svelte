<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	import Navbar from '$lib/components/navbar/Navbar.svelte';
	let { children, data } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="flex min-h-screen w-full bg-neutral-950 text-neutral-100">
	<Navbar session={data.session} />

	<main class="flex-1 p-6">
		{@render children()}
	</main>
</div>
