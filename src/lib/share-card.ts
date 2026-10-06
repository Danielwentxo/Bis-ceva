import { APP_DOMAIN, APP_NAME } from "@/lib/brand";
import type { computeStats } from "@/lib/stats";

let ticketPhoto: HTMLImageElement | null = null;

async function loadTicketPhoto(): Promise<HTMLImageElement | null> {
  if (ticketPhoto && ticketPhoto.naturalWidth > 10) return ticketPhoto;
  if (typeof Image === "undefined") return null;
  const img = new Image();
  img.src = "/hero.jpg";
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
  canvas.width = 1080;
  canvas.height = 1620;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw stats.");

  ctx.fillStyle = "#070605";
  ctx.fillRect(0, 0, 1080, 1620);
  if (ticketPhoto && ticketPhoto.naturalWidth > 10) coverPhoto(ctx, ticketPhoto, 0, 0, 1080, 1620);
  else paintStage(ctx);
  const shade = ctx.createLinearGradient(0, 0, 0, 1620);
  shade.addColorStop(0, "rgba(0,0,0,0.35)");
  shade.addColorStop(0.45, "rgba(0,0,0,0.25)");
  shade.addColorStop(1, "rgba(0,0,0,0.82)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, 1080, 1620);

  ctx.fillStyle = "#e7e1d6";
  ctx.fillRect(0, 0, 92, 1620);
  ctx.fillStyle = "#111";
  for (let y = 18; y < 1600; y += 28) {
    ctx.beginPath();
    ctx.arc(0, y, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.save();
  ctx.translate(46, 980);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "#1a1a1a";
  ctx.font = "bold 22px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(APP_NAME.toUpperCase(), 0, 0);
  ctx.restore();

  ctx.textAlign = "center";
  ctx.fillStyle = "#e23b3b";
  ctx.font = "bold 22px Arial, Helvetica, sans-serif";
  ctx.fillText(APP_NAME.toUpperCase(), 580, 150);
  ctx.strokeStyle = "#e23b3b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(250, 142);
  ctx.lineTo(390, 142);
  ctx.moveTo(770, 142);
  ctx.lineTo(910, 142);
  ctx.stroke();

  ctx.fillStyle = "#f4f1ea";
  ctx.font = "bold 108px Impact, Arial Black, sans-serif";
  ctx.fillText("My year", 580, 310);
  ctx.fillText("in shows", 580, 420);

  ctx.fillStyle = "#e23b3b";
  ctx.font = "bold 20px Arial, Helvetica, sans-serif";
  ctx.fillText("TOP 3 ARTISTS", 580, 490);
  ctx.beginPath();
  ctx.moveTo(250, 484);
  ctx.lineTo(400, 484);
  ctx.moveTo(760, 484);
  ctx.lineTo(910, 484);
  ctx.stroke();

  const top = (stats.artistCounts ?? []).slice(0, 3);
  ctx.fillStyle = "#f4f1ea";
  ctx.font = "bold 46px Arial, Helvetica, sans-serif";
  top.forEach((row, i) => ctx.fillText(row.data.name, 580, 570 + i * 64));

  ctx.fillStyle = "rgba(0,0,0,0.82)";
  ctx.fillRect(92, 1260, 988, 360);
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 2;
  for (const x of [330, 560, 790]) {
    ctx.beginPath();
    ctx.moveTo(x, 1320);
    ctx.lineTo(x, 1540);
    ctx.stroke();
  }
  const pills = [
    [String(stats.totalShows ?? 0), "SHOWS", "ticket"],
    [String(stats.uniqueCountries ?? 0), "COUNTRIES", "globe"],
    [String(stats.uniqueVenues ?? 0), "VENUES", "pin"],
    [String(stats.uniqueArtists ?? 0), "BANDS", "pick"],
  ] as const;
  pills.forEach((pill, i) => {
    const cx = 210 + i * 230;
    drawMark(ctx, pill[2], cx, 1348);
    ctx.fillStyle = "#f4f1ea";
    ctx.font = "bold 72px Impact, Arial Black, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(pill[0], cx, 1465);
    ctx.fillStyle = "#b9b3aa";
    ctx.font = "bold 18px Arial, Helvetica, sans-serif";
    ctx.fillText(pill[1], cx, 1504);
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
