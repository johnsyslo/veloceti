<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';

	import Navbar from '$lib/components/navbar/Navbar.svelte';
	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Veloceti</title>
	<meta name="title" content="Veloceti" />
	<meta
		name="description"
		content="A cycling analytics platform for athletes who want a deeper look into their data."
	/>

	<meta property="og:title" content="Veloceti" />
	<meta
		property="og:description"
		content="A cycling analytics platform for athletes who want a deeper look into their data."
	/>
</svelte:head>
<div class="flex min-h-screen w-full text-neutral-100">
	<Navbar session={data.session} />

	<main class="ml-64 flex-1 p-6">
		{@render children()}
	</main>
</div>
