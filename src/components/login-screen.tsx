import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";

type Mode = "sign-in" | "sign-up";

export function LoginScreen() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
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

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-3xl font-medium tracking-tight text-foreground">Bis</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "sign-in" ? "Autentifică-te în contul tău" : "Creează-ți un cont"}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "sign-up" ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nume</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
            </div>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </div>
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
          <Button type="submit" disabled={submitting}>
            {mode === "sign-in" ? "Autentificare" : "Creează cont"}
          </Button>
        </form>
        <button
          type="button"
          onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          className="mt-4 w-full text-center text-sm text-muted-foreground underline"
        >
          {mode === "sign-in" ? "Nu ai cont? Creează unul" : "Ai deja cont? Autentifică-te"}
        </button>
      </div>
    </div>
  );
}
