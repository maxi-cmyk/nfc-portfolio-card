# NFC Portfolio Card — Remaining Next Steps & Roadmap

This document tracks completed work and the remaining implementation priorities for the digital NFC portfolio.

---

## ✅ Completed

- [x] **Terminal command history (`↑` / `↓`)**
  - Added history navigation, draft preservation, and cursor positioning in [src/terminal/history.js](file:///Users/maxi/Desktop/my_nonsense/nfc-portfolio-card/src/terminal/history.js).
- [x] **Terminal `skills` stack matrix**
  - Added categorized Hardware/Embedded, Systems/Security, Backend/AI, Frontend, and Mathematics capabilities.
- [x] **Terminal easter eggs**
  - Added the `sudo rm -rf` recovery sequence and upgraded `thebananachip` authentication/mascot animation.
- [x] **Terminal viewport and input improvements**
  - Anchored `clear` to the terminal, added Tab autocompletion and suggestions, and retained command aliases and focus-category shortcuts.
- [x] **Official resume PDF**
  - Added `public/assets/Max_Leong_Resume.pdf`, terminal download/open actions, and a footer download link.
- [x] **Certificates section**
  - Added a responsive, data-driven certificate showcase below Focus/Projects with the Google AI Professional Certificate, preview image, open action, and PDF download.
  - Certificate entries are maintained in [src/data/certificates.js](file:///Users/maxi/Desktop/my_nonsense/nfc-portfolio-card/src/data/certificates.js); certificate files and previews live in `public/assets/`.
- [x] **Project insights foundation**
  - Added the accessible project `<dialog>`, `#project/<slug>` routing, and `insights [wip] ↗` entry points. Detailed case-study content remains in Task 2.
- [x] **Faster startup sequence**
  - Reduced typing, line, completion, exit, and fade timings so the opening boot animation runs approximately twice as fast.

---

## 📌 Remaining Tasks & Feature Backlog

### 1. 🧰 Add a Project-Backed Tech Stack Section

- **Objective**: Give visitors a fast, credible view of the technologies used to build the featured projects without relying on subjective proficiency bars or an unstructured logo wall.
- **Placement**: Add “What I build with” after Focus/Projects and before Certificates.
- **Content rules**:
  - [ ] Display only technologies used in completed or demonstrable projects.
  - [ ] Group the stack into Embedded & Hardware, Systems & Security, Backend & Data, AI & Computer Vision, Frontend, and Delivery.
  - [ ] Give each technology a short project-backed context, such as `FastAPI — video-analysis APIs · it'sPEAK`.
  - [ ] Make the related project name clickable when a project route or external project link is available.
  - [ ] Do not add proficiency percentages, beginner/expert labels, years-of-experience claims, or external logo dependencies.
- **Implementation**:
  - [ ] Audit [src/data/projects.js](file:///Users/maxi/Desktop/my_nonsense/nfc-portfolio-card/src/data/projects.js) and [src/terminal/commands/skills.js](file:///Users/maxi/Desktop/my_nonsense/nfc-portfolio-card/src/terminal/commands/skills.js) so every displayed technology has evidence.
  - [ ] Create `src/data/stack.js` as the single source of truth for categories, technologies, context, and project references.
  - [ ] Create a small stack renderer/component and add the section markup to `index.html`.
  - [ ] Refactor the terminal `skills` command to generate its matrix from `src/data/stack.js`, preventing the terminal and visual section from drifting apart.
  - [ ] Add `STACK` to the desktop navigation order: Home → Terminal → Focus → Stack → Certificates → Contact.
  - [ ] Extend the existing retro desktop styling with category rows on desktop and readable stacked rows on mobile.
- **Acceptance criteria**:
  - [ ] Visitors can understand the primary stack and its project evidence within a few seconds.
  - [ ] Technology names and evidence remain readable without horizontal overflow at mobile, intermediate, and desktop widths.
  - [ ] Keyboard focus is visible and the section uses semantic headings, lists, and links.
  - [ ] Tests cover category order, unique technology entries, required project evidence, terminal output generation, and absence of unsupported proficiency claims.
  - [ ] `npm test`, `npm run build`, Prettier, the Impeccable detector, browser viewport checks, and `git diff --check` pass.

---

### 2. 🔬 Complete Deep-Dive Project Case Studies & Media

- **Objective**: Replace the current project-insights placeholders with concise technical case studies sourced from the real implementations.
- **Projects to complete**:
  1. **Sentinel — Hardware · Security**
     - Two-node ESP32 + ESP32-CAM architecture diagram.
     - PIR interrupt circuit breakdown and measured power analysis.
     - MQTT event payload and RTSP/MJPEG stream flow.
  2. **it'sPEAK — AI Video Pipeline · 2nd Place**
     - FastAPI asynchronous video-processing pipeline.
     - OpenCV facial/gaze analysis and audio prosody flow.
     - LLM feedback telemetry and scoring rubric.
  3. **Echo — Accessibility · Best Freshmen Award**
     - Familiarity-first PostgreSQL association graph.
     - Accessibility engineering: contrast, voice support, and memory cues.
  4. **ESP32 Asteroids — Embedded · Hardware**
     - Fixed-point 2D vector mathematics.
     - Hardware PWM square-wave audio routines.
     - SSD1306 I2C OLED frame buffering.
  5. **Conway's Game of Life — Math · Hardware**
     - 32×8 MAX7219 LED matrix multiplexing.
     - Bitwise toroidal-grid calculation engine.
     - Real-time Server-Sent Events dashboard synchronization.
- **Acceptance criteria**:
  - [ ] Remove each `[wip]` label only after its case study has verified copy, media, links, and responsive/modal QA.
  - [ ] Do not publish fabricated measurements, architecture details, or outcomes; leave missing evidence explicitly pending.

---

### 3. ⚡ Add Offline PWA Support for NFC Tap Reliability

- **Objective**: Make repeat visits load reliably when convention or hackathon Wi-Fi is slow or unavailable.
- **Tasks**:
  - [ ] Create `manifest.webmanifest` with the portfolio name, theme colors, display mode, start URL, and correctly sized icons.
  - [ ] Register a lightweight service worker from the Vite entry point.
  - [ ] Precache the app shell and essential local assets, including the certificate preview, while keeping PDFs available through a deliberate runtime-cache policy.
  - [ ] Version caches and remove obsolete caches during service-worker activation.
  - [ ] Provide an offline fallback that keeps the core portfolio navigable without claiming unavailable external links will work.
- **Acceptance criteria**:
  - [ ] First online visit primes the cache; a repeat visit loads the portfolio shell offline.
  - [ ] New deployments invalidate stale application bundles safely.
  - [ ] Service-worker failures do not block the normal online experience.
  - [ ] Production build, tests, browser offline simulation, manifest validation, and `git diff --check` pass.

---
