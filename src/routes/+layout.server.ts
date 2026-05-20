import { redirect } from '@sveltejs/kit';
import { sql } from '$lib/server/db';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.auth();
	const url = new URL(event.request.url);

	// Verify if the session user actually exists in the DB
	let userExists = false;
	if (session?.stravaAthleteId) {
		const userRows = await sql`
			SELECT id FROM users WHERE strava_athlete_id = ${session.stravaAthleteId}
		`;
		userExists = userRows.length > 0;
	}

	const hasValidSession = !!session && userExists;

	if (!hasValidSession && url.pathname !== '/login') {
		throw redirect(303, '/login');
	}

	if (hasValidSession && (url.pathname === '/login' || url.pathname === '/')) {
		throw redirect(303, '/dashboard');
	}

	return { session };
};
