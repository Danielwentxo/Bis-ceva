export const I18N_EXTRA: Record<string, Record<string, string>> = {
  en: {
    concertsPerYear: "Concerts per year",
    topCountries: "Top countries",
    bandsByCountry: "Bands by country",
  },
  fr: {
    concertsPerYear: "Concerts par année",
    topCountries: "Pays les plus vus",
    bandsByCountry: "Groupes par pays",
  },
  de: {
    concertsPerYear: "Konzerte pro Jahr",
    topCountries: "Top-Länder",
    bandsByCountry: "Bands nach Land",
  },
  es: {
    concertsPerYear: "Conciertos por año",
    topCountries: "Países top",
    bandsByCountry: "Bandas por país",
  },
};

export function extraLabel(locale: string, key: string) {
  return I18N_EXTRA[locale]?.[key] ?? I18N_EXTRA.en[key] ?? key;
}
