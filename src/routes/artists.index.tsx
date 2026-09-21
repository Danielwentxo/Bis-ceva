import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ArtistMark } from "@/components/artist-mark";
import { EmptyArchive } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { artistsLabel, showsLabel } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { computeStats } from "@/lib/stats";
import { useArchive } from "@/lib/store";

export const Route = createFileRoute("/artists/")({ component: ArtistsPage });

function ArtistsPage() {
  const { t } = useI18n();
  const hasHydrated = useArchive((s) => s.hasHydrated);
  const concerts = useArchive((s) => s.concerts);
  const artists = useArchive((s) => s.artists);
  const seedDemo = useArchive((s) => s.seedDemo);
  const [q, setQ] = useState("");

  const stats = useMemo(() => computeStats(concerts, artists), [concerts, artists]);
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return stats.artistCounts.filter((row) =>
      needle ? row.data.name.toLowerCase().includes(needle) : true,
    );
  }, [stats.artistCounts, q]);

  return (
    <AppShell>
      <header className="mb-6">
        <p className="text-sm font-medium text-muted-foreground">{t("artistsLead")}</p>
        <h1 className="mt-1 font-display text-4xl font-medium tracking-tight">{t("navArtists")}</h1>
        {hasHydrated ? (
          <p className="mt-2 text-sm text-muted-foreground">{artistsLabel(stats.uniqueArtists)}</p>
        ) : null}
      </header>

      {!hasHydrated ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : concerts.length === 0 ? (
        <EmptyArchive onSeed={seedDemo} />
      ) : (
        <>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchArtist")}
            className="mb-5 flex h-11 w-full rounded-lg bg-secondary px-3 text-sm text-foreground shadow-[var(--shadow-border)] outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/50"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {rows.map((row) => (
              <Link
                key={row.key}
                to="/artists/$slug"
                params={{ slug: row.data.id }}
                className="flex flex-col items-center rounded-2xl bg-card px-3 py-5 text-center shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
              >
                <ArtistMark artist={row.data} size="xl" />
                <p className="mt-3 line-clamp-2 text-sm font-medium">{row.data.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{showsLabel(row.count)}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
