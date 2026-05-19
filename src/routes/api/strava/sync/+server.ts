import { json } from '@sveltejs/kit';
import { getDefaultAfterSeconds, syncStravaActivities } from '$lib/server/strava/sync';

export async function POST({ url }) {
	const athleteId = url.searchParams.get('strava_athlete_id')?.trim();

	if (!athleteId) {
		return json({ error: 'strava_athlete_id is required' }, { status: 400 });
	}

	const perPageRaw = Number(url.searchParams.get('per_page') ?? '50');
	const perPage = Number.isFinite(perPageRaw) ? Math.min(Math.max(perPageRaw, 1), 200) : 50;
	const afterRaw = url.searchParams.get('after');
	let afterSeconds = afterRaw ? Number(afterRaw) : null;

	if (!afterSeconds || !Number.isFinite(afterSeconds)) {
		afterSeconds = await getDefaultAfterSeconds(athleteId);
	}

	try {
		const result = await syncStravaActivities({ athleteId, perPage, afterSeconds });
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
