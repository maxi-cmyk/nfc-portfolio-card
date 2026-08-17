import { focusCategories } from "../../data/projects.js";
import { openProjectModal } from "./project-modal.js";

const landingView = document.querySelector("#landing-view");
const fullSubpageView = document.querySelector("#full-subpage-view");
const fullSubpagePath = document.querySelector("#full-subpage-path");
const fullSubpageTitle = document.querySelector("#full-subpage-title");
const fullSubpageDesc = document.querySelector("#full-subpage-desc");
const fullSubpageProjects = document.querySelector("#full-subpage-projects");
const subpageCategoryLabel = document.querySelector("#subpage-category-label");

export function renderSubpage(focusId) {
  const category = focusCategories[focusId];
  if (!category) return false;

  landingView.hidden = true;
  fullSubpageView.hidden = false;

  fullSubpagePath.textContent = `cd ${category.path}`;
  fullSubpageTitle.textContent = category.title;
  fullSubpageDesc.textContent = category.description;
  subpageCategoryLabel.textContent = category.id
    .toUpperCase()
    .replace("-", " & ");

  fullSubpageProjects.replaceChildren();

  category.projects.forEach(
    ({ slug, name, meta, tags, description, links }, index) => {
      const card = document.createElement("article");
      card.className = "full-project-card";

      const titleEl = document.createElement("h3");
      titleEl.className = "project-card-title";
      titleEl.textContent = `[${String(index + 1).padStart(2, "0")}] ${name}`;

      const metaEl = document.createElement("span");
      metaEl.className = "project-card-meta";
      metaEl.textContent = meta;

      const headerContainer = document.createElement("div");
      headerContainer.className = "project-card-header";
      headerContainer.append(titleEl, metaEl);

      const descEl = document.createElement("p");
      descEl.className = "project-card-desc";
      descEl.textContent = description;

      const tagsContainer = document.createElement("div");
      tagsContainer.className = "project-card-tags";

      if (tags && Array.isArray(tags)) {
        tags.forEach((tag) => {
          const tagEl = document.createElement("span");
          tagEl.className = "tech-badge";
          tagEl.textContent = tag;
          tagsContainer.append(tagEl);
        });
      }

      const linksContainer = document.createElement("div");
      linksContainer.className = "project-card-links";

      if (links && Array.isArray(links)) {
        links.forEach(({ label, url }) => {
          const linkEl = document.createElement("a");
          linkEl.className = "terminal-link";
          linkEl.href = url;
          linkEl.target = "_blank";
          linkEl.rel = "noreferrer";
          linkEl.textContent = `${label.padEnd(9, " ")}→ ${url.replace("https://", "")}`;
          linksContainer.append(linkEl);
        });
      }

      if (slug) {
        const insightsBtn = document.createElement("button");
        insightsBtn.type = "button";
        insightsBtn.className = "terminal-link project-insights-btn";
        insightsBtn.textContent = "insights [wip] ↗";
        insightsBtn.addEventListener("click", () => {
          openProjectModal(slug);
        });
        linksContainer.append(insightsBtn);
      }

      card.append(headerContainer, descEl, tagsContainer, linksContainer);
      fullSubpageProjects.append(card);
    },
  );

  window.scrollTo({ top: 0, behavior: "instant" });
  return true;
}

export function hideSubpage() {
  fullSubpageView.hidden = true;
  landingView.hidden = false;
}
