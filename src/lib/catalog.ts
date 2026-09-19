import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { ArtistMedia } from "@/lib/types";
import { artistKey, venueKey } from "@/lib/utils";

export type CatalogVenue = {
  venue: string;
  city: string;
  country: string;
  countryCode: string;
};

export async function findCatalogArtists(query: string): Promise<ArtistMedia[]> {
  const sql = await getSql();
  const needle = `%${query.trim()}%`;
  const rows = await sql<{
    name: string;
    logo_url: string | null;
    thumb_url: string | null;
    genre: string | null;
    country: string | null;
    bio: string | null;
  }>`
    select name, logo_url, thumb_url, genre, country, bio
    from catalog_artists
    where name ilike ${needle}
    order by name asc
    limit 8
  `;
  return rows.map((row) => ({
    name: row.name,
    logoUrl: row.logo_url,
    thumbUrl: row.thumb_url,
    genre: row.genre,
    country: row.country,
    bio: row.bio,
  }));
}

export const searchCatalogVenues = createServerFn({ method: "POST" })
  .validator(z.object({ query: z.string().trim().min(1).max(120) }))
  .handler(async ({ data }): Promise<CatalogVenue[]> => {
    const sql = await getSql();
    const needle = `%${data.query}%`;
    const rows = await sql<{
      venue: string;
      city: string;
      country: string;
      country_code: string;
    }>`
      select venue, city, country, country_code
      from catalog_venues
      where venue ilike ${needle} or city ilike ${needle}
      order by venue asc
      limit 8
    `;
    return rows.map((row) => ({
      venue: row.venue,
      city: row.city,
      country: row.country,
      countryCode: row.country_code,
    }));
  });

export const addManualArtist = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      name: z.string().trim().min(1).max(200),
      country: z.string().trim().max(120).optional(),
      genre: z.string().trim().max(80).optional(),
    }),
  )
  .handler(async ({ data, context }): Promise<ArtistMedia> => {
    const sql = await getSql();
    const id = artistKey(data.name);
    const existing = await sql<{ name: string; country: string | null; genre: string | null; logo_url: string | null; thumb_url: string | null; bio: string | null }>`
      select name, country, genre, logo_url, thumb_url, bio from catalog_artists where id = ${id} limit 1
    `;
    if (existing[0]) {
      return {
        name: existing[0].name,
        logoUrl: existing[0].logo_url,
        thumbUrl: existing[0].thumb_url,
        genre: existing[0].genre,
        country: existing[0].country,
        bio: existing[0].bio,
      };
    }
    await sql`
      insert into catalog_artists (id, name, genre, country, created_by)
      values (${id}, ${data.name}, ${data.genre ?? null}, ${data.country ?? null}, ${context.userId})
    `;
    return {
      name: data.name,
      logoUrl: null,
      thumbUrl: null,
      genre: data.genre ?? null,
      country: data.country ?? null,
      bio: null,
    };
  });

export async function upsertCatalogFromConcert(input: {
  userId: string;
  artists: ArtistMedia[];
  venue: string;
  city: string;
  country: string;
  countryCode: string;
}) {
  const sql = await getSql();
  for (const a of input.artists) {
    const id = artistKey(a.name);
    await sql`
      insert into catalog_artists (id, name, logo_url, thumb_url, genre, country, bio, created_by)
      values (
        ${id}, ${a.name}, ${a.logoUrl ?? null}, ${a.thumbUrl ?? null},
        ${a.genre ?? null}, ${a.country ?? null}, ${a.bio ?? null}, ${input.userId}
      )
      on conflict (id) do update set
        logo_url = coalesce(catalog_artists.logo_url, excluded.logo_url),
        thumb_url = coalesce(catalog_artists.thumb_url, excluded.thumb_url),
        genre = coalesce(catalog_artists.genre, excluded.genre),
        country = coalesce(catalog_artists.country, excluded.country),
        bio = coalesce(catalog_artists.bio, excluded.bio)
    `;
  }
  const vid = venueKey(input.venue, input.city);
  await sql`
    insert into catalog_venues (id, venue, city, country, country_code, created_by)
    values (${vid}, ${input.venue}, ${input.city}, ${input.country}, ${input.countryCode}, ${input.userId})
    on conflict (id) do update set
      country = case when catalog_venues.country = '' then excluded.country else catalog_venues.country end,
      country_code = case when catalog_venues.country_code = '' then excluded.country_code else catalog_venues.country_code end
  `;
}
