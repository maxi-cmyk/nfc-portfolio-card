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
  assert.match(html, /class="mac-art is-paper" aria-hidden="true"/);
  assert.match(html, /class="about window"/);
  for (const icon of desktopIcons) {
    assert.ok(html.includes(`data-icon="${icon.key}"`), icon.key);
  }
  // The Terminal icon is an ordinary link to #terminal, which opens the console.
  assert.match(html, /<a class="icon" data-icon="terminal" href="#terminal"/);
  assert.doesNotMatch(html, /id="terminal"|data-terminal-toggle/);
});

test("the Mac's screen text is its own path, so the console can change it", async () => {
  const { screenLines, screenPath, FONT_CHARS, SCREEN } =
    await import("../src/data/mac-screen.js");
  assert.match(html, /class="c-k mac-screen-text" d="M/);
  assert.deepEqual(screenLines(""), ["hello"]);
  assert.deepEqual(screenLines("  Projects "), ["projec"]);
  assert.deepEqual(screenLines("cat music-leds"), ["cat", "music-"]);
  assert.deepEqual(screenLines("led hi max!"), ["led", "hi max"]);
  // Every character a command can contain has a glyph, and all of it fits the screen.
  for (const char of "abcdefghijklmnopqrstuvwxyz0123456789-.:'!?,/ ") {
    assert.ok(
      FONT_CHARS.includes(char),
      `no glyph for ${JSON.stringify(char)}`,
    );
  }
  for (const text of [
    "hello",
    "w".repeat(8),
    "cat wwwwww",
    "0123456789 987654",
  ]) {
    const d = screenPath(text);
    for (const [, x, y] of d.matchAll(/M(\d+) (\d+)h\d+v1/g)) {
      assert.ok(+x >= SCREEN.x && +x < SCREEN.x + SCREEN.w, `${text}: x ${x}`);
      assert.ok(+y >= SCREEN.y && +y < SCREEN.y + SCREEN.h, `${text}: y ${y}`);
    }
  }
  assert.notEqual(screenPath("hello"), screenPath("about"));
});
