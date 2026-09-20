const MAX_BYTES = 500 * 1024;
const MAX_CHARS = 900_000;

export function assertImageDataUrl(value: string | null | undefined, label = "Image"): string | null {
  if (value == null || value === "") return null;
  if (value.length > MAX_CHARS) throw new Error(`${label} is too large.`);
  if (/^https:\/\/\S{3,1800}$/i.test(value)) return value;
  const match = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i.exec(value);
  if (!match) throw new Error(`${label} must be a JPEG, PNG, or WebP.`);
  const b64 = match[2].replace(/\s/g, "");
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  const bytes = Math.floor((b64.length * 3) / 4) - padding;
  if (bytes <= 0 || bytes > MAX_BYTES) throw new Error(`${label} must be under 500 KB.`);
  return value;
}
