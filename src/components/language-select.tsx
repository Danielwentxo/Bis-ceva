import { LOCALES, useI18n, type Locale } from "@/lib/i18n";
import { flagUrl } from "@/lib/countries";
import { cn } from "@/lib/utils";

const FLAG: Record<Locale, string> = {
  en: "GB",
  fr: "FR",
  de: "DE",
  es: "ES",
};

const SHORT: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
  de: "DE",
  es: "ES",
};

export function LanguageSelect({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <label className={cn("relative inline-flex items-center", className)}>
      <span className="sr-only">{t("language")}</span>
      <span className="pointer-events-none absolute left-2 flex items-center">
        <img
          src={flagUrl(FLAG[locale], 80)}
          alt=""
          width={20}
          height={14}
          className="h-3.5 w-5 rounded-[2px] object-cover shadow-sm"
        />
      </span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="h-9 w-[4.75rem] rounded-lg bg-secondary pl-8 pr-1 text-[11px] font-medium text-foreground shadow-[var(--shadow-border)] outline-none"
      >
        {LOCALES.map((item) => (
          <option key={item.code} value={item.code}>
            {SHORT[item.code]}
          </option>
        ))}
      </select>
    </label>
  );
}
