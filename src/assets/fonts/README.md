# Fonts

All fonts are self-hosted woff2 files, declared in `src/styles/foundations/tokens.css`.

- `DepartureMono-Regular.woff2`: Departure Mono by Helena Zhang, SIL Open Font License 1.1 (departuremono.com).
  Bitmap-style display face. Use it only at multiples of 11px (22, 33, 55, 77, 99) so the pixel grid stays crisp.
- `AtkinsonHyperlegibleNext-400.woff2`, `-600.woff2`: Atkinson Hyperlegible Next, Braille Institute, SIL OFL 1.1.
- `IBMPlexMono-400.woff2`, `-500.woff2`: IBM Plex Mono, IBM, SIL OFL 1.1.

The Atkinson and Plex files are the Latin subsets from the `@fontsource` packages, copied here so the build has no font dependencies.
