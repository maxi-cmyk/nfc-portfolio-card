import { resolveCommand } from "../../terminal/commands/index.js";
import { getLatestResultScrollOptions } from "../../terminal/scroll.js";
import { openProjectModal } from "../subpages/project-modal.js";

const output = document.querySelector("#output");
const terminalContainer = document.querySelector("#terminal");

export function appendCommand(command) {
  const result = resolveCommand(command);

  if (result.kind === "clear") {
    output.replaceChildren();
    output.classList.remove("is-panda-output", "is-projects-output");
    output.scrollTop = 0;
    if (terminalContainer) {
      terminalContainer.scrollIntoView({
        behavior: "instant",
        block: "center",
      });
    }
    return;
  }

  const commandRow = document.createElement("p");
  commandRow.innerHTML =
    '<span class="prompt">max@portfolio:~$</span> <span class="command"></span>';
  commandRow.querySelector(".command").textContent = command;

  const resultRow = document.createElement(
    result.links || result.projects ? "div" : "pre",
  );
  resultRow.className = `result ${result.kind}`;

  if (result.projects) {
    const heading = document.createElement("pre");
    heading.className = "result-text";
    heading.textContent = result.output;
    resultRow.append(heading);

    result.projects.forEach(
      ({ slug, name, meta, description, links }, index) => {
        const project = document.createElement("section");
        project.className = "project-entry";

        const title = document.createElement("p");
        title.className = "project-title";
        title.textContent = `[${String(index + 1).padStart(2, "0")}] ${name} · ${meta}`;

        const summary = document.createElement("p");
        summary.className = "project-description";
        summary.textContent = description;

        const projectLinks = links.map(({ label, url }) => {
          const projectLink = document.createElement("a");
          projectLink.className = "terminal-link";
          projectLink.href = url;
          projectLink.target = "_blank";
          projectLink.rel = "noreferrer";
          projectLink.textContent = `${label.padEnd(9, " ")}→ ${url.replace("https://", "")}`;
          return projectLink;
        });

        if (slug) {
          const insightsBtn = document.createElement("button");
          insightsBtn.type = "button";
          insightsBtn.className = "terminal-link project-insights-btn";
          insightsBtn.textContent = "insights [wip] ↗";
          insightsBtn.addEventListener("click", () => {
            openProjectModal(slug);
          });
          projectLinks.push(insightsBtn);
        }

        project.append(title, summary, ...projectLinks);
        resultRow.append(project);
      },
    );
  } else if (result.links) {
    const text = document.createElement("pre");
    text.className = "result-text";
    text.textContent = result.output;
    resultRow.append(text);

    result.links.forEach(({ label, url, download }) => {
      const link = document.createElement("a");
      link.className = "terminal-link";
      link.href = url;
      if (download) {
        link.download = download;
      } else {
        link.target = "_blank";
        link.rel = "noreferrer";
      }
      link.textContent = `${label.padEnd(9, " ")}→ ${url.replace("https://", "")}`;
      resultRow.append(link);
    });
  } else if (result.kind === "sudo") {
    const lines = result.output.split("\n");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      resultRow.textContent = result.output;
    } else {
      resultRow.textContent = "";
      lines.forEach((line, index) => {
        window.setTimeout(() => {
          resultRow.textContent += (index > 0 ? "\n" : "") + line;
          output.scrollTop = output.scrollHeight;
          resultRow.scrollIntoView(getLatestResultScrollOptions(false));

          if (index === 1 && terminalContainer) {
            terminalContainer.classList.add("is-glitching");
          } else if (index === lines.length - 2 && terminalContainer) {
            terminalContainer.classList.remove("is-glitching");
          }
        }, index * 500);
      });
    }
  } else if (result.kind === "panda") {
    const stages = result.stages || [result.output];
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const pandaMascot = document.querySelector("#panda-mascot");
    if (pandaMascot) {
      pandaMascot.classList.add("is-celebrating");
      window.setTimeout(
        () => {
          pandaMascot.classList.remove("is-celebrating");
        },
        (stages.length + 2) * 500,
      );
    }

    if (prefersReducedMotion) {
      resultRow.textContent = result.output;
    } else {
      resultRow.textContent = "";
      stages.forEach((stage, index) => {
        window.setTimeout(() => {
          resultRow.textContent += (index > 0 ? "\n" : "") + stage;
          output.scrollTop = output.scrollHeight;
          resultRow.scrollIntoView(getLatestResultScrollOptions(false));
        }, index * 500);
      });
    }
  } else {
    resultRow.textContent = result.output;
  }

  output.append(commandRow, resultRow);
  output.classList.toggle(
    "is-panda-output",
    Boolean(output.querySelector(".result.panda")),
  );
  output.classList.toggle(
    "is-projects-output",
    Boolean(output.querySelector(".result.projects")),
  );
  output.scrollTop = output.scrollHeight;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  window.requestAnimationFrame(() => {
    resultRow.scrollIntoView(
      getLatestResultScrollOptions(prefersReducedMotion),
    );
  });

  if (result.navTarget) {
    window.setTimeout(() => {
      window.location.hash = result.navTarget;
    }, 150);
  }
}

export function appendSuggestions(currentInput, suggestions, onSelect) {
  if (!output || !suggestions || suggestions.length === 0) return;

  const commandRow = document.createElement("p");
  commandRow.innerHTML =
    '<span class="prompt">max@portfolio:~$</span> <span class="command"></span>';
  commandRow.querySelector(".command").textContent = currentInput;

  const resultRow = document.createElement("div");
  resultRow.className = "result suggestions is-flash";

  const list = document.createElement("div");
  list.className = "suggestion-list";

  suggestions.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "suggestion-item";
    btn.textContent = item;
    btn.addEventListener("click", () => {
      if (typeof onSelect === "function") {
        onSelect(item);
      }
    });
    list.append(btn);
  });

  resultRow.append(list);
  output.append(commandRow, resultRow);
  output.scrollTop = output.scrollHeight;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  window.requestAnimationFrame(() => {
    resultRow.scrollIntoView(
      getLatestResultScrollOptions(prefersReducedMotion),
    );
  });
}
