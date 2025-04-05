export default function uniqBy<T>(
	arr: T[],
	comp: (item: T) => undefined | string,
): T[] {
	const map = new Map();
	for (const item of arr) {
		const key = comp(item);
		if (!map.has(key)) {
			map.set(key, item);
		}
	}
	return Array.from(map.values());
}
