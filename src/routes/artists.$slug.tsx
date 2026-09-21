import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { ArtistMark } from "@/components/artist-mark";
import { ConcertCard } from "@/components/concert-card";
import { Button } from "@/components/ui/button";
import { enrichArtists } from "@/lib/artist-api";
import { originCountry } from "@/lib/stats";
import { showsLabel } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useArchive } from "@/lib/store";
import { artistKey } from "@/lib/utils";
import type { Artist } from "@/lib/types";

export const Route = createFileRoute("/artists/$slug")({ component: ArtistDetail });

function Fact({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="rounded-xl bg-card px-4 py-3 text-left shadow-[var(--shadow-border)]">
      <p className="text-xs uppercase tracking-wider text-subtle">{label}</p>
      <p className="mt-1 text-sm font-medium break-words">{value}</p>
    </div>
  );
}

function ArtistDetail() {
  const { t } = useI18n();
  const { slug } = Route.useParams();
  const artists = useArchive((s) => s.artists);
  const concerts = useArchive((s) => s.concerts);
  const applyArtistMedia = useArchive((s) => s.applyArtistMedia);

  const artist: Artist | undefined =
    artists[slug] ?? Object.values(artists).find((a) => a.id === slug || artistKey(a.name) === slug);

  const shows = concerts
    .filter((c) =>
      c.lineup.some((l) => l.artistId === slug || l.artistId === artist?.id || artistKey(l.artistId) === slug),
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const name = artist?.name ?? slug.replace(/-/g, " ");

  useEffect(() => {
    if (!name) return;
    void enrichArtists({ data: { names: [name] } })
      .then((hits) => {
        if (hits.length) applyArtistMedia(hits);
      })
      .catch(() => undefined);
  }, [name, applyArtistMedia]);

  const country = originCountry(artist?.country) ?? artist?.country;
  const city = artist?.city?.trim() || null;
  const website = artist?.website?.trim() || null;

  return (
    <AppShell>
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link to="/artists">
            <ArrowLeft className="size-4" />
            {t("navArtists")}
          </Link>
        </Button>
      </div>
      <div className="flex flex-col items-center text-center">
        <ArtistMark artist={artist} size="hero" />
        <h1 className="mt-5 font-display text-4xl font-medium tracking-tight">{name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{[artist?.genre, city, country].filter(Boolean).join(" \u00b7 ")}</p>
        <p className="mt-1 text-sm text-subtle">{showsLabel(shows.length)}</p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Fact label="Genre" value={artist?.genre} />
        <Fact label="Style" value={artist?.style} />
        <Fact label="City" value={city} />
        <Fact label={t("country")} value={country} />
        <Fact label="Formed" value={artist?.formedYear} />
        {website ? (
          <div className="rounded-xl bg-card px-4 py-3 text-left shadow-[var(--shadow-border)]">
            <p className="text-xs uppercase tracking-wider text-subtle">Website</p>
            <a href={website.startsWith("http") ? website : `https://${website}`} className="mt-1 block truncate text-sm font-medium text-primary" target="_blank" rel="noreferrer">
              {website.replace(/^https?:\/\//, "")}
            </a>
          </div>
        ) : null}
      </div>

      {artist?.bio ? <p className="mt-8 text-sm leading-relaxed text-muted-foreground">{artist.bio}</p> : null}

      <section className="mt-10 space-y-3">
        <h2 className="font-display text-2xl font-medium">{t("seenLive")}</h2>
        {shows.length ? (
          shows.map((c) => <ConcertCard key={c.id} concert={c} artists={artists} />)
        ) : (
          <p className="text-sm text-muted-foreground">{t("noMatches")}</p>
        )}
      </section>
    </AppShell>
  );
}
