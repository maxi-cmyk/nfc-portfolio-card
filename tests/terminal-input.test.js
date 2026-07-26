import test from "node:test";
import assert from "node:assert/strict";
import {
  shouldAutoFocusTerminal,
  shouldFocusTerminalAfterQuickCommand,
} from "../terminal-input.js";

test("terminal does not autofocus on touch-first devices", () => {
  assert.equal(shouldAutoFocusTerminal(true), false);
  assert.equal(shouldAutoFocusTerminal(false), true);
});

test("quick commands keep focus away from the text input", () => {
  assert.equal(shouldFocusTerminalAfterQuickCommand(), false);
});
