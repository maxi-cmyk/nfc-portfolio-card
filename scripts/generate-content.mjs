import { readFileSync, writeFileSync } from "node:fs";
import {
  allProjects,
  caseStudyProjects,
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
import { figureFor } from "../src/data/figures.js";
import { renderDatasheet } from "../src/data/datasheets.js";
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
// A fact row, a photo frame or an email line with nothing real behind it is left
// out of the page rather than shown as a placeholder. `npm run wip` still lists
// every gap, because it reads the data, not the page.
const fact = (label, value) =>
  isWip(value) ? "" : `<div><dt>${label}</dt><dd>${escape(value)}</dd></div>`;
const facts = (p) => {
  const rows = `${fact("Role", p.role)}${fact("Proof", p.proof)}`;
  return rows ? `<dl class="project-facts">${rows}</dl>` : "";
};
const mediaLabel = { photo: "Photo", screenshot: "Screenshot", video: "Clip" };
// A media slot shows the real image or clip once `src` is set; until then there
// is no frame at all.
function media(p) {
  const m = p.media;
  if (!m) return "";
  if (isWip(m.src)) return "";
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
    ${renderDatasheet(p.name, p.slug)}
    <div class="project-card-tags" aria-label="Technologies">${p.tags.map((t) => `<span class="tech-badge">${escape(t)}</span>`).join("")}</div>
    <div class="project-card-links"><div class="project-card-outbound-links">${outbound(p)}</div>${link(p, "work")}</div>
    <details class="static-case-study"><summary>Read case study</summary><p>${escape(p.insights.summary)}</p>${p.insights.sections.map((s) => `<h4>${escape(s.title)}</h4><p>${escape(s.body)}</p>`).join("")}</details>
  </article>`,
    )
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
    const download = i.download ? ` download="${escape(i.download)}"` : "";
    return `<a class="icon" data-icon="${i.key}" href="${escape(i.href)}"${download}>${inner}</a>`;
  };
  return `<nav class="desktop-icons" aria-label="Sections">${desktopIcons.map(item).join("")}</nav>`;
}
// The Selected work landing: every project as a tile, grouped. JavaScript shows
// it; without JavaScript the full cards below are the page.
// Small vector drawings for the tiles whose project has no 3D figure yet.
const THUMB_ART = {
  asteroids:
    '<svg viewBox="0 0 120 72" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M18 20l10-9 14 3 7 12-6 12-16 4-12-9z"/><path d="M84 16l12-6 14 6 3 14-10 10-16-2-8-12z"/><path d="M52 52l8-6 10 3 3 9-6 7-12-2z"/><path d="M60 70l-6-12 6 3 6-3z" stroke="var(--warm)"/><path d="M60 56V34" stroke="var(--warm)" stroke-dasharray="2 5"/></g></svg>',
  itspeak:
    '<svg viewBox="0 0 120 72" aria-hidden="true" focusable="false"><g fill="currentColor">' +
    [10, 22, 34, 18, 44, 52, 30, 46, 24, 38, 14, 26, 8]
      .map(
        (h, i) =>
          `<rect x="${8 + i * 8.6}" y="${36 - h / 2}" width="5" height="${h}"/>`,
      )
      .join("") +
    '</g><path d="M4 36h112" stroke="var(--warm)" stroke-width="1"/></svg>',
  echo: '<svg viewBox="0 0 120 72" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="60" cy="36" r="6"/><circle cx="60" cy="36" r="16" stroke-opacity=".75"/><circle cx="60" cy="36" r="27" stroke-opacity=".5"/><circle cx="60" cy="36" r="40" stroke-opacity=".28"/></g><circle cx="60" cy="36" r="3" fill="var(--warm)"/></svg>',
};
const tileScreen = (p) => {
  const fig = figureFor(p.slug);
  const inner = fig
    ? `<span class="figure-host" data-figure="${fig.id}" data-thumb aria-hidden="true"></span>`
    : (THUMB_ART[p.slug] ?? "");
  return `<span class="tile-screen is-dark" aria-hidden="true">${inner}</span>`;
};
const tile = (p) =>
  `<li><a class="work-tile" href="#work/${p.slug}">${tileScreen(p)}<span class="tile-name">${escape(p.name)}</span><span class="tile-meta">${escape(p.meta)}</span><span class="tile-hook">${escape(p.hook)}</span><span class="tile-badges">${figureFor(p.slug) ? '<span class="tile-badge">3D figure</span>' : ""}${caseStudyProjects.some((c) => c.slug === p.slug) ? '<span class="tile-badge">Case study</span>' : ""}</span></a></li>`;
const landing = () =>
  `<div id="work-landing" class="work-landing" hidden>${Object.values(
    focusCategories,
  )
    .map(
      (c) =>
        `<section class="work-group" data-group="${c.id}" aria-labelledby="wg-${c.id}"><h3 id="wg-${c.id}">${escape(c.label)}</h3><p>${escape(c.description)}</p><ul class="work-tiles">${allProjects
          .filter((p) => p.categories.includes(c.id))
          .map(tile)
          .join("")}</ul></section>`,
    )
    .join("")}</div>`;
const cardArt = `<div class="figure-fallback">${renderCard()}</div>`;
const contactCard = `<a class="push" href="data:text/vcard;charset=utf-8,${encodeURIComponent(buildVCard())}" download="Max_Leong.vcf">Save contact card (.vcf)</a>`;
const blocks = {
  cardcontact: cardArt,
  contactcard: contactCard,
  mac: `<figure class="mac-art is-paper" aria-hidden="true">${renderMac()}</figure>`,
  desktop: desktop(),
  work: `<section id="work" class="work" aria-labelledby="work-title"><div class="section-heading"><div><h2 id="work-title" tabindex="-1">Selected work</h2><p>One collection. Explore the connections between disciplines.</p></div></div>
    ${landing()}
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
