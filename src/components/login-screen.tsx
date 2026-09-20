import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppLogo } from "@/components/app-logo";
import { LanguageSelect } from "@/components/language-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { useI18n } from "@/lib/i18n";

type Mode = "sign-in" | "sign-up" | "forgot";

export function LoginScreen() {
  const { t } = useI18n();
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
        if (error) throw new Error(error.message ?? "Request failed");
        setResetSent(true);
        return;
      }
      if (mode === "sign-up") {
        const { error } = await authClient.signUp.email({ name, email, password });
        if (error) throw new Error(error.message ?? "Sign up failed");
      } else {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) throw new Error(error.message ?? "Sign in failed");
      }
      window.location.assign("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function signInWithGoogle() {
    setSubmitting(true);
    try {
      const { error } = await authClient.signIn.social({ provider: "google", callbackURL: "/" });
      if (error) throw new Error(error.message ?? "Social sign-in failed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const title = mode === "sign-up" ? t("signUpTitle") : mode === "forgot" ? t("forgotTitle") : t("signInTitle");

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <AppLogo size="lg" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{title}</p>
        </div>

        {mode === "forgot" && resetSent ? (
          <div className="flex flex-col gap-4 text-center">
            <p className="text-sm text-foreground">{t("resetSent", { email })}</p>
            <button type="button" onClick={() => { setMode("sign-in"); setResetSent(false); }} className="text-sm text-muted-foreground underline">
              {t("backToSignIn")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "sign-up" ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">{t("name")}</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
              </div>
            ) : null}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
            </div>
            {mode !== "forgot" ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">{t("password")}</Label>
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
              <button type="button" onClick={() => { setMode("forgot"); setResetSent(false); }} className="self-end text-sm text-muted-foreground underline">
                {t("forgotPassword")}
              </button>
            ) : null}
            <Button type="submit" disabled={submitting}>
              {mode === "sign-in" ? t("signIn") : mode === "sign-up" ? t("createAccount") : t("sendReset")}
            </Button>
          </form>
        )}

        {mode !== "forgot" || !resetSent ? (
          <>
            {mode !== "forgot" ? (
              <>
                <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  {t("orFaster")}
                  <span className="h-px flex-1 bg-border" />
                </div>
                <Button type="button" variant="outline" className="w-full" disabled={submitting} onClick={() => void signInWithGoogle()}>
                  Continue with Google
                </Button>
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
              {mode === "sign-in" ? t("noAccount") : mode === "sign-up" ? t("hasAccount") : t("backToSignIn")}
            </button>
            <div className="mt-6 flex justify-center">
              <LanguageSelect />
            </div>
            <p className="mt-8 flex justify-center gap-4 text-xs text-muted-foreground">
              <Link to="/about" className="hover:text-foreground">About</Link>
              <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
              <Link to="/contact" className="hover:text-foreground">Contact</Link>
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
