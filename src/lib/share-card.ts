import { APP_DOMAIN, APP_NAME } from "@/lib/brand";
import type { computeStats } from "@/lib/stats";

function paintConcert(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const sky = ctx.createLinearGradient(x, y, x, y + h);
  sky.addColorStop(0, "#3a220c");
  sky.addColorStop(0.35, "#6a3a12");
  sky.addColorStop(0.7, "#1a1008");
  sky.addColorStop(1, "#090705");
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);

  const spots = [
    { cx: x + w * 0.18, cy: y + 28, w: 0.34 },
    { cx: x + w * 0.5, cy: y + 16, w: 0.42 },
    { cx: x + w * 0.82, cy: y + 32, w: 0.34 },
  ];
  for (const s of spots) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(s.cx - 10, s.cy);
    ctx.lineTo(s.cx + 10, s.cy);
    ctx.lineTo(s.cx + w * s.w, y + h);
    ctx.lineTo(s.cx - w * s.w, y + h);
    ctx.closePath();
    const beam = ctx.createLinearGradient(s.cx, s.cy, s.cx, y + h);
    beam.addColorStop(0, "rgba(255, 210, 110, 0.55)");
    beam.addColorStop(0.45, "rgba(210, 140, 40, 0.18)");
    beam.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = beam;
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#ffe08a";
    ctx.beginPath();
    ctx.arc(s.cx, s.cy + 10, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#0a0806";
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  for (let i = 0; i <= 18; i += 1) {
    const px = x + (w / 18) * i;
    const peak = 90 + ((i * 17) % 70);
    ctx.lineTo(px, y + h - peak);
  }
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#11100d";
  for (let i = 0; i < 14; i += 1) {
    const hx = x + 40 + i * (w / 14);
    ctx.beginPath();
    ctx.ellipse(hx, y + h - 120 - ((i * 13) % 40), 18, 70, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx, y + h - 180);
    ctx.lineTo(hx - 16, y + h - 230);
    ctx.lineTo(hx + 4, y + h - 188);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx, y + h - 180);
    ctx.lineTo(hx + 18, y + h - 236);
    ctx.lineTo(hx + 2, y + h - 188);
    ctx.fill();
  }
}

function paperGrain(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = "#f3ead8";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "rgba(140, 110, 70, 0.07)";
  for (let i = 0; i < 36; i += 1) ctx.fillRect(x, y + i * 22, w, 1);
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
  ctx.strokeStyle = "#c4b194";
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

  ctx.fillStyle = "#cbb79a";
  ctx.fillRect(0, 0, 1080, 1350);

  const x = 36;
  const y = 36;
  const w = 1008;
  const h = 1278;
  const split = 488;

  ctx.fillStyle = "#11100c";
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, 20);
  else ctx.rect(x, y, w, h);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, 20);
  else ctx.rect(x, y, w, h);
  ctx.clip();

  paintConcert(ctx, x, y, w, split - y);
  paperGrain(ctx, x, split, w, y + h - split);
  torn(ctx, split, x + 10, x + w - 10);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "#5a4e40";
  ctx.font = "bold 26px Georgia, Times New Roman, serif";
  ctx.fillText(APP_NAME.toUpperCase(), 540, split + 72);

  ctx.fillStyle = "#161310";
  ctx.font = "bold 128px Georgia, Times New Roman, serif";
  ctx.fillText(String(stats.totalShows ?? 0), 540, split + 210);

  ctx.font = "bold 36px Georgia, Times New Roman, serif";
  ctx.fillText(year ? String(year).toUpperCase() : "CONCERTS", 540, split + 258);

  const cols = [
    ["ARTISTS", String(stats.uniqueArtists ?? 0)],
    ["VENUES", String(stats.uniqueVenues ?? 0)],
    ["COUNTRIES", String(stats.uniqueCountries ?? 0)],
  ];
  cols.forEach((col, i) => {
    const cx = x + w * (0.2 + i * 0.3);
    ctx.fillStyle = "#6a5d50";
    ctx.font = "bold 18px Arial, Helvetica, sans-serif";
    ctx.fillText(col[0], cx, split + 328);
    ctx.fillStyle = "#161310";
    ctx.font = "bold 52px Georgia, Times New Roman, serif";
    ctx.fillText(col[1], cx, split + 384);
  });

  ctx.fillStyle = "#6a5d50";
  ctx.font = "bold 18px Arial, Helvetica, sans-serif";
  ctx.fillText("TOP ARTISTS", 540, split + 450);

  const top = (stats.artistCounts ?? []).slice(0, 3);
  top.forEach((row, i) => {
    const yy = split + 500 + i * 48;
    ctx.textAlign = "left";
    ctx.fillStyle = "#161310";
    ctx.font = "italic 30px Georgia, Times New Roman, serif";
    ctx.fillText(`${i + 1}.  ${row.data.name}`, x + 88, yy);
    ctx.textAlign = "right";
    ctx.font = "bold 28px Arial, Helvetica, sans-serif";
    ctx.fillText(String(row.count), x + w - 88, yy);
    ctx.textAlign = "center";
  });

  barcode(ctx, x + 90, y + h - 128, w - 180, 54);
  ctx.fillStyle = "#6a5d50";
  ctx.font = "bold 18px Arial, Helvetica, sans-serif";
  ctx.fillText(`ADMIT ONE  —  ARCHIVE    ${APP_DOMAIN}`, 540, y + h - 48);

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
