import { readFileSync, writeFileSync } from "node:fs";
import {
  allProjects,
  caseStudyProjects,
  shelfEntries,
  focusCategories,
  categoryLabel,
  isWip,
} from "../src/data/projects.js";
import { getSkillGraph } from "../src/data/skills.js";
import {
  desktopIcons,
  renderCard,
  renderIcon,
  renderMac,
} from "../src/data/icons.js";
import { buildVCard } from "../src/data/vcard.js";
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
const wip = '<span class="wip">WIP</span>';
const fact = (label, value) =>
  `<div><dt>${label}</dt><dd>${isWip(value) ? wip : escape(value)}</dd></div>`;
const facts = (p) =>
  `<dl class="project-facts">${fact("Role", p.role)}${fact("Proof", p.proof)}</dl>`;
const mediaLabel = { photo: "Photo", screenshot: "Screenshot", video: "Clip" };
// A media slot shows the real image or clip once `src` is set; until then it is
// an explicit WIP frame that says what to supply.
function media(p) {
  const m = p.media;
  if (!m) return "";
  if (isWip(m.src)) {
    return `<figure class="media media-wip"><div class="media-bar"><span>${mediaLabel[m.kind]} · WIP</span></div><div class="media-body"><span class="wip">WIP</span><figcaption>${escape(m.want)}</figcaption></div></figure>`;
  }
  const size =
    m.width && m.height ? ` width="${m.width}" height="${m.height}"` : "";
  const caption = m.caption
    ? `<figcaption>${escape(m.caption)}</figcaption>`
    : "";
  if (m.kind === "video") {
    const poster = m.poster ? ` poster="${escape(m.poster)}"` : "";
    return `<figure class="media"><video src="${escape(m.src)}"${poster}${size} muted loop playsinline preload="none" controls aria-label="${escape(m.alt)}"></video>${caption}</figure>`;
  }
  return `<figure class="media"><img src="${escape(m.src)}" alt="${escape(m.alt)}"${size} loading="lazy" decoding="async">${caption}</figure>`;
}
const groups = (p) => p.categories.map(categoryLabel).map(escape).join(" · ");
const outbound = (p) =>
  [
    ...(p.live
      ? [
          `<a class="terminal-link" href="${escape(p.live.url)}" target="_blank" rel="noreferrer">${escape(p.live.label)} ↗</a>`,
        ]
      : []),
    ...p.links.map(
      (l) =>
        `<a class="terminal-link" href="${escape(l.url)}" target="_blank" rel="noreferrer">${l.label === "github" ? "View source on GitHub" : escape(l.label)} ↗</a>`,
    ),
  ].join("");
function cards() {
  return allProjects
    .map(
      (
        p,
      ) => `<article class="full-project-card" data-project-slug="${p.slug}" data-categories="${p.categories.join(" ")}" id="project/${p.slug}">
    <header class="project-card-header"><h3 class="project-card-title">${escape(p.name)}</h3><span class="project-card-meta">${escape(p.meta)}</span></header>
    <p class="project-categories">${groups(p)}</p>
    <p class="project-card-desc">${escape(p.hook)}</p>
    ${media(p)}
    ${facts(p)}
    <div class="project-card-tags" aria-label="Technologies">${p.tags.map((t) => `<span class="tech-badge">${escape(t)}</span>`).join("")}</div>
    <div class="project-card-links"><div class="project-card-outbound-links">${outbound(p)}</div>${link(p, "work")}</div>
    <details class="static-case-study"><summary>Read case study</summary><p>${escape(p.insights.summary)}</p>${p.insights.sections.map((s) => `<h4>${escape(s.title)}</h4><p>${escape(s.body)}</p>`).join("")}</details>
  </article>`,
    )
    .join("\n");
}
function shelf() {
  return shelfEntries
    .map((e) => {
      const study = e.caseStudy
        ? caseStudyProjects.find((p) => p.slug === e.caseStudy)
        : null;
      return `<li class="shelf-row" data-shelf-id="${e.id}" data-categories="${e.categories.join(" ")}">
    <div class="shelf-main"><h3>${escape(e.name)}</h3><span class="project-card-meta">${escape(e.meta)}</span></div>
    <p class="shelf-hook">${escape(e.hook)}</p>
    <p class="shelf-stack">${e.tags.map(escape).join(" · ")}</p>
    ${facts(e)}
    <div class="project-card-outbound-links">${outbound(e)}${study ? link(study, "shelf") : ""}</div>
  </li>`;
    })
    .join("\n");
}
function skillsBlock() {
  const graph = getSkillGraph();
  const byId = new Map(graph.projects.map((p) => [p.id, p]));
  const index = graph.skills
    .map(
      (s) =>
        `<div><dt>${escape(s.label)}</dt><dd>${s.projects
          .map((id) => {
            const p = byId.get(id);
            return `<a href="${escape(p.href)}"${p.external ? ' target="_blank" rel="noreferrer"' : ""}>${escape(p.name)}</a>`;
          })
          .join(", ")}</dd></div>`,
    )
    .join("");
  return `<section id="skills" class="skills" aria-labelledby="skills-title"><div class="section-heading"><div><h2 id="skills-title">Skills</h2><p>Every skill links to the projects that use it. Pick a skill to see them, or a project to see its skills.</p></div></div><div class="skills-graph" data-skills-graph><dl class="skill-index">${index}</dl></div></section>`;
}
function desktop() {
  const item = (i) => {
    const inner = `${renderIcon(i.icon)}<span class="icon-label">${escape(i.label)}</span>`;
    if (i.terminal) {
      return `<button type="button" class="icon" data-icon="${i.key}" data-terminal-toggle data-scenes-only hidden aria-expanded="false" aria-controls="terminal">${inner}</button>`;
    }
    const download = i.download ? ` download="${escape(i.download)}"` : "";
    return `<a class="icon" data-icon="${i.key}" href="${escape(i.href)}"${download}>${inner}</a>`;
  };
  return `<nav class="desktop-icons" aria-label="Sections">${desktopIcons.map(item).join("")}</nav>`;
}
const cardArt = `<div class="figure-fallback">${renderCard()}</div>`;
const contactCard = `<a class="push" href="data:text/vcard;charset=utf-8,${encodeURIComponent(buildVCard())}" download="Max_Leong.vcf">Save contact card (.vcf)</a>`;
const blocks = {
  cardcontact: cardArt,
  contactcard: contactCard,
  mac: `<figure class="mac-art" aria-hidden="true">${renderMac()}</figure>`,
  desktop: desktop(),
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
  </section>`,
  shelf: `<section id="shelf" class="shelf" aria-labelledby="shelf-title"><div class="section-heading"><div><h2 id="shelf-title">Also built</h2><p>Smaller, newer or unfinished projects, one row each.</p></div></div><ul class="shelf-list">${shelf()}</ul></section>`,
  skills: skillsBlock(),
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
