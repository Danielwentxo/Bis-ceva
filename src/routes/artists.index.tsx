import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ArtistMark } from "@/components/artist-mark";
import { EmptyArchive } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { artistsLabel, showsLabel } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { computeStats, originCountry } from "@/lib/stats";
import { useArchive } from "@/lib/store";
import type { Artist } from "@/lib/types";

type ArtistSearch = { genre?: string; origin?: string; from?: string };

export const Route = createFileRoute("/artists/")({
  validateSearch: (search: Record<string, unknown>): ArtistSearch => {
    const next: ArtistSearch = {};
    if (typeof search.genre === "string" && search.genre) next.genre = search.genre;
    if (typeof search.origin === "string" && search.origin) next.origin = search.origin;
    if (typeof search.from === "string" && search.from) next.from = search.from;
    return next;
  },
  component: ArtistsPage,
});

function artistGenres(artist: Artist) {
  return `${artist.genre ?? ""} ${artist.style ?? ""}`
    .split(/[,;/|&]+/)
    .map((part) => part.trim().toLowerCase())
    .filter((part) => part.length > 1);
}

function ArtistsPage() {
  const { t } = useI18n();
  const search = Route.useSearch();
  const hasHydrated = useArchive((s) => s.hasHydrated);
  const concerts = useArchive((s) => s.concerts);
  const artists = useArchive((s) => s.artists);
  const seedDemo = useArchive((s) => s.seedDemo);
  const [q, setQ] = useState("");

  const stats = useMemo(() => computeStats(concerts, artists), [concerts, artists]);
  const filterTitle = search.genre
    ? stats.genreCounts.find((row) => row.key === search.genre)?.data.genre ?? search.genre
    : search.origin
      ? stats.artistOriginCounts.find((row) => row.key === search.origin)?.data.country ?? search.origin
      : "";

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return stats.artistCounts.filter((row) => {
      if (search.genre && !artistGenres(row.data).includes(search.genre.toLowerCase())) return false;
      if (search.origin && originCountry(row.data.country)?.toLowerCase() !== search.origin.toLowerCase()) return false;
      if (needle && !row.data.name.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [stats.artistCounts, q, search.genre, search.origin]);

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
          {filterTitle ? (
            <div className="mb-5">
              {search.from === "stats" ? (
                <Button asChild variant="outline" className="mb-3">
                  <Link to="/stats">
                    <ArrowLeft className="size-4" />
                    {t("statsTitle")}
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="mb-3">
                  <Link to="/artists">
                    <ArrowLeft className="size-4" />
                    {t("navArtists")}
                  </Link>
                </Button>
              )}
              <div className="rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-border)]">
                <p className="text-sm font-medium">{filterTitle}</p>
              </div>
            </div>
          ) : null}
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
          {!rows.length ? <p className="py-10 text-center text-sm text-muted-foreground">{t("noMatches")}</p> : null}
        </>
      )}
    </AppShell>
  );
}
