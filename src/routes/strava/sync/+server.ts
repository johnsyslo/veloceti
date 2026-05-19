import { json } from '@sveltejs/kit';
import { getDefaultAfterSeconds, syncStravaActivities } from '$lib/server/strava/sync';

export async function POST({ locals, url }) {
	const session = await locals.auth();

	if (!session) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	if (!session.stravaAthleteId) {
		return json({ error: 'Strava athlete id missing from session' }, { status: 400 });
	}

	const perPageRaw = Number(url.searchParams.get('per_page') ?? '50');
	const perPage = Number.isFinite(perPageRaw) ? Math.min(Math.max(perPageRaw, 1), 200) : 50;
	const afterRaw = url.searchParams.get('after');
	let afterSeconds = afterRaw ? Number(afterRaw) : null;

	if (!afterSeconds || !Number.isFinite(afterSeconds)) {
		afterSeconds = await getDefaultAfterSeconds(session.stravaAthleteId);
	}

	try {
		const result = await syncStravaActivities({
			athleteId: session.stravaAthleteId,
			perPage,
			afterSeconds
		});
		return json(result);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Sync failed';
		if (message === 'User not found') {
			return json({ error: message }, { status: 404 });
		}
		if (message === 'Strava tokens missing for user') {
			return json({ error: message }, { status: 400 });
		}
		if (message.startsWith('Strava activities fetch failed')) {
			return json({ error: message }, { status: 502 });
		}
		if (message.startsWith('Token refresh failed')) {
			return json({ error: message }, { status: 502 });
		}
		return json({ error: message }, { status: 500 });
	}
}
