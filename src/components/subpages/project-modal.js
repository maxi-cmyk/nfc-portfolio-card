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

function createNarrativeHeading(title, intro) {
  const header = document.createElement("header");
  header.className = "insights-narrative-header";

  const heading = document.createElement("h4");
  heading.textContent = title;

  const copy = document.createElement("p");
  copy.textContent = intro;

  header.append(heading, copy);
  return header;
}

function createPipeline({ title, intro, source, lanes, merge }) {
  const section = document.createElement("section");
  section.className = "insights-pipeline";
  section.append(createNarrativeHeading(title, intro));

  const map = document.createElement("div");
  map.className = "insights-pipeline-map";

  const sourceNode = document.createElement("div");
  sourceNode.className = "insights-pipeline-terminal insights-pipeline-source";
  const sourceLabel = document.createElement("strong");
  sourceLabel.textContent = source.label;
  const sourceDetail = document.createElement("span");
  sourceDetail.textContent = source.detail;
  sourceNode.append(sourceLabel, sourceDetail);

  const laneList = document.createElement("div");
  laneList.className = "insights-pipeline-lanes";
  lanes.forEach(({ label, steps }) => {
    const lane = document.createElement("section");
    lane.className = "insights-pipeline-lane";

    const laneTitle = document.createElement("h5");
    laneTitle.textContent = label;

    const sequence = document.createElement("ol");
    steps.forEach((step) => {
      const item = document.createElement("li");
      item.textContent = step;
      sequence.append(item);
    });

    lane.append(laneTitle, sequence);
    laneList.append(lane);
  });

  const mergeNode = document.createElement("div");
  mergeNode.className = "insights-pipeline-terminal insights-pipeline-merge";
  const mergeLabel = document.createElement("strong");
  mergeLabel.textContent = merge.label;
  const mergeDetail = document.createElement("span");
  mergeDetail.textContent = merge.detail;
  mergeNode.append(mergeLabel, mergeDetail);

  map.append(sourceNode, laneList, mergeNode);
  section.append(map);
  return section;
}

function createLifecycle({ title, intro, steps }) {
  const section = document.createElement("section");
  section.className = "insights-lifecycle";
  section.append(createNarrativeHeading(title, intro));

  const sequence = document.createElement("ol");
  sequence.className = "insights-lifecycle-sequence";

  steps.forEach(({ title: stepTitle, body, state }, index) => {
    const item = document.createElement("li");
    item.className = "insights-lifecycle-step";
    if (state) item.dataset.state = state;

    const marker = document.createElement("span");
    marker.className = "insights-lifecycle-marker";
    marker.textContent = String(index + 1).padStart(2, "0");
    marker.setAttribute("aria-hidden", "true");

    const heading = document.createElement("h5");
    heading.textContent = stepTitle;

    const copy = document.createElement("p");
    copy.textContent = body;

    item.append(marker, heading, copy);
    sequence.append(item);
  });

  section.append(sequence);
  return section;
}

function createFrameLoop({ title, intro, budget, phases, after }) {
  const section = document.createElement("section");
  section.className = "insights-frame-loop";
  section.append(createNarrativeHeading(title, intro));

  const frame = document.createElement("div");
  frame.className = "insights-frame";

  const timing = document.createElement("div");
  timing.className = "insights-frame-budget";
  const timingValue = document.createElement("strong");
  timingValue.textContent = budget;
  const timingLabel = document.createElement("span");
  timingLabel.textContent = "frame budget";
  timing.append(timingValue, timingLabel);

  const phaseList = document.createElement("ol");
  phaseList.className = "insights-frame-phases";
  phases.forEach(({ label, detail }) => {
    const item = document.createElement("li");
    const phaseLabel = document.createElement("strong");
    phaseLabel.textContent = label;
    const phaseDetail = document.createElement("span");
    phaseDetail.textContent = detail;
    item.append(phaseLabel, phaseDetail);
    phaseList.append(item);
  });

  frame.append(timing, phaseList);

  const persistence = document.createElement("p");
  persistence.className = "insights-frame-after";
  const persistenceLabel = document.createElement("strong");
  persistenceLabel.textContent = after.label;
  persistence.append(persistenceLabel, ` ${after.detail}`);

  section.append(frame, persistence);
  return section;
}

