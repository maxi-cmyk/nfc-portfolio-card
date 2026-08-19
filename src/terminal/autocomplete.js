import { focusCategories } from "../data/projects.js";

export function getAutocompleteCandidates() {
  const categoryKeys = Object.keys(focusCategories);

  const baseCommands = [
    "about",
    "skills",
    "projects",
    "resume",
    "contact",
    "help",
    "clear",
    "stack",
    "tech",
    "matrix",
    "cv",
    "cat resume",
    "cat resume.pdf",
    "thebananachip",
    "cd ..",
    "cd ~",
    "cd /",
    "cd focus",
    "ls focus",
  ];

  const categoryCommands = [];
  categoryKeys.forEach((key) => {
    categoryCommands.push(`cd focus/${key}`);
    categoryCommands.push(`ls focus/${key}`);
    categoryCommands.push(`cat focus/${key}`);
    categoryCommands.push(`focus ${key}`);
    categoryCommands.push(key);
  });

  return Array.from(new Set([...baseCommands, ...categoryCommands]));
}

export function getLongestCommonPrefix(strings) {
  if (!strings || strings.length === 0) return "";
  if (strings.length === 1) return strings[0];

  let prefix = strings[0];
  for (let i = 1; i < strings.length; i++) {
    while (!strings[i].toLowerCase().startsWith(prefix.toLowerCase())) {
      prefix = prefix.slice(0, -1);
      if (prefix === "") return "";
    }
  }
  return prefix;
}

export function getAutocompleteResult(rawInput, customCandidates = null) {
  const candidates = customCandidates || getAutocompleteCandidates();
  const input = (rawInput || "").trimStart().toLowerCase();

  if (!input) {
    return {
      matches: candidates,
      completion: "",
      hasMultiple: true,
      hasMatch: true,
      commonPrefix: "",
    };
  }

  const matches = candidates.filter((cmd) =>
    cmd.toLowerCase().startsWith(input),
  );

  if (matches.length === 0) {
    return {
      matches: [],
      completion: rawInput,
      hasMultiple: false,
      hasMatch: false,
      commonPrefix: rawInput,
    };
  }

  if (matches.length === 1) {
    return {
      matches,
      completion: matches[0],
      hasMultiple: false,
      hasMatch: true,
      commonPrefix: matches[0],
    };
  }

  const commonPrefix = getLongestCommonPrefix(matches);

  return {
    matches,
    completion: commonPrefix.length > input.length ? commonPrefix : rawInput,
    hasMultiple: true,
    hasMatch: true,
    commonPrefix,
  };
}
