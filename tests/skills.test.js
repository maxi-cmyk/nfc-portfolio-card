import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { allProjects, shelfEntries } from "../src/data/projects.js";
import {
  featuredProjectNodes,
  getSkillGraph,
  practiceNode,
  projectsOfSkill,
  skillId,
  skillsOfProject,
  topSkills,
} from "../src/data/skills.js";
import { parseRoute } from "../src/navigation/routes.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const graph = getSkillGraph();

test("every skill is backed by at least one project", () => {
  assert.ok(graph.skills.length > 20);
  const ids = new Set(graph.projects.map((p) => p.id));
  for (const skill of graph.skills) {
    assert.ok(skill.projects.length >= 1, skill.label);
    assert.equal(skill.count, skill.projects.length, skill.label);
    for (const id of skill.projects)
      assert.ok(ids.has(id), `${skill.label}: ${id}`);
  }
});

test("every tag on every project becomes a skill, and skill ids are unique", () => {
  const labels = new Set(graph.skills.map((s) => s.label));
  for (const p of [...allProjects, ...shelfEntries, practiceNode]) {
    for (const tag of p.tags) assert.ok(labels.has(tag), `${p.name}: ${tag}`);
  }
  const ids = graph.skills.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(skillId("C++"), "cpp");
  assert.equal(skillId("C"), "c");
  assert.equal(skillId("DFT / FFT"), "dft-fft");
});

test("skills and projects link both ways", () => {
  const python = graph.skills.find((s) => s.label === "Python");
  assert.ok(projectsOfSkill(graph, python.id).some((p) => p.id === "cya"));
  assert.ok(skillsOfProject(graph, "cya").some((s) => s.label === "PyTorch"));
  for (const skill of graph.skills) {
    for (const project of projectsOfSkill(graph, skill.id)) {
      assert.ok(skillsOfProject(graph, project.id).includes(skill));
    }
  }
});

test("the first view is small and shows only shared skills", () => {
  const top = topSkills(graph);
  assert.ok(top.length >= 8 && top.length <= 12);
  assert.ok(top.every((s) => s.count >= 2));
  assert.equal(top[0].count >= top.at(-1).count, true);
  const projects = featuredProjectNodes(graph);
  assert.equal(projects.length, allProjects.length);
  assert.ok(top.length + projects.length <= 20);
});

test("the algorithms practice backs C and Python with its reported figure", () => {
  assert.equal(practiceNode.external, true);
  assert.match(practiceNode.note, /114 of 150/);
  for (const label of ["C", "Python"]) {
    const skill = graph.skills.find((s) => s.label === label);
    assert.ok(skill.projects.includes("practice"), label);
  }
});

test("every project link goes somewhere real", () => {
  for (const node of graph.projects) {
    if (node.external) {
      assert.match(node.href, /^https:\/\/github\.com\//);
    } else {
      assert.notEqual(parseRoute(node.href).kind, "missing", node.href);
    }
  }
});

test("each skill has a group and the static page lists every skill", () => {
  const groups = new Set(graph.groups.map((g) => g.id));
  for (const skill of graph.skills)
    assert.ok(groups.has(skill.group), skill.label);
  assert.match(html, /data-skills-graph/);
  for (const skill of graph.skills) {
    assert.ok(
      html.includes(`<dt>${skill.label.replace(/&/g, "&amp;")}</dt>`),
      skill.label,
    );
  }
});
