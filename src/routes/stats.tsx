import { Link, createFileRoute } from "@tanstack/react-router";
import { Share2 } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ArtistMark } from "@/components/artist-mark";
import { CountryFlag } from "@/components/country-flag";
import { EmptyArchive } from "@/components/empty-state";
import { YearBars } from "@/components/year-bars";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "@/lib/auth/client";
import { APP_DOMAIN, APP_NAME } from "@/lib/brand";
import { formatConcertDate, showsLabel } from "@/lib/format";
import { extraLabel } from "@/lib/i18n-extras";
import { useI18n } from "@/lib/i18n";
import { canvasToBlob, drawStatsPosterReady } from "@/lib/share-card";
import { computeStats } from "@/lib/stats";
import { useArchive } from "@/lib/store";

export const Route = createFileRoute("/stats")({ component: StatsPage });

async function confirmDeleteAccount(locale: string) {
  if (!window.confirm(extraLabel(locale, "deleteAccountConfirm"))) return;
  try {
    await useArchive.getState().deleteAccount();
    await signOut("/");
  } catch (err) {
    toast.error(err instanceof Error ? err.message : extraLabel(locale, "deleteAccount"));
  }
}

function AccountActions({ locale, showClear }: { locale: string; showClear: boolean }) {
  const { t } = useI18n();
  return (
    <div className="mt-10 flex flex-wrap gap-4">
      <Link to="/transfer" className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
        {extraLabel(locale, "transferTitle")}
      </Link>
      {showClear ? (
        <button
          type="button"
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          onClick={() => {
            if (window.confirm(t("clearArchiveConfirm"))) void useArchive.getState().clearArchive();
          }}
        >
          {t("clearArchive")}
        </button>
      ) : null}
      <button
        type="button"
        className="text-xs text-destructive underline-offset-4 hover:underline"
        onClick={() => void confirmDeleteAccount(locale)}
      >
        {extraLabel(locale, "deleteAccount")}
      </button>
    </div>
  );
}

function buildShareText(stats: ReturnType<typeof computeStats>) {
  const top = stats.artistCounts.slice(0, 3).map((row) => row.data.name).join(", ");
  return [
    `${stats.totalShows} concerts. ${stats.uniqueArtists} artists. ${stats.uniqueCountries} countries.`,
    top ? `Most seen: ${top}.` : "",
    `${APP_NAME} — ${APP_DOMAIN}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function StatsPage() {
  const { t, locale } = useI18n();
  const hasHydrated = useArchive((s) => s.hasHydrated);
  const concerts = useArchive((s) => s.concerts);
  const artists = useArchive((s) => s.artists);
  const seedDemo = useArchive((s) => s.seedDemo);
  const stats = useMemo(() => computeStats(concerts, artists), [concerts, artists]);
  const topArtists = stats.artistCounts.slice(0, 3);
  const topCountries = stats.countryCounts.slice(0, 8);
  const topVenues = stats.venueCounts.slice(0, 8);
  const topOrigins = stats.artistOriginCounts.slice(0, 8);
  const topGenres = stats.genreCounts.slice(0, 8);

  async function shareStats() {
    try {
      const canvas = await drawStatsPosterReady(stats);
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], "my-gig-history-stats.png", { type: "image/png" });
      const text = buildShareText(stats);
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: t("statsTitle"), text });
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : extraLabel(locale, "shareStats"));
    }
  }

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
        <AccountActions locale={locale} showClear={false} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{t("statsLead")}</p>
          <h1 className="mt-1 font-display text-4xl font-medium tracking-tight">{t("statsTitle")}</h1>
        </div>
        <Button type="button" variant="outline" onClick={() => void shareStats()}>
          <Share2 className="size-4" />
          {extraLabel(locale, "shareStats")}
        </Button>
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
          <YearBars years={stats.yearCounts} />
        </section>
      ) : null}

      {topArtists.length ? (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-xl font-medium">{t("mostSeen")}</h2>
          <ul className="space-y-2">
            {topArtists.map((row, index) => (
              <li key={row.key}>
                <Link to="/artists/$slug" params={{ slug: row.data.id }} className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-border)]">
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

      {topVenues.length ? (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-xl font-medium">{extraLabel(locale, "topVenues")}</h2>
          <ul className="space-y-2">
            {topVenues.map((row, index) => (
              <li key={row.key} className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-border)]">
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span className="w-5 text-subtle">{index + 1}</span>
                    {row.data.venue}
                  </span>
                  <span className="mt-1 block truncate pl-7 text-xs text-muted-foreground">
                    {row.data.city}, {row.data.country}
                  </span>
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">{row.count}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {topGenres.length ? (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-xl font-medium">{extraLabel(locale, "topGenres")}</h2>
          <ul className="space-y-2">
            {topGenres.map((row, index) => (
              <li key={row.key} className="flex items-center justify-between rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-border)]">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span className="w-5 text-subtle">{index + 1}</span>
                  {row.data.genre}
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
      </dl>

      <AccountActions locale={locale} showClear />
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
