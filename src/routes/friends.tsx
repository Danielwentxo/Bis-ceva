import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { claimInvite, friendConcerts, inviteFriend, listFriends, removeFriend, renameFriend, respondFriend, respondTag, shareInvite } from "@/lib/friends";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/friends")({
  validateSearch: (search: Record<string, unknown>) => ({
    invite: typeof search.invite === "string" ? search.invite : "",
  }),
  component: FriendsPage,
});

type Friend = { id: string; name: string; email: string; nickname?: string | null };
type Tag = { id: string; from_name: string; date: string; venue: string; city: string; title?: string; artists?: string[]; poster?: string | null };
type FriendShow = { id: string; date: string; venue: string; city: string; festivalName: string | null; artists: string[]; together: boolean };

function FriendsPage() {
  const { t } = useI18n();
  const { invite } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<Friend[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [left, setLeft] = useState(10);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [openFriend, setOpenFriend] = useState<Friend | null>(null);
  const [shows, setShows] = useState<FriendShow[]>([]);

  async function refresh() {
    const data = await listFriends();
    setFriends(data.friends);
    setRequests(data.requests);
    setTags(data.tags);
    setLeft(data.invitesLeft);
  }

  useEffect(() => {
    void refresh().catch(() => setMessage(t("friendsLoadError")));
  }, [t]);

  useEffect(() => {
    if (!invite) return;
    void claimInvite({ data: { token: invite } })
      .then((res) => {
        setMessage(res.message);
        return refresh();
      })
      .catch(() => setMessage(t("friendsInviteOpened")));
  }, [invite, t]);

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="font-display text-4xl font-medium tracking-tight">{t("navFriends")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("friendsLead")}</p>
      </header>

      {requests.length ? (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-medium">{t("friendsRequests")}</h2>
          <ul className="space-y-2">
            {requests.map((req) => (
              <li key={req.id} className="flex items-center justify-between gap-3 rounded-xl bg-card px-3 py-3">
                <span className="min-w-0 truncate text-sm">{req.name || req.email}</span>
                <span className="flex gap-2">
                  <Button type="button" onClick={() => void respondFriend({ data: { fromUserId: req.id, accept: true } }).then(refresh)}>{t("friendsAccept")}</Button>
                  <Button type="button" variant="outline" onClick={() => void respondFriend({ data: { fromUserId: req.id, accept: false } }).then(refresh)}>{t("friendsDecline")}</Button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tags.length ? (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-medium">{t("friendsShows")}</h2>
          <ul className="space-y-2">
            {tags.map((tag) => (
              <li key={tag.id} className="rounded-xl bg-card px-3 py-3">
                <div className="flex gap-3">
                  {tag.poster ? <img src={tag.poster} alt="" className="size-12 shrink-0 rounded-lg object-cover" /> : null}
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{tag.title || tag.venue}</p>
                    {tag.artists?.length ? <p className="truncate text-xs text-muted-foreground">{tag.artists.join(", ")}</p> : null}
                    <p className="text-xs text-muted-foreground">{t("friendsWereYou", { name: tag.from_name, venue: tag.venue, city: tag.city, date: tag.date })}</p>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <Button type="button" onClick={() => void respondTag({ data: { tagId: tag.id, accept: true } }).then(refresh)}>{t("friendsAccept")}</Button>
                  <Button type="button" variant="outline" onClick={() => void respondTag({ data: { tagId: tag.id, accept: false } }).then(refresh)}>{t("friendsDecline")}</Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-medium">{t("friendsList")}</h2>
        {friends.length ? (
          <ul className="space-y-2">
            {friends.map((friend) => (
              <li key={friend.id} className="rounded-xl bg-card px-3 py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <button type="button" className="min-w-0 truncate text-left font-medium hover:underline" onClick={() => { setOpenFriend(friend); void friendConcerts({ data: { friendId: friend.id } }).then(setShows); }}>{friend.nickname || friend.name || friend.email}</button>
                  <span className="flex shrink-0 gap-2">
                    <Button type="button" variant="outline" onClick={() => { setEditing(friend.id); setNickname(friend.nickname || friend.name || ""); }}>{t("friendsEdit")}</Button>
                    <Button type="button" variant="destructive" onClick={() => { if (window.confirm(t("friendsRemoveConfirm"))) void removeFriend({ data: { friendId: friend.id } }).then(refresh); }}>{t("friendsRemove")}</Button>
                  </span>
                </div>
                {editing === friend.id ? (
                  <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); void renameFriend({ data: { friendId: friend.id, nickname } }).then(() => { setEditing(null); return refresh(); }); }}>
                    <Input value={nickname} onChange={(e) => setNickname(e.target.value)} />
                    <Button type="submit">{t("friendsSave")}</Button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t("friendsEmpty")}</p>
        )}
      </section>

      <section className="mt-8 rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
        <h2 className="text-sm font-medium">{t("friendsInviteTitle")}</h2>
        <div className="mt-4">
          <p className="text-sm font-medium">{t("friendsShare")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("friendsShareHint")}</p>
          <Button
            type="button"
            className="mt-3"
            onClick={() => {
              void shareInvite().then(async (res) => {
                const text = t("friendsShareText", { name: res.name, url: res.url });
                if (navigator.share) {
                  await navigator.share({ title: t("navFriends"), text, url: res.url }).catch(() => undefined);
                  return;
                }
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
              }).catch(() => setMessage(t("friendsLoadError")));
            }}
          >
            {t("friendsShare")}
          </Button>
        </div>
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-sm font-medium">{t("friendsInvite")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("friendsEmailHint")}</p>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setBusy(true);
              setMessage("");
              void inviteFriend({ data: { email } })
                .then((res) => {
                  setMessage(res.message);
                  if (res.ok) setEmail("");
                  return refresh();
                })
                .catch(() => setMessage(t("friendsLoadError")))
                .finally(() => setBusy(false));
            }}
          >
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("email")} required />
            <Button type="submit" disabled={busy || left <= 0}>{t("friendsSend")}</Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">{t("friendsLeft", { n: String(left) })}</p>
        </div>
        {message ? <p className="mt-3 text-sm text-foreground">{message}</p> : null}
      </section>

      {openFriend ? (
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium">{openFriend.nickname || openFriend.name || openFriend.email}</h2>
            <Button type="button" variant="outline" onClick={() => setOpenFriend(null)}>{t("back")}</Button>
          </div>
          {shows.length ? (
            <ul className="space-y-2">
              {shows.reduce<typeof shows>((acc, show) => {
                const key = `${show.date.slice(0, 10)}|${show.venue.trim().toLowerCase()}|${show.city.trim().toLowerCase()}`;
                const existing = acc.find((item) => `${item.date.slice(0, 10)}|${item.venue.trim().toLowerCase()}|${item.city.trim().toLowerCase()}` === key);
                if (!existing) acc.push({ ...show, artists: [...show.artists] });
                else existing.artists = [...new Set([...existing.artists, ...show.artists])];
                return acc;
              }, []).map((show) => (
                <li key={show.id} className="rounded-xl bg-card px-3 py-3 text-sm">
                  <p className="font-medium">{show.artists.slice(0, 3).join(", ") || show.festivalName || show.venue}</p>
                  {show.festivalName ? <p className="text-xs text-muted-foreground">{show.festivalName}</p> : null}
                  <p className="text-xs text-muted-foreground">{show.venue} · {show.city}</p>
                  <p className="text-xs text-muted-foreground">{show.date}{show.together ? ` · ${t("friendsTogether")}` : ""}</p>
                </li>
              )})}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{t("friendsNoShows")}</p>
          )}
        </section>
      ) : null}
    </AppShell>
  );
}
