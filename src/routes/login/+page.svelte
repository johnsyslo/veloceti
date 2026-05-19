<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
</script>

<div class="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center">
	<div
		class="w-full max-w-md rounded-2xl border transition-all duration-300"
		style="border-color: var(--primary); background-color: var(--quaternary); box-shadow: 0 0 30px rgba(59, 110, 76, 0.2);"
	>
		<div class="p-8">
			<h1 class="mb-2 text-center text-3xl font-bold text-neutral-100">Welcome to Veloceti</h1>
			<p class="mb-8 text-center text-neutral-400">
				Connect your account to begin analyzing your ride data.
			</p>

			<button
				class="w-full rounded-lg px-6 py-3 font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
				style="background-color: var(--primary);"
				onclick={() => signIn('strava')}
			>
				🚴 Login with Strava
			</button>
		</div>
	</div>
</div>
