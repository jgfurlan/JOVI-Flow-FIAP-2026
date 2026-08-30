# Technical Spec: Camera Demo Mode (Cameraless Fallback)

**See `product.md` for the product spec.**
**Proposed branch:** `JOVI-109-camera-demo-mode`
**Depends on:** `JOVI-108-local-asset-vendoring`

## 1. Context

Files:

- `src/poc/js/app.js`
  - `init()` splash gate — `app.js:43-48` (`if (window.location.protocol !== 'file:')`).
  - `startCamera()` — `app.js:159-182`; catch is a single generic toast.
  - `capturePhoto()` — `app.js:261-293`; capture source hard-wired to `#camera-preview`; blank-canvas fallback `app.js:273-274`.
  - `calculateSharpness()` — `app.js:322-361` (Laplacian variance, central 100×100 sample).
  - `applyAuraLightEffect()` — `app.js:295-320`; `updateAuraLightTemperature()` — `app.js:227-259`.
  - `switchCamera()` — `app.js:577-598`; reads `getVideoTracks()[0].getSettings().facingMode`, often `undefined` on desktop → toggle logic breaks.
  - `toggleFlash()` — `app.js:600-610`.
  - `handleVisibilityChange()` — `app.js:612-618`.
- `src/poc/index.html`
  - `.camera-viewfinder` — `index.html:31-37` (`<video id="camera-preview">`, `<canvas id="camera-canvas" class="d-none">`, `#camera-overlay`).
  - `#btn-settings` — `index.html:47-49`, no handler bound anywhere.
  - `.camera-controls` bottom bar — `index.html:51-64`.
- `src/poc/css/jovi.css` — design tokens in `:root`; `.camera-viewfinder`, `.camera-overlay` styles.

## 2. Proposed Changes

### Architecture / Data Flow

Introduce a camera-acquisition wrapper that resolves to one of two capture surfaces. All downstream code reads "the active surface" instead of `#camera-preview` directly.

```
init()
  └─ jovi_camera_acquire()
       ├─ no mediaDevices / getUserMedia            → enterDemo('sem suporte a câmera')
       ├─ getUserMedia({video:{facingMode:'environment'}, audio:false})
       │     ├─ success                             → cameraMode = LIVE; wire stream; hide #demo-badge; stop demo loop
       │     ├─ NotAllowedError | SecurityError     → enterDemo('permissão de câmera negada'); show #btn-retry-camera
       │     ├─ NotFoundError | OverconstrainedError→ enterDemo('nenhuma câmera encontrada')
       │     ├─ NotReadableError | AbortError       → enterDemo('câmera em uso por outro app')
       │     └─ (other)                             → console.error(err); enterDemo('câmera indisponível')
       └─ location.protocol === 'file:'             → attempt live once; on failure enterDemo('abra via servidor http para câmera real')

capturePhoto()
  └─ source = (cameraMode === DEMO) ? demoCanvas : video
       → drawImage(source) → applyAuraLightEffect → calculateSharpness → savePhoto   (unchanged)
```

### Modules Touched
- `src/poc/js/app.js` — new state + functions, edits to `init`, `startCamera`→`jovi_camera_acquire`, `capturePhoto`, `switchCamera`, `toggleFlash`, `handleVisibilityChange`; wire `#btn-settings`, `#btn-retry-camera`.
- `src/poc/index.html` — add `#demo-feed` canvas, `#demo-badge`, `#btn-retry-camera`.
- `src/poc/css/jovi.css` — `.demo-badge`, `#demo-feed` positioning, `prefers-reduced-motion` rule.
- `docs/guidelines/progress-tracker.md` — status update.

### New Types / APIs / State

```js
const CAMERA_MODE = { LIVE: 'live', DEMO: 'demo' };   // enum, no magic strings
let cameraMode = CAMERA_MODE.LIVE;
let demoRafId = null;
let intendedFacing = 'environment';                    // tracked, not read back from getSettings()
```

New functions (`{module}_{action}` naming):
- `jovi_camera_acquire()` — replaces the body/role of `startCamera()`.
- `jovi_camera_enterDemo(reason)` — set mode, start feed, reveal badge + toast, keep retry affordance.
- `jovi_camera_startDemoFeed()` / `jovi_camera_stopDemoFeed()` — manage the rAF loop.
- `jovi_camera_renderDemoFrame(t)` — draw one synthetic frame.
- `jovi_camera_activeSurface()` — returns `demoCanvas` or `video`.

### Synthetic viewfinder — `jovi_camera_renderDemoFrame`

Canvas-generated, nothing to bundle:
- `<canvas id="demo-feed">` sized to the viewfinder, layered where `#camera-preview` sits.
- Per frame: animated diagonal gradient in brand tokens (`--jovi-blue`→`--jovi-yellow`, slow pan); a drifting soft radial "Aura" highlight driven by the current Aura temperature (reuse `updateAuraLightTemperature` output); subtle moving grain/scanline; HUD text = timestamp + "SIMULAÇÃO".
- For a meaningful ranking demo: each capture renders a random number of crisp geometric shapes (hard edges → higher Laplacian) so `calculateSharpness` returns a spread of scores.
- `prefers-reduced-motion: reduce` → render one static frame, never schedule `requestAnimationFrame`.
- Loop runs only while `cameraMode === DEMO` and `document.hidden === false`.

