import { APP_DOMAIN, APP_NAME } from "@/lib/brand";
import type { computeStats } from "@/lib/stats";

const PHOTO =
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1400&q=75";

function loadPhoto(): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = PHOTO;
  });
}

function paintFallback(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, "#2a1c0c");
  g.addColorStop(1, "#0b0907");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

function tornEdge(ctx: CanvasRenderingContext2D, y: number, left: number, right: number) {
  ctx.beginPath();
  ctx.moveTo(left, y);
  let x = left;
  let up = true;
  while (x < right) {
    ctx.lineTo(x + 7, y + (up ? -4 : 4));
    ctx.lineTo(x + 14, y);
    x += 14;
    up = !up;
  }
  ctx.strokeStyle = "#c4b49a";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function barcode(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  let xx = x;
  while (xx < x + w) {
    const bar = 2 + ((xx * 7) % 5);
    ctx.fillStyle = "#1a1612";
    ctx.fillRect(xx, y, bar, h);
    xx += bar + 2 + ((xx * 3) % 3);
  }
}

export async function drawShareCard(stats: ReturnType<typeof computeStats>, year?: string): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw card.");
  const photo = await loadPhoto();

  ctx.fillStyle = "#d9cbb6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const pad = 28;
  const cardX = pad;
  const cardY = pad;
  const cardW = canvas.width - pad * 2;
  const cardH = canvas.height - pad * 2;
  const split = 500;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 22);
  ctx.clip();

  if (photo) {
    const scale = Math.max(cardW / photo.width, (split - cardY) / photo.height);
    const dw = photo.width * scale;
    const dh = photo.height * scale;
    ctx.drawImage(photo, cardX + (cardW - dw) / 2, cardY + (split - cardY - dh) / 2, dw, dh);
  } else {
    paintFallback(ctx, cardX, cardY, cardW, split - cardY);
  }

  ctx.fillStyle = "#efe6d6";
  ctx.fillRect(cardX, split, cardW, cardY + cardH - split);
  ctx.fillStyle = "rgba(160,140,110,0.12)";
  for (let i = 0; i < 50; i += 1) ctx.fillRect(cardX, split + i * 16, cardW, 1);

  tornEdge(ctx, split, cardX + 8, cardX + cardW - 8);

  ctx.textAlign = "center";
  ctx.fillStyle = "#3d342c";
  ctx.font = "600 22px Outfit, sans-serif";
  ctx.fillText(APP_NAME.toUpperCase(), canvas.width / 2, split + 70);

  ctx.fillStyle = "#161310";
  ctx.font = "700 118px Fraunces, Georgia, serif";
  ctx.fillText(String(stats.totalShows), canvas.width / 2, split + 198);
  ctx.font = "600 34px Outfit, sans-serif";
  ctx.fillText(year ? year.toUpperCase() : "CONCERTS", canvas.width / 2, split + 244);

  const cols = [
    ["ARTISTS", String(stats.uniqueArtists)],
    ["VENUES", String(stats.uniqueVenues)],
    ["COUNTRIES", String(stats.uniqueCountries)],
  ];
  cols.forEach((col, i) => {
    const cx = cardX + cardW * (0.2 + i * 0.3);
    ctx.fillStyle = "#6b6156";
    ctx.font = "600 15px Outfit, sans-serif";
    ctx.fillText(col[0], cx, split + 310);
    ctx.fillStyle = "#161310";
    ctx.font = "600 46px Fraunces, Georgia, serif";
    ctx.fillText(col[1], cx, split + 360);
  });

  ctx.fillStyle = "#6b6156";
  ctx.font = "600 16px Outfit, sans-serif";
  ctx.fillText("TOP ARTISTS", canvas.width / 2, split + 420);

  ctx.textAlign = "left";
  stats.artistCounts.slice(0, 3).forEach((row, i) => {
    const yy = split + 468 + i * 44;
    ctx.fillStyle = "#161310";
    ctx.font = "italic 500 28px Fraunces, Georgia, serif";
    ctx.fillText(`\u25b8  ${row.data.name}`, cardX + 90, yy);
    ctx.textAlign = "right";
    ctx.font = "500 24px Outfit, sans-serif";
    ctx.fillText(String(row.count), cardX + cardW - 90, yy);
    ctx.textAlign = "left";
  });

  barcode(ctx, cardX + 90, cardY + cardH - 122, cardW - 180, 50);
  ctx.textAlign = "center";
  ctx.fillStyle = "#6b6156";
  ctx.font = "500 16px Outfit, sans-serif";
  ctx.fillText(`ADMIT ONE  \u2014  ARCHIVE    ${APP_DOMAIN}`, canvas.width / 2, cardY + cardH - 44);

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
