import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { sendFriendInviteEmail } from "@/lib/auth/reset-email.server";
import { getSql } from "@/lib/db";
import { artistKey } from "@/lib/utils";

const DAILY_INVITES = 10;

function appOrigin() {
  return process.env.BETTER_AUTH_URL?.replace(/\/$/, "") || "https://www.mygighistory.com";
}

async function me(sql: Awaited<ReturnType<typeof getSql>>, userId: string) {
  const rows = await sql<{ id: string; name: string; email: string }>`
    select id, name, email from "user" where id = ${userId} limit 1
  `;
  return rows[0] ?? null;
}

async function invitesSentToday(sql: Awaited<ReturnType<typeof getSql>>, userId: string) {
  const rows = await sql<{ n: string }>`
    select (
      (select count(*) from friendships where user_id = ${userId} and created_at > now() - interval '1 day')
      +
      (select count(*) from friend_invites where from_user_id = ${userId} and created_at > now() - interval '1 day')
    )::text as n
  `;
  return Number(rows[0]?.n ?? 0);
}

export const listFriends = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const self = await me(sql, context.userId);
    if (self?.email) {
      const waiting = await sql<{ id: string; from_user_id: string; token: string }>`
        select id, from_user_id, token from friend_invites
        where lower(email) = lower(${self.email}) and status = 'pending'
      `;
      for (const invite of waiting) {
        if (invite.from_user_id === context.userId) continue;
        await sql`
          insert into friendships (user_id, friend_id, status)
          values (${invite.from_user_id}, ${context.userId}, 'pending')
          on conflict (user_id, friend_id) do nothing
        `;
        await sql`update friend_invites set status = 'claimed' where id = ${invite.id}`;
      }
    }
    const friends = await sql<{ id: string; name: string; email: string; nickname: string | null }>`
      select u.id, u.name, u.email,
        (select nickname from friendships mine where mine.user_id = ${context.userId} and mine.friend_id = u.id limit 1) as nickname
      from friendships f
      join "user" u on u.id = case when f.user_id = ${context.userId} then f.friend_id else f.user_id end
      where f.status = 'accepted' and (f.user_id = ${context.userId} or f.friend_id = ${context.userId})
    `;
    const requests = await sql<{ id: string; name: string; email: string }>`
      select u.id, u.name, u.email
      from friendships f
      join "user" u on u.id = f.user_id
      where f.friend_id = ${context.userId} and f.status = 'pending'
    `;
    const tags = await sql<{ id: string; concert_id: string; from_name: string; date: string; venue: string; city: string }>`
      select t.id, t.concert_id, u.name as from_name, c.date, c.venue, c.city
      from concert_tags t
      join "user" u on u.id = t.from_user_id
      join concerts c on c.user_id = t.from_user_id and c.id = t.concert_id
      where t.to_user_id = ${context.userId} and t.status = 'pending'
    `;
    const seen = new Set<string>();
    return {
      friends: friends.filter((f) => (seen.has(f.id) ? false : (seen.add(f.id), true))),
      requests,
      tags,
      invitesLeft: Math.max(0, DAILY_INVITES - (await invitesSentToday(sql, context.userId))),
    };
  });

export const inviteFriend = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ email: z.string().trim().email().max(200) }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const self = await me(sql, context.userId);
    const email = data.email.trim().toLowerCase();
    if (self && self.email.toLowerCase() === email) return { ok: false, message: "That is your own email." };
    if ((await invitesSentToday(sql, context.userId)) >= DAILY_INVITES) {
      return { ok: false, message: "Invite limit reached for today. Try again tomorrow." };
    }
    const existing = await sql<{ id: string }>`select id from "user" where lower(email) = ${email} limit 1`;
    const target = existing[0];
    if (target) {
      const already = await sql<{ status: string }>`
        select status from friendships
        where (user_id = ${context.userId} and friend_id = ${target.id})
           or (user_id = ${target.id} and friend_id = ${context.userId})
        limit 1
      `;
      if (already[0]?.status === "accepted") return { ok: false, message: "You are already friends." };
      if (already[0]) return { ok: false, message: "A request is already waiting." };
      await sql`
        insert into friendships (user_id, friend_id, status)
        values (${context.userId}, ${target.id}, 'pending')
      `;
      return { ok: true, message: "Request sent. They will see it in Friends." };
    }
    const token = crypto.randomUUID();
    await sql`
      insert into friend_invites (id, from_user_id, email, token)
      values (${crypto.randomUUID()}, ${context.userId}, ${email}, ${token})
    `;
    await sendFriendInviteEmail({
      to: email,
      inviteUrl: `${appOrigin()}/friends?invite=${token}`,
      fromName: self?.name,
    });
    return { ok: true, message: "Invite email sent." };
  });

