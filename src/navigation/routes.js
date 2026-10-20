import {
  allProjects,
  focusCategories,
  normalizeCategories,
} from "../data/projects.js";

export function workHash(categories = []) {
  const selected = normalizeCategories(categories);
  return selected.length ? `#work?categories=${selected.join(",")}` : "#work";
}

export function parseRoute(hash = "") {
  if (hash === "#focus" || hash === "#work" || hash.startsWith("#work?")) {
    const query = new URLSearchParams(hash.split("?")[1] || "");
    const raw = (query.get("categories") || "").split(",").filter(Boolean);
    if (raw.some((id) => !Object.hasOwn(focusCategories, id)))
      return { kind: "missing" };
    const categories = normalizeCategories(raw);
    return { kind: "work", categories, hash: workHash(categories) };
  }
  if (hash.startsWith("#focus/")) {
    const id = hash.slice(7);
    return Object.hasOwn(focusCategories, id)
      ? { kind: "work", categories: [id], hash: workHash([id]) }
      : { kind: "missing" };
  }
  if (hash.startsWith("#project/")) {
    const slug = hash.slice(9);
    return allProjects.some((p) => p.slug === slug)
      ? { kind: "project", slug }
      : { kind: "missing" };
  }
  const id = hash.slice(1) || "home";
  return ["home", "terminal", "certificates", "contact"].includes(id)
    ? { kind: "section", id }
    : { kind: "missing" };
}
