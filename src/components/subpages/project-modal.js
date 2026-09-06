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

function createHowItWorks({ title, intro, steps, takeaway }) {
  const section = document.createElement("section");
  section.className = "insights-how-it-works";

  const heading = document.createElement("h4");
  heading.textContent = title;

  const introduction = document.createElement("p");
  introduction.className = "insights-how-intro";
  introduction.textContent = intro;

  const sequence = document.createElement("ol");
  sequence.className = "insights-how-sequence";

  steps.forEach(({ title: stepTitle, body, code }, index) => {
    const item = document.createElement("li");
    item.className = "insights-how-step";

    const marker = document.createElement("span");
    marker.className = "insights-how-marker";
    marker.textContent = String(index + 1).padStart(2, "0");
    marker.setAttribute("aria-hidden", "true");

    const copy = document.createElement("div");
    copy.className = "insights-how-copy";

    const stepHeading = document.createElement("h5");
    stepHeading.textContent = stepTitle;

    const paragraph = document.createElement("p");
    paragraph.textContent = body;

    copy.append(stepHeading, paragraph);

    if (code) {
      const expression = document.createElement("code");
      expression.textContent = code;
      copy.append(expression);
    }

    item.append(marker, copy);
    sequence.append(item);
  });

  section.append(heading, introduction, sequence);

  if (takeaway) {
    const outcome = document.createElement("p");
    outcome.className = "insights-how-takeaway";
    outcome.textContent = takeaway;
    section.append(outcome);
  }

  return section;
}

const defaultInsightOrder = ["summary", "diagram", "howItWorks", "sections"];

export function getInsightContentOrder(insights = {}) {
  const requestedOrder = insights.contentOrder || defaultInsightOrder;
  const available = {
    summary: Boolean(insights.summary),
    diagram: Boolean(insights.diagram),
    howItWorks: Boolean(insights.howItWorks),
    sections: Boolean(insights.sections?.length),
  };

  return requestedOrder.filter(
    (block, index) =>
      available[block] && requestedOrder.indexOf(block) === index,
  );
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

  const insightsTitle = document.createElement("h3");
  insightsTitle.className = "insights-title";
  insightsTitle.innerHTML = '<span class="prompt">//</span> SYSTEM CASE STUDY';

  const insights = project.insights || { summary: project.description };
  insightsSection.append(insightsTitle);

  getInsightContentOrder(insights).forEach((block) => {
    if (block === "summary") {
      const summary = document.createElement("p");
      summary.className = "insights-summary";
      summary.textContent = insights.summary;
      insightsSection.append(summary);
    }

    if (block === "diagram") {
      insightsSection.append(createFlowDiagram(insights.diagram));
    }

    if (block === "howItWorks") {
      insightsSection.append(createHowItWorks(insights.howItWorks));
    }

    if (block === "sections") {
      const details = document.createElement("div");
      details.className = "insights-detail-grid";
      insights.sections.forEach((section) => {
        details.append(createInsightSection(section));
      });
      insightsSection.append(details);
    }
  });

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
