import { json } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { env } from '$env/dynamic/private';
import { handle as authHandle } from './auth';
import type { Handle } from '@sveltejs/kit';

const programApiKey = env.INTERNAL_API_KEY?.trim() ?? '';

const apiGuard: Handle = async ({ event, resolve }) => {
	if (!event.url.pathname.startsWith('/api')) {
		return resolve(event);
	}

	const providedApiKey = event.request.headers.get('x-api-key');
	if (programApiKey && providedApiKey === programApiKey) {
		return resolve(event);
	}

	return json({ error: 'Forbidden' }, { status: 403 });
};

export const handle = sequence(authHandle, apiGuard);
