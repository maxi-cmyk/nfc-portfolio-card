// One shared WebGL canvas for every figure on the page. Each figure draws only
// into the rectangle of its host element (scissor viewports), so adding figures
// never adds WebGL contexts. A host can change figure (the Work window swaps
// figures as you change project) and its controls arrive as events. This module
// imports three.js and is loaded lazily.
import { WebGLRenderer } from "three";
import { createBoundaryFigure } from "./boundary.js";
import { createCardFigure } from "./card.js";
import { disposeFigure } from "./common.js";
import { createOrbit, dragOrbit, stepOrbit } from "./orbit.js";
import { createStaircaseFigure } from "./staircase.js";
import { createTorusFigure } from "./torus.js";
import { createWindingFigure } from "./winding.js";

const FIGURES = {
  card: createCardFigure,
  winding: createWindingFigure,
  staircase: createStaircaseFigure,
  torus: createTorusFigure,
  boundary: createBoundaryFigure,
};

// A figure takes its colours from the element it draws into, so a dark
// instrument screen (.is-dark) gets pale line art on near-black automatically.
const palette = (host) => {
  const style = getComputedStyle(host);
  const css = (name, fallback) =>
    style.getPropertyValue(name).trim() || fallback;
  return {
    ink: css("--ink", "#1d1d1d"),
    paper: css("--panel", "#f4f3ed"),
    navy: css("--navy", "#12376b"),
    acid: css("--acid", "#1e4f9e"),
    plum: css("--warm", "#7a2e5d"),
    muted: css("--muted", "#545454"),
  };
};

