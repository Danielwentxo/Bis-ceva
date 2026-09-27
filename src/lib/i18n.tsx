import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { MORE_DICTS } from "@/lib/i18n-more";

export const LOCALES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "it", label: "Italiano" },
  { code: "pl", label: "Polski" },
  { code: "ja", label: "日本語" },
  { code: "ar", label: "العربية" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

const STORAGE_KEY = "bis-locale";

let currentLocale: Locale = "en";
export function getLocale() {
  return currentLocale;
}
