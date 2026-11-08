# Fonts

All fonts are self-hosted woff2 files, declared in `src/styles/foundations/tokens.css`.

- `Jersey15-400.woff2`: Jersey 15, Sarah Cadigan-Fried (Google Fonts), SIL Open Font License 1.1.
  The one pixel voice: headlines, title bars, icon labels, buttons, chips and captions (`--font-chrome`, also `--font-mono`).
  It has a single weight and is scaled 125% by `size-adjust`. It replaced Pixelify Sans because that face's capital C
  reads as an O at every size ("Oontact"); Jersey keeps C, G and O apart.
- `AtkinsonHyperlegibleNext-400.woff2`, `-600.woff2`: Atkinson Hyperlegible Next, Braille Institute, SIL OFL 1.1. Reading text (`--font-text`).
- `IBMPlexMono-400.woff2`, `-500.woff2`: IBM Plex Mono, IBM, SIL OFL 1.1. Only where the text is code: the terminal, code samples, figure read-outs and results tables (`--font-code`).

All are the Latin subsets from the `@fontsource` packages, copied here so the build has no font dependencies.
