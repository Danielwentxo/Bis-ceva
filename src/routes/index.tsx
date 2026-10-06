import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ConcertCard } from "@/components/concert-card";
import { FestivalGroupCard, festivalKey } from "@/components/festival-group-card";
import { BackupReminder } from "@/components/backup-reminder";
import { EmptyArchive } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { artistsLabel, formatConcertDate, showsLabel, todayIso } from "@/lib/format";
import { extraLabel } from "@/lib/i18n-extras";
import { useI18n } from "@/lib/i18n";
import { computeStats, concertMatchesStatsFilter, type StatsListFilter } from "@/lib/stats";
import { useArchive } from "@/lib/store";
import type { Concert } from "@/lib/types";
import { cn } from "@/lib/utils";

type HomeSearch = StatsListFilter & { q?: string; from?: string };

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): HomeSearch => {
    const next: HomeSearch = {};
    if (typeof search.q === "string" && search.q.length > 0) next.q = search.q;
    if (typeof search.country === "string" && search.country.length > 0) next.country = search.country;
    if (typeof search.venue === "string" && search.venue.length > 0) next.venue = search.venue;
    if (typeof search.genre === "string" && search.genre.length > 0) next.genre = search.genre;
    if (typeof search.origin === "string" && search.origin.length > 0) next.origin = search.origin;
    if (typeof search.from === "string" && search.from.length > 0) next.from = search.from;
    return next;
  },
  component: Home,
});

function groupList(list: Concert[]) {
  const items: Array<{ type: "concert"; concert: Concert } | { type: "festival"; key: string; concerts: Concert[] }> = [];
  const seen = new Set<string>();
  const byFest = new Map<string, Concert[]>();
  for (const concert of list) {
    const key = festivalKey(concert);
    if (!key) continue;
    const bucket = byFest.get(key) ?? [];
    bucket.push(concert);
    byFest.set(key, bucket);
  }
  for (const concert of list) {
    const key = festivalKey(concert);
    if (key && (byFest.get(key)?.length ?? 0) > 1) {
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({ type: "festival", key, concerts: byFest.get(key) ?? [concert] });
      continue;
    }
    items.push({ type: "concert", concert });
  }
  return items;
}