export const shareInvite = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const self = await me(sql, context.userId);
    const existing = await sql<{ token: string }>`
      select token from friend_invites
      where from_user_id = ${context.userId} and email = 'share' and status = 'open'
      limit 1
    `;
    const token = existing[0]?.token ?? crypto.randomUUID();
    if (!existing[0]) {
      await sql`
        insert into friend_invites (id, from_user_id, email, token, status)
        values (${crypto.randomUUID()}, ${context.userId}, 'share', ${token}, 'open')
      `;
    }
    return {
      url: `${appOrigin()}/friends?invite=${token}`,
      name: self?.name || "A friend",
    };
  });

export const claimInvite = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ token: z.string().min(8).max(80) }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const rows = await sql<{ from_user_id: string; email: string; status: string }>`
      select from_user_id, email, status from friend_invites where token = ${data.token} limit 1
    `;
    const invite = rows[0];
    if (!invite) return { ok: false, message: "Invite not found." };
    if (invite.from_user_id === context.userId) return { ok: false, message: "That is your own invite." };
    if (invite.email !== "share") {
      const self = await me(sql, context.userId);
      if (!self || self.email.toLowerCase() !== invite.email.toLowerCase()) {
        return { ok: false, message: "Sign in with the invited email." };
      }
    }
    const already = await sql<{ status: string }>`
      select status from friendships
      where (user_id = ${invite.from_user_id} and friend_id = ${context.userId})
         or (user_id = ${context.userId} and friend_id = ${invite.from_user_id})
      limit 1
    `;
    if (already[0]?.status === "accepted") return { ok: true, message: "You are already friends." };
    if (!already[0]) {
      await sql`
        insert into friendships (user_id, friend_id, status)
        values (${invite.from_user_id}, ${context.userId}, 'pending')
        on conflict (user_id, friend_id) do nothing
      `;
    }
    if (invite.email !== "share") {
      await sql`update friend_invites set status = 'claimed' where token = ${data.token}`;
    }
    return { ok: true, message: "Request received. Accept it below." };
  });

export const respondFriend = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ fromUserId: z.string().min(1).max(80), accept: z.boolean() }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    if (!data.accept) {
      await sql`
        delete from friendships
        where user_id = ${data.fromUserId} and friend_id = ${context.userId} and status = 'pending'
      `;
      return { ok: true };
    }
    await sql`
      update friendships set status = 'accepted'
      where user_id = ${data.fromUserId} and friend_id = ${context.userId} and status = 'pending'
    `;
    await sql`
      insert into friendships (user_id, friend_id, status)
      values (${context.userId}, ${data.fromUserId}, 'accepted')
      on conflict (user_id, friend_id) do update set status = 'accepted'
    `;
    return { ok: true };
  });

export const tagFriends = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ concertId: z.string().min(1).max(80), friendIds: z.array(z.string().min(1).max(80)).min(1).max(20) }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const owned = await sql<{ id: string }>`
      select id from concerts where user_id = ${context.userId} and id = ${data.concertId} limit 1
    `;
    if (!owned[0]) return { ok: false, message: "Concert not found." };
    let sent = 0;
    for (const friendId of data.friendIds) {
      const friend = await sql<{ status: string }>`
        select status from friendships
        where status = 'accepted' and (
          (user_id = ${context.userId} and friend_id = ${friendId})
          or (user_id = ${friendId} and friend_id = ${context.userId})
        )
        limit 1
      `;
      if (!friend[0]) continue;
      await sql`
        insert into concert_tags (id, concert_id, from_user_id, to_user_id)
        values (${crypto.randomUUID()}, ${data.concertId}, ${context.userId}, ${friendId})
        on conflict (concert_id, from_user_id, to_user_id) do nothing
      `;
      sent += 1;
    }
    return { ok: true, sent };
  });

export const concertTags = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ concertId: z.string().min(1).max(80) }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    return sql<{ id: string; to_name: string; status: string }>`
      select t.id, u.name as to_name, t.status
      from concert_tags t
      join "user" u on u.id = t.to_user_id
      where t.concert_id = ${data.concertId} and t.from_user_id = ${context.userId}
    `;
  });

