import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createDemoArchive } from "./demo-data";
import type { Artist, ArtistMedia, Concert, ConcertDraft } from "./types";
import { artistKey } from "./utils";

const demo = createDemoArchive();

type ArchiveState = {
  concerts: Concert[];
  artists: Record<string, Artist>;
  seeded: boolean;
  hasHydrated: boolean;
  finishHydration: () => void;
  upsertArtist: (media: ArtistMedia) => string;
  applyArtistMedia: (hits: ArtistMedia[]) => void;
  addConcert: (draft: ConcertDraft) => string;
  updateConcert: (id: string, draft: ConcertDraft) => void;
  deleteConcert: (id: string) => void;
  toggleFavorite: (id: string) => void;
  seedDemo: () => void;
  clearArchive: () => void;
};

function mediaToArtist(media: ArtistMedia): Artist {
  return {
    id: artistKey(media.name),
    name: media.name,
    logoUrl: media.logoUrl,
    thumbUrl: media.thumbUrl,
    genre: media.genre,
    country: media.country,
    bio: media.bio,
    fetchedAt: media.logoUrl || media.thumbUrl || media.bio ? new Date().toISOString() : undefined,
  };
}

function fromDraft(id: string, draft: ConcertDraft, createdAt: string): Concert {
  return {
    id,
    date: draft.date,
    venue: draft.venue.trim(),
    city: draft.city.trim(),
    country: draft.country,
    countryCode: draft.countryCode,
    lineup: draft.artists.map((a, index) => ({
      artistId: artistKey(a.name),
      role: index === 0 ? "headliner" : "support",
    })),
    notes: draft.notes.trim(),
    rating: draft.rating,
    favorite: draft.favorite,
    festival: draft.festival,
    createdAt,
  };
}

export const useArchive = create<ArchiveState>()(
  persist(
    (set, get) => ({
      concerts: demo.concerts,
      artists: demo.artists,
      seeded: true,
      hasHydrated: true,
      finishHydration: () => {
        if (get().hasHydrated) return;
        set({ hasHydrated: true });
      },
      upsertArtist: (media) => {
        const id = artistKey(media.name);
        set((state) => {
          const prev = state.artists[id];
          const next: Artist = {
            id,
            name: media.name || prev?.name || id,
            logoUrl: media.logoUrl ?? prev?.logoUrl ?? null,
            thumbUrl: media.thumbUrl ?? prev?.thumbUrl ?? null,
            genre: media.genre ?? prev?.genre ?? null,
            country: media.country ?? prev?.country ?? null,
            bio: media.bio ?? prev?.bio ?? null,
            fetchedAt:
              media.logoUrl || media.thumbUrl || media.bio
                ? new Date().toISOString()
                : prev?.fetchedAt,
          };
          return { artists: { ...state.artists, [id]: next } };
        });
        return id;
      },
      applyArtistMedia: (hits) => {
        if (!hits.length) return;
        set((state) => {
          const artists = { ...state.artists };
          for (const hit of hits) {
            const id = artistKey(hit.name);
            const prev = artists[id];
            if (!prev) {
              artists[id] = mediaToArtist(hit);
              continue;
            }
            artists[id] = {
              ...prev,
              logoUrl: hit.logoUrl ?? prev.logoUrl,
              thumbUrl: hit.thumbUrl ?? prev.thumbUrl,
              genre: hit.genre ?? prev.genre,
              country: hit.country ?? prev.country,
              bio: hit.bio ?? prev.bio,
              fetchedAt: new Date().toISOString(),
            };
          }
          return { artists };
        });
      },
      addConcert: (draft) => {
        const id = crypto.randomUUID();
        for (const a of draft.artists) get().upsertArtist(a);
        set((state) => ({
          concerts: [fromDraft(id, draft, new Date().toISOString()), ...state.concerts],
        }));
        return id;
      },
      updateConcert: (id, draft) => {
        for (const a of draft.artists) get().upsertArtist(a);
        set((state) => ({
          concerts: state.concerts.map((c) =>
            c.id === id ? fromDraft(id, draft, c.createdAt) : c,
          ),
        }));
      },
      deleteConcert: (id) => {
        set((state) => ({ concerts: state.concerts.filter((c) => c.id !== id) }));
      },
      toggleFavorite: (id) => {
        set((state) => ({
          concerts: state.concerts.map((c) =>
            c.id === id ? { ...c, favorite: !c.favorite } : c,
          ),
        }));
      },
      seedDemo: () => {
        const next = createDemoArchive();
        set({ concerts: next.concerts, artists: next.artists, seeded: true });
      },
      clearArchive: () => {
        set({ concerts: [], artists: {}, seeded: true });
      },
    }),
    {
      name: "bis-archive-v1",
      partialize: (state) => ({
        concerts: state.concerts,
        artists: state.artists,
        seeded: state.seeded,
      }),
    },
  ),
);

export function useHydrated() {
  return useArchive((s) => s.hasHydrated);
}
