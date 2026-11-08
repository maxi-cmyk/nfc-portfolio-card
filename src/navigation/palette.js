// Command-palette items and matching. Pure: the dialog lives in components/.
import { allProjects, caseStudyProjects } from "../data/projects.js";
import { projectHash } from "./routes.js";

export function getPaletteItems() {
  return [
    {
      id: "hub",
      label: "Home",
      hint: "Name and entry points",
      hash: "#home",
      keywords: "hub intro start",
    },
    {
      id: "work",
      label: "Work",
      hint: `${allProjects.length} projects`,
      hash: "#work",
      keywords: "projects portfolio",
    },
    ...allProjects.map((p) => ({
      id: `work-${p.slug}`,
      label: p.name,
      hint: `Project · ${p.meta}`,
      hash: `#work/${p.slug}`,
      keywords: p.tags.join(" "),
    })),
    ...caseStudyProjects.map((p) => ({
      id: `case-${p.slug}`,
      label: `${p.name} case study`,
      hint: "Step by step",
      hash: projectHash(p.slug),
      keywords: "case study steps write-up",
    })),
    {
      id: "skills",
      label: "Skills",
      hint: "Languages and tools",
      hash: "#skills",
      keywords: "stack tools languages",
    },
    {
      id: "credentials",
      label: "Credentials",
      hint: "Certificates",
      hash: "#certificates",
      keywords: "certificates certs",
    },
    {
      id: "contact",
      label: "Contact",
      hint: "Links and resume",
      hash: "#contact",
      keywords: "email github linkedin",
    },
    {
      id: "terminal",
      label: "Terminal",
      hint: "Type commands in the console",
      action: "terminal",
      keywords: "shell command line",
    },
    {
      id: "resume",
      label: "Resume",
      hint: "Download the PDF",
      href: "/assets/Max_Leong_Resume.pdf",
      download: "Max_Leong_Resume.pdf",
      keywords: "cv",
    },
  ];
}

const clean = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function score(item, query) {
  const label = clean(item.label);
  if (label === query) return 0;
  if (label.startsWith(query)) return 1;
  if (label.split(" ").some((word) => word.startsWith(query))) return 2;
  if (label.includes(query)) return 3;
  if (clean(`${item.hint} ${item.keywords ?? ""}`).includes(query)) return 4;
  return Infinity;
}

// Empty query lists the top-level places; otherwise best matches first.
export function matchPalette(query = "", items = getPaletteItems(), limit = 8) {
  const q = clean(query);
  if (!q) {
    const topLevel = new Set([
      "hub",
      "work",
      "skills",
      "credentials",
      "contact",
      "terminal",
      "resume",
    ]);
    return items.filter((item) => topLevel.has(item.id)).slice(0, limit);
  }
  return items
    .map((item, index) => ({ item, index, rank: score(item, q) }))
    .filter(({ rank }) => rank !== Infinity)
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .slice(0, limit)
    .map(({ item }) => item);
}
