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
  - Added the accessible project `<dialog>`, `#project/<slug>` routing, and project case-study entry points; Task 2 now contains the completed source-reviewed content.
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

### 2. ✅ Complete Deep-Dive Project Case Studies & Media — Completed

- **Objective**: Replace the project-insights placeholders with concise technical case studies sourced from the real implementations.
- **Implementation**:
  - [x] Consolidate all project records in `src/data/projects.js` so focus pages, terminal output, and modals share one factual source.
  - [x] Add responsive, code-native system-flow diagrams and structured implementation notes to every case study.
  - [x] Review Sentinel against its two-node Blynk and MJPEG firmware; remove the unsupported MQTT, interrupt, and measured-power claims.
  - [x] Review it'sPEAK against its FastAPI, Celery, Redis, MediaPipe, audio-scoring, and fallback-coaching implementation.
  - [x] Review Echo against its Next.js PWA, Supabase/PostgreSQL, local LLaVA, ElevenLabs, recall/cooldown, and adaptive-accessibility implementation.
  - [x] Review ESP32 Asteroids against its 50 FPS floating-point loop, SSD1306 buffer, LEDC audio sequencer, and Preferences-backed scores; remove the unsupported fixed-point claim.
  - [x] Review Conway's Game of Life against its packed toroidal grid, MAX7219 output, SSE dashboard, persisted session history, and CSV/JSON exports.
- **Acceptance criteria**:
  - [x] Remove each `[wip]` label only after its case study has verified copy, a system-flow visual, working source links, and responsive modal QA.
  - [x] Keep verification notes inside each case study so implementation evidence and unclaimed outcomes remain explicit.

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

### 4. Improve Case Study Layout & Content (tbc)

- **Objective**: Make the focus pages and project case studies less cluttered, visually clearer, and less like internal QA notes.

#### 4.1 Hackathons languages/tools needs its own style
- In `src/data/focus-tools.js`, `hackathons` is a generic full-stack web list (`JavaScript` / `React, Node.js, PostgreSQL, GitHub`), while Cybersecurity/Engineering/AI & Math read as hardware-flavored capability stacks. This mismatch exists because it'sPEAK and Echo are full web apps, not hardware builds — the category is really "rapid full-stack build under time pressure," not one tech stack.
- [ ] Decide the direction: (a) keep the tools/languages list format but broaden it to reflect what's actually in the project data (FastAPI/Celery/Redis, Next.js/Supabase, MediaPipe, LLaVA, ElevenLabs are currently under-represented), or (b) replace the grid format for this one category with a narrative treatment (event names, time constraint, placements) since a plain tool list undersells hackathon work.
- [ ] Whichever direction is chosen, keep it driven from `focus-tools.js` / `createFocusTooling` so the terminal `skills` command output and the visual page stay in sync.

#### 4.2 Other pages' languages are incomplete
- `cybersecurity.languages` is currently empty, and no group lists Python/C++ where it's actually used across their linked projects (e.g. Sentinel is C++ firmware, but Cybersecurity shows no language).
- [ ] Audit each focus category in `focus-tools.js` against the real implementations in `src/data/projects.js` and fill in missing languages.
- [ ] Preserve the Task 1 rule that each language/tool is unique to one classification — no duplicates across categories.

#### 4.3 Remove "source reviewed" framing from the case study
- The "Verification notes" block (`insights.evidence` in `projects.js`, rendered in `project-modal.js`) reads like an internal audit trail ("The checked-in firmware defines TARGET_FPS = 50...") rather than visitor-facing content.
- [ ] Remove the evidence list and its rendering section, or fold anything visitor-relevant (e.g. a linked competition placement) into the summary/description copy instead.
- [ ] Reconsider the `status-badge` ("SOURCE REVIEW PENDING" / reviewed state) next to the case-study title — same internal-process framing — and remove or repurpose it alongside the evidence list.

#### 4.4 Button layout for projects needs visual improvement
- `.project-insights-btn` is currently styled identically to `.terminal-link` (no border, no background, underline on hover), so the "Case Study" modal trigger is visually indistinguishable from real outbound GitHub/Devpost links even though it behaves differently (opens a modal vs. navigates away).
- [ ] Give the case-study trigger a distinct affordance (background chip, bracket/box treatment, icon) separate from the plain `label → url` treatment used for real outbound links.
- [ ] Consider separating the two groups visually within `.project-card-links` (e.g. real links together, case-study action on its own row or right-aligned) rather than one undifferentiated row.

#### 4.5 Independently designed case studies
- Every case study currently uses the same fixed template (summary → flow diagram → generic `sections` grid → evidence list), which flattens projects with an actual algorithm worth explaining — e.g. Conway's Game of Life's toroidal wraparound neighbor counting and bit-packed row representation are currently only described in audit-note form via `evidence`, not as an explanation.
- [ ] Add a per-project "how it works" narrative slot (distinct from the generic `sections` grid) for algorithm/design explanation. Start with Conway's Game of Life as the pilot.
- [ ] Extend the `insights` schema in `projects.js` to support this optional explanatory content, and update the modal template to render variable/optional sections per project rather than one rigid layout for all five.

- **Acceptance criteria**:
  - [ ] Every focus category shows a complete, non-duplicated language/tool list backed by its linked projects.
  - [ ] The hackathons focus area's presentation is deliberately chosen (broadened list or narrative) rather than left as a mismatched generic stack.
  - [ ] Case study modals no longer surface internal verification/audit language to visitors.
  - [ ] The case-study button is visually distinguishable from outbound project links at a glance.
  - [ ] At least one project (Conway's Game of Life) has a bespoke explanatory section beyond the shared template. 