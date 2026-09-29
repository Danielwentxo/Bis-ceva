import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ConcertForm } from "@/components/concert-form";
import { festivalKey } from "@/components/festival-group-card";
import { useI18n } from "@/lib/i18n";
import { useArchive } from "@/lib/store";

type AddSearch = {
  id?: string;
  artist?: string;
  festival?: string;
  fromFestival?: string;
};

export const Route = createFileRoute("/add")({
  validateSearch: (search: Record<string, unknown>): AddSearch => {
    const next: AddSearch = {};
    if (typeof search.id === "string") next.id = search.id;
    if (typeof search.artist === "string") next.artist = search.artist;
    if (typeof search.festival === "string") next.festival = search.festival;
    if (typeof search.fromFestival === "string") next.fromFestival = search.fromFestival;
    return next;
  },
  component: AddPage,
});

function AddPage() {
  const { t } = useI18n();
  const { id, artist: artistId, festival, fromFestival } = Route.useSearch();
  const concerts = useArchive((s) => s.concerts);
  const artists = useArchive((s) => s.artists);
  const existing = id ? concerts.find((c) => c.id === id) : undefined;
  const presetDay = !existing && fromFestival ? concerts.find((c) => c.id === fromFestival) : undefined;
  const preset = artistId ? artists[artistId] : undefined;
  const groupKey = existing ? festivalKey(existing) : null;
  const siblingCount = groupKey ? concerts.filter((c) => festivalKey(c) === groupKey).length : 0;
  const multiDay = siblingCount > 1;
  const mode =
    festival === "1" && existing && multiDay
      ? "festival"
      : existing && multiDay
        ? "day"
        : presetDay
          ? "day"
          : "full";

  return (
    <AppShell>
      <header className="mb-6">
        <p className="text-sm font-medium text-muted-foreground">
          {existing ? t("edit") : t("newEntry")}
        </p>
        <h1 className="mt-1 font-display text-4xl font-medium tracking-tight">
          {mode === "festival" ? t("festivalBadge") : existing ? t("editConcert") : t("addConcert")}
        </h1>
      </header>
      <ConcertForm
        existing={existing}
        mode={mode}
        presetDay={presetDay}
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
