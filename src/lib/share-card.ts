import { APP_DOMAIN, APP_NAME } from "@/lib/brand";
import type { computeStats } from "@/lib/stats";

let ticketPhoto: HTMLImageElement | null = null;

async function loadTicketPhoto(): Promise<HTMLImageElement | null> {
  if (ticketPhoto && ticketPhoto.naturalWidth > 10) return ticketPhoto;
  if (typeof Image === "undefined") return null;
  const img = new Image();
  img.src = "/share-stats-bg.jpg";
  try {
    if (typeof img.decode === "function") await img.decode();
    else {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("photo"));
        if (img.complete && img.naturalWidth) resolve();
      });
    }
  } catch {
    return null;
  }
  if (!img.naturalWidth) return null;
  ticketPhoto = img;
  return img;
}

function paintStage(ctx: CanvasRenderingContext2D) {
  const sky = ctx.createLinearGradient(0, 0, 0, 620);
  sky.addColorStop(0, "#1a1030");
  sky.addColorStop(0.45, "#3a1840");
  sky.addColorStop(1, "#100c09");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1080, 620);

  const beams: [number, number, string][] = [
    [180, 40, "rgba(255,140,40,0.55)"],
    [360, 20, "rgba(255,200,80,0.45)"],
    [540, 10, "rgba(180,80,255,0.35)"],
    [720, 25, "rgba(255,160,50,0.5)"],
    [900, 45, "rgba(120,80,255,0.4)"],
  ];
  beams.forEach(([x, tilt, color]) => {
    ctx.save();
    ctx.translate(x, 30);
    ctx.rotate((tilt * Math.PI) / 180);
    const beam = ctx.createLinearGradient(0, 0, 0, 520);
    beam.addColorStop(0, color);
    beam.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(18, 0);
    ctx.lineTo(160, 520);
    ctx.lineTo(-160, 520);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#f4e0a8";
    ctx.beginPath();
    ctx.arc(x, 28, 8, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "#050304";
  ctx.beginPath();
  ctx.moveTo(0, 620);
  for (let i = 0; i <= 24; i += 1) {
    const x = (1080 / 24) * i;
    const h = 90 + ((i * 17) % 70);
    ctx.lineTo(x, 620 - h);
  }
  ctx.lineTo(1080, 620);
  ctx.closePath();
  ctx.fill();
}

function coverPhoto(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const iw = photo.naturalWidth;
  const ih = photo.naturalHeight;
  const scale = Math.max(w / iw, h / ih);
  ctx.drawImage(photo, x + (w - iw * scale) / 2, y + (h - ih * scale) / 2, iw * scale, ih * scale);
}


function drawMark(ctx: CanvasRenderingContext2D, kind: "ticket" | "globe" | "pin" | "pick", x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#e23b3b";
  ctx.fillStyle = "#e23b3b";
  ctx.lineWidth = 3;
  if (kind === "ticket") {
    ctx.strokeRect(-16, -12, 32, 22);
    ctx.beginPath();
    ctx.moveTo(-6, -12);
    ctx.lineTo(-6, 10);
    ctx.stroke();
  } else if (kind === "globe") {
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 14, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.lineTo(14, 0);
    ctx.stroke();
  } else if (kind === "pin") {
    ctx.beginPath();
    ctx.arc(0, -4, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(0, 16);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.quadraticCurveTo(16, -6, 10, 8);
    ctx.quadraticCurveTo(0, 16, -10, 8);
    ctx.quadraticCurveTo(-16, -6, 0, -14);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawStatsPoster(stats: ReturnType<typeof computeStats>): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const photo = ticketPhoto && ticketPhoto.naturalWidth > 10 ? ticketPhoto : null;
  canvas.width = photo?.naturalWidth || 1152;
  canvas.height = photo?.naturalHeight || 1712;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw stats.");
  const w = canvas.width;
  const h = canvas.height;
  if (photo) ctx.drawImage(photo, 0, 0, w, h);
  else {
    ctx.fillStyle = "#2a0c0c";
    ctx.fillRect(0, 0, w, h);
  }
  const ink = "#c47b68";
  const cx = w * 0.58;
  ctx.textAlign = "center";
  ctx.fillStyle = ink;
  ctx.font = `bold ${Math.round(w * 0.032)}px Impact, Arial Black, sans-serif`;
  ctx.fillText("TOP ARTISTS", cx, h * 0.2);
  const top = (stats.artistCounts ?? []).slice(0, 3);
  top.forEach((row, i) => {
    const max = w * 0.46;
    let size = Math.round(w * 0.07);
    ctx.font = `bold ${size}px Impact, Arial Black, sans-serif`;
    while (size > 18 && ctx.measureText(row.data.name).width > max) {
      size -= 2;
      ctx.font = `bold ${size}px Impact, Arial Black, sans-serif`;
    }
    ctx.fillStyle = ink;
    ctx.fillText(row.data.name, cx, h * 0.27 + i * h * 0.05);
  });
  const pills = [
    [String(stats.totalShows ?? 0), "SHOWS"],
    [String(stats.uniqueCountries ?? 0), "COUNTRIES"],
    [String(stats.uniqueVenues ?? 0), "VENUES"],
    [String(stats.uniqueArtists ?? 0), "BANDS"],
  ];
  const slots = [0.3, 0.5, 0.69, 0.85];
  pills.forEach((pill, i) => {
    const x = w * slots[i];
    ctx.fillStyle = ink;
    ctx.font = `bold ${Math.round(w * 0.055)}px Impact, Arial Black, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(pill[0], x, h * 0.9);
    ctx.font = `bold ${Math.round(w * 0.02)}px Impact, Arial Black, sans-serif`;
    ctx.fillText(pill[1], x, h * 0.93);
  });
  return canvas;
}

export async function drawStatsPosterReady(stats: ReturnType<typeof computeStats>) {
  await loadTicketPhoto();
  return drawStatsPoster(stats);
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not export image."));
    }, "image/png");
  });
}
