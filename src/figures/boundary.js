// Figure 5: the decision boundary (cya), a schematic of the idea and not real
// embeddings. Authentic and AI-generated images sit either side of a plane; a
// transformation pulls them toward it. Points that cross are drawn in red.
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  LineLoop,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Points,
  PointsMaterial,
  DoubleSide,
} from "three";
import { approach } from "./card-math.js";
import { baseFigure, colorsFrom, fitCamera } from "./common.js";
import {
  countWrong,
  makePoints,
  transformed,
  wrongSide,
} from "./boundary-math.js";

const WRONG = new Color("#d83a3a");

export function createBoundaryFigure(palette) {
  const colors = colorsFrom(palette);
  const { scene, camera, group, baseFov } = baseFigure(28, 8.4);
  const points = makePoints();
  const state = { strength: 0.3, kind: "jpeg", shown: 0.3 };
  const current = points.map((p) => ({ x: p.x, y: p.y, z: p.z }));

  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new Float32BufferAttribute(new Float32Array(points.length * 3), 3),
  );
  geometry.setAttribute(
    "color",
    new Float32BufferAttribute(new Float32Array(points.length * 3), 3),
  );
  const cloud = new Points(
    geometry,
    new PointsMaterial({ size: 6, sizeAttenuation: false, vertexColors: true }),
  );
  group.add(cloud);

  // The boundary: a faint plane with a hairline frame.
  const plane = new Mesh(
    new PlaneGeometry(2.8, 2.6),
    new MeshBasicMaterial({
      color: colors.acid,
      transparent: true,
      opacity: 0.07,
      side: DoubleSide,
    }),
  );
  plane.rotation.y = Math.PI / 2;
  group.add(plane);
  group.add(
    new LineLoop(
      new BufferGeometry().setAttribute(
        "position",
        new Float32BufferAttribute(
          [0, -1.3, -1.4, 0, -1.3, 1.4, 0, 1.3, 1.4, 0, 1.3, -1.4],
          3,
        ),
      ),
      new LineBasicMaterial({ color: colors.acid }),
    ),
  );

  let wrong = 0;
  function paint(progress) {
    const pos = geometry.attributes.position.array;
    const col = geometry.attributes.color.array;
    wrong = 0;
    points.forEach((p, i) => {
      const target = transformed(p, progress, state.kind);
      const c = current[i];
      c.x = target.x;
      c.y = target.y;
      c.z = target.z;
      pos.set([c.x, c.y, c.z], i * 3);
      const bad = wrongSide(p, c);
      if (bad) wrong += 1;
      const color = bad ? WRONG : p.side < 0 ? colors.navy : colors.plum;
      col.set([color.r, color.g, color.b], i * 3);
    });
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  }
  paint(state.shown);

  return {
    scene,
    camera,
    set(id, value) {
      if (id === "strength") state.strength = value / 100;
      else if (id === "kind") state.kind = value;
    },
    setStep(step) {
      state.strength = step === 3 ? 0.85 : 0.3;
    },
    params: () => ({
      strength: Math.round(state.strength * 100),
      kind: state.kind,
    }),
    readout: () =>
      `${wrong} of ${points.length} points on the wrong side at ${Math.round(state.strength * 100)}% ${state.kind}`,
    setSize(width, height) {
      fitCamera(camera, baseFov, width, height);
    },
    update({ dt, pointer, still, time }) {
      state.shown = still
        ? state.strength
        : approach(state.shown, state.strength, dt, 6);
      paint(state.shown);
      group.rotation.y =
        -0.6 + pointer.x * 0.4 + (still ? 0 : Math.sin(time * 0.3) * 0.1);
      group.rotation.x = 0.25 - pointer.y * 0.2;
    },
  };
}

void countWrong;
