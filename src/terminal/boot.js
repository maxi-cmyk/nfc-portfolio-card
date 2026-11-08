export function getTypingFrames(text) {
  return Array.from(text, (_, index) => text.slice(0, index + 1));
}

export function getBootTiming() {
  return {
    typingDelay: 12,
    lineDelay: 80,
    completionDelay: 250,
    exitDelay: 125,
  };
}

export function getBootDelay() {
  return getBootTiming().lineDelay;
}

export function getBootSteps() {
  return [
    { kind: "command", text: "tap --card" },
    { kind: "output", text: "13.56 MHz field detected." },
    { kind: "success", text: "System online." },
  ];
}
