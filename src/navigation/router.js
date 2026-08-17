import {
  renderSubpage,
  hideSubpage,
} from "../components/subpages/subpage-view.js";
import { openProjectModal } from "../components/subpages/project-modal.js";

export function handleRoute() {
  const hash = window.location.hash;

  if (hash.startsWith("#project/")) {
    const projectSlug = hash.replace("#project/", "");
    if (openProjectModal(projectSlug)) {
      return;
    }
  }

  if (hash.startsWith("#focus/")) {
    const focusId = hash.replace("#focus/", "");
    if (renderSubpage(focusId)) {
      return;
    }
  }

  hideSubpage();
  if (hash && hash !== "#" && hash !== "#home") {
    const targetEl = document.querySelector(hash);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth" });
    }
  }
}

export function initRouter() {
  window.addEventListener("hashchange", handleRoute);
  handleRoute();
}
