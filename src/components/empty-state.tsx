import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { authEnabled } from "@/lib/auth/enabled";
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
    <EmptyState
      title={extraLabel(locale, "onboardTitle")}
      body={extraLabel(locale, "onboardBody")}
      action={
        <>
          <Button asChild>
            <Link to="/add">{t("addConcert")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/transfer">{extraLabel(locale, "importTitle")}</Link>
          </Button>
          {authEnabled ? null : (
            <Button variant="outline" type="button" onClick={onSeed}>
              {t("loadExamples")}
            </Button>
          )}
        </>
      }
    />
  );
}
