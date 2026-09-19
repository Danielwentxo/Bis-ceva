import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { ArtistMark } from "@/components/artist-mark";
import { CountryFlag } from "@/components/country-flag";
import { EmptyArchive } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatConcertDate, showsLabel } from "@/lib/format";
import { computeStats } from "@/lib/stats";
import { useArchive } from "@/lib/store";

export const Route = createFileRoute("/stats")({ component: StatsPage });

function StatsPage() {
  const hasHydrated = useArchive((s) => s.hasHydrated);
  const concerts = useArchive((s) => s.concerts);
  const artists = useArchive((s) => s.artists);
  const seedDemo = useArchive((s) => s.seedDemo);
  const stats = useMemo(() => computeStats(concerts, artists), [concerts, artists]);
  const topArtist = stats.artistCounts[0];

  if (!hasHydrated) {
    return (
      <AppShell>
        <Skeleton className="h-10 w-48" />
      </AppShell>
    );
  }

  if (!concerts.length) {
    return (
      <AppShell>
        <EmptyArchive onSeed={seedDemo} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="mb-8">
        <p className="text-sm font-medium text-muted-foreground">Bilanțul scenei</p>
        <h1 className="mt-1 font-display text-4xl font-medium tracking-tight">Statistici</h1>
      </header>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Concerte" value={String(stats.totalShows)} />
        <Tile label="Formații" value={String(stats.uniqueArtists)} />
        <Tile label="Locații" value={String(stats.uniqueVenues)} />
        <Tile label="Țări" value={String(stats.uniqueCountries)} />
      </div>
      {topArtist ? (
        <Link
          to="/artists/$slug"
          params={{ slug: topArtist.data.id }}
          className="mt-6 flex items-center gap-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]"
        >
          <ArtistMark artist={topArtist.data} size="xl" />
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-subtle">Cea mai văzută formație</p>
            <p className="mt-1 font-display text-2xl font-medium">{topArtist.data.name}</p>
            <p className="text-sm text-muted-foreground">{showsLabel(topArtist.count)}</p>
          </div>
        </Link>
      ) : null}
      <dl className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
        <Meta label="Primul concert" value={stats.firstShow ? formatConcertDate(stats.firstShow.date) : "—"} />
        <Meta label="Cel mai recent" value={stats.lastShow ? formatConcertDate(stats.lastShow.date) : "—"} />
        <Meta label="Festivale" value={String(stats.festivals)} />
        <Meta label="Favorite" value={String(stats.favorites)} />
      </dl>
      {stats.countryCounts.length ? (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-xl font-medium">Țări</h2>
          <ul className="space-y-2">
            {stats.countryCounts.map((row) => (
              <li key={row.key} className="flex items-center justify-between rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-border)]">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <CountryFlag code={row.data.countryCode} />
                  {row.data.country}
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">{row.count}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <div className="mt-10">
        <button
          type="button"
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          onClick={() => {
            if (window.confirm("Ștergi toate concertele din acest cont?")) {
              void useArchive.getState().clearArchive();
            }
          }}
        >
          Golește arhiva
        </button>
      </div>
    </AppShell>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card px-4 py-4 shadow-[var(--shadow-border)]">
      <p className="text-xs font-medium uppercase tracking-wider text-subtle">{label}</p>
      <p className="mt-1 font-display text-3xl font-medium tabular-nums">{value}</p>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-border)]">
      <dt className="text-xs uppercase tracking-wider text-subtle">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
