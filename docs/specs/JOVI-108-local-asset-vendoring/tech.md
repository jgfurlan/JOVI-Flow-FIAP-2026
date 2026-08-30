# Technical Spec: Local Asset Vendoring (Zero External Requests)

**See `product.md` for the product spec.**
**Proposed branch:** `JOVI-108-local-asset-vendoring`

## 1. Context

Target: `src/poc/` (the graded deliverable). `src/prototype/` is out of scope.

Current external references:

- `src/poc/index.html:8` — `<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">`
- `src/poc/index.html:9` — `<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">`
- `src/poc/index.html:146` — `<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>`

Measured Bootstrap usage in `src/poc/index.html`: `d-none` (`:33`), `d-flex align-items-center gap-2` (`:43`), `btn btn-primary` (`:81`, `:85`, `:109`), `btn btn-outline` (`:106`). No Bootstrap JS component markup (no modal/collapse/dropdown/tooltip) → the bundle at `:146` is dead code. `src/poc/css/jovi.css` (753 lines) already defines `.btn-primary`, the design tokens (`--jovi-blue`, `--jovi-yellow`, `--grid-unit`, `--touch-target-min`, `--border-radius`) and all component styling.

Poppins is referenced by `font-family` in `jovi.css` and weights 400/500/600/700 in the Google Fonts URL.

## 2. Proposed Changes

### Architecture / Data Flow
No runtime logic changes. Static asset resolution moves from CDN origins to relative paths inside `src/poc/`.

### Modules Touched
- `src/poc/index.html` — remove 3 external tags; swap ~7 utility classes.
- `src/poc/css/jovi.css` — add `@font-face` blocks; add namespaced utility classes; ensure fallback font stack everywhere `Poppins` is named.
- `src/poc/assets/` (new) — `fonts/` (+ license), optionally `vendor/`.
- `docs/guidelines/architecture.md`, `docs/guidelines/progress-tracker.md` — record ZIP / no-CDN / 21-09 constraint + Bootstrap-removal decision.

### New Types / APIs / State
None. New CSS classes only:

| Bootstrap class removed | Replacement in `jovi.css` |
|---|---|
| `d-none` | `.jovi-hidden { display: none !important; }` |
| `d-flex` | `.jovi-row { display: flex; }` |
| `align-items-center` | `.jovi-row--center { align-items: center; }` |
| `gap-2` | `gap: calc(var(--grid-unit) * 2);` (8px) |
| `btn btn-primary` | existing `.btn-primary` |
| `btn btn-outline` | new `.btn-outline` token variant |

### Decisions & Tradeoffs

- **Bootstrap → remove (chosen)** rather than vendor. Usage is trivial, JS bundle unused, `jovi.css` already owns the system. Removes ~30 KB CSS + ~80 KB JS from the ZIP and one whole class of offline failure. Tradeoff: small risk of a layout regression from a utility not caught by grep → mitigated by screenshot diff at 3 widths.
  - *Fallback path if a regression blocks the deadline:* download `bootstrap.min.css` → `src/poc/assets/vendor/bootstrap.min.css`, keep the `<link>` pointing local, still delete the JS bundle.
- **Poppins → self-host.** SIL Open Font License permits redistribution. Ship `LICENSE-Poppins.txt` beside the files so the ZIP is self-documenting. Latin `woff2` only (target is a pt-BR mobile UI).
- **No minification / build step** — brief forbids tooling outside HTML/CSS/JS/Bootstrap/Tailwind.

### Target file layout

```
src/poc/
  index.html
  css/jovi.css
  js/app.js
  assets/
    fonts/
      poppins-400.woff2
      poppins-500.woff2
      poppins-600.woff2
      poppins-700.woff2
      LICENSE-Poppins.txt
    vendor/                 # only if the Bootstrap-removal fallback is taken
      bootstrap.min.css
```

All `href`/`src` relative, no leading `/`.

## 3. Implementation Checklist

- [ ] `grep -rEn "https?://" src/poc` — enumerate every external reference.
- [ ] Download Poppins `woff2` (400/500/600/700, latin) into `src/poc/assets/fonts/`; add `LICENSE-Poppins.txt` (SIL OFL).
- [ ] Add `@font-face` blocks (one per weight, `font-display: swap`) at the top of `jovi.css`.
- [ ] Ensure every `font-family` in `jovi.css` uses `"Poppins", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- [ ] Remove the Google Fonts `<link>` (`index.html:9`).
- [ ] Add `.jovi-hidden`, `.jovi-row`, `.jovi-row--center`, `.btn-outline` to `jovi.css` (under the existing token system, 4pt grid).
- [ ] Swap Bootstrap utility classes in `index.html` for the new ones.
- [ ] Delete Bootstrap CSS `<link>` (`index.html:8`) and JS `<script>` (`index.html:146`).
- [ ] Bump cache-buster: `jovi.css?v=8`, `app.js?v=8`.
- [ ] Run linters: `htmlhint src/poc/index.html`; `npx stylelint "src/poc/css/jovi.css"`; `npx eslint "src/poc/js/app.js"`.
- [ ] Update `architecture.md` + `progress-tracker.md`.

## 4. Testing and Validation

### Manual Verification (per `code-standards.md` — 360-428 px)
- **Offline render:** DevTools Network = Offline, hard reload `src/poc/index.html`. Assert 0 failed requests, 0 non-`file:`/`localhost` origins.
- **`file://` open:** double-click the extracted `index.html`; walk all five screens; confirm Poppins is applied (compare glyph shapes) and layout matches.
- **Screenshot diff:** capture splash / camera / gallery / detail / share at 360, 390, 428 px before and after; visually equal.
- **Console check:** zero runtime exceptions on the full flow.
- **ZIP smoke test:** zip `src/poc/`, extract to an empty dir on the delivery machine OS, open offline, run capture → gallery → share.

### Automated
- CI `lint` job (htmlhint / stylelint / eslint) green.
- CI `deploy` job still uploads `src/poc` and the Pages build renders.

### Invariant → check mapping
| Product invariant | Verification |
|---|---|
| Offline parity | DevTools Offline reload, 0 external requests |
| `file://` relative paths resolve | Extracted-ZIP open test |
| Font swap fallback | Throttle font load, observe fallback→Poppins |
| No layout regression | 3-width screenshot diff |
| CI unaffected | `lint` + `deploy` jobs green |
