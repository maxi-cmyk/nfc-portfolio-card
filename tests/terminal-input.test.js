import test from "node:test";
import assert from "node:assert/strict";
import {
  shouldAutoFocusTerminal,
  shouldFocusTerminalAfterQuickCommand,
} from "../terminal-input.js";

test("terminal does not autofocus after reveal", () => {
  assert.equal(shouldAutoFocusTerminal(), false);
});

test("quick commands keep focus away from the text input", () => {
  assert.equal(shouldFocusTerminalAfterQuickCommand(), false);
});
