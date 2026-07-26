export function shouldAutoFocusTerminal(isCoarsePointer) {
  return !isCoarsePointer;
}

export function shouldFocusTerminalAfterQuickCommand() {
  return false;
}
