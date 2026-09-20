import { countryByCode, countryByName } from "@/lib/countries";
import type { Artist, Concert, ConcertDraft } from "@/lib/types";
import { artistKey } from "@/lib/utils";

export type ArchiveDump = {
  version: 1;
  exportedAt: string;
  concerts: Concert[];
  artists: Record<string, Artist>;
};

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

export function concertsToCsv(concerts: Concert[], artists: Record<string, Artist>) {
  const header = ["date", "artists", "venue", "city", "country", "countryCode", "festival", "notes", "rating"];
  const rows = concerts.map((c) => {
    const names = c.lineup.map((l) => artists[l.artistId]?.name ?? l.artistId).join("; ");
    return [
      c.date,
      names,
      c.venue,
      c.city,
      c.country,
      c.countryCode,
      c.festivalName ?? "",
      c.notes.replaceAll("\n", " "),
      c.rating == null ? "" : String(c.rating),
    ].map(csvEscape).join(",");
  });
  return [header.join(","), ...rows].join("\n");
}

export function archiveToJson(concerts: Concert[], artists: Record<string, Artist>): ArchiveDump {
  return { version: 1, exportedAt: new Date().toISOString(), concerts, artists };
}

function resolveCountry(country: string, code: string) {
  const byCode = code ? countryByCode(code) : undefined;
  if (byCode) return byCode;
  const byName = country ? countryByName(country) : undefined;
  if (byName) return byName;
  return { code: code.toUpperCase(), name: country || code || "Unknown" };
}

export function draftsFromCsv(text: string): ConcertDraft[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase().replaceAll(" ", ""));
  const idx = (name: string) => header.indexOf(name);
  const dateI = idx("date");
  const artistsI = header.findIndex((h) => h === "artists" || h === "artist" || h === "band");
  const venueI = header.findIndex((h) => h === "venue" || h === "place");
  const cityI = idx("city");
  const countryI = idx("country");
  const codeI = header.findIndex((h) => h === "countrycode" || h === "code");
  const festI = header.findIndex((h) => h === "festival" || h === "festivalname");
  const notesI = idx("notes");
  const ratingI = idx("rating");
  if (dateI < 0 || artistsI < 0 || venueI < 0) return [];

  const drafts: ConcertDraft[] = [];
  for (const line of lines.slice(1)) {
    const cols = splitCsvLine(line);
    const date = cols[dateI] ?? "";
    if (!/^\d{4}-\d{2}-\d{2}/.test(date) && !/^\d{2}\/\d{2}\/\d{4}/.test(date)) continue;
    const iso = date.includes("/")
      ? (() => {
          const [d, m, y] = date.split("/");
          return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
        })()
      : date.slice(0, 10);
    const names = (cols[artistsI] ?? "").split(/;|\||,/).map((n) => n.trim()).filter(Boolean);
    if (!names.length) continue;
    const venue = cols[venueI] ?? "";
    const city = cityI >= 0 ? cols[cityI] ?? "" : "";
    if (!venue.trim() || !city.trim()) continue;
    const countryRaw = countryI >= 0 ? cols[countryI] ?? "" : "";
    const codeRaw = codeI >= 0 ? cols[codeI] ?? "" : "";
    const place = resolveCountry(countryRaw, codeRaw);
    const festivalName = festI >= 0 ? cols[festI] ?? "" : "";
    const ratingRaw = ratingI >= 0 ? cols[ratingI] ?? "" : "";
    const rating = ratingRaw ? Number(ratingRaw) : null;
    drafts.push({
      date: iso,
      venue: venue.trim(),
      city: city.trim(),
      country: place.name,
      countryCode: place.code,
      artists: names.map((name) => ({
        name,
        logoUrl: null,
        thumbUrl: null,
        genre: null,
        country: null,
        bio: null,
      })),
      notes: notesI >= 0 ? cols[notesI] ?? "" : "",
      rating: rating != null && rating >= 0 && rating <= 5 ? rating : null,
      favorite: false,
      festival: Boolean(festivalName.trim()),
      festivalName: festivalName.trim(),
      festivalPosterUrl: null,
      ticketUrl: null,
    });
  }
  return drafts;
}

export function draftsFromJson(text: string): ConcertDraft[] {
  const parsed = JSON.parse(text) as ArchiveDump | Concert[];
  const concerts = Array.isArray(parsed) ? parsed : parsed.concerts;
  const artists = Array.isArray(parsed) ? {} : parsed.artists ?? {};
  if (!Array.isArray(concerts)) return [];
  return concerts
    .map((c) => ({
      date: c.date,
      venue: c.venue,
      city: c.city,
      country: c.country,
      countryCode: c.countryCode,
      artists: (c.lineup ?? [])
        .map((l) => {
          const a = artists[l.artistId];
          return {
            name: a?.name ?? l.artistId,
            logoUrl: a?.logoUrl ?? null,
            thumbUrl: a?.thumbUrl ?? null,
            genre: a?.genre ?? null,
            country: a?.country ?? null,
            bio: a?.bio ?? null,
          };
        })
        .filter((a) => a.name),
      notes: c.notes ?? "",
      rating: c.rating ?? null,
      favorite: Boolean(c.favorite),
      festival: Boolean(c.festival || c.festivalName),
      festivalName: c.festivalName ?? "",
      festivalPosterUrl: c.festivalPosterUrl ?? null,
      ticketUrl: c.ticketUrl ?? null,
    }))
    .filter((d) => d.date && d.venue && d.artists.length);
}

export function ticketFiles(concerts: Concert[]) {
  return concerts
    .filter((c) => c.ticketUrl)
    .map((c) => ({ name: `${c.date}-${artistKey(c.venue)}.jpg`, dataUrl: c.ticketUrl as string }));
}
