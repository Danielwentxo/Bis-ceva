import { useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArtistMark } from "@/components/artist-mark";
import { DateInput } from "@/components/date-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/star-rating";
import { searchArtists } from "@/lib/artist-api";
import { saveCatalogArtist, saveCatalogVenue, searchCatalogArtists, searchCatalogVenues } from "@/lib/catalog";
import { COUNTRIES } from "@/lib/countries";
import { todayIso } from "@/lib/format";
import { extraLabel } from "@/lib/i18n-extras";
import { useI18n } from "@/lib/i18n";
import { resizeImageFile } from "@/lib/image-file";
import { moderateImage } from "@/lib/moderate-image";
import { useArchive } from "@/lib/store";
import type { ArtistMedia, Concert } from "@/lib/types";
import { artistKey, cn } from "@/lib/utils";

type FormState = {
  date: string;
  venue: string;
  city: string;
  countryCode: string;
  notes: string;
  rating: number | null;
  favorite: boolean;
  festivalName: string;
  festivalPosterUrl: string | null;
  artists: ArtistMedia[];
};

function concertToForm(concert: Concert, artists: Record<string, import("@/lib/types").Artist>): FormState {
  return {
    date: concert.date,
    venue: concert.venue,
    city: concert.city,
    countryCode: concert.countryCode,
    notes: concert.notes,
    rating: concert.rating,
    favorite: concert.favorite,
    festivalName: concert.festivalName ?? "",
    festivalPosterUrl: concert.festivalPosterUrl ?? null,
    artists: concert.lineup
      .map((l) => artists[l.artistId])
      .filter(Boolean)
      .map((a) => ({
        name: a.name,
        logoUrl: a.logoUrl,
        thumbUrl: a.thumbUrl,
        genre: a.genre,
        country: a.country,
        bio: a.bio,
      })),
  };
}

