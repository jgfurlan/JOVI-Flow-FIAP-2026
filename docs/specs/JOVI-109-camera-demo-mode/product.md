# Product Spec: Camera Demo Mode (Cameraless Fallback)

**Task:** `JOVI-109` — https://app.clickup.com/t/JOVI-109
**Figma/Design:** `docs/specs/2026-05-21-jovi-ui-refinement-design.md`
**Date:** 2026-08-30
**Status:** Draft — awaiting approval (jgfurlan)
**Depends on:** `JOVI-108` (for true offline correctness)

## Summary

The Sprint 2 ZIP is opened by an evaluator who will most likely run it from `file://` or on a desktop with no rear camera, or with camera permission denied. Today the app then stalls on the splash screen and the capture / gallery / detail / share flow is unreachable. This feature adds a synthetic "demo" viewfinder so every screen and the whole capture→rank→view→share journey works with no camera, while the real camera is still used automatically whenever it is available. The demo state is clearly labelled so it reads as intentional.

## Problem

`src/poc/js/app.js`:

- `init()` only auto-advances past splash when `window.location.protocol !== 'file:'` (`app.js:43-48`). Under `file://` the app never leaves the splash.
- `startCamera()` on `getUserMedia` rejection shows one toast (`app.js:179-181`) and returns; the viewfinder stays black.
- With no working stream there is no photo, so Gallery / Detail / Share are never exercised. `capturePhoto()` on a dead stream draws a blank 640×480 canvas (`app.js:273-274`).

Who feels the pain: the evaluator grading the 15-point *funcionalidade* block — the brief asks the solution to "simule de forma inteligente a experiência de captura, visualização e compartilhamento." A dead app scores near zero there.

## Goals & Non-Goals

- **Goals:**
  - Every screen reachable and functional with no camera.
  - Synthetic capture produces real gallery entries (with sharpness scores) so ranking, bento featured card, detail and share all work.
  - Real camera used automatically when available; demo used only as fallback or manual choice.
  - Demo state visibly labelled ("MODO DEMO").
  - Explicit, distinct handling for each camera failure reason.
- **Non-Goals:**
  - Real video recording / `MediaRecorder`.
  - Multi-camera or simultaneous front/back streams (brief excludes).
  - Persisting the chosen mode across reloads.
  - Bundling a video asset (optional realism upgrade only; canvas is the committed path).

## User Experience & Invariants

1. **Happy Path (camera available):** Permission granted → `LIVE` mode, real stream in the viewfinder, no demo badge, synthetic feed inactive. Capture, gallery, detail, share all work.
2. **Happy Path (no camera):** Splash auto-advances to the camera screen. Viewfinder shows an animated synthetic feed; a `MODO DEMO` pill is visible; a toast states the reason. Shutter tap → "Foto salva!" → gallery shows the new photo with a sharpness badge; after ≥3 captures the highest-sharpness shot is the bento featured card; the AI stats card renders. Detail shows image + date; Share "Copiar" path resolves (clipboard or graceful error toast). The Aura temperature gesture visibly tints the demo feed.
3. **Edge Cases:**
   - `getUserMedia` unsupported / `navigator.mediaDevices` absent → auto demo, info toast.
   - `NotAllowedError` / `SecurityError` (denied) → demo + "Tentar câmera real" button.
   - `NotFoundError` / `OverconstrainedError` (no device) → demo, toast "nenhuma câmera encontrada".
   - `NotReadableError` / `AbortError` (in use) → demo, toast "câmera em uso por outro app".
   - `file://` origin → try real camera once; on failure demo + hint "abra via servidor http para câmera real".
   - `prefers-reduced-motion: reduce` → demo feed is a single static frame, no animation loop.
   - Page hidden (`visibilitychange`) → demo animation loop paused, resumed on return.
   - `switchCamera` / `toggleFlash` while in demo → toast "indisponível no modo demo", no exception.
4. **Constraints:**
   - Only HTML / CSS / JS (no framework). Native ES module already in use.
   - Downstream pipeline unchanged: `applyAuraLightEffect`, `calculateSharpness`, `savePhoto` still run on the demo frame.
   - `code-standards.md`: `{module}_{action}` naming, explicit error paths, no magic strings, `aria-label` on every button, 4pt grid tokens.

## Success Criteria

- **Scenario A — `file://`, no server:** full splash→capture→gallery→detail→share flow works; demo feed animates; `MODO DEMO` badge shown; ≥3 captures yield a spread of sharpness scores and a correct featured card; zero console exceptions.
- **Scenario B — desktop Chrome, camera blocked:** same as A; `NotAllowedError` path shows the denied reason + "Tentar câmera real" button.
- **Scenario C — device with a working camera, permission granted:** `LIVE` mode; real stream; badge hidden; no rAF demo loop running; capture/gallery/detail/share work.
- **Scenario D — `prefers-reduced-motion: reduce`:** demo feed static, no loop scheduled.
- **Regression:** CI `lint` green; combined with `JOVI-108` the `code-standards.md` "Offline Test" passes.
