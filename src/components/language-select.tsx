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

export function LanguageSelect({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <label className={cn("relative flex items-center", compact ? "" : "block")}>
      <span className="sr-only">{t("language")}</span>
      {compact ? (
        <span className="pointer-events-none absolute left-1.5 flex items-center">
          <img src={flagUrl(FLAG[locale], 40)} alt="" width={16} height={11} className="h-3 w-[16px] rounded-[2px] object-cover" />
        </span>
      ) : null}
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className={cn(
          "rounded-lg bg-secondary text-foreground shadow-[var(--shadow-border)] outline-none",
          compact ? "h-9 w-[4.4rem] pl-6 pr-1 text-[11px] font-medium" : "h-10 w-full px-3 text-sm",
        )}
      >
        {LOCALES.map((item) => (
          <option key={item.code} value={item.code}>
            {compact ? SHORT[item.code] : item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
