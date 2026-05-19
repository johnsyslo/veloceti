import { redirect } from '@sveltejs/kit';
import { sql } from '$lib/server/db';
import type { PageServerLoad } from './$types';

const ITEMS_PER_PAGE = 20;

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await locals.auth();

	if (!session?.stravaAthleteId) {
		throw redirect(303, '/login');
	}

	const userRows = await sql`
		SELECT id FROM users WHERE strava_athlete_id = ${session.stravaAthleteId}
	`;

	if (userRows.length === 0) {
		throw redirect(303, '/login');
	}

	const userId = userRows[0].id;
	const pageParam = url.searchParams.get('page');
	const page = pageParam ? Math.max(Number(pageParam), 1) : 1;
	const offset = (page - 1) * ITEMS_PER_PAGE;

	const totalRows = await sql`
		SELECT COUNT(*) as count FROM activities WHERE user_id = ${userId}
	`;
	const totalCount = totalRows[0].count ?? 0;
	const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

	const activities = await sql`
		SELECT
			id,
			title,
			type,
			distance_meters,
			moving_time_seconds,
			elapsed_time_seconds,
			avg_speed_mps,
			max_speed_mps,
			total_elevation_gain,
			start_time
		FROM activities
		WHERE user_id = ${userId}
		ORDER BY start_time DESC
		LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
	`;

	return {
		activities: activities.map((a) => ({
			...a,
			distanceMiles: (a.distance_meters / 1609.34).toFixed(2),
			movingTimeMinutes: Math.floor(a.moving_time_seconds / 60),
			movingTimeHours: Math.floor(a.moving_time_seconds / 3600),
			avgSpeedMph: (a.avg_speed_mps * 2.23694).toFixed(2),
			maxSpeedMph: a.max_speed_mps ? (a.max_speed_mps * 2.23694).toFixed(2) : null,
			elevationGainFt: a.total_elevation_gain
				? (a.total_elevation_gain * 3.28084).toFixed(0)
				: null,
			startDate: new Date(a.start_time).toLocaleDateString(),
			startTime: new Date(a.start_time).toLocaleTimeString()
		})),
		page,
		totalPages,
		totalCount
	};
};
