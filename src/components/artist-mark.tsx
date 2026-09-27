import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Artist, ArtistMedia } from "@/lib/types";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

const SIZE: Record<Size, string> = {
  xs: "size-8",
  sm: "size-10",
  md: "size-12",
  lg: "size-16",
  xl: "size-24",
  hero: "size-36",
};

const RADIUS: Record<Size, string> = {
  xs: "rounded-md",
  sm: "rounded-lg",
  md: "rounded-lg",
  lg: "rounded-xl",
  xl: "rounded-2xl",
  hero: "rounded-3xl",
};

const TEXT: Record<Size, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
  xl: "text-3xl",
  hero: "text-5xl",
};

function initial(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]!.slice(0, 1) + parts[1]!.slice(0, 1)).toUpperCase();
}

function usableSrc(url: string | null | undefined) {
  if (!url) return null;
  const t = url.trim();
  if (!t) return null;
  if (/deezer\.com|dzcdn\.net|wikipedia\.org|wikimedia\.org/i.test(t)) return null;
  return t;
}

export function ArtistMark({
  artist,
  size = "md",
  className,
}: {
  artist: Pick<Artist | ArtistMedia, "name" | "logoUrl" | "thumbUrl"> | null | undefined;
  size?: Size;
  className?: string;
}) {
  const [failed, setFailed] = useState<Record<string, true>>({});
  const name = artist?.name ?? "";
  const logo = usableSrc(artist?.logoUrl);
  const thumb = usableSrc(artist?.thumbUrl);
  const logoOk = logo && !failed[logo] ? logo : null;
  const thumbOk = thumb && !failed[thumb] ? thumb : null;
  const src = logoOk ?? thumbOk;
  const isLogo = Boolean(logoOk) && src === logoOk;

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-secondary shadow-[var(--shadow-border)]",
        SIZE[size],
        RADIUS[size],
        className,
      )}
      aria-hidden={!name}
      title={name}
    >
      {src ? (
        <img
          src={src}
          alt=""
          className={cn("size-full", isLogo ? "object-contain p-1.5" : "object-cover")}
          onError={() => {
            if (src) setFailed((prev) => ({ ...prev, [src]: true }));
          }}
        />
      ) : (
        <div
          className={cn(
            "flex size-full items-center justify-center font-display font-medium text-primary",
            TEXT[size],
          )}
        >
          {initial(name)}
        </div>
      )}
    </div>
  );
}

export function ArtistStack({
  artists,
  size = "sm",
}: {
  artists: Array<Pick<Artist, "name" | "logoUrl" | "thumbUrl" | "id"> | null | undefined>;
  size?: Size;
}) {
  const shown = artists.filter(Boolean).slice(0, 4);
  return (
    <div className="flex items-center">
      {shown.map((artist, i) => (
        <div key={`${artist!.name}-${i}`} className={cn(i > 0 && "-ml-2")} style={{ zIndex: shown.length - i }}>
          <ArtistMark artist={artist} size={size} className="ring-2 ring-background" />
        </div>
      ))}
    </div>
  );
}
