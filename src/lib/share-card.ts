import { APP_DOMAIN, APP_NAME } from "@/lib/brand";
import type { computeStats } from "@/lib/stats";

function paintStage(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, "#1a140c");
  g.addColorStop(0.45, "#2a1c0c");
  g.addColorStop(1, "#0b0907");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);

  const lights = [
    { cx: x + w * 0.22, cy: y + 36, a: 0.28 },
    { cx: x + w * 0.5, cy: y + 24, a: 0.4 },
    { cx: x + w * 0.78, cy: y + 40, a: 0.26 },
  ];
  for (const light of lights) {
    const beam = ctx.createRadialGradient(light.cx, light.cy, 4, light.cx, light.cy + h * 0.35, h * 0.7);
    beam.addColorStop(0, `rgba(232, 196, 120, ${light.a})`);
    beam.addColorStop(0.4, `rgba(180, 120, 40, ${light.a * 0.35})`);
    beam.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(light.cx - 18, light.cy);
    ctx.lineTo(light.cx + 18, light.cy);
    ctx.lineTo(light.cx + w * 0.22, y + h);
    ctx.lineTo(light.cx - w * 0.22, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f0d48a";
    ctx.beginPath();
    ctx.arc(light.cx, light.cy + 8, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(10,8,6,0.55)";
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  let px = x;
  while (px < x + w) {
    const peak = 70 + ((px * 13) % 50);
    ctx.lineTo(px + 16, y + h - peak);
    ctx.lineTo(px + 32, y + h - 28);
    px += 32;
  }
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
}

function tornEdge(ctx: CanvasRenderingContext2D, y: number, left: number, right: number) {
  ctx.beginPath();
  ctx.moveTo(left, y);
  let x = left;
  let up = true;
  while (x < right) {
    const step = 14;
    ctx.lineTo(x + step / 2, y + (up ? -5 : 5));
    ctx.lineTo(x + step, y);
    x += step;
    up = !up;
  }
  ctx.strokeStyle = "#cbbba0";
  ctx.lineWidth = 3;
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

export function drawShareCard(stats: ReturnType<typeof computeStats>, year?: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw card.");

  ctx.fillStyle = "#d8cbb8";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const pad = 36;
  const cardX = pad;
  const cardY = pad;
  const cardW = canvas.width - pad * 2;
  const cardH = canvas.height - pad * 2;
  const split = 520;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 28);
  ctx.clip();

  paintStage(ctx, cardX, cardY, cardW, split - cardY);

  ctx.fillStyle = "#efe6d6";
  ctx.fillRect(cardX, split, cardW, cardY + cardH - split);

  ctx.fillStyle = "rgba(180,160,130,0.18)";
  for (let i = 0; i < 40; i += 1) {
    ctx.fillRect(cardX, split + i * 18, cardW, 1);
  }

  tornEdge(ctx, split, cardX + 12, cardX + cardW - 12);

  ctx.textAlign = "center";
  ctx.fillStyle = "#3a3228";
  ctx.font = "600 22px Outfit, sans-serif";
  ctx.fillText(APP_NAME.toUpperCase(), canvas.width / 2, split + 64);

  ctx.fillStyle = "#161310";
  ctx.font = "600 120px Fraunces, Georgia, serif";
  ctx.fillText(String(stats.totalShows), canvas.width / 2, split + 190);
  ctx.font = "600 36px Outfit, sans-serif";
  ctx.fillText(year ? year.toUpperCase() : "CONCERTS", canvas.width / 2, split + 236);

  const cols = [
    ["ARTISTS", String(stats.uniqueArtists)],
    ["VENUES", String(stats.uniqueVenues)],
    ["COUNTRIES", String(stats.uniqueCountries)],
  ];
  cols.forEach((col, i) => {
    const cx = cardX + cardW * (0.2 + i * 0.3);
    ctx.fillStyle = "#6b6156";
    ctx.font = "600 16px Outfit, sans-serif";
    ctx.fillText(col[0], cx, split + 300);
    ctx.fillStyle = "#161310";
    ctx.font = "600 44px Fraunces, Georgia, serif";
    ctx.fillText(col[1], cx, split + 348);
  });

  ctx.fillStyle = "#6b6156";
  ctx.font = "600 16px Outfit, sans-serif";
  ctx.fillText("TOP ARTISTS", canvas.width / 2, split + 410);

  ctx.textAlign = "left";
  const top = stats.artistCounts.slice(0, 3);
  top.forEach((row, i) => {
    const yy = split + 456 + i * 46;
    ctx.fillStyle = "#161310";
    ctx.font = "italic 500 28px Fraunces, Georgia, serif";
    ctx.fillText(`▸  ${row.data.name}`, cardX + 88, yy);
    ctx.textAlign = "right";
    ctx.font = "500 26px Outfit, sans-serif";
    ctx.fillText(String(row.count), cardX + cardW - 88, yy);
    ctx.textAlign = "left";
  });

  barcode(ctx, cardX + 80, cardY + cardH - 118, cardW - 160, 52);

  ctx.textAlign = "center";
  ctx.fillStyle = "#6b6156";
  ctx.font = "500 16px Outfit, sans-serif";
  ctx.fillText(`ADMIT ONE  —  ARCHIVE    ${APP_DOMAIN}`, canvas.width / 2, cardY + cardH - 42);

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
