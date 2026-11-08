// Throwaway: lets the three transitions be tried on real project content.
import { allProjects, focusCategories } from "../data/projects.js";
import { createTransitions } from "../components/transitions.js";

const stage = document.getElementById("stage");
const log = document.getElementById("log");
let speed = 1;
let reduced = false;
let applied = 0;
const fx = createTransitions({
  reducedMotion: () => reduced,
  speed: () => speed,
});
const note = (text) =>
  (log.textContent = `${text}\n${log.textContent}`
    .split("\n")
    .slice(0, 4)
    .join("\n"));

let index = 0;
const scenes = {
  hub: document.createElement("section"),
  work: document.createElement("section"),
  skills: document.createElement("section"),
};
for (const el of Object.values(scenes)) {
  el.className = "lab-scene";
  stage.append(el);
}
scenes.hub.innerHTML = `<h2>MAX LEONG</h2><p>CS student building at the physical–digital boundary.</p><div class="lab-tiles"><span class="wip">01 Work</span><span class="wip">02 Skills</span></div>`;
scenes.skills.innerHTML = `<h2>Skills</h2>${Object.values(focusCategories)
  .map((c) => `<p><strong>${c.label}</strong>: ${c.description}</p>`)
  .join("")}`;
const paintWork = () => {
  const p = allProjects[index];
  scenes.work.innerHTML = `<h2>${p.name}</h2><p>${p.meta}</p><p>${p.hook}</p>`;
};
paintWork();

let current = "hub";
const show = (name) => {
  current = name;
  for (const [key, el] of Object.entries(scenes)) el.hidden = key !== name;
  applied += 1;
};
show("hub");

const area = () => stage.getBoundingClientRect();
const rectOf = (el) => el.getBoundingClientRect();

function trigger(kind, button) {
  const base = { area: area(), source: rectOf(button) };
  if (kind === "zoom-in") {
    fx.run(kind, { ...base, scene: scenes.work, apply: () => show("work") });
    note("zoom-in: hub to work");
  } else if (kind === "zoom-out") {
    fx.run(kind, { ...base, apply: () => show("hub") });
    note("zoom-out: back to hub");
  } else if (kind === "slide-next" || kind === "slide-prev") {
    const step = kind === "slide-next" ? 1 : -1;
    fx.run(kind, {
      ...base,
      scene: scenes.work,
      apply: () => {
        index = (index + step + allProjects.length) % allProjects.length;
        paintWork();
        show("work");
      },
    });
    note(
      `${kind}: ${allProjects[(index + step + allProjects.length) % allProjects.length].name}`,
    );
  } else if (kind === "dissolve") {
    const next = current === "skills" ? "work" : "skills";
    fx.run(kind, { ...base, scene: scenes[next], apply: () => show(next) });
    note(`dissolve: to ${next}`);
  } else if (kind === "interrupt") {
    const before = applied;
    fx.run("dissolve", {
      ...base,
      scene: scenes.skills,
      apply: () => show("skills"),
    });
    setTimeout(() => {
      fx.run("zoom-in", {
        ...base,
        scene: scenes.work,
        apply: () => show("work"),
      });
      note(
        `interrupt: dissolve cut off after 90ms, zoom-in started (scene swaps so far: ${applied - before})`,
      );
    }, 90);
  }
}

document.querySelector(".lab-controls").addEventListener("click", (event) => {
  const button = event.target.closest("[data-kind]");
  if (button) trigger(button.dataset.kind, button);
});
document
  .getElementById("speed")
  .addEventListener("change", (e) => (speed = Number(e.target.value)));
document
  .getElementById("reduced")
  .addEventListener("change", (e) => (reduced = e.target.checked));
