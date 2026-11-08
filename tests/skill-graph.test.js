import assert from "node:assert/strict";
import test from "node:test";
import { allProjects, otherProjects } from "../src/data/projects.js";
import { boardSize, prepareLayout } from "../src/data/graph-boxes.js";
import { hubAnchors, layoutGraph, overlaps } from "../src/data/graph-layout.js";
import {
  buildGraphModel,
  getSkillGraph,
  neighbourhood,
  nodeId,
  practiceNode,
} from "../src/data/skills.js";

const graph = getSkillGraph();
const first = buildGraphModel(graph);
const all = buildGraphModel(graph, { all: true });

test("every edge joins two real nodes, and every shown skill has evidence", () => {
  for (const model of [first, all]) {
    const ids = new Set(model.nodes.map((n) => n.id));
    for (const e of model.edges) {
      assert.ok(ids.has(e.a) && ids.has(e.b), `${e.a} - ${e.b}`);
    }
    for (const n of model.nodes.filter((n) => n.kind === "skill")) {
      assert.ok(
        model.edges.some((e) => e.a === n.id && e.kind === "evidence"),
        `${n.label} has no project behind it`,
      );
    }
    for (const n of model.nodes.filter(
      (n) => n.kind !== "hub" && n.kind !== "skill",
    )) {
      assert.ok(
        model.edges.some((e) => e.b === n.id || e.a === n.id),
        `${n.label} is not connected`,
      );
    }
  }
});

test("evidence edges are exactly the stack tags, nothing more", () => {
  const sources = [...allProjects, ...otherProjects, practiceNode];
  for (const e of all.edges.filter((e) => e.kind === "evidence")) {
    const skill = graph.skills.find((s) => nodeId.skill(s.id) === e.a);
    const project = sources.find((p) => nodeId.project(p.slug ?? p.id) === e.b);
    assert.ok(
      project.tags.includes(skill.label),
      `${skill.label} in ${project.name}`,
    );
  }
  const tags = sources.reduce((sum, p) => sum + p.tags.length, 0);
  assert.equal(all.edges.filter((e) => e.kind === "evidence").length, tags);
});

test("the first view is the hubs, the featured projects, and shared skills", () => {
  assert.equal(first.nodes.filter((n) => n.kind === "hub").length, 3);
  assert.equal(
    first.nodes.filter((n) => n.kind === "project").length,
    allProjects.length,
  );
  assert.ok(first.nodes.length <= 26, `${first.nodes.length} nodes`);
  assert.ok(all.nodes.length > first.nodes.length);
});

test("choosing a node lights it, its neighbours, and the domains involved", () => {
  const c = first.nodes.find((n) => n.label === "Python");
  const lit = neighbourhood(first, c.id);
  assert.ok(lit.has(c.id));
  assert.ok(lit.has("project:cya"));
  assert.ok(lit.has("group:applied-ai"));
  const hub = neighbourhood(first, "group:applied-ai");
  assert.ok(hub.has("project:cya") && !hub.has("project:music-leds"));
});

const SIZES = [
  ["a phone, first view", 360, false],
  ["a phone, show all", 360, true],
  ["a narrow phone, first view", 320, false],
  ["a laptop, first view", 900, false],
  ["a laptop, show all", 900, true],
];

for (const [name, width, showAll] of SIZES) {
  test(`the layout fits ${name} with no overlaps`, () => {
    const model = showAll ? all : first;
    const { height } = boardSize({ width, all: showAll });
    const { nodes, edges } = prepareLayout(model, {
      width,
      height,
      all: showAll,
    });
    const pos = layoutGraph(nodes, edges, { width, height });
    for (const n of nodes) {
      const p = pos.get(n.id);
      assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y), n.id);
      assert.ok(p.x - n.w / 2 >= 0 && p.x + n.w / 2 <= width, `${n.id} x`);
      assert.ok(p.y - n.h / 2 >= 0 && p.y + n.h / 2 <= height, `${n.id} y`);
    }
    assert.deepEqual(overlaps(nodes, pos), []);
  });
}

test("the layout is the same every time, and hubs sit where they are anchored", () => {
  const { height } = boardSize({ width: 360, all: false });
  const run = () => {
    const { nodes, edges } = prepareLayout(first, {
      width: 360,
      height,
      all: false,
    });
    return layoutGraph(nodes, edges, { width: 360, height });
  };
  const a = run();
  const b = run();
  for (const [id, p] of a) assert.deepEqual(p, b.get(id), id);
  const anchors = hubAnchors(360, height);
  first.nodes
    .filter((n) => n.kind === "hub")
    .forEach((hub, i) => {
      const p = a.get(hub.id);
      assert.ok(
        Math.abs(p.x - anchors[i].x) < 80 && Math.abs(p.y - anchors[i].y) < 40,
        hub.id,
      );
    });
});
