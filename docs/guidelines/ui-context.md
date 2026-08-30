# UI Context: Aesthetics & UX Paradigms

> Single UX reference for JOVI Flow. Consolidated 2026-08-30 from `ui-context.md` +
> `JOVI_Camera_SmartCanvas_Design.md` + `JOVI_Camera_UX_DeepDive.md`. Detailed visual design
> (CSS token values, transition CSS, component dimensions) lives in the historical spec
> `docs/specs/2026-05-21-jovi-ui-refinement-design.md`.

## Brand Context
**JOVI** is the exclusive brand identity of **vivo Mobile Communication** in Brazil, launched
2025 to avoid the Telefônica/"Vivo" trademark. Positioning: **"The Voice of Youth"** —
youthful (bold, energetic), easy (frictionless, technology that disappears), technological
(inherits vivo's global R&D, incl. the **ZEISS Imaging** partnership). The UI must feel
premium and effortless, never like "just another camera app".

## Challenge Pain Points (design targets)
1. **Low-light frustration** — poor results in dim environments.
2. **Generic design** — interfaces that feel interchangeable.
3. **Perceived slowness** — latency between intent and capture.
4. **Complexity** — feature bloat that hides good results from casual users.

Mission: use **UX + Performance + Design** to make the camera feel "human, intuitive,
intelligent".

## Aesthetic Tokens (JOVI Design System)
| Token | Hex/Value | Usage |
|-------|-----------|-------|
| `jovi-blue` | `#0A3DFF` | Primary actions, branding elements, active states |
| `jovi-yellow` | `#FFD600` | Aura Light overlay, warning highlight, secondary borders |
| `glass-bg` | `rgba(255, 255, 255, 0.12)` | Control panels backdrop |
| `text` | `#1A1A1A` | Dark typography |
| `surface` | `#FFFFFF` | Card backgrounds (Gallery/Detail) |

## Layout Behaviors
- **Spacing:** 4pt grid — margins/paddings as multiples of `4px` (`--space-4` etc.).
- **Radius:** `12px` for cards/bento tiles, `9999px` for round buttons.
- **Mobile First:** optimized for `360px - 428px` viewports.

## UX Paradigms

### 1. Liquid Glass / Invisible Interface
- Viewfinder is 100% fullscreen. Controls float as glassmorphic cards (translucent, blurred,
  inheriting scene colors) to keep visual continuity.
- Prevent layout shift with predefined skeleton screens during lazy-load of thumbnails.
- `View Transitions API` for app-like Camera ⇄ Gallery switching.

### 2. 3-Touch Shutter
- **Touch 1:** Tap Shutter (or swipe the Shutter Ring to adjust Aura temperature, then tap to capture).
- **Touch 2:** Tap the Bento thumbnail in the corner to slide open the Gallery.
- **Touch 3:** Tap Share in the detail view → Clipboard API / WhatsApp share.

### 3. Sensory Feedback
- **Haptics:** Vibration API (`navigator.vibrate`) on capture and on dial-rotation ticks.
- **Aria:** mandatory `aria-label` on every icon and button.
- **Touch targets:** minimum `44px` on all interactives.

### 4. Predictive / Contextual UI
The UI anticipates instead of only reacting:
- Mode suggestions surface on context — e.g. a Night-Mode icon appears subtly when low light
  is detected; a "refazer" hint when the sharpness score is low.
- **Performance "Spark":** a small pulsing dot (top-right) signalling the AI is optimising the
  shot — green = optimal, gold = low-light enhancement, blue = focus/stability. Raises the
  *perception* of performance.
- Contextual Bento Gallery: photos auto-group into "Memories"/"Stories" by timestamp, not a
  flat list.

## Out of Scope (Sprint 2)
Older design notes mention **Service Workers** and **Web Workers** for offline/image
processing. These are **not** part of the Sprint 2 deliverable: grading opens the ZIP from
`file://`, there is no offline-SW requirement, and the stack is locked to HTML/CSS/JS +
Bootstrap/Tailwind. See `docs/jovi-flow-sprint2.pdf` and `architecture.md`.
