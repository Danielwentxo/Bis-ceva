import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  onChange,
  size = "md",
}: {
  value: number | null;
  onChange?: (value: number | null) => void;
  size?: "sm" | "md";
}) {
  const interactive = Boolean(onChange);
  const icon = size === "sm" ? "size-3.5" : "size-5";

  return (
    <div className="flex items-center gap-0.5" role={interactive ? "radiogroup" : "img"} aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = (value ?? 0) >= n;
        const inner = (
          <Star
            className={cn(
              icon,
              active ? "fill-primary text-primary" : "text-subtle",
            )}
          />
        );
        if (!interactive) {
          return <span key={n}>{inner}</span>;
        }
        return (
          <button
            key={n}
            type="button"
            className="flex size-9 items-center justify-center rounded-md hover:bg-secondary"
            onClick={() => onChange?.(value === n ? null : n)}
            aria-label={`${n} stele`}
            aria-pressed={value === n}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}
