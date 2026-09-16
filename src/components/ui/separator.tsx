import { cn } from "@/lib/utils";

function Separator({ className, decorative = true }: { className?: string; decorative?: boolean }) {
  return (
    <div
      role={decorative ? "none" : "separator"}
      className={cn("h-px w-full bg-border", className)}
    />
  );
}

export { Separator };
