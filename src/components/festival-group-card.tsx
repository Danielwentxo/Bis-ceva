import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { CountryFlag } from "@/components/country-flag";
import { formatConcertDate } from "@/lib/format";
import { concertArtists } from "@/lib/stats";
import type { Artist, Concert } from "@/lib/types";

export function festivalKey(concert: Concert) {
  const name = concert.festivalName?.trim().toLowerCase();
  if (!name) return null;
  return `${name}|${concert.date.slice(0, 4)}|${concert.city.trim().toLowerCase()}`;
}

function FestivalMark({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials =
    parts.length >= 2 ? `${parts[0]![0]}${parts[1]![0]}`.toUpperCase() : name.trim().slice(0, 2).toUpperCase();
  return (
    <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-secondary px-1 text-center shadow-[var(--shadow-border)]">
      <span className="font-display text-sm font-medium leading-none text-primary">{initials}</span>
    </div>
  );
}

export function FestivalGroupCard({
  concerts,
  artists,
}: {
  concerts: Concert[];
  artists: Record<string, Artist>;
}) {
  const days = [...concerts].sort((a, b) => a.date.localeCompare(b.date));
  const first = days[0]!;
  const last = days[days.length - 1]!;
  const poster = days.map((c) => c.festivalPosterUrl?.trim()).find(Boolean) ?? null;
  const title = first.festivalName?.trim() || "Festival";
  const dateLabel =
    first.date === last.date
      ? formatConcertDate(first.date)
      : `${formatConcertDate(first.date)} – ${formatConcertDate(last.date)}`;

  return (
    <article className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
      <div className="flex gap-3">
        {poster ? (
          <img src={poster} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
        ) : (
          <FestivalMark name={title} />
        )}
        <div className="min-w-0 flex-1 overflow-hidden">
          <h3 className="truncate font-medium text-foreground">{title}</h3>
          <p className="truncate text-sm text-muted-foreground">{dateLabel}</p>
          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-subtle">
            <MapPin className="size-3.5 shrink-0" />
            <CountryFlag code={first.countryCode} />
            <span className="truncate">
              {first.venue} · {first.city}
            </span>
          </p>
        </div>
      </div>
      <ul className="mt-3 space-y-1 border-t border-border/60 pt-3">
        {days.map((concert) => {
          const headliner = concertArtists(concert, artists)[0]?.artist;
          return (
            <li key={concert.id}>
              <Link
                to="/concerts/$id"
                params={{ id: concert.id }}
                className="flex min-w-0 items-center justify-between gap-2 rounded-lg px-1 py-1.5 text-sm hover:bg-secondary"
              >
                <span className="shrink-0 tabular-nums text-muted-foreground">{formatConcertDate(concert.date)}</span>
                <span className="min-w-0 truncate text-right font-medium">{headliner?.name ?? "Concert"}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
