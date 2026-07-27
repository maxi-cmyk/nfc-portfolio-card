import test from "node:test";
import assert from "node:assert/strict";
import {
  getBootDelay,
  getBootSteps,
  getTypingFrames,
} from "../src/terminal/boot.js";

test("boot sequence introduces the portfolio and ends online", () => {
  const steps = getBootSteps();

  assert.deepEqual(
    steps.map((step) => step.text),
    [
      "pwd",
      "/Users/max/portfolio",
      "cd portfolio",
      "ls",
      "about/projects/contact/",
      "start --portfolio",
      "System online.",
    ],
  );
  assert.equal(steps.at(-1).kind, "success");
});

test("boot sequence gives each line a deliberate reading pause", () => {
  assert.equal(getBootDelay(), 250);
});

test("typing frames reveal text one character at a time", () => {
  assert.deepEqual(getTypingFrames("pwd"), ["p", "pw", "pwd"]);
});
