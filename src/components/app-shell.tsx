import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Disc3, MapPin, Plus, Ticket } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { AppLogo } from "@/components/app-logo";
import { LanguageSelect } from "@/components/language-select";
import { LoginScreen } from "@/components/login-screen";
import { SiteFooter } from "@/components/site-footer";
import { useEnrichArtists } from "@/components/use-enrich-artists";
import { signOut } from "@/lib/auth/client";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/i18n";
import { useArchive } from "@/lib/store";
import { cn } from "@/lib/utils";

function navActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

const PUBLIC_PATHS = new Set([
  "/forgot-password",
  "/reset-password",
  "/login",
  "/about",
  "/privacy",
  "/contact",
]);

function MobileSignOut() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        void signOut("/").catch(() => setBusy(false));
      }}
      className="max-w-[3.2rem] text-left text-[11px] leading-tight text-muted-foreground hover:text-foreground disabled:opacity-60"
    >
      {busy ? "…" : "Sign out"}
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isPending } = useCurrentUserState();
  useEnrichArtists();
  useEffect(() => {
    if (!user) return;
    void useArchive.getState().loadFromServer();
  }, [user?.id]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!useArchive.getState().hasHydrated) useArchive.getState().finishHydration();
    }, 1200);
    return () => window.clearTimeout(timer);
  }, []);

  const nav = [
    { to: "/", label: t("navConcerts"), icon: Ticket },
    { to: "/artists", label: t("navArtists"), icon: Disc3 },
    { to: "/venues", label: t("navVenues"), icon: MapPin },
    { to: "/stats", label: t("navStats"), icon: BarChart3 },
  ] as const;

  const isPublic = PUBLIC_PATHS.has(pathname);

  if (isPending) return null;
  if (!user && !isPublic) return <LoginScreen />;

  if (!user && isPublic) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <header className="flex items-center justify-between px-4 py-4">
          <Link to="/login">
            <AppLogo size="sm" />
          </Link>
          <Link to="/login" className="text-sm text-muted-foreground underline">
            Sign in
          </Link>
        </header>
        <main className="mx-auto w-full max-w-4xl px-4 pb-12 pt-4">{children}</main>
        <SiteFooter />
        <Toaster theme="dark" position="top-center" toastOptions={{ className: "bg-popover text-popover-foreground border-border" }} />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-border px-4 py-6 md:flex">
        <Link to="/" className="mb-8 px-2">
          <AppLogo size="md" />
          <p className="mt-1 text-xs text-muted-foreground">{t("archiveSubtitle")}</p>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = navActive(pathname, item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150",
                  active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          to="/add"
          className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          <Plus className="size-4" />
          {t("addConcert")}
        </Link>
        <div className="mt-4 space-y-3 border-t border-border/70 pt-4">
          <LanguageSelect />
          <UserButton />
        </div>
      </aside>

      <div className="md:pl-56">
        <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-border/70 bg-background/85 px-3 py-2.5 backdrop-blur-md md:hidden">
          <Link to="/" className="min-w-0 shrink">
            <AppLogo size="sm" />
          </Link>
          <div className="ml-auto flex items-center gap-1.5">
            <MobileSignOut />
            <LanguageSelect compact />
            <Link
              to="/add"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
              aria-label={t("addConcert")}
            >
              <Plus className="size-4" />
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-4xl px-4 pb-28 pt-6 md:pb-12 md:pt-10">
          {children}
          <SiteFooter />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <ul className="grid grid-cols-4">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = navActive(pathname, item.to);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex h-14 flex-col items-center justify-center gap-1 text-xs font-medium",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <Toaster theme="dark" position="top-center" toastOptions={{ className: "bg-popover text-popover-foreground border-border" }} />
    </div>
  );
}