export function createStage({ mode }) {
  const canvas = document.createElement("canvas");
  canvas.className = "stage-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.append(canvas);

  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0x000000, 0);

  const entries = new Map();
  let raf = 0;
  let last = 0;
  let clock = 0;
  let sinceReport = 0;
  let failed = false;

  const resize = () => {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  };
  resize();

  // The part of a host that is on screen, not under a title bar or a status
  // strip, and not outside its scrolling window.
  function visibleRect(host) {
    const r = host.getBoundingClientRect();
    if (!host.getClientRects().length || r.width < 2 || r.height < 2)
      return null;
    let { left, top, right, bottom } = r;
    const scene = host.closest(".scene");
    if (scene) {
      const s = scene.getBoundingClientRect();
      // Only bars that are showing count: a hidden status strip has no rectangle.
      const shown = (el) =>
        el?.getClientRects().length ? el.getBoundingClientRect() : null;
      const bar = shown(scene.querySelector(":scope > .titlebar"));
      const status = shown(scene.querySelector(":scope > .statusbar"));
      left = Math.max(left, s.left);
      right = Math.min(right, s.right);
      top = Math.max(top, bar ? bar.bottom : s.top);
      bottom = Math.min(bottom, status ? status.top : s.bottom);
    }
    left = Math.max(left, 0);
    top = Math.max(top, 0);
    right = Math.min(right, window.innerWidth);
    bottom = Math.min(bottom, window.innerHeight);
    if (right - left < 2 || bottom - top < 2) return null;
    return { x: left, y: top, w: right - left, h: bottom - top, full: r };
  }

  // Tells the controls what the figure changed, and refreshes the readout.
  function report(host, entry, force = false) {
    const params = entry.figure.params?.();
    const text = entry.figure.readout?.();
    const key = JSON.stringify(params);
    if (params && (force || key !== entry.paramsKey)) {
      entry.paramsKey = key;
      host.dispatchEvent(
        new CustomEvent("figure:state", { bubbles: true, detail: params }),
      );
    }
    if (text !== undefined && (force || text !== entry.readout)) {
      entry.readout = text;
      const el = host.closest(".stage")?.querySelector("[data-readout]");
      if (el) el.textContent = text;
    }
  }

  function draw(now) {
    raf = 0;
    if (failed) return;
    const dt = Math.min((now - last) / 1000 || 0.016, 0.05);
    last = now;
    clock += dt;
    sinceReport += dt;
    renderer.setScissorTest(false);
    renderer.clear();
    renderer.setScissorTest(true);
    let anyVisible = false;
    let moving = false;
    for (const [host, entry] of entries) {
      const rect = visibleRect(host);
      if (!rect) continue;
      anyVisible = true;
      entry.figure.setSize(rect.full.width, rect.full.height);
      // A thumbnail fills its small screen, so it zooms in past the full-fit distance.
      if (entry.thumb) entry.figure.camera.position.z *= 0.58;
      if (stepOrbit(entry.orbit, dt)) moving = true;
      entry.figure.update({
        time: clock,
        dt,
        pointer: entry.pointer,
        orbit: entry.orbit,
        still: mode === "still",
      });
      renderer.setViewport(
        rect.full.left,
        window.innerHeight - rect.full.bottom,
        rect.full.width,
        rect.full.height,
      );
      renderer.setScissor(
        rect.x,
        window.innerHeight - (rect.y + rect.h),
        rect.w,
        rect.h,
      );
      renderer.render(entry.figure.scene, entry.figure.camera);
      if (entry.dirty || sinceReport > 0.2) {
        report(host, entry, entry.dirty);
        entry.dirty = false;
      }
    }
    if (sinceReport > 0.2) sinceReport = 0;
    // Loop only while something is showing and the tab is in front.
    if ((mode === "live" || moving) && anyVisible && !document.hidden)
      schedule();
  }

  function schedule() {
    if (!raf && !failed) raf = requestAnimationFrame(draw);
  }

  function build(host) {
    const id = host.dataset.figure;
    const factory = FIGURES[id];
    if (!factory) return null;
    return {
      id,
      figure: factory(palette(host)),
      pointer: { x: 0, y: 0 },
      orbit: createOrbit(),
      thumb: host.hasAttribute("data-thumb"),
      paramsKey: "",
      readout: "",
    };
  }

  function listen(host, entry) {
    // Tile thumbnails only turn on their own; the tile is a link.
    if (host.hasAttribute("data-thumb")) return;
    const track = (event) => {
      const r = host.getBoundingClientRect();
      entry.pointer.x = ((event.clientX - r.left) / r.width) * 2 - 1;
      entry.pointer.y = ((event.clientY - r.top) / r.height) * 2 - 1;
      schedule();
    };
    if (mode === "live") {
      host.addEventListener("pointermove", track);
      host.addEventListener("pointerenter", () => {
        entry.figure.setHover?.(true);
        schedule();
      });
      host.addEventListener("pointerleave", () => {
        entry.figure.setHover?.(false);
        entry.pointer.x = entry.pointer.y = 0;
        schedule();
      });
    }
    // Drag to turn the figure. On touch, a vertical swipe still scrolls the page
    // (touch-action: pan-y), so a finger turns it left and right only.
    let dragFrom = null;
    host.addEventListener("pointerdown", (event) => {
      entry.figure.nudge?.(1);
      dragFrom = { x: event.clientX, y: event.clientY, t: event.timeStamp };
      entry.orbit.dragging = true;
      entry.orbit.vyaw = entry.orbit.vpitch = 0;
      host.setPointerCapture?.(event.pointerId);
      host.classList.add("is-turning");
      schedule();
    });
    host.addEventListener("pointermove", (event) => {
      if (!dragFrom) return;
      const dt = (event.timeStamp - dragFrom.t) / 1000;
      dragOrbit(
        entry.orbit,
        event.clientX - dragFrom.x,
        event.pointerType === "touch" ? 0 : event.clientY - dragFrom.y,
        dt,
      );
      dragFrom = { x: event.clientX, y: event.clientY, t: event.timeStamp };
      schedule();
    });
    const release = () => {
      if (!dragFrom) return;
      dragFrom = null;
      entry.orbit.dragging = false;
      host.classList.remove("is-turning");
      schedule();
    };
    host.addEventListener("pointerup", release);
    host.addEventListener("pointercancel", release);
    host
      .closest(".figure-frame")
      ?.querySelector("[data-figure-wake]")
      ?.addEventListener("click", () => {
        entry.figure.nudge?.(1);
        schedule();
      });
  }

  function mount(host) {
    if (entries.has(host) || failed) return;
    const entry = build(host);
    if (!entry) return;
    entries.set(host, entry);
    host.dataset.figureState = mode;
    listen(host, entry);
    report(host, entry, true);
    schedule();
  }

  // The host now names a different figure (or none): replace or remove it.
  function swap(host) {
    const old = entries.get(host);
    if (!old) return mount(host);
    if (old.id === host.dataset.figure) return;
    disposeFigure(old.figure);
    const entry = build(host);
    if (entry) {
      // Keep the host's listeners (they read the live entry) by reusing the
      // pointer object and pointing the old closures at the new figure.
      entry.pointer = old.pointer;
      entry.orbit = old.orbit;
      entries.set(host, Object.assign(old, entry));
      host.dataset.figureState = mode;
      report(host, old, true);
    } else {
      entries.delete(host);
      host.dataset.figureState = "idle";
    }
    schedule();
  }

  // Controls and case-study steps arrive as events from the page.
  window.addEventListener("figure:control", (event) => {
    const { host, id, value } = event.detail;
    const entry = entries.get(host);
    if (!entry) return;
    entry.figure.set?.(id, value);
    entry.dirty = true;
    schedule();
  });
  window.addEventListener("figure:step", (event) => {
    const { host, step, total } = event.detail;
    const entry = entries.get(host);
    if (!entry) return;
    entry.figure.setStep?.(step, total);
    entry.dirty = true;
    schedule();
  });

  const wake = () => schedule();
  window.addEventListener("resize", () => {
    resize();
    wake();
  });
  window.addEventListener("scroll", wake, true);
  window.addEventListener("portfolio:scene", wake);
  document.addEventListener("visibilitychange", wake);
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    failed = true;
    for (const host of entries.keys()) host.dataset.figureState = "fallback";
    canvas.remove();
  });

  return { mount, swap, wake };
}
