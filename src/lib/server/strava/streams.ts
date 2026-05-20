import { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET } from '$env/static/private';
import { sql } from '$lib/server/db';

type StravaStreamResponse = {
	time?: { data: number[] };
	latlng?: { data: [number, number][] };
	velocity_smooth?: { data: number[] };
	altitude?: { data: number[] };
	cadence?: { data: number[] };
	watts?: { data: number[] };
	heartrate?: { data: number[] };
};

type RefreshedToken = {
	access_token: string;
	refresh_token: string;
	expires_at: number;
};

function isExpired(expiresAt: number | null): boolean {
	if (!expiresAt) return true;
	const nowSeconds = Math.floor(Date.now() / 1000);
	return nowSeconds >= expiresAt - 60; // Refresh 60 seconds before expiration
}

async function refreshStravaToken(refreshToken: string): Promise<RefreshedToken> {
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

	return (await response.json()) as RefreshedToken;
}

export async function getValidAccessToken(userId: number): Promise<string> {
	const userRows = await sql`
		SELECT access_token, refresh_token, expires_at
		FROM users
		WHERE id = ${userId}
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
			WHERE id = ${userId}
		`;
	}

	return accessToken;
}

export async function fetchStravaActivityStreams(
	userId: number,
	stravaActivityId: bigint | number
) {
	const accessToken = await getValidAccessToken(userId);

	const url = `https://www.strava.com/api/v3/activities/${stravaActivityId}/streams?keys=time,latlng,altitude,velocity_smooth,heartrate,cadence,watts&key_by_type=true`;

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Strava streams API returned ${response.status}: ${text}`);
	}

	const data = (await response.json()) as StravaStreamResponse;

	// Extract and map arrays
	const time_offsets = data.time?.data ?? [];
	if (time_offsets.length === 0) {
		throw new Error('Activity stream has no time data');
	}

	const latitudes: number[] = [];
	const longitudes: number[] = [];
	if (data.latlng?.data) {
		for (const [lat, lng] of data.latlng.data) {
			latitudes.push(lat);
			longitudes.push(lng);
		}
	}

	return {
		time_offsets,
		latitudes: latitudes.length > 0 ? latitudes : null,
		longitudes: longitudes.length > 0 ? longitudes : null,
		speeds: data.velocity_smooth?.data ?? null,
		altitudes: data.altitude?.data ?? null,
		cadence: data.cadence?.data ?? null,
		watts: data.watts?.data ?? null,
		heartrate: data.heartrate?.data ?? null
	};
}
