import {
  allProjects,
  categoryLabel,
  focusCategories,
  normalizeCategories,
} from "../data/projects.js";
import { workHash } from "../navigation/routes.js";

let activeCategories = [];

const getCards = () => [
  ...document.querySelectorAll("#work-projects > [data-project-slug]"),
];

// Shows one project at a time. Filters (groups) choose which projects the
// pager walks through; `slug` picks the current one.
export function renderWork(categories = [], slug = null) {
  activeCategories = normalizeCategories(categories);
  const visible = getCards().filter(
    (card) =>
      !activeCategories.length ||
      card.dataset.categories
        .split(" ")
        .some((id) => activeCategories.includes(id)),
  );
  const current =
    visible.find((card) => card.dataset.projectSlug === slug) ?? visible[0];
  getCards().forEach((card) => {
    card.hidden = card !== current;
  });
  document.querySelectorAll("#shelf [data-categories]").forEach((row) => {
    const membership = row.dataset.categories.split(" ");
    row.hidden =
      activeCategories.length > 0 &&
      !activeCategories.some((id) => membership.includes(id));
  });
  document.querySelectorAll("[data-work-filter]").forEach((button) => {
    const id = button.dataset.workFilter;
    button.setAttribute(
      "aria-pressed",
      String(id ? activeCategories.includes(id) : !activeCategories.length),
    );
  });
  const slugs = visible.map((card) => card.dataset.projectSlug);
  const index = Math.max(0, slugs.indexOf(current?.dataset.projectSlug));
  const status = document.getElementById("work-count");
  if (status) {
    status.textContent = `Project ${index + 1} of ${slugs.length}${
      activeCategories.length
        ? ` in ${activeCategories.map(categoryLabel).join(" + ")}`
        : ""
    }`;
  }
  renderPager(slugs, index);
  return { slugs, index, current: slugs[index] ?? null };
}

export function getWorkCategories() {
  return activeCategories;
}

// Two pop-up menus (which group, which project) and a status strip with Prev
// and Next, in place of the chip row and the numbered strip.
function ensureControls() {
  const work = document.getElementById("work");
  if (!work || work.querySelector(".work-controls")) return;
  const controls = document.createElement("div");
  controls.className = "work-controls";
  controls.innerHTML = `<label class="popup"><span>Show</span><select id="work-group" aria-label="Show projects in"></select></label>
    <label class="popup"><span>Project</span><select id="work-jump" aria-label="Go to project"></select></label>`;
  document.getElementById("work-projects")?.before(controls);
  const status = document.createElement("div");
  status.className = "statusbar";
  status.setAttribute("role", "group");
  status.setAttribute("aria-label", "Projects");
  status.innerHTML = `<a class="push" id="work-prev" data-sideways aria-label="Previous project">‹ Prev</a><span data-count-slot></span><a class="push" id="work-next" data-sideways aria-label="Next project">Next ›</a>`;
  work.append(status);
  const count = document.getElementById("work-count");
  if (count) status.querySelector("[data-count-slot]").replaceWith(count);
}

const esc = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function renderPager(slugs, index) {
  ensureControls();
  const hash = (slug) => workHash(activeCategories, slug);
  const prev = slugs[(index - 1 + slugs.length) % slugs.length];
  const next = slugs[(index + 1) % slugs.length];
  document.getElementById("work-prev").href = hash(prev);
  document.getElementById("work-next").href = hash(next);

  const group = document.getElementById("work-group");
  const several = activeCategories.length > 1;
  group.innerHTML =
    `<option value="">All work</option>` +
    Object.values(focusCategories)
      .map(
        (c) =>
          `<option value="${c.id}"${activeCategories.length === 1 && activeCategories[0] === c.id ? " selected" : ""}>${esc(c.label)}</option>`,
      )
      .join("") +
    (several
      ? `<option value="__multi" selected>${activeCategories.map(categoryLabel).map(esc).join(" + ")}</option>`
      : "");
  group.value = several ? "__multi" : (activeCategories[0] ?? "");

  const jump = document.getElementById("work-jump");
  jump.innerHTML = slugs
    .map((slug, i) => {
      const project = allProjects.find((p) => p.slug === slug);
      return `<option value="${slug}"${i === index ? " selected" : ""}>${esc(project.name)}</option>`;
    })
    .join("");
  jump.value = slugs[index];
}

export function initWork() {
  ensureControls();
}
