import test from "node:test";
import assert from "node:assert/strict";
import { getLatestResultScrollOptions } from "../src/terminal/scroll.js";

test("new terminal results are centered in view", () => {
  assert.deepEqual(getLatestResultScrollOptions(false), {
    behavior: "smooth",
    block: "center",
    inline: "nearest",
  });
});

test("reduced-motion users get an immediate centered result scroll", () => {
  assert.deepEqual(getLatestResultScrollOptions(true), {
    behavior: "auto",
    block: "center",
    inline: "nearest",
  });
});
