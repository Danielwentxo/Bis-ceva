import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, MapPin } from "lucide-react";
import { useState } from "react";
import { CountryFlag } from "@/components/country-flag";
import { formatConcertDate } from "@/lib/format";
import { concertArtists } from "@/lib/stats";
import type { Artist, Concert } from "@/lib/types";
import { cn } from "@/lib/utils";

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
  const days = [...concerts].sort((a, b) => b.date.localeCompare(a.date));
  const newest = days[0]!;
  const oldest = days[days.length - 1]!;
  const poster = days.map((c) => c.festivalPosterUrl?.trim()).find(Boolean) ?? null;
  const title = newest.festivalName?.trim() || "Festival";
  const dateLabel =
    newest.date === oldest.date
      ? formatConcertDate(newest.date)
      : `${formatConcertDate(newest.date)} – ${formatConcertDate(oldest.date)}`;
  const [openId, setOpenId] = useState<string | null>(null);

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
            <CountryFlag code={newest.countryCode} />
            <span className="truncate">
              {newest.venue} · {newest.city}
            </span>
          </p>
        </div>
      </div>
      <ul className="mt-3 space-y-1 border-t border-border/60 pt-3">
        {days.map((concert) => {
          const lineup = concertArtists(concert, artists);
          const open = openId === concert.id;
          const extra = lineup.length > 1 ? lineup.length - 1 : 0;
          return (
            <li key={concert.id} className="rounded-xl">
              <div className="flex items-center gap-1">
                <span className="min-w-0 flex-1 truncate px-1 py-1.5 text-sm">
                  <span className="shrink-0 tabular-nums text-muted-foreground">{formatConcertDate(concert.date)}</span>
                  {" "}
                  <span className="font-medium">
                    {lineup[0]?.artist.name ?? "Day"}
                    {extra ? <span className="font-normal text-muted-foreground"> +more</span> : null}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : concert.id)}
                  aria-expanded={open}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
                </button>
                <Link
                  to="/concerts/$id"
                  params={{ id: concert.id }}
                  aria-label={formatConcertDate(concert.date)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <ChevronRight className="size-4" />
                </Link>
              </div>
              {open ? (
                <div className="mb-2 ml-1 space-y-1 border-l border-border/60 pl-3">
                  {lineup.map((slot) => (
                    <Link
                      key={slot.artistId}
                      to="/artists/$slug"
                      params={{ slug: slot.artist.id || slot.artistId }}
                      className="block truncate text-sm text-muted-foreground hover:text-foreground"
                    >
                      {slot.artist.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
