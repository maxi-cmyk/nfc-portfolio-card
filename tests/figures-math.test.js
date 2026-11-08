import test from "node:test";
import assert from "node:assert/strict";
import {
  BINS,
  FS,
  N,
  TONES,
  bandOf,
  binFrequency,
  centerOfMass,
  exampleSignal,
  spectrum,
  windingPoints,
} from "../src/figures/winding-math.js";
import {
  HEIGHT,
  WIDTH,
  addGlider,
  emptyBoard,
  population,
  seedBoard,
  step,
} from "../src/figures/life.js";
import {
  KINDS,
  countWrong,
  makePoints,
  mulberry32,
  transformed,
} from "../src/figures/boundary-math.js";
import {
  DELAY_MS,
  SECRET_BYTES,
  jitter,
  stairs,
} from "../src/figures/staircase-math.js";
import { FIGURES, defaultParams, figureFor } from "../src/data/figures.js";
import { allProjects } from "../src/data/projects.js";

test("the winding machine finds each tone at its own bin and nowhere else", () => {
  assert.equal(N, 128);
  assert.equal(FS, 6400);
  assert.equal(binFrequency(1), 50, "bins are 50 Hz apart");
  const spec = spectrum(exampleSignal());
  assert.equal(spec.length, BINS);
  const total = TONES.reduce((s, t) => s + t.amp, 0);
  for (const tone of TONES) {
    const k = tone.freq / 50;
    // The centre of mass is half the tone's (normalised) amplitude.
    assert.ok(
      Math.abs(spec[k] - tone.amp / 2 / total) < 1e-9,
      `${tone.freq} Hz`,
    );
  }
  const loud = spec
    .map((v, k) => [k, v])
    .filter(([, v]) => v > 1e-6)
    .map(([k]) => k);
  assert.deepEqual(
    loud,
    TONES.map((t) => t.freq / 50),
  );
});

test("winding at bin 0 is the raw signal, and the average is the DC level", () => {
  const signal = exampleSignal();
  const points = windingPoints(signal, 0);
  points.forEach(([x, y], i) => {
    assert.ok(Math.abs(x - signal[i]) < 1e-12 && Math.abs(y) < 1e-12);
  });
  const [cx] = centerOfMass(points);
  assert.ok(Math.abs(cx) < 1e-9, "the example signal has no DC offset");
});

test("each firmware band holds exactly the tone it should", () => {
  assert.equal(bandOf(150), "red");
  assert.equal(bandOf(600), "green");
  assert.equal(bandOf(1800), "blue");
  assert.equal(bandOf(0), null);
  assert.equal(bandOf(275), null, "between red and green");
  assert.equal(bandOf(3000), null, "above blue");
  assert.equal(bandOf(50), "red");
  assert.equal(bandOf(2500), "blue");
});

test("a glider travels across the wrapped board and comes home", () => {
  let cells = seedBoard();
  assert.equal(population(cells), 5);
  const start = cells.join("");
  cells = step(cells);
  assert.equal(population(cells), 5);
  // After 4 generations the glider has moved one cell down and to the right.
  let moved = seedBoard();
  for (let i = 0; i < 4; i++) moved = step(moved);
  assert.equal(moved.join(""), addGlider(emptyBoard(), 3, 2).join(""));
  // 32 columns × 8 rows: it is back where it began after lcm(32, 8) × 4 = 128 generations.
  cells = seedBoard();
  for (let i = 0; i < 128; i++) cells = step(cells);
  assert.equal(cells.join(""), start);
  assert.equal(cells.length, WIDTH * HEIGHT);
});

test("Life follows B3/S23: blinkers oscillate, blocks stay, lone cells die", () => {
  const board = emptyBoard();
  for (const x of [5, 6, 7]) board[3 * WIDTH + x] = 1;
  const flipped = step(board);
  assert.equal(population(flipped), 3);
  assert.equal(
    flipped[2 * WIDTH + 6] + flipped[3 * WIDTH + 6] + flipped[4 * WIDTH + 6],
    3,
  );
  assert.deepEqual([...step(flipped)], [...board]);
  const block = emptyBoard();
  for (const [x, y] of [
    [1, 1],
    [2, 1],
    [1, 2],
    [2, 2],
  ])
    block[y * WIDTH + x] = 1;
  assert.deepEqual([...step(block)], [...block]);
  const lone = emptyBoard();
  lone[0] = 1;
  assert.equal(population(step(lone)), 0);
  // Wrapping: a cell on one edge is a neighbour of the opposite edge.
  const wrap = emptyBoard();
  for (const y of [HEIGHT - 1, 0, 1]) wrap[y * WIDTH] = 1;
  assert.equal(step(wrap)[0 * WIDTH + 1], 1, "the seam is crossed");
});

test("the decision-boundary schematic is repeatable and mostly robust", () => {
  const a = makePoints(56, 17);
  const b = makePoints(56, 17);
  assert.deepEqual(a, b);
  assert.equal(a.length, 112);
  assert.equal(a.filter((p) => p.side < 0).length, 56);
  const rand = mulberry32(1);
  assert.ok(rand() !== rand());
  for (const kind of Object.keys(KINDS)) {
    assert.equal(
      countWrong(a, 0, kind),
      0,
      `${kind}: clean points are separated`,
    );
    assert.ok(
      countWrong(a, 1, kind) <= 5,
      `${kind}: only a handful cross at full strength`,
    );
    // Strength pulls the points toward the boundary.
    const p = a.find((q) => q.side > 0);
    assert.ok(transformed(p, 1, kind).x < p.x);
  }
});

test("the timing staircase climbs one millisecond per matching byte", () => {
  assert.equal(SECRET_BYTES, 4);
  assert.deepEqual(
    stairs(false),
    [0, 1, 2, 3, 4].map((k) => k * DELAY_MS),
  );
  assert.deepEqual(stairs(true), [0, 0, 0, 0, 0]);
  for (let i = 0; i < 5; i++) assert.ok(Math.abs(jitter(i, 12.3)) <= 0.05);
});

test("every figure has controls the page can build and a caption that says what is real", () => {
  const slugs = new Set(allProjects.map((p) => p.slug));
  for (const [slug, figure] of Object.entries(FIGURES)) {
    assert.ok(slugs.has(slug), slug);
    assert.ok(figure.id && figure.title, slug);
    assert.ok(figure.caption.length > 60, slug);
    assert.equal(figureFor(slug), figure);
    const defaults = defaultParams(figure);
    for (const control of figure.controls) {
      assert.ok(["range", "toggle", "button", "select"].includes(control.type));
      if (control.type === "range") {
        assert.ok(
          control.min <= control.value && control.value <= control.max,
          control.id,
        );
      }
      if (control.type === "select") {
        assert.ok(
          control.options.some((o) => o.value === control.value),
          control.id,
        );
      }
    }
    assert.equal(typeof defaults, "object");
  }
  assert.equal(figureFor("echo"), null);
  assert.equal(figureFor("__proto__"), null);
  // Honesty: schematics and illustrations say so; real figures are cited.
  assert.match(FIGURES.cya.caption, /schematic/i);
  assert.match(FIGURES.cya.caption, /99\.62%/);
  assert.match(FIGURES.cya.caption, /140 of 141/);
  assert.match(FIGURES["timing-attack-lab"].caption, /Illustrative/);
  assert.match(FIGURES["timing-attack-lab"].caption, /WIP/);
  assert.match(
    FIGURES["music-leds"].caption,
    /50–250 Hz red, 300–1000 Hz green, 1050–2500 Hz blue/,
  );
  assert.match(FIGURES["conway-game-of-life"].caption, /32×8/);
});
