import {
  getBootDelay,
  getBootSteps,
  getTypingFrames,
} from "./terminal/boot.js";
import {
  getMascotHint,
  getTerminalPlaceholder,
} from "./terminal/easter-eggs.js";
import {
  shouldAutoFocusTerminal,
  shouldFocusTerminalAfterQuickCommand,
} from "./terminal/input.js";
import { getLatestResultScrollOptions } from "./terminal/scroll.js";
import { getActiveRailTarget } from "./navigation/system-rail.js";
import { resolveCommand } from "./terminal/commands/index.js";

const form = document.querySelector("#terminal-form");
const input = document.querySelector("#command-input");
const output = document.querySelector("#output");
const quickLinks = document.querySelectorAll("[data-command]");
const bootScreen = document.querySelector("#boot-screen");
const bootLog = document.querySelector("#boot-log");
const skipBoot = document.querySelector("#skip-boot");
const main = document.querySelector("#portfolio");
const pandaMascot = document.querySelector("#panda-mascot");
const mascotHint = document.querySelector("#mascot-hint");
const railLinks = document.querySelectorAll("[data-rail-target]");
const railSections = document.querySelectorAll(
  "#home, #terminal, #focus, #contact",
);

let mascotClicks = 0;
let aliasTeaserStarted = false;

function flashAliasPlaceholder() {
  input.placeholder = getTerminalPlaceholder(true);
  input.classList.add("is-alias-teaser");

  window.setTimeout(() => {
    input.placeholder = getTerminalPlaceholder(false);
    input.classList.remove("is-alias-teaser");
  }, 500);
}

function startAliasTeaser() {
  if (aliasTeaserStarted) return;

  aliasTeaserStarted = true;
  window.setInterval(flashAliasPlaceholder, 4000);
}

function handleMascotClick() {
  mascotClicks += 1;
  const hint = getMascotHint(mascotClicks);

  if (!hint) return;

  mascotHint.hidden = false;
  mascotHint.textContent = `// ${hint}`;
  pandaMascot.classList.add("has-hint");
}

function setActiveRailTarget(targetId) {
  railLinks.forEach((link) => {
    const isActive = link.dataset.railTarget === targetId;
    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function startSystemRail() {
  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const activeTarget = getActiveRailTarget(entries);
      if (activeTarget) setActiveRailTarget(activeTarget);
    },
    { rootMargin: "-28% 0px -58% 0px", threshold: [0.1, 0.45, 0.8] },
  );

  railSections.forEach((section) => observer.observe(section));
  setActiveRailTarget("home");
}

function appendCommand(command) {
  const result = resolveCommand(command);

  if (result.kind === "clear") {
    output.replaceChildren();
    output.classList.remove("is-panda-output", "is-projects-output");
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

    result.projects.forEach(({ name, meta, description, links }, index) => {
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

      project.append(title, summary, ...projectLinks);
      resultRow.append(project);
    });
  } else if (result.links) {
    const text = document.createElement("pre");
    text.className = "result-text";
    text.textContent = result.output;
    resultRow.append(text);

    result.links.forEach(({ label, url }) => {
      const link = document.createElement("a");
      link.className = "terminal-link";
      link.href = url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = `${label.padEnd(9, " ")}→ ${url.replace("https://", "")}`;
      resultRow.append(link);
    });
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
}

function revealPortfolio() {
  if (!main.hidden) return;

  bootScreen.classList.add("is-complete");
  main.hidden = false;
  startAliasTeaser();
  startSystemRail();
  window.setTimeout(() => bootScreen.remove(), 250);

  if (shouldAutoFocusTerminal()) {
    input.focus();
  }
}

async function runBootSequence() {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  for (const step of getBootSteps()) {
    const text =
      step.kind === "command" ? `max@portfolio:~$ ${step.text}` : step.text;
    const line = document.createElement("span");
    line.className = `boot-line ${step.kind}`;
    bootLog.append(line, document.createElement("br"));

    for (const frame of getTypingFrames(text)) {
      line.textContent = frame;

      if (!prefersReducedMotion) {
        await new Promise((resolve) => window.setTimeout(resolve, 45));
      }
    }

    if (!prefersReducedMotion) {
      await new Promise((resolve) =>
        window.setTimeout(resolve, getBootDelay()),
      );
    }
  }

  if (!prefersReducedMotion) {
    await new Promise((resolve) => window.setTimeout(resolve, 1000));
  }

  revealPortfolio();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const command = input.value;
  if (!command.trim()) return;

  appendCommand(command);
  input.value = "";
});

quickLinks.forEach((button) => {
  button.addEventListener("click", () => {
    appendCommand(button.dataset.command);

    if (shouldFocusTerminalAfterQuickCommand()) {
      input.focus();
    }
  });
});

pandaMascot.addEventListener("click", handleMascotClick);
skipBoot.addEventListener("click", revealPortfolio);
runBootSequence();
