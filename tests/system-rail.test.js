import test from "node:test";
import assert from "node:assert/strict";
import { getActiveRailTarget } from "../system-rail.js";

test("system rail selects the most visible section", () => {
  const active = getActiveRailTarget([
    {
      isIntersecting: true,
      intersectionRatio: 0.3,
      target: { id: "terminal" },
    },
    { isIntersecting: true, intersectionRatio: 0.7, target: { id: "focus" } },
    { isIntersecting: false, intersectionRatio: 0, target: { id: "contact" } },
  ]);

  assert.equal(active, "focus");
});

test("system rail returns undefined when no section is visible", () => {
  const active = getActiveRailTarget([
    { isIntersecting: false, intersectionRatio: 0, target: { id: "home" } },
  ]);

  assert.equal(active, undefined);
});
