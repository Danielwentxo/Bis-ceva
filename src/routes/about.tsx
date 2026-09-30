import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { APP_NAME } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";
import { pageFaq, pageLabel } from "@/lib/i18n-pages";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About My Gig History \u2014 concert archive and gig diary" },
      {
        name: "description",
        content:
          "My Gig History is a private concert archive and gig diary for the live shows and festivals you attended. Import a list, keep lineups, see stats. Not a ticket shop.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { locale } = useI18n();
  return (
    <AppShell>
      <article className="prose-invert space-y-8">
        <header>
          <p className="text-sm text-muted-foreground">{pageLabel(locale, "aboutKicker")}</p>
          <h1 className="mt-1 font-display text-4xl font-medium tracking-tight">{APP_NAME}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{pageLabel(locale, "aboutLead")}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Use it as a concert archive, gig diary or festival log. Keep the lineup, import a CSV or JSON list, and look at your stats. It is not a ticket shop and not a public setlist wiki.
          </p>
        </header>
        <section className="space-y-3">
          <h2 className="font-display text-2xl font-medium">{pageLabel(locale, "faqTitle")}</h2>
          {pageFaq(locale).map((item) => (
            <Faq key={item.q} q={item.q} a={item.a} />
          ))}
        </section>
      </article>
    </AppShell>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-border)]">
      <p className="text-sm font-medium">{q}</p>
      <p className="mt-1 text-sm text-muted-foreground">{a}</p>
    </div>
  );
}
