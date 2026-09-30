import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { extraLabel } from "@/lib/i18n-extras";
import { useI18n } from "@/lib/i18n";
import { pageLabel } from "@/lib/i18n-pages";

const COPY: Record<string, { title: string; lead: string; a: string; b: string; c: string; free: string }>= {
  en: {
    title: "Start your gig book",
    lead: "Keep every concert and festival in one private archive. The list is yours.",
    a: "Add a concert or a multi-day festival",
    b: "Import a CSV or JSON list you already have",
    c: "See stats and share a card",
    free: "Free. Email or Google. No App Store required.",
  },
  fr: {
    title: "Commencez votre carnet",
    lead: "Gardez chaque concert et festival dans une archive priv\u00e9e.",
    a: "Ajoutez un concert ou un festival",
    b: "Importez un fichier CSV ou JSON",
    c: "Voyez les stats et partagez une carte",
    free: "Gratuit. E-mail ou Google.",
  },
  de: {
    title: "Starte dein Gig-Buch",
    lead: "Alle Konzerte und Festivals in einem privaten Archiv.",
    a: "Konzert oder Festival eintragen",
    b: "CSV- oder JSON-Liste importieren",
    c: "Stats sehen und eine Karte teilen",
    free: "Kostenlos. E-Mail oder Google.",
  },
};

export function LandingHome() {
  const { locale } = useI18n();
  const copy = COPY[locale] ?? COPY.en;
  return (
    <div className="mx-auto max-w-lg py-8 text-center">
      <h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">{copy.title}</h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{copy.lead}</p>
      <ul className="mx-auto mt-8 max-w-sm space-y-3 text-left text-sm">
        <li className="rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-border)]">{copy.a}</li>
        <li className="rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-border)]">{copy.b}</li>
        <li className="rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-border)]">{copy.c}</li>
      </ul>
      <div className="mt-8 flex flex-col items-center gap-3">
        <Button asChild className="min-w-48">
          <Link to="/login">{pageLabel(locale, "signInLink")}</Link>
        </Button>
        <p className="text-xs text-muted-foreground">{copy.free}</p>
      </div>
    </div>
  );
}
