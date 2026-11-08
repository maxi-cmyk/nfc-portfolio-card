// Skills as evidence: every skill is a stack tag on a project, so a skill can
// never appear without a project behind it. Pure data; the interactive view is
// components/skills.js and a Three.js view can replace it later.
import { allProjects, focusCategories, otherProjects } from "./projects.js";

// Practice that backs the low-level skills but is not shown as a project.
export const practiceNode = {
  id: "practice",
  name: "Algorithms practice",
  kind: "practice",
  href: "https://github.com/maxi-cmyk/Python-to-C-logic-",
  external: true,
  note: "114 of 150 problems solved in Python, then re-implemented in C (as reported in the repository README).",
  categories: [],
  tags: ["Python", "C"],
};

export function skillId(label) {
  return label
    .toLowerCase()
    .replace(/\+\+/g, "pp")
    .replace(/\+/g, "plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getSkillGraph() {
  const projects = [
    ...allProjects.map((p) => ({
      id: p.slug,
      name: p.name,
      kind: "project",
      href: `#work/${p.slug}`,
      categories: p.categories,
      tags: p.tags,
    })),
    ...otherProjects.map((e) => ({
      id: e.id,
      name: e.name,
      kind: "other",
      href: e.id === "sentinel" ? "#project/sentinel" : e.links[0].url,
      external: e.id !== "sentinel",
      categories: e.categories,
      tags: e.tags,
    })),
    practiceNode,
  ];
  const order = Object.keys(focusCategories);
  const byLabel = new Map();
  for (const project of projects) {
    for (const tag of project.tags) {
      if (!byLabel.has(tag)) byLabel.set(tag, []);
      byLabel.get(tag).push(project);
    }
  }
  const skills = [...byLabel.entries()]
    .map(([label, linked]) => {
      const votes = new Map();
      for (const project of linked) {
        for (const id of project.categories) {
          votes.set(id, (votes.get(id) ?? 0) + 1);
        }
      }
      const group =
        [...votes.entries()].sort(
          (a, b) => b[1] - a[1] || order.indexOf(a[0]) - order.indexOf(b[0]),
        )[0]?.[0] ?? order[0];
      return {
        id: skillId(label),
        label,
        group,
        count: linked.length,
        projects: linked.map((p) => p.id),
      };
    })
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  return {
    skills,
    projects,
    groups: order.map((id) => ({ id, label: focusCategories[id].label })),
  };
}

// First view: only the skills that two or more projects share, most reused
// first. Everything else is behind "show all".
export function topSkills(graph, limit = 12) {
  return graph.skills.filter((s) => s.count >= 2).slice(0, limit);
}

// First view shows the featured projects; "show all" adds the rest.
export function featuredProjectNodes(graph) {
  return graph.projects.filter((p) => p.kind === "project");
}

export const projectsOfSkill = (graph, skillId) =>
  graph.skills
    .find((s) => s.id === skillId)
    ?.projects.map((id) => graph.projects.find((p) => p.id === id)) ?? [];

export const skillsOfProject = (graph, projectId) =>
  graph.skills.filter((s) => s.projects.includes(projectId));

// ---------------------------------------------------------------------------
// The graph view's model: domain hubs, projects and skills as nodes; an edge
// means "this project's stack lists this skill" or "this project belongs to this
// domain". Nothing here is invented: every node and edge comes from graph above.

export const nodeId = {
  hub: (id) => `group:${id}`,
  project: (id) => `project:${id}`,
  skill: (id) => `skill:${id}`,
};

export function buildGraphModel(graph, { all = false } = {}) {
  const projects = all ? graph.projects : featuredProjectNodes(graph);
  const shown = new Set(projects.map((p) => p.id));
  // A skill shows only if a shown project backs it, so no node floats alone.
  const skills = (all ? graph.skills : topSkills(graph)).filter((s) =>
    s.projects.some((id) => shown.has(id)),
  );

  const nodes = [
    ...graph.groups.map((g) => ({
      id: nodeId.hub(g.id),
      kind: "hub",
      label: g.label,
      group: g.id,
    })),
    ...projects.map((p) => ({
      id: nodeId.project(p.id),
      kind: p.kind,
      label: p.name,
      group: p.categories[0] ?? null,
      ref: p.id,
    })),
    ...skills.map((s) => ({
      id: nodeId.skill(s.id),
      kind: "skill",
      label: s.label,
      group: s.group,
      count: s.count,
      ref: s.id,
    })),
  ];

  const edges = [];
  for (const p of projects) {
    for (const category of p.categories) {
      edges.push({
        a: nodeId.project(p.id),
        b: nodeId.hub(category),
        kind: "domain",
      });
    }
  }
  for (const s of skills) {
    for (const id of s.projects) {
      if (shown.has(id)) {
        edges.push({
          a: nodeId.skill(s.id),
          b: nodeId.project(id),
          kind: "evidence",
        });
      }
    }
  }
  return { nodes, edges };
}

// What lights up when a node is chosen: the node, what it connects to, and the
// domain hubs of the projects involved.
export function neighbourhood(model, id) {
  const lit = new Set([id]);
  const next = (of) =>
    model.edges
      .filter((e) => e.a === of || e.b === of)
      .map((e) => (e.a === of ? e.b : e.a));
  const first = next(id);
  first.forEach((n) => lit.add(n));
  const node = model.nodes.find((n) => n.id === id);
  if (node?.kind === "skill") {
    for (const n of first)
      next(n)
        .filter((m) => m.startsWith("group:"))
        .forEach((m) => lit.add(m));
  }
  return lit;
}
