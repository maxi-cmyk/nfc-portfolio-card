// Figure 3: the timing staircase (timing-attack-lab), drawn from the lab's
// design. Response time climbs one step per matching byte; the constant-time
// comparison flattens it.
import {
  BoxGeometry,
  BufferGeometry,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
} from "three";
import { approach } from "./card-math.js";
import { baseFigure, colorsFrom, fitCamera } from "./common.js";
import { SECRET_BYTES, jitter, stairs } from "./staircase-math.js";

const UNIT = 0.5; // scene height per millisecond
const FLOOR = -1.2;
const FLAT = 0.3; // the base response time, drawn as a short bar

export function createStaircaseFigure(palette) {
  const colors = colorsFrom(palette);
  const { scene, camera, group, baseFov } = baseFigure(26, 9);
  const state = { fixed: false };
  const bars = [];
  for (let k = 0; k <= SECRET_BYTES; k++) {
    const box = new BoxGeometry(0.62, 1, 0.62);
    const holder = new Group();
    holder.add(new Mesh(box, new MeshBasicMaterial({ color: colors.paper })));
    holder.add(
      new LineSegments(
        new EdgesGeometry(box),
        new LineBasicMaterial({ color: colors.navy }),
      ),
    );
    holder.position.x = (k - SECRET_BYTES / 2) * 1.05;
    group.add(holder);
    bars.push({ holder, height: FLAT });
  }
  // Floor line and a tick under each bar.
  const ticks = [];
  for (let k = 0; k <= SECRET_BYTES; k++) {
    const x = (k - SECRET_BYTES / 2) * 1.05;
    ticks.push(x, FLOOR - 0.05, 0.4, x, FLOOR - 0.2, 0.4);
  }
  ticks.push(-2.6, FLOOR, 0.4, 2.6, FLOOR, 0.4);
  group.add(
    new LineSegments(
      new BufferGeometry().setAttribute(
        "position",
        new Float32BufferAttribute(ticks, 3),
      ),
      new LineBasicMaterial({ color: colors.ink }),
    ),
  );
  // The level a constant-time comparison would give.
  group.add(
    new LineSegments(
      new BufferGeometry().setAttribute(
        "position",
        new Float32BufferAttribute(
          [-2.6, FLOOR + FLAT, 0.4, 2.6, FLOOR + FLAT, 0.4],
          3,
        ),
      ),
      new LineBasicMaterial({
        color: colors.plum,
        transparent: true,
        opacity: 0.7,
      }),
    ),
  );

  return {
    scene,
    camera,
    set(id, value) {
      if (id === "fixed") state.fixed = Boolean(value);
    },
    setStep(step) {
      state.fixed = step === 4;
    },
    params: () => ({ fixed: state.fixed }),
    readout: () =>
      state.fixed
        ? "Constant-time: every guess takes the same time, so timing reveals nothing."
        : "Vulnerable: each correct byte adds about 1 ms (the lab's default delay), so the slowest guess is the right one.",
    setSize(width, height) {
      fitCamera(camera, baseFov, width, height);
    },
    update({ dt, pointer, still, time }) {
      const target = stairs(state.fixed);
      bars.forEach((bar, k) => {
        const wanted =
          FLAT + target[k] * UNIT + (still ? 0 : jitter(k, time) * 0.5);
        bar.height = still
          ? FLAT + target[k] * UNIT
          : approach(bar.height, wanted, dt, 7);
        bar.holder.scale.y = Math.max(bar.height, 0.02);
        bar.holder.position.y = FLOOR + bar.height / 2;
      });
      group.rotation.y = -0.5 + pointer.x * 0.3;
      group.rotation.x = 0.22 - pointer.y * 0.15;
    },
  };
}
