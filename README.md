# Max Leong — NFC portfolio

A Vite site with a retro desktop theme, a retro Macintosh-style desktop (pixel icons, an About window, and every other scene as a window with red, yellow and green buttons), a terminal window, a command palette, and one shared project collection. Without JavaScript it is one linear page. Three project groups (Signals & hardware, Systems & security, Applied AI & products) filter work with any-match logic; each project has one case-study URL. Facts that are not yet known show as dashed `WIP` placeholders; `npm run wip` lists them.

## Run locally

Use Node 20.19+ or Node 22.12+ and npm.

```sh
npm ci
npm run dev
```

Vite prints its local URL. Stop with Ctrl+C. To inspect the production build:

```sh
npm run build
npm run preview
```

## Content and assets

- `src/data/projects.js` owns the project cards (hook, role, proof, stack, links), the "Also built" shelf, group membership, and case-study blocks. `src/data/case-study-steps.js` reads any case-study layout as a list of short steps.
- `src/data/focus-tools.js` owns the optional tooling disclosure and terminal skills output.
- `src/data/certificates.js` owns certificate metadata.
- `public/assets/` contains the public resume, certificate PDF/preview, favicon, and sharing image. These are versioned source assets, not generated deployment secrets.
- `npm run content` updates the marked static sections in `index.html`. Run it after editing project/certificate data. Development and production builds also run it automatically. Edit the generator rather than the HTML inside generated markers.
- Static project summaries, expandable case studies, certificate links, resume, and contact links remain available when JavaScript cannot load. Filters, terminal commands, and modal details enhance that content.

## Verify

```sh
npm run verify
```

This checks generated-content freshness, runs the Node tests, builds production output, and verifies linked public files exist and PDFs have valid headers. Run `git diff --check` before committing.

Browser checks should cover overlapping filters, reset, legacy category links, project open/close, Back/Forward, refresh/direct links, keyboard focus, and mobile layouts. Browser emulation is separate from real-device testing.

## URLs

- `#home`, `#work`, `#shelf`, `#skills`, `#certificates` (also `#credentials`), `#contact`: scenes. `#terminal` opens the terminal drawer over the hub.
- `#work/echo`: one project in the pager. `#project/echo/2`: step 2 of its case study; `#project/echo/read`: the full write-up.
- `#work?categories=signals-hardware,applied-ai`: the pager walks only the matching projects (add `&project=<slug>` to pick one).
- `#project/music-leds`: a permanent case-study link.
- Existing `#focus` and `#focus/<category>` links map to the shared work index. The retired ids `engineering`, `cybersecurity`, `ai-math` and `hackathons` still resolve (to the new groups, or to all work for `hackathons`).
- Unknown fragments show a recovery message with a link to all work.

Closing a project opened from the site returns through browser history and restores the list position and initiating control. A direct or refreshed project link returns to the saved browsing context when available, otherwise all work.

## Deploy

Publish `dist/` using a static host. The build command is `npm ci && npm run verify`; the output directory is `dist`. Public asset paths assume the site is served at the domain root. No backend, environment variables, or credentials are required. Configure the host to serve `index.html` for the root; routing uses URL fragments.

The social preview image uses a root-relative URL. If a host or sharing crawler requires absolute social-image URLs, set the production origin there once the final domain is known; no domain is assumed in this repository.

`nextSteps.md` and `.impeccable/` remain local planning/review files. Builds and `node_modules/` stay ignored. No deployment is performed by the local build commands.

## Keyboard and touch

`/` or Cmd/Ctrl+K opens the palette; the backtick key toggles the terminal; arrow keys or swipes move between projects and steps (every swipe has a visible button); Esc goes up one level; 1–9 jump to a project. Scene logic lives in `src/navigation/scenes.js` (pure, tested) and `src/components/scenes.js` (DOM).

## Photos, screenshots and clips

Each work card has a media slot (`media` in `src/data/projects.js`). Until a file exists it shows a dashed WIP frame that says what to supply. To fill one, put the file in `public/assets/media/` (for example `music-leds.webp`, `conway.mp4`, plus a `poster` image for clips) and set `src`, `alt`, and optionally `poster`, `width`, `height` and `caption`; then run `npm run content`. Alt text is required: the tests fail while `alt` is still WIP, or when a named file is missing.

## Motion

Scene changes use four short stepped transitions (zoom in, zoom out, slide, dissolve; `src/navigation/transitions.js` picks one, `src/components/transitions.js` plays it). Reduced motion applies every change at once. The Vite dev server also serves `/lab.html`, a throwaway page for trying them on real content; it is not part of the build.

## Windows

Every window has three buttons: red closes it (one level up, like Esc), yellow minimizes it to its desktop icon (opening the icon restores the same place), green zooms it to full screen. Pure state lives in `src/navigation/windows.js`; the buttons are `src/components/lights.js`.

## 3D figures

Figures are Three.js drawings in the site's blueprint style: the NFC card (in the Contact window), a Fourier winding machine (music_LED), a timing staircase (timing-attack-lab), a Game of Life torus (Conway) and a decision-boundary schematic (cya). `src/data/figures.js` says which project gets which figure, what its controls are, and what is real or illustrative in its caption. One shared canvas (`src/figures/stage.js`) draws each figure into its host element, and the whole 3D chunk loads lazily, only when a figure is on screen and the device qualifies (`src/figures/mode.js`). Reduced motion draws one still frame; no WebGL, Save-Data or a weak device keep the pixel-art drawing. `npm run verify` enforces gzip budgets: 40 kB for the main bundle and 160 kB per lazy chunk.
