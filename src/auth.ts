import { SvelteKitAuth } from '@auth/sveltekit';
import Strava from '@auth/core/providers/strava';
import { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, AUTH_SECRET } from '$env/static/private';
import { sql } from '$lib/server/db';

export const { handle, signIn, signOut } = SvelteKitAuth({
	providers: [
		Strava({
			clientId: STRAVA_CLIENT_ID,
			clientSecret: STRAVA_CLIENT_SECRET,
			authorization: { params: { scope: 'read,activity:read_all' } }
		})
	],
	pages: {
		signIn: '/login'
	},
	secret: AUTH_SECRET,
	trustHost: true,
	callbacks: {
		async jwt({ token, account, profile }) {
			if (account && profile) {
				token.stravaAthleteId = profile.id?.toString();
				token.name = profile.firstname
					? `${profile.firstname} ${profile.lastname ?? ''}`.trim()
					: profile.name;
				token.email = profile.email;
				token.picture =
					typeof profile.profile_medium === 'string' ? profile.profile_medium : undefined;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				if (token.name) session.user.name = token.name;
				if (token.email) session.user.email = token.email;
				if (token.picture) session.user.image = token.picture;
			}
			if (token.stravaAthleteId) {
				session.stravaAthleteId = token.stravaAthleteId;
			}
			return session;
		},
		async signIn({ account, profile }) {
			if (!account || !profile) return false;

			try {
				const firstName = typeof profile.firstname === 'string' ? profile.firstname : undefined;
				const lastName = typeof profile.lastname === 'string' ? profile.lastname : undefined;
				const profileName = typeof profile.name === 'string' ? profile.name : null;
				const profileEmail = typeof profile.email === 'string' ? profile.email : null;
				const profileImage =
					typeof profile.profile_medium === 'string' ? profile.profile_medium : null;
				const athleteId =
					typeof profile.id === 'number' || typeof profile.id === 'string'
						? String(profile.id)
						: null;

				if (!athleteId) return false;

				const name = firstName ? `${firstName}${lastName ? ` ${lastName}` : ''}` : profileName;
				const refreshToken = account.refresh_token ?? null;
				const accessToken = account.access_token ?? null;
				const expiresAt = typeof account.expires_at === 'number' ? account.expires_at : null;
				const scope = account.scope || 'read,activity:read_all';

				await sql`
					INSERT INTO users (name, email, image, strava_athlete_id, refresh_token, access_token, expires_at, scope)
					VALUES (${name}, ${profileEmail}, ${profileImage}, ${athleteId}, ${refreshToken}, ${accessToken}, ${expiresAt}, ${scope})
					ON CONFLICT (strava_athlete_id) DO UPDATE SET
						name = EXCLUDED.name,
						email = EXCLUDED.email,
						image = EXCLUDED.image,
						refresh_token = EXCLUDED.refresh_token,
						access_token = EXCLUDED.access_token,
						expires_at = EXCLUDED.expires_at,
						scope = EXCLUDED.scope
					RETURNING id;
				`;

				return true;
			} catch {
				return false;
			}
		}
	}
});
