# Lightweight Spec: Cleanup Prototype and ZIP Layout

**Task:** `JOVI-110` — Cleanup legacy `src/prototype/` and establish ZIP packaging layout
**Date:** 2026-09-07
**Status:** In Progress
**Author:** Pair Programmer

---

## 1. Problem

1. **Legacy Debt:** `src/prototype/` is an old artifact from Sprint 1. It contains obsolete Bootstrap code, unused assets, and external font dependencies that violate Sprint 2 offline requirements.
2. **CI Pointing to Deleted Prototype:** `.github/workflows/ci.yml` explicitly tests `src/prototype/index.html` with `htmlhint`. Removing `src/prototype/` without updating `ci.yml` would break CI.
3. **Packaging Ambiguity:** Sprint 2 requires "uma pasta zipada com os arquivos" containing ONLY HTML, CSS, JS, and Tailwind/Bootstrap, runnable directly offline via `file://`.
   - If zipped from repository root without a deterministic script, unnecessary files (`node_modules`, `.git`, dev configs, markdown docs) could inflate the ZIP, or `index.html` would be buried under `src/poc/`.
   - The evaluator needs to unpack the ZIP and find `index.html` immediately at the root of the deliverable folder.

---

## 2. Change

1. **Remove `src/prototype/`:** Delete the entire directory `src/prototype/`.
2. **Update `.github/workflows/ci.yml`:**
   - Update `htmlhint` step to only check `src/poc/index.html`.
3. **Update Comments / References:**
   - Update `src/poc/css/input.css` comment removing reference to `src/prototype/`.
4. **Deterministic Delivery Packaging Script:**
   - Add a packaging script `scripts/package-zip.mjs` that:
     - Automatically runs `npm run css` to ensure CSS is compiled and up to date.
     - Creates `dist/jovi-flow-sprint2.zip`.
     - Places the contents of `src/poc/` at the root of the ZIP archive (`index.html`, `css/jovi.css`, `js/app.js`, `assets/**`).
     - Ensures dev files (like `input.css`) are excluded from the distribution ZIP.
   - Add `"zip": "node scripts/package-zip.mjs"` and `"dist": "npm run zip"` to `package.json`.
5. **Update Documentation:**
   - Update `docs/guidelines/progress-tracker.md`.

---

## 3. Verification Array

- [x] `src/prototype/` deleted from workspace and git tracking.
- [x] `ci.yml` updated and linters (`htmlhint`, `stylelint`, `eslint`) pass without `src/prototype/`.
- [x] Running `npm run zip` creates `dist/jovi-flow-sprint2.zip`.
- [x] Inspecting ZIP entries verifies `index.html` is at root, along with `css/jovi.css`, `js/app.js`, `assets/fonts/`, `assets/icons/`.
- [x] Extracting ZIP to a temporary directory and opening via `file://` confirms full 5-screen flow functions without missing assets.
