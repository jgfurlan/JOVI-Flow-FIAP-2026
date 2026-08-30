# Product Spec: Local Asset Vendoring (Zero External Requests)

**Task:** `JOVI-108` — https://app.clickup.com/t/JOVI-108
**Figma/Design:** n/a
**Date:** 2026-08-30
**Status:** Draft — awaiting approval (jgfurlan)

## Summary

The graded Sprint 2 deliverable is a ZIP folder opened directly by an evaluator, possibly with no network. Today `src/poc/index.html` pulls its CSS framework and web font from public CDNs. Offline, the app renders unstyled with a fallback system font and no framework layout. This feature removes every external dependency so the delivered folder renders and behaves identically with the network disabled.

## Problem

`src/poc/index.html` loads three remote assets:

| Asset | Source | Location |
|---|---|---|
| Bootstrap 5.3.3 CSS | `cdn.jsdelivr.net` | `index.html:8` |
| Poppins font | `fonts.googleapis.com` / `fonts.gstatic.com` | `index.html:9` |
| Bootstrap 5.3.3 JS bundle | `cdn.jsdelivr.net` | `index.html:146` |

Sprint 2 brief (`docs/jovi-flow-sprint2.pdf`):

- Delivery is one ZIP on the platform; "todo o conteúdo do trabalho deve estar dentro da pasta zipada."
- "Não serão considerados links externos (Figma, Drive etc.)."
- Grading opens the folder directly, network not guaranteed.

Who feels the pain: the evaluator grading the 15-point *Projeto Web* block sees a broken layout. Also violates `docs/guidelines/code-standards.md` → "Offline Test: Verify functionality persists when the network is disabled."

## Goals & Non-Goals

- **Goals:**
  - `src/poc/` renders and functions with the network fully disabled.
  - Zero requests to any non-`file:` (or non-`localhost`) origin.
  - Visual parity with the current build at 360 / 390 / 428 px.
  - ZIP remains self-documenting (font license included).
- **Non-Goals:**
  - Service worker / PWA manifest.
  - CSS/JS minification or a build pipeline (stack lock: no bundler).
  - Aggressive font subsetting beyond picking the latin `woff2`.
  - Removing `src/prototype/` (separate task).

## User Experience & Invariants

1. **Happy Path:** Evaluator extracts the ZIP, opens `index.html` (via `file://` or a static server) with no internet. Splash, camera controls, gallery, detail and share screens all render with Poppins typography and the intended layout — indistinguishable from the online build.
2. **Edge Cases:**
   - Network disabled → no failed requests in DevTools, no console errors, no layout shift from a missing framework.
   - `file://` origin with relative paths → all `css/`, `js/`, `assets/` resolve.
   - Font still loading → `font-display: swap` shows the fallback stack (`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`), then swaps.
3. **Constraints:**
   - Only HTML, CSS, JS, and (optionally) Bootstrap or Tailwind may ship — brief rule.
   - The design system in `src/poc/css/jovi.css` stays the source of visual truth.
   - CI `deploy` job publishes `src/poc` — layout must not regress there either.

## Success Criteria

- `grep -rEn "https?://|//cdn|googleapis|jsdelivr" src/poc` shows only comments/strings — no `href`/`src`.
- DevTools → Network, throttling **Offline**, hard reload: 0 failed requests; 0 requests to a non-`file:`/`localhost` origin.
- App opened as `file://…/src/poc/index.html` renders correct typography and layout on all five screens.
- Before/after screenshots at 360 / 390 / 428 px match.
- Zero JavaScript console exceptions.
- CI `lint` green; `deploy` still publishes `src/poc` unchanged.
- A clean-directory extraction of the `src/poc/` ZIP works with no network.
