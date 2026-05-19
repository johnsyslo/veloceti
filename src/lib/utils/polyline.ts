/** Decode a Google-encoded polyline (e.g. Strava summary_polyline) into [lat, lng] pairs. */
export function decodePolyline(encoded: string): [number, number][] {
	const points: [number, number][] = [];
	let index = 0;
	let lat = 0;
	let lng = 0;

	while (index < encoded.length) {
		let shift = 0;
		let result = 0;
		let byte: number;

		do {
			byte = encoded.charCodeAt(index++) - 63;
			result |= (byte & 0x1f) << shift;
			shift += 5;
		} while (byte >= 0x20);

		const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
		lat += deltaLat;

		shift = 0;
		result = 0;

		do {
			byte = encoded.charCodeAt(index++) - 63;
			result |= (byte & 0x1f) << shift;
			shift += 5;
		} while (byte >= 0x20);

		const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
		lng += deltaLng;

		points.push([lat / 1e5, lng / 1e5]);
	}

	return points;
}

export function polylineToSvgPath(points: [number, number][]): string | null {
	if (points.length < 2) return null;

	const lats = points.map(([lat]) => lat);
	const lngs = points.map(([, lng]) => lng);
	const minLat = Math.min(...lats);
	const maxLat = Math.max(...lats);
	const minLng = Math.min(...lngs);
	const maxLng = Math.max(...lngs);

	const latSpan = maxLat - minLat || 0.0001;
	const lngSpan = maxLng - minLng || 0.0001;
	const padding = 8;
	const width = 100 - padding * 2;
	const height = 100 - padding * 2;

	const project = ([lat, lng]: [number, number]) => {
		const x = padding + ((lng - minLng) / lngSpan) * width;
		const y = padding + (1 - (lat - minLat) / latSpan) * height;
		return `${x.toFixed(2)},${y.toFixed(2)}`;
	};

	return points.map((point, i) => `${i === 0 ? 'M' : 'L'}${project(point)}`).join(' ');
}
