// Skills as a knowledge graph. Three domain hubs, the projects, and the skills
// that are tags on them; a line means "this project's stack lists this skill" or
// "this project belongs to this domain". Tap a node to light what it connects to;
// drag one and it springs back. Built from the same data as the static index
// (which is what you get without JavaScript).
import { focusCategories } from "../data/projects.js";
import {
  buildGraphModel,
  getSkillGraph,
  neighbourhood,
  nodeId,
  projectsOfSkill,
  skillsOfProject,
} from "../data/skills.js";
import {
  boardSize,
  skillLabelShown,
  skillSide,
  prepareLayout,
} from "../data/graph-boxes.js";
import { layoutGraph } from "../data/graph-layout.js";
import { reduced } from "./reduced-motion.js";

const NS = "http://www.w3.org/2000/svg";
const esc = (text) =>
  String(text).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function initSkills() {
  const root = document.querySelector("[data-skills-graph]");
  if (!root) return;
  const graph = getSkillGraph();
  const state = { all: false, group: null, selected: null };
  let built = null;

  root.innerHTML = `<div class="skills-controls" role="group" aria-label="Show">
      <button type="button" class="chip" data-group="" aria-pressed="true">All</button>
      ${graph.groups.map((g) => `<button type="button" class="chip" data-group="${g.id}" aria-pressed="false">${esc(g.label)}</button>`).join("")}
      <button type="button" class="chip chip-more" data-more aria-pressed="false"></button>
    </div>
    <div class="skills-board" data-board></div>
    <p id="skills-detail" class="skills-detail" role="status" aria-live="polite"></p>`;
  const board = root.querySelector("[data-board]");
  const detailEl = root.querySelector("#skills-detail");
  const more = root.querySelector("[data-more]");

  const projectById = (id) => graph.projects.find((p) => p.id === id);
  const link = (project, label = project.name) =>
    project.external
      ? `<a class="terminal-link" href="${esc(project.href)}" target="_blank" rel="noreferrer">${esc(label)} ↗</a>`
      : `<a class="terminal-link" href="${esc(project.href)}">${esc(label)}</a>`;

  function detail() {
    const id = state.selected;
    const node = built?.model.nodes.find((n) => n.id === id);
    if (!node) {
      return "Tap a skill to see the projects that use it, a project to see its skills, or a domain to see what is in it.";
    }
    if (node.kind === "skill") {
      const skill = graph.skills.find((s) => s.id === node.ref);
      const projects = projectsOfSkill(graph, skill.id);
      const withNote = projects.find((p) => p.note);
      return `<strong>${esc(skill.label)}</strong> · used in ${skill.count} ${skill.count === 1 ? "project" : "projects"}: ${projects.map((p) => link(p)).join(", ")}.${withNote ? ` <span class="skills-note">${esc(withNote.name)}: ${esc(withNote.note)}</span>` : ""}`;
    }
    if (node.kind === "hub") {
      const category = focusCategories[node.group];
      const projects = graph.projects.filter((p) =>
        p.categories.includes(node.group),
      );
      return `<strong>${esc(node.label)}</strong> · ${esc(category.description)} ${projects.map((p) => link(p)).join(", ")}.`;
    }
    const project = projectById(node.ref);
    const skills = skillsOfProject(graph, project.id);
    return `<strong>${esc(project.name)}</strong> uses ${skills.map((s) => esc(s.label)).join(" · ")}. ${project.note ? `<span class="skills-note">${esc(project.note)}</span> ` : ""}${link(project, project.kind === "practice" ? "Open the repository" : "Open the project")}`;
  }

  const el = (name, attrs = {}, parent) => {
    const node = document.createElementNS(NS, name);
    for (const [key, value] of Object.entries(attrs))
      node.setAttribute(key, value);
    parent?.append(node);
    return node;
  };

  function aria(node) {
    if (node.kind === "skill") {
      const skill = graph.skills.find((s) => s.id === node.ref);
      return `${skill.label}, skill, used in ${skill.count} ${skill.count === 1 ? "project" : "projects"}`;
    }
    if (node.kind === "hub") return `${node.label}, domain`;
    return `${node.label}, ${node.kind === "practice" ? "practice" : "project"}`;
  }

  function drawNode(node, parent, all) {
    const g = el(
      "g",
      {
        class: `node node-${node.kind}`,
        "data-id": node.id,
        tabindex: "0",
        role: "button",
        "aria-pressed": "false",
        "aria-label": aria(node),
      },
      parent,
    );
    const box = built.boxes.get(node.id);
    const hit = { w: Math.max(box.w, 44), h: Math.max(box.h, 44) };
    el(
      "rect",
      {
        class: "hit",
        x: -hit.w / 2,
        y: -hit.h / 2,
        width: hit.w,
        height: hit.h,
      },
      g,
    );
    // Shape and label together fill the node's box, so what the layout reserved
    // is what is drawn: the shape sits above centre when there is a label below.
    const LABEL = 15;
    const labelled =
      node.kind === "project" ||
      node.kind === "other" ||
      node.kind === "practice" ||
      (node.kind === "skill" && skillLabelShown(node, all));
    const dy = labelled ? -LABEL / 2 : 0;
    const inner = el("g", { transform: `translate(0 ${dy})` }, g);
    if (node.kind === "hub") {
      el(
        "rect",
        {
          class: "shape",
          x: -box.w / 2,
          y: -box.h / 2,
          width: box.w,
          height: box.h,
        },
        inner,
      );
      el(
        "text",
        { class: "label label-hub", "text-anchor": "middle", y: 5 },
        inner,
      ).textContent = node.label;
    } else if (node.kind === "skill") {
      const side = skillSide(node.count);
      el(
        "rect",
        {
          class: "shape",
          x: -side / 2,
          y: -side / 2,
          width: side,
          height: side,
        },
        inner,
      );
      el(
        "text",
        {
          class: `label${labelled ? "" : " label-pop"}`,
          "text-anchor": "middle",
          y: side / 2 + 12,
        },
        inner,
      ).textContent = node.label;
    } else {
      if (node.kind === "practice") {
        el(
          "polygon",
          { class: "shape", points: "0,-16 16,0 0,16 -16,0" },
          inner,
        );
      } else {
        el("circle", { class: "shape", r: 15 }, inner);
      }
      el(
        "text",
        { class: "label", "text-anchor": "middle", y: 30 },
        inner,
      ).textContent = node.label;
    }
    el(
      "rect",
      {
        class: "focus-ring",
        x: -box.w / 2 - 3,
        y: -box.h / 2 - 3,
        width: box.w + 6,
        height: box.h + 6,
      },
      g,
    );
    return g;
  }

  function build() {
    const width = Math.floor(board.clientWidth);
    if (width < 200) return;
    const { height } = boardSize({ width, all: state.all });
    const model = buildGraphModel(graph, { all: state.all });
    const { nodes, edges } = prepareLayout(model, {
      width,
      height,
      all: state.all,
    });
    const pos = layoutGraph(nodes, edges, { width, height });
    built = {
      width,
      height,
      model,
      pos,
      boxes: new Map(nodes.map((n) => [n.id, n])),
      els: new Map(),
      lines: [],
    };
    board.replaceChildren();
    const svg = el(
      "svg",
      {
        viewBox: `0 0 ${width} ${height}`,
        width,
        height,
        role: "group",
        "aria-label":
          "Skills and projects graph. Each skill is a tag on the projects it connects to.",
      },
      board,
    );
    const edgeLayer = el("g", { class: "edges" }, svg);
    const nodeLayer = el("g", { class: "nodes" }, svg);
    for (const e of model.edges) {
      const a = pos.get(e.a);
      const b = pos.get(e.b);
      const line = el(
        "line",
        { class: `edge edge-${e.kind}`, x1: a.x, y1: a.y, x2: b.x, y2: b.y },
        edgeLayer,
      );
      built.lines.push({ e, line });
    }
    // Hubs and projects first, so skills sit on top of the lines that reach them.
    const order = { hub: 0, project: 1, other: 1, practice: 1, skill: 2 };
    for (const node of [...model.nodes].sort(
      (a, b) => order[a.kind] - order[b.kind],
    )) {
      const g = drawNode(node, nodeLayer, state.all);
      const p = pos.get(node.id);
      g.setAttribute("transform", `translate(${p.x} ${p.y})`);
      built.els.set(node.id, g);
    }
    apply();
  }

  // Which nodes belong to the chosen domain: its hub, its projects, their skills.
  function members(group) {
    const set = new Set([nodeId.hub(group)]);
    for (const n of built.model.nodes) {
      if (n.kind === "hub" || n.kind === "skill") continue;
      if (projectById(n.ref).categories.includes(group)) set.add(n.id);
    }
    for (const e of built.model.edges) {
      if (e.kind === "evidence" && set.has(e.b)) set.add(e.a);
    }
    return set;
  }

  function apply() {
    root
      .querySelectorAll("[data-group]")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String((b.dataset.group || null) === state.group),
        ),
      );
    more.setAttribute("aria-pressed", String(state.all));
    more.textContent = state.all
      ? "Show fewer"
      : `Show all ${graph.skills.length} skills and ${graph.projects.length} projects`;
    detailEl.innerHTML = detail();
    if (!built) return;
    const lit = state.selected
      ? neighbourhood(built.model, state.selected)
      : null;
    const inGroup = state.group ? members(state.group) : null;
    for (const [id, g] of built.els) {
      const selected = id === state.selected;
      g.classList.toggle("is-selected", selected);
      g.classList.toggle("is-lit", Boolean(lit?.has(id)) && !selected);
      g.classList.toggle("is-dim", Boolean(lit) && !lit.has(id));
      g.classList.toggle("is-faded", Boolean(inGroup) && !inGroup.has(id));
      g.setAttribute("aria-pressed", String(selected));
    }
    for (const { e, line } of built.lines) {
      const on = lit && lit.has(e.a) && lit.has(e.b);
      line.classList.toggle("is-lit", Boolean(on));
      line.classList.toggle("is-dim", Boolean(lit) && !on);
      line.classList.toggle(
        "is-faded",
        Boolean(inGroup) && !(inGroup.has(e.a) && inGroup.has(e.b)),
      );
    }
  }

  function select(id) {
    state.selected = state.selected === id ? null : id;
    apply();
  }

  // Dragging a node moves it and its lines; letting go springs it back.
  function moveNode(id, x, y) {
    built.els.get(id).setAttribute("transform", `translate(${x} ${y})`);
    for (const { e, line } of built.lines) {
      if (e.a === id) {
        line.setAttribute("x1", x);
        line.setAttribute("y1", y);
      }
      if (e.b === id) {
        line.setAttribute("x2", x);
        line.setAttribute("y2", y);
      }
    }
  }
  function springBack(id, from) {
    const to = built.pos.get(id);
    if (reduced()) return moveNode(id, to.x, to.y);
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / 240);
      const ease = 1 - (1 - t) ** 3;
      moveNode(
        id,
        from.x + (to.x - from.x) * ease,
        from.y + (to.y - from.y) * ease,
      );
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  let drag = null;
  board.addEventListener("pointerdown", (event) => {
    const g = event.target.closest?.(".node");
    if (!g) return;
    const home = built.pos.get(g.dataset.id);
    drag = {
      id: g.dataset.id,
      g,
      x: event.clientX,
      y: event.clientY,
      home,
      moved: false,
      at: { ...home },
    };
    g.setPointerCapture?.(event.pointerId);
  });
  board.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    drag.moved = true;
    const box = built.boxes.get(drag.id);
    drag.at = {
      x: Math.min(
        built.width - box.w / 2,
        Math.max(box.w / 2, drag.home.x + dx),
      ),
      y: Math.min(
        built.height - box.h / 2,
        Math.max(box.h / 2, drag.home.y + dy),
      ),
    };
    moveNode(drag.id, drag.at.x, drag.at.y);
  });
  const release = (event) => {
    if (!drag) return;
    const done = drag;
    drag = null;
    if (done.moved) springBack(done.id, done.at);
    else if (event.type === "pointerup") select(done.id);
  };
  board.addEventListener("pointerup", release);
  board.addEventListener("pointercancel", release);

  root.addEventListener("click", (event) => {
    const group = event.target.closest("[data-group]");
    if (event.target.closest("[data-more]")) {
      state.all = !state.all;
      state.selected = null;
      build();
    } else if (group) {
      state.group = group.dataset.group || null;
      apply();
    }
  });
  root.addEventListener("keydown", (event) => {
    const g = event.target.closest?.(".node");
    if (g && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      select(g.dataset.id);
    } else if (event.key === "Escape" && state.selected) {
      event.stopPropagation();
      state.selected = null;
      apply();
    }
  });

  // Lay out when the window is first shown and again when its width changes.
  const maybeBuild = () => {
    const width = Math.floor(board.clientWidth);
    if (width >= 200 && (!built || Math.abs(width - built.width) > 6)) build();
  };
  let timer;
  new ResizeObserver(() => {
    window.clearTimeout(timer);
    timer = window.setTimeout(maybeBuild, 90);
  }).observe(board);
  // Opening the window also lays it out, without waiting for a resize report.
  window.addEventListener("portfolio:scene", () =>
    window.setTimeout(maybeBuild, 60),
  );
  apply();
}
