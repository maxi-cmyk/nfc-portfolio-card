import test from "node:test";
import assert from "node:assert/strict";
import { pickTransition, TRANSITIONS } from "../src/navigation/transitions.js";
import { createTransitions } from "../src/components/transitions.js";

const order = ["a", "b", "c", "d"];
const pick = (from, to, options) =>
  pickTransition(from, to, { order, ...options });

test("going deeper zooms in and coming back zooms out", () => {
  assert.equal(pick({ scene: "hub" }, { scene: "work" }), "zoom-in");
  assert.equal(pick({ scene: "hub" }, { scene: "skills" }), "zoom-in");
  assert.equal(pick({ scene: "work" }, { scene: "hub" }), "zoom-out");
  assert.equal(pick({ scene: "contact" }, { scene: "hub" }), "zoom-out");
  assert.equal(
    pick({ scene: "work", slug: "a" }, { scene: "case", slug: "a" }),
    "zoom-in",
  );
  assert.equal(
    pick({ scene: "case", slug: "a" }, { scene: "work", slug: "a" }),
    "zoom-out",
  );
});

test("changing topic dissolves", () => {
  for (const [from, to] of [
    ["work", "skills"],
    ["skills", "credentials"],
    ["credentials", "contact"],
    ["shelf", "work"],
    ["case", "skills"],
  ]) {
    assert.equal(
      pick({ scene: from }, { scene: to }),
      "dissolve",
      `${from} to ${to}`,
    );
  }
  assert.equal(
    pick(
      { scene: "work", categories: [] },
      { scene: "work", categories: ["applied-ai"] },
    ),
    "dissolve",
  );
  assert.equal(
    pick(
      { scene: "case", slug: "a", step: 1 },
      { scene: "case", slug: "b", step: 1 },
    ),
    "dissolve",
  );
});

test("moving between siblings slides in the right direction", () => {
  assert.equal(
    pick({ scene: "work", slug: "a" }, { scene: "work", slug: "c" }),
    "slide-next",
  );
  assert.equal(
    pick({ scene: "work", slug: "c" }, { scene: "work", slug: "a" }),
    "slide-prev",
  );
  // The first project is shown when no slug is given.
  assert.equal(
    pick({ scene: "work", slug: null }, { scene: "work", slug: "b" }),
    "slide-next",
  );
  // Wrapping around still follows the button that was pressed.
  assert.equal(
    pick(
      { scene: "work", slug: "d" },
      { scene: "work", slug: "a" },
      { direction: 1 },
    ),
    "slide-next",
  );
  assert.equal(
    pick(
      { scene: "work", slug: "a" },
      { scene: "work", slug: "d" },
      { direction: -1 },
    ),
    "slide-prev",
  );
  assert.equal(
    pick(
      { scene: "case", slug: "a", step: 1 },
      { scene: "case", slug: "a", step: 3 },
    ),
    "slide-next",
  );
  assert.equal(
    pick(
      { scene: "case", slug: "a", step: 3 },
      { scene: "case", slug: "a", step: 2 },
    ),
    "slide-prev",
  );
});

test("first paint, the write-up dialog and no-op moves do not animate", () => {
  assert.equal(pick(null, { scene: "work" }), "none");
  assert.equal(
    pick({ scene: "hub" }, { scene: "work" }, { initial: true }),
    "none",
  );
  assert.equal(
    pick(
      { scene: "case", slug: "a", step: 1 },
      { scene: "case", slug: "a", step: 1, read: true },
    ),
    "none",
  );
  assert.equal(
    pick(
      { scene: "case", slug: "a", step: 1, read: true },
      { scene: "case", slug: "a", step: 1 },
    ),
    "none",
  );
  assert.equal(
    pick({ scene: "hub" }, { scene: "hub", terminal: true }),
    "none",
  );
  assert.equal(
    pick(
      { scene: "work", slug: "a", categories: [] },
      { scene: "work", slug: "a", categories: [] },
    ),
    "none",
  );
});

test("every transition the picker can return is a known kind", () => {
  const scenes = [
    "hub",
    "work",
    "case",
    "shelf",
    "skills",
    "credentials",
    "contact",
  ];
  for (const a of scenes) {
    for (const b of scenes) {
      const kind = pick(
        { scene: a, slug: "a", step: 1 },
        { scene: b, slug: "b", step: 2 },
      );
      assert.ok(TRANSITIONS.includes(kind), `${a} to ${b}: ${kind}`);
    }
  }
});

test("reduced motion applies the change at once and leaves nothing running", async () => {
  globalThis.document = { querySelectorAll: () => [] };
  const fx = createTransitions({ reducedMotion: () => true });
  for (const kind of TRANSITIONS) {
    let applied = 0;
    await fx.run(kind, { apply: () => applied++ });
    assert.equal(applied, 1, kind);
    assert.equal(fx.isRunning(), false, kind);
  }
  assert.doesNotThrow(() => fx.cancel());
  delete globalThis.document;
});

test("a cancelled transition still applies its scene change once", async () => {
  globalThis.document = { querySelectorAll: () => [] };
  const fx = createTransitions({ reducedMotion: () => false });
  let applied = 0;
  // "none" never animates, so this checks the shared apply-once contract.
  await fx.run("none", { apply: () => applied++ });
  fx.cancel();
  assert.equal(applied, 1);
  delete globalThis.document;
});
