/**
 * Sends the "reset your password" email during the forgot-password flow.
 *
 * Real delivery needs an email provider. We use Resend (https://resend.com)
 * because it has a free tier (100 emails/day) and a dead-simple HTTP API —
 * no SMTP setup. To enable it:
 *
 *   1. Create a free Resend account and verify a sending domain (or use
 *      their shared `onboarding@resend.dev` sender for testing).
 *   2. Create an API key and set it as `RESEND_API_KEY` in your environment.
 *   3. Optionally set `RESEND_FROM_EMAIL` (defaults to the Resend test sender).
 *
 * Without `RESEND_API_KEY` set, this just logs the reset link to the server
 * console instead of emailing it — fine for local/preview testing, but users
 * will never receive a real email until the key is configured.
 */

const RESEND_API_URL = "https://api.resend.com/emails";

function env(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
}

export async function sendResetPasswordEmail(params: {
  to: string;
  resetUrl: string;
  userName?: string | null;
}): Promise<void> {
  const apiKey = env("RESEND_API_KEY");
  const from = env("RESEND_FROM_EMAIL") ?? "onboarding@resend.dev";

  if (!apiKey) {
    // Dev/preview fallback — makes the link visible without an email provider.
    console.log(
      `[auth] Password reset requested for ${params.to}. ` +
        `RESEND_API_KEY not set, so no email was sent. Reset link:\n${params.resetUrl}`,
    );
    return;
  }

  const greeting = params.userName ? `Salut, ${params.userName}!` : "Salut!";

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: params.to,
      subject: "Resetează-ți parola",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <p>${greeting}</p>
          <p>Am primit o cerere de resetare a parolei pentru contul tău.</p>
          <p>
            <a href="${params.resetUrl}"
               style="display:inline-block;padding:10px 20px;background:#111;color:#fff;
                      border-radius:6px;text-decoration:none;">
              Resetează parola
            </a>
          </p>
          <p>Dacă nu ai cerut tu asta, poți ignora acest email — parola ta rămâne neschimbată.</p>
          <p style="color:#888;font-size:12px;">Linkul expiră în cel mult o oră.</p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend request failed (${res.status}): ${body}`);
  }
}
