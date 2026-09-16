import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ConcertForm } from "@/components/concert-form";
import { useArchive } from "@/lib/store";

type AddSearch = {
  id?: string;
  artist?: string;
};

export const Route = createFileRoute("/add")({
  validateSearch: (search: Record<string, unknown>): AddSearch => {
    const next: AddSearch = {};
    if (typeof search.id === "string") next.id = search.id;
    if (typeof search.artist === "string") next.artist = search.artist;
    return next;
  },
  component: AddPage,
});

function AddPage() {
  const { id, artist: artistId } = Route.useSearch();
  const concerts = useArchive((s) => s.concerts);
  const artists = useArchive((s) => s.artists);
  const existing = id ? concerts.find((c) => c.id === id) : undefined;
  const preset = artistId ? artists[artistId] : undefined;

  return (
    <AppShell>
      <header className="mb-6">
        <p className="text-sm font-medium text-muted-foreground">
          {existing ? "Editează" : "Intrare nouă"}
        </p>
        <h1 className="mt-1 font-display text-4xl font-medium tracking-tight">
          {existing ? "Modifică concertul" : "Adaugă concert"}
        </h1>
      </header>
      <ConcertForm
        existing={existing}
        presetArtist={
          preset
            ? {
                name: preset.name,
                logoUrl: preset.logoUrl,
                thumbUrl: preset.thumbUrl,
                genre: preset.genre,
                country: preset.country,
                bio: preset.bio,
              }
            : null
        }
      />
    </AppShell>
  );
}
