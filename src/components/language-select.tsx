import { useI18n, type Locale } from "@/lib/i18n";
import { flagUrl } from "@/lib/countries";
import { cn } from "@/lib/utils";

const OPTIONS: { code: string; short: string; flag: string }[] = [
  { code: "en", short: "EN", flag: "GB" },
  { code: "fr", short: "FR", flag: "FR" },
  { code: "de", short: "DE", flag: "DE" },
  { code: "es", short: "ES", flag: "ES" },
  { code: "pt", short: "PT", flag: "PT" },
  { code: "it", short: "IT", flag: "IT" },
  { code: "pl", short: "PL", flag: "PL" },
  { code: "ja", short: "JA", flag: "JP" },
  { code: "ar", short: "AR", flag: "SA" },
];

export function LanguageSelect({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const current = OPTIONS.find((item) => item.code === locale) ?? OPTIONS[0];
  return (
    <label dir="ltr" className={cn("relative inline-flex items-center", className)}>
      <span className="sr-only">{t("language")}</span>
      <span className="pointer-events-none absolute left-2 flex items-center">
        <img
          src={flagUrl(current.flag, 80)}
          alt=""
          width={20}
          height={14}
          className="h-3.5 w-5 rounded-[2px] object-cover shadow-sm"
        />
      </span>
      <select
        value={OPTIONS.some((item) => item.code === locale) ? locale : "en"}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="h-9 w-[5.1rem] rounded-lg bg-secondary pl-8 pr-1 text-[11px] font-medium text-foreground shadow-[var(--shadow-border)] outline-none"
      >
        {OPTIONS.map((item) => (
          <option key={item.code} value={item.code}>
            {item.short}
          </option>
        ))}
      </select>
    </label>
  );
}
