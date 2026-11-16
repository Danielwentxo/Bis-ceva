import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { inviteFriend, listFriends, respondFriend, respondTag } from "@/lib/friends";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/friends")({
  validateSearch: (search: Record<string, unknown>) => ({
    invite: typeof search.invite === "string" ? search.invite : "",
  }),
  component: FriendsPage,
});

type Friend = { id: string; name: string; email: string };
type Tag = { id: string; from_name: string; date: string; venue: string; city: string };

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
    setMessage(t("friendsInviteOpened"));
  }, [invite, t]);

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="font-display text-4xl font-medium tracking-tight">{t("navFriends")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("friendsLead")}</p>
      </header>

      <section className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
        <h2 className="text-sm font-medium">{t("friendsInvite")}</h2>
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
        {message ? <p className="mt-2 text-sm text-foreground">{message}</p> : null}
      </section>

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
                <p className="text-sm">{t("friendsWereYou", { name: tag.from_name, venue: tag.venue, city: tag.city, date: tag.date })}</p>
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
              <li key={friend.id} className="rounded-xl bg-card px-3 py-3 text-sm">{friend.name || friend.email}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t("friendsEmpty")}</p>
        )}
      </section>
    </AppShell>
  );
}
