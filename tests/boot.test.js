import test from "node:test";
import assert from "node:assert/strict";
import {
  getBootDelay,
  getBootSteps,
  getBootTiming,
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

test("boot sequence runs at the shortened timing", () => {
  assert.deepEqual(getBootTiming(), {
    typingDelay: 22.5,
    lineDelay: 125,
    completionDelay: 500,
    exitDelay: 125,
  });
  assert.equal(getBootDelay(), 125);
});

test("typing frames reveal text one character at a time", () => {
  assert.deepEqual(getTypingFrames("pwd"), ["p", "pw", "pwd"]);
});
