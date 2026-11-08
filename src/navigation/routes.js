import {
  allProjects,
  caseStudyProjects,
  normalizeCategories,
  resolveCategory,
} from "../data/projects.js";

// A project can ride along with a filter: #work?categories=a,b&project=slug
export function workHash(categories = [], slug = null) {
  const selected = normalizeCategories(categories);
  if (!selected.length) return slug ? `#work/${slug}` : "#work";
  const base = `#work?categories=${selected.join(",")}`;
  return slug ? `${base}&project=${slug}` : base;
}

export function projectHash(slug, step) {
  return step ? `#project/${slug}/${step}` : `#project/${slug}`;
}

const SECTION_IDS = ["home", "terminal", "certificates", "contact", "skills"];
const SECTION_ALIASES = { credentials: "certificates" };

// Hashes: #home #terminal #work #work/<slug> #work?categories=a,b
// #project/<slug> #project/<slug>/<step> #project/<slug>/read
// #skills #certificates (also #credentials) #contact
// Retired category ids in #focus/... and ?categories= still resolve.
export function parseRoute(hash = "") {
  if (hash === "#focus" || hash === "#work" || hash.startsWith("#work?")) {
    const query = new URLSearchParams(hash.split("?")[1] || "");
    const raw = (query.get("categories") || "").split(",").filter(Boolean);
    const resolved = raw.map(resolveCategory);
    if (resolved.some((id) => id === undefined)) return { kind: "missing" };
    const categories = normalizeCategories(resolved.filter(Boolean));
    const slug = query.get("project");
    if (slug !== null && !allProjects.some((p) => p.slug === slug)) {
      return { kind: "missing" };
    }
    return {
      kind: "work",
      categories,
      hash: workHash(categories, slug),
      ...(slug ? { slug } : {}),
    };
  }
  if (hash.startsWith("#work/")) {
    const slug = hash.slice(6);
    return allProjects.some((p) => p.slug === slug)
      ? { kind: "work", categories: [], hash: `#work/${slug}`, slug }
      : { kind: "missing" };
  }
  if (hash.startsWith("#focus/")) {
    const id = resolveCategory(hash.slice(7));
    if (id === undefined) return { kind: "missing" };
    const categories = id ? [id] : [];
    return { kind: "work", categories, hash: workHash(categories) };
  }
  if (hash.startsWith("#project/")) {
    const [slug, step, ...rest] = hash.slice(9).split("/");
    if (!caseStudyProjects.some((p) => p.slug === slug) || rest.length) {
      return { kind: "missing" };
    }
    if (step === undefined) return { kind: "project", slug };
    if (step === "read") return { kind: "project", slug, read: true };
    if (/^[1-9]\d?$/.test(step)) {
      return { kind: "project", slug, step: Number(step) };
    }
    return { kind: "missing" };
  }
  const raw = hash.slice(1) || "home";
  const id = Object.hasOwn(SECTION_ALIASES, raw) ? SECTION_ALIASES[raw] : raw;
  return SECTION_IDS.includes(id)
    ? { kind: "section", id }
    : { kind: "missing" };
}
