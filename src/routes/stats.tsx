import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { ArtistMark } from "@/components/artist-mark";
import { CountryFlag } from "@/components/country-flag";
import { EmptyArchive } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  artistsLabel,
  countriesLabel,
  formatConcertDate,
  showsLabel,
  venuesLabel,
} from "@/lib/format";
import { computeStats } from "@/lib/stats";
import { useArchive } from "@/lib/store";

export const Route = createFileRoute("/stats")({ component: StatsPage });

const MONTHS = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function StatsPage() {
  const hasHydrated = useArchive((s) => s.hasHydrated);
  const concerts = useArchive((s) => s.concerts);
  const artists = useArchive((s) => s.artists);
  const seedDemo = useArchive((s) => s.seedDemo);
  const stats = useMemo(() => computeStats(concerts, artists), [concerts, artists]);

  const topArtist = stats.artistCounts[0];
  const topVenue = stats.venueCounts[0];
  const topCountry = stats.countryCounts[0];
  const topCity = stats.cityCounts[0];

  const yearData = stats.yearCounts.map((y) => ({ name: String(y.year), count: y.count }));
  const monthData = stats.monthCounts.map((m) => ({
    name: MONTHS[m.month],
    count: m.count,
  }));

  if (!hasHydrated) {
    return (
      <AppShell>
        <Skeleton className="h-10 w-48" />
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
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
        <StatTile label="Concerte" value={String(stats.totalShows)} />
        <StatTile label="Formații" value={String(stats.uniqueArtists)} />
        <StatTile label="Locații" value={String(stats.uniqueVenues)} />
        <StatTile label="Țări" value={String(stats.uniqueCountries)} />
      </div>

      {topArtist ? (
        <Link
          to="/artists/$slug"
          params={{ slug: topArtist.data.id }}
          className="mt-6 flex items-center gap-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]"
        >
          <ArtistMark artist={topArtist.data} size="xl" />
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-subtle">
              Cea mai văzută formație
            </p>
            <p className="mt-1 font-display text-2xl font-medium">{topArtist.data.name}</p>
            <p className="text-sm text-muted-foreground">{showsLabel(topArtist.count)}</p>
          </div>
        </Link>
      ) : null}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {topVenue ? (
          <Highlight
            kicker="Cea mai vizitată locație"
            title={topVenue.data.venue}
            body={`${topVenue.data.city} · ${showsLabel(topVenue.count)}`}
            flag={topVenue.data.countryCode}
          />
        ) : null}
        {topCity ? (
          <Highlight
            kicker="Cel mai vizitat oraș"
            title={topCity.data.city}
            body={`${topCity.data.country} · ${showsLabel(topCity.count)}`}
            flag={topCity.data.countryCode}
          />
        ) : null}
        {topCountry ? (
          <Highlight
            kicker="Țara cu cele mai multe concerte"
            title={topCountry.data.country}
            body={showsLabel(topCountry.count)}
            flag={topCountry.data.countryCode}
          />
        ) : null}
        {stats.busiestYear ? (
          <Highlight
            kicker="Anul cel mai plin"
            title={String(stats.busiestYear.year)}
            body={showsLabel(stats.busiestYear.count)}
          />
        ) : null}
      </div>

      <section className="mt-8 rounded-2xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5">
        <h2 className="mb-4 font-display text-xl font-medium">Concerte pe ani</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearData} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="color-mix(in oklab, var(--color-foreground) 6%, transparent)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "color-mix(in oklab, var(--color-foreground) 4%, transparent)" }}
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  color: "var(--color-foreground)",
                }}
              />
              <Bar dataKey="count" name="Concerte" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-3 rounded-2xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5">
        <h2 className="mb-4 font-display text-xl font-medium">Luna preferată</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthData} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="color-mix(in oklab, var(--color-foreground) 6%, transparent)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "color-mix(in oklab, var(--color-foreground) 4%, transparent)" }}
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  color: "var(--color-foreground)",
                }}
              />
              <Bar dataKey="count" name="Concerte" fill="var(--color-muted-foreground)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-xl font-medium">Top formații</h2>
        <ol className="space-y-2">
          {stats.artistCounts.slice(0, 8).map((row, i) => (
            <li key={row.key}>
              <Link
                to="/artists/$slug"
                params={{ slug: row.data.id }}
                className="flex items-center gap-3 rounded-xl bg-card px-3 py-2.5 shadow-[var(--shadow-border)]"
              >
                <span className="w-6 text-center text-sm tabular-nums text-subtle">{i + 1}</span>
                <ArtistMark artist={row.data} size="sm" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{row.data.name}</span>
                <span className="text-sm tabular-nums text-muted-foreground">{row.count}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-xl font-medium">Țări</h2>
        <ul className="space-y-2">
          {stats.countryCounts.map((row) => (
            <li
              key={row.key}
              className="flex items-center justify-between rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-border)]"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <CountryFlag code={row.data.countryCode} />
                {row.data.country}
              </span>
              <span className="text-sm tabular-nums text-muted-foreground">{row.count}</span>
            </li>
          ))}
        </ul>
      </section>

      <dl className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
        <Meta
          label="Primul concert"
          value={
            stats.firstShow
              ? `${formatConcertDate(stats.firstShow.date)}`
              : "—"
          }
        />
        <Meta
          label="Cel mai recent"
          value={stats.lastShow ? formatConcertDate(stats.lastShow.date) : "—"}
        />
        <Meta label="Festivale" value={String(stats.festivals)} />
        <Meta
          label="Notă medie"
          value={stats.avgRating ? stats.avgRating.toFixed(1) : "—"}
        />
        <Meta label="Orașe" value={String(stats.uniqueCities)} />
        <Meta label="Favorite" value={String(stats.favorites)} />
      </dl>

      <p className="mt-6 text-xs text-subtle">
        {showsLabel(stats.totalShows)} · {artistsLabel(stats.uniqueArtists)} ·{" "}
        {venuesLabel(stats.uniqueVenues)} · {countriesLabel(stats.uniqueCountries)}
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <button
          type="button"
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          onClick={() => {
            if (window.confirm("Înlocuiești arhiva cu exemplele de demonstrație?")) seedDemo();
          }}
        >
          Reîncarcă exemplele
        </button>
        <button
          type="button"
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          onClick={() => {
            if (window.confirm("Ștergi toate concertele din acest dispozitiv?")) {
              useArchive.getState().clearArchive();
            }
          }}
        >
          Golește arhiva
        </button>
      </div>
    </AppShell>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card px-4 py-4 shadow-[var(--shadow-border)]">
      <p className="text-xs font-medium uppercase tracking-wider text-subtle">{label}</p>
      <p className="mt-1 font-display text-3xl font-medium tabular-nums">{value}</p>
    </div>
  );
}

function Highlight({
  kicker,
  title,
  body,
  flag,
}: {
  kicker: string;
  title: string;
  body: string;
  flag?: string;
}) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
      <p className="text-xs font-medium uppercase tracking-wider text-subtle">{kicker}</p>
      <p className="mt-2 flex items-center gap-2 font-display text-xl font-medium">
        {flag ? <CountryFlag code={flag} className="h-4 w-6" /> : null}
        {title}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
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
