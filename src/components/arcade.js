// The desk's Asteroids: an idle screensaver that becomes a game you can play with
// the keyboard or a touch pad. The rules live in
// figures/arcade-core.js; this file draws them and reads the inputs. Loaded on demand.
import {
  SIZES,
  STEP,
  WORLD,
  addScore,
  cleanInitials,
  createGame,
  qualifies,
  stepGame,
} from "../figures/arcade-core.js";
import { reduced } from "./reduced-motion.js";

const STORE = "portfolio.arcade";
const IDLE_MS = 25000;

function loadScores() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) ?? "{}");
    return {
      table: Array.isArray(saved.table) ? saved.table : [],
      initials: saved.initials ?? "MAX",
    };
  } catch {
    return { table: [], initials: "MAX" };
  }
}
function saveScores(scores) {
  try {
    localStorage.setItem(STORE, JSON.stringify(scores));
  } catch {
    // Private mode: the scores last for this visit only.
  }
}

// A rock's outline from its seed: nine points with a rough radius.
const outline = (rock) => {
  const r = SIZES[rock.size];
  return Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2 + rock.angle;
    const k = 0.72 + 0.28 * Math.abs(Math.sin(rock.seed * 7.3 + i * 2.1));
    return [rock.x + Math.cos(a) * r * k, rock.y + Math.sin(a) * r * k];
  });
};

let ui = null;

function build() {
  const root = document.createElement("div");
  root.className = "arcade is-dark";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-label", "Asteroids");
  root.tabIndex = -1;
  root.innerHTML = `<canvas class="arcade-screen" width="${WORLD.w}" height="${WORLD.h}" aria-hidden="true"></canvas>
    <p class="arcade-hint" data-hint></p>
    <form class="arcade-initials" data-initials hidden><label>Initials <input maxlength="3" autocomplete="off" spellcheck="false" aria-label="Your three initials" /></label><button type="submit" class="push">Save score</button></form>
    <ol class="arcade-scores" data-scores aria-label="Top scores on this device"></ol>
    <div class="arcade-touch" data-touch>
      <button type="button" class="push" data-hold="left" aria-label="Turn left">◀</button>
      <button type="button" class="push" data-hold="thrust" aria-label="Thrust">▲</button>
      <button type="button" class="push" data-hold="right" aria-label="Turn right">▶</button>
      <button type="button" class="push" data-hold="fire" aria-label="Fire">Fire</button>
    </div>
    <div class="arcade-actions"><button type="button" class="push" data-play>Play</button><button type="button" class="push" data-leave>Leave</button></div>`;
  document.body.append(root);
  return {
    root,
    canvas: root.querySelector("canvas"),
    ctx: root.querySelector("canvas").getContext("2d"),
    hint: root.querySelector("[data-hint]"),
    form: root.querySelector("[data-initials]"),
    scores: root.querySelector("[data-scores]"),
  };
}

