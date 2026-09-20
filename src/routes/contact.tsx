import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { APP_NAME } from "@/lib/brand";

export const Route = createFileRoute("/contact")({ component: ContactPage });

function ContactPage() {
  return (
    <AppShell>
      <article className="space-y-4">
        <p className="text-sm text-muted-foreground">Contact</p>
        <h1 className="font-display text-4xl font-medium tracking-tight">{APP_NAME}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          For help with the archive or your account, email us. Check the FAQ on the About page first — most questions are answered there.
        </p>
        <a className="inline-flex text-sm font-medium text-primary underline" href="mailto:hello@gighistory.app">
          hello@gighistory.app
        </a>
      </article>
    </AppShell>
  );
}
