import { fail, redirect } from '@sveltejs/kit';
import { formatDuration, metersToMiles } from '$lib/format';
import { sql } from '$lib/server/db';
import { getDefaultAfterSeconds, syncStravaActivities } from '$lib/server/strava/sync';
import { syncErrorStatus, toPublicSyncError } from '$lib/server/strava/sync-errors';
import type { Actions, PageServerLoad } from './$types';

const RECENT_LIMIT = 2;

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();

	if (!session) {
		throw redirect(303, '/login');
	}

	if (!session.stravaAthleteId) {
		throw redirect(303, '/login');
	}

	const userRows = await sql`
		SELECT id FROM users WHERE strava_athlete_id = ${session.stravaAthleteId}
	`;

	if (userRows.length === 0) {
		throw redirect(303, '/login');
	}

	const userId = userRows[0].id;

	const [statsRows, recentRows] = await Promise.all([
		sql`
			SELECT
				COUNT(*)::int AS ride_count,
				COALESCE(SUM(distance_meters), 0)::float AS total_distance_meters,
				COALESCE(SUM(moving_time_seconds), 0)::int AS total_moving_seconds,
				MAX(start_time) AS latest_ride
			FROM activities
			WHERE user_id = ${userId}
		`,
		sql`
			SELECT id, title, type, distance_meters, moving_time_seconds, start_time
			FROM activities
			WHERE user_id = ${userId}
			ORDER BY start_time DESC
			LIMIT ${RECENT_LIMIT}
		`
	]);

	const stats = statsRows[0];
	const rideCount = Number(stats?.ride_count ?? 0);
	const totalDistanceMeters = Number(stats?.total_distance_meters ?? 0);
	const totalMovingSeconds = Number(stats?.total_moving_seconds ?? 0);
	const latestRide = stats?.latest_ride ? new Date(stats.latest_ride) : null;

	return {
		session,
		summary: {
			rideCount,
			totalDistanceMiles: metersToMiles(totalDistanceMeters),
			totalMovingTime: formatDuration(totalMovingSeconds),
			latestRideDate: latestRide
				? latestRide.toLocaleDateString(undefined, {
						month: 'short',
						day: 'numeric',
						year: 'numeric'
					})
				: null
		},
		recentActivities: recentRows.map((a) => ({
			id: a.id,
			title: a.title,
			type: a.type,
			distanceMiles: metersToMiles(a.distance_meters),
			duration: formatDuration(a.moving_time_seconds),
			startDate: new Date(a.start_time).toLocaleDateString(undefined, {
				month: 'short',
				day: 'numeric'
			})
		}))
	};
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