function open(mode) {
  if (ui) return;
  const opener = document.activeElement;
  const els = build();
  const held = new Set();
  let scores = loadScores();
  let state = createGame(Date.now() & 0xffff, { attract: mode === "attract" });
  let phase = mode; // attract | play | over
  let raf = 0;
  let last = 0;
  let acc = 0;
  let lastMove = null;

  const hints = {
    attract: "Asteroids · Space to play · any other key or a move to leave",
    play: "◀ ▶ turn · ▲ thrust · Space fire · Esc to leave",
    over: "Game over · Enter to play again · Esc to leave",
  };
  const renderScores = () => {
    els.scores.innerHTML = scores.table.length
      ? scores.table
          .map(
            (e) =>
              `<li><span>${e.initials}</span><span>${String(e.score).padStart(5, "0")}</span></li>`,
          )
          .join("")
      : "<li><span>---</span><span>00000</span></li>";
  };
  const setPhase = (next) => {
    phase = next;
    els.hint.textContent = hints[next];
    els.root.dataset.phase = next;
    els.form.hidden = true;
    renderScores();
  };

  function start() {
    state = createGame(Date.now() & 0xffff);
    setPhase("play");
  }
  function leave() {
    cancelAnimationFrame(raf);
    removeEventListener("keydown", onKey, true);
    removeEventListener("keyup", onKeyUp, true);
    removeEventListener("pointermove", onMove, true);
    els.root.remove();
    ui = null;
    if (opener?.isConnected) opener.focus?.({ preventScroll: true });
  }
  ui = { leave, start };

  function gameOver() {
    setPhase("over");
    if (qualifies(scores.table, state.score)) {
      els.form.hidden = false;
      const input = els.form.querySelector("input");
      input.value = scores.initials;
      input.focus();
      input.select();
    }
  }
  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const initials = cleanInitials(els.form.querySelector("input").value);
    scores = { table: addScore(scores.table, initials, state.score), initials };
    saveScores(scores);
    els.form.hidden = true;
    renderScores();
    els.root.focus();
  });

  const KEYS = {
    ArrowLeft: "left",
    KeyA: "left",
    ArrowRight: "right",
    KeyD: "right",
    ArrowUp: "thrust",
    KeyW: "thrust",
    Space: "fire",
  };
  function onKey(event) {
    const typing = event.target.matches?.("input");
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      return leave();
    }
    if (typing) return;
    if (phase === "attract") {
      event.preventDefault();
      event.stopPropagation();
      return event.code === "Space" || event.key === "Enter"
        ? start()
        : leave();
    }
    if (phase === "over" && event.key === "Enter") {
      event.preventDefault();
      return start();
    }
    if (KEYS[event.code]) {
      event.preventDefault();
      event.stopPropagation();
      held.add(KEYS[event.code]);
    }
  }
  const onKeyUp = (event) => KEYS[event.code] && held.delete(KEYS[event.code]);
  function onMove(event) {
    if (phase !== "attract") return;
    if (
      lastMove &&
      Math.hypot(event.clientX - lastMove.x, event.clientY - lastMove.y) > 12
    )
      leave();
    lastMove ??= { x: event.clientX, y: event.clientY };
  }
  addEventListener("keydown", onKey, true);
  addEventListener("keyup", onKeyUp, true);
  addEventListener("pointermove", onMove, true);

  els.root.addEventListener("click", (event) => {
    if (event.target.closest("[data-play]")) start();
    else if (event.target.closest("[data-leave]")) leave();
    else if (phase === "attract" && !event.target.closest("button")) leave();
  });
  for (const button of els.root.querySelectorAll("[data-hold]")) {
    const key = button.dataset.hold;
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      held.add(key);
    });
    for (const end of ["pointerup", "pointerleave", "pointercancel"]) {
      button.addEventListener(end, () => held.delete(key));
    }
  }

  function draw() {
    const { ctx } = els;
    ctx.fillStyle = "#0a1429";
    ctx.fillRect(0, 0, WORLD.w, WORLD.h);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#e6eeff";
    for (const rock of state.rocks) {
      ctx.beginPath();
      outline(rock).forEach(([x, y], i) =>
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y),
      );
      ctx.closePath();
      ctx.stroke();
    }
    if (!state.attract && !state.over) {
      const { ship } = state;
      if (ship.safe === 0 || Math.floor(state.time * 10) % 2 === 0) {
        ctx.strokeStyle = "#f3a9d0";
        ctx.beginPath();
        for (const [i, [px, py]] of [
          [8, 0],
          [-6, 5],
          [-3, 0],
          [-6, -5],
        ].entries()) {
          const x = ship.x + px * Math.cos(ship.a) - py * Math.sin(ship.a);
          const y = ship.y + px * Math.sin(ship.a) + py * Math.cos(ship.a);
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
    ctx.fillStyle = "#4fe08a";
    for (const s of state.shots) ctx.fillRect(s.x - 1, s.y - 1, 2, 2);
    ctx.strokeStyle = "#9cc0ff";
    for (const burst of state.bursts) {
      ctx.beginPath();
      ctx.arc(burst.x, burst.y, (0.5 - burst.life) * 60 + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#9cc0ff";
    ctx.font = '15px "Jersey 15", monospace';
    if (!state.attract) {
      ctx.fillText(`SCORE ${String(state.score).padStart(5, "0")}`, 10, 18);
      ctx.fillText(`WAVE ${state.wave}`, WORLD.w / 2 - 22, 18);
      ctx.fillText("♥".repeat(Math.max(0, state.lives)), WORLD.w - 60, 18);
    }
    if (phase === "attract") {
      ctx.fillStyle = "#e6eeff";
      ctx.font = '26px "Jersey 15", monospace';
      ctx.fillText("ASTEROIDS", WORLD.w / 2 - 56, WORLD.h / 2 - 6);
    }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (document.hidden) return;
    const dt = Math.min(0.1, (now - (last || now)) / 1000);
    last = now;
    if (phase === "play") {
      const input = {
        left: held.has("left"),
        right: held.has("right"),
        thrust: held.has("thrust"),
        fire: held.has("fire"),
      };
      acc += dt;
      while (acc >= STEP) {
        stepGame(state, input);
        acc -= STEP;
      }
      if (state.over) gameOver();
    } else {
      acc += dt;
      while (acc >= STEP) {
        stepGame(state, {});
        acc -= STEP;
      }
    }
    draw();
  }
  setPhase(mode);
  els.root.focus({ preventScroll: true });
  raf = requestAnimationFrame(frame);
}

export const startGame = () => (ui ? ui.start() : open("play"));

// After a quiet spell on the desktop (pointer devices only), the screensaver starts.
export function initScreensaver() {
  if (!matchMedia("(pointer: fine)").matches || reduced()) return;
  let timer = 0;
  const arm = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (
        !ui &&
        document.documentElement.dataset.scene === "hub" &&
        !document.hidden
      ) {
        if (!document.querySelector("dialog[open]")) open("attract");
      }
      arm();
    }, IDLE_MS);
  };
  for (const type of ["pointermove", "pointerdown", "keydown", "wheel"]) {
    addEventListener(type, arm, { passive: true });
  }
  arm();
}
