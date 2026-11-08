// Original pixel art for the desktop: 32×32 icons and a compact-computer
// drawing, built from plain shapes on a grid and emitted as crisp SVG. Colours
// are classes (c-k ink, c-p paper, c-w platinum, c-g shade, c-n navy,
// c-m plum, c-s screen) so the theme stays in CSS. Pure: no DOM.
import { screenPath } from "./mac-screen.js";

const GLYPHS = {
  h: ["x.x", "x.x", "xxx", "x.x", "x.x"],
  e: ["xxx", "x..", "xxx", "x..", "xxx"],
  l: ["x..", "x..", "x..", "x..", "xxx"],
  o: ["xxx", "x.x", "x.x", "x.x", "xxx"],
  ">": ["x..", "xx.", "xxx", "xx.", "x.."],
  _: ["...", "...", "...", "...", "xxx"],
};

const grid = (w, h) => Array.from({ length: h }, () => Array(w).fill(null));
const put = (g, x, y, k) => {
  if (g[y] && x >= 0 && x < g[0].length) g[y][x] = k;
};
const fill = (g, x, y, w, h, k) => {
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) put(g, x + i, y + j, k);
};
const frame = (g, x, y, w, h, k) => {
  fill(g, x, y, w, 1, k);
  fill(g, x, y + h - 1, w, 1, k);
  fill(g, x, y, 1, h, k);
  fill(g, x + w - 1, y, 1, h, k);
};
const line = (g, x0, y0, x1, y1, k) => {
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    put(g, x0, y0, k);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
};
const disc = (g, cx, cy, r, k) => {
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      if (x * x + y * y <= r * r + r) put(g, cx + x, cy + y, k);
    }
  }
};
const text = (g, x, y, str, k) => {
  let cursor = x;
  for (const ch of str) {
    const glyph = GLYPHS[ch];
    glyph.forEach((row, j) =>
      [...row].forEach(
        (cell, i) => cell === "x" && put(g, cursor + i, y + j, k),
      ),
    );
    cursor += 4;
  }
};

function page(g, { corner = true } = {}) {
  fill(g, 7, 3, 18, 26, "p");
  frame(g, 7, 3, 18, 26, "k");
  if (corner) {
    fill(g, 19, 3, 6, 6, null);
    line(g, 19, 3, 24, 8, "k");
    line(g, 19, 3, 19, 8, "k");
    line(g, 19, 8, 24, 8, "k");
    fill(g, 20, 4, 4, 4, "w");
    line(g, 19, 3, 19, 8, "k");
  }
}

const DRAW = {
  work(g) {
    fill(g, 3, 7, 12, 4, "p");
    frame(g, 3, 7, 12, 4, "k");
    fill(g, 3, 10, 26, 17, "p");
    frame(g, 3, 10, 26, 17, "k");
    fill(g, 5, 12, 22, 2, "w");
    fill(g, 5, 21, 12, 2, "n");
    fill(g, 5, 24, 8, 1, "g");
  },
  skills(g) {
    fill(g, 10, 10, 12, 12, "p");
    frame(g, 10, 10, 12, 12, "k");
    fill(g, 13, 13, 6, 6, "n");
    put(g, 11, 11, "m");
    for (let i = 0; i < 4; i++) {
      const p = 12 + i * 3;
      fill(g, p, 6, 1, 4, "k");
      fill(g, p, 22, 1, 4, "k");
      fill(g, 6, p, 4, 1, "k");
      fill(g, 22, p, 4, 1, "k");
    }
  },
  credentials(g) {
    page(g);
    fill(g, 10, 11, 8, 1, "k");
    fill(g, 10, 14, 12, 1, "k");
    fill(g, 10, 17, 6, 1, "k");
    fill(g, 17, 24, 2, 5, "m");
    fill(g, 21, 24, 2, 5, "m");
    disc(g, 20, 22, 4, "m");
    disc(g, 20, 22, 2, "p");
  },
  contact(g) {
    fill(g, 3, 8, 26, 17, "p");
    frame(g, 3, 8, 26, 17, "k");
    line(g, 3, 8, 15, 18, "k");
    line(g, 28, 8, 16, 18, "k");
    fill(g, 23, 19, 4, 4, "m");
    frame(g, 23, 19, 4, 4, "k");
  },
  terminal(g) {
    fill(g, 3, 5, 26, 22, "p");
    frame(g, 3, 5, 26, 22, "k");
    fill(g, 4, 6, 24, 4, "w");
    fill(g, 3, 10, 26, 1, "k");
    frame(g, 5, 7, 3, 3, "k");
    fill(g, 4, 11, 24, 15, "k");
    text(g, 7, 15, ">_", "p");
    fill(g, 16, 15, 3, 5, "p");
  },
  resume(g) {
    page(g);
    fill(g, 10, 8, 10, 1, "k");
    fill(g, 10, 11, 12, 1, "k");
    fill(g, 10, 14, 12, 1, "k");
    fill(g, 15, 17, 2, 6, "n");
    fill(g, 12, 23, 8, 1, "n");
    fill(g, 13, 24, 6, 1, "n");
    fill(g, 14, 25, 4, 1, "n");
    fill(g, 15, 26, 2, 1, "n");
  },
};

