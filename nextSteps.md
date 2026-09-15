# NFC Portfolio Card — Next Steps

## Scope

This is the forward plan from the September 10, 2026 UI/UX audit. Preserve the
current System 7 visual language, factual project copy, terminal interaction,
and five project-specific case-study layouts. Do not reopen completed review
corrections unless a regression is found.

## Audit snapshot (September 10; historical)

| Dimension                |            Score | Evidence                                                                                                                                   |
| ------------------------ | ---------------: | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Accessibility            |              2/4 | Terminal keyboard trap and two normal-text contrast failures; semantic structure and native dialog behavior are otherwise sound.           |
| Performance              |              3/4 | Production bundles are small, animations are visibility-aware, and the certificate image is lazy-loaded; its 930 KB preview remains heavy. |
| Theming                  |              3/4 | Core colors use semantic variables, but functional colors and System 7 surface shades are still repeated as literals.                      |
| Responsive design        |              4/4 | Landing page, focus subpage, and all five case-study dialogs have no horizontal overflow at 390 px or 320 px.                              |
| Implementation integrity |              4/4 | The interface is coherent and portfolio-specific; every project has a distinct technical narrative inside the shared dialog shell.         |
| **Total**                | **16/20 — Good** | **Fix the accessibility failures before release, then complete the focused polish items below.**                                           |

Issue count: **0 P0, 2 P1, 4 P2, 0 P3**.

The mechanical design detector returned no findings, but it ran in degraded
regex mode because its HTML parser modules were unavailable. Treat the rendered
and source-level checks below as the audit authority.

## 1. Remove the terminal keyboard trap [P1]

At audit time, `src/main.js` called `preventDefault()` for every `Tab` keypress
in the terminal input, so standard forward and backward tab navigation could
not leave it.

- [x] Always allow `Shift+Tab` to move to the previous control.
- [x] When the terminal input is empty, let plain `Tab` follow the normal page
      focus order instead of opening autocomplete.
- [x] Keep terminal-style autocomplete for non-empty commands without making it
      the only available keyboard behavior.
- [x] Add tests for empty `Tab`, `Shift+Tab`, single-match completion, and
      multi-match suggestions.
- [x] Verify a keyboard-only route from the mascot through the terminal, quick
      commands, focus links, certificate actions, and footer links.

Acceptance: no keyboard focus trap remains; autocomplete still works; focus can
move both forward and backward using standard keys. This addresses WCAG 2.1.2.

## 2. Correct normal-text contrast [P1]

The audit found two System 7 foreground/background pairs below the WCAG AA
4.5:1 requirement:

- Terminal placeholder `#777` on `#e7e6df`: **3.58:1**.
- Terminal error `#d83a3a` on `#f4f3ed`: **4.12:1**.

- [x] Replace both values with darker System 7-compatible colors that reach at
      least 4.5:1 in their actual rendered contexts.
- [x] Promote the corrected placeholder and error colors to named semantic
      variables instead of introducing more local literals.
- [x] Recheck hover, focus, disabled-looking placeholder, and error states in the
      active retro theme.

Acceptance: automated or calculated contrast is at least 4.5:1 for both states,
and the roles remain visually distinct without changing the established palette.

## 3. Increase mobile interaction target areas [P2]

The 390 px render has no overflow, but several controls are visually and
physically shorter than the 44 px mobile target convention: focus-category links
are 26 px high, certificate actions are 17 px, footer links are 16 px, modal
outbound links are 21–42 px, the terminal input is 23 px, and the case-study
button is 40 px.

- [x] Give frequently used links and buttons a minimum 44 px hit area using
      padding or pseudo-element expansion; do not inflate the visible typography.
- [x] Prioritize focus-category links, certificate actions, footer links,
      project outbound links, case-study buttons, and terminal suggestions.
- [x] Keep adequate separation where adjacent inline links share a row.
- [x] Confirm that larger targets do not disrupt the compact System 7 rhythm or
      cause new wrapping/overflow at 320 px and 390 px.

Acceptance: primary touch controls meet a 44 × 44 px target or have an equivalent
spaced hit area; all audited narrow layouts remain overflow-free.

## 4. Reduce certificate preview transfer cost [P2]

The audit found a **930,054-byte PNG** preview. Completed September 15, 2026:
the page now requests a **161,504-byte WebP**, saving **768,550 bytes (82.6%)**.

- [x] Generate a visually faithful WebP or AVIF derivative sized for its maximum
      rendered width while keeping the PDF as the full-resolution source.
- [x] Add an appropriate `srcset`/`sizes` contract if more than one raster size is
      justified; otherwise ship one right-sized derivative.
- [x] Preserve explicit width and height, lazy loading, async decoding, alt text,
      and the existing certificate-window presentation.
- [x] Record the before/after transfer size and visually compare desktop and
      mobile rendering.

Acceptance: the preview is materially smaller with no visible certificate-text
degradation at its rendered size and no layout shift.

Implementation and evidence:

- Retained one 1400 × 1082 derivative for crisp high-density display at a maximum
  layout width of approximately 618 CSS px. Multiple raster sizes are unnecessary
  for this single 162 KB, below-the-fold preview; no `srcset`/`sizes` was added.
