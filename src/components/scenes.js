import { allProjects, caseStudyProjects } from "../data/projects.js";
import { getCaseStudyView } from "../data/case-study-steps.js";
import { parseRoute, projectHash, workHash } from "../navigation/routes.js";
import {
  createSceneMachine,
  parentScene,
  routeToScene,
  sceneToHash,
} from "../navigation/scenes.js";
import {
  closeProjectModal,
  openProjectModal,
} from "./subpages/project-modal.js";
import { getWorkCategories, initWork, renderWork } from "./work.js";
import { initTerminalDrawer } from "./terminal-drawer.js";
import { initPalette } from "./palette-ui.js";
import { createLights } from "./lights.js";
import { figureFor } from "../data/figures.js";
import { renderControls } from "./figure-controls.js";
import {
  createWindowMemory,
  parseZoomed,
  toggleZoomed,
} from "../navigation/windows.js";
import { pickTransition } from "../navigation/transitions.js";
import { createTransitions } from "./transitions.js";

const baseTitle = "Max Leong — Portfolio";
const instant = { behavior: "instant" };

// Scene -> the element that holds it, its heading, its desktop icon and its
// window title.
const SCENE_ELEMENTS = {
  hub: {
    el: "#home",
    heading: "#site-title",
    icon: "work",
    title: "About Max",
  },
  work: { el: "#work", heading: "#work-title", icon: "work", title: "Work" },
  case: {
    el: "#case",
    heading: "#case-title",
    icon: "work",
    title: "Case study",
  },
  shelf: {
    el: "#shelf",
    heading: "#shelf-title",
    icon: "shelf",
    title: "Also built",
  },
  skills: {
    el: "#skills",
    heading: "#skills-title",
    icon: "skills",
    title: "Skills",
  },
  credentials: {
    el: "#certificates",
    heading: "#certificates-title",
    icon: "credentials",
    title: "Credentials",
  },
  contact: {
    el: "#contact",
    heading: "#contact-title",
    icon: "contact",
    title: "Contact",
  },
};

const $ = (selector) => document.querySelector(selector);

let machine;
let drawer;
let palette;
let workInfo = { slugs: [], index: 0, current: null };
let caseInfo = { slug: null, step: 1, total: 1 };
let rendered = null;
let previousHash = null;
let transitions;
let pendingDirection = 0;
let lastTrigger = null;
const memory = createWindowMemory();
const lightsByScene = new Map();
let zoomed = [];

function el(scene) {
  return $(SCENE_ELEMENTS[scene].el);
}

export function go(hash, { replace = false } = {}) {
  if (hash !== location.hash) {
    history[replace ? "replaceState" : "pushState"](history.state, "", hash);
  }
  handleRoute({ force: hash === location.hash });
}

function buildCaseScene() {
  const section = document.createElement("section");
  section.id = "case";
  section.className = "case";
  section.setAttribute("aria-labelledby", "case-title");
  section.hidden = true;
  section.innerHTML = `<p class="case-crumb"><a id="case-back" href="#work">← All work</a></p>
    <p id="case-kicker" class="case-kicker"></p>
    <h2 id="case-title" tabindex="-1"></h2>
    <p id="case-project" class="case-project"></p>
    <p id="case-body" class="case-body"></p>
    <pre id="case-code" class="case-code" hidden><code></code></pre>
    <p class="case-actions"><a id="case-read" class="terminal-link" href="#project">Read the full write-up ↗</a><span id="case-links"></span></p>
    <div id="case-status" class="statusbar" role="group" aria-label="Case-study steps"></div>`;
  $("#landing-view").append(section);
}

