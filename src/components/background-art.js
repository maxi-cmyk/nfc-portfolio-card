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
  // The workbench: the boards and displays behind the projects. Each is also a
  // shortcut to its project, for pointers; the same places are all in Work, so the
  // shortcuts stay out of the tab order and the layer stays hidden from readers.
  layer.innerHTML = [
    ["cyber", network, "#work/timing-attack-lab", "timing-attack-lab", 0.4],
    ["esp32", esp32, "#work/music-leds", "music_LEDs", 1],
    [
      "matrix",
      matrix,
      "#work/conway-game-of-life",
      "Conway's Game of Life",
      0.7,
    ],
    ["camera", camera, "#project/sentinel", "Sentinel", 1.2],
    ["asteroids", asteroids, "#work/asteroids", "Asteroids", 0.5],
  ]
    .map(
      ([name, svg, href, label, depth]) =>
        `<a class="field-art-card ${name}-art" href="${href}" tabindex="-1" data-label="${label.replace(/"/g, "&quot;")}" style="--depth:${depth}">${svg}</a>`,
    )
    .join("");
  landing.prepend(layer);
}
