import { readFileSync, writeFileSync } from "node:fs";
import {
  allProjects,
  featuredProjects,
  focusCategories,
  categoryLabel,
} from "../src/data/projects.js";
import { certificates } from "../src/data/certificates.js";

const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const link = (p, context) =>
  `<a class="terminal-link project-insights-btn" id="case-study-${context}-${p.slug}" href="#project/${p.slug}" data-project="${p.slug}" aria-label="Open ${escape(p.name)} case study" aria-haspopup="dialog" aria-controls="project-modal">View case study <span aria-hidden="true">↗</span></a>`;
function cards() {
  return allProjects
    .map(
      (
        p,
        i,
      ) => `<article class="full-project-card" data-project-slug="${p.slug}" data-categories="${p.categories.join(" ")}" id="project/${p.slug}">
    <header class="project-card-header"><h3 class="project-card-title">${escape(p.name)}</h3><span class="project-card-meta">${escape(p.meta)}</span></header>
    <p class="project-categories">${p.categories.map(categoryLabel).map(escape).join(" · ")}</p>
    <p class="project-card-desc">${escape(p.description)}</p>
    <div class="project-card-tags" aria-label="Technologies">${p.tags.map((t) => `<span class="tech-badge">${escape(t)}</span>`).join("")}</div>
    <div class="project-card-links"><div class="project-card-outbound-links">${p.links.map((l) => `<a class="terminal-link" href="${escape(l.url)}" target="_blank" rel="noreferrer">${l.label === "github" ? "View source on GitHub" : escape(l.label)} ↗</a>`).join("")}</div>${link(p, "work")}</div>
    <details class="static-case-study"><summary>Read case study</summary><p>${escape(p.insights.summary)}</p>${p.insights.sections.map((s) => `<h4>${escape(s.title)}</h4><p>${escape(s.body)}</p>`).join("")}</details>
  </article>`,
    )
    .join("\n");
}
const blocks = {
  featured: `<section class="featured-work" aria-labelledby="featured-title"><div class="section-heading"><h2 id="featured-title">A few things I’ve built.</h2><a href="#work">Explore all ${allProjects.length} projects →</a></div><div class="featured-list">${featuredProjects.map((p) => `<article class="featured-project"><div><p class="project-categories">${p.categories.map(categoryLabel).map(escape).join(" · ")}</p><h3>${escape(p.name)}</h3><p class="featured-subject">${escape(p.feature.subject)}</p><p>${escape(p.feature.note)}</p></div>${link(p, "featured")}</article>`).join("")}</div></section>`,
  work: `<section id="work" class="work" aria-labelledby="work-title"><div class="section-heading"><div><h2 id="work-title" tabindex="-1">Selected work</h2><p>One collection. Explore the connections between disciplines.</p></div></div>
    <div id="work-filters" class="work-filters" role="group" aria-label="Filter projects by category" hidden><button type="button" data-work-filter="" aria-pressed="true">All work</button>${Object.keys(
      focusCategories,
    )
      .map(
        (id) =>
          `<button type="button" data-work-filter="${id}" aria-pressed="false">${escape(categoryLabel(id))}</button>`,
      )
      .join("")}</div>
    <p id="work-count" class="work-count" role="status" aria-live="polite" aria-atomic="true">${allProjects.length} projects</p>
    <div id="work-projects" class="work-projects">${cards()}</div>
    <details class="tool-disclosure"><summary>Tools & languages by focus</summary><div class="focus-summaries">${Object.values(
      focusCategories,
    )
      .map(
        (c) =>
          `<section><h3><a href="#focus/${c.id}">${escape(categoryLabel(c.id))}</a></h3><p>${escape(c.description)}</p><div data-focus-tools="${c.id}"></div></section>`,
      )
      .join("")}</div></details>
  </section>`,
  certificates: certificates
    .map(
      (c) =>
        `<article class="certificate-entry"><a class="certificate-preview" href="${escape(c.pdfUrl)}"><img src="${escape(c.previewUrl)}" alt="${escape(c.previewAlt)}" width="1400" height="1082" loading="lazy" decoding="async"></a><div class="certificate-details"><p>${escape(c.issuer)} · ${escape(c.issued)}</p><h3>${escape(c.title)}</h3><p>${escape(c.summary)}</p><a href="${escape(c.pdfUrl)}">Open certificate PDF ↗</a></div></article>`,
    )
    .join(""),
};
export function generateContent(html) {
  for (const [name, content] of Object.entries(blocks)) {
    const start = `<!-- generated:${name}:start -->`;
    const end = `<!-- generated:${name}:end -->`;
    const a = html.indexOf(start),
      b = html.indexOf(end);
    if (a === -1 || b === -1)
      throw new Error(`Missing generated content markers: ${name}`);
    html =
      html.slice(0, a + start.length) + "\n" + content + "\n" + html.slice(b);
  }
  return html;
}
const current = readFileSync("index.html", "utf8");
const generated = generateContent(current);
if (process.argv.includes("--check")) {
  if (current !== generated) {
    console.error("Static project content is stale. Run npm run content.");
    process.exitCode = 1;
  }
} else writeFileSync("index.html", generated);
