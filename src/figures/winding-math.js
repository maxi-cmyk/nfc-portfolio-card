// The Fourier "winding machine", with no 3D library. One frame of audio is 128
// samples at 6.4 kHz (as in the firmware), so the bins are 50 Hz apart. To
// test a frequency, wrap the signal around a circle at that frequency and
// average the wound points: that average is the Fourier coefficient.

export const N = 128;
export const FS = 6400;
export const BINS = 65; // 0 Hz to 3200 Hz

// The firmware's three bands.
export const BANDS = {
  red: [50, 250],
  green: [300, 1000],
  blue: [1050, 2500],
};

// An example signal with one tone in each band (an illustration, not a
// recording). Every frequency is a whole number of 50 Hz bins.
export const TONES = [
  { freq: 150, amp: 1 },
  { freq: 600, amp: 0.7 },
  { freq: 1800, amp: 0.5 },
];

export function exampleSignal(n = N) {
  const total = TONES.reduce((sum, t) => sum + t.amp, 0);
  return Array.from(
    { length: n },
    (_, i) =>
      TONES.reduce(
        (sum, t) => sum + t.amp * Math.sin((2 * Math.PI * t.freq * i) / FS),
        0,
      ) / total,
  );
}

export const binFrequency = (k, n = N, fs = FS) => (k * fs) / n;

// The signal wound around the origin at bin k: point i is the sample, pushed
// out along the angle -2π·k·i/N (the sign convention of the DFT).
export function windingPoints(signal, k) {
  const n = signal.length;
  return signal.map((g, i) => {
    const angle = (2 * Math.PI * k * i) / n;
    return [g * Math.cos(angle), -g * Math.sin(angle)];
  });
}

export function centerOfMass(points) {
  const n = points.length;
  let x = 0;
  let y = 0;
  for (const [px, py] of points) {
    x += px;
    y += py;
  }
  return [x / n, y / n];
}

// |X[k]| / N for every bin: how far the centre of mass sits from the axis.
export function spectrum(signal, bins = BINS) {
  return Array.from({ length: bins }, (_, k) => {
    const [x, y] = centerOfMass(windingPoints(signal, k));
    return Math.hypot(x, y);
  });
}

export function bandOf(freq) {
  for (const [name, [low, high]] of Object.entries(BANDS)) {
    if (freq >= low && freq <= high) return name;
  }
  return null;
}
