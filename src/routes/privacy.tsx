import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { APP_NAME } from "@/lib/brand";

export const Route = createFileRoute("/privacy")({ component: PrivacyPage });

function PrivacyPage() {
  return (
    <AppShell>
      <article className="space-y-4">
        <p className="text-sm text-muted-foreground">Privacy</p>
        <h1 className="font-display text-4xl font-medium tracking-tight">{APP_NAME}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We store the email you use to sign in, the concerts you save, and optional images you upload (artist logos, festival posters, tickets).
          Images are checked by Sightengine for explicit content before they are kept.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We do not sell your data. Shared stats never include your email, notes, or ticket photos.
          You can clear your archive or permanently delete your account from the Stats page.
        </p>
      </article>
    </AppShell>
  );
}
