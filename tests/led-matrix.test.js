import assert from "node:assert/strict";
import test from "node:test";
import { glyphs, matrixFrame } from "../src/components/led-matrix.js";
import { LED_CHARS, LED_MAX } from "../src/terminal/hero-script.js";

test("the matrix font has every character the led command accepts", () => {
  const allowed = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ,.!?:'-"];
  for (const char of allowed) {
    assert.ok(LED_CHARS.test(char), `${char} should be accepted`);
    assert.ok(glyphs[char], `${char} has no glyph`);
    assert.equal(glyphs[char].length, 7, `${char} is not 7 rows`);
    for (const row of glyphs[char]) assert.match(row, /^[01]{5}$/, char);
  }
});

test("every drawn glyph lights at least one dot, and space lights none", () => {
  for (const [char, rows] of Object.entries(glyphs)) {
    const lit = rows.join("").includes("1");
    assert.equal(lit, char !== " ", char);
  }
  assert.equal(matrixFrame(" ", 0).some(Boolean), false);
  assert.ok(matrixFrame("A", 0).some(Boolean));
});

test("the longest message still scrolls through the 32-column matrix", () => {
  const text = "A".repeat(LED_MAX);
  assert.ok(matrixFrame(text, 0).length === 256);
  assert.ok(matrixFrame(text, LED_MAX * 6 - 5).some(Boolean));
});
