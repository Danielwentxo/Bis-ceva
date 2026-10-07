import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";
import { allowRequest, clientIp } from "@/lib/rate-limit";

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
  try {
    return await auth.handler(request);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign up failed";
    console.error("[auth] handler failed", err);
    return new Response(JSON.stringify({ message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handleAuth(request),
      POST: ({ request }) => handleAuth(request),
    },
  },
});
