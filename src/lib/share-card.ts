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

function torn(ctx: CanvasRenderingContext2D, y: number, left: number, right: number) {
  ctx.beginPath();
  ctx.moveTo(left, y);
  let x = left;
  let up = true;
  while (x < right) {
    ctx.lineTo(x + 8, y + (up ? -5 : 5));
    ctx.lineTo(x + 16, y);
    x += 16;
    up = !up;
  }
  ctx.strokeStyle = "#c9b496";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function barcode(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  let xx = x;
  let i = 0;
  while (xx < x + w) {
    const bar = 2 + (i % 4);
    ctx.fillStyle = "#1c1712";
    ctx.fillRect(xx, y, bar, h);
    xx += bar + 2 + (i % 3);
    i += 1;
  }
}

function paintPhoto(ctx: CanvasRenderingContext2D, photo: HTMLImageElement | null, x: number, y: number, w: number, photoH: number) {
  ctx.fillStyle = "#120c08";
  ctx.fillRect(x, y, w, photoH);
  if (!photo || !photo.naturalWidth) return;
  const iw = photo.naturalWidth;
  const ih = photo.naturalHeight;
  const srcH = Math.max(8, Math.floor(ih * 0.22));
  ctx.drawImage(photo, 0, 0, iw, srcH, x, y, w, photoH);
  const shade = ctx.createLinearGradient(0, y + photoH - 90, 0, y + photoH);
  shade.addColorStop(0, "rgba(18,12,8,0)");
  shade.addColorStop(1, "rgba(18,12,8,0.35)");
  ctx.fillStyle = shade;
  ctx.fillRect(x, y + photoH - 90, w, 90);
}

export function drawShareCard(stats: ReturnType<typeof computeStats>, year?: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw card.");

  ctx.fillStyle = "#d7c4a6";
  ctx.fillRect(0, 0, 1080, 1350);

  const x = 28;
  const y = 28;
  const w = 1024;
  const h = 1294;
  const split = 560;

  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, 18);
  else ctx.rect(x, y, w, h);
  ctx.clip();

  paintPhoto(ctx, ticketPhoto, x, y, w, split - y);

  ctx.fillStyle = "#efe4d0";
  ctx.fillRect(x, split, w, y + h - split);
  ctx.fillStyle = "rgba(130,100,60,0.08)";
  for (let i = 0; i < 40; i += 1) ctx.fillRect(x, split + i * 20, w, 1);
  torn(ctx, split, x + 8, x + w - 8);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "#3f352b";
  ctx.font = "bold 24px Georgia, Times New Roman, serif";
  ctx.fillText(APP_NAME.toUpperCase(), 540, split + 68);

  ctx.fillStyle = "#161310";
  ctx.font = "bold 130px Georgia, Times New Roman, serif";
  ctx.fillText(String(stats.totalShows ?? 0), 540, split + 208);

  ctx.font = "bold 34px Georgia, Times New Roman, serif";
  ctx.fillText(year ? String(year).toUpperCase() : "CONCERTS", 540, split + 256);

  const cols = [
    ["ARTISTS", String(stats.uniqueArtists ?? 0)],
    ["VENUES", String(stats.uniqueVenues ?? 0)],
    ["COUNTRIES", String(stats.uniqueCountries ?? 0)],
  ];
  cols.forEach((col, i) => {
    const cx = x + w * (0.2 + i * 0.3);
    ctx.fillStyle = "#6a5d50";
    ctx.font = "bold 16px Arial, Helvetica, sans-serif";
    ctx.fillText(col[0], cx, split + 322);
    ctx.fillStyle = "#161310";
    ctx.font = "bold 50px Georgia, Times New Roman, serif";
    ctx.fillText(col[1], cx, split + 378);
  });

  ctx.fillStyle = "#6a5d50";
  ctx.font = "bold 16px Arial, Helvetica, sans-serif";
  ctx.fillText("TOP ARTISTS", 540, split + 440);

  const top = (stats.artistCounts ?? []).slice(0, 3);
  top.forEach((row, i) => {
    const yy = split + 492 + i * 46;
    ctx.textAlign = "left";
    ctx.fillStyle = "#161310";
    ctx.font = "bold 28px Georgia, Times New Roman, serif";
    ctx.fillText(`${i + 1}.  ${row.data.name}`, x + 90, yy);
    ctx.textAlign = "right";
    ctx.font = "bold 26px Arial, Helvetica, sans-serif";
    ctx.fillText(String(row.count), x + w - 90, yy);
    ctx.textAlign = "center";
  });

  barcode(ctx, x + 88, y + h - 126, w - 176, 52);
  ctx.fillStyle = "#6a5d50";
  ctx.font = "bold 16px Arial, Helvetica, sans-serif";
  ctx.fillText(`ADMIT ONE  —  ARCHIVE    ${APP_DOMAIN}`, 540, y + h - 46);

  ctx.restore();
  return canvas;
}

