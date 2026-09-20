import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { artistKey } from "@/lib/utils";

export const persistArtistMedia = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      artists: z
        .array(
          z.object({
            name: z.string().min(1).max(200),
            logoUrl: z.string().nullable().optional(),
            thumbUrl: z.string().nullable().optional(),
            genre: z.string().nullable().optional(),
            country: z.string().nullable().optional(),
            bio: z.string().nullable().optional(),
          }),
        )
        .max(20),
    }),
  )
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    for (const a of data.artists) {
      const id = artistKey(a.name);
      await sql`
        insert into artists (id, user_id, name, logo_url, thumb_url, genre, country, bio, fetched_at)
        values (
          ${id}, ${context.userId}, ${a.name}, ${a.logoUrl ?? null}, ${a.thumbUrl ?? null},
          ${a.genre ?? null}, ${a.country ?? null}, ${a.bio ?? null}, ${new Date().toISOString()}
        )
        on conflict (user_id, id) do update set
          logo_url = coalesce(excluded.logo_url, artists.logo_url),
          thumb_url = coalesce(excluded.thumb_url, artists.thumb_url),
          genre = coalesce(excluded.genre, artists.genre),
          country = coalesce(excluded.country, artists.country),
          bio = coalesce(excluded.bio, artists.bio),
          fetched_at = excluded.fetched_at
      `;
    }
    return { ok: true as const };
  });
