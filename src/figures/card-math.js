// Geometry and timing for the NFC card figure, with no 3D library, so the
// shapes can be tested. Units are arbitrary: a bank-card shape, 3.37 × 2.125.

export const CARD = { width: 3.37, height: 2.125, depth: 0.04, radius: 0.14 };

// The antenna: a rectangular spiral wound inward from just inside the edge.
// Returns the corner points from the outside turn to the innermost one.
export function coilPoints({
  turns = 5,
  width = CARD.width,
  height = CARD.height,
  inset = 0.2,
  pitch = 0.075,
} = {}) {
  const points = [];
  let x = width / 2 - inset;
  let y = height / 2 - inset;
  for (let i = 0; i < turns; i++) {
    const d = i * pitch;
    const right = x - d;
    const top = y - d;
    points.push([-right, top], [right, top], [right, -top], [-right, -top]);
  }
  points.push([-(x - turns * pitch), y - turns * pitch]);
  return points;
}

// Consecutive points as line segments: [x0,y0,x1,y1, ...].
export function toSegments(points) {
  const out = [];
  for (let i = 0; i < points.length - 1; i++) {
    out.push(...points[i], ...points[i + 1]);
  }
  return out;
}

// A rounded-rectangle outline as a closed loop of points.
export function roundedRectPoints(w, h, r, steps = 6) {
  const points = [];
  const corners = [
    [w / 2 - r, h / 2 - r, 0],
    [-w / 2 + r, h / 2 - r, Math.PI / 2],
    [-w / 2 + r, -h / 2 + r, Math.PI],
    [w / 2 - r, -h / 2 + r, (3 * Math.PI) / 2],
  ];
  for (const [cx, cy, start] of corners) {
    for (let i = 0; i <= steps; i++) {
      const a = start + (i / steps) * (Math.PI / 2);
      points.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  }
  return points;
}

// One radio-field loop: it rises off the card, widens and fades, then starts
// again. `power` (0 to 1) makes the field stronger and the loops faster.
export function fieldLoopState(index, count, time, power = 0) {
  const speed = 0.14 + 0.32 * power;
  const phase = (((time * speed + index / count) % 1) + 1) % 1;
  return {
    z: phase * 2.2,
    scale: 1 + phase * 0.5,
    opacity: Math.max(0, (1 - phase) ** 1.5) * (0.1 + 0.62 * power),
  };
}

// Eases a value toward a target without overshooting, frame-rate independent.
export function approach(value, target, dt, rate = 6) {
  return value + (target - value) * (1 - Math.exp(-rate * dt));
}
