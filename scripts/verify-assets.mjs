import { readFileSync, readdirSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { certificates } from "../src/data/certificates.js";
const html = readFileSync("dist/index.html", "utf8");
const paths = new Set(
  [...html.matchAll(/(?:href|src|content)="(\/assets\/[^"?#]+)"/g)].map(
    (m) => m[1],
  ),
);
for (const c of certificates) {
  paths.add(c.pdfUrl);
  paths.add(c.previewUrl);
}
for (const path of paths) {
  const file = `dist${path}`;
  if (!statSync(file).size) throw new Error(`Empty public asset: ${file}`);
  const data = readFileSync(file);
  if (file.endsWith(".pdf") && data.subarray(0, 5).toString() !== "%PDF-")
    throw new Error(`Invalid PDF: ${file}`);
}
// JavaScript budgets, gzipped. The main bundle is on the critical path; the 3D
// stage (three.js) loads lazily, only when a figure is on screen.
const MAIN_BUDGET = 40 * 1024;
const LAZY_BUDGET = 160 * 1024;
const mainFile = html.match(/src="\/assets\/(index-[^"]+\.js)"/)?.[1];
for (const name of readdirSync("dist/assets").filter((n) =>
  n.endsWith(".js"),
)) {
  const size = gzipSync(readFileSync(`dist/assets/${name}`), {
    level: 9,
  }).length;
  const limit = name === mainFile ? MAIN_BUDGET : LAZY_BUDGET;
  if (size > limit) {
    throw new Error(
      `${name} is ${(size / 1024).toFixed(1)} kB gzipped, over its ${(limit / 1024).toFixed(0)} kB budget`,
    );
  }
}
if (!html.includes('id="work"') || !html.includes('class="static-case-study"'))
  throw new Error("Missing static portfolio content");
console.log(
  `Verified ${paths.size} public assets and static fallback content.`,
);
