import { extraLabel } from "@/lib/i18n-extras";
import { FAQ, type Faq } from "@/lib/i18n-faq";
import { FORM_COPY } from "@/lib/i18n-form";
import { PAGE_COPY } from "@/lib/i18n-page-copy";

export function pageLabel(locale: string, key: string, vars?: Record<string, string>) {
  let text =
    PAGE_COPY[locale]?.[key] ??
    FORM_COPY[locale]?.[key] ??
    PAGE_COPY.en?.[key] ??
    FORM_COPY.en?.[key] ??
    extraLabel(locale, key, vars) ??
    key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, v);
  }
  return text;
}

export function pageFaq(locale: string): Faq[] {
  return FAQ[locale] ?? FAQ.en;
}
