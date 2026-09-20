/** Best-effort limiter for a single serverless isolate. Better than nothing. */

const hits = new Map<string, number[]>();

export function allowRequest(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const next = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (next.length >= limit) {
    hits.set(key, next);
    return false;
  }
  next.push(now);
  hits.set(key, next);
  if (hits.size > 8000) {
    for (const [k, times] of hits) {
      if (!times.length || now - times[times.length - 1] > windowMs) hits.delete(k);
    }
  }
  return true;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export class RateLimitError extends Error {
  readonly status = 429;
  constructor(message = "Too many requests. Try again later.") {
    super(message);
    this.name = "RateLimitError";
  }
}
