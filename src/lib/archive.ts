import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { assertImageDataUrl } from "@/lib/image-data";
import { listSafeImage } from "@/lib/media-load";
import { storePoster } from "@/lib/poster-store";
import type { Artist, Concert, LineupEntry } from "@/lib/types";
import { artistKey } from "@/lib/utils";

const artistMediaSchema = z.object({
  name: z.string().min(1).max(200),
  logoUrl: z.string().nullable().optional(),
  thumbUrl: z.string().nullable().optional(),
  genre: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
});

const draftSchema = z.object({
  date: z.string().min(4).max(32),
  venue: z.string().min(1).max(200),
  city: z.string().min(1).max(120),
  country: z.string().min(1).max(120),
  countryCode: z.string().max(8).default(""),
  artists: z.array(artistMediaSchema).min(1).max(200),
  notes: z.string().max(4000).default(""),
  rating: z.number().min(0).max(5).nullable(),
  favorite: z.boolean(),
  festival: z.boolean(),
  festivalName: z.string().max(200).optional().default(""),
  festivalPosterUrl: z.string().max(900_000).nullable().optional(),
  ticketUrl: z.string().max(900_000).nullable().optional(),
});

type ConcertRow = {
  id: string;
  date: string;
  venue: string;
  city: string;
  country: string;
  country_code: string;
  lineup: LineupEntry[] | string;
  notes: string;
  rating: number | null;
  favorite: boolean;
  festival: boolean;
  festival_name?: string;
  festival_poster_url?: string | null;
  ticket_url?: string | null;
  created_at: string | Date;
};

type ArtistRow = {
  id: string;
  name: string;
  logo_url: string | null;
  thumb_url: string | null;
  genre: string | null;
  country: string | null;
  bio: string | null;
  fetched_at: string | Date | null;
};

function parseLineup(raw: LineupEntry[] | string): LineupEntry[] {
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw) as LineupEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function rowToConcert(row: ConcertRow): Concert {
  const created = typeof row.created_at === "string" ? row.created_at : row.created_at.toISOString();
  const festivalName = row.festival_name?.trim() ?? "";
  return {
    id: row.id,
    date: row.date,
    venue: row.venue,
    city: row.city,
    country: row.country,
    countryCode: row.country_code ?? "",
    lineup: parseLineup(row.lineup),
    notes: row.notes ?? "",
    rating: row.rating,
    favorite: Boolean(row.favorite),
    festival: Boolean(row.festival) || Boolean(festivalName),
    festivalName,
    festivalPosterUrl: row.festival_poster_url && row.festival_poster_url.startsWith("https://") ? row.festival_poster_url : null,
    ticketUrl: null,
    createdAt: created,
  };
}

function rowToArtist(row: ArtistRow): Artist {
  const fetched =
    row.fetched_at == null
      ? undefined
      : typeof row.fetched_at === "string"
        ? row.fetched_at
        : row.fetched_at.toISOString();
  return {
    id: row.id,
    name: row.name,
    logoUrl: listSafeImage(row.logo_url),
    thumbUrl: listSafeImage(row.thumb_url),
    genre: row.genre,
    country: row.country,
    bio: row.bio,
    fetchedAt: fetched,
  };
}

async function upsertArtistsForUser(userId: string, artists: z.infer<typeof artistMediaSchema>[]) {
  const sql = await getSql();
  for (const a of artists) {
    const id = artistKey(a.name, a.country);
    await sql`
      insert into artists (id, user_id, name, logo_url, thumb_url, genre, country, bio, fetched_at)
      values (
        ${id}, ${userId}, ${a.name}, ${a.logoUrl ?? null}, ${a.thumbUrl ?? null},
        ${a.genre ?? null}, ${a.country ?? null}, ${a.bio ?? null},
        ${a.logoUrl || a.thumbUrl || a.bio ? new Date().toISOString() : null}
      )
      on conflict (user_id, id) do update set
        name = excluded.name,
        logo_url = coalesce(excluded.logo_url, artists.logo_url),
        thumb_url = coalesce(excluded.thumb_url, artists.thumb_url),
        genre = coalesce(excluded.genre, artists.genre),
        country = coalesce(excluded.country, artists.country),
        bio = coalesce(excluded.bio, artists.bio),
        fetched_at = coalesce(excluded.fetched_at, artists.fetched_at)
    `;
  }
}


export const migrateStoredPosters = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return { moved: 0, left: 0 };
    const sql = await getSql();
    const rows = await sql<{ id: string; festival_poster_url: string }>`
      select id, festival_poster_url from concerts
      where user_id = ${context.userId} and festival_poster_url like 'data:%'
      limit 8
    `;
    let moved = 0;
    for (const row of rows) {
      const stored = await storePoster(row.festival_poster_url, row.id);
      if (!stored || !stored.startsWith("https://")) continue;
      await sql`update concerts set festival_poster_url = ${stored} where user_id = ${context.userId} and id = ${row.id}`;
      moved += 1;
    }
    const left = await sql<{ n: number }>`
      select count(*)::int as n from concerts
      where user_id = ${context.userId} and festival_poster_url like 'data:%'
    `;
    return { moved, left: left[0]?.n ?? 0 };
  });

