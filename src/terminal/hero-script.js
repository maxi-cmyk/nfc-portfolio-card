// The commands of the hero console. Pure: no DOM. A result has the same shape the
// terminal runner already prints ({ kind, output, links?, navTarget? }), plus
// `led` for text sent to the desk's LED matrix. Everything printed comes from the
// data files; an unknown name is an error, never a guess.
import { allProjects } from "../data/projects.js";
import { desktopIcons } from "../data/icons.js";
import { getAutocompleteCandidates } from "./autocomplete.js";
import { resolveCommand } from "./commands/index.js";

export const HERO_CHIPS = ["about", "skills", "projects", "contact", "resume"];

export const LED_MAX = 40;
// What the 5x7 matrix font can draw (led-matrix.js).
export const LED_CHARS = /^[A-Z0-9 ,.!?:'\-]+$/;

const WHOAMI =
  "Max Leong\nCS student · builder at the physical–digital boundary";

// Where each name goes. Keys are what a visitor might type.
const SCENES = {
  work: { hash: "#work", name: "Selected work" },
  projects: { hash: "#work", name: "Selected work" },
  skills: { hash: "#skills", name: "Skills" },
  certs: { hash: "#certificates", name: "Credentials" },
  certificates: { hash: "#certificates", name: "Credentials" },
  credentials: { hash: "#certificates", name: "Credentials" },
  terminal: { hash: "#terminal", name: "Terminal" },
};

const open = ({ hash, name }) => ({
  kind: "nav",
  output: `Opening ${name}…`,
  navTarget: hash,
});

const findProject = (word) =>
  allProjects.find(
    (p) => p.slug === word || p.name.toLowerCase() === word.toLowerCase(),
  );

const HELP = `Commands:
  about                 Who I am, in two lines
  whoami                Name and role
  ls                    What is on the desktop
  projects              Open Selected work
  skills                Open Skills
  contact               GitHub and LinkedIn
  resume                Download the PDF
  cat <project>         One project: what it is, and its links
  open <name>           Open a window, or a project (e.g. open timing-attack-lab)
  led <text>            Write on the LED matrix lying on the desk
  play                  Play Asteroids (keys or touch)
  clear                 Clear this screen`;

export function heroCommand(raw) {
  const command = raw.trim().replace(/\s+/g, " ");
  const lower = command.toLowerCase();

  if (lower === "help" || lower === "?") return { kind: "help", output: HELP };
  if (lower === "whoami") return { kind: "about", output: WHOAMI };
  if (lower === "play" || lower === "asteroids") {
    return {
      kind: "game",
      output: "Starting Asteroids. Esc to leave.",
    };
  }
  if (lower === "ls") {
    return {
      kind: "help",
      output: desktopIcons
        .map((item) => item.label.toLowerCase().replace(/ /g, "-"))
        .join("  "),
    };
  }
  if (Object.hasOwn(SCENES, lower)) return open(SCENES[lower]);

  if (lower.startsWith("open ")) {
    const what = lower.slice(5).trim();
    if (Object.hasOwn(SCENES, what)) return open(SCENES[what]);
    if (what === "contact") return open({ hash: "#contact", name: "Contact" });
    if (what === "resume") return resolveCommand("resume");
    const project = findProject(what);
    if (project) {
      return {
        kind: "nav",
        output: `Opening ${project.name}…`,
        navTarget: `#work/${project.slug}`,
      };
    }
    return {
      kind: "error",
      output: `open: no such item: ${what}\nTry ls, or cat <project>.`,
    };
  }

  if (lower.startsWith("cat ") && !lower.startsWith("cat resume")) {
    const word = lower.slice(4).trim();
    const project = findProject(word);
    if (!project) {
      return {
        kind: "error",
        output: `cat: ${word}: no such project\nProjects: ${allProjects.map((p) => p.slug).join(" · ")}`,
      };
    }
    return {
      kind: "contact",
      output: `${project.name} · ${project.meta}\n\n${project.hook}\n\nopen ${project.slug} to see it.`,
      links: project.links,
    };
  }

  if (lower === "led" || lower.startsWith("led ")) {
    const text = command.slice(3).trim().toUpperCase();
    if (!text) {
      return {
        kind: "error",
        output: "usage: led <text>   e.g. led hello world",
      };
    }
    if (text.length > LED_MAX) {
      return {
        kind: "error",
        output: `led: at most ${LED_MAX} characters on the matrix.`,
      };
    }
    if (!LED_CHARS.test(text)) {
      return {
        kind: "error",
        output: "led: the matrix draws A to Z, 0 to 9, space and , . ! ? : ' -",
      };
    }
    return {
      kind: "led",
      output: `led: "${text}" is scrolling on the desk.`,
      led: text,
    };
  }

  return resolveCommand(raw);
}

// Tab completion: the old terminal's words plus this console's.
export function getHeroCandidates() {
  return Array.from(
    new Set([
      ...getAutocompleteCandidates(),
      "whoami",
      "ls",
      "work",
      "certs",
      "led ",
      "play",
      ...allProjects.flatMap((p) => [`cat ${p.slug}`, `open ${p.slug}`]),
      ...Object.keys(SCENES).map((name) => `open ${name}`),
    ]),
  );
}
