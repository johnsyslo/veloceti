import { json } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { env } from '$env/dynamic/private';
import { handle as authHandle } from './auth';
import type { Handle } from '@sveltejs/kit';

const programApiKey = env.INTERNAL_API_KEY?.trim() ?? '';

/** Routes that authenticate inside the handler (session or API key). */
const SELF_AUTH_API_PATHS = new Set(['/api/strava/sync']);

const PUBLIC_API_PATHS = new Set(['/api/health']);

const apiGuard: Handle = async ({ event, resolve }) => {
	if (!event.url.pathname.startsWith('/api')) {
		return resolve(event);
	}

	if (PUBLIC_API_PATHS.has(event.url.pathname) || SELF_AUTH_API_PATHS.has(event.url.pathname)) {
		return resolve(event);
	}

	if (!programApiKey) {
		return resolve(event);
	}

	const providedApiKey = event.request.headers.get('x-api-key');
	if (providedApiKey === programApiKey) {
		return resolve(event);
	}

	return json({ error: 'Forbidden' }, { status: 403 });
};

export const handle = sequence(authHandle, apiGuard);
