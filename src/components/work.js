import { normalizeCategories } from "../data/projects.js";

let activeCategories = null;

export function renderWork(categories = []) {
  activeCategories = normalizeCategories(categories);
  const cards = [
    ...document.querySelectorAll("#work-projects > [data-project-slug]"),
  ];
  for (const card of cards) {
    const membership = card.dataset.categories.split(" ");
    card.hidden =
      activeCategories.length > 0 &&
      !activeCategories.some((id) => membership.includes(id));
  }
  document.querySelectorAll("[data-work-filter]").forEach((button) => {
    const id = button.dataset.workFilter;
    button.setAttribute(
      "aria-pressed",
      String(id ? activeCategories.includes(id) : !activeCategories.length),
    );
  });
  const count = cards.filter((card) => !card.hidden).length;
  document.getElementById("work-count").textContent =
    `${count} ${count === 1 ? "project" : "projects"}${activeCategories.length ? " matching any selected category" : ""}`;
}

export function getWorkCategories() {
  return activeCategories || [];
}

export function initWork() {
  document.getElementById("work-filters").hidden = false;
  renderWork();
}
