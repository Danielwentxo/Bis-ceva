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

const baseDict: Record<string, Record<string, string>> = {
  en: {
    archiveSubtitle: "Concert archive",
    navConcerts: "Concerts",
    navArtists: "Artists",
    navVenues: "Venues",
    navStats: "Stats",
    addConcert: "Add concert",
    signInTitle: "Sign in to your account",
    signUpTitle: "Create an account",
    forgotTitle: "Reset your password",
    name: "Name",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    createAccount: "Create account",
    sendReset: "Send reset link",
    forgotPassword: "Forgot password",
    noAccount: "No account? Create one",
    hasAccount: "Already have an account? Sign in",
    backToSignIn: "Back to sign in",
    orFaster: "Or continue with",
    resetSent: "If an account exists for {email}, you will receive a reset link.",
    country: "Country",
    city: "City",
    venue: "Venue",
    date: "Date",
    artists: "Artists",
    notes: "Notes",
    rating: "Rating",
    festival: "This was a festival",
    favorite: "Mark as favorite",
    save: "Save",
    cancel: "Cancel",
    addToArchive: "Add to archive",
    chooseCountry: "Choose a country.",
    language: "Language",
    signOut: "Sign out",
    signingOut: "Signing out…",
    liveArchive: "Live archive",
    yourConcerts: "Your concerts",
    searchShows: "Search artist, venue, city",
    allYears: "All years",
    upcoming: "Upcoming",
    noMatches: "Nothing matches this filter.",
    emptyTitle: "Your archive is ready",
    emptyBody: "Add the last show you attended, or import your list.",
    loadExamples: "Load examples",
    artistsLead: "Artists you have seen live",
    searchArtist: "Search an artist",
    venuesLead: "Halls, clubs, arenas",
    venuesTitle: "Venues",
    statsLead: "Your archive in numbers",
    statsTitle: "Stats",
    tileConcerts: "Concerts",
    tileArtists: "Artists",
    tileVenues: "Venues",
    tileCountries: "Countries",
    mostSeen: "Most seen artist",
    firstShow: "First concert",
    lastShow: "Latest concert",
    festivals: "Festivals",
    favorites: "Favorites",
    clearArchive: "Clear archive",
    clearArchiveConfirm: "Delete all concerts in this account?",
    edit: "Edit",
    newEntry: "New entry",
    editConcert: "Edit concert",
    headliner: "Headliner",
    support: "Support",
    lineup: "Lineup",
    viewArtist: "View artist",
    concertMissing: "This concert is no longer in the archive.",
    backToConcerts: "Back to concerts",
    artistMissing: "This artist is not in the archive.",
    back: "Back",
    seenLive: "Seen live",
    with: "with",
    favoriteBadge: "Favorite",
    festivalBadge: "Festival",
    deleteConcertConfirm: "Remove this concert from the archive?",
    artistsHint: "The first artist is the headliner.",
    searchArtistsPh: "Search Metallica, Phoenix…",
    venuePh: "Arena, club, festival…",
    notesPh: "Setlist, people, weather.",
    needDate: "Pick a date.",
    needArtist: "Add at least one artist.",
    needPlace: "Fill in venue and city.",
    searchingLogos: "Looking up logos…",
    noExtra: "No extra details",
  },
};

const dict: Record<string, Record<string, string>> = { ...baseDict, ...MORE_DICTS };

function readStored(): Locale {
  if (typeof window === "undefined") return "en";
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (LOCALES.some((item) => item.code === raw)) return raw as Locale;
  return "en";
}

type I18nValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const initial = readStored();
    currentLocale = initial;
    return initial;
  });
  const value = useMemo<I18nValue>(() => {
    const setLocale = (next: Locale) => {
      currentLocale = next;
      setLocaleState(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
        document.documentElement.lang = next;
        document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
      } catch {
        /* ignore */
      }
    };
    const t = (key: string, vars?: Record<string, string>) => {
      let text = dict[locale]?.[key] ?? dict.en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, v);
      }
      return text;
    };
    return { locale, setLocale, t };
  }, [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
