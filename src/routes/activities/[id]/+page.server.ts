import { error, redirect } from '@sveltejs/kit';
import { formatDuration, metersToMiles } from '$lib/format';
import { sql } from '$lib/server/db';
import { getActivityStreams, saveActivityStreams } from '$lib/server/db/db-streams';
import { fetchStravaActivityStreams } from '$lib/server/strava/streams';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
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
	const activityId = Number(params.id);

	if (isNaN(activityId)) {
		throw error(400, 'Invalid activity ID');
	}

	// 1. Load activity from database
	const activityRows = await sql`
		SELECT
			id,
			user_id,
			strava_activity_id,
			title,
			type,
			start_time,
			distance_meters,
			moving_time_seconds,
			elapsed_time_seconds,
			avg_speed_mps,
			max_speed_mps,
			total_elevation_gain,
			summary_polyline
		FROM activities
		WHERE id = ${activityId} AND user_id = ${userId}
	`;

	if (activityRows.length === 0) {
		throw error(404, 'Activity not found');
	}

	const activity = activityRows[0];

	// 2. Load streams (on-demand database caching)
	let streams = await getActivityStreams(activity.id);

	if (!streams && activity.strava_activity_id) {
		try {
			// Fetch from Strava API
			const fetchedStreams = await fetchStravaActivityStreams(
				userId,
				BigInt(activity.strava_activity_id)
			);

			// Cache in database
			await saveActivityStreams(activity.id, fetchedStreams);

			// Reload from database to ensure consistent structure
			streams = await getActivityStreams(activity.id);
		} catch (err) {
			console.error(`Failed on-demand sync of streams for activity ${activity.id}:`, err);
			// We can proceed without streams, falling back to null
		}
	}

	// Calculate summary stats from streams for visual badges if streams are present
	const hrStats = streams?.heartrate ? calculateSeriesStats(streams.heartrate) : null;
	const powerStats = streams?.watts ? calculateSeriesStats(streams.watts) : null;
	const cadenceStats = streams?.cadence ? calculateSeriesStats(streams.cadence) : null;
	const speedStats = streams?.speeds
		? calculateSeriesStats(streams.speeds.map((s) => s * 2.23694)) // Convert to mph
		: null;

	const formattedActivity = {
		id: activity.id,
		title: activity.title,
		type: activity.type,
		distanceMiles: metersToMiles(activity.distance_meters),
		duration: formatDuration(activity.moving_time_seconds),
		elapsedTime: formatDuration(activity.elapsed_time_seconds),
		avgSpeedMph: (activity.avg_speed_mps * 2.23694).toFixed(1),
		maxSpeedMph: activity.max_speed_mps
			? (activity.max_speed_mps * 2.23694).toFixed(1)
			: speedStats
				? speedStats.max.toFixed(1)
				: null,
		elevationGainFt: activity.total_elevation_gain
			? (activity.total_elevation_gain * 3.28084).toFixed(0)
			: null,
		startDate: new Date(activity.start_time).toLocaleDateString(undefined, {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}),
		startTime: new Date(activity.start_time).toLocaleTimeString(undefined, {
			hour: '2-digit',
			minute: '2-digit'
		}),
		summaryPolyline: activity.summary_polyline
	};

	return {
		activity: formattedActivity,
		streams,
		analytics: {
			heartrate: hrStats,
			power: powerStats,
			cadence: cadenceStats,
			speed: speedStats
		}
	};
};

function calculateSeriesStats(series: number[]) {
	if (series.length === 0) return null;
	const nonZero = series.filter((v) => v > 0);
	const sum = series.reduce((a, b) => a + b, 0);
	const avg = sum / series.length;
	const activeAvg = nonZero.length > 0 ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length : avg;
	const max = Math.max(...series);
	const min = Math.min(...series);

	return {
		avg: Math.round(avg),
		activeAvg: Math.round(activeAvg),
		max: Math.round(max),
		min: Math.round(min)
	};
}
