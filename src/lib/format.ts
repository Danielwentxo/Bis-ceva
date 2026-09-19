import { format, isValid, parseISO } from "date-fns";
import { de, enUS, es, fr } from "date-fns/locale";
import { getLocale } from "@/lib/i18n";

const DATE_LOCALES = { en: enUS, fr, de, es } as const;

function dateLocale() {
  return DATE_LOCALES[getLocale()] ?? enUS;
}

export function parseDate(value: string) {
  const d = parseISO(value);
  return isValid(d) ? d : null;
}

export function formatConcertDate(value: string) {
  const d = parseDate(value);
  if (!d) return value;
  return format(d, "d MMMM yyyy", { locale: dateLocale() });
}

export function formatShortDate(value: string) {
  const d = parseDate(value);
  if (!d) return value;
  return format(d, "d MMM yyyy", { locale: dateLocale() });
}

export function formatDayMonth(value: string) {
  const d = parseDate(value);
  if (!d) return value;
  return format(d, "d MMM", { locale: dateLocale() });
}

export function todayIso() {
  return format(new Date(), "yyyy-MM-dd");
}

export function countLabel(n: number, one: string, many: string) {
  return n === 1 ? one : many.replace("{n}", String(n));
}
