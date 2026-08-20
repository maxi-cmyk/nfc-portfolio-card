# NFC Portfolio Card — Remaining Next Steps & Roadmap

This document tracks completed implementations and details what remains to be done for your digital NFC portfolio.

---

## 🚀 Completed in Previous Sprint

- [x] **Terminal Command History (`↑` / `↓` Arrow Keys)**:
  - Added [src/terminal/history.js](file:///Users/maxi/Desktop/my_nonsense/nfc-portfolio-card/src/terminal/history.js) with history buffer, draft preservation, and cursor positioning.
- [x] **`skills` Stack Matrix Command**:
  - Categorized breakdown across Hardware/Embedded, Systems/Security, Backend/AI, Frontend, and Math.
- [x] **`sudo rm -rf` Easter Egg**:
  - Playful hacker sequence with 0.5s per line stagger, CRT screen glitch animation, and instant snapshot auto-recovery.
- [x] **`thebananachip` Secret Easter Egg Upgraded**:
  - Staggered 0.5s 5-stage authentication sequence with mascot bounce animation (`.is-celebrating`).
- [x] **Terminal `clear` Viewport Anchor Fix**:
  - Clears terminal output while keeping viewport centered on `#terminal` without jumping to the bottom of the page.
- [x] **Resume Command Infrastructure (WIP)**:
  - Added `resume`, `cv`, `cat resume` commands and quick link button.
- [x] **Project Insights Modal Architecture (WIP)**:
  - Implemented accessible `<dialog>` in [src/components/subpages/project-modal.js](file:///Users/maxi/Desktop/my_nonsense/nfc-portfolio-card/src/components/subpages/project-modal.js), router hashtag support (`#project/<slug>`), and `insights [wip] ↗` buttons across terminal & focus pages.
- [x] **Tab Autocompletion in Terminal**:
  - Implemented shell-like `Tab` key interception in [src/terminal/autocomplete.js](file:///Users/maxi/Desktop/my_nonsense/nfc-portfolio-card/src/terminal/autocomplete.js) with prefix matching, longest common prefix calculation, single-match autocompletion, category/subpath shortcuts, and multi-match interactive suggestion badges in [src/components/terminal/runner.js](file:///Users/maxi/Desktop/my_nonsense/nfc-portfolio-card/src/components/terminal/runner.js).

---

## 📌 Remaining Tasks & Feature Backlog

---

### 1. 📄 Attach Official Resume PDF & Preview [Completed]

- **Objective**: Replace the current `[WIP]` resume placeholder with your actual PDF resume.
- **Tasks**:
  - [x] Place your finalized resume PDF in `public/assets/Max_Leong_Resume.pdf`.
  - [x] Update [src/terminal/commands/resume.js](file:///Users/maxi/Desktop/my_nonsense/nfc-portfolio-card/src/terminal/commands/resume.js) to provide a direct download link (`/assets/Max_Leong_Resume.pdf`) and "Open in New Tab" link.
  - [x] Add quick action "Download Resume PDF" inside the terminal output and contact footer.

---

### 2. 🔬 Populate Deep-Dive Project Case Studies & Media

- **Objective**: Fill in detailed technical deep-dives for each marquee project in [src/data/projects.js](file:///Users/maxi/Desktop/my_nonsense/nfc-portfolio-card/src/data/projects.js).
- **Projects to Flesh Out**:
  1. **Sentinel (Hardware · Security)**:
     - Detailed 2-node ESP32 + ESP32-CAM architecture diagram.
     - PIR hardware interrupt circuit breakdown and power draw analysis.
     - MQTT event payload schema and RTSP/MJPEG stream flow.
  2. **it'sPEAK (AI Video Pipeline · 2nd Place)**:
     - FastAPI asynchronous video frame chunking pipeline.
     - OpenCV facial gaze tracking + audio prosody decomposition flow.
     - LLM feedback telemetry and scoring rubric.
  3. **Echo (Accessibility · Best Freshmen Award)**:
     - Familiarity-first cognitive association graph schema in PostgreSQL.
     - Accessibility engineering (high-contrast, voice support, memory cues).
  4. **ESP32 Asteroids (Embedded · Hardware)**:
     - Fixed-point 2D vector mathematics on microcontrollers.
     - Hardware PWM audio square-wave synthesizer routines.
     - SSD1306 I2C OLED display frame buffering.
  5. **Conway's Game of Life (Math · Hardware)**:
     - 32×8 LED matrix SPI (MAX7219) multiplexing.
     - Bitwise toroidal grid calculation engine.
     - Real-time Server-Sent Events (SSE) web dashboard sync.

---

### 3. ⌨️ Tab Autocompletion in Terminal [Completed]

- **Objective**: Shell-like UX where pressing `Tab` auto-completes available commands.
- **Tasks**:
  - [x] Add `Tab` keydown interceptor in `#command-input`.
  - [x] Match partial inputs against commands: `ab` → `about`, `sk` → `skills`, `re` → `resume`, `cd focus/h` → `cd focus/hackathons`, `pro` → `projects`, `theb` → `thebananachip`.
  - [x] If multiple matches, flash matching suggestions in terminal.

---

### 4. ⚡ Offline PWA & Service Worker for NFC Tap Reliability

- **Objective**: Ensure the portfolio opens instantaneously even with flaky convention/hackathon Wi-Fi.
- **Tasks**:
  - Create `manifest.webmanifest` and register a lightweight Service Worker caching fonts, icons, and Vite bundle.

---
