# Technical Spec: Tailwind v4 (hybrid) + Liquid Glass foundation

**See `product.md` for the product spec.**
**Branch:** `JOVI-108-tailwind-liquidglass-foundation`

## 1. Context

- `src/poc/index.html` — external tags at `:8` (Bootstrap CSS), `:9` (Google Fonts), `:146`
  (Bootstrap JS bundle). Bootstrap classes in markup: `d-none` (`:33`, already redefined in
  `jovi.css`), `d-flex align-items-center gap-2` (`:43`, the only genuine Bootstrap dependency),
  `btn btn-primary` / `btn btn-outline` (all three defined in `jovi.css`).
- `src/poc/css/jovi.css` — 754-line hand-built token system + all component/effect CSS.
- `src/poc/js/app.js` — references class names (`.active`, `.gallery-item`, `.featured`,
  `.sharpness-badge`, `.stat-card`, `.performance-spark`, `.transition-active`,
  `.aura-light-effect`, `.toast`, `#demo-feed`, `#demo-badge` planned). Not touched by this task.
- `.github/workflows/ci.yml` — `lint` (htmlhint/stylelint/eslint), `deploy` uploads `src/poc`.
- `package.json` — was `{ dependencies: { puppeteer } }` only.

## 2. Proposed Changes (as implemented)

### Architecture / data flow
No runtime logic change. Build-time: `input.css` → Tailwind CLI → `jovi.css` (shipped).
Utilities resolve from markup scan; `@theme` emits token-based utilities + CSS vars;
`@layer components` holds bespoke effects.

### Files
| Path | Change |
|---|---|
| `src/poc/css/input.css` | **new** — `@import "tailwindcss"`; `@theme` (brand/ink/semantic colours, `--font-sans`, radii, shadows); `@layer base` (4× `@font-face`, `:root` non-utility vars, `html/body`); `@layer components` (every component + effect from old `jovi.css`); `@keyframes` outside layers; `prefers-reduced-transparency` / `prefers-reduced-motion` blocks. |
| `src/poc/css/jovi.css` | **generated** — minified Tailwind output, committed (ships in ZIP). Banner `/*! tailwindcss v4.3.3 … */`. |
| `src/poc/index.html` | remove `:8/:9/:146`; add 2× `<link rel="preload">` for `poppins-400/600.woff2` (`crossorigin`); `d-flex align-items-center gap-2` → `flex items-center gap-2` (Tailwind utilities); `?v=7` → `?v=8`. |
| `src/poc/assets/fonts/` | **new** — `poppins-{400,500,600,700}.woff2` (latin, ~31 KB total) + `LICENSE-Poppins.txt` (SIL OFL), from `@fontsource/poppins`. |
| `package.json` | scripts `css` / `css:watch`; devDeps `@tailwindcss/cli@4.3.3`, `@fontsource/poppins`, `puppeteer` (moved from deps). |
| `package-lock.json` | regenerated. |
| `.gitignore` | ignore `tools/tailwindcss*` (107 MB binary — see Tradeoffs). |
| `.github/workflows/ci.yml` | `npm ci` step (`PUPPETEER_SKIP_DOWNLOAD=true`); stylelint target `src/**/css/jovi.css` → `src/poc/css/input.css`; new "CSS build is in sync" step (`npm run css` + `git diff --exit-code`). |
| `docs/guidelines/architecture.md`, `progress-tracker.md` | record the decision + no-CDN constraint. |

### Liquid Glass hardening (research caveats → code, in `input.css`)
- `--glass-blur: blur(12px) saturate(140%)` (was `blur(20px) saturate(160%)`).
- `.top-bar`: `linear-gradient(var(--glass-scrim), var(--glass-scrim)), var(--glass-bg)` — a
  `color-mix(in srgb, black 22%, transparent)` scrim under the blurred layer; hairline
  `rgb(255 255 255 / .22)` border; `inset 0 1px 0` highlight.
- `.btn-icon` / `.fps-counter`: opaque-enough backgrounds + `1px` hairline + `text-shadow`.
- `@media (prefers-reduced-transparency: reduce)` → `.top-bar` opaque, `backdrop-filter: none`.
- `@media (prefers-reduced-motion: reduce)` → kill `spin`/`aura-pulse`/`spark-pulse`/
  `skeleton-loading`/`toast-in` + `.screen` transition.

### Tokens: `@theme` namespace mapping
`--color-*` → `bg-*`/`text-*`/`border-*`; `--font-sans` → `font-sans`; `--radius-*` →
`rounded-*`; `--shadow-*` → `shadow-*`. Tailwind v4's default `--spacing` (0.25rem) already
equals the project 4-pt grid, so `gap-2` = 8px etc. `--touch-target`, `--glass-*` kept as plain
`:root` vars (not a Tailwind namespace) for use inside `@layer components`.

