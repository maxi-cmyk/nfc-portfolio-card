// The three window buttons: red closes, yellow minimizes to the desktop icon,
// green zooms. They are real buttons with names, never decoration.
export function createLights({ name, onClose, onMinimize, onZoom }) {
  const group = document.createElement("div");
  group.className = "lights";
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", `${name} window controls`);
  const make = (kind, label, handler) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `light ${kind}`;
    button.setAttribute("aria-label", label);
    button.addEventListener("click", handler);
    return button;
  };
  const close = make("red", `Close ${name}`, onClose);
  const minimize = make("yellow", `Minimize ${name} to its icon`, onMinimize);
  const zoom = make("green", `Zoom ${name}`, onZoom);
  zoom.setAttribute("aria-pressed", "false");
  group.append(close, minimize, zoom);
  return {
    el: group,
    setZoomed(on) {
      zoom.setAttribute("aria-pressed", String(on));
    },
  };
}