export function ConcertForm({
  existing,
  presetArtist,
}: {
  existing?: Concert;
  presetArtist?: ArtistMedia | null;
}) {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const archiveArtists = useArchive((s) => s.artists);
  const concerts = useArchive((s) => s.concerts);
  const addConcert = useArchive((s) => s.addConcert);
  const updateConcert = useArchive((s) => s.updateConcert);

  const [form, setForm] = useState<FormState>(() =>
    existing
      ? concertToForm(existing, archiveArtists)
      : {
          date: todayIso(),
          venue: "",
          city: "",
          countryCode: "",
          notes: "",
          rating: null,
          favorite: false,
          festivalName: "",
          festivalPosterUrl: null,
          artists: presetArtist ? [presetArtist] : [],
        },
  );
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<ArtistMedia[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [catalogVenues, setCatalogVenues] = useState<{ venue: string; city: string; countryCode: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState<{ name: string; country: string; genre: string; logoUrl: string | null; thumbUrl: string | null } | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setSearching(true);
      void Promise.all([
        searchCatalogArtists({ data: { query: q } }).catch(() => [] as ArtistMedia[]),
        searchArtists({ data: { query: q } }).catch(() => [] as ArtistMedia[]),
      ])
        .then(([catalog, api]) => {
          if (cancelled) return;
          const byName = new Map<string, ArtistMedia>();
          for (const row of [...catalog, ...api]) {
            const key = artistKey(row.name);
            if (!byName.has(key)) byName.set(key, row);
          }
          setHits([...byName.values()]);
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 280);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const q = form.venue.trim();
    if (q.length < 2) {
      setCatalogVenues([]);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void searchCatalogVenues({ data: { query: q } })
        .then((rows) => {
          if (!cancelled) setCatalogVenues(rows);
        })
        .catch(() => {
          if (!cancelled) setCatalogVenues([]);
        });
    }, 280);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [form.venue]);

  const venueSuggestions = useMemo(() => {
    const seen = new Map<string, { venue: string; city: string; countryCode: string }>();
    for (const row of catalogVenues) seen.set(`${row.venue}|${row.city}`, row);
    for (const c of concerts) {
      const key = `${c.venue}|${c.city}`;
      if (!seen.has(key)) seen.set(key, { venue: c.venue, city: c.city, countryCode: c.countryCode });
    }
    const q = form.venue.trim().toLowerCase();
    return [...seen.values()]
      .filter((v) => !q || v.venue.toLowerCase().includes(q) || v.city.toLowerCase().includes(q))
      .slice(0, 6);
  }, [concerts, form.venue, catalogVenues]);

  const selectedIds = new Set(form.artists.map((a) => artistKey(a.name)));
  const country = COUNTRIES.find((c) => c.code === form.countryCode);
  const exactHit = hits.some((hit) => artistKey(hit.name) === artistKey(query.trim()));

  function addArtist(hit: ArtistMedia) {
    if (selectedIds.has(artistKey(hit.name))) return;
    setForm((f) => ({ ...f, artists: [...f.artists, hit] }));
    setQuery("");
    setHits([]);
    setManual(null);
  }

  function startManualArtist() {
    const name = query.trim();
    if (name.length < 2) return;
    setManual({ name, country: "", genre: "", logoUrl: null, thumbUrl: null });
  }

  function startDetails(hit: ArtistMedia) {
    setManual({
      name: hit.name,
      country: "",
      genre: hit.genre ?? "",
      logoUrl: hit.logoUrl,
      thumbUrl: hit.thumbUrl,
    });
    setHits([]);
  }

  function confirmManualArtist() {
    if (!manual) return;
    const origin = COUNTRIES.find((c) => c.code === manual.country)?.name ?? null;
    const genre = manual.genre.trim() || null;
    addArtist({
      name: manual.name,
      logoUrl: manual.logoUrl,
      thumbUrl: manual.thumbUrl ?? manual.logoUrl,
      genre,
      country: origin,
      bio: null,
    });
    void saveCatalogArtist({
      data: {
        name: manual.name,
        logoUrl: manual.logoUrl,
        thumbUrl: manual.thumbUrl ?? manual.logoUrl,
        country: origin,
        genre,
      },
    }).catch(() => undefined);
  }

  function removeArtist(name: string) {
    setForm((f) => ({ ...f, artists: f.artists.filter((a) => a.name !== name) }));
  }

  async function onFestivalPoster(file: File | undefined) {
    if (!file) return;
    try {
      const poster = await resizeImageFile(file);
      const check = await moderateImage({ data: { dataUrl: poster } });
      if (!check.ok) {
        setError(check.reason);
        return;
      }
      setError(null);
      setForm((f) => ({ ...f, festivalPosterUrl: poster }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not use this image.");
    }
  }

  async function onLogo(file: File | undefined) {
    if (!file || !manual) return;
    try {
      const logoUrl = await resizeImageFile(file);
      const check = await moderateImage({ data: { dataUrl: logoUrl } });
      if (!check.ok) {
        setError(check.reason);
        return;
      }
      setError(null);
      setManual({ ...manual, logoUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not use this image.");
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.date) {
      setError(t("needDate"));
      return;
    }
    if (!form.artists.length) {
      setError(t("needArtist"));
      return;
    }
    if (!form.venue.trim() || !form.city.trim()) {
      setError(t("needPlace"));
      return;
    }
    if (!form.countryCode) {
      setError(t("chooseCountry"));
      return;
    }
    const festivalName = form.festivalName.trim();
    const draft = {
      date: form.date,
      venue: form.venue,
      city: form.city,
      country: country?.name ?? form.countryCode,
      countryCode: form.countryCode,
      artists: form.artists,
      notes: form.notes,
      rating: form.rating,
      favorite: form.favorite,
      festival: Boolean(festivalName),
      festivalName,
      festivalPosterUrl: form.festivalPosterUrl,
    };
    setSaving(true);
    try {
      void saveCatalogVenue({
        data: {
          venue: draft.venue.trim(),
          city: draft.city.trim(),
          country: draft.country,
          countryCode: draft.countryCode,
        },
      }).catch(() => undefined);
      for (const artist of draft.artists) {
        void saveCatalogArtist({ data: artist }).catch(() => undefined);
      }
      if (existing) {
        await updateConcert(existing.id, draft);
        toast.success(extraLabel(locale, "savedToArchive"));
        await navigate({ to: "/concerts/$id", params: { id: existing.id } });
      } else {
        const id = await addConcert(draft);
        toast.success(extraLabel(locale, "savedToArchive"));
        await navigate({ to: "/concerts/$id", params: { id } });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : extraLabel(locale, "savedToArchive"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="date">{t("date")}</Label>
        <DateInput id="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="festival">{t("festivalBadge")}</Label>
        <Input id="festival" value={form.festivalName} onChange={(e) => setForm((f) => ({ ...f, festivalName: e.target.value }))} placeholder="Untold, Sziget, Download…" />
        {form.festivalName.trim() ? (
          <div className="space-y-2">
            <Label htmlFor="festival-poster">Festival poster</Label>
            <Input id="festival-poster" type="file" accept="image/*" onChange={(e) => void onFestivalPoster(e.target.files?.[0])} />
            {form.festivalPosterUrl ? <img src={form.festivalPosterUrl} alt="" className="h-20 rounded-lg object-cover" /> : null}
          </div>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="artist-search">{t("artists")}</Label>
        <p className="text-xs text-subtle">{t("artistsHint")}</p>
        {form.artists.length ? (
          <ul className="space-y-2">
            {form.artists.map((a, i) => (
              <li key={a.name} className="flex items-center gap-3 rounded-xl bg-card px-3 py-2 shadow-[var(--shadow-border)]">
                <ArtistMark artist={a} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {i === 0 ? t("headliner") : t("support")}
                    {a.country ? ` · ${a.country}` : ""}
                    {a.genre ? ` · ${a.genre}` : ""}
                  </p>
                </div>
                <button type="button" className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground" onClick={() => removeArtist(a.name)}>
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <Input id="artist-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("searchArtistsPh")} className="pl-10" autoComplete="off" />
        </div>
        {query.trim().length >= 2 && !manual ? (
          <ul className="overflow-hidden rounded-xl bg-popover shadow-[var(--shadow-border)]">
            {searching && !hits.length ? <li className="px-3 py-3 text-sm text-muted-foreground">{t("searchingLogos")}</li> : null}
            {hits.map((hit) => {
              const taken = selectedIds.has(artistKey(hit.name));
              return (
                <li key={hit.name}>
                  <button type="button" disabled={taken} onClick={() => addArtist(hit)} className={cn("flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-secondary", taken && "opacity-40")}>
                    <ArtistMark artist={hit} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{hit.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{[hit.genre, hit.country].filter(Boolean).join(" · ") || t("noExtra")}</span>
                    </span>
                  </button>
                  {!hit.genre && !hit.country ? (
                    <button type="button" onClick={() => startDetails(hit)} className="w-full px-3 pb-2 text-left text-xs text-primary hover:underline">
                      Add details
                    </button>
                  ) : null}
                </li>
              );
            })}
            {!exactHit ? (
              <li>
                <button type="button" onClick={startManualArtist} className="flex w-full items-center px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
                  {extraLabel(locale, "addManually", { name: query.trim() })}
                </button>
              </li>
            ) : null}
          </ul>
        ) : null}
        {manual ? (
          <div className="space-y-3 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
            <p className="text-sm font-medium">{manual.name}</p>
            <div className="space-y-2">
              <Label htmlFor="artist-genre">Genre</Label>
              <Input id="artist-genre" value={manual.genre} onChange={(e) => setManual({ ...manual, genre: e.target.value })} placeholder="Metal, Rock, Jazz…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist-origin">{t("country")}</Label>
              <select id="artist-origin" value={manual.country} onChange={(e) => setManual({ ...manual, country: e.target.value })} className="flex h-11 w-full rounded-lg bg-secondary px-3 text-sm text-foreground shadow-[var(--shadow-border)] outline-none">
                <option value="">Optional</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist-logo">Logo</Label>
              <Input id="artist-logo" type="file" accept="image/*" onChange={(e) => void onLogo(e.target.files?.[0])} />
              {manual.logoUrl ? <img src={manual.logoUrl} alt="" className="size-14 rounded-lg object-cover" /> : null}
            </div>
            <div className="flex gap-2">
              <Button type="button" onClick={confirmManualArtist}>{t("save")}</Button>
              <Button type="button" variant="outline" onClick={() => setManual(null)}>{t("cancel")}</Button>
            </div>
          </div>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="venue">{t("venue")}</Label>
        <Input id="venue" value={form.venue} onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))} placeholder={t("venuePh")} required />
        {form.venue && venueSuggestions.length ? (
          <div className="flex flex-wrap gap-2">
            {venueSuggestions.map((v) => (
              <button key={`${v.venue}-${v.city}`} type="button" className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground hover:text-foreground" onClick={() => setForm((f) => ({ ...f, venue: v.venue, city: v.city, countryCode: v.countryCode || f.countryCode }))}>
                {v.venue} · {v.city}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">{t("city")}</Label>
          <Input id="city" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder={t("city")} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">{t("country")}</Label>
          <select id="country" value={form.countryCode} onChange={(e) => setForm((f) => ({ ...f, countryCode: e.target.value }))} className={"flex h-11 w-full rounded-lg bg-secondary px-3 text-base shadow-[var(--shadow-border)] outline-none focus-visible:ring-2 focus-visible:ring-ring/50 md:text-sm " + (form.countryCode ? "text-foreground" : "text-muted-foreground")} required>
            <option value="" disabled>{t("country")}</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code} className="text-foreground">{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      <label className="flex h-11 items-center gap-3 rounded-xl bg-card px-3 shadow-[var(--shadow-border)]">
        <input type="checkbox" checked={form.favorite} onChange={(e) => setForm((f) => ({ ...f, favorite: e.target.checked }))} className="size-4 accent-primary" />
        <span className="text-sm">{t("favorite")}</span>
      </label>
      <div className="space-y-2">
        <Label>{t("rating")}</Label>
        <StarRating value={form.rating} onChange={(rating) => setForm((f) => ({ ...f, rating }))} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">{t("notes")}</Label>
        <Textarea id="notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder={t("notesPh")} />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex gap-3">
        <Button type="submit" className="flex-1" disabled={saving}>{existing ? t("save") : t("addToArchive")}</Button>
        <Button type="button" variant="outline" onClick={() => { if (existing) void navigate({ to: "/concerts/$id", params: { id: existing.id } }); else void navigate({ to: "/" }); }}>{t("cancel")}</Button>
      </div>
    </form>
  );
}
