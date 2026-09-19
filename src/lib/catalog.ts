import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { ArtistMedia } from "@/lib/types";
import { artistKey, venueKey } from "@/lib/utils";

function like(query: string) {
  return `%${query.replace(/[%_]/g, "")}%`;
}

export const searchCatalogArtists = createServerFn({ method: "POST" })
  .validator(z.object({ query: z.string().trim().min(1).max(80) }))
  .handler(async ({ data }): Promise<ArtistMedia[]> => {
    const sql = await getSql();
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
      where lower(name) like lower(${like(data.query)})
      order by name
      limit 12
    `;
    return rows.map((row) => ({
      name: row.name,
      logoUrl: row.logo_url,
      thumbUrl: row.thumb_url,
      genre: row.genre,
      country: row.country,
      bio: row.bio,
    }));
  });

export const saveCatalogArtist = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      name: z.string().trim().min(1).max(200),
      logoUrl: z.string().nullable().optional(),
      thumbUrl: z.string().nullable().optional(),
      genre: z.string().nullable().optional(),
      country: z.string().nullable().optional(),
      bio: z.string().nullable().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const id = artistKey(data.name);
    await sql`
      insert into catalog_artists (id, name, logo_url, thumb_url, genre, country, bio, created_by)
      values (
        ${id}, ${data.name}, ${data.logoUrl ?? null}, ${data.thumbUrl ?? null},
        ${data.genre ?? null}, ${data.country ?? null}, ${data.bio ?? null}, ${context.userId}
      )
      on conflict (id) do update set
        name = excluded.name,
        logo_url = coalesce(excluded.logo_url, catalog_artists.logo_url),
        thumb_url = coalesce(excluded.thumb_url, catalog_artists.thumb_url),
        genre = coalesce(excluded.genre, catalog_artists.genre),
        country = coalesce(excluded.country, catalog_artists.country),
        bio = coalesce(excluded.bio, catalog_artists.bio)
    `;
    return { id, name: data.name };
  });

export type CatalogVenue = {
  venue: string;
  city: string;
  country: string;
  countryCode: string;
};

export const searchCatalogVenues = createServerFn({ method: "POST" })
  .validator(z.object({ query: z.string().trim().min(1).max(80) }))
  .handler(async ({ data }): Promise<CatalogVenue[]> => {
    const sql = await getSql();
    const rows = await sql<{
      venue: string;
      city: string;
      country: string;
      country_code: string;
    }>`
      select venue, city, country, country_code
      from catalog_venues
      where lower(venue) like lower(${like(data.query)}) or lower(city) like lower(${like(data.query)})
      order by venue
      limit 8
    `;
    return rows.map((row) => ({
      venue: row.venue,
      city: row.city,
      country: row.country,
      countryCode: row.country_code,
    }));
  });

export const saveCatalogVenue = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      venue: z.string().trim().min(1).max(200),
      city: z.string().trim().min(1).max(120),
      country: z.string().trim().max(120).default(""),
      countryCode: z.string().trim().max(8).default(""),
    }),
  )
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const id = venueKey(data.venue, data.city);
    await sql`
      insert into catalog_venues (id, venue, city, country, country_code, created_by)
      values (${id}, ${data.venue}, ${data.city}, ${data.country}, ${data.countryCode}, ${context.userId})
      on conflict (id) do update set
        venue = excluded.venue,
        city = excluded.city,
        country = case when excluded.country = '' then catalog_venues.country else excluded.country end,
        country_code = case when excluded.country_code = '' then catalog_venues.country_code else excluded.country_code end
    `;
    return { id };
  });
