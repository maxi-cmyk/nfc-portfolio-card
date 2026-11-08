// Scene transitions. Every kind is short, stepped (a few hard frames, not a
// smooth ease), interruptible, and finishes with the new scene shown. The
// caller passes `apply`, which swaps the scene; it runs exactly once, even if
// the transition is cancelled first. Reduced motion just calls `apply`.
//
// The zoom outlines animate left/top/width/height on one empty, fixed element
// for under 300ms; that is the only non-compositor animation here.

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

export function createTransitions({
  reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  speed = () => 1,
} = {}) {
  let token = 0;
  let pending = null;
  const animations = new Set();
  const timers = new Set();

  const ms = (n) => n * speed();
  const flush = () => {
    if (!pending) return;
    const apply = pending;
    pending = null;
    apply();
  };
  const cleanup = () => {
    animations.forEach((a) => a.cancel());
    animations.clear();
    timers.forEach((id) => clearTimeout(id));
    timers.clear();
    document.querySelectorAll(".fx-layer").forEach((node) => node.remove());
  };
  const sleep = (time) =>
    new Promise((resolve) => {
      const id = setTimeout(() => {
        timers.delete(id);
        resolve();
      }, time);
      timers.add(id);
    });
  const play = (node, keyframes, options) => {
    const animation = node.animate(keyframes, options);
    animations.add(animation);
    return animation.finished.catch(() => {});
  };

  // A newer navigation, or a click mid-transition, lands here: stop everything,
  // apply any scene swap that has not happened, and leave no overlay behind.
  function cancel() {
    token += 1;
    cleanup();
    flush();
  }

  const center = (area) => ({
    left: area.left + area.width / 2 - 24,
    top: area.top + area.height / 2 - 16,
    width: 48,
    height: 32,
  });
  const box = (rect) => ({
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  });

  function outlines(fromRect, toRect, { fade = false } = {}) {
    return [0, 1, 2].map((i) => {
      const node = document.createElement("div");
      node.className = "fx-layer fx-rect";
      Object.assign(node.style, box(fromRect));
      document.body.append(node);
      return play(
        node,
        [
          { ...box(fromRect), opacity: 1 },
          { ...box(toRect), opacity: fade ? 0.2 : 1 },
        ],
        {
          duration: ms(240),
          delay: ms(i * 35),
          easing: "steps(6, end)",
          fill: "forwards",
        },
      );
    });
  }

  async function zoomIn({ apply, scene, source, area }) {
    const t = token;
    const rects = outlines(source ?? center(area), area, { fade: true });
    await sleep(ms(110));
    if (t !== token) return;
    pending = null;
    apply();
    if (scene) {
      play(scene, [{ opacity: 0 }, { opacity: 1 }], {
        duration: ms(160),
        easing: "steps(3, end)",
      });
    }
    await Promise.all(rects);
  }

  // `source` may be a function so the target can be measured once the new
  // scene is showing (the icon a closing window shrinks into).
  async function zoomOut({ apply, source, area }) {
    pending = null;
    apply();
    const target = typeof source === "function" ? source() : source;
    await Promise.all(outlines(area, target ?? center(area)));
  }

  async function slide(kind, { apply, scene }) {
    pending = null;
    apply();
    if (!scene) return;
    const forward = kind === "slide-next";
    await play(
      scene,
      [
        {
          clipPath: forward ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)",
          transform: `translateX(${forward ? 20 : -20}px)`,
        },
        { clipPath: "inset(0 0 0 0)", transform: "translateX(0)" },
      ],
      { duration: ms(240), easing: "steps(6, end)" },
    );
  }

  // Ordered dither: platinum covers the page one Bayer level at a time, the
  // scene swaps, then the cover is lifted in the same order.
  async function dissolve({ apply }) {
    const t = token;
    const cell = 4;
    const canvas = document.createElement("canvas");
    canvas.className = "fx-layer fx-dither";
    canvas.width = Math.ceil(window.innerWidth / cell);
    canvas.height = Math.ceil(window.innerHeight / cell);
    const ctx = canvas.getContext("2d");
    const paper =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--bg")
        .trim() || "#d6d5cd";
    ctx.fillStyle = paper;
    const draw = (level) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          if (BAYER[(y % 4) * 4 + (x % 4)] < level) ctx.fillRect(x, y, 1, 1);
        }
      }
    };
    document.body.append(canvas);
    const up = [3, 6, 9, 12, 16];
    for (const level of up) {
      draw(level);
      await sleep(ms(28));
      if (t !== token) return;
    }
    pending = null;
    apply();
    for (const level of [...up].reverse().slice(1).concat(0)) {
      draw(level);
      await sleep(ms(28));
      if (t !== token) return;
    }
    canvas.remove();
  }

  async function run(kind, options) {
    cancel();
    if (kind === "none" || reducedMotion()) {
      options.apply();
      return;
    }
    pending = options.apply;
    const t = token;
    if (kind === "zoom-in") await zoomIn(options);
    else if (kind === "zoom-out") await zoomOut(options);
    else if (kind === "dissolve") await dissolve(options);
    else await slide(kind, options);
    if (t === token) {
      flush();
      cleanup();
    }
  }

  return {
    run,
    cancel,
    isRunning: () => pending !== null || animations.size > 0,
  };
}