### Markup additions (`index.html`)

- Inside `.camera-viewfinder`: `<canvas id="demo-feed" class="jovi-hidden" aria-hidden="true"></canvas>`
- Viewfinder top area: `<div id="demo-badge" class="demo-badge jovi-hidden" role="status">MODO DEMO</div>` (`aria-label="Pré-visualização simulada — câmera indisponível"`).
- `.camera-controls`: `<button id="btn-retry-camera" class="btn-outline jovi-hidden" aria-label="Tentar acessar a câmera real">Tentar câmera real</button>`

### Style additions (`jovi.css`)
- `.demo-badge` — pill, `background: var(--jovi-yellow)`, dark text, top-left, spaced by `var(--touch-target-min)`, `z-index` above viewfinder.
- `#demo-feed` — `position:absolute; inset:0;` (size set in JS to device pixels).
- `@media (prefers-reduced-motion: reduce)` — freeze demo animation.
- Uses `.jovi-hidden` from `JOVI-108`.

### Tradeoffs
- Canvas feed can look flat → mitigated with brand gradient + Aura response + HUD; optional `assets/demo/viewfinder-loop.webp` upgrade later, canvas stays the guaranteed path.
- Fixing `switchCamera` facing bug is in scope because the demo guard touches the same function; tracking `intendedFacing` is the minimal correct fix.

## 3. Implementation Checklist

- [ ] Add `CAMERA_MODE`, `cameraMode`, `demoRafId`, `intendedFacing` near the top of `app.js`.
- [ ] Implement `jovi_camera_acquire()` with the full error-path table; call it from `init()` and from splash-tap / `btn-back-camera` / `btn-goto-camera` handlers currently calling `startCamera()`.
- [ ] Implement `jovi_camera_enterDemo`, `jovi_camera_startDemoFeed`, `jovi_camera_stopDemoFeed`, `jovi_camera_renderDemoFrame`, `jovi_camera_activeSurface`.
- [ ] `capturePhoto()` — source from `jovi_camera_activeSurface()`; keep pipeline; add per-capture edge-shape variation in demo.
- [ ] `init()` — remove the `protocol !== 'file:'` gate; always advance splash → camera → `jovi_camera_acquire()`.
- [ ] `switchCamera()` — early return + toast when `cameraMode === DEMO`; replace `getSettings().facingMode` read-back with `intendedFacing` toggle.
- [ ] `toggleFlash()` — early return + toast when `cameraMode === DEMO`.
- [ ] `handleVisibilityChange()` — pause/resume demo loop alongside existing stop/start camera.
- [ ] Wire `#btn-settings` → toggle LIVE ⇄ DEMO (`jovi_camera_acquire()` / `jovi_camera_enterDemo('ativado manualmente')`).
- [ ] Wire `#btn-retry-camera` → `jovi_camera_acquire()`; hide it on success.
- [ ] Add markup to `index.html`; add styles to `jovi.css`; bump `?v=` cache-buster.
- [ ] Run linters (htmlhint / stylelint / eslint).
- [ ] Update `progress-tracker.md`.

## 4. Testing and Validation

### Manual Verification (per `code-standards.md`, 360-428 px)

- **Scenario A (`file://`, no server):** open `src/poc/index.html` directly. Splash auto-advances; demo feed animates; `MODO DEMO` badge visible; reason toast shown. Shutter → "Foto salva!"; gallery has the new photo + sharpness badge; after ≥3 captures the featured bento card is the highest score; AI stats card present. Detail shows image + date. Share "Copiar" resolves. Aura gesture tints the feed. Zero console exceptions.
- **Scenario B (desktop Chrome, camera blocked):** as A; denied path shows the reason + "Tentar câmera real".
- **Scenario C (real camera granted):** `cameraMode === LIVE`; real stream; badge hidden; confirm no rAF demo loop via a `console.count` in `jovi_camera_renderDemoFrame` (must not increment). Capture/gallery/detail/share work.
- **Scenario D (`prefers-reduced-motion: reduce`):** demo feed static; assert `demoRafId === null`.
- **Controls:** in demo, `switchCamera` and `toggleFlash` show a toast and do not throw.

### Automated
- CI `lint` job green.

### Invariant → check mapping
| Product invariant | Verification |
|---|---|
| Every screen reachable with no camera | Scenario A full walk |
| Real camera auto-used when available | Scenario C, `LIVE` + loop idle |
| Distinct handling per failure reason | Scenarios A/B + forced `NotReadableError` (open camera in another tab) |
| Ranking demo meaningful | ≥3 captures → distinct sharpness scores, correct featured card |
| Reduced-motion respected | Scenario D, `demoRafId === null` |
| No exceptions / no silent failures | Console check on every scenario |
| Downstream pipeline unchanged | Aura tint + sharpness badge present on demo captures |
