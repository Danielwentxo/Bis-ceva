export const I18N_EXTRA: Record<string, Record<string, string>> = {
  en: {
    concertsPerYear: "Concerts per year",
    topCountries: "Countries visited",
    bandsByCountry: "Bands by country",
    topVenues: "Top venues visited",
    topGenres: "Top genres",
    shareStats: "Share stats",
    statsCopied: "Stats copied",
    savedToArchive: "Concert saved to your archive",
    addManually: "Add \u201c{name}\u201d manually",
  },
  fr: {
    concertsPerYear: "Concerts par ann\u00e9e",
    topCountries: "Pays visit\u00e9s",
    bandsByCountry: "Groupes par pays",
    topVenues: "Lieux les plus visit\u00e9s",
    topGenres: "Genres les plus \u00e9cout\u00e9s",
    shareStats: "Partager les stats",
    statsCopied: "Stats copi\u00e9es",
    savedToArchive: "Concert enregistr\u00e9 dans votre archive",
    addManually: "Ajouter \u00ab {name} \u00bb manuellement",
  },
  de: {
    concertsPerYear: "Konzerte pro Jahr",
    topCountries: "Besuchte L\u00e4nder",
    bandsByCountry: "Bands nach Land",
    topVenues: "Meistbesuchte Locations",
    topGenres: "Top-Genres",
    shareStats: "Stats teilen",
    statsCopied: "Stats kopiert",
    savedToArchive: "Konzert in deinem Archiv gespeichert",
    addManually: "\u201e{name}\u201c manuell hinzuf\u00fcgen",
  },
  es: {
    concertsPerYear: "Conciertos por a\u00f1o",
    topCountries: "Pa\u00edses visitados",
    bandsByCountry: "Bandas por pa\u00eds",
    topVenues: "Recintos m\u00e1s visitados",
    topGenres: "G\u00e9neros top",
    shareStats: "Compartir stats",
    statsCopied: "Stats copiadas",
    savedToArchive: "Concierto guardado en tu archivo",
    addManually: "A\u00f1adir \u201c{name}\u201d manualmente",
  },
};

export function extraLabel(locale: string, key: string, vars?: Record<string, string>) {
  let text = I18N_EXTRA[locale]?.[key] ?? I18N_EXTRA.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, v);
  }
  return text;
}
