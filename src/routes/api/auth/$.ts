import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";
import { allowRequest, clientIp } from "@/lib/rate-limit";

const fails = new Map<string, number>();

function challengeFor(ip: string) {
  const n = fails.get(ip) ?? 0;
  const a = (n % 7) + 2;
  const b = (n % 5) + 3;
  return { a, b, answer: String(a + b) };
}

function sensitiveAuth(url: string) {
  return /sign-in|sign-up|forget-password|request-password|reset-password|send-verification|verify-email/i.test(
    url,
  );
}

async function handleAuth(request: Request) {
  const ip = clientIp(request);
  const isWrite = request.method !== "GET" && request.method !== "HEAD";
  const tight = isWrite && sensitiveAuth(request.url);
  const ok = tight
    ? allowRequest(`auth-sensitive:${ip}`, 8, 15 * 60 * 1000)
    : isWrite
      ? allowRequest(`auth-write:${ip}`, 25, 15 * 60 * 1000)
      : allowRequest(`auth-read:${ip}`, 120, 60 * 1000);
  if (!ok) {
    return new Response(JSON.stringify({ message: "Too many requests. Try again later." }), {
      status: 429,
      headers: { "content-type": "application/json" },
    });
  }
  const signIn = request.method === "POST" && /sign-in\/email/i.test(request.url);
  if (signIn && (fails.get(ip) ?? 0) >= 5) {
    const challenge = challengeFor(ip);
    if (request.headers.get("x-human-check") !== challenge.answer) {
      return new Response(JSON.stringify({ message: `Confirm you are human: ${challenge.a}+${challenge.b}` }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }
  }
  const response = await auth.handler(request);
  if (signIn && response.status >= 400) fails.set(ip, (fails.get(ip) ?? 0) + 1);
  if (signIn && response.status < 400) fails.delete(ip);
  return response;
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handleAuth(request),
      POST: ({ request }) => handleAuth(request),
    },
  },
});
