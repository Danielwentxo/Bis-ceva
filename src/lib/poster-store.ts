const SUPABASE_URL = "https://ejialiwdsickbiraloni.supabase.co";
const BUCKET = "posters";

function publicUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

export async function storePoster(value: string | null | undefined, concertId: string): Promise<string | null> {
  if (!value) return null;
  if (value.startsWith("https://")) return value;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || !value.startsWith("data:")) return value;
  const match = /^data:(image\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/i.exec(value);
  if (!match) return value;
  const bytes = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  const path = `${concertId}.jpg`;
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "image/jpeg" };
  let res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, { method: "POST", headers, body: bytes });
  if (!res.ok) {
    res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, { method: "PUT", headers, body: bytes });
  }
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Could not store poster (${res.status}): ${detail.slice(0, 180)}`);
  }
  return publicUrl(path);
}
