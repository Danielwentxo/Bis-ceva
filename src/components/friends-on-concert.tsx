import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { concertTags, listFriends, removeTag, tagFriends } from "@/lib/friends";
import { useI18n } from "@/lib/i18n";

export function FriendsOnConcert({ concertId }: { concertId: string }) {
  const { t } = useI18n();
  const [friends, setFriends] = useState<{ id: string; name: string; email: string; nickname?: string | null }[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [sent, setSent] = useState<{ id: string; to_name: string; status: string }[]>([]);
  const [message, setMessage] = useState("");

  async function refresh() {
    const [people, tags] = await Promise.all([listFriends(), concertTags({ data: { concertId } })]);
    setFriends(people.friends);
    setSent(tags);
  }

  useEffect(() => {
    void refresh().catch(() => undefined);
  }, [concertId]);

  return (
    <section className="mt-8 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
      <h2 className="text-xs font-medium uppercase tracking-wider text-subtle">{t("friendsWithYou")}</h2>
      {!friends.length ? <p className="mt-2 text-sm text-muted-foreground">{t("friendsNoneYet")}</p> : null}
      {friends.length ? (
        <ul className="mt-3 space-y-2">
          {friends.map((friend) => (
            <li key={friend.id}>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={picked.includes(friend.id)}
                  onChange={(e) =>
                    setPicked((cur) => (e.target.checked ? [...cur, friend.id] : cur.filter((id) => id !== friend.id)))
                  }
                />
                {friend.nickname || friend.name || friend.email}
              </label>
            </li>
          ))}
        </ul>
      ) : null}
      {friends.length ? (
        <Button
          type="button"
          className="mt-3"
          disabled={!picked.length}
          onClick={() => {
            void tagFriends({ data: { concertId, friendIds: picked } })
              .then((res) => {
                setMessage(res.ok ? t("friendsTagged") : res.message ?? "");
                setPicked([]);
                return refresh();
              })
              .catch(() => setMessage(t("friendsLoadError")));
          }}
        >
          {t("friendsAsk")}
        </Button>
      ) : null}
      {sent.length ? (
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          {sent.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-2">
              <span>{row.to_name}: {row.status}</span>
              <Button type="button" variant="outline" onClick={() => void removeTag({ data: { tagId: row.id } }).then(refresh)}>{t("friendsRemove")}</Button>
            </li>
          ))}
        </ul>
      ) : null}
      {message ? <p className="mt-2 text-sm">{message}</p> : null}
    </section>
  );
}
