import { focusCategories, allProjects } from "../../data/projects.js";

export { focusCategories };

export const projectsCommand = {
  kind: "projects",
  output: "Selected projects",
  projects: allProjects,
};
