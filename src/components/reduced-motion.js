// One place to ask whether the visitor wants less motion.
export const reduced = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches;
