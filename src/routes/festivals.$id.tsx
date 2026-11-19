import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { CountryFlag } from "@/components/country-flag";
import { festivalKey } from "@/components/festival-group-card";
import { Button } from "@/components/ui/button";
import { formatConcertDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { loadConcertPoster } from "@/lib/media-load";
import { concertArtists } from "@/lib/stats";
import { useArchive } from "@/lib/store";

export const Route = createFileRoute("/festivals/$id")({
  component: FestivalPage,
});

function FestivalPage() {
  const { t } = useI18n();
  const { id } = Route.useParams();
  const concerts = useArchive((s) => s.concerts);
  const artists = useArchive((s) => s.artists);
  const seed = concerts.find((c) => c.id === id);
  const key = seed ? festivalKey(seed) : "";
  const days = concerts.filter((c) => festivalKey(c) === key).sort((a, b) => b.date.localeCompare(a.date));
  const newest = days[0];
  const oldest = days[days.length - 1];
  const [poster, setPoster] = useState<string | null>(null);

  useEffect(() => {
    const stored = days.map((c) => c.festivalPosterUrl?.trim()).find((url) => url?.startsWith("http"));
    if (stored) {
      setPoster(stored);
      return;
    }
    const withPoster = days.find((c) => c.festivalPosterUrl) ?? newest;
    if (!withPoster) return;
    void loadConcertPoster({ data: { id: withPoster.id } }).then((url) => setPoster(url)).catch(() => undefined);
  }, [id, days.length]);

  if (!newest || !oldest) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">{t("concertMissing")}</p>
      </AppShell>
    );
  }

  const dateLabel =
    newest.date === oldest.date
      ? formatConcertDate(newest.date)
      : `${formatConcertDate(oldest.date)} – ${formatConcertDate(newest.date)}`;

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          {t("back")}
        </Link>
        <Link to="/add" search={{ id: newest.id, festival: "1" }}>
          <Button type="button" variant="outline">
            <Pencil className="size-4" />
            {t("editFestival")}
          </Button>
        </Link>
      </div>
      {poster ? (
        <img src={poster} alt="" className="mb-5 max-h-80 w-full rounded-2xl object-contain bg-card" />
      ) : null}
      <h1 className="font-display text-4xl font-medium tracking-tight">{newest.festivalName}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{dateLabel}</p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-subtle">
        <MapPin className="size-3.5" />
        <CountryFlag code={newest.countryCode} />
        <span>{newest.venue} · {newest.city}</span>
      </p>
      <ul className="mt-6 space-y-2">
        {days.map((concert) => {
          const names = concertArtists(concert, artists).map((slot) => slot.artist.name).filter(Boolean);
          return (
            <li key={concert.id}>
              <Link to="/concerts/$id" params={{ id: concert.id }} className="block rounded-xl bg-card px-4 py-3 hover:bg-secondary/50">
                <p className="text-sm font-medium">{formatConcertDate(concert.date)}</p>
                <p className="truncate text-sm text-muted-foreground">{names.join(", ") || t("lineup")}</p>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link to="/add" search={{ fromFestival: newest.id }} className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <Plus className="size-4" />
        {t("addDay")}
      </Link>
    </AppShell>
  );
}
