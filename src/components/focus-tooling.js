import { getFocusTechnologyGroup } from "../data/focus-tools.js";

function createDefinition(label, values, expanded = false) {
  const row = document.createElement("div");
  const term = document.createElement("dt");
  const details = document.createElement("dd");

  term.textContent = label;
  if (expanded) {
    values.forEach((value) => {
      const item = document.createElement("span");
      item.textContent = value;
      details.append(item);
    });
  } else {
    details.textContent = values.join(" · ");
  }
  row.append(term, details);
  return row;
}

export function createFocusTooling(focusId) {
  const group = getFocusTechnologyGroup(focusId);
  if (!group) return null;

  const list = document.createElement("dl");
  list.className = "focus-tooling";
  const expanded = group.variant === "expanded";
  if (expanded) list.classList.add("focus-tooling--expanded");
  list.setAttribute("aria-label", `${group.title} tools and languages`);

  if (group.languages.length > 0) {
    list.append(createDefinition("Languages", group.languages, expanded));
  }
  list.append(createDefinition("Tools", group.tools, expanded));

  return list;
}

export function initFocusTooling() {
  document.querySelectorAll("[data-focus-tools]").forEach((container) => {
    const list = createFocusTooling(container.dataset.focusTools);
    if (list) container.replaceChildren(list);
  });
}
