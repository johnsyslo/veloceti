import { fail, redirect } from '@sveltejs/kit';
import { getDefaultAfterSeconds, syncStravaActivities } from '$lib/server/strava/sync';
import { syncErrorStatus, toPublicSyncError } from '$lib/server/strava/sync-errors';
import type { Actions } from './$types';

export const load = async ({ locals }) => {
	const session = await locals.auth();

	if (!session) {
		throw redirect(303, '/login');
	}

	return { session };
};

export const actions: Actions = {
	sync: async ({ locals }) => {
		const session = await locals.auth();

		if (!session?.stravaAthleteId) {
			return fail(401, { error: 'Not authenticated' });
		}

		try {
			const afterSeconds = await getDefaultAfterSeconds(session.stravaAthleteId);
			const result = await syncStravaActivities({
				athleteId: session.stravaAthleteId,
				perPage: 50,
				afterSeconds
			});

			return { success: true, synced: result.synced, upserted: result.upserted };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Sync failed';
			console.error('Strava sync failed:', error);
			return fail(syncErrorStatus(message), { error: toPublicSyncError(message) });
		}
	}
};
