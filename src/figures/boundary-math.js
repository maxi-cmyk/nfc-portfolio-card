// A schematic of a robust detector, not real embeddings: two clouds of points
// either side of a boundary plane (x = 0). A transformation (JPEG, blur,
// resize) pulls points toward the plane and adds noise. Deterministic.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Standard normal from two uniforms.
const gaussian = (rand) =>
  Math.sqrt(-2 * Math.log(Math.max(rand(), 1e-9))) *
  Math.cos(2 * Math.PI * rand());

export const KINDS = {
  jpeg: { label: "JPEG recompression", pull: 0.5, noise: 0.12 },
  blur: { label: "Blur", pull: 0.58, noise: 0.14 },
  resize: { label: "Resize", pull: 0.54, noise: 0.13 },
};

export function makePoints(perClass = 56, seed = 17) {
  const rand = mulberry32(seed);
  const points = [];
  for (const side of [-1, 1]) {
    for (let i = 0; i < perClass; i++) {
      points.push({
        side, // -1: authentic, +1: AI-generated
        x: side * 1.15 + gaussian(rand) * 0.42,
        y: gaussian(rand) * 0.55,
        z: gaussian(rand) * 0.55,
        nx: gaussian(rand),
        ny: gaussian(rand),
        nz: gaussian(rand),
      });
    }
  }
  return points;
}

// Where a point sits after a transformation of strength 0 to 1.
export function transformed(point, strength, kind = "jpeg") {
  const { pull, noise } = KINDS[kind] ?? KINDS.jpeg;
  const s = Math.min(Math.max(strength, 0), 1);
  return {
    x: point.x * (1 - pull * s) + point.nx * noise * s,
    y: point.y + point.ny * noise * s * 0.6,
    z: point.z + point.nz * noise * s * 0.6,
  };
}

// A point is wrong when it ends up on the other side of the boundary.
export function wrongSide(point, position) {
  return Math.sign(position.x) !== point.side;
}

export function countWrong(points, strength, kind) {
  return points.filter((p) => wrongSide(p, transformed(p, strength, kind)))
    .length;
}
