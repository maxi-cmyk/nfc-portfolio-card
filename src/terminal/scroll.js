export function getLatestResultScrollOptions(prefersReducedMotion) {
  return {
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "center",
    inline: "nearest",
  };
}
