export function getTerminalPlaceholder(isTeaserActive) {
  return isTeaserActive ? "type alias" : "type a command";
}

export function getMascotHint(clickCount) {
  return clickCount >= 3 ? "snack protocol armed" : null;
}
