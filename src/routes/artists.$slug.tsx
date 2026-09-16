import { Link, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ArtistMark } from "@/components/artist-mark";
import { ConcertCard } from "@/components/concert-card";
import { Button } from "@/components/ui/button";
import { showsLabel } from "@/lib/format";
import { useArchive } from "@/lib/store";

export const Route = createFileRoute("/artists/$slug")({ component: ArtistDetail });

function ArtistDetail() {
  const { slug } = Route.useParams();
  const artists = useArchive((s) => s.artists);
  const concerts = useArchive((s) => s.concerts);
  const artist = artists[slug];
  const shows = concerts
    .filter((c) => c.lineup.some((l) => l.artistId === slug))
    .sort((a, b) => b.date.localeCompare(a.date));

  if (!artist) {
    return (
      <AppShell>
        <p className="text-muted-foreground">Formația nu e în arhivă.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/artists">Înapoi</Link>
        </Button>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col items-center text-center">
        <ArtistMark artist={artist} size="hero" />
        <h1 className="mt-5 font-display text-4xl font-medium tracking-tight">{artist.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {[artist.genre, artist.country].filter(Boolean).join(" · ") || "Formație văzută live"}
        </p>
        <p className="mt-1 text-sm text-subtle">{showsLabel(shows.length)}</p>
        <Button asChild className="mt-5">
          <Link to="/add" search={{ artist: artist.id }}>
            Adaugă un concert
          </Link>
        </Button>
      </div>

      {artist.bio ? (
        <p className="mt-8 text-sm leading-relaxed text-muted-foreground">{artist.bio}</p>
      ) : null}

      <section className="mt-10 space-y-3">
        <h2 className="font-display text-2xl font-medium">Concerte</h2>
        {shows.map((c) => (
          <ConcertCard key={c.id} concert={c} artists={artists} />
        ))}
      </section>
    </AppShell>
  );
}
