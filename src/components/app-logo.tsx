import { APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function AppLogo({
  className,
  showWordmark = true,
  size = "md",
}: {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const box = size === "lg" ? "size-10" : size === "sm" ? "size-7" : "size-8";
  const type = size === "lg" ? "text-3xl" : size === "sm" ? "text-xl" : "text-2xl";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 32 32" className={cn(box, "shrink-0")} aria-hidden>
        <rect width="32" height="32" rx="7" fill="#1e1c19" />
        <rect x="5" y="10" width="22" height="12" rx="2.5" fill="#f3efe6" />
        <circle cx="10" cy="16" r="1.7" fill="#0c0b0a" />
        <path d="M13.2 16h11" stroke="#0c0b0a" strokeWidth="1.1" strokeDasharray="1.4 1.4" strokeLinecap="round" />
        <path d="M18.5 19.2h5.8M18.5 21h4.2" stroke="#0c0b0a" strokeWidth="1" strokeLinecap="round" />
      </svg>
      {showWordmark ? <span className={cn("font-display font-medium tracking-tight", type)}>{APP_NAME}</span> : null}
    </span>
  );
}
