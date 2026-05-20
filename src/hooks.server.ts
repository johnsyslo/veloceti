import { json } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { handle as authHandle } from './auth';
import { getInternalApiKey, verifyApiKey } from '$lib/server/security/api-key';
import type { Handle } from '@sveltejs/kit';

getInternalApiKey();

const PUBLIC_API_PATHS = new Set(['/api/health']);

const apiGuard: Handle = async ({ event, resolve }) => {
	if (!event.url.pathname.startsWith('/api')) {
		return resolve(event);
	}

	if (PUBLIC_API_PATHS.has(event.url.pathname)) {
		return resolve(event);
	}

	const providedApiKey = event.request.headers.get('x-api-key');
	if (verifyApiKey(providedApiKey)) {
		return resolve(event);
	}

	return json({ error: 'Forbidden' }, { status: 403 });
};

export const handle = sequence(authHandle, apiGuard);
