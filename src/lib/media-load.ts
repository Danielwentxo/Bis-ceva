import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

function keepRemote(url: string | null | undefined) {
  if (!url) return null;
  if (url.startsWith("data:")) return null;
  return url;
}

export function listSafeImage(url: string | null | undefined) {
  return keepRemote(url);
}

export const loadConcertPoster = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string().min(1).max(80) }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const rows = await sql<{ festival_poster_url: string | null }>`
      select festival_poster_url from concerts
      where user_id = ${context.userId} and id = ${data.id}
      limit 1
    `;
    return rows[0]?.festival_poster_url ?? null;
  });

export const loadArtistImage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string().min(1).max(240) }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const rows = await sql<{ logo_url: string | null; thumb_url: string | null }>`
      select logo_url, thumb_url from artists
      where user_id = ${context.userId} and id = ${data.id}
      limit 1
    `;
    const row = rows[0];
    if (!row) return { logoUrl: null, thumbUrl: null };
    return { logoUrl: row.logo_url, thumbUrl: row.thumb_url };
  });
