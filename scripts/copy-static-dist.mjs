import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const from = join(root, ".vercel", "output", "static");
const to = join(root, "dist");

mkdirSync(to, { recursive: true });

if (existsSync(from)) {
  cpSync(from, to, { recursive: true });
  console.log("[copy-static-dist] copied .vercel/output/static -> dist");
} else {
  console.warn("[copy-static-dist] .vercel/output/static missing after build");
}

if (!existsSync(join(to, "index.html"))) {
  writeFileSync(
    join(to, "index.html"),
    "<!doctype html><html lang=\"ro\"><head><meta charset=\"utf-8\"/><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/><title>Bis</title></head><body style=\"font-family:sans-serif;background:#0c0b0a;color:#eee;display:grid;place-items:center;min-height:100vh\"><p>Build-ul nu a generat pagina aplicației.</p></body></html>\n",
  );
  console.warn("[copy-static-dist] wrote fallback dist/index.html");
}
