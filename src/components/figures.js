// Loads the 3D stage only when a figure is on screen and the device can afford
// it. Until then (and always on weak devices) the pixel-art drawing stays.
import { chooseRenderMode } from "../figures/mode.js";

function detect() {
  let webgl = false;
  try {
    const probe = document.createElement("canvas");
    webgl = Boolean(probe.getContext("webgl2") || probe.getContext("webgl"));
  } catch {
    webgl = false;
  }
  return {
    webgl,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
    saveData: Boolean(navigator.connection?.saveData),
    deviceMemory: navigator.deviceMemory ?? 0,
    cores: navigator.hardwareConcurrency ?? 0,
  };
}

export function initFigures() {
  const hostsNow = () => [...document.querySelectorAll("[data-figure]")];
  if (!hostsNow().length) return;
  const mode = chooseRenderMode(detect());
  const idle = window.requestIdleCallback
    ? (fn) => window.requestIdleCallback(fn, { timeout: 1200 })
    : (fn) => setTimeout(fn, 250);

  if (mode === "fallback") {
    for (const host of hostsNow()) host.dataset.figureState = "fallback";
    document
      .querySelectorAll(".stage")
      .forEach((stage) => stage.classList.add("no-3d"));
    window.addEventListener("portfolio:figure", (event) => {
      event.detail.host.dataset.figureState = "fallback";
    });
    return;
  }
  for (const host of hostsNow()) {
    if (host.dataset.figure) host.dataset.figureState = "waiting";
  }

  let stage = null;
  let loading = null;
  async function load() {
    stage ??= (await import("../figures/stage.js")).createStage({ mode });
    return stage;
  }

  async function mountVisible() {
    if (loading) return loading;
    const waiting = hostsNow().filter(
      (host) =>
        host.dataset.figure &&
        host.dataset.figureState === "waiting" &&
        host.getClientRects().length,
    );
    if (!waiting.length) return;
    loading = (async () => {
      try {
        const s = await load();
        for (const host of waiting) s.mount(host);
      } catch {
        for (const host of hostsNow()) host.dataset.figureState = "fallback";
      }
      loading = null;
    })();
    return loading;
  }

  // A window changed which figure its host shows.
  window.addEventListener("portfolio:figure", async (event) => {
    const host = event.detail.host;
    if (!stage) {
      if (host.dataset.figure) host.dataset.figureState = "waiting";
      return;
    }
    if (host.dataset.figureState === "idle")
      host.dataset.figureState = "waiting";
    stage.swap(host);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) idle(mountVisible);
    },
    { rootMargin: "100px" },
  );
  hostsNow().forEach((host) => observer.observe(host));
  // The observer can be quiet in a background tab, so also try shortly after
  // load and whenever the scene changes; visible, waiting hosts are mounted.
  setTimeout(() => idle(mountVisible), 600);
  window.addEventListener("portfolio:scene", () => idle(mountVisible));
}
