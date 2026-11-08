// The name in LED dots on a dark instrument screen. On the first arrival of a
// session a set of rotating circles (a Fourier series of the name's pen path)
// traces MAX LEONG, gaining circles as it goes, then the dots light left to right.
// While the About window is showing, the drawing replays every so often. Reduced
// motion and a screen that cannot animate show the lit name at once. The h1's real
// text stays in the page for readers and search.
import { glyphs } from "./led-matrix.js";
import { reduced } from "./reduced-motion.js";
import { dft, epicycles, penPath, resample } from "../figures/fourier-math.js";

const COLS_PER_CHAR = 6;
const ROWS = 7;
const TRACE_MS = 3000;
const RESOLVE_MS = 800;
const CIRCLES = 90;
const REPLAY_MS = 14000; // rest between drawings

export function initOledName() {
  const title = document.getElementById("site-title");
  const canvas = title?.querySelector(".oled-canvas");
  const text = title?.querySelector(".name-text")?.textContent.trim();
  const ctx = canvas?.getContext?.("2d");
  if (!title || !canvas || !ctx || !text) return null;

  const cols = text.length * COLS_PER_CHAR - 1;
  const lit = new Set();
  [...text.toUpperCase()].forEach((char, i) => {
    (glyphs[char] ?? glyphs[" "]).forEach((row, y) =>
      [...row].forEach(
        (v, x) => v === "1" && lit.add(`${i * COLS_PER_CHAR + x},${y}`),
      ),
    );
  });
  const coeffs = dft(resample(penPath(text).points, 96));

  let pitch = 8;
  let dpr = 1;
  let phase = "idle"; // trace | resolve | idle
  let started = 0;
  let raf = 0;
  let sweep = -10;
  let rested = performance.now(); // when the name last went still

  function layout() {
    const width = Math.floor(title.clientWidth);
    if (width < 120) return;
    pitch = Math.max(4, Math.min(13, Math.floor((width - 12) / cols)));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = cols * pitch + 12;
    const h = (ROWS - 1) * pitch + 22;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    draw(performance.now());
  }

  const cx = (col) => 6 + col * pitch + pitch / 2;
  const cy = (row) => 11 + row * pitch;

  function dot(col, row, brightness) {
    const x = cx(col);
    const y = cy(row);
    if (brightness > 0.05) {
      ctx.fillStyle = `rgba(156,192,255,${0.22 * brightness})`;
      ctx.fillRect(
        x - pitch * 0.62,
        y - pitch * 0.62,
        pitch * 1.24,
        pitch * 1.24,
      );
    }
    ctx.fillStyle =
      brightness > 0.05
        ? `rgba(230,238,255,${0.55 + 0.45 * brightness})`
        : "rgba(120,150,210,0.16)";
    const r = pitch * 0.34;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  function draw(now) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const elapsed = now - started;
    const t = phase === "trace" ? Math.min(1, elapsed / TRACE_MS) : 1;
    const reveal =
      phase === "trace"
        ? -1
        : phase === "resolve"
          ? Math.min(1, (elapsed - TRACE_MS) / RESOLVE_MS)
          : 1;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < cols; x++) {
        const on = lit.has(`${x},${y}`);
        let b = 0;
        if (on && x / cols <= reveal) {
          b = 1;
          if (phase === "idle")
            b = 0.8 + 0.2 * Math.max(0, 1 - Math.abs(x - sweep) / 4);
        }
        dot(x, y, b);
      }
    }
    if (phase === "trace" || phase === "resolve") {
      const fade =
        phase === "resolve"
          ? Math.max(0, 1 - (elapsed - TRACE_MS) / RESOLVE_MS)
          : 1;
      const count = Math.round(4 + (CIRCLES - 4) * Math.min(1, t * 1.15));
      const spin = t * 0.999;
      const chain = epicycles(coeffs, spin, count);
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(156,192,255,${0.3 * fade})`;
      for (const c of chain.slice(0, 30)) {
        if (c.r * pitch < 1.5) continue;
        ctx.beginPath();
        ctx.arc(
          6 + pitch * (c.x + 0.5),
          11 + pitch * c.y,
          c.r * pitch,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
      ctx.strokeStyle = `rgba(243,169,208,${0.8 * fade})`;
      ctx.beginPath();
      chain.forEach((c, i) => {
        const x = 6 + pitch * (c.x + 0.5);
        const y = 11 + pitch * c.y;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      });
      ctx.stroke();
      // The trail: where the tip has been.
      ctx.strokeStyle = `rgba(230,238,255,${0.9 * fade})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      const steps = Math.floor(t * 160);
      for (let i = 0; i <= steps; i++) {
        const tip = epicycles(coeffs, (i / 160) * 0.999, count).at(-1);
        const x = 6 + pitch * (tip.x + 0.5);
        const y = 11 + pitch * tip.y;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
  }

  function frame(now) {
    raf = 0;
    const elapsed = now - started;
    if (phase === "trace" && elapsed >= TRACE_MS) phase = "resolve";
    if (phase === "resolve" && elapsed >= TRACE_MS + RESOLVE_MS) {
      phase = "idle";
      rested = now;
    }
    if (phase === "idle") {
      // A slow scan across the lit name, then the circles draw it again.
      sweep = ((now / 90) % (cols + 60)) - 8;
      if (now - rested > REPLAY_MS) {
        phase = "trace";
        started = now;
      }
    }
    draw(now);
    const visible =
      document.documentElement.dataset.scene === "hub" && !document.hidden;
    if (visible && !reduced()) raf = requestAnimationFrame(frame);
  }
  const kick = () => {
    if (!raf && !reduced()) raf = requestAnimationFrame(frame);
  };

  title.classList.add("has-oled");
  canvas.hidden = false;
  layout();
  new ResizeObserver(layout).observe(title);
  window.addEventListener("portfolio:scene", () => {
    if (phase === "idle") rested = performance.now();
    draw(performance.now());
    kick();
  });
  document.addEventListener("visibilitychange", kick);
  kick();

  return {
    // The intro: circles trace the name, then the dots light.
    play() {
      if (reduced()) return;
      phase = "trace";
      started = performance.now();
      kick();
    },
    finish() {
      phase = "idle";
      rested = performance.now();
      draw(performance.now());
    },
  };
}
