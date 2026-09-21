import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Pencil, Star, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ArtistMark } from "@/components/artist-mark";
import { CountryFlag } from "@/components/country-flag";
import { StarRating } from "@/components/star-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatConcertDate } from "@/lib/format";
import { extraLabel } from "@/lib/i18n-extras";
import { useI18n } from "@/lib/i18n";
import { concertArtists } from "@/lib/stats";
import { useArchive } from "@/lib/store";

export const Route = createFileRoute("/concerts/$id")({
  component: ConcertDetail,
});

function ConcertDetail() {
  const { t, locale } = useI18n();
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const concerts = useArchive((s) => s.concerts);
  const artists = useArchive((s) => s.artists);
  const deleteConcert = useArchive((s) => s.deleteConcert);
  const toggleFavorite = useArchive((s) => s.toggleFavorite);
  const concert = concerts.find((c) => c.id === id);

  if (!concert) {
    return (
      <AppShell>
        <p className="text-muted-foreground">{extraLabel(locale, "savedToArchive")}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/">{t("backToConcerts")}</Link>
        </Button>
      </AppShell>
    );
  }

  const lineup = concertArtists(concert, artists);
  const headliner = lineup[0]?.artist;
  const festivalName = concert.festivalName?.trim() ?? "";

  return (
    <AppShell>
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft className="size-4" />
            {t("backToConcerts")}
          </Link>
        </Button>
      </div>
      <div className="flex flex-col items-center text-center">
        <ArtistMark artist={headliner} size="hero" />
        <p className="mt-5 text-sm text-muted-foreground">{formatConcertDate(concert.date)}</p>
        <h1 className="mt-1 font-display text-4xl font-medium tracking-tight">
          {festivalName || headliner?.name || t("navConcerts")}
        </h1>
        {festivalName && headliner?.name ? (
          <p className="mt-1 text-sm text-muted-foreground">{headliner.name}</p>
        ) : null}
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4" />
          <CountryFlag code={concert.countryCode} />
          {concert.venue} · {concert.city}, {concert.country}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {festivalName ? <Badge variant="outline">{festivalName}</Badge> : null}
          {concert.favorite ? <Badge variant="solid">{t("favoriteBadge")}</Badge> : null}
        </div>
        {concert.rating ? (
          <div className="mt-3">
            <StarRating value={concert.rating} size="sm" />
          </div>
        ) : null}
      </div>

      {lineup.length > 1 ? (
        <section className="mt-10">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-subtle">{t("lineup")}</h2>
          <ul className="space-y-2">
            {lineup.map((slot) => (
              <li key={slot.artistId}>
                <Link
                  to="/artists/$slug"
                  params={{ slug: slot.artist.id }}
                  className="flex items-center gap-3 rounded-xl bg-card px-3 py-2.5 shadow-[var(--shadow-border)]"
                >
                  <ArtistMark artist={slot.artist} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{slot.artist.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline">
            <Link to="/artists/$slug" params={{ slug: headliner?.id ?? "" }}>
              {t("viewArtist")}
            </Link>
          </Button>
        </div>
      )}

      {concert.notes ? (
        <section className="mt-8 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
          <h2 className="text-xs font-medium uppercase tracking-wider text-subtle">{t("notes")}</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{concert.notes}</p>
        </section>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild className="flex-1">
          <Link to="/add" search={{ id: concert.id }}>
            <Pencil className="size-4" />
            {t("edit")}
          </Link>
        </Button>
        <Button type="button" variant="outline" onClick={() => toggleFavorite(concert.id)} aria-label={t("favoriteBadge")}>
          <Star className={concert.favorite ? "fill-primary text-primary" : ""} />
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            if (window.confirm(t("deleteConcertConfirm"))) {
              void deleteConcert(concert.id).then(() => navigate({ to: "/" }));
            }
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </AppShell>
  );
}
