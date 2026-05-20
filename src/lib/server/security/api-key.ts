import { timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';

let cachedKey: string | null = null;

export function getInternalApiKey(): string {
	if (cachedKey) return cachedKey;

	const key = env.INTERNAL_API_KEY?.trim();
	if (!key) {
		throw new Error('INTERNAL_API_KEY environment variable is required');
	}

	cachedKey = key;
	return key;
}

export function verifyApiKey(provided: string | null): boolean {
	if (!provided) return false;

	const expected = getInternalApiKey();
	if (provided.length !== expected.length) return false;

	return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}
