import { initMotion } from "./components/motion.js";
import { initBackgroundArt } from "./components/background-art.js";
import { initLedMatrix } from "./components/led-matrix.js";
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
import { initScenes, playHeroReveal } from "./components/scenes.js";
import { initCertificates } from "./components/certificates.js";
import { initFocusTooling } from "./components/focus-tooling.js";
import { initFigures } from "./components/figures.js";
import { initMenubar } from "./components/menubar.js";
import { playHeroIntro } from "./components/hero-terminal.js";

// The easter egg that flashes "type alias" in the prompt lives on the hero console.
const input = document.querySelector("#hero-input");
const bootScreen = document.querySelector("#boot-screen");
const bootLog = document.querySelector("#boot-log");
const skipBoot = document.querySelector("#skip-boot");
const pandaMascot = document.querySelector("#panda-mascot");
const mascotHint = document.querySelector("#mascot-hint");

let mascotClicks = 0;
let aliasTeaserTimer;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function flashAliasPlaceholder() {
  input.placeholder = getTerminalPlaceholder(true);
  input.classList.add("is-alias-teaser");

  window.setTimeout(() => {
    input.placeholder = getTerminalPlaceholder(false);
    input.classList.remove("is-alias-teaser");
  }, 500);
}

function startAliasTeaser(active) {
  window.clearInterval(aliasTeaserTimer);
  input.placeholder = getTerminalPlaceholder(false);
  input.classList.remove("is-alias-teaser");
  if (!active) return;
  aliasTeaserTimer = window.setInterval(() => {
    const bounds = input.getBoundingClientRect();
    if (bounds.bottom > 0 && bounds.top < window.innerHeight)
      flashAliasPlaceholder();
  }, 12000);
}

function handleMascotClick() {
  mascotClicks += 1;
  const hint = getMascotHint(mascotClicks);

  if (!hint) return;

  mascotHint.hidden = false;
  mascotHint.textContent = `// ${hint}`;
  pandaMascot.classList.add("has-hint");
}

// The tap moment plays once per browser session; reloads and later pages skip it.
function hasSeenBoot() {
  try {
    return sessionStorage.getItem("booted") === "1";
  } catch {
    return false;
  }
}

function markBootSeen() {
  try {
    sessionStorage.setItem("booted", "1");
  } catch {
    // Private mode: the boot may replay, which is harmless.
  }
}

function revealPortfolio() {
  if (!bootScreen || bootScreen.hidden) return;

  const { exitDelay } = getBootTiming();

  bootScreen.classList.add("is-complete");
  bootScreen.hidden = true;
  document.body.classList.remove("is-booting");
  window.setTimeout(() => bootScreen.remove(), exitDelay);
}

async function runBootSequence() {
  const { typingDelay, completionDelay } = getBootTiming();
  if (
    !bootScreen ||
    reducedMotion.matches ||
    window.location.hash ||
    hasSeenBoot()
  )
    return;
  markBootSeen();
  bootScreen.hidden = false;
  document.body.classList.add("is-booting");
  // Always release the screen if an unexpected error interrupts startup.
  const fallbackTimer = window.setTimeout(revealPortfolio, 10000);

  for (const step of getBootSteps()) {
    const text =
      step.kind === "command" ? `max@portfolio:~$ ${step.text}` : step.text;
    const line = document.createElement("span");
    line.className = `boot-line ${step.kind}`;
    bootLog.append(line, document.createElement("br"));

    for (const frame of getTypingFrames(text)) {
      if (bootScreen.hidden) {
        window.clearTimeout(fallbackTimer);
        return;
      }
      line.textContent = frame;

      if (!reducedMotion.matches) {
        await new Promise((resolve) => window.setTimeout(resolve, typingDelay));
      }
    }

    if (!reducedMotion.matches) {
      await new Promise((resolve) =>
        window.setTimeout(resolve, getBootDelay()),
      );
    }
  }

  if (!reducedMotion.matches) {
    await new Promise((resolve) => window.setTimeout(resolve, completionDelay));
  }

  window.clearTimeout(fallbackTimer);
  revealPortfolio();
}

pandaMascot.addEventListener("click", handleMascotClick);
skipBoot?.addEventListener("click", revealPortfolio);
initCertificates();
initFocusTooling();
// The skills graph (its layout and drawing code) loads the first time the Skills
// window opens, so it does not weigh on the first screen.
let skillsLoading = false;
const loadSkills = () => {
  if (skillsLoading || document.documentElement.dataset.scene !== "skills")
    return;
  skillsLoading = true;
  import("./components/skills.js").then((module) => module.initSkills());
};
window.addEventListener("portfolio:scene", loadSkills);
initScenes();
loadSkills();
initMenubar();
initFigures();
initBackgroundArt();
// The desk's motion (parallax, the OLED's attract mode) loads after first paint.
(window.requestIdleCallback ?? ((fn) => setTimeout(fn, 600)))(() =>
  import("./components/desk.js").then((module) => module.initDesk()),
);
// The Asteroids screensaver and game load after first paint, or when `play` is typed.
(window.requestIdleCallback ?? ((fn) => setTimeout(fn, 800)))(() =>
  import("./components/arcade.js").then((module) => module.initScreensaver()),
);
window.addEventListener("portfolio:play", () =>
  import("./components/arcade.js").then((module) => module.startGame()),
);
const motion = initMotion();
motion.register(input, startAliasTeaser);
initLedMatrix(motion);
document.documentElement.classList.add("is-enhanced");
// The dot-matrix name (with its Fourier intro) loads right after first paint; until
// then, and if it cannot start, the h1's text is what shows.
const oled = import("./components/oled-name.js").then((module) =>
  module.initOledName(),
);
runBootSequence().finally(() =>
  playHeroIntro(
    () => oled.then((o) => (o ? o.play() : playHeroReveal())),
    () => oled.then((o) => (o ? o.finish() : playHeroReveal())),
  ),
);
