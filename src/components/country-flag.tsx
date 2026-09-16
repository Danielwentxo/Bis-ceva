import { flagUrl } from "@/lib/countries";
import { cn } from "@/lib/utils";

export function CountryFlag({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  if (!code) return null;
  return (
    <img
      src={flagUrl(code, 40)}
      alt=""
      className={cn("h-3.5 w-5 rounded-sm object-cover shadow-[var(--shadow-border)]", className)}
    />
  );
}
