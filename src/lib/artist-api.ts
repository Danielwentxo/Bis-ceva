import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ArtistMedia } from "./types";

const HEADERS = {
  "User-Agent": "BisConcertArchive/1.0 (concert diary)",
  Accept: "application/json",
};

async function fetchJson<T>(url: string, timeoutMs = 8000): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: HEADERS,
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function clean(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t.length ? t : null;
}

function norm(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

type TadbArtist = {
  strArtist?: string;
  strArtistLogo?: string;
  strArtistThumb?: string;
  strArtistClearart?: string;
  strGenre?: string;
  strStyle?: string;
  strCountry?: string;
  strBiography?: string;
  strBiographyEN?: string;
};

type TadbResponse = { artists: TadbArtist[] | null };

type DeezerArtist = {
  name?: string;
  picture_xl?: string;
  picture_big?: string;
  picture_medium?: string;
};

type DeezerResponse = { data?: DeezerArtist[] };

type WikiSummary = {
  title?: string;
  extract?: string;
  originalimage?: { source?: string };
  thumbnail?: { source?: string };
};

function fromTadb(a: TadbArtist): ArtistMedia {
  return {
    name: clean(a.strArtist) ?? "",
    logoUrl: clean(a.strArtistLogo) ?? clean(a.strArtistClearart),
    thumbUrl: clean(a.strArtistThumb),
    genre: clean(a.strGenre) ?? clean(a.strStyle),
    country: clean(a.strCountry),
    bio: clean(a.strBiography) ?? clean(a.strBiographyEN),
  };
}

function pickTadb(list: TadbArtist[], query: string, countryHint?: string | null) {
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

async function tadbSearch(query: string) {
  const url = `https://www.theaudiodb.com/api/v1/json/2/search.php?s=${encodeURIComponent(query)}`;
  const data = await fetchJson<TadbResponse>(url);
  return data?.artists ?? [];
}

async function deezerSearch(query: string, limit = 8) {
  const url = `https://api.deezer.com/search/artist?q=${encodeURIComponent(query)}&limit=${limit}`;
  const data = await fetchJson<DeezerResponse>(url);
  return data?.data ?? [];
}

async function wikiSummary(name: string) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`;
  return fetchJson<WikiSummary>(url, 6000);
}

// MusicBrainz — free, open, no API key, covers every genre and is by far the
// best source here for underground/niche acts (metal subgenres, local scenes,
// etc.) that TheAudioDB and Deezer often don't index at all. It doesn't host
// artist images, so it's used for NAME MATCHES and GENRE TAGS, layered under
// TheAudioDB/Deezer rather than replacing them. Their usage policy asks for a
// descriptive User-Agent (already set in HEADERS) and ~1 request/second, so
// this is only called as a fallback — not on every lookup — to stay polite
// and keep response times reasonable.
type MbArtist = {
  name?: string;
  country?: string;
  area?: { name?: string };
  tags?: { name?: string; count?: number }[];
  genres?: { name?: string; count?: number }[];
  disambiguation?: string;
};
type MbSearchResponse = { artists?: MbArtist[] };

function topTag(a: MbArtist): string | null {
  const pool = [...(a.genres ?? []), ...(a.tags ?? [])];
  if (!pool.length) return null;
  const sorted = [...pool].sort((x, y) => (y.count ?? 0) - (x.count ?? 0));
  return clean(sorted[0]?.name);
}

function fromMb(a: MbArtist): ArtistMedia {
  return {
    name: clean(a.name) ?? "",
    logoUrl: null,
    thumbUrl: null,
    genre: topTag(a),
    country: clean(a.area?.name) ?? clean(a.country),
    bio: clean(a.disambiguation),
  };
}

async function mbSearch(query: string, limit = 8) {
  const url = `https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(
    `artist:${query}`,
  )}&fmt=json&limit=${limit}`;
  const data = await fetchJson<MbSearchResponse>(url, 6000);
  return data?.artists ?? [];
}

function mergeMedia(primary: ArtistMedia, extra: Partial<ArtistMedia>): ArtistMedia {
  return {
    name: primary.name || extra.name || "",
    logoUrl: primary.logoUrl ?? extra.logoUrl ?? null,
    thumbUrl: primary.thumbUrl ?? extra.thumbUrl ?? null,
    genre: primary.genre ?? extra.genre ?? null,
    country: primary.country ?? extra.country ?? null,
    bio: primary.bio ?? extra.bio ?? null,
  };
}

export const searchArtists = createServerFn({ method: "POST" })
  .validator(z.object({ query: z.string().trim().min(1).max(80) }))
  .handler(async ({ data }): Promise<ArtistMedia[]> => {
    const query = data.query;
    const [tadb, deezer] = await Promise.all([tadbSearch(query), deezerSearch(query, 8)]);

    const byKey = new Map<string, ArtistMedia>();

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
      const incoming: ArtistMedia = {
        name,
        logoUrl: prev?.logoUrl ?? null,
        thumbUrl: prev?.thumbUrl ?? picture,
        genre: prev?.genre ?? null,
        country: prev?.country ?? null,
        bio: prev?.bio ?? null,
      };
      byKey.set(key, prev ? mergeMedia(prev, incoming) : incoming);
    }

    // TheAudioDB + Deezer skew toward mainstream/commercial catalogs and can
    // come up empty (or thin) for underground metal, local hip-hop, niche
    // electronic acts, etc. Only pay MusicBrainz's extra round-trip when that
    // happens, so common searches stay fast.
    if (byKey.size < 3) {
      const mb = await mbSearch(query, 8);
      for (const row of mb) {
        const media = fromMb(row);
        if (!media.name) continue;
        const key = norm(media.name);
        const prev = byKey.get(key);
        byKey.set(key, prev ? mergeMedia(prev, media) : media);
      }
    }

    const ranked = [...byKey.values()].sort((a, b) => {
      const an = norm(a.name);
      const bn = norm(b.name);
      const q = norm(query);
      const as = an === q ? 0 : an.startsWith(q) ? 1 : 2;
      const bs = bn === q ? 0 : bn.startsWith(q) ? 1 : 2;
      if (as !== bs) return as - bs;
      const al = a.logoUrl ? 0 : 1;
      const bl = b.logoUrl ? 0 : 1;
      return al - bl;
    });

    return ranked.slice(0, 8);
  });

async function enrichOne(name: string, countryHint?: string): Promise<ArtistMedia> {
  const tadb = await tadbSearch(name);
  const picked = pickTadb(tadb, name, countryHint);
  let media: ArtistMedia = picked
    ? fromTadb(picked)
    : {
        name,
        logoUrl: null,
        thumbUrl: null,
        genre: null,
        country: null,
        bio: null,
      };
  media.name = name;

  if (!media.logoUrl || !media.thumbUrl || !media.bio) {
    const [deezer, wiki] = await Promise.all([
      deezerSearch(name, 3),
      media.bio && media.thumbUrl ? Promise.resolve(null) : wikiSummary(name),
    ]);
    const d0 = deezer[0];
    const picture =
      clean(d0?.picture_xl) ?? clean(d0?.picture_big) ?? clean(d0?.picture_medium);
    media = mergeMedia(media, {
      name,
      thumbUrl: picture,
      bio: clean(wiki?.extract),
    });
    if (!media.thumbUrl) {
      media.thumbUrl =
        clean(wiki?.originalimage?.source) ?? clean(wiki?.thumbnail?.source);
    }
  }

  // Last resort for genre: MusicBrainz's crowd-sourced tags cover metal
  // subgenres (black/death/doom/etc.) and other niche scenes far better than
  // the sources above, which mostly know mainstream acts.
  if (!media.genre) {
    const mb = await mbSearch(name, 3);
    const hit = mb.find((a) => norm(a.name ?? "") === norm(name)) ?? mb[0];
    if (hit) media.genre = topTag(hit);
  }

  media.name = name;
  return media;
}

export const enrichArtists = createServerFn({ method: "POST" })
  .validator(
    z.object({
      names: z.array(z.string().trim().min(1).max(80)).max(20),
      countryHint: z.string().trim().max(80).optional(),
    }),
  )
  .handler(async ({ data }): Promise<ArtistMedia[]> => {
    const results: ArtistMedia[] = [];
    const names = data.names;
    for (let i = 0; i < names.length; i += 4) {
      const chunk = names.slice(i, i + 4);
      const part = await Promise.all(
        chunk.map((name) => enrichOne(name, data.countryHint)),
      );
      results.push(...part);
    }
    return results;
  });
