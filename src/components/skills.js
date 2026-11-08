import {
  featuredProjectNodes,
  getSkillGraph,
  projectsOfSkill,
  skillsOfProject,
  topSkills,
} from "../data/skills.js";

const esc = (text) =>
  String(text).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// Skills as evidence: pick a skill to see the projects that use it, or a
// project to see its skills. Built from the same data as the static index.
export function initSkills() {
  const root = document.querySelector("[data-skills-graph]");
  if (!root) return;
  const graph = getSkillGraph();
  const state = { skill: null, project: null, all: false };
  let focusKey = null;

  const skillById = (id) => graph.skills.find((s) => s.id === id);
  const projectById = (id) => graph.projects.find((p) => p.id === id);

  const link = (project) =>
    project.external
      ? `<a class="terminal-link" href="${esc(project.href)}" target="_blank" rel="noreferrer">${esc(project.name)} ↗</a>`
      : `<a class="terminal-link" href="${esc(project.href)}">${esc(project.name)}</a>`;

  function detail() {
    if (state.skill) {
      const skill = skillById(state.skill);
      const projects = projectsOfSkill(graph, state.skill);
      const note = projects.find((p) => p.note)?.note;
      return `<strong>${esc(skill.label)}</strong> · used in ${skill.count} ${skill.count === 1 ? "project" : "projects"}: ${projects.map(link).join(", ")}.${note ? ` <span class="skills-note">${esc(projects.find((p) => p.note).name)}: ${esc(note)}</span>` : ""}`;
    }
    if (state.project) {
      const project = projectById(state.project);
      const skills = skillsOfProject(graph, state.project);
      return `<strong>${esc(project.name)}</strong> uses ${skills.map((s) => esc(s.label)).join(" · ")}. ${project.note ? `<span class="skills-note">${esc(project.note)}</span> ` : ""}${link({ ...project, name: project.kind === "practice" ? "Open the repository" : "Open the project" })}`;
    }
    return "Pick a skill to see the projects that use it, or a project to see its skills.";
  }

  function render() {
    const skills = state.all ? graph.skills : topSkills(graph);
    const projects = state.all ? graph.projects : featuredProjectNodes(graph);
    const linkedSkills = state.project
      ? new Set(skillsOfProject(graph, state.project).map((s) => s.id))
      : null;
    const linkedProjects = state.skill
      ? new Set(skillById(state.skill).projects)
      : null;
    const chip = ({ key, label, count, pressed, linked, dim, kind }) =>
      `<button type="button" class="chip${linked ? " is-linked" : ""}${dim ? " is-dim" : ""}${kind ? ` chip-${kind}` : ""}" data-key="${esc(key)}" aria-pressed="${pressed}">${esc(label)}${count ? `<span class="count">${count}</span>` : ""}</button>`;

    const groups = graph.groups
      .map((group) => {
        const inGroup = skills.filter((s) => s.group === group.id);
        if (!inGroup.length) return "";
        return `<section class="skills-group"><h3>${esc(group.label)}</h3><div class="chips">${inGroup
          .map((s) =>
            chip({
              key: `skill:${s.id}`,
              label: s.label,
              count: s.count,
              pressed: state.skill === s.id,
              linked: linkedSkills?.has(s.id),
              dim: linkedSkills && !linkedSkills.has(s.id),
            }),
          )
          .join("")}</div></section>`;
      })
      .join("");

    const projectChips = projects
      .map((p) =>
        chip({
          key: `project:${p.id}`,
          label: p.name,
          pressed: state.project === p.id,
          linked: linkedProjects?.has(p.id),
          dim: linkedProjects && !linkedProjects.has(p.id),
          kind: p.kind === "project" ? "" : p.kind,
        }),
      )
      .join("");

    const hidden = graph.skills.length - skills.length;
    root.innerHTML = `<p id="skills-detail" class="skills-detail" role="status" aria-live="polite">${detail()}</p>
      <div class="skills-columns">
        <div class="skills-pick" role="group" aria-label="Skills">${groups}</div>
        <section class="skills-projects" role="group" aria-label="Projects"><h3>Projects</h3><div class="chips">${projectChips}</div></section>
      </div>
      <button type="button" class="chip chip-more" data-more aria-pressed="${state.all}">${state.all ? "Show fewer" : `Show all ${graph.skills.length} skills and ${graph.projects.length} projects`}</button>`;
    if (focusKey) {
      [...root.querySelectorAll("[data-key], [data-more]")]
        .find((n) => (n.dataset.key ?? "more") === focusKey)
        ?.focus({ preventScroll: true });
    }
    void hidden;
  }

  root.addEventListener("click", (event) => {
    const more = event.target.closest("[data-more]");
    const node = event.target.closest("[data-key]");
    if (more) {
      focusKey = "more";
      state.all = !state.all;
    } else if (node) {
      focusKey = node.dataset.key;
      const [kind, id] = focusKey.split(":");
      if (kind === "skill") {
        state.skill = state.skill === id ? null : id;
        state.project = null;
      } else {
        state.project = state.project === id ? null : id;
        state.skill = null;
      }
    } else return;
    render();
  });

  root.addEventListener("keydown", (event) => {
    const chips = [...root.querySelectorAll("[data-key], [data-more]")];
    const i = chips.indexOf(document.activeElement);
    if (event.key === "Escape" && (state.skill || state.project)) {
      event.stopPropagation();
      state.skill = state.project = null;
      render();
    } else if (
      i >= 0 &&
      ["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)
    ) {
      event.preventDefault();
      event.stopPropagation();
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? chips.length - 1
            : (i + (event.key === "ArrowRight" ? 1 : -1) + chips.length) %
              chips.length;
      chips[next].focus();
      focusKey = chips[next].dataset.key ?? "more";
    }
  });

  render();
}
