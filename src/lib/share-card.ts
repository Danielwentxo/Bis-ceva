import { SHARE_TICKET_BG } from "@/lib/share-ticket-bg";
import { APP_DOMAIN, APP_NAME } from "@/lib/brand";
import type { computeStats } from "@/lib/stats";

let ticketPhoto: HTMLImageElement | null = null;

async function loadTicketPhoto(): Promise<HTMLImageElement | null> {
  if (ticketPhoto && ticketPhoto.naturalWidth > 10) return ticketPhoto;
  if (typeof Image === "undefined") return null;
  const img = new Image();
  img.src = SHARE_TICKET_BG;
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

export function drawStatsPoster(stats: ReturnType<typeof computeStats>): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw stats.");

  ctx.fillStyle = "#100c09";
  ctx.fillRect(0, 0, 1080, 1350);
  paintStage(ctx);
  if (ticketPhoto && ticketPhoto.naturalWidth > 10) {
    coverPhoto(ctx, ticketPhoto, 0, 0, 1080, 620);
  }

  const fade = ctx.createLinearGradient(0, 360, 0, 680);
  fade.addColorStop(0, "rgba(16,12,9,0)");
  fade.addColorStop(1, "#100c09");
  ctx.fillStyle = fade;
  ctx.fillRect(0, 360, 1080, 320);

  ctx.strokeStyle = "#c4a574";
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, 1008, 1278);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#f3e6d0";
  ctx.font = "bold 20px Arial, Helvetica, sans-serif";
  ctx.fillText(APP_NAME.toUpperCase(), 540, 80);

  ctx.fillStyle = "#f3e6d0";
  ctx.font = "bold 150px Georgia, Times New Roman, serif";
  ctx.fillText(String(stats.totalShows ?? 0), 540, 780);
  ctx.fillStyle = "#c4a574";
  ctx.font = "bold 26px Arial, Helvetica, sans-serif";
  ctx.fillText("CONCERTS", 540, 824);

  const pills = [
    [String(stats.uniqueArtists ?? 0), "ARTISTS"],
    [String(stats.uniqueVenues ?? 0), "VENUES"],
    [String(stats.uniqueCountries ?? 0), "COUNTRIES"],
  ];
  pills.forEach((pill, i) => {
    const cx = 220 + i * 320;
    ctx.fillStyle = "#f3e6d0";
    ctx.font = "bold 48px Georgia, Times New Roman, serif";
    ctx.fillText(pill[0], cx, 920);
    ctx.fillStyle = "#c4a574";
    ctx.font = "bold 15px Arial, Helvetica, sans-serif";
    ctx.fillText(pill[1], cx, 950);
  });

  ctx.fillStyle = "#c4a574";
  ctx.font = "bold 15px Arial, Helvetica, sans-serif";
  ctx.fillText("MOST SEEN", 540, 1020);

  const top = (stats.artistCounts ?? []).slice(0, 3);
  top.forEach((row, i) => {
    const yy = 1070 + i * 52;
    ctx.textAlign = "left";
    ctx.fillStyle = "#f3e6d0";
    ctx.font = "bold 28px Georgia, Times New Roman, serif";
    ctx.fillText(`${i + 1}.  ${row.data.name}`, 120, yy);
    ctx.textAlign = "right";
    ctx.fillStyle = "#c4a574";
    ctx.font = "bold 24px Arial, Helvetica, sans-serif";
    ctx.fillText(String(row.count), 960, yy);
    ctx.textAlign = "center";
  });

  ctx.fillStyle = "#c4a574";
  ctx.font = "bold 16px Arial, Helvetica, sans-serif";
  ctx.fillText(APP_DOMAIN.toUpperCase(), 540, 1278);
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
