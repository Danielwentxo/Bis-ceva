import { useEffect, useRef } from "react";
import { enrichArtists } from "@/lib/artist-api";
import { useArchive } from "@/lib/store";

export function useEnrichArtists() {
  const hasHydrated = useArchive((s) => s.hasHydrated);
  const artists = useArchive((s) => s.artists);
  const applyArtistMedia = useArchive((s) => s.applyArtistMedia);
  const running = useRef(false);

  useEffect(() => {
    if (!hasHydrated || running.current) return;
    const missing = Object.values(artists).filter((a) => !a.fetchedAt);
    if (!missing.length) return;

    running.current = true;
    const batch = missing.slice(0, 12);
    void enrichArtists({
      data: {
        names: batch.map((a) => a.name),
        countryHint: "Romania",
      },
    })
      .then((hits) => {
        applyArtistMedia(hits);
        const leftover = missing.slice(12);
        if (leftover.length) {
          running.current = false;
        }
      })
      .catch(() => {
        applyArtistMedia(
          batch.map((a) => ({
            ...a,
            logoUrl: a.logoUrl,
            thumbUrl: a.thumbUrl,
          })),
        );
      })
      .finally(() => {
        running.current = false;
      });
  }, [hasHydrated, artists, applyArtistMedia]);
}
