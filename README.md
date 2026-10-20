# Max Leong — NFC portfolio

A Vite site with a retro desktop theme, an optional terminal, and one shared project collection. Category filters match any selected discipline; each project has one case-study URL.

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

- `src/data/projects.js` owns project descriptions, category membership, featured previews, and case-study blocks.
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

- `#work`: all projects.
- `#work?categories=engineering,ai-math`: any matching project, once, in the shared order.
- `#project/music-leds`: a permanent case-study link.
- Existing `#focus` and `#focus/<category>` links map to the shared work index.
- Unknown fragments show a recovery message with a link to all work.

Closing a project opened from the site returns through browser history and restores the list position and initiating control. A direct or refreshed project link returns to the saved browsing context when available, otherwise all work.

## Deploy

Publish `dist/` using a static host. The build command is `npm ci && npm run verify`; the output directory is `dist`. Public asset paths assume the site is served at the domain root. No backend, environment variables, or credentials are required. Configure the host to serve `index.html` for the root; routing uses URL fragments.

The social preview image uses a root-relative URL. If a host or sharing crawler requires absolute social-image URLs, set the production origin there once the final domain is known; no domain is assumed in this repository.

`nextSteps.md` and `.impeccable/` remain local planning/review files. Builds and `node_modules/` stay ignored. No deployment is performed by the local build commands.
