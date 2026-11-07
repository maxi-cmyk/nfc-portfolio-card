// One visibility policy for CSS loops and the LED display's timer.
export function initMotion() {
  // Keep the restored artwork beside current project cards as filters reflow.
  const artLayer = document.querySelector(".field-trio");
  const work = document.querySelector("#work");
  if (artLayer && work) {
    const anchors = [
      [".esp32-art", "music-leds", 80],
      [".matrix-art", "conway-game-of-life", 140],
      [".camera-art", "sentinel", 200],
      [".asteroids-art", "asteroids", 260],
    ];
    const placeModels = () => {
      const origin = artLayer.getBoundingClientRect().top;
      for (const [selector, slug, fallbackOffset] of anchors) {
        const model = artLayer.querySelector(selector);
        const card = work.querySelector(`[data-project-slug="${slug}"]`);
        const anchor = card && !card.hidden ? card : work;
        const offset = anchor === work ? fallbackOffset : 30;
        model.style.top = `${anchor.getBoundingClientRect().top - origin + offset}px`;
      }
    };
    const layoutObserver = new ResizeObserver(placeModels);
    layoutObserver.observe(document.querySelector("#portfolio"));
    layoutObserver.observe(work);
    new MutationObserver(placeModels).observe(work, {
      subtree: true,
      attributes: true,
      attributeFilter: ["hidden"],
    });
    window.addEventListener("resize", placeModels);
    placeModels();
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
    const state = { visible: !observer, onChange };
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
