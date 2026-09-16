export type Country = { code: string; name: string };

export const COUNTRIES: Country[] = [
  { code: "RO", name: "România" },
  { code: "HU", name: "Ungaria" },
  { code: "BG", name: "Bulgaria" },
  { code: "MD", name: "Republica Moldova" },
  { code: "RS", name: "Serbia" },
  { code: "UA", name: "Ucraina" },
  { code: "AT", name: "Austria" },
  { code: "DE", name: "Germania" },
  { code: "PL", name: "Polonia" },
  { code: "CZ", name: "Cehia" },
  { code: "SK", name: "Slovacia" },
  { code: "IT", name: "Italia" },
  { code: "FR", name: "Franța" },
  { code: "ES", name: "Spania" },
  { code: "PT", name: "Portugalia" },
  { code: "GB", name: "Regatul Unit" },
  { code: "IE", name: "Irlanda" },
  { code: "NL", name: "Țările de Jos" },
  { code: "BE", name: "Belgia" },
  { code: "CH", name: "Elveția" },
  { code: "GR", name: "Grecia" },
  { code: "TR", name: "Turcia" },
  { code: "US", name: "Statele Unite" },
  { code: "CA", name: "Canada" },
  { code: "MX", name: "Mexic" },
  { code: "BR", name: "Brazilia" },
  { code: "AR", name: "Argentina" },
  { code: "JP", name: "Japonia" },
  { code: "KR", name: "Coreea de Sud" },
  { code: "AU", name: "Australia" },
  { code: "SE", name: "Suedia" },
  { code: "NO", name: "Norvegia" },
  { code: "DK", name: "Danemarca" },
  { code: "FI", name: "Finlanda" },
  { code: "HR", name: "Croația" },
  { code: "SI", name: "Slovenia" },
  { code: "BA", name: "Bosnia și Herțegovina" },
  { code: "AL", name: "Albania" },
  { code: "MK", name: "Macedonia de Nord" },
  { code: "ME", name: "Muntenegru" },
  { code: "EE", name: "Estonia" },
  { code: "LV", name: "Letonia" },
  { code: "LT", name: "Lituania" },
  { code: "IS", name: "Islanda" },
  { code: "LU", name: "Luxemburg" },
  { code: "MT", name: "Malta" },
  { code: "CY", name: "Cipru" },
];

const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));
const BY_NAME = new Map(COUNTRIES.map((c) => [c.name.toLowerCase(), c]));

export function countryByCode(code: string) {
  return BY_CODE.get(code.toUpperCase());
}

export function countryByName(name: string) {
  return BY_NAME.get(name.trim().toLowerCase());
}

export function flagUrl(code: string, width = 40) {
  return `https://flagcdn.com/w${width}/${code.toLowerCase()}.png`;
}
