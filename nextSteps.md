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

### 1. ✅ Integrate Tools & Languages Into Focus Areas — Completed

- **Objective**: Keep the portfolio concise by showing the relevant stack where visitors already explore Cybersecurity, Engineering, AI & Math, and Hackathons.
- **Implementation**:
  - [x] Remove the standalone “What I build with” section and `STACK` navigation item.
  - [x] Add concise Languages and Tools lists to the four focus headers and their subpages.
  - [x] Keep every displayed tool or language unique to one classification.
  - [x] Use `src/data/focus-tools.js` as the shared source for the visual lists and terminal `skills` command.
  - [x] Preserve project-backed technologies without proficiency scores or unsupported experience claims.
- **Acceptance criteria**:
  - [x] Each focus area shows its relevant tools and languages without repeating another classification.
  - [x] Lists remain readable without horizontal overflow across mobile and desktop layouts.
  - [x] Tests enforce classification order, global uniqueness, terminal generation, and absence of proficiency claims.

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
