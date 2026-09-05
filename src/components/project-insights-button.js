import { getCaseStudyLinkLabel } from "../data/projects.js";
import { openProjectModal } from "./subpages/project-modal.js";

export function createProjectInsightsButton(project) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "terminal-link project-insights-btn";
  button.setAttribute("aria-haspopup", "dialog");
  button.setAttribute("aria-controls", "project-modal");
  button.setAttribute("aria-label", `Open ${project.name} case study`);

  const label = document.createElement("span");
  label.textContent = getCaseStudyLinkLabel(project);

  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 16 16");
  icon.setAttribute("aria-hidden", "true");

  const iconPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path",
  );
  iconPath.setAttribute(
    "d",
    "M2.5 3.5h4A1.5 1.5 0 0 1 8 5v8a1.5 1.5 0 0 0-1.5-1.5h-4zM13.5 3.5h-4A1.5 1.5 0 0 0 8 5v8a1.5 1.5 0 0 1 1.5-1.5h4z",
  );
  icon.append(iconPath);

  button.append(label, icon);
  button.addEventListener("click", () => {
    openProjectModal(project.slug);
  });

  return button;
}
