import { allProjects, categoryLabel } from "../data/projects.js";
import { getWorkCategories, initWork, renderWork } from "../components/work.js";
import {
  closeProjectModal,
  openProjectModal,
} from "../components/subpages/project-modal.js";
import { parseRoute, workHash } from "./routes.js";

let lastHash = null;
let projectTrigger = null;
let initialized = false;
const baseTitle = "Max Leong — Portfolio";
const instant = { behavior: "instant" };

function savePosition() {
  history.replaceState(
    { ...history.state, scrollY: window.scrollY },
    "",
    location.href,
  );
}

function restorePosition(state) {
  requestAnimationFrame(() => {
    window.scrollTo({ top: state?.scrollY || 0, ...instant });
    const target = projectTrigger?.isConnected
      ? projectTrigger
      : document.getElementById(state?.focusId || "");
    target?.focus({ preventScroll: true });
    projectTrigger = null;
  });
}

export function handleRoute({ restore = false } = {}) {
  if (lastHash === location.hash && !restore) return;
  const priorHash = lastHash;
  const route = parseRoute(location.hash);
  lastHash = location.hash;
  const notice = document.getElementById("route-notice");
  notice.hidden = route.kind !== "missing";

  if (route.kind === "project") {
    const context = parseRoute(history.state?.returnHash || "#work");
    if (context.kind === "work") renderWork(context.categories);
    const project = allProjects.find((p) => p.slug === route.slug);
    document.title = `${project.name} — ${baseTitle}`;
    openProjectModal(route.slug, projectTrigger);
    return;
  }

  closeProjectModal();
  if (route.kind === "work") {
    renderWork(route.categories);
    if (location.hash !== route.hash) {
      history.replaceState(history.state, "", route.hash);
      lastHash = route.hash;
    }
    document.title = `${route.categories.length ? route.categories.map(categoryLabel).join(" + ") : "Selected work"} — ${baseTitle}`;
    if (restore) restorePosition(history.state);
    else if (!document.activeElement?.hasAttribute("data-work-filter")) {
      document.getElementById("work").scrollIntoView(instant);
      document.getElementById("work-title").focus({ preventScroll: true });
    }
  } else if (route.kind === "missing") {
    document.title = `Page not found — ${baseTitle}`;
    notice.focus();
    notice.scrollIntoView(instant);
  } else {
    document.title = baseTitle;
    if (restore) restorePosition(history.state);
    else if (priorHash !== null || location.hash) {
      document.getElementById(route.id)?.scrollIntoView(instant);
    }
  }
}

function navigate(hash, state = {}) {
  if (hash === location.hash) {
    lastHash = null;
    handleRoute();
    return;
  }
  savePosition();
  history.pushState(state, "", hash);
  handleRoute();
}

function closeDetails() {
  if (!location.hash.startsWith("#project/")) {
    closeProjectModal();
    return;
  }
  if (history.state?.openedProject) history.back();
  else {
    const state = history.state;
    const returnHash =
      state?.returnHash && parseRoute(state.returnHash).kind !== "missing"
        ? state.returnHash
        : workHash();
    history.replaceState(
      { scrollY: state?.returnScrollY || 0, focusId: state?.returnFocusId },
      "",
      returnHash || workHash(),
    );
    handleRoute({ restore: Boolean(state?.returnHash) });
  }
}

export function initRouter() {
  if (initialized) return;
  initialized = true;
  history.scrollRestoration = "manual";
  initWork();
  document.addEventListener("click", (event) => {
    const project = event.target.closest("[data-project]");
    if (
      project &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      event.button === 0
    ) {
      event.preventDefault();
      projectTrigger = project;
      history.replaceState(
        { ...history.state, focusId: project.id },
        "",
        location.href,
      );
      navigate(`#project/${project.dataset.project}`, {
        openedProject: true,
        returnHash: location.hash || "#home",
        returnScrollY: window.scrollY,
        returnFocusId: project.id,
      });
      return;
    }
    const anchor = event.target.closest('a[href^="#"]');
    if (
      anchor &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      event.button === 0
    ) {
      event.preventDefault();
      navigate(anchor.getAttribute("href"));
      return;
    }
    const filter = event.target.closest("[data-work-filter]");
    if (filter) {
      const id = filter.dataset.workFilter;
      const selected = getWorkCategories();
      navigate(
        workHash(
          id
            ? selected.includes(id)
              ? selected.filter((c) => c !== id)
              : [...selected, id]
            : [],
        ),
      );
    }
  });
  document.addEventListener("portfolio:close-project", closeDetails);
  window.addEventListener("popstate", (event) =>
    handleRoute({ restore: typeof event.state?.scrollY === "number" }),
  );
  window.addEventListener("hashchange", () => handleRoute());
  // Keep refresh on a case study equivalent to closing its direct link.
  if (location.hash.startsWith("#project/") && history.state?.openedProject) {
    history.replaceState(
      { ...history.state, openedProject: false },
      "",
      location.href,
    );
  }
  handleRoute();
}
