import { allProjects } from "../../data/projects.js";

let modalEl = null;
let previousActiveElement = null;

function createFlowDiagram(diagram) {
  const figure = document.createElement("figure");
  figure.className = "insights-visual";

  const flow = document.createElement("div");
  flow.className = "insights-flow";
  flow.setAttribute("role", "img");
  flow.setAttribute(
    "aria-label",
    `${diagram.label}: ${diagram.nodes
      .map(({ label, detail }) => `${label}, ${detail}`)
      .join("; ")}`,
  );

  diagram.nodes.forEach(({ label, detail }, index) => {
    const node = document.createElement("div");
    node.className = "insights-flow-node";

    const nodeIndex = document.createElement("span");
    nodeIndex.className = "insights-flow-index";
    nodeIndex.textContent = String(index + 1).padStart(2, "0");

    const nodeLabel = document.createElement("strong");
    nodeLabel.textContent = label;

    const nodeDetail = document.createElement("span");
    nodeDetail.textContent = detail;

    node.append(nodeIndex, nodeLabel, nodeDetail);
    flow.append(node);
  });

  const caption = document.createElement("figcaption");
  caption.textContent = diagram.label;

  figure.append(flow, caption);
  return figure;
}

function createInsightSection({ title, body }) {
  const section = document.createElement("section");
  section.className = "insights-detail";

  const heading = document.createElement("h4");
  heading.textContent = title;

  const copy = document.createElement("p");
  copy.textContent = body;

  section.append(heading, copy);
  return section;
}

function ensureModal() {
  if (modalEl) return modalEl;

  modalEl = document.querySelector("#project-modal");
  if (!modalEl) {
    modalEl = document.createElement("dialog");
    modalEl.id = "project-modal";
    modalEl.className = "project-modal";
    modalEl.setAttribute("aria-labelledby", "modal-project-title");
    document.body.append(modalEl);
  }

  modalEl.addEventListener("click", (event) => {
    const rect = modalEl.getBoundingClientRect();
    const isInDialog =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;
    if (!isInDialog) {
      closeProjectModal();
    }
  });

  modalEl.addEventListener("close", () => {
    if (window.location.hash.startsWith("#project/")) {
      history.replaceState(null, "", window.location.pathname);
    }
    if (
      previousActiveElement &&
      typeof previousActiveElement.focus === "function"
    ) {
      previousActiveElement.focus();
    }
  });

  return modalEl;
}

export function openProjectModal(slug) {
  const project = allProjects.find(
    (p) => p.slug === slug || p.name.toLowerCase().includes(slug.toLowerCase()),
  );

  if (!project) return false;

  const modal = ensureModal();
  previousActiveElement = document.activeElement;

  modal.replaceChildren();

  const container = document.createElement("div");
  container.className = "modal-dialog-content";

  // Topbar
  const topbar = document.createElement("div");
  topbar.className = "modal-topbar";

  const topLabel = document.createElement("span");
  topLabel.className = "modal-badge";
  topLabel.textContent = `spec://${project.slug || "project"}.insights`;

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "modal-close-btn";
  closeBtn.textContent = "[ESC / ✕]";
  closeBtn.setAttribute("aria-label", "Close project details");
  closeBtn.addEventListener("click", closeProjectModal);

  topbar.append(topLabel, closeBtn);

  // Header
  const header = document.createElement("header");
  header.className = "modal-header";

  const title = document.createElement("h2");
  title.id = "modal-project-title";
  title.className = "modal-title";
  title.textContent = project.name;

  const meta = document.createElement("p");
  meta.className = "modal-meta";
  meta.textContent = project.meta;

  header.append(title, meta);

  // Tags
  const tagsContainer = document.createElement("div");
  tagsContainer.className = "modal-tags";
  if (project.tags && Array.isArray(project.tags)) {
    project.tags.forEach((tag) => {
      const badge = document.createElement("span");
      badge.className = "tech-badge";
      badge.textContent = tag;
      tagsContainer.append(badge);
    });
  }

  // Overview Description
  const desc = document.createElement("p");
  desc.className = "modal-desc";
  desc.textContent = project.description;

  // Deep-dive case study
  const insightsSection = document.createElement("section");
  insightsSection.className = "modal-insights-box";

  const insightsHeader = document.createElement("div");
  insightsHeader.className = "insights-header";

  const insightsTitle = document.createElement("h3");
  insightsTitle.className = "insights-title";
  insightsTitle.innerHTML = '<span class="prompt">//</span> SYSTEM CASE STUDY';

  const statusBadge = document.createElement("span");
  statusBadge.className = `status-badge status-badge-${
    project.insights?.status || "pending"
  }`;
  statusBadge.textContent =
    project.insights?.statusLabel || "SOURCE REVIEW PENDING";

  insightsHeader.append(insightsTitle, statusBadge);

  const insightsSummary = document.createElement("p");
  insightsSummary.className = "insights-summary";
  insightsSummary.textContent =
    project.insights?.summary ||
    "This project's source review has not been completed yet.";

  const diagram = project.insights?.diagram
    ? createFlowDiagram(project.insights.diagram)
    : null;

  const details = document.createElement("div");
  details.className = "insights-detail-grid";
  (project.insights?.sections || []).forEach((section) => {
    details.append(createInsightSection(section));
  });

  const evidence = document.createElement("section");
  evidence.className = "insights-evidence";

  const evidenceTitle = document.createElement("h4");
  evidenceTitle.textContent = "Verification notes";

  const evidenceList = document.createElement("ul");
  (project.insights?.evidence || []).forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    evidenceList.append(listItem);
  });

  evidence.append(evidenceTitle, evidenceList);

  insightsSection.append(
    insightsHeader,
    insightsSummary,
    ...(diagram ? [diagram] : []),
    details,
    evidence,
  );

  // Links
  const linksContainer = document.createElement("div");
  linksContainer.className = "modal-links";
  if (project.links && Array.isArray(project.links)) {
    project.links.forEach(({ label, url }) => {
      const link = document.createElement("a");
      link.className = "terminal-link";
      link.href = url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = `${label.padEnd(9, " ")}→ ${url.replace("https://", "")}`;
      link.setAttribute("aria-label", `Open ${project.name} ${label}`);
      linksContainer.append(link);
    });
  }

  container.append(
    topbar,
    header,
    tagsContainer,
    desc,
    insightsSection,
    linksContainer,
  );
  modal.append(container);

  if (typeof modal.showModal === "function") {
    modal.showModal();
  } else {
    modal.setAttribute("open", "");
  }

  closeBtn.focus();
  return true;
}

export function closeProjectModal() {
  if (!modalEl) return;
  if (typeof modalEl.close === "function" && modalEl.open) {
    modalEl.close();
  } else {
    modalEl.removeAttribute("open");
  }
}