export function drawStatsPoster(stats: ReturnType<typeof computeStats>): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw stats.");

  const bg = ctx.createLinearGradient(0, 0, 0, 1350);
  bg.addColorStop(0, "#140e0a");
  bg.addColorStop(0.55, "#1c1410");
  bg.addColorStop(1, "#0c0907");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1350);

  if (ticketPhoto && ticketPhoto.naturalWidth) {
    ctx.globalAlpha = 0.34;
    const iw = ticketPhoto.naturalWidth;
    const ih = ticketPhoto.naturalHeight;
    const srcH = Math.max(8, Math.floor(ih * 0.22));
    ctx.drawImage(ticketPhoto, 0, 0, iw, srcH, 0, 0, 1080, 560);
    ctx.globalAlpha = 1;
    const fade = ctx.createLinearGradient(0, 280, 0, 640);
    fade.addColorStop(0, "rgba(20,14,10,0)");
    fade.addColorStop(1, "#140e0a");
    ctx.fillStyle = fade;
    ctx.fillRect(0, 280, 1080, 360);
  }

  ctx.strokeStyle = "#c4a574";
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, 984, 1254);
  ctx.strokeRect(60, 60, 960, 1230);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#c4a574";
  ctx.font = "bold 22px Arial, Helvetica, sans-serif";
  ctx.fillText(APP_NAME.toUpperCase(), 540, 130);

  ctx.fillStyle = "rgba(196,165,116,0.55)";
  ctx.font = "16px Arial, Helvetica, sans-serif";
  ctx.fillText("LIVE ARCHIVE", 540, 162);

  ctx.fillStyle = "#f3e6d0";
  ctx.font = "bold 168px Georgia, Times New Roman, serif";
  ctx.fillText(String(stats.totalShows ?? 0), 540, 360);
  ctx.fillStyle = "#c4a574";
  ctx.font = "bold 28px Arial, Helvetica, sans-serif";
  ctx.fillText("CONCERTS LOGGED", 540, 412);

  const pills = [
    [String(stats.uniqueArtists ?? 0), "ARTISTS"],
    [String(stats.uniqueVenues ?? 0), "VENUES"],
    [String(stats.uniqueCountries ?? 0), "COUNTRIES"],
  ];
  pills.forEach((pill, i) => {
    const cx = 220 + i * 320;
    ctx.fillStyle = "rgba(196,165,116,0.08)";
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(cx - 130, 470, 260, 120, 16);
      ctx.fill();
    } else ctx.fillRect(cx - 130, 470, 260, 120);
    ctx.fillStyle = "#f3e6d0";
    ctx.font = "bold 52px Georgia, Times New Roman, serif";
    ctx.fillText(pill[0], cx, 540);
    ctx.fillStyle = "#c4a574";
    ctx.font = "bold 16px Arial, Helvetica, sans-serif";
    ctx.fillText(pill[1], cx, 572);
  });

  ctx.fillStyle = "#c4a574";
  ctx.font = "bold 16px Arial, Helvetica, sans-serif";
  ctx.fillText("MOST SEEN", 540, 680);

  const top = (stats.artistCounts ?? []).slice(0, 3);
  top.forEach((row, i) => {
    const yy = 750 + i * 88;
    ctx.fillStyle = "rgba(243,230,208,0.06)";
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(120, yy - 52, 840, 76, 14);
      ctx.fill();
    } else ctx.fillRect(120, yy - 52, 840, 76);
    ctx.textAlign = "left";
    ctx.fillStyle = "#c4a574";
    ctx.font = "bold 22px Arial, Helvetica, sans-serif";
    ctx.fillText(String(i + 1).padStart(2, "0"), 150, yy);
    ctx.fillStyle = "#f3e6d0";
    ctx.font = "bold 32px Georgia, Times New Roman, serif";
    ctx.fillText(row.data.name, 210, yy);
    ctx.textAlign = "right";
    ctx.fillStyle = "#c4a574";
    ctx.font = "bold 28px Arial, Helvetica, sans-serif";
    ctx.fillText(String(row.count), 930, yy);
    ctx.textAlign = "center";
  });

  ctx.fillStyle = "#c4a574";
  ctx.font = "bold 18px Arial, Helvetica, sans-serif";
  ctx.fillText(APP_DOMAIN.toUpperCase(), 540, 1228);
  ctx.fillStyle = "rgba(243,230,208,0.45)";
  ctx.font = "16px Arial, Helvetica, sans-serif";
  ctx.fillText("Keep every show you have seen.", 540, 1262);

  return canvas;
}

export async function drawShareCardReady(stats: ReturnType<typeof computeStats>, year?: string) {
  await loadTicketPhoto();
  return drawShareCard(stats, year);
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
