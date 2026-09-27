const RESEND_API_URL = "https://api.resend.com/emails";

function env(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
}

export function emailProviderConfigured(): boolean {
  return Boolean(env("RESEND_API_KEY"));
}

async function sendAppEmail(params: {
  to: string;
  subject: string;
  html: string;
  logLine: string;
}): Promise<void> {
  const apiKey = env("RESEND_API_KEY");
  const from = env("RESEND_FROM_EMAIL") ?? "onboarding@resend.dev";

  if (!apiKey) {
    console.log(params.logLine);
    return;
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend request failed (${res.status}): ${body}`);
  }
}

function wrap(title: string, body: string, href: string, cta: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <p>${title}</p>
      <p>${body}</p>
      <p>
        <a href="${href}"
           style="display:inline-block;padding:10px 20px;background:#111;color:#fff;
                  border-radius:6px;text-decoration:none;">
          ${cta}
        </a>
      </p>
      <p>If you did not ask for this, you can ignore the email.</p>
    </div>
  `;
}

export async function sendResetPasswordEmail(params: {
  to: string;
  resetUrl: string;
  userName?: string | null;
}): Promise<void> {
  const greeting = params.userName ? `Hi, ${params.userName}!` : "Hi!";
  await sendAppEmail({
    to: params.to,
    subject: "Reset your My Gig History password",
    html: wrap(
      greeting,
      "We received a request to reset your password.",
      params.resetUrl,
      "Reset password",
    ),
    logLine: `[auth] Password reset for ${params.to}: ${params.resetUrl}`,
  });
}

export async function sendVerificationEmail(params: {
  to: string;
  url: string;
  userName?: string | null;
}): Promise<void> {
  const greeting = params.userName ? `Hi, ${params.userName}!` : "Hi!";
  await sendAppEmail({
    to: params.to,
    subject: "Confirm your My Gig History email",
    html: wrap(greeting, "Confirm this email to finish creating your account.", params.url, "Confirm email"),
    logLine: `[auth] Verify email for ${params.to}: ${params.url}`,
  });
}
