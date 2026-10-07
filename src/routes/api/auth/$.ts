import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";
import { getSql } from "@/lib/db";
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
  if (request.method === "POST" && /sign-up\/email/i.test(request.url)) {
    try {
      const sql = await getSql();
      await sql`select 1`;
    } catch (err) {
      const raw = process.env.DATABASE_URL ?? "";
      let where = "no DATABASE_URL";
      try {
        const url = new URL(raw);
        where = `user ${decodeURIComponent(url.username)} host ${url.hostname} port ${url.port || "5432"}`;
      } catch {
        where = "DATABASE_URL is not a valid address";
      }
      const message = `${err instanceof Error ? err.message : "Database is not reachable"} (${where})`;
      return new Response(JSON.stringify({ message }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }
  }
  try {
    const response = await auth.handler(request);
    if (response.status >= 500) {
      const text = await response.clone().text();
      if (!text.trim()) {
        return new Response(JSON.stringify({ message: "Account could not be created. The database did not accept the request." }), {
          status: 500,
          headers: { "content-type": "application/json" },
        });
      }
    }
    return response;
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
