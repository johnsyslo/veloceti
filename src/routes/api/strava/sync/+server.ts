import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { Session } from '@auth/core/types';
import {
	getDefaultAfterSeconds,
	syncErrorStatus,
	syncStravaActivities
} from '$lib/server/strava/sync';

function resolveAthleteId(
	session: Session | null,
	url: URL,
	request: Request
): { athleteId: string } | { error: string; status: number } {
	if (session?.stravaAthleteId) {
		return { athleteId: session.stravaAthleteId };
	}

	const athleteId = url.searchParams.get('strava_athlete_id')?.trim();
	if (!athleteId) {
		return { error: 'Not authenticated. Provide strava_athlete_id or sign in.', status: 401 };
	}

	const configuredKey = env.INTERNAL_API_KEY?.trim() ?? '';
	if (configuredKey && request.headers.get('x-api-key') !== configuredKey) {
		return { error: 'Forbidden', status: 403 };
	}

	return { athleteId };
}

export async function POST({ locals, url, request }) {
	const session = await locals.auth();
	const resolved = resolveAthleteId(session, url, request);

	if ('error' in resolved) {
		return json({ error: resolved.error }, { status: resolved.status });
	}

	const perPageRaw = Number(url.searchParams.get('per_page') ?? '50');
	const perPage = Number.isFinite(perPageRaw) ? Math.min(Math.max(perPageRaw, 1), 200) : 50;
	const afterRaw = url.searchParams.get('after');
	let afterSeconds = afterRaw ? Number(afterRaw) : null;

	if (!afterSeconds || !Number.isFinite(afterSeconds)) {
		afterSeconds = await getDefaultAfterSeconds(resolved.athleteId);
	}

	try {
		const result = await syncStravaActivities({
			athleteId: resolved.athleteId,
			perPage,
			afterSeconds
		});
		return json(result);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Sync failed';
		return json({ error: message }, { status: syncErrorStatus(message) });
	}
}
