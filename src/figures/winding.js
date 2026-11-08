// Figure 2: the winding machine (music_LED). A signal is wound around an axis
// at a chosen frequency; the centre of mass of the wound curve is the Fourier
// coefficient, and the LED takes the colour of the firmware band it falls in.
import {
  BufferGeometry,
  Color,
  Group,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
} from "three";
import { approach } from "./card-math.js";
import { LED, baseFigure, colorsFrom, fitCamera } from "./common.js";
import {
  BINS,
  N,
  bandOf,
  binFrequency,
  centerOfMass,
  exampleSignal,
  spectrum,
  windingPoints,
} from "./winding-math.js";

const RADIUS = 1.0;
const HEIGHT = 2.4;
const GAIN = 3; // the centre of mass is small, so it is drawn ×3

export function createWindingFigure(palette) {
  const colors = colorsFrom(palette);
  const { scene, camera, group, baseFov } = baseFigure(24, 9);
  const signal = exampleSignal();
  const spec = spectrum(signal);
  const maxMag = Math.max(...spec);
  const state = { bin: 3, auto: true, shown: 3, step: 1 };
  // The wound curve sits above the spectrum so the two never overlap.
  const curve = new Group();
  curve.position.set(-0.25, 0.5, 0);
  group.add(curve);

  // The wound curve.
  const helixGeometry = new BufferGeometry();
  helixGeometry.setAttribute(
    "position",
    new Float32BufferAttribute(new Float32Array(N * 3), 3),
  );
  const helix = new Line(
    helixGeometry,
    new LineBasicMaterial({ color: colors.navy }),
  );
  curve.add(helix);

  const axis = new Line(
    new BufferGeometry().setAttribute(
      "position",
      new Float32BufferAttribute(
        [0, 0, -HEIGHT / 2 - 0.2, 0, 0, HEIGHT / 2 + 0.2],
        3,
      ),
    ),
    new LineBasicMaterial({
      color: colors.muted,
      transparent: true,
      opacity: 0.6,
    }),
  );
  curve.add(axis);

  const ring = Array.from({ length: 64 }, (_, i) => {
    const a = (i / 64) * Math.PI * 2;
    return [Math.cos(a) * RADIUS, Math.sin(a) * RADIUS, HEIGHT / 2 + 0.05];
  });
  curve.add(
    new LineLoop(
      new BufferGeometry().setAttribute(
        "position",
        new Float32BufferAttribute(ring.flat(), 3),
      ),
      new LineBasicMaterial({
        color: colors.muted,
        transparent: true,
        opacity: 0.35,
      }),
    ),
  );

  // The centre of mass, at the front of the curve.
  const com = new Mesh(
    new SphereGeometry(0.075, 12, 8),
    new MeshBasicMaterial({ color: colors.plum }),
  );
  curve.add(com);
  const comLine = new Line(
    new BufferGeometry().setAttribute(
      "position",
      new Float32BufferAttribute(new Float32Array(6), 3),
    ),
    new LineBasicMaterial({ color: colors.plum }),
  );
  curve.add(comLine);

  // The spectrum behind the curve, bars coloured by firmware band.
  const bars = { red: [], green: [], blue: [], rest: [] };
  const base = -1.7;
  const zBack = 0.3;
  for (let k = 0; k < BINS; k++) {
    const x = -1.85 + (k / (BINS - 1)) * 3.7;
    const h = (spec[k] / maxMag) * 0.8;
    (bars[bandOf(binFrequency(k))] ?? bars.rest).push(
      x,
      base,
      zBack,
      x,
      base + Math.max(h, 0.02),
      zBack,
    );
  }
  const barColor = {
    red: LED.red,
    green: LED.green,
    blue: LED.blue,
    rest: palette.muted,
  };
  for (const [name, positions] of Object.entries(bars)) {
    if (!positions.length) continue;
    group.add(
      new LineSegments(
        new BufferGeometry().setAttribute(
          "position",
          new Float32BufferAttribute(positions, 3),
        ),
        new LineBasicMaterial({ color: new Color(barColor[name]) }),
      ),
    );
  }
  group.add(
    new Line(
      new BufferGeometry().setAttribute(
        "position",
        new Float32BufferAttribute([-1.9, base, zBack, 1.9, base, zBack], 3),
      ),
      new LineBasicMaterial({ color: colors.ink }),
    ),
  );
  const cursor = new LineSegments(
    new BufferGeometry().setAttribute(
      "position",
      new Float32BufferAttribute(new Float32Array(12), 3),
    ),
    new LineBasicMaterial({ color: colors.acid }),
  );
  group.add(cursor);

  // The LED.
  const led = new Mesh(
    new SphereGeometry(0.2, 16, 12),
    new MeshBasicMaterial({ color: colors.muted }),
  );
  led.position.set(1.85, 1.45, 0);
  group.add(led);
  group.add(
    new LineLoop(
      new BufferGeometry().setAttribute(
        "position",
        new Float32BufferAttribute(
          Array.from({ length: 32 }, (_, i) => {
            const a = (i / 32) * Math.PI * 2;
            return [1.85 + Math.cos(a) * 0.3, 1.45 + Math.sin(a) * 0.3, 0];
          }).flat(),
          3,
        ),
      ),
      new LineBasicMaterial({ color: colors.ink }),
    ),
  );

  let lastShown = -1;
  let info = { freq: 150, band: "red", magnitude: 1 };

  function wind(k) {
    const points = windingPoints(signal, k);
    const arr = helixGeometry.attributes.position.array;
    points.forEach(([x, y], i) => {
      arr[i * 3] = x * RADIUS;
      arr[i * 3 + 1] = y * RADIUS;
      arr[i * 3 + 2] = (i / (N - 1) - 0.5) * HEIGHT;
    });
    helixGeometry.attributes.position.needsUpdate = true;
    const [cx, cy] = centerOfMass(points);
    const magnitude = Math.hypot(cx, cy) / maxMag;
    com.position.set(cx * RADIUS * GAIN, cy * RADIUS * GAIN, HEIGHT / 2 + 0.05);
    const line = comLine.geometry.attributes.position.array;
    line.set([
      0,
      0,
      HEIGHT / 2 + 0.05,
      com.position.x,
      com.position.y,
      com.position.z,
    ]);
    comLine.geometry.attributes.position.needsUpdate = true;
    const x = -1.85 + (k / (BINS - 1)) * 3.7;
    cursor.geometry.attributes.position.array.set([
      x,
      base - 0.12,
      zBack,
      x,
      base + 1.35,
      zBack,
      x - 0.06,
      base - 0.12,
      zBack,
      x + 0.06,
      base - 0.12,
      zBack,
    ]);
    cursor.geometry.attributes.position.needsUpdate = true;
    const nearest = Math.round(k);
    const freq = binFrequency(nearest);
    const band = bandOf(freq);
    info = { freq, band, magnitude };
    if (band) {
      led.material.color
        .set(LED[band])
        .multiplyScalar(0.2 + 0.8 * Math.min(1, magnitude * 1.4));
    } else {
      led.material.color.copy(colors.muted).multiplyScalar(0.7);
    }
  }

  return {
    scene,
    camera,
    set(id, value) {
      if (id === "bin") {
        state.bin = value;
        state.shown = value;
        state.auto = false;
      } else if (id === "auto") state.auto = Boolean(value);
    },
    setStep(step) {
      state.step = step;
      // Step 2 of the case study builds the input vector: bin 0 is the raw samples.
      if (step === 2) {
        state.auto = false;
        state.bin = state.shown = 0;
      } else state.auto = true;
    },
    params: () => ({ bin: Math.round(state.shown), auto: state.auto }),
    readout: () =>
      `${info.freq} Hz · ${info.band ? `${info.band} band` : "outside the bands"} · centre of mass ${info.magnitude.toFixed(2)} of the strongest tone`,
    setSize(width, height) {
      fitCamera(camera, baseFov, width, height);
    },
    update({ dt, pointer, still, time }) {
      if (still) {
        state.shown = 3;
      } else if (state.auto) {
        state.shown = (state.shown + dt * 2.4) % (BINS - 1);
      } else {
        state.shown = approach(state.shown, state.bin, dt, 9);
      }
      if (Math.abs(state.shown - lastShown) > 0.01) {
        wind(state.shown);
        lastShown = state.shown;
      }
      group.rotation.y =
        -0.55 + pointer.x * 0.3 + (still ? 0 : Math.sin(time * 0.35) * 0.06);
      group.rotation.x = 0.28 - pointer.y * 0.18;
    },
  };
}
