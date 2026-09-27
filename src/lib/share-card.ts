import { SHARE_TICKET_BG } from "@/lib/share-ticket-bg";
import { APP_DOMAIN, APP_NAME } from "@/lib/brand";
import type { computeStats } from "@/lib/stats";

let ticketPhoto: HTMLImageElement | null = null;

if (typeof Image !== "undefined") {
  const img = new Image();
  img.onload = () => {
    ticketPhoto = img;
  };
  img.src = SHARE_TICKET_BG;
}

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
  const split = 500;

  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, 18);
  else ctx.rect(x, y, w, h);
  ctx.clip();

  if (ticketPhoto) {
    const photo = ticketPhoto;
    const scale = Math.max(w / photo.width, (split - y) / photo.height);
    const dw = photo.width * scale;
    const dh = photo.height * scale;
    ctx.drawImage(photo, x + (w - dw) / 2, y + (split - y - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = "#2a1a0c";
    ctx.fillRect(x, y, w, split - y);
  }

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

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not export image."));
    }, "image/png");
  });
}
