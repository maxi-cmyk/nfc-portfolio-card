import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ICON_NAMES,
  desktopIcons,
  renderIcon,
  renderMac,
} from "../src/data/icons.js";
import { parseRoute } from "../src/navigation/routes.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const KNOWN = new Set(["k", "p", "w", "g", "n", "m", "s"]);

test("every icon is a crisp 32×32 SVG that uses only theme colour classes", () => {
  for (const name of ICON_NAMES) {
    const svg = renderIcon(name);
    assert.match(svg, /viewBox="0 0 32 32"/, name);
    assert.match(svg, /shape-rendering="crispEdges"/, name);
    assert.match(svg, /aria-hidden="true"/, name);
    const classes = [...svg.matchAll(/class="c-(\w)"/g)].map((m) => m[1]);
    assert.ok(classes.length >= 3, name);
    for (const c of classes) assert.ok(KNOWN.has(c), `${name}: c-${c}`);
    assert.ok(!/#[0-9a-f]{3,6}/i.test(svg), `${name}: hard-coded colour`);
  }
});

test("the icons and the compact computer are drawn deterministically", () => {
  for (const name of ICON_NAMES)
    assert.equal(renderIcon(name), renderIcon(name));
  const mac = renderMac();
  assert.match(mac, /viewBox="0 0 64 56"/);
  assert.equal(mac, renderMac());
});

test("every desktop icon opens a real scene, the terminal, or the resume", () => {
  const keys = new Set();
  for (const icon of desktopIcons) {
    assert.ok(!keys.has(icon.key), icon.key);
    keys.add(icon.key);
    assert.ok(ICON_NAMES.includes(icon.icon), icon.key);
    if (icon.terminal) continue;
    if (icon.download) {
      assert.equal(icon.href, "/assets/Max_Leong_Resume.pdf");
    } else {
      assert.notEqual(parseRoute(icon.href).kind, "missing", icon.href);
    }
  }
  assert.ok(keys.has("terminal") && keys.has("resume") && keys.has("contact"));
});

test("the static page has the desktop, its icons and the About window", () => {
  assert.match(html, /<nav class="desktop-icons"/);
  assert.match(html, /class="mac-art" aria-hidden="true"/);
  assert.match(html, /class="about window"/);
  for (const icon of desktopIcons) {
    assert.ok(html.includes(`data-icon="${icon.key}"`), icon.key);
  }
  // The terminal icon is hidden until scripts can make it work.
  assert.match(
    html,
    /data-icon="terminal"[^>]*data-terminal-toggle[^>]*hidden/,
  );
});
