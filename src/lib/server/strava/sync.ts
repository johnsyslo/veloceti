import { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET } from '$env/static/private';
import { sql } from '$lib/server/db';

type StravaActivity = {
	id: number;
	name: string;
	type: string;
	start_date: string;
	distance: number;
	moving_time: number;
	elapsed_time: number;
	average_speed: number;
	max_speed?: number;
	total_elevation_gain?: number;
	map?: {
		summary_polyline?: string;
	};
};

type TokenResponse = {
	access_token: string;
	refresh_token: string;
	expires_at: number;
};

type SyncOptions = {
	athleteId: string;
	perPage: number;
	afterSeconds: number | null;
};

type SyncResult = {
	synced: number;
	upserted: number;
	pagesFetched: number;
	perPage: number;
	after: number | null;
};

const cyclingTypes = new Set([
	'Ride',
	'VirtualRide',
	'EBikeRide',
	'GravelRide',
	'MountainBikeRide'
]);

function isExpired(expiresAt: number | null) {
	if (!expiresAt) return true;
	const nowSeconds = Math.floor(Date.now() / 1000);
	return nowSeconds >= expiresAt - 60;
}

async function refreshStravaToken(refreshToken: string) {
	const body = new URLSearchParams({
		client_id: STRAVA_CLIENT_ID,
		client_secret: STRAVA_CLIENT_SECRET,
		grant_type: 'refresh_token',
		refresh_token: refreshToken
	});

	const response = await fetch('https://www.strava.com/oauth/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Token refresh failed: ${response.status} ${text}`);
	}

	return (await response.json()) as TokenResponse;
}

export async function getDefaultAfterSeconds(athleteId: string) {
	const latestRows = await sql`
		SELECT EXTRACT(EPOCH FROM MAX(a.start_time))::BIGINT AS last_start
		FROM activities a
		JOIN users u ON u.id = a.user_id
		WHERE u.strava_athlete_id = ${athleteId}
	`;
	const lastStart = latestRows[0]?.last_start;
	if (typeof lastStart === 'number' && Number.isFinite(lastStart)) {
		return Math.floor(lastStart);
	}
	return null;
}

export async function syncStravaActivities(options: SyncOptions): Promise<SyncResult> {
	const { athleteId, perPage, afterSeconds } = options;

	const userRows = await sql`
		SELECT id, access_token, refresh_token, expires_at
		FROM users
		WHERE strava_athlete_id = ${athleteId}
	`;

	if (userRows.length === 0) {
		throw new Error('User not found');
	}

	const user = userRows[0];
	let accessToken = user.access_token ?? null;
	let refreshToken = user.refresh_token ?? null;
	let expiresAt = typeof user.expires_at === 'number' ? user.expires_at : null;

	if (!accessToken || !refreshToken) {
		throw new Error('Strava tokens missing for user');
	}

	if (isExpired(expiresAt)) {
		const refreshed = await refreshStravaToken(refreshToken);
		accessToken = refreshed.access_token;
		refreshToken = refreshed.refresh_token;
		expiresAt = refreshed.expires_at;

		await sql`
			UPDATE users
			SET access_token = ${accessToken},
				refresh_token = ${refreshToken},
				expires_at = ${expiresAt}
			WHERE id = ${user.id}
		`;
	}

	let page = 1;
	let upserted = 0;
	let synced = 0;
	let pagesFetched = 0;

	while (true) {
		const params = new URLSearchParams({
			per_page: String(perPage),
			page: String(page)
		});
		if (afterSeconds && Number.isFinite(afterSeconds)) {
			params.set('after', String(afterSeconds));
		}

		const activitiesResponse = await fetch(
			`https://www.strava.com/api/v3/athlete/activities?${params.toString()}`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			}
		);

		if (!activitiesResponse.ok) {
			const text = await activitiesResponse.text();
			throw new Error(`Strava activities fetch failed: ${activitiesResponse.status} ${text}`);
		}

		const activities = (await activitiesResponse.json()) as StravaActivity[];
		pagesFetched += 1;

		const cyclingActivities = activities.filter((activity) =>
			cyclingTypes.has(activity.type ?? 'Ride')
		);
		synced += cyclingActivities.length;

		for (const activity of cyclingActivities) {
			await sql`
				INSERT INTO activities (
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
					summary_polyline,
					geom_route
				)
				VALUES (
					${user.id},
					${activity.id},
					${activity.name},
					${activity.type ?? 'Ride'},
					${new Date(activity.start_date)},
					${activity.distance},
					${activity.moving_time},
					${activity.elapsed_time},
					${activity.average_speed},
					${activity.max_speed ?? null},
					${activity.total_elevation_gain ?? null},
					${activity.map?.summary_polyline ?? null},
					${null}
				)
				ON CONFLICT (strava_activity_id) DO UPDATE SET
					user_id = EXCLUDED.user_id,
					title = EXCLUDED.title,
					type = EXCLUDED.type,
					start_time = EXCLUDED.start_time,
					distance_meters = EXCLUDED.distance_meters,
					moving_time_seconds = EXCLUDED.moving_time_seconds,
					elapsed_time_seconds = EXCLUDED.elapsed_time_seconds,
					avg_speed_mps = EXCLUDED.avg_speed_mps,
					max_speed_mps = EXCLUDED.max_speed_mps,
					total_elevation_gain = EXCLUDED.total_elevation_gain,
					summary_polyline = EXCLUDED.summary_polyline
			`;
			upserted += 1;
		}

		if (activities.length < perPage) break;
		page += 1;
	}

	return { synced, upserted, pagesFetched, perPage, after: afterSeconds };
}
