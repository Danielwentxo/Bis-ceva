import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";

type Mode = "sign-in" | "sign-up" | "forgot";

export function LoginScreen() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "forgot") {
        const { error } = await authClient.requestPasswordReset({
          email,
          redirectTo: "/reset-password",
        });
        if (error) throw new Error(error.message ?? "Cererea a eșuat");
        setResetSent(true);
        return;
      }
      if (mode === "sign-up") {
        const { error } = await authClient.signUp.email({ name, email, password });
        if (error) throw new Error(error.message ?? "Înregistrarea a eșuat");
        toast.success("Cont creat. Ești autentificat.");
      } else {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) throw new Error(error.message ?? "Autentificarea a eșuat");
        toast.success("Bine ai revenit!");
      }
      window.location.assign("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "A apărut o eroare");
    } finally {
      setSubmitting(false);
    }
  }

  async function signInWith(provider: "google" | "apple") {
    setSubmitting(true);
    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });
      if (error) throw new Error(error.message ?? "Autentificarea socială a eșuat");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "A apărut o eroare");
      setSubmitting(false);
    }
  }

  const title =
    mode === "sign-up" ? "Creează-ți un cont" : mode === "forgot" ? "Resetează-ți parola" : "Autentifică-te în contul tău";

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-3xl font-medium tracking-tight text-foreground">Bis</p>
          <p className="mt-1 text-sm text-muted-foreground">{title}</p>
        </div>

        {mode === "forgot" && resetSent ? (
          <div className="flex flex-col gap-4 text-center">
            <p className="text-sm text-foreground">
              Dacă există un cont cu adresa <strong>{email}</strong>, vei primi un email cu un link de resetare.
            </p>
            <button
              type="button"
              onClick={() => {
                setMode("sign-in");
                setResetSent(false);
              }}
              className="text-sm text-muted-foreground underline"
            >
              Înapoi la autentificare
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "sign-up" ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Nume</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
              </div>
            ) : null}
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
            {mode !== "forgot" ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Parolă</Label>
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
            ) : null}
            {mode === "sign-in" ? (
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setResetSent(false);
                }}
                className="self-end text-sm text-muted-foreground underline"
              >
                Am uitat parola
              </button>
            ) : null}
            <Button type="submit" disabled={submitting}>
              {mode === "sign-in" ? "Autentificare" : mode === "sign-up" ? "Creează cont" : "Trimite link de resetare"}
            </Button>
          </form>
        )}

        {mode !== "forgot" || !resetSent ? (
          <>
            {mode !== "forgot" ? (
              <>
                <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  Sau mai rapid cu
                  <span className="h-px flex-1 bg-border" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" variant="outline" disabled={submitting} onClick={() => void signInWith("google")}>
                    Google
                  </Button>
                  <Button type="button" variant="outline" disabled={submitting} onClick={() => void signInWith("apple")}>
                    Apple
                  </Button>
                </div>
              </>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "sign-in" ? "sign-up" : "sign-in");
                setResetSent(false);
              }}
              className="mt-4 w-full text-center text-sm text-muted-foreground underline"
            >
              {mode === "sign-in"
                ? "Nu ai cont? Creează unul"
                : mode === "sign-up"
                  ? "Ai deja cont? Autentifică-te"
                  : "Înapoi la autentificare"}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
