// The desk comes alive: its objects shift with depth as you move, the camera board's
// lens follows you, the ESP32's LED cycles through the three bands' colours, and the
// OLED plays an Asteroids attract mode. Everything runs only while the desktop is on
// screen, and stops for reduced motion. Loaded after first paint.
import { reduced } from "./reduced-motion.js";

const onHub = () =>
  document.documentElement.dataset.scene === "hub" && !document.hidden;

// ---- parallax: objects at different depths, shadows moving the other way --------
function initParallax(layer) {
  let px = 0;
  let py = 0;
  let queued = false;
  const apply = () => {
    queued = false;
    layer.style.setProperty("--px", px.toFixed(3));
    layer.style.setProperty("--py", py.toFixed(3));
  };
  const set = (x, y) => {
    px = Math.max(-1, Math.min(1, x));
    py = Math.max(-1, Math.min(1, y));
    if (!queued) {
      queued = true;
      requestAnimationFrame(apply);
    }
  };
  if (matchMedia("(pointer: fine)").matches) {
    window.addEventListener(
      "pointermove",
      (event) =>
        set(
          (event.clientX / window.innerWidth - 0.5) * 2,
          (event.clientY / window.innerHeight - 0.5) * 2,
        ),
      { passive: true },
    );
  }
  // Tilting a phone moves the desk, where the browser allows it without a prompt
  // (iOS asks first, so it is left alone there).
  if (
    "DeviceOrientationEvent" in window &&
    typeof DeviceOrientationEvent.requestPermission !== "function"
  ) {
    window.addEventListener(
      "deviceorientation",
      (event) => {
        if (event.gamma == null) return;
        set(event.gamma / 25, ((event.beta ?? 45) - 45) / 25);
      },
      { passive: true },
    );
  }
}

// ---- the OLED's attract mode: vector rocks drift, a ship turns and fires -------
const W = 108;
const H = 56;
function rock(seed, size) {
  const points = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = size * (0.7 + 0.3 * Math.abs(Math.sin(seed * 7.3 + i * 2.1)));
    points.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return points;
}

function initAttract(card) {
  const svg = card.querySelector("svg");
  if (!svg) return;
  const canvas = document.createElement("canvas");
  canvas.className = "oled-attract";
  canvas.width = W;
  canvas.height = H;
  canvas.setAttribute("aria-hidden", "true");
  card.append(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const rocks = [
    { x: 20, y: 14, vx: 0.18, vy: 0.1, s: 8, seed: 1, spin: 0.01, a: 0 },
    { x: 80, y: 40, vx: -0.12, vy: 0.14, s: 10, seed: 2, spin: -0.008, a: 1 },
    { x: 54, y: 8, vx: 0.08, vy: -0.1, s: 6, seed: 3, spin: 0.014, a: 2 },
    { x: 96, y: 12, vx: -0.16, vy: -0.06, s: 5, seed: 4, spin: -0.012, a: 3 },
  ].map((r) => ({ ...r, shape: rock(r.seed, r.s) }));
  let ship = 0;
  let shot = null;
  let tick = 0;
  let raf = 0;
  let last = 0;

  const line = (points, x, y, a) => {
    ctx.beginPath();
    points.forEach(([px, py], i) => {
      const rx = x + px * Math.cos(a) - py * Math.sin(a);
      const ry = y + px * Math.sin(a) + py * Math.cos(a);
      i ? ctx.lineTo(rx, ry) : ctx.moveTo(rx, ry);
    });
    ctx.closePath();
    ctx.stroke();
  };

  function frame(now) {
    raf = 0;
    if (onHub() && !reduced()) raf = requestAnimationFrame(frame);
    else return;
    if (now - last < 50) return; // 20 ms steps are the game's; 50 ms is plenty here
    last = now;
    tick++;
    ctx.fillStyle = "#d9edf6";
    ctx.fillRect(0, 0, W, H);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#12376b";
    for (const r of rocks) {
      r.x = (r.x + r.vx + W + r.s * 2) % (W + r.s * 2);
      r.y = (r.y + r.vy + H + r.s * 2) % (H + r.s * 2);
      r.a += r.spin;
      line(r.shape, r.x - r.s, r.y - r.s, r.a);
    }
    // The ship turns slowly in the middle and fires a shot every couple of seconds.
    ship += 0.05;
    ctx.strokeStyle = "#7a2e5d";
    line(
      [
        [0, -5],
        [3.5, 4],
        [0, 2],
        [-3.5, 4],
      ],
      W / 2,
      H / 2,
      ship,
    );
    if (tick % 36 === 0)
      shot = { x: W / 2, y: H / 2, a: ship - Math.PI / 2, life: 18 };
    if (shot) {
      shot.x += Math.cos(shot.a) * 3;
      shot.y += Math.sin(shot.a) * 3;
      ctx.fillStyle = "#7a2e5d";
      ctx.fillRect(shot.x - 1, shot.y - 1, 2, 2);
      if (--shot.life <= 0) shot = null;
    }
  }
  const kick = () => {
    if (!raf && onHub() && !reduced()) raf = requestAnimationFrame(frame);
  };
  window.addEventListener("portfolio:scene", kick);
  document.addEventListener("visibilitychange", kick);
  kick();
}

export function initDesk() {
  const layer = document.querySelector(".field-trio");
  if (!layer || reduced()) return;
  initParallax(layer);
  const oled = layer.querySelector(".asteroids-art");
  if (oled) initAttract(oled);
}
