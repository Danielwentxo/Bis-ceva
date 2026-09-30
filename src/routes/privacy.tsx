import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { APP_NAME } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";
import { pageLabel } from "@/lib/i18n-pages";

export const Route = createFileRoute("/privacy")({ component: PrivacyPage });

const ARTIST_IMAGES: Record<string, string> = {
  en: "Artist images may come from TheAudioDB or from photos you upload. Band names and logos belong to their owners; we show them so you can recognise the act in your archive.",
  fr: "Les images d'artistes peuvent venir de TheAudioDB ou des photos que vous ajoutez. Les noms et logos restent \u00e0 leurs titulaires ; nous les affichons pour reconna\u00eetre le groupe dans votre archive.",
  de: "K\u00fcnstlerbilder k\u00f6nnen von TheAudioDB oder von hochgeladenen Fotos stammen. Namen und Logos bleiben bei den Rechteinhabern; wir zeigen sie, damit du die Band erkennst.",
  es: "Las im\u00e1genes de artistas pueden venir de TheAudioDB o de fotos que subes. Los nombres y logos pertenecen a sus due\u00f1os; las mostramos para reconocer al grupo en tu archivo.",
  pt: "As imagens dos artistas podem vir do TheAudioDB ou das fotos que carregas. Nomes e logos pertencem aos donos; mostramos para reconheceres a banda no arquivo.",
  it: "Le immagini degli artisti possono arrivare da TheAudioDB o dalle foto che carichi. Nomi e logo restano dei titolari; le mostriamo per riconoscere la band nel tuo archivio.",
  pl: "Zdj\u0119cia artyst\u00f3w mog\u0105 pochodzi\u0107 z TheAudioDB albo z Twoich upload\u00f3w. Nazwy i loga nale\u017c\u0105 do w\u0142a\u015bcicieli; pokazujemy je, by rozpozna\u0107 zesp\u00f3\u0142 w archiwum.",
};

function PrivacyPage() {
  const { locale } = useI18n();
  return (
    <AppShell>
      <article className="space-y-4">
        <p className="text-sm text-muted-foreground">{pageLabel(locale, "privacyKicker")}</p>
        <h1 className="font-display text-4xl font-medium tracking-tight">{APP_NAME}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">{pageLabel(locale, "privacy1")}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{pageLabel(locale, "privacy2")}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{ARTIST_IMAGES[locale] ?? ARTIST_IMAGES.en}</p>
      </article>
    </AppShell>
  );
}
