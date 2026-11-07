import network from "../assets/network-nodes.svg?raw";
import esp32 from "../assets/esp32.svg?raw";
import matrix from "../assets/led-matrix.svg?raw";
import camera from "../assets/camera-board.svg?raw";
import asteroids from "../assets/asteroids-display.svg?raw";

export function initBackgroundArt() {
  const landing = document.querySelector("#landing-view");
  if (!landing) return;

  const layer = document.createElement("aside");
  layer.className = "field-trio";
  layer.setAttribute("aria-hidden", "true");
  // Inline the local SVG assets so the existing CSS and LED runtime can animate them.
  layer.innerHTML = [
    ["cyber", network],
    ["esp32", esp32],
    ["matrix", matrix],
    ["camera", camera],
    ["asteroids", asteroids],
  ]
    .map(
      ([name, svg]) => `<div class="field-art-card ${name}-art">${svg}</div>`,
    )
    .join("");
  landing.prepend(layer);
}
