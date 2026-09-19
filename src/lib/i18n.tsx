import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export const LOCALES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

const STORAGE_KEY = "bis-locale";

let currentLocale: Locale = "en";
export function getLocale() {
  return currentLocale;
}

const dict: Record<Locale, Record<string, string>> = {
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
    liveArchive: "Live archive",
    yourConcerts: "Your concerts",
    searchShows: "Search artist, venue, city",
    allYears: "All years",
    upcoming: "Upcoming",
    noMatches: "Nothing matches this filter.",
    emptyTitle: "Your archive is empty",
    emptyBody: "Add your first concert. Artist logos come from TheAudioDB and Deezer.",
    loadExamples: "Load examples",
    artistsLead: "Artist logos",
    searchArtist: "Search an artist",
    venuesLead: "Halls, clubs, arenas",
    venuesTitle: "Venues",
    statsLead: "Scene recap",
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
    artistsHint: "The first artist is the headliner. Logos come from TheAudioDB and Deezer.",
    searchArtistsPh: "Search Metallica, Phoenix…",
    venuePh: "Arena, club, festival…",
    notesPh: "Setlist, people, weather, what stayed with you.",
    needDate: "Pick a date.",
    needArtist: "Add at least one artist.",
    needPlace: "Fill in venue and city.",
    searchingLogos: "Looking up logos…",
    noExtra: "No extra details",
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
    liveArchive: "Archive live",
    yourConcerts: "Vos concerts",
    searchShows: "Rechercher artiste, lieu, ville",
    allYears: "Toutes les années",
    upcoming: "À venir",
    noMatches: "Aucun résultat pour ce filtre.",
    emptyTitle: "L'archive est vide",
    emptyBody: "Ajoutez votre premier concert. Les logos viennent de TheAudioDB et Deezer.",
    loadExamples: "Charger des exemples",
    artistsLead: "Logos des artistes",
    searchArtist: "Rechercher un artiste",
    venuesLead: "Salles, clubs, arènes",
    venuesTitle: "Lieux",
    statsLead: "Bilan",
    statsTitle: "Statistiques",
    tileConcerts: "Concerts",
    tileArtists: "Artistes",
    tileVenues: "Lieux",
    tileCountries: "Pays",
    mostSeen: "Artiste le plus vu",
    firstShow: "Premier concert",
    lastShow: "Dernier concert",
    festivals: "Festivals",
    favorites: "Favoris",
    clearArchive: "Vider l'archive",
    clearArchiveConfirm: "Supprimer tous les concerts de ce compte ?",
    edit: "Modifier",
    newEntry: "Nouvelle entrée",
    editConcert: "Modifier le concert",
    headliner: "Tête d'affiche",
    support: "Invité",
    lineup: "Affiche",
    viewArtist: "Voir l'artiste",
    concertMissing: "Ce concert n'est plus dans l'archive.",
    backToConcerts: "Retour aux concerts",
    artistMissing: "Cet artiste n'est pas dans l'archive.",
    back: "Retour",
    seenLive: "Vu en live",
    with: "avec",
    favoriteBadge: "Favori",
    festivalBadge: "Festival",
    deleteConcertConfirm: "Retirer ce concert de l'archive ?",
    artistsHint: "Le premier artiste est la tête d'affiche.",
    searchArtistsPh: "Rechercher Metallica, Phoenix…",
    venuePh: "Salle, club, festival…",
    notesPh: "Setlist, amis, météo, souvenirs.",
    needDate: "Choisissez une date.",
    needArtist: "Ajoutez au moins un artiste.",
    needPlace: "Indiquez le lieu et la ville.",
    searchingLogos: "Recherche des logos…",
    noExtra: "Pas de détails",
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
    liveArchive: "Live-Archiv",
    yourConcerts: "Deine Konzerte",
    searchShows: "Künstler, Location, Stadt suchen",
    allYears: "Alle Jahre",
    upcoming: "Demnächst",
    noMatches: "Nichts passt zu diesem Filter.",
    emptyTitle: "Das Archiv ist leer",
    emptyBody: "Füge dein erstes Konzert hinzu.",
    loadExamples: "Beispiele laden",
    artistsLead: "Künstlerlogos",
    searchArtist: "Künstler suchen",
    venuesLead: "Halls, Clubs, Arenen",
    venuesTitle: "Locations",
    statsLead: "Überblick",
    statsTitle: "Statistik",
    tileConcerts: "Konzerte",
    tileArtists: "Künstler",
    tileVenues: "Locations",
    tileCountries: "Länder",
    mostSeen: "Meistgesehener Künstler",
    firstShow: "Erstes Konzert",
    lastShow: "Letztes Konzert",
    festivals: "Festivals",
    favorites: "Favoriten",
    clearArchive: "Archiv leeren",
    clearArchiveConfirm: "Alle Konzerte in diesem Konto löschen?",
    edit: "Bearbeiten",
    newEntry: "Neuer Eintrag",
    editConcert: "Konzert bearbeiten",
    headliner: "Headliner",
    support: "Support",
    lineup: "Line-up",
    viewArtist: "Künstler ansehen",
    concertMissing: "Dieses Konzert ist nicht mehr im Archiv.",
    backToConcerts: "Zurück zu den Konzerten",
    artistMissing: "Dieser Künstler ist nicht im Archiv.",
    back: "Zurück",
    seenLive: "Live gesehen",
    with: "mit",
    favoriteBadge: "Favorit",
    festivalBadge: "Festival",
    deleteConcertConfirm: "Dieses Konzert aus dem Archiv entfernen?",
    artistsHint: "Der erste Künstler ist der Headliner.",
    searchArtistsPh: "Metallica, Phoenix suchen…",
    venuePh: "Arena, Club, Festival…",
    notesPh: "Setlist, Leute, Wetter.",
    needDate: "Wähle ein Datum.",
    needArtist: "Füge mindestens einen Künstler hinzu.",
    needPlace: "Location und Stadt ausfüllen.",
    searchingLogos: "Logos werden gesucht…",
    noExtra: "Keine Extra-Infos",
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
    liveArchive: "Archivo en vivo",
    yourConcerts: "Tus conciertos",
    searchShows: "Buscar artista, recinto, ciudad",
    allYears: "Todos los años",
    upcoming: "Próximos",
    noMatches: "Nada coincide con este filtro.",
    emptyTitle: "El archivo está vacío",
    emptyBody: "Añade tu primer concierto.",
    loadExamples: "Cargar ejemplos",
    artistsLead: "Logos de artistas",
    searchArtist: "Buscar un artista",
    venuesLead: "Salas, clubes, estadios",
    venuesTitle: "Recintos",
    statsLead: "Resumen",
    statsTitle: "Estadísticas",
    tileConcerts: "Conciertos",
    tileArtists: "Artistas",
    tileVenues: "Recintos",
    tileCountries: "Países",
    mostSeen: "Artista más visto",
    firstShow: "Primer concierto",
    lastShow: "Último concierto",
    festivals: "Festivales",
    favorites: "Favoritos",
    clearArchive: "Vaciar archivo",
    clearArchiveConfirm: "¿Borrar todos los conciertos de esta cuenta?",
    edit: "Editar",
    newEntry: "Nueva entrada",
    editConcert: "Editar concierto",
    headliner: "Cabeza de cartel",
    support: "Invitado",
    lineup: "Cartel",
    viewArtist: "Ver artista",
    concertMissing: "Este concierto ya no está en el archivo.",
    backToConcerts: "Volver a conciertos",
    artistMissing: "Este artista no está en el archivo.",
    back: "Volver",
    seenLive: "Visto en directo",
    with: "con",
    favoriteBadge: "Favorito",
    festivalBadge: "Festival",
    deleteConcertConfirm: "¿Quitar este concierto del archivo?",
    artistsHint: "El primer artista es el cabeza de cartel.",
    searchArtistsPh: "Busca Metallica, Phoenix…",
    venuePh: "Arena, club, festival…",
    notesPh: "Setlist, gente, clima.",
    needDate: "Elige una fecha.",
    needArtist: "Añade al menos un artista.",
    needPlace: "Completa recinto y ciudad.",
    searchingLogos: "Buscando logos…",
    noExtra: "Sin detalles extra",
  },
};

function readStored(): Locale {
  if (typeof window === "undefined") return "en";
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === "fr" || raw === "de" || raw === "es" || raw === "en") return raw;
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
      } catch {
        /* ignore */
      }
    };
    const t = (key: string, vars?: Record<string, string>) => {
      let text = dict[locale][key] ?? dict.en[key] ?? key;
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
