// How big each node is on the board, and how the layout is set up from a model.
// Pure, so the sizes the layout reserves are exactly the sizes the page draws.
import { hubAnchors } from "./graph-layout.js";

export const CHAR = 6.4; // average label width in px at the board's label size

export const skillSide = (count) => Math.min(30, 12 + 3 * count);
export const skillLabelShown = (node, all) => !all || node.count >= 3;

export function boxFor(node, { all = false } = {}) {
  const text = node.label.length * CHAR;
  if (node.kind === "hub") return { w: Math.ceil(text + 22), h: 30 };
  if (node.kind === "skill") {
    const side = skillSide(node.count);
    return skillLabelShown(node, all)
      ? { w: Math.ceil(Math.max(side, text)), h: side + 15 }
      : { w: side, h: side };
  }
  return { w: Math.ceil(Math.max(30, text)), h: 45 };
}

export function boardSize({ width, all }) {
  const phone = width < 600;
  const height = phone ? (all ? 800 : 540) : all ? 580 : 440;
  return { width, height };
}

export function prepareLayout(model, { width, height, all = false }) {
  const anchors = hubAnchors(width, height, 3);
  const hubs = model.nodes.filter((n) => n.kind === "hub");
  const scale = Math.max(
    0.55,
    Math.min(1, Math.min(width, height * 1.3) / 600),
  );
  const nodes = model.nodes.map((n) => {
    const hubIndex = hubs.findIndex((h) => h.id === n.id);
    return {
      id: n.id,
      ...boxFor(n, { all }),
      ...(hubIndex >= 0 ? { anchor: anchors[hubIndex] } : {}),
      home: hubIndex >= 0 ? undefined : `group:${n.group}`,
    };
  });
  const edges = model.edges.map((e) => ({
    a: e.a,
    b: e.b,
    length: (e.kind === "domain" ? 120 : 80) * scale,
  }));
  return { nodes, edges };
}
