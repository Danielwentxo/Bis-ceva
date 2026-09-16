import { parseISO } from "date-fns";
import type { Artist, Concert } from "./types";
import { venueKey } from "./utils";
import { todayIso } from "./format";

export type CountItem<T> = { key: string; count: number; data: T };

export type ArchiveStats = {
  totalShows: number;
  pastShows: number;
  upcomingShows: number;
  uniqueArtists: number;
  uniqueVenues: number;
  uniqueCities: number;
  uniqueCountries: number;
  festivals: number;
  favorites: number;
  rated: number;
  avgRating: number | null;
  firstShow: Concert | null;
  lastShow: Concert | null;
  busiestYear: { year: number; count: number } | null;
  artistCounts: CountItem<Artist>[];
  venueCounts: CountItem<{ venue: string; city: string; country: string; countryCode: string }>[];
  cityCounts: CountItem<{ city: string; country: string; countryCode: string }>[];
  countryCounts: CountItem<{ country: string; countryCode: string }>[];
  yearCounts: { year: number; count: number }[];
  monthCounts: { month: number; count: number }[];
};

function headlinerId(concert: Concert) {
  return concert.lineup.find((l) => l.role === "headliner")?.artistId
    ?? concert.lineup[0]?.artistId;
}

export function concertHeadliner(concert: Concert, artists: Record<string, Artist>) {
  const id = headlinerId(concert);
  return id ? artists[id] ?? null : null;
}

export function concertArtists(concert: Concert, artists: Record<string, Artist>) {
  return concert.lineup
    .map((l) => ({ ...l, artist: artists[l.artistId] }))
    .filter((l): l is typeof l & { artist: Artist } => Boolean(l.artist));
}

function bump<T>(map: Map<string, CountItem<T>>, key: string, data: T) {
  const prev = map.get(key);
  if (prev) prev.count += 1;
  else map.set(key, { key, count: 1, data });
}

export function computeStats(
  concerts: Concert[],
  artists: Record<string, Artist>,
): ArchiveStats {
  const today = todayIso();
  const past = concerts.filter((c) => c.date <= today);
  const upcoming = concerts.filter((c) => c.date > today);
  const chronological = [...past].sort((a, b) => a.date.localeCompare(b.date));

  const artistMap = new Map<string, CountItem<Artist>>();
  const venueMap = new Map<string, CountItem<{ venue: string; city: string; country: string; countryCode: string }>>();
  const cityMap = new Map<string, CountItem<{ city: string; country: string; countryCode: string }>>();
  const countryMap = new Map<string, CountItem<{ country: string; countryCode: string }>>();
  const yearMap = new Map<number, number>();
  const monthMap = new Map<number, number>();

  const seenArtists = new Set<string>();

  for (const c of concerts) {
    for (const slot of c.lineup) {
      const artist = artists[slot.artistId];
      if (!artist) continue;
      seenArtists.add(artist.id);
      bump(artistMap, artist.id, artist);
    }
    bump(venueMap, venueKey(c.venue, c.city), {
      venue: c.venue,
      city: c.city,
      country: c.country,
      countryCode: c.countryCode,
    });
    bump(cityMap, `${c.city}|${c.countryCode}`, {
      city: c.city,
      country: c.country,
      countryCode: c.countryCode,
    });
    bump(countryMap, c.countryCode || c.country, {
      country: c.country,
      countryCode: c.countryCode,
    });
    const d = parseISO(c.date);
    if (!Number.isNaN(d.getTime())) {
      yearMap.set(d.getFullYear(), (yearMap.get(d.getFullYear()) ?? 0) + 1);
      monthMap.set(d.getMonth(), (monthMap.get(d.getMonth()) ?? 0) + 1);
    }
  }

  const sortCount = <T>(items: CountItem<T>[]) =>
    [...items].sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));

  const yearCounts = [...yearMap.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year - b.year);

  const monthCounts = Array.from({ length: 12 }, (_, month) => ({
    month,
    count: monthMap.get(month) ?? 0,
  }));

  const rated = concerts.filter((c) => typeof c.rating === "number");
  const avgRating =
    rated.length > 0
      ? rated.reduce((sum, c) => sum + (c.rating ?? 0), 0) / rated.length
      : null;

  const busiestYear = [...yearCounts].sort((a, b) => b.count - a.count)[0] ?? null;

  return {
    totalShows: concerts.length,
    pastShows: past.length,
    upcomingShows: upcoming.length,
    uniqueArtists: seenArtists.size,
    uniqueVenues: venueMap.size,
    uniqueCities: cityMap.size,
    uniqueCountries: countryMap.size,
    festivals: concerts.filter((c) => c.festival).length,
    favorites: concerts.filter((c) => c.favorite).length,
    rated: rated.length,
    avgRating,
    firstShow: chronological[0] ?? null,
    lastShow: chronological[chronological.length - 1] ?? null,
    busiestYear,
    artistCounts: sortCount([...artistMap.values()]),
    venueCounts: sortCount([...venueMap.values()]),
    cityCounts: sortCount([...cityMap.values()]),
    countryCounts: sortCount([...countryMap.values()]),
    yearCounts,
    monthCounts,
  };
}

export function artistShowCount(
  artistId: string,
  concerts: Concert[],
) {
  return concerts.filter((c) => c.lineup.some((l) => l.artistId === artistId)).length;
}
