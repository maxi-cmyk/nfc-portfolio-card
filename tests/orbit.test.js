import assert from "node:assert/strict";
import test from "node:test";
import {
  PITCH_LIMIT,
  createOrbit,
  dragOrbit,
  stepOrbit,
} from "../src/figures/orbit.js";
import { fitDistance } from "../src/figures/common.js";

test("a drag can turn a figure more than half way round", () => {
  const orbit = createOrbit();
  for (let i = 0; i < 40; i++) dragOrbit(orbit, 10, 0);
  assert.ok(orbit.yaw > Math.PI, `yaw ${orbit.yaw} should pass half a turn`);
});

test("pitch stops short of upside down", () => {
  const orbit = createOrbit();
  for (let i = 0; i < 400; i++) dragOrbit(orbit, 0, 20);
  assert.equal(orbit.pitch, PITCH_LIMIT);
  for (let i = 0; i < 800; i++) dragOrbit(orbit, 0, -20);
  assert.equal(orbit.pitch, -PITCH_LIMIT);
});

test("a flick coasts to a stop and then reports it is still", () => {
  const orbit = createOrbit();
  dragOrbit(orbit, 30, 0, 0.016);
  const turned = orbit.yaw;
  let frames = 0;
  while (stepOrbit(orbit, 0.016) && frames < 2000) frames++;
  assert.ok(frames < 2000, "never came to rest");
  assert.ok(orbit.yaw > turned, "should coast further after release");
  assert.equal(stepOrbit(orbit, 0.016), false);
});

test("it does not coast while a finger is down", () => {
  const orbit = createOrbit();
  dragOrbit(orbit, 30, 0);
  orbit.dragging = true;
  const yaw = orbit.yaw;
  stepOrbit(orbit, 0.1);
  assert.equal(orbit.yaw, yaw);
});

test("the camera distance keeps a spinning figure's sphere inside the view", () => {
  for (const aspect of [0.5, 1, 1.6, 3]) {
    const fov = 26;
    const radius = 3;
    const d = fitDistance(radius, fov, aspect);
    const vHalf = (fov / 2) * (Math.PI / 180);
    const hHalf = Math.atan(Math.tan(vHalf) * aspect);
    // The sphere's silhouette half-angle must be inside both half-angles.
    const seen = Math.asin(radius / d);
    assert.ok(seen <= Math.min(vHalf, hHalf) + 1e-9, `aspect ${aspect}`);
  }
});
