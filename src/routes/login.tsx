import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, authEnabled, GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getAuthProviderStatus } from "@/lib/auth/provider-status";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

type Mode = "sign-in" | "sign-up";

function LoginPage() {
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [providers, setProviders] = useState({ google: false, apple: false });

  useEffect(() => {
    getAuthProviderStatus()
      .then(setProviders)
      .catch(() => setProviders({ google: false, apple: false }));
  }, []);

  useEffect(() => {
    if (!isPending && user) void navigate({ to: "/" });
  }, [isPending, user, navigate]);

  if (!authEnabled) {
    return (
      <Centered>
        <p className="text-sm text-muted-foreground">
          Autentificarea nu este activată pentru această aplicație.
        </p>
      </Centered>
    );
  }

  async function handleEmailPassword(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "sign-up") {
        const { error } = await authClient.signUp.email({ name, email, password });
        if (error) throw new Error(error.message ?? "Înregistrarea a eșuat");
        toast.success("Cont creat! Ești autentificat.");
      } else {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) throw new Error(error.message ?? "Autentificarea a eșuat");
        toast.success("Bine ai revenit!");
      }
      await navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "A apărut o eroare");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSocial(provider: "google" | "apple") {
    try {
      const { error } = await authClient.signIn.social({ provider, callbackURL: "/" });
      if (error) throw new Error(error.message ?? "Autentificarea a eșuat");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "A apărut o eroare");
    }
  }

  return (
    <Centered>
      <div className="mb-8 text-center">
        <p className="font-display text-3xl font-medium tracking-tight text-foreground">Bis</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "sign-in" ? "Autentifică-te în contul tău" : "Creează-ți un cont"}
        </p>
      </div>

      <form onSubmit={handleEmailPassword} className="flex w-full flex-col gap-4">
        {mode === "sign-up" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nume</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Parolă</Label>
            {mode === "sign-in" && (
              <Link to="/forgot-password" className="text-xs text-muted-foreground underline">
                Ai uitat parola?
              </Link>
            )}
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            minLength={8}
            required
          />
        </div>
        <Button type="submit" disabled={submitting} className="mt-2">
          {mode === "sign-in" ? "Autentificare" : "Creează cont"}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
        className="mt-4 text-center text-sm text-muted-foreground underline"
      >
        {mode === "sign-in" ? "Nu ai cont? Creează unul" : "Ai deja cont? Autentifică-te"}
      </button>

      {(providers.google || providers.apple || GROK_PROVIDERS.length > 0) && (
        <div className="mt-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            sau
            <div className="h-px flex-1 bg-border" />
          </div>
          {providers.google && (
            <Button variant="outline" onClick={() => handleSocial("google")}>
              Continuă cu Google
            </Button>
          )}
          {providers.apple && (
            <Button variant="outline" onClick={() => handleSocial("apple")}>
              Continuă cu Apple
            </Button>
          )}
          {GROK_PROVIDERS.map((p) => (
            <Button key={p.providerId} variant="outline" onClick={() => signIn(p.providerId)}>
              Continuă cu {p.label}
            </Button>
          ))}
        </div>
      )}
    </Centered>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
