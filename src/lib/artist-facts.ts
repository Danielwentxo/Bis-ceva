import { countryByName } from "./countries";
import { originCountry } from "./stats";

export function splitOrigin(raw: string | null | undefined) {
  if (!raw?.trim()) return { city: null as string | null, country: null as string | null };
  const parts = raw
    .split(/[,|/]/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) return { city: null, country: null };
  const country = originCountry(raw);
  const cityParts = parts.filter((part) => {
    const named = countryByName(part);
    const origin = originCountry(part);
    return !named && origin !== country;
  });
  return { city: cityParts[0] ?? null, country };
}
