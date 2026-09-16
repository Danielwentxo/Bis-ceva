import { format, isValid, parseISO } from "date-fns";
import { ro } from "date-fns/locale";

export function parseDate(value: string) {
  const d = parseISO(value);
  return isValid(d) ? d : null;
}

export function formatConcertDate(value: string) {
  const d = parseDate(value);
  if (!d) return value;
  return format(d, "d MMMM yyyy", { locale: ro });
}

export function formatShortDate(value: string) {
  const d = parseDate(value);
  if (!d) return value;
  return format(d, "d MMM yyyy", { locale: ro });
}

export function formatDayMonth(value: string) {
  const d = parseDate(value);
  if (!d) return value;
  return format(d, "d MMM", { locale: ro });
}

export function todayIso() {
  return format(new Date(), "yyyy-MM-dd");
}

export function plural(
  n: number,
  one: string,
  few: string,
  many: string,
) {
  const abs = Math.abs(n);
  const mod100 = abs % 100;
  const mod10 = abs % 10;
  if (abs === 1) return `${n} ${one}`;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
    return `${n} ${few}`;
  }
  return `${n} ${many}`;
}

export function showsLabel(n: number) {
  return plural(n, "concert", "concerte", "concerte");
}

export function artistsLabel(n: number) {
  return plural(n, "formație", "formații", "formații");
}

export function venuesLabel(n: number) {
  return plural(n, "locație", "locații", "locații");
}

export function countriesLabel(n: number) {
  return plural(n, "țară", "țări", "țări");
}
