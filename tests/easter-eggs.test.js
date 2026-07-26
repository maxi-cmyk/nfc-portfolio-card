import test from "node:test";
import assert from "node:assert/strict";
import { getMascotHint, getTerminalPlaceholder } from "../easter-eggs.js";

test("alias placeholder only appears during the teaser flash", () => {
  assert.equal(getTerminalPlaceholder(false), "type a command");
  assert.equal(getTerminalPlaceholder(true), "type alias");
});

test("mascot gives a subtle hint after three clicks", () => {
  assert.equal(getMascotHint(1), null);
  assert.equal(getMascotHint(3), "snack protocol armed");
});
