import { APP_NAME } from "@/lib/brand";
import type { computeStats } from "@/lib/stats";

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = word;
      yy += lineHeight;
    } else line = test;
  }
  if (line) {
    ctx.fillText(line, x, yy);
    yy += lineHeight;
  }
  return yy;
}

export function drawShareCard(stats: ReturnType<typeof computeStats>, year?: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw card.");

  ctx.fillStyle = "#0c0b0a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#1a1814";
  ctx.beginPath();
  ctx.roundRect(64, 64, 952, 1222, 36);
  ctx.fill();

  ctx.fillStyle = "#c4b8a0";
  ctx.font = "500 28px Outfit, sans-serif";
  ctx.fillText(APP_NAME.toUpperCase(), 110, 150);

  ctx.fillStyle = "#f3efe6";
  ctx.font = "600 72px Fraunces, Georgia, serif";
  ctx.fillText(year ? year : "Live archive", 110, 240);

  ctx.fillStyle = "#f3efe6";
  ctx.font = "600 96px Fraunces, Georgia, serif";
  ctx.fillText(String(stats.totalShows), 110, 390);
  ctx.fillStyle = "#c4b8a0";
  ctx.font = "500 28px Outfit, sans-serif";
  ctx.fillText("concerts", 110, 435);

  const tiles = [
    `${stats.uniqueArtists} artists`,
    `${stats.uniqueVenues} venues`,
    `${stats.uniqueCountries} countries`,
  ];
  ctx.font = "500 32px Outfit, sans-serif";
  ctx.fillStyle = "#f3efe6";
  tiles.forEach((label, i) => ctx.fillText(label, 110 + i * 300, 520));

  let y = 620;
  ctx.fillStyle = "#8a8174";
  ctx.font = "500 22px Outfit, sans-serif";
  ctx.fillText("TOP ARTISTS", 110, y);
  y += 48;
  ctx.fillStyle = "#f3efe6";
  ctx.font = "500 36px Outfit, sans-serif";
  for (const row of stats.artistCounts.slice(0, 5)) {
    ctx.fillText(`${row.data.name}  ·  ${row.count}`, 110, y);
    y += 52;
  }

  y += 24;
  ctx.fillStyle = "#8a8174";
  ctx.font = "500 22px Outfit, sans-serif";
  ctx.fillText("COUNTRIES · GENRES", 110, y);
  y += 44;
  ctx.fillStyle = "#d7cfc2";
  ctx.font = "400 28px Outfit, sans-serif";
  const countries = stats.countryCounts.slice(0, 6).map((r) => r.data.country).join("  ·  ");
  y = wrap(ctx, countries || "—", 110, y, 860, 40);
  y += 16;
  const genres = stats.genreCounts.slice(0, 6).map((r) => r.data.genre).join("  ·  ");
  wrap(ctx, genres || "—", 110, y, 860, 40);

  ctx.fillStyle = "#8a8174";
  ctx.font = "400 22px Outfit, sans-serif";
  ctx.fillText("gighistory.app", 110, 1230);
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
