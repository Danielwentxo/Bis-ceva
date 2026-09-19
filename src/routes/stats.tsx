import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { ArtistMark } from "@/components/artist-mark";
import { CountryFlag } from "@/components/country-flag";
import { EmptyArchive } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatConcertDate, showsLabel } from "@/lib/format";
import { extraLabel } from "@/lib/i18n-extras";
import { useI18n } from "@/lib/i18n";
import { computeStats } from "@/lib/stats";
import { useArchive } from "@/lib/store";

export const Route = createFileRoute("/stats")({ component: StatsPage });

function StatsPage() {
  const { t, locale } = useI18n();
  const hasHydrated = useArchive((s) => s.hasHydrated);
  const concerts = useArchive((s) => s.concerts);
  const artists = useArchive((s) => s.artists);
  const seedDemo = useArchive((s) => s.seedDemo);
  const stats = useMemo(() => computeStats(concerts, artists), [concerts, artists]);
  const topArtists = stats.artistCounts.slice(0, 3);
  const topCountries = stats.countryCounts.slice(0, 3);
  const topOrigins = stats.artistOriginCounts.slice(0, 8);
  const maxYear = Math.max(1, ...stats.yearCounts.map((y) => y.count));

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
        <p className="text-sm font-medium text-muted-foreground">{t("statsLead")}</p>
        <h1 className="mt-1 font-display text-4xl font-medium tracking-tight">{t("statsTitle")}</h1>
      </header>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label={t("tileConcerts")} value={String(stats.totalShows)} />
        <Tile label={t("tileArtists")} value={String(stats.uniqueArtists)} />
        <Tile label={t("tileVenues")} value={String(stats.uniqueVenues)} />
        <Tile label={t("tileCountries")} value={String(stats.uniqueCountries)} />
      </div>

      {stats.yearCounts.length ? (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-xl font-medium">{extraLabel(locale, "concertsPerYear")}</h2>
          <div className="flex items-end gap-2 rounded-2xl bg-card px-4 py-5 shadow-[var(--shadow-border)]">
            {stats.yearCounts.map((row) => (
              <div key={row.year} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <p className="text-xs tabular-nums text-muted-foreground">{row.count}</p>
                <div className="flex h-28 w-full items-end justify-center">
                  <div
                    className="w-full max-w-10 rounded-t-md bg-primary"
                    style={{ height: `${Math.max(8, (row.count / maxYear) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] tabular-nums text-subtle">{row.year}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {topArtists.length ? (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-xl font-medium">{t("mostSeen")}</h2>
          <ul className="space-y-2">
            {topArtists.map((row, index) => (
              <li key={row.key}>
                <Link
                  to="/artists/$slug"
                  params={{ slug: row.data.id }}
                  className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-border)]"
                >
                  <span className="w-5 text-sm tabular-nums text-subtle">{index + 1}</span>
                  <ArtistMark artist={row.data} size="sm" />
                  <span className="min-w-0 flex-1 truncate font-medium">{row.data.name}</span>
                  <span className="text-sm tabular-nums text-muted-foreground">{showsLabel(row.count)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {topCountries.length ? (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-xl font-medium">{extraLabel(locale, "topCountries")}</h2>
          <ul className="space-y-2">
            {topCountries.map((row, index) => (
              <li key={row.key} className="flex items-center justify-between rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-border)]">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span className="w-5 text-subtle">{index + 1}</span>
                  <CountryFlag code={row.data.countryCode} />
                  {row.data.country}
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">{row.count}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {topOrigins.length ? (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-xl font-medium">{extraLabel(locale, "bandsByCountry")}</h2>
          <ul className="space-y-2">
            {topOrigins.map((row) => (
              <li key={row.key} className="flex items-center justify-between rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-border)]">
                <span className="text-sm font-medium">{row.data.country}</span>
                <span className="text-sm tabular-nums text-muted-foreground">{row.count}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <dl className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
        <Meta label={t("firstShow")} value={stats.firstShow ? formatConcertDate(stats.firstShow.date) : "\u2014"} />
        <Meta label={t("lastShow")} value={stats.lastShow ? formatConcertDate(stats.lastShow.date) : "\u2014"} />
        <Meta label={t("favorites")} value={String(stats.favorites)} />
      </dl>

      <div className="mt-10">
        <button
          type="button"
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          onClick={() => {
            if (window.confirm(t("clearArchiveConfirm"))) {
              void useArchive.getState().clearArchive();
            }
          }}
        >
          {t("clearArchive")}
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
