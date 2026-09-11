import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  getTerminalTabAction,
  shouldAutoFocusTerminal,
  shouldFocusTerminalAfterQuickCommand,
} from "../src/terminal/input.js";

test("terminal does not autofocus after reveal", () => {
  assert.equal(shouldAutoFocusTerminal(), false);
});

test("quick commands keep focus away from the text input", () => {
  assert.equal(shouldFocusTerminalAfterQuickCommand(), false);
});

test("empty Tab follows the page's normal forward focus order", () => {
  assert.deepEqual(getTerminalTabAction(""), {
    preventDefault: false,
    autocomplete: null,
  });
  assert.equal(getTerminalTabAction("   ").preventDefault, false);
});

test("Shift+Tab always follows the page's normal backward focus order", () => {
  assert.deepEqual(getTerminalTabAction("pro", { shiftKey: true }), {
    preventDefault: false,
    autocomplete: null,
  });
});

test("non-empty Tab completes a single matching command", () => {
  const action = getTerminalTabAction("pro", {
    candidates: ["projects", "resume"],
  });

  assert.equal(action.preventDefault, true);
  assert.equal(action.autocomplete.hasMultiple, false);
  assert.equal(action.autocomplete.completion, "projects");
});

test("non-empty Tab returns suggestions for multiple matching commands", () => {
  const action = getTerminalTabAction("cat res", {
    candidates: ["cat resume", "cat resume.pdf", "projects"],
  });

  assert.equal(action.preventDefault, true);
  assert.equal(action.autocomplete.hasMultiple, true);
  assert.equal(action.autocomplete.completion, "cat resume");
  assert.deepEqual(action.autocomplete.matches, [
    "cat resume",
    "cat resume.pdf",
  ]);
});

const retroTheme = readFileSync(
  new URL("../src/styles/themes/retro-apple.css", import.meta.url),
  "utf8",
);

function getThemeToken(name) {
  const match = retroTheme.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"));
  assert.ok(match, `Expected --${name} to be a six-digit hex color`);
  return match[1];
}

function relativeLuminance(hex) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    .map((channel) => parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground, background) {
  const lighter = Math.max(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );
  const darker = Math.min(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );

  return (lighter + 0.05) / (darker + 0.05);
}

test("retro terminal placeholder meets WCAG AA normal-text contrast", () => {
  assert.ok(
    contrastRatio(getThemeToken("terminal-placeholder"), "#e7e6df") >= 4.5,
  );
});

test("retro terminal error meets WCAG AA normal-text contrast", () => {
  assert.ok(
    contrastRatio(getThemeToken("terminal-error"), getThemeToken("panel")) >=
      4.5,
  );
});
