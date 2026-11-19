import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function InstallApp() {
  const { t } = useI18n();
  const [prompt, setPrompt] = useState<PromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as PromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!prompt || hidden) return null;
  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-border)]">
      <p className="text-sm">{t("installApp")}</p>
      <span className="flex shrink-0 gap-2">
        <Button type="button" onClick={() => { void prompt.prompt().then(() => setHidden(true)); }}>{t("install")}</Button>
        <Button type="button" variant="outline" onClick={() => setHidden(true)}>{t("close")}</Button>
      </span>
    </div>
  );
}
