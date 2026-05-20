import { json } from '@sveltejs/kit';
import { verifyApiKey } from '$lib/server/security/api-key';
import {
	getDefaultAfterSeconds,
	syncStravaActivities
} from '$lib/server/strava/sync';
import { syncErrorStatus, toPublicSyncError } from '$lib/server/strava/sync-errors';

export async function POST({ url, request }) {
	if (!verifyApiKey(request.headers.get('x-api-key'))) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

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
		console.error('Strava sync failed:', error);
		return json({ error: toPublicSyncError(message) }, { status: syncErrorStatus(message) });
	}
}
