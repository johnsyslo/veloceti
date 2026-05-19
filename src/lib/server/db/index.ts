import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';

if (!DATABASE_URL) {
	throw new Error('DATABASE_URL environment variable is not set');
}

export const sql = postgres(DATABASE_URL, {
	max: 10,
	idle_timeout: 30,
	connect_timeout: 10
});

export async function testConnection() {
	try {
		await sql`SELECT 1`;
		return { status: 'connected', timestamp: new Date().toISOString() };
	} catch (error) {
		return {
			status: 'disconnected',
			error: error instanceof Error ? error.message : 'Unknown error',
			timestamp: new Date().toISOString()
		};
	}
}

export default sql;
