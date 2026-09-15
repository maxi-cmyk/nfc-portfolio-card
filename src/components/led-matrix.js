const glyphs = {
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  ",": ["00000", "00000", "00000", "00000", "00000", "00100", "01000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
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
  paint("HELLO", -1);
  const tick = () => {
    if (!running) return;
    if (resting) {
      resting = false;
      offset = -32;
    }
    paint("HELLO, WORLD!", offset++);
    if (offset > 72) {
      resting = true;
      paint("HELLO", -1);
    }
    timer = window.setTimeout(tick, resting ? 10000 : 130);
  };
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
