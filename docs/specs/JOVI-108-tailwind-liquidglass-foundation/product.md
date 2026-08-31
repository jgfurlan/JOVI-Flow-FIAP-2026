# Product Spec: Tailwind v4 (hybrid) + Liquid Glass foundation — zero external requests

**Task:** `JOVI-108` — https://app.clickup.com/t/JOVI-108
**Figma/Design:** `docs/specs/2026-05-21-jovi-ui-refinement-design.md`, `docs/guidelines/ui-context.md`
**Date:** 2026-08-31
**Status:** Implemented — verification in progress
**Branch:** `JOVI-108-tailwind-liquidglass-foundation`

## Summary

The graded Sprint 2 deliverable is a ZIP opened by an evaluator, possibly offline. Today
`src/poc/index.html` loads Bootstrap CSS, Bootstrap JS and the Poppins font from CDNs — offline
that renders unstyled with a fallback font. This task removes every external dependency **and**
settles the CSS-framework question: adopt **Tailwind v4** in a **hybrid** model (utilities in
markup + `@theme` tokens + a thin `@layer components` block for the signature "Liquid Glass"
effects), compiled once by the standalone/`npm` CLI to a static `<15 KB gzip` stylesheet that
ships in the ZIP. Poppins is self-hosted.

## Problem

- `src/poc/index.html:8` Bootstrap CSS (CDN), `:9` Poppins (Google Fonts CDN), `:146` Bootstrap
  JS bundle (CDN, no component actually used).
- Sprint 2 brief (`docs/jovi-flow-sprint2.pdf`): one self-contained ZIP; "não serão
  considerados links externos"; network not guaranteed at grading.
- Offline → broken layout + fallback font → risk to the 15-pt *Projeto Web* score, and the
  rubric scores "Tailwind CSS **ou** Bootstrap" as a competency line.
- `docs/guidelines/code-standards.md` "Offline Test" is currently unmet.

## Goals & Non-Goals

- **Goals:**
  - `src/poc/` renders and functions with the network fully disabled; zero non-`file:`/`localhost` requests.
  - CSS framework = **Tailwind v4**, used for real (utilities in markup + `@theme` tokens),
    earning the rubric line; shipped as a static compiled file.
  - Poppins self-hosted (SIL OFL, licence shipped).
  - "Liquid Glass" visual foundation in place and **engineered around the known caveats**
    (blur cost, contrast over a live feed, reduced-transparency/motion).
  - Total transferred **< 150 KB**; visual parity with the pre-change build.
- **Non-Goals:**
  - Service worker / PWA manifest.
  - A full utility rewrite of every component (single-use component classes stay in
    `@layer components`; markup utility adoption continues in `JOVI-113`).
  - `src/prototype/` removal (`JOVI-110`); viewport `user-scalable=no` (`JOVI-114`).
  - Camera behaviour changes (`JOVI-109`, `JOVI-111`).

## User Experience & Invariants

1. **Happy path:** Evaluator opens `index.html` (served or `file://`) with no internet. All
   five screens render with Poppins typography and the intended Liquid-Glass layout —
   indistinguishable from online.
2. **Edge cases:**
   - Network disabled → 0 failed requests, 0 external origins, no layout shift, no console errors.
   - Font still loading → `font-display: swap` shows the fallback stack then swaps.
   - `prefers-reduced-transparency: reduce` → glass surfaces become opaque, no blur.
   - `prefers-reduced-motion: reduce` → spinner / aura / spark / skeleton / toast animations
     and screen transitions disabled.
   - Floating controls remain legible over both a pure-white and a pure-black viewfinder frame.
3. **Constraints:**
   - Only HTML / CSS / JS + Tailwind ships. The Tailwind CLI is a dev-time compiler; the
     shipped artifact is plain CSS.
   - `src/poc/css/jovi.css` is **generated** from `src/poc/css/input.css` (`npm run css`).
   - CI `deploy` publishes `src/poc` — must not regress.

## Success Criteria

- `grep -rEn "https?://" src/poc` → no `href`/`src`/`@import` to external origins (only the
  `wa.me` share-intent string in `app.js` and URLs inside the font licence text).
- DevTools Network **Offline** hard reload → 0 failed requests, 0 non-local origins. (Verified
  via headless Chrome: `failed=0`, `external=0`.)
- Poppins actually applied (`document.fonts.check('16px Poppins') === true`; `.brand`
  `font-family` starts `Poppins`).
- `@theme` tokens resolve (`.btn-primary` background computes to `rgb(10, 61, 255)`).
- Tailwind utilities emitted and active (`.flex` → `display: flex`).
- Compiled CSS **≤ 25 KB raw / ≤ 8 KB gzip** (actual: 22 KB / ~5.4 KB).
- `npm run css` reproduces `src/poc/css/jovi.css` with no diff.
- Lint green: htmlhint, `eslint@8`, `stylelint` on `input.css`.
- Visual parity screenshots at 360 / 390 / 428 px.
- CI `lint` + `deploy` green.
- ZIP of `src/poc/` extracted to a clean dir opens offline and runs capture → gallery → share.
