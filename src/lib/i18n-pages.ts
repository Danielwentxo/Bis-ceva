import { extraLabel } from "@/lib/i18n-extras";
import { FAQ, type Faq } from "@/lib/i18n-faq";

const COPY: Record<string, Record<string, string>> = {
  en: {
    aboutKicker: "About & FAQ",
    aboutLead: "A private concert diary. Log the shows you went to, keep the lineup, and see your stats. It is not a ticket shop and not a public setlist wiki.",
    faqTitle: "FAQ",
    privacyKicker: "Privacy",
    privacy1: "We store the email you use to sign in, the concerts you save, and optional images you upload (artist logos, festival posters). Images are checked before they are kept.",
    privacy2: "We do not sell your data. Shared stats never include your email, notes, or photos. You can clear your archive or permanently delete your account from the Stats page.",
    contactKicker: "Contact",
    contactLead: "For help with the archive or your account, email us. Check the FAQ on the About page first.",
    footerAbout: "About",
    footerPrivacy: "Privacy",
    footerContact: "Contact",
    footerTransfer: "Import / export",
    exportHint: "CSV for spreadsheets. JSON keeps lineups and notes.",
    importHint: "Accepted files: .csv and .json. Columns: date, artists, venue, city, country. Several artists: semicolon. Dates as YYYY-MM-DD.",
    chooseFile: "Choose file",
    noFile: "No file chosen",
    noConcertsFound: "No concerts found. Use date, artists, venue, city columns.",
    importing: "Importing {ok} / {total}\u2026",
    importDone: "Done. {ok} concerts are in your archive.",
    logosSoon: "Logos will fill in over the next minute.",
    importFail: "Could not import this file.",
    downloadCsv: "Download CSV",
    downloadJson: "Download JSON",
    signInLink: "Sign in",
    continueGoogle: "Continue with Google",
  },
};

export function pageLabel(locale: string, key: string, vars?: Record<string, string>) {
  const pack = COPY[locale] ?? COPY.en;
  let text = pack[key] ?? COPY.en[key] ?? extraLabel(locale, key, vars) ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, v);
  }
  return text;
}

export function pageFaq(locale: string): Faq[] {
  return FAQ[locale] ?? FAQ.en;
}
