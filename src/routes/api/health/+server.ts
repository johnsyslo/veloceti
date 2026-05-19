import { json } from '@sveltejs/kit';
import { testConnection } from '$lib/server/db';

export async function GET() {
	const result = await testConnection();
	const status = result.status === 'connected' ? 200 : 503;

	return json(result, { status });
}

