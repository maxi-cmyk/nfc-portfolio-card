// Lists every WIP placeholder still on the site so none is forgotten.
import { caseStudyProjects, isWip } from "../src/data/projects.js";

const rows = [];
for (const project of caseStudyProjects) {
  for (const field of ["role", "proof"]) {
    if (isWip(project[field])) rows.push([project.name, field]);
  }
  if (project.media && isWip(project.media.src)) {
    rows.push([project.name, `media (${project.media.kind})`]);
  }
  const prose = JSON.stringify(project.insights);
  if (/\bWIP\b/.test(prose)) rows.push([project.name, "case study text"]);
}
for (const [name, field] of rows) console.log(`${name.padEnd(26)} ${field}`);
console.log(`\n${rows.length} WIP placeholders`);