// Work and case-study windows carry a stage for the project's 3D figure; a
// project with no figure yet shows an explicit WIP frame.
function buildStages() {
  for (const selector of ["#work", "#case"]) {
    const scene = $(selector);
    if (!scene) continue;
    const figure = document.createElement("figure");
    figure.className = "stage is-empty";
    figure.setAttribute("role", "group");
    figure.setAttribute("aria-label", "Project figure");
    figure.innerHTML = `<div class="stage-bar"><span data-stage-title>Fig. · WIP</span></div>
      <div class="stage-body">
        <div class="figure-frame"><div class="figure-host" data-figure="" data-figure-state="idle" aria-hidden="true"></div></div>
        <div class="figure-controls" data-controls></div>
        <p class="figure-readout" data-readout></p>
        <p class="figure-caption" data-caption></p>
        <span class="wip" data-stage-wip>WIP</span>
      </div>`;
    const anchor =
      scene.querySelector(":scope > .statusbar") ??
      scene.querySelector(":scope > .case-actions");
    if (anchor) anchor.before(figure);
    else scene.append(figure);
  }
}

const FIGURE_NUMBER = { winding: 2, staircase: 3, torus: 4, boundary: 5 };
const stageCleanup = new Map();

function updateStage(selector, slug, step, total) {
  const stage = $(`${selector} > .stage`);
  if (!stage) return;
  const host = stage.querySelector(".figure-host");
  const figure = figureFor(slug);
  if (!figure) {
    stage.classList.add("is-empty");
    stage.querySelector("[data-stage-title]").textContent = "Fig. · WIP";
    stage.querySelector("[data-caption]").textContent = "";
    stage.querySelector("[data-readout]").textContent = "";
    stage.querySelector("[data-controls]").replaceChildren();
    if (host.dataset.figure) {
      host.dataset.figure = "";
      window.dispatchEvent(
        new CustomEvent("portfolio:figure", { detail: { host } }),
      );
    }
    return;
  }
  stage.classList.remove("is-empty");
  stage.querySelector("[data-stage-title]").textContent =
    `Fig. ${FIGURE_NUMBER[figure.id]} · ${figure.title}`;
  if (host.dataset.figure !== figure.id) {
    stageCleanup.get(host)?.();
    host.dataset.figure = figure.id;
    if (host.dataset.figureState === "idle")
      host.dataset.figureState = "waiting";
    stage.querySelector("[data-caption]").textContent = figure.caption;
    stageCleanup.set(
      host,
      renderControls(stage.querySelector("[data-controls]"), host, figure),
    );
    window.dispatchEvent(
      new CustomEvent("portfolio:figure", { detail: { host } }),
    );
  }
  if (step) {
    window.dispatchEvent(
      new CustomEvent("figure:step", { detail: { host, step, total } }),
    );
  }
}

// Every scene except the desktop is a window: a striped title bar with a close
// box. The close box goes one level up, like Esc.
function buildTitleBars() {
  zoomed = parseZoomed(sessionStorageGet("zoomed"));
  for (const [scene, { el: selector, title, icon }] of Object.entries(
    SCENE_ELEMENTS,
  )) {
    if (scene === "hub") continue;
    const node = $(selector);
    if (!node || node.querySelector(":scope > .titlebar")) continue;
    const lights = createLights({
      name: title,
      onClose: () => goUp(),
      onMinimize: () => minimize(scene, icon),
      onZoom: () => toggleZoom(scene),
    });
    const bar = document.createElement("div");
    bar.className = "titlebar";
    bar.innerHTML = `<span class="titlebar-title" aria-hidden="true">${title}</span>`;
    bar.prepend(lights.el);
    node.prepend(bar);
    lightsByScene.set(scene, lights);
    node.classList.toggle("is-zoomed", zoomed.includes(scene));
    lights.setZoomed(zoomed.includes(scene));
  }
}

function sessionStorageGet(key) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function toggleZoom(scene) {
  zoomed = toggleZoomed(zoomed, scene);
  const on = zoomed.includes(scene);
  el(scene)?.classList.toggle("is-zoomed", on);
  lightsByScene.get(scene)?.setZoomed(on);
  try {
    sessionStorage.setItem("zoomed", JSON.stringify(zoomed));
  } catch {
    // Private mode: zoom simply is not remembered.
  }
}

// Minimizing parks the window under its desktop icon; opening the icon again
// brings it back exactly where it was.
function minimize(scene, iconKey) {
  memory.minimize(iconKey, location.hash);
  go("#home");
}

