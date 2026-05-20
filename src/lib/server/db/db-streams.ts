import { sql } from './index';

export interface ActivityStreams {
	activity_id: number;
	time_offsets: number[];
	latitudes: number[] | null;
	longitudes: number[] | null;
	speeds: number[] | null;
	altitudes: number[] | null;
	cadence: number[] | null;
	watts: number[] | null;
	heartrate: number[] | null;
}

export async function getActivityStreams(activityId: number): Promise<ActivityStreams | null> {
	try {
		const rows = await sql<ActivityStreams[]>`
			SELECT
				activity_id,
				time_offsets,
				latitudes,
				longitudes,
				speeds,
				altitudes,
				cadence,
				watts,
				heartrate
			FROM activity_streams
			WHERE activity_id = ${activityId}
		`;

		if (rows.length === 0) {
			return null;
		}

		return rows[0];
	} catch (error) {
		console.error('Failed to get activity streams from database:', error);
		return null;
	}
}

export async function saveActivityStreams(
	activityId: number,
	streams: Omit<ActivityStreams, 'activity_id'>
): Promise<void> {
	try {
		await sql.begin(async (tx) => {
			// Delete existing streams for this activity to avoid duplicates,
			// ensuring safety even without a unique constraint on activity_id.
			await tx`
				DELETE FROM activity_streams
				WHERE activity_id = ${activityId}
			`;

			await tx`
				INSERT INTO activity_streams (
					activity_id,
					time_offsets,
					latitudes,
					longitudes,
					speeds,
					altitudes,
					cadence,
					watts,
					heartrate
				) VALUES (
					${activityId},
					${streams.time_offsets},
					${streams.latitudes},
					${streams.longitudes},
					${streams.speeds},
					${streams.altitudes},
					${streams.cadence},
					${streams.watts},
					${streams.heartrate}
				)
			`;
		});
	} catch (error) {
		console.error('Failed to save activity streams to database:', error);
		throw error;
	}
}
