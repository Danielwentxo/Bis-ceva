import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { pageLabel } from "@/lib/i18n-pages";

const COPY: Record<string, { title: string; lead: string; a: string; b: string; c: string; free: string }> = {
  en: {
    title: "Start your gig book",
    lead: "Keep every concert and festival in one private list.",
    a: "Add a concert or a multi-day festival",
    b: "Import a list you already have",
    c: "See stats and share a card",
    free: "Free. Email or Google. No App Store required.",
  },
  fr: {
    title: "Commencez votre carnet",
    lead: "Gardez chaque concert et festival dans une liste priv\u00e9e.",
    a: "Ajoutez un concert ou un festival",
    b: "Importez une liste que vous avez déjà",
    c: "Voyez les stats et partagez une carte",
    free: "Gratuit. E-mail ou Google.",
  },
  de: {
    title: "Starte dein Gig-Buch",
    lead: "Alle Konzerte und Festivals in einer privaten Liste.",
    a: "Konzert oder Festival eintragen",
    b: "Eine vorhandene Liste importieren",
    c: "Stats sehen und eine Karte teilen",
    free: "Kostenlos. E-Mail oder Google.",
  },
  es: {
    title: "Empieza tu cuaderno",
    lead: "Todos los conciertos y festivales en una lista privada.",
    a: "Añade un concierto o un festival",
    b: "Importa una lista que ya tengas",
    c: "Mira las stats y comparte una tarjeta",
    free: "Gratis. Email o Google.",
  },
  pt: {
    title: "Começa o teu caderno",
    lead: "Todos os concertos e festivais numa lista privada.",
    a: "Adiciona um concerto ou festival",
    b: "Importa uma lista que já tenhas",
    c: "Vê as stats e partilha um cartão",
    free: "Grátis. Email ou Google.",
  },
  it: {
    title: "Inizia il tuo quaderno",
    lead: "Tutti i concerti e i festival in una lista privata.",
    a: "Aggiungi un concerto o un festival",
    b: "Importa una lista che hai già",
    c: "Vedi le stats e condividi una card",
    free: "Gratis. Email o Google.",
  },
  pl: {
    title: "Zacznij swój notes",
    lead: "Wszystkie koncerty i festiwale na jednej prywatnej liście.",
    a: "Dodaj koncert lub festiwal",
    b: "Importuj listę, którą już masz",
    c: "Zobacz statystyki i udostępnij kartę",
    free: "Za darmo. Email albo Google.",
  },
  ja: {
    title: "ライブ帳を始める",
    lead: "ライブとフェスを一つの非公開リストに。",
    a: "ライブまたはフェスを追加",
    b: "持っているリストを読み込む",
    c: "統計を見てカードを共有",
    free: "無料。メールかGoogle。",
  },
  ar: {
    title: "ابدأ دفتر الحفلات",
    lead: "كل الحفلات والمهرجانات في قائمة خاصة.",
    a: "أضف حفلة أو مهرجانًا",
    b: "استورد قائمة عندك",
    c: "شاهد الإحصاءات وشارك بطاقة",
    free: "مجاني. بريد أو Google.",
  },
};

const HERO = "/hero.jpg";

export function LandingHome() {
  const { locale } = useI18n();
  const copy = COPY[locale] ?? COPY.en;
  return (
    <div className="relative -mx-4 -mt-4 overflow-hidden rounded-b-3xl">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/75 to-background" aria-hidden />
      <div className="relative mx-auto max-w-lg px-4 py-16 text-center md:py-24">
        <h1 className="font-display text-4xl font-medium tracking-tight text-white md:text-5xl">{copy.title}</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/80">{copy.lead}</p>
        <ul className="mx-auto mt-8 max-w-sm space-y-3 text-left text-sm">
          <li className="rounded-xl bg-black/45 px-4 py-3 text-white/90 shadow-[var(--shadow-border)] backdrop-blur-sm">{copy.a}</li>
          <li className="rounded-xl bg-black/45 px-4 py-3 text-white/90 shadow-[var(--shadow-border)] backdrop-blur-sm">{copy.b}</li>
          <li className="rounded-xl bg-black/45 px-4 py-3 text-white/90 shadow-[var(--shadow-border)] backdrop-blur-sm">{copy.c}</li>
        </ul>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Button asChild className="min-w-48">
            <Link to="/login">{pageLabel(locale, "signInLink")}</Link>
          </Button>
          <p className="text-xs text-white/60">{copy.free}</p>
        </div>
      </div>
    </div>
  );
}