export const respondTag = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ tagId: z.string().min(1).max(80), accept: z.boolean() }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const tags = await sql<{
      id: string;
      concert_id: string;
      from_user_id: string;
      status: string;
      copied_concert_id: string | null;
    }>`
      select id, concert_id, from_user_id, status, copied_concert_id
      from concert_tags
      where id = ${data.tagId} and to_user_id = ${context.userId}
      limit 1
    `;
    const tag = tags[0];
    if (!tag || tag.status !== "pending") return { ok: false };
    if (!data.accept) {
      await sql`update concert_tags set status = 'declined' where id = ${tag.id}`;
      return { ok: true };
    }
    const concerts = await sql<{
      date: string;
      venue: string;
      city: string;
      country: string;
      country_code: string;
      lineup: unknown;
      festival: boolean;
      festival_name: string | null;
      festival_poster_url: string | null;
    }>`
      select date, venue, city, country, country_code, lineup, festival, festival_name, festival_poster_url
      from concerts where user_id = ${tag.from_user_id} and id = ${tag.concert_id} limit 1
    `;
    const source = concerts[0];
    if (!source) return { ok: false };
    const lineup = Array.isArray(source.lineup) ? source.lineup : [];
    const artistIds = lineup.map((slot) => (slot as { artistId?: string }).artistId).filter(Boolean) as string[];
    if (artistIds.length) {
      const artists = [];
      for (const artistId of artistIds) {
        const rows = await sql<{
          id: string;
          name: string;
          logo_url: string | null;
          thumb_url: string | null;
          genre: string | null;
          country: string | null;
          bio: string | null;
        }>`
          select id, name, logo_url, thumb_url, genre, country, bio
          from artists where user_id = ${tag.from_user_id} and id = ${artistId} limit 1
        `;
        if (rows[0]) artists.push(rows[0]);
      }
      for (const a of artists) {
        await sql`
          insert into artists (id, user_id, name, logo_url, thumb_url, genre, country, bio)
          values (${artistKey(a.name, a.country)}, ${context.userId}, ${a.name}, ${a.logo_url}, ${a.thumb_url}, ${a.genre}, ${a.country}, ${a.bio})
          on conflict (user_id, id) do nothing
        `;
      }
    }
    const copyId = crypto.randomUUID();
    const poster = source.festival_poster_url?.startsWith("https://") ? source.festival_poster_url : null;
    await sql`
      insert into concerts (
        id, user_id, date, venue, city, country, country_code, lineup, notes, rating, favorite,
        festival, festival_name, festival_poster_url, created_at
      ) values (
        ${copyId}, ${context.userId}, ${source.date}, ${source.venue}, ${source.city}, ${source.country},
        ${source.country_code}, ${JSON.stringify(lineup)}::jsonb, '', null, false,
        ${source.festival}, ${source.festival_name ?? ""}, ${poster}, now()
      )
    `;
    await sql`
      update concert_tags set status = 'accepted', copied_concert_id = ${copyId} where id = ${tag.id}
    `;
    return { ok: true };
  });

export const removeFriend = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ friendId: z.string().min(1).max(80) }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    await sql`
      delete from friendships
      where (user_id = ${context.userId} and friend_id = ${data.friendId})
         or (user_id = ${data.friendId} and friend_id = ${context.userId})
    `;
    await sql`
      delete from concert_tags
      where (from_user_id = ${context.userId} and to_user_id = ${data.friendId})
         or (from_user_id = ${data.friendId} and to_user_id = ${context.userId})
    `;
    return { ok: true };
  });

export const renameFriend = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ friendId: z.string().min(1).max(80), nickname: z.string().trim().max(80) }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    await sql`
      update friendships set nickname = ${data.nickname || null}
      where user_id = ${context.userId} and friend_id = ${data.friendId}
    `;
    return { ok: true };
  });

export const removeTag = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ tagId: z.string().min(1).max(80) }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    await sql`
      delete from concert_tags
      where id = ${data.tagId} and from_user_id = ${context.userId}
    `;
    return { ok: true };
  });

export const friendConcerts = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ friendId: z.string().min(1).max(80) }))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const allowed = await sql<{ status: string }>`
      select status from friendships
      where status = 'accepted' and (
        (user_id = ${context.userId} and friend_id = ${data.friendId})
        or (user_id = ${data.friendId} and friend_id = ${context.userId})
      )
      limit 1
    `;
    if (!allowed[0]) return [];
    const rows = await sql<{
      id: string;
      date: string;
      venue: string;
      city: string;
      festival_name: string | null;
      lineup: { artistId?: string }[] | null;
      together: boolean;
    }>`
      select c.id, c.date, c.venue, c.city, c.festival_name, c.lineup,
        exists (
          select 1 from concert_tags t
          where t.status = 'accepted' and (
            (t.from_user_id = ${context.userId} and t.to_user_id = ${data.friendId} and (t.concert_id = c.id or t.copied_concert_id = c.id))
            or
            (t.from_user_id = ${data.friendId} and t.to_user_id = ${context.userId} and (t.concert_id = c.id or t.copied_concert_id = c.id))
          )
        ) as together
      from concerts c
      where c.user_id = ${data.friendId}
      order by c.date desc
    `;
    const artists = await sql<{ id: string; name: string }>`
      select id, name from artists where user_id = ${data.friendId}
    `;
    const names = new Map(artists.map((a) => [a.id, a.name]));
    return rows.map((row) => ({
      id: row.id,
      date: row.date,
      venue: row.venue,
      city: row.city,
      festivalName: row.festival_name,
      artists: (Array.isArray(row.lineup) ? row.lineup : [])
        .map((slot) => names.get(slot.artistId ?? "") || "")
        .filter(Boolean),
      together: row.together,
    }));
  });
