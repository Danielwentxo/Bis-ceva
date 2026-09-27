import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { APP_NAME } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";
import { pageLabel } from "@/lib/i18n-pages";

export const Route = createFileRoute("/contact")({ component: ContactPage });

function ContactPage() {
  const { locale } = useI18n();
  return (
    <AppShell>
      <article className="space-y-4">
        <p className="text-sm text-muted-foreground">{pageLabel(locale, "contactKicker")}</p>
        <h1 className="font-display text-4xl font-medium tracking-tight">{APP_NAME}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">{pageLabel(locale, "contactLead")}</p>
        <a className="inline-flex text-sm font-medium text-primary underline" href="mailto:hello@gighistory.app">
          hello@gighistory.app
        </a>
      </article>
    </AppShell>
  );
}
