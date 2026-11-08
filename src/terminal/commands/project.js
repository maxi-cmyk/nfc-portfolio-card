import { focusCategories, caseStudyProjects } from "../../data/projects.js";

export { focusCategories };

export const projectsCommand = {
  kind: "projects",
  output: "Selected projects",
  projects: caseStudyProjects,
};
