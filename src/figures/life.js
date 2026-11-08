// Conway's Game of Life on a wrapped (toroidal) board, B3/S23. A cell is born
// with exactly three live neighbours and survives with two or three. Pure.

export const WIDTH = 32;
export const HEIGHT = 8;

export const emptyBoard = (w = WIDTH, h = HEIGHT) => new Uint8Array(w * h);

export function step(cells, w = WIDTH, h = HEIGHT) {
  const next = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let alive = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx || dy) {
            alive += cells[((y + dy + h) % h) * w + ((x + dx + w) % w)];
          }
        }
      }
      const self = cells[y * w + x];
      next[y * w + x] = alive === 3 || (self && alive === 2) ? 1 : 0;
    }
  }
  return next;
}

// A glider heading down and to the right, its top-left corner at (x, y).
export function addGlider(cells, x, y, w = WIDTH, h = HEIGHT) {
  for (const [dx, dy] of [
    [1, 0],
    [2, 1],
    [0, 2],
    [1, 2],
    [2, 2],
  ]) {
    cells[((y + dy) % h) * w + ((x + dx) % w)] = 1;
  }
  return cells;
}

export const population = (cells) => cells.reduce((sum, c) => sum + c, 0);

export function seedBoard() {
  return addGlider(emptyBoard(), 2, 1);
}