function drawMac(g) {
  fill(g, 12, 3, 40, 46, "w");
  frame(g, 12, 3, 40, 46, "k");
  fill(g, 50, 5, 1, 42, "g");
  fill(g, 14, 47, 36, 1, "g");
  fill(g, 17, 8, 30, 28, "g");
  frame(g, 17, 8, 30, 28, "k");
  fill(g, 19, 10, 26, 24, "s");
  frame(g, 19, 10, 26, 24, "k");
  fill(g, 22, 40, 16, 2, "k");
  fill(g, 41, 40, 3, 2, "g");
  put(g, 46, 41, "m");
  fill(g, 10, 49, 44, 4, "w");
  frame(g, 10, 49, 44, 4, "k");
  fill(g, 12, 53, 40, 1, "k");
}

function toSvg(g, className, extra = "") {
  const h = g.length;
  const w = g[0].length;
  const paths = {};
  g.forEach((row, y) => {
    let x = 0;
    while (x < w) {
      const k = row[x];
      if (!k) {
        x++;
        continue;
      }
      let n = 1;
      while (row[x + n] === k) n++;
      (paths[k] ??= []).push(`M${x} ${y}h${n}v1h-${n}z`);
      x += n;
    }
  });
  const body = Object.entries(paths)
    .map(([k, d]) => `<path class="c-${k}" d="${d.join("")}"/>`)
    .join("");
  return `<svg class="${className}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${body}${extra}</svg>`;
}

function drawCard(g) {
  fill(g, 2, 3, 44, 26, "p");
  frame(g, 2, 3, 44, 26, "k");
  for (const [x, y] of [
    [2, 3],
    [45, 3],
    [2, 28],
    [45, 28],
  ])
    put(g, x, y, null);
  frame(g, 5, 6, 38, 20, "n");
  frame(g, 7, 8, 34, 16, "n");
  frame(g, 9, 10, 30, 12, "n");
  fill(g, 11, 12, 6, 6, "m");
  frame(g, 10, 11, 8, 8, "k");
  fill(g, 24, 17, 12, 2, "k");
  fill(g, 24, 20, 8, 1, "g");
}

export const ICON_NAMES = Object.keys(DRAW);

export function renderIcon(name) {
  const g = grid(32, 32);
  DRAW[name](g);
  return toSvg(g, `px-icon px-icon-${name}`);
}

export function renderMac() {
  const g = grid(64, 56);
  drawMac(g);
  // The screen text is its own path, so the console can change what it says.
  const greeting = `<path class="c-k mac-screen-text" d="${screenPath("hello")}"/>`;
  return toSvg(g, "px-icon px-mac", greeting);
}

// What sits on the desktop, in order. `terminal` opens the hero console expanded;
// `resume` downloads the PDF; the rest open a scene.
export const desktopIcons = [
  { key: "work", label: "Work", icon: "work", href: "#work" },
  { key: "skills", label: "Skills", icon: "skills", href: "#skills" },
  {
    key: "credentials",
    label: "Credentials",
    icon: "credentials",
    href: "#certificates",
  },
  { key: "contact", label: "Contact", icon: "contact", href: "#contact" },
  { key: "terminal", label: "Terminal", icon: "terminal", href: "#terminal" },
  {
    key: "resume",
    label: "Resume",
    icon: "resume",
    href: "/assets/Max_Leong_Resume.pdf",
    download: "Max_Leong_Resume.pdf",
  },
];

// The pixel-art card shown while (or instead of) the 3D one.
export function renderCard() {
  const g = grid(48, 32);
  drawCard(g);
  return toSvg(g, "px-icon px-card");
}
