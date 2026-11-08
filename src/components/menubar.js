// The menu bar clock. It reads the visitor's own clock, once a minute.
export function formatClock(date) {
  return date
    .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    .replace(/\s/g, " ");
}

// The frame gauge: after a window opens, time forty frames and show the average, a
// real measurement of this device. The games budget 20 ms a frame.
function initFrameGauge() {
  const meter = document.querySelector(".gauge-frame .meter");
  const label = document.querySelector("[data-frame]");
  if (!meter || !label) return;
  const segments = 10;
  meter.innerHTML = "<i></i>".repeat(segments);
  let sampling = false;
  const show = (ms) => {
    label.textContent = `${ms.toFixed(0)} ms`;
    const lit = Math.min(
      segments,
      Math.max(1, Math.round((ms / 20) * segments)),
    );
    [...meter.children].forEach((seg, i) =>
      seg.classList.toggle("is-lit", i < lit),
    );
    meter.classList.toggle("is-over", ms > 20);
  };
  const sample = () => {
    if (sampling || document.hidden) return;
    sampling = true;
    let frames = 0;
    let first = 0;
    const tick = (now) => {
      first ||= now;
      if (++frames < 40) return requestAnimationFrame(tick);
      show((now - first) / (frames - 1));
      sampling = false;
    };
    requestAnimationFrame(tick);
  };
  window.addEventListener("portfolio:scene", () =>
    window.setTimeout(sample, 400),
  );
  window.setTimeout(sample, 1200);
}

// The speaker: sound is off until it is switched on, and loads only then.
function initSound() {
  const button = document.querySelector(".menubar-sound");
  if (!button) return;
  let sound = null;
  try {
    button.dataset.saved = localStorage.getItem("portfolio.sound") ?? "";
  } catch {
    // Private mode: it starts off each visit.
  }
  const apply = async (enabled) => {
    sound ??= await import("./sound.js");
    const result = sound.setSound(enabled);
    button.setAttribute("aria-pressed", String(result));
    try {
      localStorage.setItem("portfolio.sound", result ? "1" : "0");
    } catch {
      // Not saved; fine.
    }
  };
  button.addEventListener("click", () =>
    apply(button.getAttribute("aria-pressed") !== "true"),
  );
  document.addEventListener(
    "click",
    (event) => {
      if (!sound || event.target.closest(".menubar-sound")) return;
      const name = sound.soundFor(event.target);
      if (name) sound.play(name);
    },
    true,
  );
  window.addEventListener("portfolio:led-sound", () => sound?.play("led"));
}

export function initMenubar() {
  initFrameGauge();
  initSound();
  const clock = document.querySelector(".menubar-clock");
  if (!clock) return;
  const tick = () => {
    clock.textContent = formatClock(new Date());
  };
  tick();
  window.setInterval(tick, 20_000);
}
