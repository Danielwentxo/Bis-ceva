import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { extraLabel } from "@/lib/i18n-extras";
import { useI18n } from "@/lib/i18n";

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
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{action}</div>
    </div>
  );
}

export function EmptyArchive({ onSeed }: { onSeed: () => void }) {
  const { t, locale } = useI18n();
  return (
    <div className="space-y-6">
      <EmptyState
        title={t("emptyTitle")}
        body={extraLabel(locale, "onboardBody")}
        action={
          <>
            <Button asChild>
              <Link to="/add">{extraLabel(locale, "onboardAdd")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/transfer">{extraLabel(locale, "importTitle")}</Link>
            </Button>
            <Button variant="outline" type="button" onClick={onSeed}>
              {t("loadExamples")}
            </Button>
          </>
        }
      />
      <ol className="grid gap-3 sm:grid-cols-3">
        <li className="rounded-xl bg-card px-4 py-3 text-sm shadow-[var(--shadow-border)]">
          <p className="text-xs uppercase tracking-wider text-subtle">1</p>
          <p className="mt-1 font-medium">{extraLabel(locale, "onboardAdd")}</p>
        </li>
        <li className="rounded-xl bg-card px-4 py-3 text-sm shadow-[var(--shadow-border)]">
          <p className="text-xs uppercase tracking-wider text-subtle">2</p>
          <p className="mt-1 font-medium">{extraLabel(locale, "onboardImport")}</p>
        </li>
        <li className="rounded-xl bg-card px-4 py-3 text-sm shadow-[var(--shadow-border)]">
          <p className="text-xs uppercase tracking-wider text-subtle">3</p>
          <p className="mt-1 font-medium">{extraLabel(locale, "onboardShare")}</p>
        </li>
      </ol>
    </div>
  );
}
