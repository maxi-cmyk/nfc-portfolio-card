import { formatFocusToolsForTerminal } from "../../data/focus-tools.js";

export const skillsCommand = {
  kind: "skills",
  output: formatFocusToolsForTerminal(),
};
