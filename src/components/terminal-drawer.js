// The terminal is a window, opened from its desktop icon or the backtick key. It never changes the URL; navigating away closes it.
import { createLights } from "./lights.js";

export function initTerminalDrawer() {
  const terminal = document.getElementById("terminal");
  if (!terminal)
    return { open() {}, close() {}, toggle() {}, isOpen: () => false };

  let opener = null;
  const toggles = () => document.querySelectorAll("[data-terminal-toggle]");

  // The static window buttons become real ones once the drawer exists.
  const bar = terminal.querySelector(".terminal-bar");
  const lights = createLights({
    name: "Terminal",
    onClose: () => api.close({ restoreFocus: true }),
    onMinimize: () => {
      api.close({ restoreFocus: true });
      icon()?.classList.add("is-minimized");
    },
    onZoom: () => {
      const on = terminal.classList.toggle("is-zoomed");
      lights.setZoomed(on);
    },
  });
  bar?.querySelector(".lights")?.replaceWith(lights.el);
  const icon = () => document.querySelector('[data-icon="terminal"]');

  const sync = () => {
    const expanded = String(api.isOpen());
    toggles().forEach((el) => el.setAttribute("aria-expanded", expanded));
    toggles().forEach((el) => (el.hidden = false));
  };

  const api = {
    isOpen: () => terminal.classList.contains("is-open"),
    open() {
      if (api.isOpen()) return;
      opener = document.activeElement;
      terminal.classList.add("is-open");
      icon()?.classList.remove("is-minimized");
      sync();
      document.getElementById("command-input")?.focus({ preventScroll: true });
    },
    close({ restoreFocus = false } = {}) {
      if (!api.isOpen()) return;
      terminal.classList.remove("is-open");
      sync();
      if (restoreFocus && opener?.isConnected)
        opener.focus({ preventScroll: true });
      opener = null;
    },
    toggle() {
      api.isOpen() ? api.close({ restoreFocus: true }) : api.open();
    },
  };

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-terminal-toggle]")) api.toggle();
  });
  terminal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      api.close({ restoreFocus: true });
    }
  });
  sync();
  return api;
}
