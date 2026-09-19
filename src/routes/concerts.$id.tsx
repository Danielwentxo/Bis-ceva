import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { MapPin, Pencil, Star, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ArtistMark } from "@/components/artist-mark";
import { CountryFlag } from "@/components/country-flag";
import { StarRating } from "@/components/star-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatConcertDate } from "@/lib/format";
import { concertArtists } from "@/lib/stats";
import { useArchive } from "@/lib/store";

export const Route = createFileRoute("/concerts/$id")({ component: ConcertDetail });

function ConcertDetail() {
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
        <p className="text-muted-foreground">Concertul nu mai e în arhivă.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/">Înapoi la concerte</Link>
        </Button>
      </AppShell>
    );
  }

  const lineup = concertArtists(concert, artists);
  const headliner = lineup[0]?.artist;

  return (
    <AppShell>
      <div className="flex flex-col items-center text-center">
        <ArtistMark artist={headliner} size="hero" />
        <p className="mt-5 text-sm text-muted-foreground">{formatConcertDate(concert.date)}</p>
        <h1 className="mt-1 font-display text-4xl font-medium tracking-tight">
          {headliner?.name ?? "Concert"}
        </h1>
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4" />
          <CountryFlag code={concert.countryCode} />
          {concert.venue} · {concert.city}, {concert.country}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {concert.festival ? <Badge variant="outline">Festival</Badge> : null}
          {concert.favorite ? <Badge variant="solid">Favorit</Badge> : null}
        </div>
        {concert.rating ? (
          <div className="mt-3">
            <StarRating value={concert.rating} size="sm" />
          </div>
        ) : null}
      </div>

      {lineup.length > 1 ? (
        <section className="mt-10">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-subtle">Afiș</h2>
          <ul className="space-y-2">
            {lineup.map((slot) => (
              <li key={slot.artistId}>
                <Link
                  to="/artists/$slug"
                  params={{ slug: slot.artist.id }}
                  className="flex items-center gap-3 rounded-xl bg-card px-3 py-2.5 shadow-[var(--shadow-border)]"
                >
                  <ArtistMark artist={slot.artist} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {slot.artist.name}
                  </span>
                  <span className="text-xs text-subtle">
                    {slot.role === "headliner" ? "Cap de afiș" : "Invitat"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline">
            <Link to="/artists/$slug" params={{ slug: headliner?.id ?? "" }}>
              Vezi formația
            </Link>
          </Button>
        </div>
      )}

      {concert.notes ? (
        <section className="mt-8 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
          <h2 className="text-xs font-medium uppercase tracking-wider text-subtle">Însemnări</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {concert.notes}
          </p>
        </section>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild className="flex-1">
          <Link to="/add" search={{ id: concert.id }}>
            <Pencil className="size-4" />
            Editează
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => toggleFavorite(concert.id)}
          aria-label="Favorit"
        >
          <Star className={concert.favorite ? "fill-primary text-primary" : ""} />
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            if (window.confirm("Ștergi concertul din arhivă?")) {
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
