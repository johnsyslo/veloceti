import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.auth();
	const url = new URL(event.request.url);

	if (!session && url.pathname !== '/login') {
		throw redirect(303, '/login');
	}

	if (session && (url.pathname === '/login' || url.pathname === '/')) {
		throw redirect(303, '/dashboard');
	}

	return { session };
};
