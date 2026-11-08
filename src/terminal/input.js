import { getAutocompleteResult } from "./autocomplete.js";

export function getTerminalTabAction(
  rawInput,
  { shiftKey = false, candidates = null } = {},
) {
  if (shiftKey || !rawInput.trim()) {
    return {
      preventDefault: false,
      autocomplete: null,
    };
  }

  return {
    preventDefault: true,
    autocomplete: getAutocompleteResult(rawInput, candidates),
  };
}
