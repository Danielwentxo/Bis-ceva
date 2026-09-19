export const I18N_EXTRA: Record<string, Record<string, string>> = {
  en: {
    concertsPerYear: "Concerts per year",
    topCountries: "Top countries",
    bandsByCountry: "Bands by country",
    savedToArchive: "Concert saved to your archive",
    addManually: "Add \u201c{name}\u201d manually",
  },
  fr: {
    concertsPerYear: "Concerts par année",
    topCountries: "Pays les plus vus",
    bandsByCountry: "Groupes par pays",
    savedToArchive: "Concert enregistré dans votre archive",
    addManually: "Ajouter \u00ab {name} \u00bb manuellement",
  },
  de: {
    concertsPerYear: "Konzerte pro Jahr",
    topCountries: "Top-Länder",
    bandsByCountry: "Bands nach Land",
    savedToArchive: "Konzert in deinem Archiv gespeichert",
    addManually: "\u201e{name}\u201c manuell hinzufügen",
  },
  es: {
    concertsPerYear: "Conciertos por año",
    topCountries: "Países top",
    bandsByCountry: "Bandas por país",
    savedToArchive: "Concierto guardado en tu archivo",
    addManually: "Añadir \u201c{name}\u201d manualmente",
  },
};

export function extraLabel(locale: string, key: string, vars?: Record<string, string>) {
  let text = I18N_EXTRA[locale]?.[key] ?? I18N_EXTRA.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, v);
  }
  return text;
}
