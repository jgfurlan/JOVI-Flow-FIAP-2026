# Design Spec: JOVI Flow UI Refinement (JOVI-103)
**Author:** Mira - AI UI/UX Designer  
**Date:** 2026-05-21  
**Status:** Approved by Chief Architect (jgfurlan)  

---

## 1. Vision & Architecture

The JOVI Flow interface represents a "Liquid Glass" camera experience. It is a 100% web-based, mobile-first design that removes traditional boundaries. All interactive widgets float on a fullscreen camera preview, adopting translucency and blur properties.

```
+------------------------------------------+
|  [FPS]                         [SPARK *] |
|                                          |
|                                          |
|                VIEWFINDER                |
|              (100% Canvas)               |
|                                          |
|                                          |
|                                          |
|  [BENTO]        (( SHUTTER ))    [SWITCH]|
+------------------------------------------+
```

---

## 2. Core UI Components

### 2.1 The Fullscreen Viewfinder
- **Dimensions:** `100vw` wide by `100vh` / `100dvh` high.
- **Scaling:** Uses `object-fit: cover` to fill mobile viewports (360px - 428px) without aspect distortion.
- **Lighting Overlay:** An overlay `div` with `mix-blend-mode: soft-light` applies a radial gradient to simulate the warm/cool Aura Light.

### 2.2 Interactive Aura Shutter Ring
- **Structure:**
  - Outer Ring: Translucent circular border (`64px` diameter).
  - Inner Shutter: Solid white button (`48px` diameter).
- **Gestures:**
  - **Single Tap:** Triggers capture.
  - **Rotational Drag:** Dragging on the outer ring triggers color temperature adjustments (swipes left/right alter temperature values between `2000K` (Warm/Yellow) and `10000K` (Cool/Blue)).
- **Haptics:** Triggers a `navigator.vibrate(10)` pulse for every step change.

### 2.3 Bento Gallery Grid
- **Columns:** CSS Grid `repeat(2, 1fr)`.
- **Gap:** `12px` padding and gap.
- **Highlight Card (Sharpest/Latest):** `grid-column: span 2; grid-row: span 2;`. Displays a sharpness score badge.
- **Secondary Cards:** `grid-column: span 1; grid-row: span 1;` for other captures.
- **AI Stats Card:** A modular grid item listing battery savings and capture metadata.

### 2.4 Performance Spark
- **Position:** Fixed top-right (`16px` right, `16px` top).
- **Size:** `8px` circle with a pulsing keyframe animation.
- **Colors:**
  - `#34C759` (Green): Optimal capture environment.
  - `#FFD600` (Gold): Low light mode.
  - `#0A3DFF` (Blue): Autofocus stabilization.

---

## 3. Design System & CSS Tokens

```css
:root {
  /* Colors */
  --jovi-blue: #0A3DFF;
  --jovi-yellow: #FFD600;
  
  /* Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.12);
  --glass-blur: blur(20px) saturate(160%);
  --glass-border: 1px solid rgba(255, 255, 255, 0.2);
  
  /* Grid & Touch */
  --grid-unit: 4px;
  --touch-target-min: 44px;
  --border-radius: 12px;
}
```

---

## 4. UI Transition Flow (View Transitions API)

```
[Camera Screen (Bento Thumb)]
           │
           ▼ (Tap)
[morph-bento-thumb transition] ──► [Gallery Screen (Featured Card)]
```

When switching views, the Bento thumbnail on the camera screen morphs into the full Bento Gallery container using:
```css
::view-transition-old(gallery-card) {
  animation: fade-out 0.2s ease;
}
::view-transition-new(gallery-card) {
  animation: scale-up 0.2s ease;
}
```
