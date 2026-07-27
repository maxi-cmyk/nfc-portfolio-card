import { aboutCommand } from "./about.js";
import { contactCommand } from "./contact.js";
import { helpCommand } from "./help.js";
import { pandaCommand } from "./panda.js";
import { projectsCommand } from "./project.js";

const commands = {
  about: aboutCommand,
  projects: projectsCommand,
  contact: contactCommand,
  help: helpCommand,
};

export function resolveCommand(rawCommand) {
  const command = rawCommand.trim().toLowerCase();

  if (command === "thebananachip") return pandaCommand;
  if (command === "clear") return { kind: "clear", output: "" };
  if (commands[command]) return commands[command];

  return {
    kind: "error",
    output: `max@portfolio: command not found: ${command || "(empty)"}\nType help to see available commands.`,
  };
}
