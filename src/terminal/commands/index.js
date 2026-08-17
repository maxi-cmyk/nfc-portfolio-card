import { aboutCommand } from "./about.js";
import { contactCommand } from "./contact.js";
import { helpCommand } from "./help.js";
import { pandaCommand } from "./panda.js";
import { projectsCommand, focusCategories } from "./project.js";
import { resumeCommand } from "./resume.js";
import { skillsCommand } from "./skills.js";
import { sudoCommand } from "./sudo.js";

const commands = {
  about: aboutCommand,
  projects: projectsCommand,
  contact: contactCommand,
  help: helpCommand,
  skills: skillsCommand,
  stack: skillsCommand,
  tech: skillsCommand,
  matrix: skillsCommand,
  resume: resumeCommand,
  cv: resumeCommand,
  "cat resume": resumeCommand,
  "cat resume.pdf": resumeCommand,
};

export function resolveCommand(rawCommand) {
  const command = rawCommand.trim().toLowerCase();

  if (command === "thebananachip") return pandaCommand;
  if (command === "clear") return { kind: "clear", output: "" };

  // sudo / rm -rf easter eggs
  if (
    command.startsWith("sudo") ||
    command.startsWith("rm -rf") ||
    command === "su" ||
    command === "rm" ||
    command === "shutdown" ||
    command === "reboot"
  ) {
    return sudoCommand;
  }

  if (
    command === "cd .." ||
    command === "cd ~" ||
    command === "cd /" ||
    command === "cd focus"
  ) {
    return {
      kind: "nav",
      output: "Navigating to focus index...",
      navTarget: "#focus",
    };
  }

  if (commands[command]) return commands[command];

  // Match category shortcuts like "hackathons", "cybersecurity", "focus hackathons", "ls focus/engineering", "cd focus/hackathons"
  const normalized = command
    .replace(/^ls\s+focus\/?/, "")
    .replace(/^cat\s+focus\/?/, "")
    .replace(/^cd\s+focus\/?/, "")
    .replace(/^focus\s+/, "")
    .replace(/\/$/, "")
    .trim();

  let matchedCategoryKey = Object.keys(focusCategories).find(
    (key) =>
      key === normalized ||
      key.replace("-", " & ") === normalized ||
      key.replace("-", " ") === normalized,
  );

  if (matchedCategoryKey) {
    const category = focusCategories[matchedCategoryKey];
    return {
      kind: "projects",
      output: `Navigating to ${category.path}...`,
      navTarget: `#focus/${matchedCategoryKey}`,
      projects: category.projects,
    };
  }

  return {
    kind: "error",
    output: `max@portfolio: command not found: ${command || "(empty)"}\nType help to see available commands.`,
  };
}