- Encoded with `cwebp -q 90 -m 6 -sharp_yuv
public/assets/AI-professional-preview.png -o
public/assets/AI-professional-preview.webp` (one shell command).
- Kept the original PNG for regeneration and the unchanged PDF for full-resolution
  viewing. Only the WebP is requested by the certificate component.
- Local Chrome comparison at 1440, 650, 390, and 320 px with 2× pixel density:
  unchanged image geometry, no horizontal overflow, and no visible certificate-text
  degradation in the desktop/mobile comparison. Explicit dimensions and the
  existing aspect ratio continue to reserve the same space before decoding.
- Browser resource timing confirmed the 161,504-byte WebP response. All 47 tests,
  production build, targeted Prettier checks, and `git diff --check` passed.

## 5. Preserve feedback in reduced-motion mode [P2]

Completed September 15, 2026. Reduced motion disables decorative loops,
scrolling and spatial hover effects while preserving immediate color, border,
outline, and native dialog feedback. Autocomplete suggestions receive a static
outline; success/failure retain their state colors. Boot reveals immediately and
the recurring alias-placeholder timer is stopped.

- [x] Keep decorative loops, CRT effects, smooth scrolling, and boot typing
      disabled for reduced-motion users.
- [x] Restore immediate, non-moving feedback for hover, focus, autocomplete
      success/failure, and modal state changes.
- [x] Prefer color, border, underline, or static icon changes over transforms.
- [x] Add a reduced-motion check that confirms the portfolio reveals immediately
      and interactive state remains perceivable.

Acceptance: no decorative motion remains under `prefers-reduced-motion: reduce`,
while focus and interaction state changes are still obvious.

Verification: local Chrome confirmed immediate reveal, zero active animations,
static matrix content, visible autocomplete feedback, and stationary keyboard
focus. Live preference changes pause/resume motion without reloading the page.

## 6. Document and consolidate the incumbent design system [P2]

The interface is visually coherent, but the project has no `PRODUCT.md` or
`DESIGN.md`, and several System 7 surface, shadow, and accent values bypass the
existing semantic color variables.

- [ ] Document the portfolio audience, goals, evidence boundaries, System 7
      visual principles, typography, spacing, control states, and responsive
      rules.
- [ ] Inventory repeated color literals and promote only shared functional values
      to tokens; leave one-off illustration colors local.
- [ ] Keep the light System 7 theme as the canonical experience. Do not add dark
      mode merely to satisfy a theming checklist.
- [ ] Keep visual and terminal representations on their existing canonical data
      sources.

Acceptance: future work has a concise source of truth, shared functional colors
come from tokens, and the rendered interface is unchanged apart from intentional
accessibility fixes.

## Animation improvements — completed September 15, 2026

- Replaced the decorative Conway cells with a 32 × 8 LED matrix: four 8 × 8
  modules, dark unlit dots, restrained amber pixels, and discrete scrolling
  `HELLO, WORLD!`. It rests on `HELLO` for 10 seconds between passes; reduced
  motion always shows that static frame.
- Restored the original pre-review scattered positions, sizes, rotations, opacity,
  and responsive placement rules at the user's request. The LED matrix occupies
  the former Conway model's footprint. The matrix and Asteroids were then moved
  down to AI & math at the user's request, with positions following that section
  as content reflows. Removed the later local
  anchors, extra whitespace, enlargement, and contrast changes. Original
  background placement can overlap content, as it did before the review. The
  restored layout was checked at 1440, 768, 390, and 320 px; the original
  certificate atmosphere extends past the viewport at 768 px.
- Added shared viewport, hidden-document, and reduced-motion handling for model,
  certificate, mascot, terminal, boot, and placeholder effects. CSS loops pause
  without recreating their animations; the matrix timer stops offscreen.
- Added resting phases to lock, packet, LED, Asteroids, and certificate loops.
  Removed the certificate's perpetual floating motion.
- Verified at 1440, 768, 390, and 320 px: 256 matrix dots, no model/text rectangle
  intersections in the earlier reserved-space layout, no horizontal overflow,
  offscreen CSS/timer pausing, and no
  browser JavaScript exceptions. Observed matrix scrolling and tested live
  reduced-motion changes. Hidden-document handling was checked with a simulated
  visibility event; this is not a physical-device battery/performance benchmark.
- All 49 tests, production build, formatting, and diff checks pass. The design
  detector returned no findings in degraded regex mode; browser checks are the
  visual evidence.

Boot-once-per-session remains an optional suggestion, not an implemented change.

## Final verification gate

After Tasks 1–6:

- [ ] Run `npm test` and keep all existing behavior green.
- [ ] Run `npm run build` and review production asset sizes.
- [ ] Run Prettier and `git diff --check`.
- [ ] Re-run the UI/UX audit with full parser support if available.
- [ ] Test keyboard navigation and reduced motion manually.
- [ ] Render desktop, exact 390 px, and 320 px views for the landing page, every
      focus subpage, and all five case-study dialogs.
- [ ] Confirm no horizontal overflow, clipped focus rings, unreadable states,
      content regressions, or console errors.

Recommended execution order: accessibility hardening, responsive/touch
adaptation, image optimization, reduced-motion polish, design-system
documentation, final polish, then a fresh audit.
