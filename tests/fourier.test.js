import assert from "node:assert/strict";
import test from "node:test";
import {
  PEN_LETTERS,
  dft,
  epicycles,
  penPath,
  resample,
} from "../src/figures/fourier-math.js";

test("the pen path covers every letter of the name", () => {
  for (const letter of "MAXLEONG")
    assert.ok(PEN_LETTERS.includes(letter), letter);
  const { points, width, height } = penPath("MAX LEONG");
  assert.equal(height, 6);
  assert.ok(width > 48 && width < 60, `width ${width}`);
  for (const [x, y] of points) {
    assert.ok(x >= 0 && x <= width && y >= 0 && y <= 6);
  }
});

test("resampling keeps the path's start and spaces points evenly", () => {
  const { points } = penPath("MAX");
  const pts = resample(points, 128);
  assert.equal(pts.length, 128);
  assert.deepEqual(pts[0], points[0]);
  const gaps = pts
    .slice(1)
    .map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  assert.ok(Math.max(...gaps) < 1.2 * (Math.max(...gaps) + 0.0001));
  assert.ok(Math.max(...gaps) - Math.min(...gaps) < 0.6);
});

test("all the circles together redraw the path exactly", () => {
  const pts = resample(penPath("MAX").points, 96);
  const coeffs = dft(pts);
  for (const j of [0, 17, 48, 95]) {
    const chain = epicycles(coeffs, j / 96);
    const tip = chain.at(-1);
    assert.ok(
      Math.hypot(tip.x - pts[j][0], tip.y - pts[j][1]) < 1e-6,
      `sample ${j}`,
    );
  }
});

test("sixty circles already follow the name, and the biggest come first", () => {
  const pts = resample(penPath("MAX LEONG").points, 256);
  const coeffs = dft(pts);
  for (let i = 1; i < coeffs.length; i++)
    assert.ok(coeffs[i - 1].amp >= coeffs[i].amp);
  const errors = [];
  for (let j = 0; j < 256; j += 4) {
    const tip = epicycles(coeffs, j / 256, 60).at(-1);
    errors.push(Math.hypot(tip.x - pts[j][0], tip.y - pts[j][1]));
  }
  errors.sort((a, b) => a - b);
  // Corners and the closing jump ring a little; the typical error is about one
  // grid unit on a 54-unit-wide name.
  assert.ok(errors[Math.floor(errors.length / 2)] < 1, "median error");
  assert.ok(errors.reduce((a, b) => a + b) / errors.length < 1.5, "mean error");
});
