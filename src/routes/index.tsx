import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ConcertCard } from "@/components/concert-card";
import { EmptyArchive } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { artistsLabel, showsLabel, todayIso } from "@/lib/format";
import { computeStats } from "@/lib/stats";
import { useArchive } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search.q === "string" && search.q.length > 0 ? { q: search.q } : {},
  component: Home,
});

function Home() {
  const { q: qParam } = Route.useSearch();
  const hasHydrated = useArchive((s) => s.hasHydrated);
  const concerts = useArchive((s) => s.concerts);
  const artists = useArchive((s) => s.artists);
  const seedDemo = useArchive((s) => s.seedDemo);
  const [year, setYear] = useState<string>("all");
  const [q, setQ] = useState(qParam ?? "");

  const stats = useMemo(() => computeStats(concerts, artists), [concerts, artists]);
  const years = useMemo(
    () => [...new Set(concerts.map((c) => c.date.slice(0, 4)))].sort((a, b) => b.localeCompare(a)),
    [concerts],
  );

  const today = todayIso();
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return concerts
      .filter((c) => (year === "all" ? true : c.date.startsWith(year)))
      .filter((c) => {
        if (!needle) return true;
        const lineup = c.lineup
          .map((l) => artists[l.artistId]?.name ?? "")
          .join(" ")
          .toLowerCase();
        return (
          lineup.includes(needle) ||
          c.venue.toLowerCase().includes(needle) ||
          c.city.toLowerCase().includes(needle)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [concerts, artists, year, q]);

  const upcoming = filtered.filter((c) => c.date > today);
  const past = filtered.filter((c) => c.date <= today);
  const groups = new Map<string, typeof past>();
  for (const c of past) {
    const y = c.date.slice(0, 4);
    const list = groups.get(y) ?? [];
    list.push(c);
    groups.set(y, list);
  }

  return (
    <AppShell>
      <header className="mb-8">
        <p className="text-sm font-medium text-muted-foreground">Arhiva live</p>
        <h1 className="mt-1 font-display text-4xl font-medium tracking-tight md:text-5xl">
          Concertele tale
        </h1>
        {hasHydrated ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {showsLabel(stats.totalShows)} · {artistsLabel(stats.uniqueArtists)}
          </p>
        ) : (
          <Skeleton className="mt-3 h-4 w-40" />
        )}
      </header>

      {!hasHydrated ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : concerts.length === 0 ? (
        <EmptyArchive onSeed={seedDemo} />
      ) : (
        <>
          <div className="mb-6 space-y-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Caută formație, locație, oraș"
              className="flex h-11 w-full rounded-lg bg-secondary px-3 text-sm text-foreground shadow-[var(--shadow-border)] outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/50"
            />
            <div className="flex gap-2 overflow-x-auto pb-1">
              <YearChip active={year === "all"} onClick={() => setYear("all")}>
                Toți anii
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
              <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-subtle">
                Urmează
              </h2>
              <div className="space-y-3">
                {upcoming.map((c) => (
                  <ConcertCard key={c.id} concert={c} artists={artists} />
                ))}
              </div>
            </section>
          ) : null}

          {[...groups.entries()].map(([y, list]) => (
            <section key={y} className="mb-8">
              <h2 className="mb-3 font-display text-2xl font-medium">{y}</h2>
              <div className="space-y-3">
                {list.map((c) => (
                  <ConcertCard key={c.id} concert={c} artists={artists} />
                ))}
              </div>
            </section>
          ))}

          {!filtered.length ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nimic nu se potrivește cu filtrul ăsta.
            </p>
          ) : null}
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
