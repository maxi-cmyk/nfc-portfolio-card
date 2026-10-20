import test from "node:test";
import assert from "node:assert/strict";
import { matrixFrame } from "../src/components/led-matrix.js";
test("32x8 matrix preserves the seven-row glyphs and blank eighth row", () => {
  const frame = matrixFrame("HELLO", -1);
  assert.equal(frame.length, 256);
  assert.ok(frame.slice(224).every((value) => !value));
  assert.equal(frame[1], true);
  assert.equal(frame[2], false);
  assert.equal(frame[5], true);
  assert.ok(frame.slice(97, 102).every(Boolean));
});
test("scroll enters and exits cleanly without wrapping negative columns", () => {
  assert.ok(matrixFrame("HELLO", -32).every((value) => !value));
  assert.ok(matrixFrame("HELLO", 30).every((value) => !value));
  assert.notDeepEqual(matrixFrame("HELLO", 0), matrixFrame("HELLO", 1));
});
