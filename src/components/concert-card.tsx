import { Link } from "@tanstack/react-router";
import { MapPin, Star } from "lucide-react";
import { ArtistMark } from "@/components/artist-mark";
import { CountryFlag } from "@/components/country-flag";
import { formatConcertDate } from "@/lib/format";
import { concertArtists } from "@/lib/stats";
import type { Artist, Concert } from "@/lib/types";

export function ConcertCard({
  concert,
  artists,
}: {
  concert: Concert;
  artists: Record<string, Artist>;
}) {
  const lineup = concertArtists(concert, artists);
  const names = lineup.map((l) => l.artist.name);
  const festivalName = concert.festivalName?.trim() ?? "";
  const title = festivalName || names[0] || "Concert";
  const subtitle = festivalName ? names : names.slice(1);
  const poster = concert.festivalPosterUrl?.trim() || null;
  const headliner = lineup[0]?.artist;

  return (
    <Link
      to="/concerts/$id"
      params={{ id: concert.id }}
      className="block rounded-2xl bg-card p-4 shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-150 hover:shadow-[var(--shadow-border-hover)] active:scale-[0.99]"
    >
      <div className="flex gap-3">
        {poster ? (
          <img src={poster} alt="" className="size-12 shrink-0 rounded-lg object-cover shadow-[var(--shadow-border)]" />
        ) : (
          <ArtistMark artist={headliner} size="md" />
        )}
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-medium text-foreground">{title}</h3>
            {concert.favorite ? <Star className="mt-0.5 size-3.5 shrink-0 fill-primary text-primary" /> : null}
          </div>
          {subtitle.length ? (
            <p className="truncate text-sm text-muted-foreground">{subtitle.join(", ")}</p>
          ) : null}
          <p className="mt-1 truncate text-sm text-muted-foreground">{formatConcertDate(concert.date)}</p>
          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-subtle">
            <MapPin className="size-3.5 shrink-0" />
            <CountryFlag code={concert.countryCode} />
            <span className="truncate">
              {concert.venue} · {concert.city}
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}
