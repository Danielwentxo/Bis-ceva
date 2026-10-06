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
  canvas.width = photo?.naturalWidth || 1080;
  canvas.height = photo?.naturalHeight || 1620;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw stats.");
  const w = canvas.width;
  const h = canvas.height;
  if (photo) ctx.drawImage(photo, 0, 0, w, h);
  else {
    ctx.fillStyle = "#5a1010";
    ctx.fillRect(0, 0, w, h);
  }

  const cx = w * 0.58;
  ctx.textAlign = "center";
  ctx.fillStyle = "#f4f1ea";
  ctx.font = `bold ${Math.round(w * 0.085)}px Impact, Arial Black, sans-serif`;
  ctx.fillText("My year", cx, h * 0.16);
  ctx.fillText("in shows", cx, h * 0.23);

  ctx.fillStyle = "#e23b3b";
  ctx.font = `bold ${Math.round(w * 0.028)}px Arial, Helvetica, sans-serif`;
  ctx.fillText("TOP 3 ARTISTS", cx, h * 0.29);

  const top = (stats.artistCounts ?? []).slice(0, 3);
  ctx.fillStyle = "#f4f1ea";
  top.forEach((row, i) => {
    const max = w * 0.48;
    let size = Math.round(w * 0.062);
    ctx.font = `bold ${size}px Arial, Helvetica, sans-serif`;
    while (size > 18 && ctx.measureText(row.data.name).width > max) {
      size -= 2;
      ctx.font = `bold ${size}px Arial, Helvetica, sans-serif`;
    }
    ctx.fillText(row.data.name, cx, h * 0.35 + i * h * 0.05);
  });

  ctx.save();
  ctx.translate(w * 0.055, h * 0.78);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "#111111";
  ctx.font = `bold ${Math.round(w * 0.032)}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("mygighistory.com", 0, 0);
  ctx.restore();

  ctx.fillStyle = "#6d1717";
  ctx.fillRect(w * 0.2, h * 0.8, w * 0.74, h * 0.14);
  const pills = [
    [String(stats.totalShows ?? 0), "SHOWS", "ticket"],
    [String(stats.uniqueCountries ?? 0), "COUNTRIES", "globe"],
    [String(stats.uniqueVenues ?? 0), "VENUES", "pin"],
    [String(stats.uniqueArtists ?? 0), "BANDS", "pick"],
  ] as const;
  pills.forEach((pill, i) => {
    const x = w * (0.3 + i * 0.16);
    drawMark(ctx, pill[2], x, h * 0.9);
    ctx.fillStyle = "#f4f1ea";
    ctx.font = `bold ${Math.round(w * 0.055)}px Impact, Arial Black, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(pill[0], x, h * 0.855);
    ctx.fillStyle = "#f4f1ea";
    ctx.font = `bold ${Math.round(w * 0.018)}px Arial, Helvetica, sans-serif`;
    ctx.fillText(pill[1], x, h * 0.925);
    if (i < 3) {
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.08, h * 0.83);
      ctx.lineTo(x + w * 0.08, h * 0.93);
      ctx.stroke();
    }
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
