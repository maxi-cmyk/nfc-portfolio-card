// A small deterministic force layout for the skills graph. No random numbers:
// start positions come from a hash of each id, so the same graph at the same size
// always lands in the same place, and it never jiggles. Pure: no DOM.

const hash = (text) => {
  let h = 2166136261;
  for (const char of text) {
    h ^= char.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
};

// Where the domain hubs sit. A wide board puts them in a triangle; a tall board
// stacks them down a zig-zag so the projects have room between them.
export function hubAnchors(width, height, count = 3) {
  const wide = width >= height * 1.15;
  const spots = wide
    ? [
        [0.17, 0.2],
        [0.83, 0.2],
        [0.5, 0.86],
      ]
    : [
        [0.3, 0.07],
        [0.7, 0.5],
        [0.3, 0.93],
      ];
  return spots
    .slice(0, count)
    .map(([x, y]) => ({ x: x * width, y: y * height }));
}

// nodes: { id, w, h, hub?: bool, anchor?: {x, y}, home?: hubId }
// edges: { a, b, length }
// Returns Map(id -> { x, y }) with every box inside the board and no two boxes
// overlapping (when there is room for them at all).
export function layoutGraph(
  nodes,
  edges,
  { width, height, pad = 4, iterations = 360 },
) {
  const pos = new Map();
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const half = (n) => ({ x: n.w / 2 + pad, y: n.h / 2 + pad });
  const clamp = (n, p) => {
    const h = half(n);
    p.x = Math.min(width - h.x, Math.max(h.x, p.x));
    p.y = Math.min(height - h.y, Math.max(h.y, p.y));
  };

  for (const n of nodes) {
    const home = n.anchor ??
      byId.get(n.home)?.anchor ?? { x: width / 2, y: height / 2 };
    const a = hash(`${n.id}:a`) * Math.PI * 2;
    const r = n.anchor
      ? 0
      : 50 + hash(`${n.id}:r`) * Math.min(width, height) * 0.28;
    const p = { x: home.x + Math.cos(a) * r, y: home.y + Math.sin(a) * r };
    clamp(n, p);
    pos.set(n.id, p);
  }

  const k = Math.sqrt((width * height) / Math.max(nodes.length, 1)) * 0.55;
  for (let step = 0; step < iterations; step++) {
    const temp = 1 - step / iterations;
    const move = new Map(nodes.map((n) => [n.id, { x: 0, y: 0 }]));
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const pa = pos.get(a.id);
        const pb = pos.get(b.id);
        let dx = pa.x - pb.x;
        let dy = pa.y - pb.y;
        let d = Math.hypot(dx, dy);
        if (d < 0.01) {
          dx = hash(a.id + b.id) - 0.5;
          dy = hash(b.id + a.id) - 0.5;
          d = Math.hypot(dx, dy) || 1;
        }
        const force = (k * k) / d;
        const fx = (dx / d) * force;
        const fy = (dy / d) * force;
        move.get(a.id).x += fx;
        move.get(a.id).y += fy;
        move.get(b.id).x -= fx;
        move.get(b.id).y -= fy;
      }
    }
    for (const e of edges) {
      const pa = pos.get(e.a);
      const pb = pos.get(e.b);
      if (!pa || !pb) continue;
      const dx = pb.x - pa.x;
      const dy = pb.y - pa.y;
      const d = Math.hypot(dx, dy) || 1;
      const force = (d - e.length) * 0.08 * Math.min(d, 90);
      move.get(e.a).x += (dx / d) * force;
      move.get(e.a).y += (dy / d) * force;
      move.get(e.b).x -= (dx / d) * force;
      move.get(e.b).y -= (dy / d) * force;
    }
    for (const n of nodes) {
      const p = pos.get(n.id);
      const m = move.get(n.id);
      if (n.anchor) {
        p.x = n.anchor.x;
        p.y = n.anchor.y;
        continue;
      }
      const home = byId.get(n.home)?.anchor;
      if (home) {
        m.x += (home.x - p.x) * 0.9;
        m.y += (home.y - p.y) * 0.9;
      }
      m.x += (width / 2 - p.x) * 0.25;
      m.y += (height / 2 - p.y) * 0.25;
      const len = Math.hypot(m.x, m.y) || 1;
      const cap = 14 * temp + 0.5;
      p.x += (m.x / len) * Math.min(len, cap);
      p.y += (m.y / len) * Math.min(len, cap);
      clamp(n, p);
    }
  }

  // Resolve what is left: push overlapping boxes apart along the shorter way out.
  for (let pass = 0; pass < 400; pass++) {
    let moved = false;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const pa = pos.get(a.id);
        const pb = pos.get(b.id);
        const ox = (a.w + b.w) / 2 + pad * 2 - Math.abs(pa.x - pb.x);
        const oy = (a.h + b.h) / 2 + pad * 2 - Math.abs(pa.y - pb.y);
        if (ox <= 0 || oy <= 0) continue;
        moved = true;
        const pinA = Boolean(a.anchor);
        const pinB = Boolean(b.anchor);
        // A hub gives way a little, so a crowded corner can always be cleared.
        const shareA = pinA ? 0.12 : pinB ? 0.88 : 0.5;
        const shareB = pinB ? 0.12 : pinA ? 0.88 : 0.5;
        if (ox < oy) {
          const dir = pa.x <= pb.x ? -1 : 1;
          pa.x += dir * ox * shareA;
          pb.x -= dir * ox * shareB;
        } else {
          const dir = pa.y <= pb.y ? -1 : 1;
          pa.y += dir * oy * shareA;
          pb.y -= dir * oy * shareB;
        }
        clamp(a, pa);
        clamp(b, pb);
      }
    }
    if (!moved) break;
  }
  return pos;
}

// Boxes that still overlap after layout (the board was too small for them).
export function overlaps(nodes, pos, pad = 0) {
  const out = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const pa = pos.get(a.id);
      const pb = pos.get(b.id);
      const ox = (a.w + b.w) / 2 + pad - Math.abs(pa.x - pb.x);
      const oy = (a.h + b.h) / 2 + pad - Math.abs(pa.y - pb.y);
      if (ox > 0 && oy > 0) out.push([a.id, b.id]);
    }
  }
  return out;
}
