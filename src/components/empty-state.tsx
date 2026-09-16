import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-card px-6 py-14 text-center shadow-[var(--shadow-border)]">
      <h2 className="font-display text-2xl font-medium">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {action}
      </div>
    </div>
  );
}

export function EmptyArchive({ onSeed }: { onSeed: () => void }) {
  return (
    <EmptyState
      title="Arhiva e goală"
      body="Adaugă primul concert. Căutăm automat logo-ul formației din TheAudioDB și Deezer."
      action={
        <>
          <Button asChild>
            <Link to="/add">Adaugă concert</Link>
          </Button>
          <Button variant="outline" type="button" onClick={onSeed}>
            Încarcă exemple
          </Button>
        </>
      }
    />
  );
}
