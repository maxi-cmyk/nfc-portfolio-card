// Figure 1: the NFC card. Blueprint line art: flat platinum face, navy hairline
// edges, the real shape of the antenna coil, and radio-field loops that rise off
// the card when you hover or tap it. Procedural only; nothing is downloaded.
import {
  BufferGeometry,
  CanvasTexture,
  Color,
  EdgesGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  SRGBColorSpace,
  Scene,
  Shape,
} from "three";
import {
  CARD,
  approach,
  coilPoints,
  fieldLoopState,
  roundedRectPoints,
  toSegments,
} from "./card-math.js";

const LOOPS = 5;

function cardShape() {
  const { width: w, height: h, radius: r } = CARD;
  const s = new Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.absarc(w / 2 - r, -h / 2 + r, r, -Math.PI / 2, 0, false);
  s.lineTo(w / 2, h / 2 - r);
  s.absarc(w / 2 - r, h / 2 - r, r, 0, Math.PI / 2, false);
  s.lineTo(-w / 2 + r, h / 2);
  s.absarc(-w / 2 + r, h / 2 - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(-w / 2, -h / 2 + r);
  s.absarc(-w / 2 + r, -h / 2 + r, r, Math.PI, (3 * Math.PI) / 2, false);
  return s;
}

function lineGeometry(points, z = 0) {
  const g = new BufferGeometry();
  g.setAttribute(
    "position",
    new Float32BufferAttribute(
      points.flatMap(([x, y]) => [x, y, z]),
      3,
    ),
  );
  return g;
}

// The printed face: the name in the site's bitmap face and the field's frequency.
function faceTexture(palette) {
  const canvas = document.createElement("canvas");
  canvas.width = 1348;
  canvas.height = 850;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = palette.navy;
  ctx.font = '88px "Departure Mono", monospace';
  ctx.textBaseline = "alphabetic";
  ctx.fillText("MAX LEONG", 150, 690);
  ctx.fillStyle = palette.muted;
  ctx.font = '36px "IBM Plex Mono", monospace';
  ctx.fillText("NFC · 13.56 MHz", 154, 748);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function createCardFigure(palette) {
  const colors = Object.fromEntries(
    Object.entries(palette).map(([k, v]) => [k, new Color(v)]),
  );
  const scene = new Scene();
  const camera = new PerspectiveCamera(26, 1, 0.1, 60);
  camera.position.set(0, 0, 8.4);
  const group = new Group();
  scene.add(group);

  const bodyGeometry = new ExtrudeGeometry(cardShape(), {
    depth: CARD.depth,
    bevelEnabled: false,
  });
  bodyGeometry.translate(0, 0, -CARD.depth / 2);
  group.add(
    new Mesh(bodyGeometry, new MeshBasicMaterial({ color: colors.paper })),
  );
  group.add(
    new LineSegments(
      new EdgesGeometry(bodyGeometry, 25),
      new LineBasicMaterial({ color: colors.ink }),
    ),
  );

  const top = CARD.depth / 2 + 0.003;
  const face = new Mesh(
    new PlaneGeometry(CARD.width, CARD.height),
    new MeshBasicMaterial({ map: faceTexture(palette), transparent: true }),
  );
  face.position.z = top;
  group.add(face);

  const coil = new LineSegments(
    (() => {
      const g = new BufferGeometry();
      const flat = toSegments(coilPoints());
      const positions = [];
      for (let i = 0; i < flat.length; i += 2)
        positions.push(flat[i], flat[i + 1], top + 0.004);
      g.setAttribute("position", new Float32BufferAttribute(positions, 3));
      return g;
    })(),
    new LineBasicMaterial({ color: colors.navy }),
  );
  group.add(coil);

  // The chip the coil powers.
  const chip = new Mesh(
    new PlaneGeometry(0.46, 0.46),
    new MeshBasicMaterial({ color: colors.plum }),
  );
  chip.position.set(-0.95, 0.35, top + 0.006);
  group.add(chip);
  group.add(
    (() => {
      const loop = new LineLoop(
        lineGeometry(
          [
            [-1.18, 0.12],
            [-0.72, 0.12],
            [-0.72, 0.58],
            [-1.18, 0.58],
          ],
          top + 0.008,
        ),
        new LineBasicMaterial({ color: colors.ink }),
      );
      return loop;
    })(),
  );

  // The field: loops the shape of the coil's outer turn, rising and fading.
  const outer = roundedRectPoints(CARD.width - 0.4, CARD.height - 0.4, 0.14);
  const loops = Array.from({ length: LOOPS }, () => {
    const material = new LineBasicMaterial({
      color: colors.acid,
      transparent: true,
      opacity: 0,
    });
    const line = new LineLoop(lineGeometry(outer, 0), material);
    group.add(line);
    return line;
  });

  const state = { power: 0, target: 0, impulse: 0 };

  return {
    scene,
    camera,
    // Hovering holds the field at a gentle level; a tap or press surges it.
    nudge(strength = 1) {
      state.impulse = Math.max(state.impulse, strength);
    },
    setHover(on) {
      state.target = on ? 0.55 : 0;
    },
    setSize(width, height) {
      camera.aspect = width / height;
      // Keep the whole card in view in a tall or a wide host.
      camera.fov =
        camera.aspect < 1.2 ? 26 * (1.3 / Math.max(camera.aspect, 0.6)) : 26;
      camera.updateProjectionMatrix();
    },
    update({ time, dt, pointer, still }) {
      state.impulse = approach(state.impulse, 0, dt, 1.4);
      const goal = Math.max(state.target, state.impulse);
      state.power = approach(state.power, goal, dt, 5);
      const power = still ? 0.45 : state.power;
      const t = still ? 0.9 : time;
      group.rotation.y =
        -0.5 + pointer.x * 0.35 + (still ? 0 : Math.sin(t * 0.4) * 0.08);
      group.rotation.x =
        0.42 - pointer.y * 0.25 + (still ? 0 : Math.cos(t * 0.33) * 0.05);
      group.rotation.z = -0.1;
      loops.forEach((line, i) => {
        const s = fieldLoopState(i, LOOPS, t, power);
        line.position.z = top + s.z;
        line.scale.set(s.scale, s.scale, 1);
        line.material.opacity = s.opacity;
      });
    },
  };
}