### Tradeoffs / decisions
- **Hybrid over full rewrite (option C).** Utilities carry layout/spacing/type/colour; the
  ~40 bespoke rules (glass, dial, bento spans, spark, view-transitions, toast, skeleton) stay
  as real CSS in `@layer components` — Tailwind cannot express `@keyframes` /
  `::view-transition-*` / `view-transition-name` cleanly, and `app.js` keys off those class
  names. Lower regression risk; markup utility adoption continues in `JOVI-113`.
- **Bootstrap removed, not vendored.** Only one element used it; `jovi.css` already owned
  `.btn*`/`.d-none`; the JS bundle was dead. Smaller ZIP, one less offline failure mode.
- **Tailwind delivery: `npm` devDependency, not a committed binary.** The standalone binary is
  **107 MB** — over GitHub's 100 MB file limit, so it cannot be committed (plan's original
  "commit binary" is not viable). `@tailwindcss/cli@4.3.3` pinned in devDependencies;
  `npm ci` + `npm run css` reproduces the shipped CSS. The ZIP still needs nothing — only the
  compiled `jovi.css` ships. Local dev may also keep the gitignored standalone binary at
  `tools/tailwindcss`.
- **Poppins:** latin `woff2` only (pt-BR mobile UI); `@fontsource/poppins` gives deterministic
  filenames + bundled OFL.

## 3. Implementation Checklist

- [x] Create branch `JOVI-108-tailwind-liquidglass-foundation`; ClickUp `JOVI-108` → in progress.
- [x] Add `@tailwindcss/cli@4.3.3` + `@fontsource/poppins` devDeps; `css` scripts; move `puppeteer` to devDeps.
- [x] `.gitignore` `tools/tailwindcss*`.
- [x] Copy `poppins-{400,500,600,700}.woff2` + OFL licence to `src/poc/assets/fonts/`.
- [x] Write `src/poc/css/input.css` (`@import`, `@theme`, `@layer base` + `@font-face`, `@layer components`, keyframes, reduced-* media).
- [x] `npm run css` → `src/poc/css/jovi.css` (22 KB / ~5.4 KB gz).
- [x] `src/poc/index.html`: drop 3 external tags; add 2 font `preload`s; `flex items-center gap-2`; `?v=8`.
- [x] `.github/workflows/ci.yml`: `npm ci` (+ skip puppeteer download); stylelint → `input.css`; CSS-in-sync step.
- [x] Fix `color-hex-length` lint (long → short hex in `@theme`).
- [ ] Update `docs/guidelines/architecture.md` + `progress-tracker.md`.
- [ ] Full verification pass (§4); ClickUp → complete.

## 4. Testing and Validation

### Automated (headless Chrome smoke — run this session)
`activeScreen=screen-camera`, all 5 screens present, `brand font-family` starts `Poppins`,
`document.fonts.check('16px Poppins')=true`, `.flex` → `flex`, `.btn-primary` bg
`rgb(10,61,255)`, **failed requests = 0**, **external requests = 0**. Console: the 3 messages
seen are pre-existing / environmental (View-Transition abort race under headless rapid nav →
`JOVI-111`; `favicon.ico` 404 from the test server; `NotAllowedError` camera → handled, that is
`JOVI-109`'s case).

### Manual (per `code-standards.md`, 360-428 px)
- Serve `src/poc/` offline (DevTools Network = Offline), hard reload → 0 external/failed.
- Walk all 5 screens; confirm Poppins glyphs + Liquid-Glass top bar + layout parity.
- Screenshot 360 / 390 / 428 px vs pre-change.
- Toggle `prefers-reduced-transparency` and `prefers-reduced-motion` in DevTools rendering → glass opaque / animations off.
- Legibility of `.top-bar` + `.btn-icon` over white and black frames.
- Lint: `htmlhint src/poc/index.html` (clean), `eslint@8 src/poc/js/app.js` (exit 0), `stylelint src/poc/css/input.css` (exit 0).
- `npm run css` then `git diff --exit-code src/poc/css/jovi.css` (no diff).
- ZIP `src/poc/`, extract to a clean dir, open offline, run capture → gallery → share.

### Invariant → check
| Invariant | Check |
|---|---|
| Offline parity | headless smoke: failed=0, external=0; manual Offline reload |
| Poppins applied | `document.fonts.check` + computed `font-family` |
| Tailwind real usage | `.flex` utility active; `@theme` colour on `.btn-primary` |
| Reproducible build | `npm run css` + `git diff --exit-code` |
| Reduced-transparency / motion | DevTools rendering emulation |
| Contrast over live feed | control legibility over white + black frames |
| CI unaffected | `lint` + `deploy` green |
