export function getActiveRailTarget(entries) {
  return [...entries]
    .filter((entry) => entry.isIntersecting)
    .sort(
      (first, second) => second.intersectionRatio - first.intersectionRatio,
    )[0]?.target.id;
}
