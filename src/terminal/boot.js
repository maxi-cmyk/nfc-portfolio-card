export function getTypingFrames(text) {
  return Array.from(text, (_, index) => text.slice(0, index + 1));
}

export function getBootTiming() {
  return {
    typingDelay: 22.5,
    lineDelay: 125,
    completionDelay: 500,
    exitDelay: 125,
  };
}

export function getBootDelay() {
  return getBootTiming().lineDelay;
}

export function getBootSteps() {
  return [
    { kind: "command", text: "pwd" },
    { kind: "output", text: "/Users/max/portfolio" },
    { kind: "command", text: "cd portfolio" },
    { kind: "command", text: "ls" },
    { kind: "output", text: "about/projects/contact/" },
    { kind: "command", text: "start --portfolio" },
    { kind: "success", text: "System online." },
  ];
}
