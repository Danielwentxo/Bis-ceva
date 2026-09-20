import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { APP_NAME } from "@/lib/brand";

export const Route = createFileRoute("/about")({ component: AboutPage });

function AboutPage() {
  return (
    <AppShell>
      <article className="prose-invert space-y-8">
        <header>
          <p className="text-sm text-muted-foreground">About</p>
          <h1 className="mt-1 font-display text-4xl font-medium tracking-tight">{APP_NAME}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A private concert diary. Log the shows you went to, keep the lineup, and see your stats.
            It is not a ticket shop and not a public setlist wiki.
          </p>
        </header>
        <section className="space-y-3">
          <h2 className="font-display text-2xl font-medium">FAQ</h2>
          <Faq q="Is it free?" a="Yes. Email and Google sign-in are free. Your archive is included." />
          <Faq q="Where is my archive stored?" a="In your account, in our database. Log in from another phone and the same concerts are there." />
          <Faq q="Where do artist logos come from?" a="TheAudioDB first. If there is no logo, Deezer is used as a fallback. You can also add a band and a logo yourself." />
          <Faq q="What does Share send?" a="Only aggregated stats: counts, top artists, countries, venues, genres. Not your email, notes, or tickets." />
          <Faq q="Can I delete everything?" a="Yes. Stats has a clear-archive action. That removes your concerts and artists from the account." />
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