function createEventSequence({ title, intro, devices, steps }) {
  const section = document.createElement("section");
  section.className = "insights-event-sequence";
  section.append(createNarrativeHeading(title, intro));

  const boundaries = document.createElement("div");
  boundaries.className = "insights-device-boundaries";

  const boundariesTitle = document.createElement("h5");
  boundariesTitle.className = "insights-event-section-label";
  boundariesTitle.textContent = "Device responsibilities";
  section.append(boundariesTitle);

  devices.forEach(({ id, label, detail }) => {
    const device = document.createElement("div");
    device.className = "insights-device";
    device.dataset.device = id;

    const deviceLabel = document.createElement("strong");
    deviceLabel.textContent = label;
    const deviceDetail = document.createElement("span");
    deviceDetail.textContent = detail;
    device.append(deviceLabel, deviceDetail);
    boundaries.append(device);
  });

  const sequence = document.createElement("ol");
  sequence.className = "insights-event-list";

  const sequenceTitle = document.createElement("h5");
  sequenceTitle.className = "insights-event-section-label";
  sequenceTitle.textContent = "Event sequence";

  steps.forEach(({ actor, actorLabel, title: stepTitle, body }, index) => {
    const item = document.createElement("li");
    item.className = "insights-event-step";
    item.dataset.actor = actor;

    const marker = document.createElement("span");
    marker.className = "insights-event-marker";
    marker.textContent = String(index + 1).padStart(2, "0");
    marker.setAttribute("aria-hidden", "true");

    const owner = document.createElement("span");
    owner.className = "insights-event-actor";
    owner.textContent = actorLabel;

    const copy = document.createElement("div");
    copy.className = "insights-event-copy";
    const heading = document.createElement("h5");
    heading.textContent = stepTitle;
    const paragraph = document.createElement("p");
    paragraph.textContent = body;
    copy.append(heading, paragraph);

    item.append(marker, owner, copy);
    sequence.append(item);
  });

  section.append(boundaries, sequenceTitle, sequence);
  return section;
}

const insightRenderers = {
  diagram: createFlowDiagram,
  howItWorks: createHowItWorks,
  pipeline: createPipeline,
  lifecycle: createLifecycle,
  frameLoop: createFrameLoop,
  eventSequence: createEventSequence,
};

const defaultInsightOrder = ["summary", "diagram", "howItWorks", "sections"];

export function getInsightContentOrder(insights = {}) {
  const requestedOrder = insights.contentOrder || defaultInsightOrder;
  const available = (block) => {
    if (block === "summary") return Boolean(insights.summary);
    if (block === "sections") return Boolean(insights.sections?.length);
    return Boolean(insightRenderers[block] && insights[block]);
  };

  return requestedOrder.filter(
    (block, index) =>
      available(block) && requestedOrder.indexOf(block) === index,
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

export function openProjectModal(slug, returnFocusElement) {
  const project = allProjects.find(
    (p) => p.slug === slug || p.name.toLowerCase().includes(slug.toLowerCase()),
  );

  if (!project) return false;

  const modal = ensureModal();
  const isAlreadyOpen = modal.open || modal.hasAttribute("open");
  if (!isAlreadyOpen) {
    previousActiveElement = returnFocusElement || document.activeElement;
  }

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
  const insights = project.insights || { summary: project.description };
  const insightsSection = document.createElement("section");
  insightsSection.className = `modal-insights-box insights-layout--${insights.layout || "default"}`;

  const insightsTitle = document.createElement("h3");
  insightsTitle.className = "insights-title";
  insightsTitle.innerHTML = '<span class="prompt">//</span> SYSTEM CASE STUDY';

  insightsSection.append(insightsTitle);

  getInsightContentOrder(insights).forEach((block) => {
    if (block === "summary") {
      const summary = document.createElement("p");
      summary.className = "insights-summary";
      summary.textContent = insights.summary;
      insightsSection.append(summary);
    }

    if (block === "sections") {
      const details = document.createElement("div");
      details.className = "insights-detail-grid";
      insights.sections.forEach((section) => {
        details.append(createInsightSection(section));
      });
      insightsSection.append(details);
    }

    if (insightRenderers[block]) {
      insightsSection.append(insightRenderers[block](insights[block]));
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
  modal.scrollTop = 0;

  if (!isAlreadyOpen) {
    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      modal.setAttribute("open", "");
    }
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
