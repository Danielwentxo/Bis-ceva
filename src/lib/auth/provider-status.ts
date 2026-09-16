import { createServerFn } from "@tanstack/react-start";

/**
 * Which optional sign-in methods have credentials configured. The client uses
 * this to decide which buttons to render (e.g. don't show "Continue with
 * Apple" until `APPLE_CLIENT_ID`/`APPLE_CLIENT_SECRET` are actually set).
 *
 * Safe to import from client code — it's a `createServerFn`, so only this tiny
 * RPC crosses the wire, never the env vars themselves or server-only modules.
 */
export const getAuthProviderStatus = createServerFn({ method: "GET" }).handler(
  async () => {
    const has = (key: string) => Boolean(process.env[key]?.trim());
    return {
      google: has("GOOGLE_CLIENT_ID") && has("GOOGLE_CLIENT_SECRET"),
      apple: has("APPLE_CLIENT_ID") && has("APPLE_CLIENT_SECRET"),
    };
  },
);
