import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { assertImageDataUrl } from "@/lib/image-data";
import type { ArtistMedia } from "@/lib/types";
import { artistKey, venueKey } from "@/lib/utils";

function like(query: string) {
  return `%${query.replace(/[%_]/g, "")}%`;
}

export const searchCatalogArtists = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
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
      overwrite: z.boolean().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const id = artistKey(data.name);
    const logoUrl = assertImageDataUrl(data.logoUrl ?? null, "Artist logo");
    const thumbUrl = assertImageDataUrl(data.thumbUrl ?? null, "Artist image") ?? logoUrl;
    const overwrite = Boolean(data.overwrite);
    await sql`
      insert into catalog_artists (id, name, logo_url, thumb_url, genre, country, bio, created_by)
      values (
        ${id}, ${data.name}, ${logoUrl}, ${thumbUrl},
        ${data.genre ?? null}, ${data.country ?? null}, ${data.bio ?? null}, ${context.userId}
      )
      on conflict (id) do update set
        name = excluded.name,
        logo_url = case when ${overwrite} then coalesce(excluded.logo_url, catalog_artists.logo_url) else coalesce(catalog_artists.logo_url, excluded.logo_url) end,
        thumb_url = case when ${overwrite} then coalesce(excluded.thumb_url, catalog_artists.thumb_url) else coalesce(catalog_artists.thumb_url, excluded.thumb_url) end,
        genre = case when ${overwrite} then coalesce(excluded.genre, catalog_artists.genre) else coalesce(catalog_artists.genre, excluded.genre) end,
        country = case when ${overwrite} then coalesce(excluded.country, catalog_artists.country) else coalesce(catalog_artists.country, excluded.country) end,
        bio = case when ${overwrite} then coalesce(excluded.bio, catalog_artists.bio) else coalesce(catalog_artists.bio, excluded.bio) end
    `;
    return {
      id,
      name: data.name,
      logoUrl,
      thumbUrl,
      genre: data.genre ?? null,
      country: data.country ?? null,
      bio: data.bio ?? null,
    };
  });

export type CatalogVenue = {
  venue: string;
  city: string;
  country: string;
  countryCode: string;
};

export const searchCatalogVenues = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
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
        venue = catalog_venues.venue,
        city = catalog_venues.city,
        country = case when catalog_venues.country = '' then excluded.country else catalog_venues.country end,
        country_code = case when catalog_venues.country_code = '' then excluded.country_code else catalog_venues.country_code end
    `;
    return { id };
  });
