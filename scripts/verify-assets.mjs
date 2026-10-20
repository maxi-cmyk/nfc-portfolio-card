import { readFileSync, statSync } from "node:fs";
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
if (!html.includes('id="work"') || !html.includes('class="static-case-study"'))
  throw new Error("Missing static portfolio content");
console.log(
  `Verified ${paths.size} public assets and static fallback content.`,
);
