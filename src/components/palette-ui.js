import { matchPalette } from "../navigation/palette.js";

// A native <dialog> gives the focus trap, Escape and inert background for free.
export function initPalette({ go, openTerminal }) {
  const dialog = document.createElement("dialog");
  dialog.id = "palette";
  dialog.className = "palette";
  dialog.setAttribute("aria-label", "Jump to");
  dialog.innerHTML = `<form method="dialog" class="palette-form">
    <label class="palette-label" for="palette-input">Jump to</label>
    <input id="palette-input" class="palette-input" type="text" role="combobox" aria-expanded="true" aria-controls="palette-list" aria-autocomplete="list" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="work, skills, a project…" />
    <ul id="palette-list" class="palette-list" role="listbox"></ul>
    <p class="palette-hint">↑ ↓ to choose · Enter to go · Esc to close</p>
  </form>`;
  document.body.append(dialog);
  const input = dialog.querySelector("input");
  const list = dialog.querySelector("ul");
  let items = [];
  let active = 0;

  const paint = () => {
    list.innerHTML = items
      .map(
        (item, i) =>
          `<li role="option" id="palette-opt-${i}" data-i="${i}" aria-selected="${i === active}"><span class="palette-name">${item.label}</span><span class="palette-meta">${item.hint ?? ""}</span></li>`,
      )
      .join("");
    input.setAttribute(
      "aria-activedescendant",
      items.length ? `palette-opt-${active}` : "",
    );
  };
  const refresh = () => {
    items = matchPalette(input.value);
    active = 0;
    paint();
  };
  const choose = (item) => {
    if (!item) return;
    dialog.close();
    if (item.action === "terminal") openTerminal();
    else if (item.href) {
      const a = document.createElement("a");
      a.href = item.href;
      if (item.download) a.download = item.download;
      a.click();
    } else go(item.hash);
  };

  input.addEventListener("input", refresh);
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!items.length) return;
      active =
        (active + (event.key === "ArrowDown" ? 1 : -1) + items.length) %
        items.length;
      paint();
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(items[active]);
    }
  });
  list.addEventListener("click", (event) => {
    const row = event.target.closest("[data-i]");
    if (row) choose(items[Number(row.dataset.i)]);
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  return {
    open() {
      if (dialog.open) return;
      input.value = "";
      refresh();
      dialog.showModal();
      input.focus();
    },
    isOpen: () => dialog.open,
  };
}