function syncIcons() {
  document.querySelectorAll("[data-icon]").forEach((node) => {
    if (node.dataset.icon === "terminal") return;
    const parked = memory.has(node.dataset.icon);
    node.classList.toggle("is-minimized", parked);
    const note = node.querySelector(".icon-state");
    if (parked && !note) {
      node.insertAdjacentHTML(
        "beforeend",
        '<span class="icon-state visually-hidden"> (window minimized)</span>',
      );
    } else if (!parked) note?.remove();
  });
}

function renderCase(state) {
  const project = caseStudyProjects.find((p) => p.slug === state.slug);
  const steps = getCaseStudyView(project.insights);
  const step = Math.min(Math.max(state.step ?? 1, 1), steps.length);
  caseInfo = { slug: project.slug, step, total: steps.length };
  const current = steps[step - 1];
  const back = allProjects.some((p) => p.slug === project.slug)
    ? workHash([], project.slug)
    : "#work";
  $("#case-back").href = back;
  $("#case-kicker").textContent = `Step ${step} of ${steps.length}`;
  $("#case-title").textContent = current.title;
  $("#case-project").textContent = `${project.name} · ${project.meta}`;
  $("#case-body").textContent = current.body;
  const code = $("#case-code");
  code.hidden = !current.code;
  code.querySelector("code").textContent = current.code ?? "";
  const hash = (n) => projectHash(project.slug, n > 1 ? n : undefined);
  const prev = ((step - 2 + steps.length) % steps.length) + 1;
  const next = (step % steps.length) + 1;
  $("#case-status").innerHTML =
    `<a class="push" href="${hash(prev)}" data-sideways aria-label="Previous step">‹ Prev</a>
    <label class="popup popup-grow"><span class="visually-hidden">Step</span><select id="case-step" aria-label="Go to step">${steps
      .map(
        (s, i) =>
          `<option value="${hash(i + 1)}"${i + 1 === step ? " selected" : ""}>${i + 1}. ${s.title.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</option>`,
      )
      .join("")}</select></label>
    <a class="push" href="${hash(next)}" data-sideways aria-label="Next step">Next ›</a>`;
  $("#case-read").href = `${projectHash(project.slug)}/read`;
  $("#case-links").innerHTML = project.links
    .map(
      (l) =>
        ` <a class="terminal-link" href="${l.url}" target="_blank" rel="noreferrer">${l.label === "github" ? "Source" : l.label} ↗</a>`,
    )
    .join("");
  return { project, step, total: steps.length, title: current.title };
}

function describe(state, info) {
  switch (state.scene) {
    case "hub":
      return { title: baseTitle, say: "Home" };
    case "work": {
      const name =
        allProjects.find((p) => p.slug === info.current)?.name ??
        "Selected work";
      return {
        title: `${name} — ${baseTitle}`,
        say: `Work. Project ${workInfo.index + 1} of ${workInfo.slugs.length}: ${name}.`,
      };
    }
    case "case":
      return {
        title: `${info.project.name} — ${baseTitle}`,
        say: state.read
          ? `${info.project.name} full write-up.`
          : `${info.project.name} case study. Step ${info.step} of ${info.total}: ${info.title}.`,
      };
    default: {
      const names = {
        shelf: "Also built",
        skills: "Skills",
        credentials: "Credentials",
        contact: "Contact",
      };
      return {
        title: `${names[state.scene]} — ${baseTitle}`,
        say: names[state.scene],
      };
    }
  }
}

function render(state, { initial = false } = {}) {
  const key = `${state.scene}|${state.slug ?? ""}|${state.step ?? ""}|${state.read ? 1 : 0}`;
  const changed = rendered !== key;
  rendered = key;

  document.documentElement.dataset.scene = state.scene;
  window.dispatchEvent(new Event("portfolio:scene"));
  if (state.scene !== "hub") memory.clear(SCENE_ELEMENTS[state.scene].icon);
  syncIcons();
  for (const [scene, { el: selector }] of Object.entries(SCENE_ELEMENTS)) {
    const node = $(selector);
    if (node) node.hidden = scene !== state.scene;
  }
  $("#route-notice").hidden = !state.missing;

  let info = {};
  if (state.scene === "work") {
    workInfo = renderWork(state.categories ?? [], state.slug);
    info = { current: workInfo.current };
  }
  if (state.scene === "case") info = renderCase(state);
  if (state.scene === "work") updateStage("#work", workInfo.current);
  if (state.scene === "case")
    updateStage("#case", state.slug, info.step, info.total);
  if (state.scene === "case" && state.read) {
    openProjectModal(state.slug, $("#case-read"));
  } else {
    closeProjectModal();
  }

  if (state.terminal) drawer.open();
  else if (drawer.isOpen() && changed) drawer.close();

  const { title, say } = describe(state, info);
  document.title = state.missing ? `Page not found — ${baseTitle}` : title;
  $("#scene-status").textContent = state.missing
    ? "That page could not be found."
    : say;

  const usingPopup = document.activeElement?.closest?.(".popup");
  if (
    changed &&
    !initial &&
    !usingPopup &&
    !(state.scene === "case" && state.read)
  ) {
    const heading = state.missing
      ? $("#route-notice")
      : $(SCENE_ELEMENTS[state.scene].heading);
    heading?.focus({ preventScroll: true });
    el(state.scene)?.scrollTo?.({ top: 0, ...instant });
  }
}

// Where the zoom starts or ends: the control that was just used, or the menu
// item for the destination.
function triggerRect() {
  if (lastTrigger && performance.now() - lastTrigger.at < 800) {
    return lastTrigger.rect;
  }
  return null;
}

// The desktop icon a window grows out of and shrinks back into. Read after the
// desktop is showing, so it is passed to the transition as a function.
function iconRect(scene) {
  const node = document.querySelector(
    `[data-icon="${SCENE_ELEMENTS[scene].icon}"]`,
  );
  const rect = node?.getBoundingClientRect();
  return rect && rect.width > 0 ? rect : null;
}

function handleRoute({ initial = false, force = false } = {}) {
  const route = parseRoute(location.hash);
  const target = routeToScene(route);
  if (route.kind === "work" && location.hash !== route.hash) {
    history.replaceState(history.state, "", route.hash);
  }
  const before = { ...machine.state };
  const kind = pickTransition(before, target, {
    initial,
    direction: pendingDirection,
    order: workInfo.slugs,
  });
  pendingDirection = 0;
  const seq = machine.go(target, { animate: kind !== "none" });
  previousHash = location.hash;
  if (!(initial || force || seq !== null)) return;

  const apply = () => render(machine.state, { initial });
  if (kind === "none" || seq === null) {
    transitions.cancel();
    apply();
    machine.settle(machine.state.seq);
    return;
  }
  const stage = $("#landing-view").getBoundingClientRect();
  const inset = window.innerWidth >= 900 ? 28 : 12;
  const area = {
    left: stage.left + inset,
    top: stage.top + inset,
    width: stage.width - inset * 2,
    height: stage.height - inset * 2,
  };
  const sceneEl =
    target.scene === "work" ? $("#work-projects") : el(target.scene);
  transitions
    .run(kind, {
      apply,
      scene: kind.startsWith("slide") ? sceneEl : el(target.scene),
      source: kind === "zoom-in" ? triggerRect() : () => iconRect(before.scene),
      area,
    })
    .then(() => machine.settle(seq));
}

// Sideways moves (project to project, step to step) replace the history entry,
// so Back leaves the scene instead of paging through every card.
function sideways(hash) {
  go(hash, { replace: true });
}

function neighbour(direction) {
  const { scene } = machine.state;
  pendingDirection = direction;
  if (scene === "work" && workInfo.slugs.length) {
    const i =
      (workInfo.index + direction + workInfo.slugs.length) %
      workInfo.slugs.length;
    sideways(workHash(getWorkCategories(), workInfo.slugs[i]));
  } else if (scene === "case" && !machine.state.read) {
    const n =
      ((caseInfo.step - 1 + direction + caseInfo.total) % caseInfo.total) + 1;
    sideways(projectHash(caseInfo.slug, n > 1 ? n : undefined));
  }
}

function goUp() {
  const up = parentScene(machine.state);
  if (up) go(sceneToHash(up));
}

function closeReading() {
  const { slug, step } = machine.state;
  const stepHash = projectHash(slug, step > 1 ? step : undefined);
  if (previousHash === stepHash) history.back();
  else go(stepHash, { replace: true });
}

function isTyping(target) {
  return target.closest?.("input, textarea, select, [contenteditable='true']");
}

function wireInput() {
  document.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor || anchor.getAttribute("href") === "#") return;
    event.preventDefault();
    lastTrigger = {
      rect: anchor.getBoundingClientRect(),
      at: performance.now(),
    };
    const iconKey = anchor.closest("[data-icon]")?.dataset.icon;
    const parked = iconKey && memory.restore(iconKey);
    const label = anchor.getAttribute("aria-label") ?? "";
    pendingDirection = /^Next/.test(label)
      ? 1
      : /^Previous/.test(label)
        ? -1
        : 0;
    go(parked || anchor.getAttribute("href"), {
      replace: anchor.hasAttribute("data-sideways"),
    });
  });
  window.addEventListener("hashchange", () => handleRoute());
  document.addEventListener("change", (event) => {
    const select = event.target;
    if (select.id === "work-group") {
      go(
        workHash(
          select.value && select.value !== "__multi" ? [select.value] : [],
        ),
      );
    } else if (select.id === "work-jump") {
      sideways(workHash(getWorkCategories(), select.value));
    } else if (select.id === "case-step") {
      sideways(select.value);
    }
  });
  document.addEventListener("portfolio:close-project", closeReading);

  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented) return;
    const typing = isTyping(event.target);
    const palettable =
      (event.key === "k" || event.key === "K") &&
      (event.metaKey || event.ctrlKey);
    if (palettable) {
      event.preventDefault();
      palette.open();
      return;
    }
    if (typing || event.metaKey || event.ctrlKey || event.altKey) return;
    if (document.querySelector("dialog[open]")) return;
    if (event.key === "/") {
      event.preventDefault();
      palette.open();
    } else if (event.key === "`") {
      event.preventDefault();
      drawer.toggle();
    } else if (event.key === "ArrowLeft") neighbour(-1);
    else if (event.key === "ArrowRight") neighbour(1);
    else if (/^[1-9]$/.test(event.key) && machine.state.scene === "work") {
      const slug = workInfo.slugs[Number(event.key) - 1];
      if (slug) sideways(workHash(getWorkCategories(), slug));
    } else if (event.key === "Escape") {
      if (drawer.isOpen()) drawer.close({ restoreFocus: true });
      else goUp();
    }
  });

  // Touch swipes mirror the visible buttons; they stay off the screen edges so
  // they never fight the browser's own Back swipe.
  let start = null;
  const zone = (event) => event.target.closest?.("#work-projects, #case");
  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" || !zone(event)) return;
    const edge = 28;
    if (event.clientX < edge || event.clientX > window.innerWidth - edge)
      return;
    start = { x: event.clientX, y: event.clientY };
  });
  document.addEventListener("pointerup", (event) => {
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    start = null;
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      neighbour(dx < 0 ? 1 : -1);
    }
  });
  document.addEventListener("pointercancel", () => (start = null));
}

export function initScenes() {
  document.documentElement.classList.add("is-scenes");
  history.scrollRestoration = "manual";
  initWork();
  buildCaseScene();
  buildStages();
  buildTitleBars();
  for (const { el: selector, heading } of Object.values(SCENE_ELEMENTS)) {
    $(selector)?.classList.add("scene");
    const node = $(heading);
    if (node && !node.hasAttribute("tabindex")) node.tabIndex = -1;
  }
  document
    .querySelectorAll("[data-scenes-only]")
    .forEach((node) => (node.hidden = false));
  drawer = initTerminalDrawer();
  palette = initPalette({ go, openTerminal: () => drawer.open() });
  machine = createSceneMachine();
  transitions = createTransitions();
  wireInput();
  handleRoute({ initial: true });
  return { go, drawer, palette };
}

// The name assembles line by line, once, when the page first appears.
export function playHeroReveal() {
  const title = $("#site-title");
  if (
    !title ||
    machine?.state.scene !== "hub" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }
  title.animate(
    [{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)" }],
    { duration: 600, easing: "steps(9, end)" },
  );
}
