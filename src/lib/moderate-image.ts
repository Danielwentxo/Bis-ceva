import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";

function num(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export const moderateImage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ dataUrl: z.string().min(20).max(900_000) }))
  .handler(async ({ data }): Promise<{ ok: true } | { ok: false; reason: string }> => {
    const user = process.env.SIGHTENGINE_API_USER;
    const secret = process.env.SIGHTENGINE_API_SECRET;
    if (!user || !secret) return { ok: true };

    const comma = data.dataUrl.indexOf(",");
    const base64 = comma >= 0 ? data.dataUrl.slice(comma + 1) : data.dataUrl;
    const bytes = Buffer.from(base64, "base64");
    const blob = new Blob([bytes], { type: "image/jpeg" });

    const body = new FormData();
    body.set("models", "nudity-2.1,offensive-2.0,gore-2.0,weapon");
    body.set("api_user", user);
    body.set("api_secret", secret);
    body.set("media", blob, "logo.jpg");

    const response = await fetch("https://api.sightengine.com/1.0/check.json", {
      method: "POST",
      body,
    });
    if (!response.ok) {
      return { ok: false, reason: "Could not check this image. Try another photo." };
    }
    const json = (await response.json()) as {
      status?: string;
      nudity?: Record<string, number>;
      offensive?: Record<string, number>;
      gore?: { prob?: number };
      weapon?: number | { classes?: Record<string, number> };
    };
    if (json.status === "failure") {
      return { ok: false, reason: "Could not check this image. Try another photo." };
    }

    const explicit =
      num(json.nudity?.sexual_activity) > 0.35 ||
      num(json.nudity?.sexual_display) > 0.35 ||
      num(json.nudity?.erotica) > 0.45 ||
      num(json.nudity?.very_suggestive) > 0.7;
    const gore = num(json.gore?.prob) > 0.5;
    const offensive = num(json.offensive?.prob) > 0.6;
    const weapon =
      typeof json.weapon === "number" ? json.weapon > 0.6 : Object.values(json.weapon?.classes ?? {}).some((v) => num(v) > 0.7);

    if (explicit || gore || offensive || weapon) {
      return { ok: false, reason: "This image cannot be used as a logo." };
    }
    return { ok: true };
  });
