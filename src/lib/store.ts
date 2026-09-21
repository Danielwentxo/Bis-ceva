import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createDemoArchive } from "./demo-data";
import type { Artist, ArtistMedia, Concert, ConcertDraft } from "./types";
import { artistKey } from "./utils";
import { authEnabled } from "@/lib/auth/enabled";
import {
  loadArchive,
  upsertConcert,
  patchFestivalShared,
  removeConcert,
  setConcertFavorite,
  clearUserArchive,
  deleteAccount,
} from "@/lib/archive";

const demo = createDemoArchive();

type ArchiveState = {
  concerts: Concert[];
  artists: Record<string, Artist>;
  seeded: boolean;
  hasHydrated: boolean;
  syncing: boolean;
  syncError: string | null;
  finishHydration: () => void;
  loadFromServer: () => Promise<void>;
  upsertArtist: (media: ArtistMedia) => string;
  applyArtistMedia: (hits: ArtistMedia[]) => void;
  addConcert: (draft: ConcertDraft) => Promise<string>;
  updateConcert: (id: string, draft: ConcertDraft) => Promise<void>;
  deleteConcert: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  seedDemo: () => void;
  clearArchive: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

function festivalGroupKey(concert: Concert) {
  const name = concert.festivalName?.trim().toLowerCase();
  if (!name) return null;
  return `${name}|${concert.date.slice(0, 4)}|${concert.city.trim().toLowerCase()}|${concert.venue.trim().toLowerCase()}`;
}

function mediaToArtist(media: ArtistMedia): Artist {
  return {
    id: artistKey(media.name),
    name: media.name,
    logoUrl: media.logoUrl,
    thumbUrl: media.thumbUrl,
    genre: media.genre,
    country: media.country,
    bio: media.bio,
    city: media.city ?? null,
    style: media.style ?? null,
    formedYear: media.formedYear ?? null,
    website: media.website ?? null,
    fetchedAt: media.logoUrl || media.thumbUrl || media.bio ? new Date().toISOString() : undefined,
  };
}

function fromDraft(id: string, draft: ConcertDraft, createdAt: string): Concert {
  const festivalName = draft.festivalName?.trim() ?? "";
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
    festival: draft.festival || Boolean(festivalName),
    festivalName,
    festivalPosterUrl: draft.festivalPosterUrl ?? null,
    ticketUrl: draft.ticketUrl ?? null,
    createdAt,
  };
}

function mergeArtists(prev: Record<string, Artist>, list: Artist[]) {
  const next = { ...prev };
  for (const a of list) next[a.id] = { ...next[a.id], ...a };
  return next;
}

