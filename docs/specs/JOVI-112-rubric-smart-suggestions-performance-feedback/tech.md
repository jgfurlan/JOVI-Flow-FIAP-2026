# Technical Spec: Smart Contextual Suggestions & Visual Performance Feedback

**See `product.md` for the product spec.**
**Task:** `JOVI-112`
**Branch:** `JOVI-112-smart-suggestions-performance-feedback`

---

## 1. Context & Code Anchors

- `src/poc/index.html`:
  - Camera Screen (`#screen-camera`): Top bar contains `#btn-flash`, `#fps-counter`, `#performance-spark`, `#btn-settings`.
  - Viewfinder Area: Viewfinder overlay currently has `.aura-light-effect`.
  - Gallery Screen (`#screen-gallery`): Contains `#gallery-grid`, `#gallery-empty`, `#gallery-footer`.
- `src/poc/css/input.css`:
  - Defines design tokens, `.top-bar`, `.performance-spark`, `.gallery-grid`, `.gallery-item`.
- `src/poc/js/app.js`:
  - `updateAuraLightTemperature(temperature)`: Controls temperature state and updates UI.
  - `capturePhoto()`: Handles camera capture, sharpness computation, and IndexedDB persistence.
  - `loadGallery()`: Renders items in `#gallery-grid`.

---

## 2. Proposed Changes

### 2.1 Markup Additions (`src/poc/index.html`)

1. **Smart Suggestion Banner in Viewfinder:**
   ```html
   <div id="camera-suggestion" class="camera-suggestion-pill" role="status" aria-live="polite">
       <span class="suggestion-icon">💡</span>
       <span class="suggestion-text">Modo Retrato: Iluminação Ideal</span>
   </div>
   ```
2. **Performance Latency Pill beside Performance Spark:**
   ```html
   <div class="flex items-center gap-2">
       <span class="fps-counter" id="fps-counter">-- FPS</span>
       <div id="performance-spark" class="performance-spark ready" aria-label="Indicador IA Inteligente" title="IA Status"></div>
       <span id="perf-latency-badge" class="perf-latency-badge d-none" aria-live="polite">⚡ 24ms</span>
   </div>
   ```
3. **Smart Gallery Recommendation Banner:**
   ```html
   <div id="gallery-suggestion" class="gallery-suggestion-banner d-none" role="status">
       <span class="suggestion-icon">✨</span>
       <span id="gallery-suggestion-text" class="suggestion-text">Sugestão: Foto destacada possui máxima nitidez.</span>
   </div>
   ```

### 2.2 Styling Additions (`src/poc/css/input.css`)

1. `.camera-suggestion-pill`:
   - Positioned below `.top-bar` at `top: max(4.5rem, calc(env(safe-area-inset-top) + 3.75rem))`.
   - Centered horizontally, Liquid Glass styling (scrim + backdrop-filter + border + text-white/90).
   - Animated entrance/exit with subtle opacity/transform.
2. `.perf-latency-badge`:
   - Ultra-compact pill in gold/accent text (`--color-jovi-yellow`), monospace font, font-size 0.7rem.
3. `.gallery-suggestion-banner`:
   - Rounded Liquid Glass card placed immediately before `#gallery-grid`.
4. `.skeleton-item` shimmer:
   - Shimmer gradient animation (`background: linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.05) 100%)`).

### 2.3 JavaScript Logic (`src/poc/js/app.js`)

1. **Dynamic Suggestion Engine:**
   - In `updateAuraLightTemperature(temp)`:
     - Update text & icon of `#camera-suggestion` based on Kelvin range.
   - On click of `#camera-suggestion`:
     - Cycles through curated optimal presets (3000K Warm Portrait → 5000K Natural Day → 7000K Vivid Crisp).
2. **Real Latency Benchmark & Performance Feedback:**
   - In `capturePhoto()`:
     - `const t0 = performance.now();` at start.
     - `const t1 = performance.now(); const delta = Math.round(t1 - t0);` after `savePhoto()`.
     - Show `#perf-latency-badge` with `⚡ ${delta}ms (Zero-Lag)`; pulse `#performance-spark`.
     - Hide badge after 1800ms.
3. **Gallery Skeleton and Smart Suggestion:**
   - In `loadGallery()`:
     - If grid is empty or starting load, show 3 skeleton placeholders.
     - After loading photos, update `#gallery-suggestion` with the highest-ranked photo's score and wire click to open that photo directly in Detail screen!

---

## 3. Implementation Checklist

- [ ] Add markup in `src/poc/index.html` (camera suggestion, perf latency badge, gallery recommendation).
- [ ] Add Liquid Glass styles and shimmer animation in `src/poc/css/input.css`.
- [ ] Compile CSS via `npm run css` and verify diff.
- [ ] Update `src/poc/js/app.js` with suggestion reactivity, latency benchmarking, and skeleton rendering.
- [ ] Update automated test suite to verify suggestions, latency badges, and skeleton transitions.
- [ ] Run `npm run zip` to verify deliverable bundle size and contents.
- [ ] Update `docs/guidelines/progress-tracker.md`.
