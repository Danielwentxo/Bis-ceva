import { countryByCode, countryByName } from "@/lib/countries";
import type { Artist, Concert, ConcertDraft } from "@/lib/types";
import { artistKey } from "@/lib/utils";

export type ArchiveDump = {
  version: 1;
  exportedAt: string;
  concerts: Concert[];
  artists: Record<string, Artist>;
};

const LETTERS = /[\u00C5\u00E5\u00C4\u00E4\u00D6\u00F6\u00C2\u00E2\u00CE\u00EE\u0102\u0103\u0218\u0219\u021A\u021B\u015E\u015F\u0162\u0163\u00C6\u00E6\u00D8\u00F8\u00DC\u00FC\u00C9\u00E9\u00C1\u00E1]/g;

function tidy(value: string) {
  return value.normalize("NFC").replace(/\uFFFD/g, "").trim();
}

function scoreText(text: string) {
  return (text.match(LETTERS) ?? []).length - (text.split("\uFFFD").length - 1) * 8;
}

export function decodeImportedText(buffer: ArrayBuffer) {
  const utf8 = new TextDecoder("utf-8").decode(buffer);
  const latin = new TextDecoder("windows-1252").decode(buffer);
  const east = new TextDecoder("iso-8859-2").decode(buffer);
  return [utf8, latin, east].sort((a, b) => scoreText(b) - scoreText(a))[0] ?? utf8;
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

function detectDelimiter(headerLine: string) {
  const counts: Array<{ d: string; n: number }> = [
    { d: "\t", n: (headerLine.match(/\t/g) ?? []).length },
    { d: ";", n: (headerLine.match(/;/g) ?? []).length },
    { d: ",", n: (headerLine.match(/,/g) ?? []).length },
  ];
  counts.sort((a, b) => b.n - a.n);
  return counts[0].n > 0 ? counts[0].d : ",";
}

function splitCsvLine(line: string, delimiter = ","): string[] {
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
    else if (ch === delimiter) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => tidy(s));
}

function normHeader(h: string) {
  return h.toLowerCase().replace(/^\ufeff/, "").replaceAll(" ", "");
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

function parseDate(raw: string) {
  const value = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(value)) {
    const [d, m, y] = value.split("/");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  if (/^\d{1,2}\.\d{1,2}\.\d{4}/.test(value)) {
    const [d, m, y] = value.split(".");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return "";
}

function blankArtist(name: string) {
  return { name: tidy(name), logoUrl: null, thumbUrl: null, genre: null, country: null, bio: null };
}

function addNames(draft: ConcertDraft, names: string[]) {
  const seen = new Set(draft.artists.map((a) => artistKey(a.name)));
  for (const name of names) {
    if (!seen.has(artistKey(name))) {
      draft.artists.push(blankArtist(name));
      seen.add(artistKey(name));
    }
  }
}

function sameShow(draft: ConcertDraft, date: string, venue: string, festivalName: string) {
  return (
    draft.date === date &&
    draft.venue.toLocaleLowerCase("ro") === venue.toLocaleLowerCase("ro") &&
    (draft.festivalName || "").toLocaleLowerCase("ro") === (festivalName || "").toLocaleLowerCase("ro")
  );
}

export function draftsFromCsv(text: string): ConcertDraft[] {
  const rawLines = tidy(text.replace(/^\ufeff/, "")).split(/\r?\n/).filter((l) => l.trim());
  if (rawLines.length < 2) return [];
  const delimiter = detectDelimiter(rawLines[0]);
  const header = splitCsvLine(rawLines[0], delimiter).map(normHeader);
  const idx = (...names: string[]) => header.findIndex((h) => names.includes(h));
  const dateI = idx("date", "when", "day");
  const artistsI = idx("artists", "artist", "band", "bands", "act");
  const venueI = idx("venue", "place", "location");
  const cityI = idx("city", "town");
  const countryI = idx("country");
  const codeI = idx("countrycode", "countryco", "code", "iso");
  const festI = idx("festival", "festivalname", "event");
  const notesI = idx("notes", "note", "comment");
  const ratingI = idx("rating", "score");
  if (dateI < 0 || artistsI < 0 || venueI < 0) return [];

  const drafts: ConcertDraft[] = [];
  let last: ConcertDraft | null = null;

  for (const line of rawLines.slice(1)) {
    const cols = splitCsvLine(line, delimiter);
    const rowDate = parseDate(cols[dateI] ?? "");
    const rowVenue = cols[venueI] ?? "";
    const rowCity = cityI >= 0 ? cols[cityI] ?? "" : "";
    const rowCountry = countryI >= 0 ? cols[countryI] ?? "" : "";
    const rowCode = codeI >= 0 ? cols[codeI] ?? "" : "";
    const rowFest = festI >= 0 ? cols[festI] ?? "" : "";
    const names = (cols[artistsI] ?? "").split(/;|\||\n/).map(tidy).filter(Boolean);
    if (!names.length) continue;

    const notes = notesI >= 0 ? cols[notesI] ?? "" : "";
    const ratingRaw = ratingI >= 0 ? cols[ratingI] ?? "" : "";
    const rating = ratingRaw ? Number(ratingRaw) : null;
    const ratingOk = rating != null && rating >= 0 && rating <= 5 ? rating : null;

    if (!rowDate && last) {
      addNames(last, names);
      if (notes && !last.notes) last.notes = notes;
      if (last.rating == null && ratingOk != null) last.rating = ratingOk;
      continue;
    }

    const date = rowDate;
    const venue = rowVenue;
    if (!date || !venue) continue;
    const festivalName = rowFest;
    if (last && sameShow(last, date, venue, festivalName)) {
      addNames(last, names);
      if (notes && !last.notes) last.notes = notes;
      if (last.rating == null && ratingOk != null) last.rating = ratingOk;
      continue;
    }

    const city = rowCity || venue;
    const place = resolveCountry(rowCountry, rowCode);
    last = {
      date,
      venue,
      city,
      country: place.name,
      countryCode: place.code,
      artists: names.map(blankArtist),
      notes,
      rating: ratingOk,
      favorite: false,
      festival: Boolean(festivalName),
      festivalName,
      festivalPosterUrl: null,
      ticketUrl: null,
    };
    drafts.push(last);
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
