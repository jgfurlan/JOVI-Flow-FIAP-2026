# Project Overview: JOVI Flow (FIAP 2026)

## Mission
Develop JOVI Flow: a state-of-the-art camera web application that works in 3 touches, mobile-first, and offline-first. It transposes the unique hardware advantages of the JOVI smartphone line (such as the Aura Light) into a web experience.

## High-Level User Flows
1. **Toque 1: Captura Instantânea:** User opens the app and takes a photo on the fullscreen viewfinder, with real-time Aura Light color temperature tuning via gesture swipe.
2. **Toque 2: Bento Gallery:** User views recent photos in a modular bento grid, with automated ranking based on image sharpness.
3. **Toque 3: Compartilhar:** User shares the photo via integration/Clipboard API instantly.

## Success Criteria Benchmarks
- **Verifiable Performance:** Under 200ms initial load time (using skeleton screens).
- **Offline-First:** All assets and images are stored locally using IndexedDB.
- **Micro-interactions:** Interactive elements have a minimum touch target of 44x44px with vibration haptic feedback.
- **Brand Consistency:** Strictly follows the JOVI design system (Blue #0A3DFF, Yellow #FFD600, Poppins font).

## Out-of-Scope (Sprint 1 & 2)
- Cloud storage/hosting backend integration (local IndexedDB is the database).
- Social login authentication (local sandbox execution).
- Multi-camera simultaneous streams (focus on environment/back camera).

## Tech Stack
- **Frontend:** HTML5, CSS3 (Bootstrap 5.3.3)
- **Programming:** Vanilla JavaScript (ES6 Modules)
- **Web APIs:**
  - `getUserMedia` (video feed)
  - `IndexedDB` (local storage)
  - `Canvas API` (Aura Light filter overlay)
  - `Vibration API` (haptic ticks on slider dials)
  - `Clipboard API` (easy share copy)
  - `View Transitions API` (fluid page morphing)
- **Knowledge Base:** Graphify Knowledge Graph
