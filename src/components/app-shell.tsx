import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Disc3, MapPin, Plus, Ticket } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";
import { LoginScreen } from "@/components/login-screen";
import { useEnrichArtists } from "@/components/use-enrich-artists";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useArchive } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Concerte", icon: Ticket },
  { to: "/artists", label: "Formații", icon: Disc3 },
  { to: "/venues", label: "Locuri", icon: MapPin },
  { to: "/stats", label: "Statistici", icon: BarChart3 },
] as const;

function navActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isPending } = useCurrentUserState();
  useEnrichArtists();
  useEffect(() => {
    if (!user) return;
    void useArchive.getState().loadFromServer();
  }, [user?.id]);
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!useArchive.getState().hasHydrated) {
        useArchive.getState().finishHydration();
      }
    }, 1200);
    return () => window.clearTimeout(t);
  }, []);

  const isAuthFlow = pathname === "/forgot-password" || pathname === "/reset-password" || pathname === "/login";

  if (isPending) return null;
  if (!user && !isAuthFlow) return <LoginScreen />;

  if (!user && isAuthFlow) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        {children}
        <Toaster theme="dark" position="top-center" toastOptions={{ className: "bg-popover text-popover-foreground border-border" }} />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-border px-4 py-6 md:flex">
        <Link to="/" className="mb-8 px-2">
          <p className="font-display text-3xl font-medium tracking-tight text-foreground">Bis</p>
          <p className="mt-1 text-xs text-muted-foreground">Arhiva ta de concerte</p>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = navActive(pathname, item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
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
          className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-transform duration-150 active:scale-[0.96]"
        >
          <Plus className="size-4" />
          Adaugă concert
        </Link>
        <div className="mt-4 border-t border-border/70 pt-4">
          <UserButton />
        </div>
      </aside>

      <div className="md:pl-56">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur-md md:hidden">
          <Link to="/" className="font-display text-2xl font-medium tracking-tight">
            Bis
          </Link>
          <Link
            to="/add"
            className="inline-flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"
            aria-label="Adaugă concert"
          >
            <Plus className="size-5" />
          </Link>
        </header>

        <main className="mx-auto w-full max-w-4xl px-4 pb-28 pt-6 md:pb-12 md:pt-10">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <ul className="grid grid-cols-4">
          {NAV.map((item) => {
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
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          className: "bg-popover text-popover-foreground border-border",
        }}
      />
    </div>
  );
}
