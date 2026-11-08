import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { chooseRenderMode } from "../src/figures/mode.js";
import {
  CARD,
  approach,
  coilPoints,
  fieldLoopState,
  roundedRectPoints,
  toSegments,
} from "../src/figures/card-math.js";
import { buildVCard } from "../src/data/vcard.js";
import { renderCard } from "../src/data/icons.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("a device is given the lightest mode it can handle", () => {
  assert.equal(chooseRenderMode({}), "live");
  assert.equal(chooseRenderMode({ reducedMotion: true }), "still");
  assert.equal(chooseRenderMode({ webgl: false }), "fallback");
  assert.equal(chooseRenderMode({ saveData: true }), "fallback");
  assert.equal(chooseRenderMode({ deviceMemory: 2 }), "fallback");
  assert.equal(chooseRenderMode({ cores: 2 }), "fallback");
  assert.equal(chooseRenderMode({ deviceMemory: 8, cores: 8 }), "live");
  // No WebGL wins over everything else.
  assert.equal(
    chooseRenderMode({ webgl: false, reducedMotion: true }),
    "fallback",
  );
});

test("the antenna coil is a rectangular spiral wound inward inside the card", () => {
  const points = coilPoints({ turns: 5 });
  assert.equal(points.length, 5 * 4 + 1);
  for (const [x, y] of points) {
    assert.ok(Math.abs(x) < CARD.width / 2 && Math.abs(y) < CARD.height / 2);
  }
  const widths = points.filter((_, i) => i % 4 === 1).map(([x]) => x);
  for (let i = 1; i < widths.length; i++) assert.ok(widths[i] < widths[i - 1]);
  assert.equal(toSegments(points).length, (points.length - 1) * 4);
});

test("the card outline is a closed, symmetric rounded rectangle", () => {
  const loop = roundedRectPoints(3, 2, 0.2, 6);
  assert.equal(loop.length, 28);
  const xs = loop.map(([x]) => x);
  const ys = loop.map(([, y]) => y);
  assert.ok(Math.abs(Math.max(...xs) + Math.min(...xs)) < 1e-9);
  assert.ok(Math.abs(Math.max(...ys) + Math.min(...ys)) < 1e-9);
  assert.ok(Math.abs(Math.max(...xs) - 1.5) < 1e-9);
});

test("field loops rise, widen and fade, and stronger power makes them brighter", () => {
  for (const power of [0, 0.5, 1]) {
    for (let i = 0; i < 5; i++) {
      for (const t of [0, 0.37, 1.9, 12.4]) {
        const s = fieldLoopState(i, 5, t, power);
        assert.ok(s.z >= 0 && s.z <= 2.2, "z in range");
        assert.ok(s.scale >= 1 && s.scale <= 1.5, "scale in range");
        assert.ok(s.opacity >= 0 && s.opacity <= 0.75, "opacity in range");
      }
    }
  }
  const phases = new Set(
    Array.from({ length: 5 }, (_, i) =>
      fieldLoopState(i, 5, 0, 0.5).z.toFixed(3),
    ),
  );
  assert.equal(phases.size, 5, "loops are staggered");
  const calm = fieldLoopState(0, 5, 0.3, 0).opacity;
  const strong = fieldLoopState(0, 5, 0.3, 1).opacity;
  assert.ok(strong > calm);
});

test("easing approaches its target without overshooting", () => {
  let value = 0;
  for (let i = 0; i < 200; i++) {
    value = approach(value, 1, 0.016, 5);
    assert.ok(value <= 1);
  }
  assert.ok(value > 0.99);
  assert.equal(approach(0.4, 0.4, 0.016), 0.4);
});

test("the contact card has the public facts and nothing invented", () => {
  const card = buildVCard();
  assert.ok(card.startsWith("BEGIN:VCARD\r\nVERSION:3.0\r\n"));
  assert.ok(card.endsWith("END:VCARD\r\n"));
  assert.match(card, /FN:Max Leong/);
  assert.match(card, /https:\/\/github\.com\/maxi-cmyk/);
  assert.match(card, /linkedin\.com\/in\/maxleongruisheng/);
  assert.doesNotMatch(
    card,
    /EMAIL|TEL/,
    "email and phone are WIP, not guessed",
  );
  assert.ok(!card.replace(/\r\n/g, "").includes("\n"));
});

test("the pixel-art card is a fallback that uses theme colours only", () => {
  const svg = renderCard();
  assert.match(svg, /viewBox="0 0 48 32"/);
  assert.match(svg, /aria-hidden="true"/);
  assert.ok(!/#[0-9a-f]{3,6}/i.test(svg));
});

test("the card figure lives in the Contact window with a fallback, a caption and a contact card link", () => {
  assert.equal([...html.matchAll(/data-figure="card"/g)].length, 1);
  assert.equal([...html.matchAll(/class="figure-fallback"/g)].length, 1);
  assert.equal(
    [...html.matchAll(/data-figure-wake data-scenes-only hidden/g)].length,
    1,
    "the wake button stays hidden until scripts run",
  );
  const contact = html.slice(html.indexOf('id="contact"'));
  assert.match(contact, /data-figure="card"/);
  assert.match(contact, /13\.56 MHz/, "the figure is described in text");
  assert.match(
    html,
    /href="data:text\/vcard;charset=utf-8,[^"]+" download="Max_Leong\.vcf"/,
  );
  assert.doesNotMatch(
    html,
    /Fig\. 1 · The card/,
    "the hub no longer shows the card",
  );
  assert.doesNotMatch(html, /card-window/);
  assert.doesNotMatch(html, /<dt>Contact card<\/dt>/);
});
