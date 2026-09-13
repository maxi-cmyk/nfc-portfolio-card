# Stylesheet structure

`main.css` is the ordered stylesheet entry point. Vite inlines its imports in
production, so these files are source-level ownership boundaries rather than
additional browser requests.

## Ownership

- `foundations/base.css` — tokens, box sizing, document defaults, and shared
  element defaults.
- `components/boot.css` — startup screen and boot log.
- `components/shell.css` — page shell and desktop system rail.
- `components/intro.css` — masthead, introduction, mascot, and profile header.
- `components/terminal.css` — terminal window, results, autocomplete, and quick
  commands.
- `components/focus.css` — focus index, tooling rows, and its technical artwork.
- `components/certificates.css` — certificate presentation and site footer.
- `responsive-motion.css` — the existing cross-surface narrow-layout overrides
  and reduced-motion contract.
- `components/subpage.css` — focus subpage shell and project cards.
- `components/project-modal.css` — shared project dialog shell.
- `components/case-studies.css` — project-specific case-study layouts and their
  narrow-layout adaptations.
- `effects/terminal-glitch.css` — the terminal sudo glitch effect.
- `themes/retro-apple.css` — System 7 visual overrides; loaded after `main.css`
  by `index.html` so it remains the active theme.

## Maintenance rules

1. Keep imports in their current order unless the rendered cascade is reviewed.
2. Put new styles beside the component or feature that owns them.
3. Keep feature-specific media queries with that feature. The shared responsive
   file remains only for the original cross-surface mobile and motion contracts.
4. Preserve semantic class names used by the vanilla JavaScript renderers; CSS
   Modules are not used because several components construct class names at
   runtime.