export const loadArchive = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ concerts: Concert[]; artists: Record<string, Artist> }> => {
    const sql = await getSql();
    const concertRows = await sql<ConcertRow>`
      select id, date, venue, city, country, country_code, lineup, notes, rating, favorite, festival, festival_name,
        case when festival_poster_url like 'https://%' then festival_poster_url else null end as festival_poster_url,
        created_at
      from concerts where user_id = ${context.userId} order by date desc
    `;
    const artistRows = await sql<ArtistRow>`
      select id, name,
        case when logo_url like 'data:%' then null else logo_url end as logo_url,
        case when thumb_url like 'data:%' then null else thumb_url end as thumb_url,
        genre, country, bio, fetched_at
      from artists where user_id = ${context.userId}
    `;
    const artists: Record<string, Artist> = {};
    for (const row of artistRows) artists[row.id] = rowToArtist(row);
    return { concerts: concertRows.map(rowToConcert), artists };
  });

export const upsertConcert = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string().min(1).max(80).optional(), draft: draftSchema, createdAt: z.string().optional() }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const id = data.id ?? crypto.randomUUID();
    const createdAt = data.createdAt ?? new Date().toISOString();
    const draft = data.draft;
    const festivalName = draft.festivalName?.trim() ?? "";
    const festival = Boolean(draft.festival) || Boolean(festivalName);
    const festivalPosterUrl = assertImageDataUrl(draft.festivalPosterUrl ?? null, "Festival poster");
    const ticketUrl = assertImageDataUrl(draft.ticketUrl ?? null, "Ticket");
    for (const artist of draft.artists) {
      assertImageDataUrl(artist.logoUrl ?? null, "Artist logo");
      assertImageDataUrl(artist.thumbUrl ?? null, "Artist image");
    }
    await upsertArtistsForUser(context.userId, draft.artists);
    const lineup: LineupEntry[] = draft.artists.map((a, index) => ({
      artistId: artistKey(a.name, a.country),
      role: index === 0 ? "headliner" : "support",
    }));
    await sql`
      insert into concerts (id, user_id, date, venue, city, country, country_code, lineup, notes, rating, favorite, festival, festival_name, festival_poster_url, ticket_url, created_at)
      values (
        ${id}, ${context.userId}, ${draft.date}, ${draft.venue.trim()}, ${draft.city.trim()}, ${draft.country},
        ${draft.countryCode ?? ""}, ${JSON.stringify(lineup)}::jsonb, ${draft.notes.trim()}, ${draft.rating},
        ${draft.favorite}, ${festival}, ${festivalName}, ${festivalPosterUrl}, ${ticketUrl}, ${createdAt}
      )
      on conflict (user_id, id) do update set
        date = excluded.date, venue = excluded.venue, city = excluded.city, country = excluded.country,
        country_code = excluded.country_code, lineup = excluded.lineup, notes = excluded.notes,
        rating = excluded.rating, favorite = excluded.favorite, festival = excluded.festival,
        festival_name = excluded.festival_name, festival_poster_url = excluded.festival_poster_url,
        ticket_url = excluded.ticket_url
    `;
    const artists: Artist[] = draft.artists.map((a) => ({
      id: artistKey(a.name, a.country), name: a.name, logoUrl: listSafeImage(a.logoUrl), thumbUrl: listSafeImage(a.thumbUrl),
      genre: a.genre ?? null, country: a.country ?? null, bio: a.bio ?? null,
    }));
    const concert: Concert = {
      id, date: draft.date, venue: draft.venue.trim(), city: draft.city.trim(), country: draft.country,
      countryCode: draft.countryCode ?? "", lineup, notes: draft.notes.trim(), rating: draft.rating,
      favorite: draft.favorite, festival, festivalName, festivalPosterUrl: null, ticketUrl: null, createdAt,
    };
    return { id, concert, artists };
  });

export const patchFestivalShared = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      ids: z.array(z.string().min(1).max(80)).min(1).max(40),
      venue: z.string().min(1).max(200),
      city: z.string().min(1).max(120),
      country: z.string().min(1).max(120),
      countryCode: z.string().max(8).default(""),
      festivalName: z.string().max(200),
      festivalPosterUrl: z.string().max(900_000).nullable().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const festival = Boolean(data.festivalName.trim());
    const festivalPosterUrl = assertImageDataUrl(data.festivalPosterUrl ?? null, "Festival poster");
    for (const id of data.ids) {
      await sql`
        update concerts set
          venue = ${data.venue},
          city = ${data.city},
          country = ${data.country},
          country_code = ${data.countryCode},
          festival = ${festival},
          festival_name = ${data.festivalName.trim()},
          festival_poster_url = ${festivalPosterUrl}
        where user_id = ${context.userId} and id = ${id}
      `;
    }
    return { ok: true as const };
  });

export const removeConcert = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string().min(1).max(80) }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    await sql`delete from concerts where user_id = ${context.userId} and id = ${data.id}`;
    return { ok: true as const };
  });

export const setConcertFavorite = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string().min(1).max(80), favorite: z.boolean() }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    await sql`update concerts set favorite = ${data.favorite} where user_id = ${context.userId} and id = ${data.id}`;
    return { ok: true as const };
  });

export const clearUserArchive = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`delete from concerts where user_id = ${context.userId}`;
    await sql`delete from artists where user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`delete from concerts where user_id = ${context.userId}`;
    await sql`delete from artists where user_id = ${context.userId}`;
    await sql`delete from "session" where "userId" = ${context.userId}`;
    await sql`delete from "account" where "userId" = ${context.userId}`;
    await sql`delete from "user" where "id" = ${context.userId}`;
    return { ok: true as const };
  });
