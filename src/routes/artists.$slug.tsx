import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ArtistMark } from "@/components/artist-mark";
import { ConcertCard } from "@/components/concert-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveCatalogArtist } from "@/lib/catalog";
import { COUNTRIES } from "@/lib/countries";
import { originCountry } from "@/lib/stats";
import { showsLabel } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { resizeImageFile } from "@/lib/image-file";
import { moderateImage } from "@/lib/moderate-image";
import { useArchive } from "@/lib/store";
import { artistKey } from "@/lib/utils";
import type { Artist } from "@/lib/types";

export const Route = createFileRoute("/artists/$slug")({ component: ArtistDetail });

function Fact({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="rounded-xl bg-card px-4 py-3 text-left shadow-[var(--shadow-border)]">
      <p className="text-xs uppercase tracking-wider text-subtle">{label}</p>
      <p className="mt-1 text-sm font-medium break-words">{value}</p>
    </div>
  );
}

function ArtistDetail() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { slug } = Route.useParams();
  const artists = useArchive((s) => s.artists);
  const concerts = useArchive((s) => s.concerts);
  const applyArtistMedia = useArchive((s) => s.applyArtistMedia);

  const artist: Artist | undefined =
    artists[slug] ?? Object.values(artists).find((a) => a.id === slug || artistKey(a.name) === slug);

  const shows = concerts
    .filter((c) =>
      c.lineup.some((l) => l.artistId === slug || l.artistId === artist?.id || artistKey(l.artistId) === slug),
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const name = artist?.name ?? slug.replace(/-/g, " ");
  const country = originCountry(artist?.country) ?? artist?.country;
  const city = artist?.city?.trim() || null;
  const website = artist?.website?.trim() || null;

  const [editing, setEditing] = useState(false);
  const [genre, setGenre] = useState(artist?.genre ?? "");
  const [origin, setOrigin] = useState(artist?.country ?? "");
  const [bio, setBio] = useState(artist?.bio ?? "");
  const [logoUrl, setLogoUrl] = useState(artist?.logoUrl ?? artist?.thumbUrl ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit() {
    setGenre(artist?.genre ?? "");
    setOrigin(artist?.country ?? "");
    setBio(artist?.bio && !/holy spirit|theology|album by/i.test(artist.bio) ? artist.bio : "");
    setLogoUrl(artist?.logoUrl ?? artist?.thumbUrl ?? null);
    setError(null);
    setEditing(true);
  }

  async function onLogo(file: File | undefined) {
    if (!file) return;
    try {
      const dataUrl = await resizeImageFile(file);
      const check = await moderateImage({ data: { dataUrl } });
      if (!check.ok) {
        setError(check.reason);
        return;
      }
      setError(null);
      setLogoUrl(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not use this image.");
    }
  }

  async function saveProfile() {
    setSaving(true);
    setError(null);
    try {
      const saved = await saveCatalogArtist({
        data: {
          name,
          logoUrl,
          thumbUrl: logoUrl,
          genre: genre.trim() || null,
          country: origin.trim() || null,
          bio: bio.trim() || null,
          overwrite: true,
        },
      });
      applyArtistMedia([
        {
          name,
          logoUrl: saved.logoUrl ?? logoUrl,
          thumbUrl: saved.thumbUrl ?? logoUrl,
          genre: saved.genre ?? genre.trim() || null,
          country: saved.country ?? origin.trim() || null,
          bio: saved.bio ?? bio.trim() || null,
        },
      ]);
      toast.success("Artist saved");
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save artist.");
    } finally {
      setSaving(false);
    }
  }

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
      return;
    }
    void navigate({ to: "/artists" });
  }

  return (
    <AppShell>
      <div className="mb-6 flex gap-2">
        <Button type="button" variant="outline" onClick={goBack}>
          <ArrowLeft className="size-4" />
          {t("back")}
        </Button>
        {!editing ? (
          <Button type="button" variant="outline" onClick={startEdit}>
            <Pencil className="size-4" />
            Edit
          </Button>
        ) : null}
      </div>
      <div className="flex flex-col items-center text-center">
        <ArtistMark artist={{ name, logoUrl, thumbUrl: logoUrl, genre, country: origin, bio }} size="hero" />
        <h1 className="mt-5 font-display text-4xl font-medium tracking-tight">{name}</h1>
        {!editing ? (
          <>
            <p className="mt-2 text-sm text-muted-foreground">{[artist?.genre, city, country].filter(Boolean).join(" \u00b7 ")}</p>
            <p className="mt-1 text-sm text-subtle">{showsLabel(shows.length)}</p>
          </>
        ) : null}
      </div>

      {editing ? (
        <div className="mt-8 space-y-4 rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
          <div className="space-y-2">
            <Label htmlFor="artist-logo">Logo</Label>
            <Input id="artist-logo" type="file" accept="image/*" onChange={(e) => void onLogo(e.target.files?.[0])} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="artist-genre">Genre</Label>
            <Input id="artist-genre" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Punk, Metal…" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="artist-country">{t("country")}</Label>
            <select
              id="artist-country"
              value={COUNTRIES.some((c) => c.name === origin) ? COUNTRIES.find((c) => c.name === origin)?.code ?? "" : ""}
              onChange={(e) => setOrigin(COUNTRIES.find((c) => c.code === e.target.value)?.name ?? "")}
              className="flex h-11 w-full rounded-lg bg-secondary px-3 text-sm shadow-[var(--shadow-border)] outline-none"
            >
              <option value="">Optional</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="artist-bio">About</Label>
            <Textarea id="artist-bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short description" />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-2">
            <Button type="button" onClick={() => void saveProfile()} disabled={saving}>
              {t("save")}
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditing(false)}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Fact label="Genre" value={artist?.genre} />
            <Fact label="Style" value={artist?.style} />
            <Fact label="City" value={city} />
            <Fact label={t("country")} value={country} />
            <Fact label="Formed" value={artist?.formedYear} />
            {website ? (
              <div className="rounded-xl bg-card px-4 py-3 text-left shadow-[var(--shadow-border)]">
                <p className="text-xs uppercase tracking-wider text-subtle">Website</p>
                <a href={website.startsWith("http") ? website : `https://${website}`} className="mt-1 block truncate text-sm font-medium text-primary" target="_blank" rel="noreferrer">
                  {website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            ) : null}
          </div>
          {artist?.bio ? <p className="mt-8 text-sm leading-relaxed text-muted-foreground">{artist.bio}</p> : null}
        </>
      )}

      <section className="mt-10 space-y-3">
        <h2 className="font-display text-2xl font-medium">{t("seenLive")}</h2>
        {shows.length ? (
          shows.map((c) => <ConcertCard key={c.id} concert={c} artists={artists} />)
        ) : (
          <p className="text-sm text-muted-foreground">{t("noMatches")}</p>
        )}
      </section>
    </AppShell>
  );
}
