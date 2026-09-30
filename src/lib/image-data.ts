const MAX_BYTES = 500 * 1024;
const MAX_CHARS = 900_000;

function looksLikeImage(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true;
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return true;
  const riff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  const webp = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
  return riff === "RIFF" && webp === "WEBP";
}

export function assertImageDataUrl(value: string | null | undefined, label = "Image"): string | null {
  if (value == null || value === "") return null;
  const raw = value.trim();
  if (raw.length > MAX_CHARS) throw new Error(`${label} is too large.`);
  if (/^https?:\/\/\S{3,4000}$/i.test(raw)) return raw;

  const match =
    /^data:image\/(?:jpeg|jpg|pjpeg|png|webp)(?:;charset=[\w-]+)?;base64,([A-Za-z0-9+/=\s]+)$/i.exec(raw) ??
    /^data:image\/[^;]+;base64,([A-Za-z0-9+/=\s]+)$/i.exec(raw);
  if (!match) throw new Error(`${label} must be a JPEG, PNG, or WebP.`);

  const b64 = match[1].replace(/\s/g, "");
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  const bytes = Math.floor((b64.length * 3) / 4) - padding;
  if (bytes <= 0 || bytes > MAX_BYTES) throw new Error(`${label} must be under 500 KB.`);
  try {
    const bin = Uint8Array.from(atob(b64).slice(0, 16), (c) => c.charCodeAt(0));
    if (!looksLikeImage(bin)) throw new Error("bad magic");
  } catch {
    throw new Error(`${label} must be a JPEG, PNG, or WebP.`);
  }
  return raw;
}
