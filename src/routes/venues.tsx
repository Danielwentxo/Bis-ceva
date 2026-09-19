import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { CountryFlag } from "@/components/country-flag";
import { EmptyArchive } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { showsLabel, venuesLabel } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { computeStats } from "@/lib/stats";
import { useArchive } from "@/lib/store";

export const Route = createFileRoute("/venues")({ component: VenuesPage });

function VenuesPage() {
  const { t } = useI18n();
  const hasHydrated = useArchive((s) => s.hasHydrated);
  const concerts = useArchive((s) => s.concerts);
  const artists = useArchive((s) => s.artists);
  const seedDemo = useArchive((s) => s.seedDemo);

  const stats = useMemo(() => computeStats(concerts, artists), [concerts, artists]);
  const byCountry = useMemo(() => {
    const map = new Map<string, typeof stats.venueCounts>();
    for (const row of stats.venueCounts) {
      const key = row.data.country;
      const list = map.get(key) ?? [];
      list.push(row);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [stats.venueCounts]);

  return (
    <AppShell>
      <header className="mb-6">
        <p className="text-sm font-medium text-muted-foreground">{t("venuesLead")}</p>
        <h1 className="mt-1 font-display text-4xl font-medium tracking-tight">{t("venuesTitle")}</h1>
        {hasHydrated ? (
          <p className="mt-2 text-sm text-muted-foreground">{venuesLabel(stats.uniqueVenues)}</p>
        ) : null}
      </header>

      {!hasHydrated ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      ) : concerts.length === 0 ? (
        <EmptyArchive onSeed={seedDemo} />
      ) : (
        <div className="space-y-8">
          {byCountry.map(([country, rows]) => (
            <section key={country}>
              <h2 className="mb-3 flex items-center gap-2 font-display text-2xl font-medium">
                <CountryFlag code={rows[0]?.data.countryCode ?? ""} />
                {country}
              </h2>
              <ul className="space-y-2">
                {rows.map((row) => (
                  <li key={row.key}>
                    <Link
                      to="/"
                      search={{ q: row.data.venue }}
                      className="flex items-center justify-between rounded-2xl bg-card px-4 py-4 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{row.data.venue}</p>
                        <p className="text-sm text-muted-foreground">{row.data.city}</p>
                      </div>
                      <p className="ml-3 shrink-0 text-sm tabular-nums text-muted-foreground">
                        {showsLabel(row.count)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </AppShell>
  );
}
