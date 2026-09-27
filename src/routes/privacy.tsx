import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { APP_NAME } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";
import { pageLabel } from "@/lib/i18n-pages";

export const Route = createFileRoute("/privacy")({ component: PrivacyPage });

function PrivacyPage() {
  const { locale } = useI18n();
  return (
    <AppShell>
      <article className="space-y-4">
        <p className="text-sm text-muted-foreground">{pageLabel(locale, "privacyKicker")}</p>
        <h1 className="font-display text-4xl font-medium tracking-tight">{APP_NAME}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">{pageLabel(locale, "privacy1")}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{pageLabel(locale, "privacy2")}</p>
      </article>
    </AppShell>
  );
}
