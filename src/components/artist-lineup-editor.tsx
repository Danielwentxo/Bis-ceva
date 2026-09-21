import { ChevronDown, ChevronUp, GripVertical, X } from "lucide-react";
import { ArtistMark } from "@/components/artist-mark";
import type { ArtistMedia } from "@/lib/types";

export function ArtistLineupEditor({
  artists,
  onChange,
}: {
  artists: ArtistMedia[];
  onChange: (artists: ArtistMedia[]) => void;
}) {
  function move(from: number, to: number) {
    if (to < 0 || to >= artists.length) return;
    const next = [...artists];
    const [item] = next.splice(from, 1);
    if (!item) return;
    next.splice(to, 0, item);
    onChange(next);
  }

  function remove(name: string) {
    onChange(artists.filter((a) => a.name !== name));
  }

  return (
    <ul className="space-y-2">
      {artists.map((a, i) => (
        <li
          key={a.name}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("text/plain", String(i));
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
          }}
          onDrop={(e) => {
            e.preventDefault();
            const from = Number(e.dataTransfer.getData("text/plain"));
            if (Number.isFinite(from)) move(from, i);
          }}
          className="flex cursor-grab items-center gap-2 rounded-xl bg-card px-2 py-2 shadow-[var(--shadow-border)] active:cursor-grabbing"
        >
          <GripVertical className="size-4 shrink-0 text-subtle" />
          <ArtistMark artist={a} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{a.name}</p>
            {a.country || a.genre ? (
              <p className="truncate text-xs text-muted-foreground">{[a.country, a.genre].filter(Boolean).join(" \u00b7 ")}</p>
            ) : null}
          </div>
          <button type="button" className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary" onClick={() => move(i, i - 1)} aria-label="Move up">
            <ChevronUp className="size-4" />
          </button>
          <button type="button" className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary" onClick={() => move(i, i + 1)} aria-label="Move down">
            <ChevronDown className="size-4" />
          </button>
          <button type="button" className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground" onClick={() => remove(a.name)}>
            <X className="size-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
