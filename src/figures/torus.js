// Figure 4: Conway's Game of Life on a torus. The 32×8 board is wrapped so
// that gliders leaving one edge return at the opposite one, exactly as the
// firmware's board does. The rules and the wrapping come from life.js.
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  MeshBasicMaterial,
  Vector3,
} from "three";
import { approach } from "./card-math.js";
import { baseFigure, colorsFrom, fitCamera } from "./common.js";
import {
  HEIGHT,
  WIDTH,
  addGlider,
  population,
  seedBoard,
  step,
} from "./life.js";

const MAJOR = 1.45;
const MINOR = 0.62;
const TICK = 0.17; // seconds per generation

function surface(u, v) {
  const ring = MAJOR + MINOR * Math.cos(v);
  const position = new Vector3(
    ring * Math.cos(u),
    ring * Math.sin(u),
    MINOR * Math.sin(v),
  );
  const eu = new Vector3(-Math.sin(u), Math.cos(u), 0);
  const ev = new Vector3(
    -Math.sin(v) * Math.cos(u),
    -Math.sin(v) * Math.sin(u),
    Math.cos(v),
  );
  const normal = new Vector3(
    Math.cos(v) * Math.cos(u),
    Math.cos(v) * Math.sin(u),
    Math.sin(v),
  );
  return { position, eu, ev, normal };
}

export function createTorusFigure(palette) {
  const colors = colorsFrom(palette);
  const { scene, camera, group, baseFov } = baseFigure(28, 8.6);
  const torus = group;
  let cells = seedBoard();
  let generation = 0;
  let accumulator = 0;
  let gliders = 0;

  // The wire of the board: a loop for every column edge and every row edge.
  const lines = [];
  const loop = (fn, count) => {
    for (let i = 0; i < count; i++) {
      const a = fn(i / count);
      const b = fn((i + 1) / count);
      lines.push(...a.toArray(), ...b.toArray());
    }
  };
  for (let i = 0; i < WIDTH; i++) {
    const u = (i / WIDTH) * Math.PI * 2;
    loop((t) => surface(u, t * Math.PI * 2).position, 24);
  }
  for (let j = 0; j < HEIGHT; j++) {
    const v = (j / HEIGHT) * Math.PI * 2;
    loop((t) => surface(t * Math.PI * 2, v).position, 96);
  }
  torus.add(
    new LineSegments(
      new BufferGeometry().setAttribute(
        "position",
        new Float32BufferAttribute(lines, 3),
      ),
      new LineBasicMaterial({
        color: colors.muted,
        transparent: true,
        opacity: 0.32,
      }),
    ),
  );

  // One instance per cell, lying on the surface; live cells grow, dead ones shrink.
  const mesh = new InstancedMesh(
    new BoxGeometry(1, 1, 1),
    new MeshBasicMaterial({ color: 0xffffff }),
    WIDTH * HEIGHT,
  );
  const frames = [];
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      frames.push(
        surface(
          ((x + 0.5) / WIDTH) * Math.PI * 2,
          ((y + 0.5) / HEIGHT) * Math.PI * 2,
        ),
      );
    }
  }
  const size = new Float32Array(WIDTH * HEIGHT);
  const born = new Float32Array(WIDTH * HEIGHT);
  const matrix = new Matrix4();
  const tmpU = new Vector3();
  const tmpV = new Vector3();
  const tmpN = new Vector3();
  const tmpP = new Vector3();
  const tmpC = new Color();
  const cu = (2 * Math.PI * (MAJOR + MINOR)) / WIDTH;
  const cv = (2 * Math.PI * MINOR) / HEIGHT;
  const paint = (i) => {
    const f = frames[i];
    const k = size[i];
    matrix.makeBasis(
      tmpU.copy(f.eu).multiplyScalar(cu * 0.78 * k),
      tmpV.copy(f.ev).multiplyScalar(cv * 0.78 * k),
      tmpN.copy(f.normal).multiplyScalar(0.12 * k),
    );
    matrix.setPosition(tmpP.copy(f.position).addScaledVector(f.normal, 0.05));
    mesh.setMatrixAt(i, matrix);
    mesh.setColorAt(
      i,
      tmpC.copy(colors.navy).lerp(colors.plum, Math.max(0, born[i])),
    );
  };
  for (let i = 0; i < size.length; i++) {
    size[i] = cells[i];
    paint(i);
  }
  torus.add(mesh);
  torus.rotation.x = 1.05;

  return {
    scene,
    camera,
    set(id) {
      if (id === "reset") {
        cells = seedBoard();
        generation = 0;
        gliders = 0;
      } else if (id === "glider") {
        gliders += 1;
        // Spread new gliders around the board in a fixed pattern.
        addGlider(cells, (gliders * 11 + 5) % WIDTH, (gliders * 3) % HEIGHT);
      }
    },
    setStep() {},
    params: () => ({}),
    readout: () => `Generation ${generation} · ${population(cells)} live cells`,
    setSize(width, height) {
      fitCamera(camera, baseFov, width, height);
    },
    update({ dt, pointer, still, time }) {
      if (!still) {
        accumulator += dt;
        while (accumulator >= TICK) {
          accumulator -= TICK;
          const next = step(cells);
          for (let i = 0; i < next.length; i++)
            if (next[i] && !cells[i]) born[i] = 1;
          cells = next;
          generation += 1;
          // Start again if the board dies out.
          if (population(cells) === 0) {
            cells = seedBoard();
            generation = 0;
          }
        }
      }
      for (let i = 0; i < size.length; i++) {
        const target = cells[i];
        size[i] = still ? target : approach(size[i], target, dt, 14);
        born[i] = Math.max(0, born[i] - dt * 2);
        paint(i);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      torus.rotation.z = (still ? 0.4 : time * 0.12) + pointer.x * 0.5;
      torus.rotation.x = 1.05 - pointer.y * 0.3;
    },
  };
}
