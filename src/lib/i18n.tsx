import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export const LOCALES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

const STORAGE_KEY = "bis-locale";

const dict = {
  en: {
    archiveSubtitle: "Your concert archive",
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
  },
  fr: {
    archiveSubtitle: "Votre archive de concerts",
    navConcerts: "Concerts",
    navArtists: "Artistes",
    navVenues: "Lieux",
    navStats: "Stats",
    addConcert: "Ajouter un concert",
    signInTitle: "Connectez-vous à votre compte",
    signUpTitle: "Créer un compte",
    forgotTitle: "Réinitialiser le mot de passe",
    name: "Nom",
    email: "E-mail",
    password: "Mot de passe",
    signIn: "Connexion",
    createAccount: "Créer le compte",
    sendReset: "Envoyer le lien",
    forgotPassword: "Mot de passe oublié",
    noAccount: "Pas de compte ? Créez-en un",
    hasAccount: "Déjà un compte ? Connexion",
    backToSignIn: "Retour à la connexion",
    orFaster: "Ou continuer avec",
    resetSent: "Si un compte existe pour {email}, vous recevrez un lien.",
    country: "Pays",
    city: "Ville",
    venue: "Lieu",
    date: "Date",
    artists: "Artistes",
    notes: "Notes",
    rating: "Note",
    festival: "C'était un festival",
    favorite: "Marquer comme favori",
    save: "Enregistrer",
    cancel: "Annuler",
    addToArchive: "Ajouter à l'archive",
    chooseCountry: "Choisissez un pays.",
    language: "Langue",
    signOut: "Déconnexion",
    signingOut: "Déconnexion…",
  },
  de: {
    archiveSubtitle: "Dein Konzertarchiv",
    navConcerts: "Konzerte",
    navArtists: "Künstler",
    navVenues: "Locations",
    navStats: "Statistik",
    addConcert: "Konzert hinzufügen",
    signInTitle: "Melde dich in deinem Konto an",
    signUpTitle: "Konto erstellen",
    forgotTitle: "Passwort zurücksetzen",
    name: "Name",
    email: "E-Mail",
    password: "Passwort",
    signIn: "Anmelden",
    createAccount: "Konto erstellen",
    sendReset: "Link senden",
    forgotPassword: "Passwort vergessen",
    noAccount: "Kein Konto? Jetzt erstellen",
    hasAccount: "Schon ein Konto? Anmelden",
    backToSignIn: "Zurück zur Anmeldung",
    orFaster: "Oder weiter mit",
    resetSent: "Falls ein Konto für {email} existiert, erhältst du einen Link.",
    country: "Land",
    city: "Stadt",
    venue: "Location",
    date: "Datum",
    artists: "Künstler",
    notes: "Notizen",
    rating: "Bewertung",
    festival: "Das war ein Festival",
    favorite: "Als Favorit markieren",
    save: "Speichern",
    cancel: "Abbrechen",
    addToArchive: "Zum Archiv hinzufügen",
    chooseCountry: "Bitte ein Land wählen.",
    language: "Sprache",
    signOut: "Abmelden",
    signingOut: "Abmelden…",
  },
  es: {
    archiveSubtitle: "Tu archivo de conciertos",
    navConcerts: "Conciertos",
    navArtists: "Artistas",
    navVenues: "Recintos",
    navStats: "Estadísticas",
    addConcert: "Añadir concierto",
    signInTitle: "Inicia sesión en tu cuenta",
    signUpTitle: "Crea una cuenta",
    forgotTitle: "Restablece tu contraseña",
    name: "Nombre",
    email: "Correo",
    password: "Contraseña",
    signIn: "Iniciar sesión",
    createAccount: "Crear cuenta",
    sendReset: "Enviar enlace",
    forgotPassword: "Olvidé la contraseña",
    noAccount: "¿No tienes cuenta? Crea una",
    hasAccount: "¿Ya tienes cuenta? Inicia sesión",
    backToSignIn: "Volver al inicio de sesión",
    orFaster: "O continúa con",
    resetSent: "Si existe una cuenta para {email}, recibirás un enlace.",
    country: "País",
    city: "Ciudad",
    venue: "Recinto",
    date: "Fecha",
    artists: "Artistas",
    notes: "Notas",
    rating: "Valoración",
    festival: "Fue un festival",
    favorite: "Marcar como favorito",
    save: "Guardar",
    cancel: "Cancelar",
    addToArchive: "Añadir al archivo",
    chooseCountry: "Elige un país.",
    language: "Idioma",
    signOut: "Cerrar sesión",
    signingOut: "Cerrando sesión…",
  },
} as const;

type Key = keyof typeof dict.en;

function readStored(): Locale {
  if (typeof window === "undefined") return "en";
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === "fr" || raw === "de" || raw === "es" || raw === "en") return raw;
  return "en";
}

type I18nValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: Key, vars?: Record<string, string>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readStored);
  const value = useMemo<I18nValue>(() => {
    const setLocale = (next: Locale) => {
      setLocaleState(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
        document.documentElement.lang = next;
      } catch {
        /* ignore */
      }
    };
    const t = (key: Key, vars?: Record<string, string>) => {
      let text: string = dict[locale][key] ?? dict.en[key] ?? key;
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

export function LanguageSelect({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <label className={className ?? "block"}>
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="h-10 w-full rounded-lg bg-secondary px-3 text-sm text-foreground shadow-[var(--shadow-border)] outline-none"
      >
        {LOCALES.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
