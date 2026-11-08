export const glyphs = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  0: ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  1: ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  2: ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  3: ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  4: ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  5: ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  6: ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  7: ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  8: ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  9: ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  ",": ["00000", "00000", "00000", "00000", "00000", "00100", "01000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "?": ["01110", "10001", "00001", "00010", "00100", "00000", "00100"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  " ": Array(7).fill("00000"),
};
export function matrixFrame(text, offset = 0) {
  return Array.from({ length: 256 }, (_, i) => {
    const x = (i % 32) + offset;
    const y = Math.floor(i / 32);
    const glyph = glyphs[text[Math.floor(x / 6)]];
    return y < 7 && x >= 0 && x % 6 < 5 && glyph?.[y][x % 6] === "1";
  });
}
export function initLedMatrix(motion) {
  const svg = document.querySelector("#led-matrix");
  if (!svg) return;
  const ns = "http://www.w3.org/2000/svg";
  for (let module = 0; module < 4; module++) {
    const rect = document.createElementNS(ns, "rect");
    Object.entries({
      x: module * 86 + 1,
      y: 1,
      width: 84,
      height: 94,
      rx: 2,
      class: "matrix-module",
    }).forEach(([key, value]) => rect.setAttribute(key, value));
    svg.append(rect);
  }
  const dots = Array.from({ length: 256 }, (_, i) => {
    const dot = document.createElementNS(ns, "circle");
    const x = i % 32;
    Object.entries({
      cx: 9 + x * 10 + Math.floor(x / 8) * 6,
      cy: 13 + Math.floor(i / 32) * 10,
      r: 2.8,
      class: "matrix-dot",
    }).forEach(([key, value]) => dot.setAttribute(key, value));
    svg.append(dot);
    return dot;
  });
  const paint = (text, offset) =>
    matrixFrame(text, offset).forEach((lit, i) =>
      dots[i].classList.toggle("is-lit", lit),
    );
  let offset = 0;
  let timer;
  let running = false;
  let resting = true;
  const DEFAULT_MESSAGE = "HELLO, WORLD!";
  let message = DEFAULT_MESSAGE;
  paint("HELLO", -1);
  const tick = () => {
    if (!running) return;
    if (resting) {
      resting = false;
      offset = -32;
    }
    paint(message, offset++);
    if (offset > message.length * 6) {
      resting = true;
      message = DEFAULT_MESSAGE;
      paint("HELLO", -1);
    }
    timer = window.setTimeout(tick, resting ? 10000 : 130);
  };
  // The hero console's `led <text>` writes on the desk's matrix.
  window.addEventListener("portfolio:led", (event) => {
    const text = String(event.detail?.text ?? "").toUpperCase();
    if (!text) return;
    if (!running) {
      // Paused or reduced motion: show the start of it, then go back to HELLO.
      paint(text.slice(0, 5), -1);
      window.setTimeout(() => paint("HELLO", -1), 4000);
      return;
    }
    message = text;
    resting = false;
    offset = -32;
    window.clearTimeout(timer);
    timer = window.setTimeout(tick, 0);
  });
  motion.register(svg.closest(".field-art-card"), (active, reduced) => {
    if (reduced) {
      resting = true;
      offset = 0;
      paint("HELLO", -1);
    }
    if (running === active) return;
    running = active;
    window.clearTimeout(timer);
    if (running) timer = window.setTimeout(tick, resting ? 10000 : 130);
  });
}
