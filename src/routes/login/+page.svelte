<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
</script>

<div class="login-container">
	<h1>Welcome to Veloceti</h1>
	<p>Connect your account to begin analyzing your ride data.</p>

	<button onclick={() => signIn('strava')}> Login with Strava </button>
</div>
