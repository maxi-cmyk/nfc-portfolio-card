// Which project gets which 3D figure, what its controls are, and the caption
// that says exactly what is real and what is schematic. Pure data.

const ms = (v) => `${v}`;

export const FIGURES = {
  "music-leds": {
    id: "winding",
    title: "Winding machine",
    controls: [
      {
        type: "range",
        id: "bin",
        label: "Winding frequency",
        min: 0,
        max: 64,
        step: 1,
        value: 3,
        unit: "Hz",
        scale: 50,
      },
      { type: "toggle", id: "auto", label: "Auto-sweep", value: true },
    ],
    caption:
      "An example signal (tones at 150, 600 and 1800 Hz, one in each of the firmware's bands) is wound around an axis at the chosen frequency. When the frequency matches a tone, the wound curve goes lopsided and its centre of mass moves off the axis (shown ×3). The LED takes the band's colour: 50–250 Hz red, 300–1000 Hz green, 1050–2500 Hz blue. 128 samples at 6.4 kHz, so the bins are 50 Hz apart.",
  },
  "timing-attack-lab": {
    id: "staircase",
    title: "Timing staircase",
    controls: [
      {
        type: "toggle",
        id: "fixed",
        label: "Constant-time compare",
        value: false,
      },
    ],
    caption:
      "Illustrative, from the lab's design: the vulnerable comparison sleeps 1 ms after every matching byte of a 4-byte synthetic secret, so the response time climbs one step per correct byte; the constant-time comparison flattens it. Measured results are WIP.",
  },
  "conway-game-of-life": {
    id: "torus",
    title: "Torus world",
    controls: [
      { type: "button", id: "glider", label: "Add glider" },
      { type: "button", id: "reset", label: "Reseed" },
    ],
    caption:
      "The 32×8 board is wrapped into a torus, so a glider that leaves one edge comes back at the opposite one. A cell is born with exactly three neighbours and survives with two or three.",
  },
  cya: {
    id: "boundary",
    title: "Decision boundary",
    controls: [
      {
        type: "range",
        id: "strength",
        label: "Transform strength",
        min: 0,
        max: 100,
        step: 1,
        value: 30,
        unit: "%",
        scale: 1,
      },
      {
        type: "select",
        id: "kind",
        label: "Transformation",
        value: "jpeg",
        options: [
          { value: "jpeg", label: "JPEG recompression" },
          { value: "blur", label: "Blur" },
          { value: "resize", label: "Resize" },
        ],
      },
    ],
    caption:
      "A schematic of the idea, not real embeddings: authentic (navy) and AI-generated (plum) images fall either side of a boundary, and a transformation pulls them toward it. Reported results: 99.62% mean accuracy under JPEG, blur and resizing on validation; 140 of 141 on the held-out test (single run).",
  },
};

export const figureFor = (slug) =>
  Object.hasOwn(FIGURES, slug) ? FIGURES[slug] : null;

// The control values a figure starts with.
export const defaultParams = (figure) =>
  Object.fromEntries(
    figure.controls
      .filter((c) => c.id && "value" in c)
      .map((c) => [c.id, c.value]),
  );

void ms;
