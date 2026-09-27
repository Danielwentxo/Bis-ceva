import { SHARE_TICKET_BG } from "@/lib/share-ticket-bg";
import { APP_DOMAIN, APP_NAME } from "@/lib/brand";
import type { computeStats } from "@/lib/stats";

let ticketPhoto: HTMLImageElement | null = null;
let ticketPhotoReady: Promise<HTMLImageElement | null> | null = null;

function loadTicketPhoto(): Promise<HTMLImageElement | null> {
  if (ticketPhoto && ticketPhoto.naturalWidth) return Promise.resolve(ticketPhoto);
  if (ticketPhotoReady) return ticketPhotoReady;
  if (typeof Image === "undefined") return Promise.resolve(null);
  ticketPhotoReady = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      ticketPhoto = img;
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = SHARE_TICKET_BG;
  });
  return ticketPhotoReady;
}

if (typeof Image !== "undefined") void loadTicketPhoto();

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
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(photo, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

export function drawStatsPoster(stats: ReturnType<typeof computeStats>): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw stats.");

  ctx.fillStyle = "#100c09";
  ctx.fillRect(0, 0, 1080, 1350);

  if (ticketPhoto && ticketPhoto.naturalWidth) {
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
