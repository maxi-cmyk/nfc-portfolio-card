// One visibility policy for CSS loops and the LED display's timer.
export function initMotion() {
  // Keep these two models beside AI & math as preceding content reflows.
  const artLayer = document.querySelector(".field-trio");
  const aiSection = document
    .querySelector('[data-focus="ai-math"]')
    ?.closest("article");
  const matrix = document.querySelector(".matrix-art");
  const asteroids = document.querySelector(".asteroids-art");
  if (artLayer && aiSection && matrix && asteroids) {
    const placeAiModels = () => {
      const top =
        aiSection.getBoundingClientRect().top -
        artLayer.getBoundingClientRect().top;
      matrix.style.top = `${top}px`;
      asteroids.style.top = `${top + 60}px`;
    };
    const layoutObserver = new ResizeObserver(placeAiModels);
    layoutObserver.observe(document.querySelector("#portfolio"));
    layoutObserver.observe(aiSection);
    window.addEventListener("resize", placeAiModels);
    placeAiModels();
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const regions = new Map();
  const update = (element, state) => {
    const running = state.visible && !document.hidden && !reduced.matches;
    element.dataset.motionRunning = String(running);
    state.onChange?.(running, reduced.matches);
  };
  const observer =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              const state = regions.get(entry.target);
              state.visible = entry.isIntersecting;
              update(entry.target, state);
            }
          },
          { threshold: 0.01 },
        )
      : null;
  const refresh = () =>
    regions.forEach((state, element) => update(element, state));
  document.addEventListener("visibilitychange", refresh);
  reduced.addEventListener("change", refresh);
  const register = (element, onChange) => {
    if (!element) return;
    element.classList.add("motion-region");
    const state = { visible: false, onChange };
    regions.set(element, state);
    update(element, state);
    observer?.observe(element);
  };
  document
    .querySelectorAll(
      ".field-art-card, .certificate-art, #panda-mascot, #terminal, #boot-screen",
    )
    .forEach((element) => register(element));
  return { register };
}
