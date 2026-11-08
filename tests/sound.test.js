import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { BLIPS, soundFor } from "../src/components/sound.js";
import { getBootSteps } from "../src/terminal/boot.js";

test("every blip is short and in a comfortable range", () => {
  for (const [name, notes] of Object.entries(BLIPS)) {
    const total = notes.reduce((sum, [, ms]) => sum + ms, 0);
    assert.ok(total <= 450, `${name} lasts ${total} ms`);
    for (const [hz, ms] of notes) {
      assert.ok(hz >= 400 && hz <= 2200, `${name}: ${hz} Hz`);
      assert.ok(ms >= 20 && ms <= 200, `${name}: ${ms} ms`);
    }
  }
});

test("a press picks the right blip, and plain text makes none", () => {
  const target = (matches) => ({
    closest: (selector) => matches.some((m) => selector.includes(m)),
  });
  assert.equal(soundFor(target([".light.red"])), "close");
  assert.equal(soundFor(target([".icon"])), "open");
  assert.equal(soundFor(target([".push"])), "tap");
  assert.equal(soundFor(target([])), null);
});

test("sound is off by default and the speaker is a real, named button", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(
    html,
    /class="menubar-sound" aria-pressed="false" aria-label="Sound effects"/,
  );
});

test("the tap moment is a short bring-up log that says what the hardware is", () => {
  const steps = getBootSteps();
  assert.ok(steps.length >= 4 && steps.length <= 7);
  const text = steps.map((s) => s.text).join("\n");
  assert.match(text, /13\.56 MHz/);
  assert.match(text, /128 samples @ 6\.4 kHz/);
  assert.equal(steps.at(-1).kind, "success");
});
