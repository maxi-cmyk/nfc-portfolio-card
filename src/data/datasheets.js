// A datasheet strip for each featured project, built only from numbers the project
// already states (its case study, its figure's caption) or the firmware README.
// `check` names the text that must appear in the project's own data, and a test
// holds each row to it. LED colours mark the three bands of music_LEDs.
import { BANDS } from "../figures/winding-math.js";
import { SECRET_BYTES, DELAY_MS } from "../figures/staircase-math.js";
import { HEIGHT, WIDTH } from "../figures/life.js";

const band = (name) => `${BANDS[name][0]}–${BANDS[name][1]} Hz`;

export const datasheets = {
  "music-leds": {
    rows: [
      {
        k: "ADC",
        v: "128 samples at a nominal 6.4 kHz",
        check: "128 samples at a nominal 6.4 kHz",
      },
      {
        k: "Bins",
        v: "50 Hz apart, Nyquist 3.2 kHz",
        check: "bins are 50 Hz apart and Nyquist is 3.2 kHz",
      },
      { k: "GPIO 19", v: `red · ${band("red")}`, led: "r", readme: true },
      { k: "GPIO 18", v: `green · ${band("green")}`, led: "g", readme: true },
      { k: "GPIO 23", v: `blue · ${band("blue")}`, led: "b", readme: true },
    ],
  },
  asteroids: {
    rows: [
      {
        k: "ESP32",
        v: "128×64 OLED, joystick, fire button, buzzer",
        check: "128×64 OLED",
      },
      {
        k: "Browser",
        v: "480×270 pixel-art canvas, WebAssembly",
        check: "480×270",
      },
      {
        k: "Input",
        v: "PS4 pad, or keyboard and mouse",
        check: "PS4 controller",
      },
      {
        k: "Scores",
        v: "separate tables: ESP32 and browser",
        check: "Browser and ESP32 score tables stay separate",
      },
    ],
    bar: {
      label: "20 ms step, in order (not to scale)",
      parts: ["Sample", "Update", "Render", "Sound"],
      check: "20 ms",
    },
  },
  "timing-attack-lab": {
    rows: [
      { k: "Secret", v: `${SECRET_BYTES} bytes, synthetic`, check: "4-byte" },
      {
        k: "Leak",
        v: `${DELAY_MS} ms per matching byte (the lab's default)`,
        check: "1 ms",
      },
      { k: "Scope", v: "localhost only", check: "localhost only" },
    ],
  },
  "conway-game-of-life": {
    rows: [
      {
        k: "Board",
        v: `${WIDTH}×${HEIGHT}, wrapped into a torus`,
        check: "32×8",
      },
      {
        k: "Rule",
        v: "born with 3 neighbours, survives with 2 or 3",
        check: "exactly three",
      },
    ],
  },
  cya: {
    rows: [
      {
        k: "Validation",
        v: "99.62% mean accuracy under JPEG, blur, resizing",
        check: "99.62%",
      },
      { k: "Held out", v: "140 of 141 (single run)", check: "140 of 141" },
    ],
  },
  itspeak: {
    rows: [
      { k: "Result", v: "2nd place, first full-stack app", check: "2nd place" },
    ],
  },
  echo: {
    rows: [
      {
        k: "Event",
        v: "iNTUition 2026, Best Freshmen Award",
        check: "Best Freshmen Award",
      },
    ],
  },
};

const esc = (text) =>
  String(text).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// The strip as HTML: used by the static page and by the case-study window.
export function renderDatasheet(name, slug) {
  const sheet = datasheets[slug];
  if (!sheet) return "";
  const rows = sheet.rows
    .map(
      (r) =>
        `<div><dt>${esc(r.k)}</dt><dd>${r.led ? `<i class="led led-${r.led}"></i>` : ""}${esc(r.v)}</dd></div>`,
    )
    .join("");
  const bar = sheet.bar
    ? `<div class="sheet-bar" role="img" aria-label="${esc(sheet.bar.label)}: ${sheet.bar.parts.join(", ")}">${sheet.bar.parts
        .map((p) => `<span>${esc(p)}</span>`)
        .join("")}<small>${esc(sheet.bar.label)}</small></div>`
    : "";
  return `<section class="sheet is-dark" aria-label="${esc(name)} datasheet"><h4>${esc(name)} · datasheet</h4><dl>${rows}</dl>${bar}</section>`;
}
