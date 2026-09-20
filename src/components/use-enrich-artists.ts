import { useEffect, useRef } from "react";
import { enrichArtists } from "@/lib/artist-api";
import { saveCatalogArtist } from "@/lib/catalog";
import { persistArtistMedia } from "@/lib/persist-artists";
import { useArchive } from "@/lib/store";

export function useEnrichArtists() {
  const hasHydrated = useArchive((s) => s.hasHydrated);
  const artists = useArchive((s) => s.artists);
  const applyArtistMedia = useArchive((s) => s.applyArtistMedia);
  const running = useRef(false);

  useEffect(() => {
    if (!hasHydrated || running.current) return;
    const missing = Object.values(artists).filter((a) => !a.logoUrl && !a.thumbUrl && !a.fetchedAt);
    if (!missing.length) return;

    running.current = true;
    const batch = missing.slice(0, 8);
    void enrichArtists({
      data: { names: batch.map((a) => a.name) },
    })
      .then(async (hits) => {
        applyArtistMedia(hits);
        await persistArtistMedia({ data: { artists: hits } }).catch(() => undefined);
        for (const hit of hits) {
          void saveCatalogArtist({ data: hit }).catch(() => undefined);
        }
      })
      .catch(() => {
        applyArtistMedia(batch.map((a) => ({ ...a, logoUrl: a.logoUrl, thumbUrl: a.thumbUrl })));
      })
      .finally(() => {
        running.current = false;
      });
  }, [hasHydrated, artists, applyArtistMedia]);
}
