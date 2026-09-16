import { n as parseISO } from "../_libs/date-fns.mjs";
import { f as venueKey, u as todayIso } from "./format-DrKsHGab.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stats-B0Qo2a-s.js
function concertArtists(concert, artists) {
	return concert.lineup.map((l) => ({
		...l,
		artist: artists[l.artistId]
	})).filter((l) => Boolean(l.artist));
}
function bump(map, key, data) {
	const prev = map.get(key);
	if (prev) prev.count += 1;
	else map.set(key, {
		key,
		count: 1,
		data
	});
}
function computeStats(concerts, artists) {
	const today = todayIso();
	const past = concerts.filter((c) => c.date <= today);
	const upcoming = concerts.filter((c) => c.date > today);
	const chronological = [...past].sort((a, b) => a.date.localeCompare(b.date));
	const artistMap = /* @__PURE__ */ new Map();
	const venueMap = /* @__PURE__ */ new Map();
	const cityMap = /* @__PURE__ */ new Map();
	const countryMap = /* @__PURE__ */ new Map();
	const yearMap = /* @__PURE__ */ new Map();
	const monthMap = /* @__PURE__ */ new Map();
	const seenArtists = /* @__PURE__ */ new Set();
	for (const c of concerts) {
		for (const slot of c.lineup) {
			const artist = artists[slot.artistId];
			if (!artist) continue;
			seenArtists.add(artist.id);
			bump(artistMap, artist.id, artist);
		}
		bump(venueMap, venueKey(c.venue, c.city), {
			venue: c.venue,
			city: c.city,
			country: c.country,
			countryCode: c.countryCode
		});
		bump(cityMap, `${c.city}|${c.countryCode}`, {
			city: c.city,
			country: c.country,
			countryCode: c.countryCode
		});
		bump(countryMap, c.countryCode || c.country, {
			country: c.country,
			countryCode: c.countryCode
		});
		const d = parseISO(c.date);
		if (!Number.isNaN(d.getTime())) {
			yearMap.set(d.getFullYear(), (yearMap.get(d.getFullYear()) ?? 0) + 1);
			monthMap.set(d.getMonth(), (monthMap.get(d.getMonth()) ?? 0) + 1);
		}
	}
	const sortCount = (items) => [...items].sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
	const yearCounts = [...yearMap.entries()].map(([year, count]) => ({
		year,
		count
	})).sort((a, b) => a.year - b.year);
	const monthCounts = Array.from({ length: 12 }, (_, month) => ({
		month,
		count: monthMap.get(month) ?? 0
	}));
	const rated = concerts.filter((c) => typeof c.rating === "number");
	const avgRating = rated.length > 0 ? rated.reduce((sum, c) => sum + (c.rating ?? 0), 0) / rated.length : null;
	const busiestYear = [...yearCounts].sort((a, b) => b.count - a.count)[0] ?? null;
	return {
		totalShows: concerts.length,
		pastShows: past.length,
		upcomingShows: upcoming.length,
		uniqueArtists: seenArtists.size,
		uniqueVenues: venueMap.size,
		uniqueCities: cityMap.size,
		uniqueCountries: countryMap.size,
		festivals: concerts.filter((c) => c.festival).length,
		favorites: concerts.filter((c) => c.favorite).length,
		rated: rated.length,
		avgRating,
		firstShow: chronological[0] ?? null,
		lastShow: chronological[chronological.length - 1] ?? null,
		busiestYear,
		artistCounts: sortCount([...artistMap.values()]),
		venueCounts: sortCount([...venueMap.values()]),
		cityCounts: sortCount([...cityMap.values()]),
		countryCounts: sortCount([...countryMap.values()]),
		yearCounts,
		monthCounts
	};
}
//#endregion
export { concertArtists as n, computeStats as t };
