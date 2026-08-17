import { allProjects } from "../../data/projects.js";

let modalEl = null;
let previousActiveElement = null;

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

  // Deep-Dive Insights (WIP) Section
  const insightsSection = document.createElement("section");
  insightsSection.className = "modal-insights-box";

  const insightsHeader = document.createElement("div");
  insightsHeader.className = "insights-header";

  const insightsTitle = document.createElement("h3");
  insightsTitle.className = "insights-title";
  insightsTitle.innerHTML =
    '<span class="prompt">//</span> ARCHITECTURE & SYSTEM INSIGHTS';

  const statusBadge = document.createElement("span");
  statusBadge.className = "status-badge-wip";
  statusBadge.textContent = project.insights?.status || "WIP";

  insightsHeader.append(insightsTitle, statusBadge);

  const insightsSummary = document.createElement("p");
  insightsSummary.className = "insights-summary";
  insightsSummary.textContent =
    project.insights?.summary ||
    "Detailed system teardown and hardware schematics currently being documented.";

  const archLabel = document.createElement("p");
  archLabel.className = "insights-sublabel";
  archLabel.textContent = "Pipeline / Data Flow Topology:";

  const archDiagram = document.createElement("pre");
  archDiagram.className = "insights-architecture";
  archDiagram.textContent =
    project.insights?.architecture ||
    "Component A ──[Interrupt/Event]──> Controller ──> Output Telemetry";

  const highlightsContainer = document.createElement("div");
  highlightsContainer.className = "insights-highlights";

  if (
    project.insights?.highlights &&
    Array.isArray(project.insights.highlights)
  ) {
    const list = document.createElement("ul");
    list.className = "insights-list";
    project.insights.highlights.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.append(li);
    });
    highlightsContainer.append(list);
  }

  insightsSection.append(
    insightsHeader,
    insightsSummary,
    archLabel,
    archDiagram,
    highlightsContainer,
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
