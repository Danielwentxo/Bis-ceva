import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { AppLogo } from "@/components/app-logo";
import { LanguageSelect } from "@/components/language-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, signIn } from "@/lib/auth/client";
import { useI18n } from "@/lib/i18n";
import { pageLabel } from "@/lib/i18n-pages";

type Mode = "sign-in" | "sign-up" | "forgot";

const WRONG_LOGIN: Record<string, string> = {
  en: "Email or password is incorrect.",
  ro: "Adresa de email sau parola sunt greșite.",
  sv: "E-postadressen eller lösenordet är felaktigt.",
  de: "E-Mail oder Passwort ist falsch.",
  fr: "L’e-mail ou le mot de passe est incorrect.",
  es: "El correo o la contraseña no son correctos.",
  pt: "O e-mail ou a senha estão incorretos.",
  it: "Email o password non corretti.",
  pl: "E-mail lub hasło jest niepoprawne.",
  ja: "メールアドレスまたはパスワードが違います。",
  ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
};

const CONFIRM_LABEL: Record<string, string> = {
  en: "Confirm password",
  ro: "Confirmă parola",
  sv: "Bekräfta lösenord",
  de: "Passwort bestätigen",
  fr: "Confirmer le mot de passe",
  es: "Confirmar contraseña",
  pt: "Confirmar senha",
  it: "Conferma password",
  pl: "Potwierdź hasło",
  ja: "パスワードを確認",
  ar: "تأكيد كلمة المرور",
};

const MISMATCH: Record<string, string> = {
  en: "Passwords do not match.",
  ro: "Parolele nu coincid.",
  sv: "Lösenorden överensstämmer inte.",
  de: "Die Passwörter stimmen nicht überein.",
  fr: "Les mots de passe ne correspondent pas.",
  es: "Las contraseñas no coinciden.",
  pt: "As senhas não coincidem.",
  it: "Le password non coincidono.",
  pl: "Hasła nie są astfel same.",
  ja: "パスワードが一致しません。",
  ar: "كلمتا المرور غير متطابقتين.",
};

function isWrongLogin(message: string) {
  return /invalid email or password|invalid_email_or_password|incorrect email or password/i.test(message);
}

function useGrokBroker() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host.endsWith(".vercel.app") || host.endsWith(".grok-sandbox.com") || host === "localhost";
}

export function LoginScreen() {
  const { t, locale } = useI18n();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [formError, setFormError] = useState("");

  function changeMode(next: Mode) {
    setMode(next);
    setResetSent(false);
    setFormError("");
    setConfirmPassword("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    if (mode === "sign-up" && password !== confirmPassword) {
      setFormError(MISMATCH[locale] ?? MISMATCH.en);
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "forgot") {
        const { error } = await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
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
      const raw = err instanceof Error ? err.message : "Something went wrong";
      if (mode === "sign-in" && isWrongLogin(raw)) {
        setFormError(WRONG_LOGIN[locale] ?? WRONG_LOGIN.en);
      } else {
        setFormError(raw);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function signInWithGoogle() {
    setFormError("");
    setSubmitting(true);
    try {
      if (useGrokBroker()) {
        await signIn("grok-google", { callbackURL: "/", errorCallbackURL: "/" });
        return;
      }
      const { data, error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
        errorCallbackURL: "/",
      });
      if (error) throw new Error(error.message ?? "Google sign-in failed");
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("Google sign-in failed");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Google sign-in failed");
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
            <button type="button" onClick={() => changeMode("sign-in")} className="text-sm text-muted-foreground underline">
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
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFormError("");
                }}
                autoComplete="email"
                required
              />
            </div>
            {mode !== "forgot" ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFormError("");
                  }}
                  autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                  minLength={8}
                  required
                />
              </div>
            ) : null}
            {mode === "sign-up" ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword">{CONFIRM_LABEL[locale] ?? CONFIRM_LABEL.en}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setFormError("");
                  }}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
            ) : null}
            {formError ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}
            {mode === "sign-in" ? (
              <button type="button" onClick={() => changeMode("forgot")} className="self-end text-sm text-muted-foreground underline">
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
                  {pageLabel(locale, "continueGoogle")}
                </Button>
              </>
            ) : null}
            <button type="button" onClick={() => changeMode(mode === "sign-in" ? "sign-up" : "sign-in")} className="mt-4 w-full text-center text-sm text-muted-foreground underline">
              {mode === "sign-in" ? t("noAccount") : mode === "sign-up" ? t("hasAccount") : t("backToSignIn")}
            </button>
            <div className="mt-6 flex justify-center">
              <LanguageSelect />
            </div>
            <p className="mt-8 flex justify-center gap-4 text-xs text-muted-foreground">
              <Link to="/about" className="hover:text-foreground">{pageLabel(locale, "footerAbout")}</Link>
              <Link to="/privacy" className="hover:text-foreground">{pageLabel(locale, "footerPrivacy")}</Link>
              <Link to="/contact" className="hover:text-foreground">{pageLabel(locale, "footerContact")}</Link>
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
