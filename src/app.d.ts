import type { Session } from '@auth/core/types';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth: () => Promise<Session | null>;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module '@auth/core/types' {
	interface Session {
		accessToken?: string;
		refreshToken?: string;
		expiresAt?: number;
		scope?: string;
		stravaAthleteId?: string;
		error?: string;
	}
}

declare module '@auth/core/jwt' {
	interface JWT {
		accessToken?: string;
		refreshToken?: string;
		expiresAt?: number;
		scope?: string;
		stravaAthleteId?: string;
		error?: string;
	}
}

export {};
