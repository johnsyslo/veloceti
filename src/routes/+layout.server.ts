import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './login/$types';
import sql from '$lib/server/db';

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.getSession();
	const url = new URL(event.request.url);

	if (!session && url.pathname === '/dashboard') {
		throw redirect(303, '/login');
	}

	if (session && (url.pathname === '/login' || url.pathname === '/')) {
		throw redirect(303, '/dashboard');
	}

	let postgisVersion = 'Unknown';
	try {
		const result = await sql`SELECT PostGIS_version();`;
		if (result.length > 0) {
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
