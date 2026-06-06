#!/usr/bin/env bun
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const port = Number(readFlag("--port") || Bun.env.PORT || 8080);

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".yml", "text/yaml; charset=utf-8"]
]);

Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = decodeURIComponent(url.pathname);
    const safePath = path
      .normalize(pathname)
      .replace(/^(\.\.(\/|\\|$))+/, "")
      .replace(/^\/+/, "");
    let filePath = path.join(root, safePath);

    if (!filePath.startsWith(root)) {
      return new Response("Forbidden", { status: 403 });
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(Bun.file(filePath), {
      headers: {
        "Content-Type": mimeTypes.get(path.extname(filePath)) || "application/octet-stream"
      }
    });
  }
});

console.log(`agent-readings preview: http://localhost:${port}/`);

function readFlag(name) {
  const index = Bun.argv.indexOf(name);
  if (index === -1) return undefined;
  return Bun.argv[index + 1];
}
