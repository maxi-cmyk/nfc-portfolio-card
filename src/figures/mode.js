// How a 3D figure should run on this device. Pure, so it can be tested.
//   live      animate (the normal case)
//   still     draw one frame and stop (reduced motion)
//   fallback  no WebGL work at all; the pixel-art drawing stays (no WebGL,
//             Save-Data on, or a weak device)
export function chooseRenderMode({
  webgl = true,
  reducedMotion = false,
  saveData = false,
  deviceMemory = 0,
  cores = 0,
} = {}) {
  if (!webgl || saveData) return "fallback";
  if ((deviceMemory && deviceMemory <= 2) || (cores && cores <= 2)) {
    return "fallback";
  }
  return reducedMotion ? "still" : "live";
}