function Home() {
  const { t, locale } = useI18n();
  const search = Route.useSearch();
  const hasHydrated = useArchive((s) => s.hasHydrated);
  const concerts = useArchive((s) => s.concerts);
  const artists = useArchive((s) => s.artists);
  const seedDemo = useArchive((s) => s.seedDemo);
  const [year, setYear] = useState<string>("all");
  const [q, setQ] = useState(search.q ?? "");

  const stats = useMemo(() => computeStats(concerts, artists), [concerts, artists]);
  const years = useMemo(
    () => [...new Set(concerts.map((c) => c.date.slice(0, 4)))].sort((a, b) => b.localeCompare(a)),
    [concerts],
  );

  const today = todayIso();
  const md = today.slice(5, 10);
  const onThisDay = useMemo(
    () => concerts.filter((c) => c.date.slice(5, 10) === md && c.date.slice(0, 10) !== today).sort((a, b) => b.date.localeCompare(a.date)),
    [concerts, md, today],
  );

  const statsFilter: StatsListFilter = {
    country: search.country,
    venue: search.venue,
    genre: search.genre,
    origin: search.origin,
  };
  const hasStatsFilter = Boolean(statsFilter.country || statsFilter.venue || statsFilter.genre || statsFilter.origin);
  const filterTitle = statsFilter.country
    ? stats.countryCounts.find((row) => row.key === statsFilter.country)?.data.country ?? statsFilter.country
    : statsFilter.venue
      ? stats.venueCounts.find((row) => row.key === statsFilter.venue)?.data.venue ?? statsFilter.venue
      : statsFilter.genre
        ? stats.genreCounts.find((row) => row.key === statsFilter.genre)?.data.genre ?? statsFilter.genre
        : statsFilter.origin
          ? stats.artistOriginCounts.find((row) => row.key === statsFilter.origin)?.data.country ?? statsFilter.origin
          : "";
  const backTo = search.from === "venues" ? "/venues" : search.from === "stats" ? "/stats" : null;
  const backLabel = search.from === "venues" ? t("venuesTitle") : search.from === "stats" ? t("statsTitle") : t("allYears");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return concerts
      .filter((c) => concertMatchesStatsFilter(c, artists, statsFilter))
      .filter((c) => (year === "all" ? true : c.date.startsWith(year)))
      .filter((c) => {
        if (!needle) return true;
        const lineup = c.lineup.map((l) => artists[l.artistId]?.name ?? "").join(" ").toLowerCase();
        return (
          lineup.includes(needle) ||
          c.venue.toLowerCase().includes(needle) ||
          c.city.toLowerCase().includes(needle) ||
          (c.festivalName ?? "").toLowerCase().includes(needle)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [concerts, artists, year, q, statsFilter.country, statsFilter.venue, statsFilter.genre, statsFilter.origin]);

  const upcoming = groupList(filtered.filter((c) => c.date > today));
  const past = filtered.filter((c) => c.date <= today);
  const groups = new Map<string, typeof past>();
  for (const c of past) {
    const y = c.date.slice(0, 4);
    const list = groups.get(y) ?? [];
    list.push(c);
    groups.set(y, list);
  }

  useEffect(() => {
    if (!hasHydrated || !concerts.length) return;
    const saved = sessionStorage.getItem("list-scroll");
    if (saved) window.scrollTo(0, Number(saved) || 0);
    const onScroll = () => sessionStorage.setItem("list-scroll", String(window.scrollY));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasHydrated, concerts.length]);

  return (
    <AppShell>
      <header className="mb-8">
        <p className="text-sm font-medium text-muted-foreground">{t("liveArchive")}</p>
        <h1 className="mt-1 font-display text-4xl font-medium tracking-tight md:text-5xl">{t("yourConcerts")}</h1>
        {hasHydrated ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {showsLabel(stats.totalShows)}{" \u00b7 "}{artistsLabel(stats.uniqueArtists)}
          </p>
        ) : (
          <Skeleton className="mt-3 h-4 w-40" />
        )}
      </header>
      {hasHydrated && concerts.length ? <BackupReminder /> : null}

      {!hasHydrated ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : concerts.length === 0 ? (
        <EmptyArchive onSeed={seedDemo} />
      ) : (
        <>
          {hasStatsFilter || backTo ? (
            <div className="mb-6">
              {backTo ? (
                <Button asChild variant="outline" className="mb-3">
                  <Link to={backTo}>
                    <ArrowLeft className="size-4" />
                    {backLabel}
                  </Link>
                </Button>
              ) : null}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-border)]">
                <p className="text-sm font-medium">{filterTitle}</p>
              </div>
            </div>
          ) : null}

          {!hasStatsFilter && onThisDay.length ? (
            <section className="mb-8 rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
              <h2 className="text-xs font-medium uppercase tracking-wider text-subtle">{extraLabel(locale, "onThisDay")}</h2>
              <ul className="mt-3 space-y-2">
                {onThisDay.slice(0, 4).map((c) => {
                  const name = c.festivalName || artists[c.lineup[0]?.artistId ?? ""]?.name || c.venue;
                  const yearsAgo = Number(today.slice(0, 4)) - Number(c.date.slice(0, 4));
                  return (
                    <li key={c.id}>
                      <Link to="/concerts/$id" params={{ id: c.id }} className="block text-sm hover:text-foreground">
                        <span className="text-muted-foreground">{yearsAgo}y{" \u00b7 "}{formatConcertDate(c.date)}</span>
                        {" \u2014 "}
                        <span className="font-medium">{name}</span>
                        <span className="text-muted-foreground">{" \u00b7 "}{c.city}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          <div className="mb-6 space-y-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("searchShows")}
              className="flex h-11 w-full rounded-lg bg-secondary px-3 text-sm text-foreground shadow-[var(--shadow-border)] outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/50"
            />
            <div className="flex gap-2 overflow-x-auto pb-1">
              <YearChip active={year === "all"} onClick={() => setYear("all")}>
                {t("allYears")}
              </YearChip>
              {years.map((y) => (
                <YearChip key={y} active={year === y} onClick={() => setYear(y)}>
                  {y}
                </YearChip>
              ))}
            </div>
          </div>

          {upcoming.length ? (
            <section className="mb-8">
              <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-subtle">{t("upcoming")}</h2>
              <div className="space-y-3">
                {upcoming.map((item) =>
                  item.type === "festival" ? (
                    <FestivalGroupCard key={item.key} concerts={item.concerts} artists={artists} />
                  ) : (
                    <ConcertCard key={item.concert.id} concert={item.concert} artists={artists} />
                  ),
                )}
              </div>
            </section>
          ) : null}

          {[...groups.entries()].map(([y, list]) => (
            <section key={y} className="mb-8">
              <h2 className="mb-3 font-display text-2xl font-medium">{y}</h2>
              <div className="space-y-3">
                {groupList(list).map((item) =>
                  item.type === "festival" ? (
                    <FestivalGroupCard key={item.key} concerts={item.concerts} artists={artists} />
                  ) : (
                    <ConcertCard key={item.concert.id} concert={item.concert} artists={artists} />
                  ),
                )}
              </div>
            </section>
          ))}

          {!filtered.length ? <p className="py-10 text-center text-sm text-muted-foreground">{t("noMatches")}</p> : null}
        </>
      )}
    </AppShell>
  );
}

function YearChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 shrink-0 rounded-full px-3.5 text-sm font-medium transition-colors duration-150",
        active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}
