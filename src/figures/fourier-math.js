// A name drawn by rotating circles. The text is a single pen path (strokes joined
// by straight travel lines); a discrete Fourier transform of that path gives one
// circle per coefficient, and adding the circles' tips draws it again. Pure maths,
// no DOM, so it is tested.

// One continuous pen stroke per letter on a 4 x 6 grid; retraced lines are fine.
const PEN = {
  A: [
    [0, 6],
    [2, 0],
    [4, 6],
    [3, 3],
    [1, 3],
  ],
  E: [
    [4, 0],
    [0, 0],
    [0, 3],
    [3, 3],
    [0, 3],
    [0, 6],
    [4, 6],
  ],
  G: [
    [4, 1],
    [4, 0],
    [0, 0],
    [0, 6],
    [4, 6],
    [4, 3],
    [2, 3],
  ],
  L: [
    [0, 0],
    [0, 6],
    [4, 6],
  ],
  M: [
    [0, 6],
    [0, 0],
    [2, 3],
    [4, 0],
    [4, 6],
  ],
  N: [
    [0, 6],
    [0, 0],
    [4, 6],
    [4, 0],
  ],
  O: [
    [0, 0],
    [4, 0],
    [4, 6],
    [0, 6],
    [0, 0],
  ],
  X: [
    [0, 0],
    [4, 6],
    [2, 3],
    [4, 0],
    [0, 6],
  ],
};
export const PEN_LETTERS = Object.keys(PEN);
const ADVANCE = 6; // 4 wide + 2 gap

export function penPath(text) {
  const out = [];
  let x = 0;
  for (const char of text.toUpperCase()) {
    const stroke = PEN[char];
    if (stroke) for (const [px, py] of stroke) out.push([x + px, py]);
    x += ADVANCE;
  }
  return { points: out, width: x - 2, height: 6 };
}

// Even spacing along the path, so the circles move at a steady speed.
export function resample(points, count) {
  const lengths = [0];
  for (let i = 1; i < points.length; i++) {
    lengths.push(
      lengths[i - 1] +
        Math.hypot(
          points[i][0] - points[i - 1][0],
          points[i][1] - points[i - 1][1],
        ),
    );
  }
  const total = lengths.at(-1);
  const out = [];
  let seg = 1;
  for (let k = 0; k < count; k++) {
    const target = (k / count) * total;
    while (seg < points.length - 1 && lengths[seg] < target) seg++;
    const span = lengths[seg] - lengths[seg - 1] || 1;
    const t = (target - lengths[seg - 1]) / span;
    out.push([
      points[seg - 1][0] + (points[seg][0] - points[seg - 1][0]) * t,
      points[seg - 1][1] + (points[seg][1] - points[seg - 1][1]) * t,
    ]);
  }
  return out;
}

// Coefficients, biggest first: { freq, re, im, amp, phase }.
export function dft(points) {
  const n = points.length;
  const coeffs = [];
  for (let k = 0; k < n; k++) {
    let re = 0;
    let im = 0;
    for (let j = 0; j < n; j++) {
      const angle = (-2 * Math.PI * k * j) / n;
      const [x, y] = points[j];
      re += x * Math.cos(angle) - y * Math.sin(angle);
      im += x * Math.sin(angle) + y * Math.cos(angle);
    }
    re /= n;
    im /= n;
    const freq = k > n / 2 ? k - n : k;
    coeffs.push({
      freq,
      re,
      im,
      amp: Math.hypot(re, im),
      phase: Math.atan2(im, re),
    });
  }
  return coeffs.sort((a, b) => b.amp - a.amp);
}

// The chain of circle centres at time t (0 to 1 is one full drawing), using the
// first `count` coefficients. The last element is the pen tip.
export function epicycles(coeffs, t, count = coeffs.length) {
  const chain = [];
  let x = 0;
  let y = 0;
  for (const c of coeffs.slice(0, count)) {
    const angle = 2 * Math.PI * c.freq * t + c.phase;
    chain.push({ x, y, r: c.amp });
    x += c.amp * Math.cos(angle);
    y += c.amp * Math.sin(angle);
  }
  chain.push({ x, y, r: 0 });
  return chain;
}
