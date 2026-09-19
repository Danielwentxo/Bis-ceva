import { useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArtistMark } from "@/components/artist-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/star-rating";
import { searchArtists } from "@/lib/artist-api";
import { COUNTRIES } from "@/lib/countries";
import { todayIso } from "@/lib/format";
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
  festival: boolean;
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
    festival: concert.festival,
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
          festival: false,
          artists: presetArtist ? [presetArtist] : [],
        },
  );
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<ArtistMedia[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    let cancelled = false;
    const t = window.setTimeout(() => {
      setSearching(true);
      void searchArtists({ data: { query: q } })
        .then((rows) => {
          if (!cancelled) setHits(rows);
        })
        .catch(() => {
          if (!cancelled) setHits([]);
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 280);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [query]);

  const venueSuggestions = useMemo(() => {
    const seen = new Map<string, { venue: string; city: string; countryCode: string }>();
    for (const c of concerts) {
      const key = `${c.venue}|${c.city}`;
      if (!seen.has(key)) {
        seen.set(key, { venue: c.venue, city: c.city, countryCode: c.countryCode });
      }
    }
    const q = form.venue.trim().toLowerCase();
    return [...seen.values()]
      .filter((v) => !q || v.venue.toLowerCase().includes(q))
      .slice(0, 5);
  }, [concerts, form.venue]);

  const selectedIds = new Set(form.artists.map((a) => artistKey(a.name)));
  const country = COUNTRIES.find((c) => c.code === form.countryCode);

  function addArtist(hit: ArtistMedia) {
    if (selectedIds.has(artistKey(hit.name))) return;
    setForm((f) => ({ ...f, artists: [...f.artists, hit] }));
    setQuery("");
    setHits([]);
  }

  function removeArtist(name: string) {
    setForm((f) => ({ ...f, artists: f.artists.filter((a) => a.name !== name) }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.date) {
      setError("Alege data concertului.");
      return;
    }
    if (!form.artists.length) {
      setError("Adaugă cel puțin o formație.");
      return;
    }
    if (!form.venue.trim() || !form.city.trim()) {
      setError("Completează locația și orașul.");
      return;
    }
    if (!form.countryCode) {
      setError("Choose a country.");
      return;
    }
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
      festival: form.festival,
    };
    if (existing) {
      updateConcert(existing.id, draft);
      toast.success("Concert actualizat");
      void navigate({ to: "/concerts/$id", params: { id: existing.id } });
    } else {
      const id = addConcert(draft);
      toast.success("Concert adăugat în arhivă");
      void navigate({ to: "/concerts/$id", params: { id } });
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="date">Data</Label>
        <Input
          id="date"
          type="date"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="artist-search">Formații</Label>
        <p className="text-xs text-subtle">Prima din listă e cap de afiș. Logo-urile vin din TheAudioDB și Deezer.</p>
        {form.artists.length ? (
          <ul className="space-y-2">
            {form.artists.map((a, i) => (
              <li
                key={a.name}
                className="flex items-center gap-3 rounded-xl bg-card px-3 py-2 shadow-[var(--shadow-border)]"
              >
                <ArtistMark artist={a} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {i === 0 ? "Cap de afiș" : "Invitat"}
                    {a.genre ? ` · ${a.genre}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                  onClick={() => removeArtist(a.name)}
                  aria-label={`Scoate ${a.name}`}
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <Input
            id="artist-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Caută Metallica, Phoenix, Golan…"
            className="pl-10"
            autoComplete="off"
          />
        </div>
        {(searching || hits.length > 0) && query.trim().length >= 2 ? (
          <ul className="overflow-hidden rounded-xl bg-popover shadow-[var(--shadow-border)]">
            {searching && !hits.length ? (
              <li className="px-3 py-3 text-sm text-muted-foreground">Căutăm logo-uri…</li>
            ) : null}
            {hits.map((hit) => {
              const taken = selectedIds.has(artistKey(hit.name));
              return (
                <li key={hit.name}>
                  <button
                    type="button"
                    disabled={taken}
                    onClick={() => addArtist(hit)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-secondary",
                      taken && "opacity-40",
                    )}
                  >
                    <ArtistMark artist={hit} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{hit.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {[hit.genre, hit.country].filter(Boolean).join(" · ") || "Fără detalii extra"}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="venue">Locație</Label>
        <Input
          id="venue"
          value={form.venue}
          onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
          placeholder="Romexpo, Control Club, Untold…"
          required
        />
        {form.venue && venueSuggestions.length ? (
          <div className="flex flex-wrap gap-2">
            {venueSuggestions.map((v) => (
              <button
                key={`${v.venue}-${v.city}`}
                type="button"
                className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    venue: v.venue,
                    city: v.city,
                    countryCode: v.countryCode,
                  }))
                }
              >
                {v.venue} · {v.city}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">Oraș</Label>
          <Input
            id="city"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            placeholder="City"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <select
            id="country"
            value={form.countryCode}
            onChange={(e) => setForm((f) => ({ ...f, countryCode: e.target.value }))}
            className={
              "flex h-11 w-full rounded-lg bg-secondary px-3 text-base shadow-[var(--shadow-border)] outline-none focus-visible:ring-2 focus-visible:ring-ring/50 md:text-sm " +
              (form.countryCode ? "text-foreground" : "text-muted-foreground")
            }
            required
          >
            <option value="" disabled>
              Country
            </option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code} className="text-foreground">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex h-11 items-center gap-3 rounded-xl bg-card px-3 shadow-[var(--shadow-border)]">
        <input
          type="checkbox"
          checked={form.festival}
          onChange={(e) => setForm((f) => ({ ...f, festival: e.target.checked }))}
          className="size-4 accent-primary"
        />
        <span className="text-sm">A fost festival</span>
      </label>

      <label className="flex h-11 items-center gap-3 rounded-xl bg-card px-3 shadow-[var(--shadow-border)]">
        <input
          type="checkbox"
          checked={form.favorite}
          onChange={(e) => setForm((f) => ({ ...f, favorite: e.target.checked }))}
          className="size-4 accent-primary"
        />
        <span className="text-sm">Marchează ca favorit</span>
      </label>

      <div className="space-y-2">
        <Label>Notă</Label>
        <StarRating value={form.rating} onChange={(rating) => setForm((f) => ({ ...f, rating }))} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Însemnări</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Setlist, oameni, vreme, ce a rămas."
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-3">
        <Button type="submit" className="flex-1">
          {existing ? "Salvează" : "Adaugă în arhivă"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (existing) void navigate({ to: "/concerts/$id", params: { id: existing.id } });
            else void navigate({ to: "/" });
          }}
        >
          Anulează
        </Button>
      </div>
    </form>
  );
}
