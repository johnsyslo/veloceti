import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { sql } from '$lib/server/db';

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.auth();
	const url = new URL(event.request.url);

	if (!session && url.pathname !== '/login') {
		throw redirect(303, '/login');
	}

	if (session && (url.pathname === '/login' || url.pathname === '/')) {
		throw redirect(303, '/dashboard');
	}

	let postgisVersion = 'Unknown';
	try {
		const result = await Promise.race([
			sql`SELECT PostGIS_version();`,
			new Promise((_, reject) => setTimeout(() => reject(new Error('DB query timeout')), 5000))
		]);
		if (Array.isArray(result) && result.length > 0) {
			postgisVersion = result[0].postgis_version;
		}
	} catch (error) {
		console.error('PostGIS Connection Failed:', error);
	}

	return {
		session,
		postgisVersion
	};
};
