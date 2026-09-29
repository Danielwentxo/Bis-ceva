import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function artistKey(name: string, country?: string | null) {
  const base = slugify(name) || "artist";
  const place = country ? slugify(country) : "";
  return place ? `${base}--${place}` : base;
}

export function venueKey(venue: string, city: string) {
  return `${slugify(venue)}--${slugify(city)}`;
}
