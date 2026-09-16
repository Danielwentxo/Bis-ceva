import { a as string, i as object, t as array } from "../_libs/zod.mjs";
import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/artist-api-DiyJeuJX.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var HEADERS = {
	"User-Agent": "BisConcertArchive/1.0 (concert diary)",
	Accept: "application/json"
};
async function fetchJson(url, timeoutMs = 8e3) {
	try {
		const res = await fetch(url, {
			headers: HEADERS,
			signal: AbortSignal.timeout(timeoutMs)
		});
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	}
}
function clean(value) {
	if (typeof value !== "string") return null;
	const t = value.trim();
	return t.length ? t : null;
}
function norm(name) {
	return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function fromTadb(a) {
	return {
		name: clean(a.strArtist) ?? "",
		logoUrl: clean(a.strArtistLogo) ?? clean(a.strArtistClearart),
		thumbUrl: clean(a.strArtistThumb),
		genre: clean(a.strGenre) ?? clean(a.strStyle),
		country: clean(a.strCountry),
		bio: clean(a.strBiography) ?? clean(a.strBiographyEN)
	};
}
function pickTadb(list, query, countryHint) {
	if (!list.length) return null;
	const nq = norm(query);
	const exact = list.filter((a) => norm(a.strArtist ?? "") === nq);
	const pool = exact.length ? exact : list;
	if (countryHint) {
		const hint = countryHint.toLowerCase();
		const hinted = pool.find((a) => (a.strCountry ?? "").toLowerCase().includes(hint));
		if (hinted) return hinted;
	}
	return pool[0] ?? null;
}
async function tadbSearch(query) {
	return (await fetchJson(`https://www.theaudiodb.com/api/v1/json/2/search.php?s=${encodeURIComponent(query)}`))?.artists ?? [];
}
async function deezerSearch(query, limit = 8) {
	return (await fetchJson(`https://api.deezer.com/search/artist?q=${encodeURIComponent(query)}&limit=${limit}`))?.data ?? [];
}
async function wikiSummary(name) {
	return fetchJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`, 6e3);
}
function mergeMedia(primary, extra) {
	return {
		name: primary.name || extra.name || "",
		logoUrl: primary.logoUrl ?? extra.logoUrl ?? null,
		thumbUrl: primary.thumbUrl ?? extra.thumbUrl ?? null,
		genre: primary.genre ?? extra.genre ?? null,
		country: primary.country ?? extra.country ?? null,
		bio: primary.bio ?? extra.bio ?? null
	};
}
var searchArtists_createServerFn_handler = createServerRpc({
	id: "0953cbb8aab4b2e8d6449bbc04970d13e3410c3831e1f3f1633c3177c3b43000",
	name: "searchArtists",
	filename: "src/lib/artist-api.ts"
}, (opts) => searchArtists.__executeServer(opts));
var searchArtists = createServerFn({ method: "POST" }).validator(object({ query: string().trim().min(1).max(80) })).handler(searchArtists_createServerFn_handler, async ({ data }) => {
	const query = data.query;
	const [tadb, deezer] = await Promise.all([tadbSearch(query), deezerSearch(query, 8)]);
	const byKey = /* @__PURE__ */ new Map();
	for (const row of tadb) {
		const media = fromTadb(row);
		if (!media.name) continue;
		byKey.set(norm(media.name), media);
	}
	for (const row of deezer) {
		const name = clean(row.name);
		if (!name) continue;
		const key = norm(name);
		const picture = clean(row.picture_xl) ?? clean(row.picture_big) ?? clean(row.picture_medium);
		const prev = byKey.get(key);
		const incoming = {
			name,
			logoUrl: prev?.logoUrl ?? null,
			thumbUrl: prev?.thumbUrl ?? picture,
			genre: prev?.genre ?? null,
			country: prev?.country ?? null,
			bio: prev?.bio ?? null
		};
		byKey.set(key, prev ? mergeMedia(prev, incoming) : incoming);
	}
	return [...byKey.values()].sort((a, b) => {
		const an = norm(a.name);
		const bn = norm(b.name);
		const q = norm(query);
		const as = an === q ? 0 : an.startsWith(q) ? 1 : 2;
		const bs = bn === q ? 0 : bn.startsWith(q) ? 1 : 2;
		if (as !== bs) return as - bs;
		return (a.logoUrl ? 0 : 1) - (b.logoUrl ? 0 : 1);
	}).slice(0, 8);
});
async function enrichOne(name, countryHint) {
	const picked = pickTadb(await tadbSearch(name), name, countryHint);
	let media = picked ? fromTadb(picked) : {
		name,
		logoUrl: null,
		thumbUrl: null,
		genre: null,
		country: null,
		bio: null
	};
	media.name = name;
	if (!media.logoUrl || !media.thumbUrl || !media.bio) {
		const [deezer, wiki] = await Promise.all([deezerSearch(name, 3), media.bio && media.thumbUrl ? Promise.resolve(null) : wikiSummary(name)]);
		const d0 = deezer[0];
		const picture = clean(d0?.picture_xl) ?? clean(d0?.picture_big) ?? clean(d0?.picture_medium);
		media = mergeMedia(media, {
			name,
			thumbUrl: picture,
			bio: clean(wiki?.extract)
		});
		if (!media.thumbUrl) media.thumbUrl = clean(wiki?.originalimage?.source) ?? clean(wiki?.thumbnail?.source);
	}
	media.name = name;
	return media;
}
var enrichArtists_createServerFn_handler = createServerRpc({
	id: "7cd086ba5327cb686a1d0157fc1ff52fd338c3c9c5fc11d38bcc15b6b1bfd8bf",
	name: "enrichArtists",
	filename: "src/lib/artist-api.ts"
}, (opts) => enrichArtists.__executeServer(opts));
var enrichArtists = createServerFn({ method: "POST" }).validator(object({
	names: array(string().trim().min(1).max(80)).max(20),
	countryHint: string().trim().max(80).optional()
})).handler(enrichArtists_createServerFn_handler, async ({ data }) => {
	const results = [];
	const names = data.names;
	for (let i = 0; i < names.length; i += 4) {
		const chunk = names.slice(i, i + 4);
		const part = await Promise.all(chunk.map((name) => enrichOne(name, data.countryHint)));
		results.push(...part);
	}
	return results;
});
//#endregion
export { enrichArtists_createServerFn_handler, searchArtists_createServerFn_handler };
