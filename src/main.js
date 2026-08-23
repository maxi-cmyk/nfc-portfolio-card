import {
  getBootDelay,
  getBootSteps,
  getBootTiming,
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
import { getActiveRailTarget } from "./navigation/system-rail.js";
import { initRouter, handleRoute } from "./navigation/router.js";
import {
  appendCommand,
  appendSuggestions,
} from "./components/terminal/runner.js";
import { CommandHistory } from "./terminal/history.js";
import { getAutocompleteResult } from "./terminal/autocomplete.js";
import { initCertificates } from "./components/certificates.js";
import { initFocusTooling } from "./components/focus-tooling.js";

const form = document.querySelector("#terminal-form");
const input = document.querySelector("#command-input");
const quickLinks = document.querySelectorAll("[data-command]");
const bootScreen = document.querySelector("#boot-screen");
const bootLog = document.querySelector("#boot-log");
const skipBoot = document.querySelector("#skip-boot");
const main = document.querySelector("#portfolio");
const pandaMascot = document.querySelector("#panda-mascot");
const mascotHint = document.querySelector("#mascot-hint");
const railLinks = document.querySelectorAll("[data-rail-target]");
const railSections = document.querySelectorAll(
  "#home, #terminal, #focus, #certificates, #contact",
);

const commandHistory = new CommandHistory();
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

function revealPortfolio() {
  if (!main.hidden) return;

  const { exitDelay } = getBootTiming();

  bootScreen.classList.add("is-complete");
  main.hidden = false;
  startAliasTeaser();
  startSystemRail();
  initRouter();
  window.setTimeout(() => bootScreen.remove(), exitDelay);

  if (shouldAutoFocusTerminal()) {
    input.focus();
  }
}

async function runBootSequence() {
  const { typingDelay, completionDelay } = getBootTiming();
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
        await new Promise((resolve) => window.setTimeout(resolve, typingDelay));
      }
    }

    if (!prefersReducedMotion) {
      await new Promise((resolve) =>
        window.setTimeout(resolve, getBootDelay()),
      );
    }
  }

  if (!prefersReducedMotion) {
    await new Promise((resolve) => window.setTimeout(resolve, completionDelay));
  }

  revealPortfolio();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const command = input.value;
  if (!command.trim()) return;

  commandHistory.push(command);
  appendCommand(command);
  input.value = "";
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    event.preventDefault();
    const result = getAutocompleteResult(input.value);

    if (!result.hasMatch) {
      input.classList.add("is-autocomplete-empty");
      window.setTimeout(() => {
        input.classList.remove("is-autocomplete-empty");
      }, 250);
      return;
    }

    if (!result.hasMultiple) {
      input.value = result.completion;
      input.setSelectionRange(
        result.completion.length,
        result.completion.length,
      );
      input.classList.add("is-autocomplete-success");
      window.setTimeout(() => {
        input.classList.remove("is-autocomplete-success");
      }, 250);
    } else {
      if (result.completion && result.completion !== input.value) {
        input.value = result.completion;
        input.setSelectionRange(
          result.completion.length,
          result.completion.length,
        );
      }
      appendSuggestions(input.value, result.matches, (selected) => {
        input.value = selected;
        input.focus();
        input.setSelectionRange(selected.length, selected.length);
      });
    }
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    const prev = commandHistory.navigateUp(input.value);
    if (prev !== null) {
      input.value = prev;
      input.setSelectionRange(prev.length, prev.length);
    }
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    const next = commandHistory.navigateDown();
    if (next !== null) {
      input.value = next;
      input.setSelectionRange(next.length, next.length);
    }
  }
});

quickLinks.forEach((button) => {
  button.addEventListener("click", () => {
    commandHistory.push(button.dataset.command);
    appendCommand(button.dataset.command);

    if (shouldFocusTerminalAfterQuickCommand()) {
      input.focus();
    }
  });
});

pandaMascot.addEventListener("click", handleMascotClick);
skipBoot.addEventListener("click", revealPortfolio);
initCertificates();
initFocusTooling();
runBootSequence();