export const useArchive = create<ArchiveState>()(
  persist(
    (set, get) => ({
      concerts: authEnabled ? [] : demo.concerts,
      artists: authEnabled ? {} : demo.artists,
      seeded: !authEnabled,
      hasHydrated: !authEnabled,
      syncing: false,
      syncError: null,
      finishHydration: () => {
        if (get().hasHydrated) return;
        set({ hasHydrated: true });
      },
      loadFromServer: async () => {
        if (!authEnabled) {
          set({ hasHydrated: true });
          return;
        }
        set({ syncing: true, syncError: null });
        try {
          const data = await loadArchive();
          set({
            concerts: data.concerts,
            artists: data.artists,
            seeded: true,
            hasHydrated: true,
            syncing: false,
            syncError: null,
          });
        } catch (err) {
          set({
            hasHydrated: true,
            syncing: false,
            syncError: err instanceof Error ? err.message : "Could not load archive",
          });
        }
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
            city: media.city ?? prev?.city ?? null,
            style: media.style ?? prev?.style ?? null,
            formedYear: media.formedYear ?? prev?.formedYear ?? null,
            website: media.website ?? prev?.website ?? null,
            fetchedAt: media.logoUrl || media.thumbUrl || media.bio ? new Date().toISOString() : prev?.fetchedAt,
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
            artists[id] = prev
              ? {
                  ...prev,
                  logoUrl: hit.logoUrl ?? prev.logoUrl,
                  thumbUrl: hit.thumbUrl ?? prev.thumbUrl,
                  genre: hit.genre ?? prev.genre,
                  country: hit.country ?? prev.country,
                  bio: hit.bio ?? prev.bio,
                  city: hit.city ?? prev.city,
                  style: hit.style ?? prev.style,
                  formedYear: hit.formedYear ?? prev.formedYear,
                  website: hit.website ?? prev.website,
                  fetchedAt: new Date().toISOString(),
                }
              : mediaToArtist(hit);
          }
          return { artists };
        });
      },
      addConcert: async (draft) => {
        if (!authEnabled) {
          const id = crypto.randomUUID();
          for (const a of draft.artists) get().upsertArtist(a);
          set((state) => ({ concerts: [fromDraft(id, draft, new Date().toISOString()), ...state.concerts] }));
          return id;
        }
        const result = await upsertConcert({ data: { draft } });
        set((state) => ({
          concerts: [result.concert, ...state.concerts.filter((c) => c.id !== result.id)],
          artists: mergeArtists(state.artists, result.artists),
        }));
        return result.id;
      },
      updateConcert: async (id, draft) => {
        const existing = get().concerts.find((c) => c.id === id);
        const oldKey = existing ? festivalGroupKey(existing) : null;
        const festivalName = draft.festivalName?.trim() ?? "";
        const shared = {
          venue: draft.venue.trim(),
          city: draft.city.trim(),
          country: draft.country,
          countryCode: draft.countryCode,
          festivalName,
        };
        const siblings =
          oldKey && festivalName
            ? get().concerts.filter((c) => c.id !== id && festivalGroupKey(c) === oldKey)
            : [];

        if (!authEnabled) {
          for (const a of draft.artists) get().upsertArtist(a);
          set((state) => ({
            concerts: state.concerts.map((c) => {
              if (c.id === id) return fromDraft(id, draft, c.createdAt);
              if (!siblings.some((s) => s.id === c.id)) return c;
              return {
                ...c,
                venue: shared.venue,
                city: shared.city,
                country: shared.country,
                countryCode: shared.countryCode,
                festivalName: shared.festivalName,
                festival: Boolean(shared.festivalName),
              };
            }),
          }));
          return;
        }

        const result = await upsertConcert({ data: { id, draft, createdAt: existing?.createdAt } });
        if (siblings.length) {
          await patchFestivalShared({
            data: {
              ids: siblings.map((s) => s.id),
              venue: shared.venue,
              city: shared.city,
              country: shared.country,
              countryCode: shared.countryCode,
              festivalName: shared.festivalName,
            },
          });
        }
        set((state) => ({
          concerts: state.concerts.map((c) => {
            if (c.id === id) return result.concert;
            if (!siblings.some((s) => s.id === c.id)) return c;
            return {
              ...c,
              venue: shared.venue,
              city: shared.city,
              country: shared.country,
              countryCode: shared.countryCode,
              festivalName: shared.festivalName,
              festival: Boolean(shared.festivalName),
            };
          }),
          artists: mergeArtists(state.artists, result.artists),
        }));
      },
      deleteConcert: async (id) => {
        if (!authEnabled) {
          set((state) => ({ concerts: state.concerts.filter((c) => c.id !== id) }));
          return;
        }
        await removeConcert({ data: { id } });
        set((state) => ({ concerts: state.concerts.filter((c) => c.id !== id) }));
      },
      toggleFavorite: async (id) => {
        const current = get().concerts.find((c) => c.id === id);
        if (!current) return;
        const next = !current.favorite;
        set((state) => ({
          concerts: state.concerts.map((c) => (c.id === id ? { ...c, favorite: next } : c)),
        }));
        if (!authEnabled) return;
        try {
          await setConcertFavorite({ data: { id, favorite: next } });
        } catch {
          set((state) => ({
            concerts: state.concerts.map((c) => (c.id === id ? { ...c, favorite: !next } : c)),
          }));
        }
      },
      seedDemo: () => {
        if (authEnabled) return;
        const next = createDemoArchive();
        set({ concerts: next.concerts, artists: next.artists, seeded: true });
      },
      clearArchive: async () => {
        if (!authEnabled) {
          set({ concerts: [], artists: {}, seeded: true });
          return;
        }
        await clearUserArchive();
        set({ concerts: [], artists: {}, seeded: true });
      },
      deleteAccount: async () => {
        if (!authEnabled) {
          set({ concerts: [], artists: {}, seeded: true });
          return;
        }
        await deleteAccount();
        set({ concerts: [], artists: {}, seeded: true });
      },
    }),
    {
      name: "bis-archive-v1",
      partialize: (state) =>
        authEnabled ? {} : { concerts: state.concerts, artists: state.artists, seeded: state.seeded },
    },
  ),
);

export function useHydrated() {
  return useArchive((s) => s.hasHydrated);
}
