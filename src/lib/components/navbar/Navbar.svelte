<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import type { RouteId } from '$app/types';
	import { onMount } from 'svelte';
	import { signOut } from '@auth/sveltekit/client';
	import navLinks from './nav-links.json';

	interface Props {
		session?: {
			user?: {
				name?: string | null;
				email?: string | null;
				image?: string | null;
			};
		} | null;
	}

	let { session }: Props = $props();
	let dbConnected = $state(false);

	onMount(() => {
		const checkConnection = async () => {
			try {
				const response = await fetch('/api/health');
				const data = await response.json();
				dbConnected = data.status === 'connected';
			} catch {
				dbConnected = false;
			}
		};

		void checkConnection();
		const interval = setInterval(() => {
			void checkConnection();
		}, 5000);

		return () => clearInterval(interval);
	});

	const handleLogout = () => {
		signOut();
	};
</script>

<nav class="fixed top-0 left-0 z-50 flex">
	<div class="flex h-screen w-64 flex-col border-r border-neutral-800 bg-neutral-900 px-4 py-4">
		<a
			href={resolve('/dashboard')}
			class="mb-8 px-4 py-2 text-lg font-semibold text-neutral-100 uppercase transition-colors hover:text-white"
		>
			Veloceti<span class={`${dbConnected ? 'text-green-500' : 'animate-pulse text-red-500'}`}
				>.</span
			>
		</a>

		<nav class="space-y-2">
			{#each navLinks as link (link)}
				<a
					href={resolve(link.href as RouteId)}
					class="flex items-center gap-3 rounded-lg px-4 py-2 transition-colors {$page.url
						.pathname === link.href
						? 'bg-blue-600 text-white'
						: 'text-neutral-300 hover:bg-neutral-800'}"
				>
					<span>{link.icon}</span>
					<span>{link.label}</span>
				</a>
			{/each}
		</nav>

		<div class="mt-auto">
			<div class="rounded-lg bg-neutral-800 px-4 py-3">
				<div class="mb-3 flex flex-col items-center gap-2">
					{#if session?.user}
						{#if session.user.image}
							<img
								src={session.user.image}
								alt={session.user.name || 'Profile'}
								class="h-12 w-12 rounded-full object-cover"
							/>
						{:else}
							<div
								class="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-700 text-xl"
							>
								👤
							</div>
						{/if}
						<div class="text-center">
							<p class="text-sm font-semibold text-neutral-100">{session.user.name}</p>
							<p class="text-xs text-neutral-400">{session.user.email}</p>
						</div>
					{:else}
						<div
							class="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-700 text-xl"
						>
							👤
						</div>
						<p class="text-sm text-neutral-400">Not logged in</p>
					{/if}
				</div>
				{#if session?.user}
					<button
						onclick={handleLogout}
						class="block w-full rounded-lg px-4 py-2 text-center text-sm text-white transition-colors"
						style="background-color: var(--primary);"
					>
						Logout
					</button>
				{:else}
					<a
						href={resolve('/login')}
						class="block w-full rounded-lg px-4 py-2 text-center text-sm text-white transition-colors"
						style="background-color: var(--primary);"
					>
						Login
					</a>
				{/if}
			</div>

			<div class="mt-4 px-4 py-2 text-center text-xs text-neutral-500">
				&copy; {new Date().getFullYear()} Veloceti.
			</div>
		</div>
	</div>
</nav>
