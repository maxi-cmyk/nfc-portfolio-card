// The little Mac's screen: a 3x5 pixel font and a layout that fits the
// 26 x 24 pixel screen. Pure: it returns an SVG path, so the page can echo
// whatever is typed into the console without a canvas or an image.
const FONT = {
  a: [".x.", "x.x", "xxx", "x.x", "x.x"],
  b: ["xx.", "x.x", "xx.", "x.x", "xx."],
  c: [".xx", "x..", "x..", "x..", ".xx"],
  d: ["xx.", "x.x", "x.x", "x.x", "xx."],
  e: ["xxx", "x..", "xx.", "x..", "xxx"],
  f: ["xxx", "x..", "xx.", "x..", "x.."],
  g: [".xx", "x..", "x.x", "x.x", ".xx"],
  h: ["x.x", "x.x", "xxx", "x.x", "x.x"],
  i: ["xxx", ".x.", ".x.", ".x.", "xxx"],
  j: ["..x", "..x", "..x", "x.x", ".x."],
  k: ["x.x", "x.x", "xx.", "x.x", "x.x"],
  l: ["x..", "x..", "x..", "x..", "xxx"],
  m: ["x.x", "xxx", "xxx", "x.x", "x.x"],
  n: ["xx.", "x.x", "x.x", "x.x", "x.x"],
  o: ["xxx", "x.x", "x.x", "x.x", "xxx"],
  p: ["xx.", "x.x", "xx.", "x..", "x.."],
  q: [".x.", "x.x", "x.x", "xx.", ".xx"],
  r: ["xx.", "x.x", "xx.", "x.x", "x.x"],
  s: [".xx", "x..", ".x.", "..x", "xx."],
  t: ["xxx", ".x.", ".x.", ".x.", ".x."],
  u: ["x.x", "x.x", "x.x", "x.x", "xxx"],
  v: ["x.x", "x.x", "x.x", "x.x", ".x."],
  w: ["x.x", "x.x", "xxx", "xxx", "x.x"],
  x: ["x.x", "x.x", ".x.", "x.x", "x.x"],
  y: ["x.x", "x.x", ".x.", ".x.", ".x."],
  z: ["xxx", "..x", ".x.", "x..", "xxx"],
  0: ["xxx", "x.x", "x.x", "x.x", "xxx"],
  1: [".x.", "xx.", ".x.", ".x.", "xxx"],
  2: ["xx.", "..x", ".x.", "x..", "xxx"],
  3: ["xx.", "..x", ".x.", "..x", "xx."],
  4: ["x.x", "x.x", "xxx", "..x", "..x"],
  5: ["xxx", "x..", "xx.", "..x", "xx."],
  6: [".xx", "x..", "xxx", "x.x", "xxx"],
  7: ["xxx", "..x", ".x.", ".x.", ".x."],
  8: ["xxx", "x.x", "xxx", "x.x", "xxx"],
  9: ["xxx", "x.x", "xxx", "..x", "xx."],
  "-": ["...", "...", "xxx", "...", "..."],
  ".": ["...", "...", "...", "...", ".x."],
  ":": ["...", ".x.", "...", ".x.", "..."],
  "'": [".x.", ".x.", "...", "...", "..."],
  "!": [".x.", ".x.", ".x.", "...", ".x."],
  "?": ["xx.", "..x", ".x.", "...", ".x."],
  ",": ["...", "...", "...", ".x.", "x.."],
  "/": ["..x", "..x", ".x.", "x..", "x.."],
  " ": ["...", "...", "...", "...", "..."],
};

export const SCREEN = { x: 19, y: 10, w: 26, h: 24 };
export const SCREEN_CHARS = 6; // characters that fit on a line: 6 x 4 - 1 = 23 px

// What the screen shows for what was typed: the command word on the first line
// and the start of its argument on the second ("cat" / "music-"). Nothing typed
// shows the greeting.
export function screenLines(typed) {
  const clean = String(typed ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
  if (!clean) return ["hello"];
  const space = clean.indexOf(" ");
  const first = (space === -1 ? clean : clean.slice(0, space)).slice(
    0,
    SCREEN_CHARS,
  );
  const rest =
    space === -1 ? "" : clean.slice(space + 1).slice(0, SCREEN_CHARS);
  return rest ? [first, rest] : [first];
}

// Merged horizontal runs, in the Mac's 64 x 56 pixel space.
export function screenPath(typed) {
  const lines = screenLines(typed);
  const total = lines.length * 5 + (lines.length - 1);
  let y = SCREEN.y + Math.floor((SCREEN.h - total) / 2);
  const runs = [];
  for (const line of lines) {
    const width = line.length * 4 - 1;
    let x = SCREEN.x + Math.floor((SCREEN.w - width) / 2);
    for (const char of line) {
      const glyph = FONT[char] ?? FONT["?"];
      glyph.forEach((row, j) => {
        let i = 0;
        while (i < 3) {
          if (row[i] !== "x") {
            i++;
            continue;
          }
          let n = 1;
          while (row[i + n] === "x") n++;
          runs.push(`M${x + i} ${y + j}h${n}v1h-${n}z`);
          i += n;
        }
      });
      x += 4;
    }
    y += 6;
  }
  return runs.join("");
}

export const FONT_CHARS = Object.keys(FONT);
