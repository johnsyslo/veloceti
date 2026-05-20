export function syncErrorStatus(message: string): number {
	if (message === 'User not found') return 404;
	if (message === 'Strava tokens missing for user') return 400;
	if (message.startsWith('Strava activities fetch failed')) return 502;
	if (message.startsWith('Token refresh failed')) return 502;
	return 500;
}

export function toPublicSyncError(message: string): string {
	if (message === 'User not found') return 'User not found';
	if (message === 'Strava tokens missing for user') return 'Strava account is not connected';
	if (message.startsWith('Strava activities fetch failed')) {
		return 'Could not fetch activities from Strava';
	}
	if (message.startsWith('Token refresh failed')) {
		return 'Could not refresh your Strava connection';
	}
	return 'Sync failed';
}
