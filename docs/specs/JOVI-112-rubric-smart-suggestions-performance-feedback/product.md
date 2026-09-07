# Product Spec: Smart Contextual Suggestions & Visual Performance Feedback

**Task:** `JOVI-112` — https://app.clickup.com/t/JOVI-112
**Rubric Source:** `docs/jovi-flow-sprint2.pdf` ("sugestões automáticas de uso", "feedback visual de performance")
**Date:** 2026-09-07
**Status:** In Progress
**Depends on:** `JOVI-109`, `JOVI-110`, `JOVI-111`

---

## 1. Summary

The FIAP Sprint 2 challenge rubric specifically highlights two differentiators:
1. **"Sugestões automáticas de uso"**: smart suggestions that guide user behavior without adding cognitive load or cluttering the minimal 3-touch flow.
2. **"Feedback visual de performance"**: explicit, perceptible visual feedback confirming high-speed performance (<200ms processing, zero network latency, instant local persistence).

This specification introduces:
- A contextual Liquid Glass suggestion banner in the camera viewfinder that dynamically analyzes the current Aura Light color temperature and suggests the optimal shooting scenario (e.g., warm portrait, natural landscape, crisp product shot) with a single-tap quick optimization.
- An intelligent gallery recommendation card directing users to share their highest-sharpness photo.
- Instantaneous performance feedback: a latency metric badge ("⚡ 18ms Zero-Lag") rendered beside the performance spark upon capture, and elegant shimmer skeleton placeholders when loading gallery assets.

---

## 2. Problem

- While JOVI Flow already delivers 60 FPS rendering and Laplacian edge sharpness scoring, the rubric specifically tests for explicit "sugestões automáticas de uso" and "feedback visual de performance".
- Evaluators looking for these exact bullet points in the rubric need to see them visibly demonstrated in the application workflow.
- Without visual skeletons or latency metrics, the speed of IndexedDB feels instantaneous, but lacks visible celebration of its performance advantage over slow network-dependent cloud alternatives.

---

## 3. Goals & Non-Goals

- **Goals:**
  - Provide automatic contextual suggestions during viewfinder interaction (Aura temperature adjustments).
  - Provide an automated smart gallery suggestion highlighting the top-rated photo for quick sharing.
  - Display non-intrusive, authentic visual performance feedback (real measured capture duration, skeleton shimmer states).
  - Strictly adhere to the Liquid Glass design language (frosted glass, scrim layer, 4pt tokens, Poppins typography).
  - Ensure 100% offline compatibility on `file://` with zero external dependencies.
- **Non-Goals:**
  - Heavy ML models or TensorFlow.js downloads (violates the ZIP size and zero-CDN constraints; heuristics must be native JS).
  - Intrusive popups or modal interruptions (must remain seamless and non-blocking).

---

## 4. User Experience & Invariants

1. **Camera Smart Suggestion Pill:**
   - Positioned cleanly below the top control bar in the camera viewfinder.
   - Updates as the user drags or selects Aura temperatures:
     - Warm (<3500K): "💡 Luz Quente: Sugestão para Retratos intimistas."
     - Neutral (3500K-5500K): "☀️ Luz Natural: Foco e nitidez equilibrados."
     - Cool (>5500K): "⚡ Luz Fria: Ideal para texturas e fotos de produtos."
   - Tapping the suggestion pill applies an optimal preset with immediate feedback.
2. **Visual Performance Feedback on Capture:**
   - When the user taps the capture shutter, the exact capture-to-storage latency is measured via `performance.now()`.
   - The `#performance-spark` pulses with a golden glow, and a micro-pill displays `⚡ ${time}ms (Zero-Lag ISP)`.
   - Disappears smoothly after 1.8s.
3. **Gallery Smart Suggestion & Skeleton Feedback:**
   - When entering the gallery, if photos are loading or refreshed, animated Liquid Glass skeleton cards shimmer before the photos fade in.
   - If ≥ 1 photos exist, a smart recommendation banner suggests: "✨ Melhor captura identificada (Nitidez: ${score}%). Toque para compartilhar."
4. **Accessibility & Reduced Motion:**
   - All suggestion elements contain valid ARIA roles (`role="status"`, `aria-live="polite"`).
   - `@media (prefers-reduced-motion: reduce)` disables pulse/shimmer animations.

---

## 5. Success Criteria

- Both rubric criteria are visibly evidenced in both demo and live camera modes.
- Skeletons render and smoothly transition to photos.
- Suggestion pill is interactive and reactive to Aura temperature changes.
- Automated tests verify the presence, interactivity, and accessibility of suggestions and performance badges.
- ZIP package remains < 100 KB with 0 console errors.
