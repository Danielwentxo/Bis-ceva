import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";
import { allowRequest, clientIp } from "@/lib/rate-limit";

async function handleAuth(request: Request) {
  const ip = clientIp(request);
  const isWrite = request.method !== "GET" && request.method !== "HEAD";
  const ok = isWrite
    ? allowRequest(`auth-write:${ip}`, 25, 15 * 60 * 1000)
    : allowRequest(`auth-read:${ip}`, 120, 60 * 1000);
  if (!ok) {
    return new Response(JSON.stringify({ message: "Too many requests. Try again later." }), {
      status: 429,
      headers: { "content-type": "application/json" },
    });
  }
  return auth.handler(request);
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handleAuth(request),
      POST: ({ request }) => handleAuth(request),
    },
  },
});
