# UI Context: Aesthetics & UX Paradigms

## Aesthetic Tokens (JOVI Design System)
Ensure a unified UI generation by following these precise layout and color behaviors.

| Token | Hex/Value | Usage |
|-------|-----------|-------|
| `jovi-blue` | `#0A3DFF` | Primary actions, branding elements, active states |
| `jovi-yellow` | `#FFD600` | Aura Light overlay, warning highlight, secondary borders |
| `glass-bg` | `rgba(255, 255, 255, 0.12)` | Control panels backdrop |
| `text` | `#1A1A1A` | Dark typography |
| `surface` | `#FFFFFF` | Card backgrounds (Gallery/Detail) |

## Layout Behaviors
- **Spacing:** Spacings based on the 4pt grid system (e.g., margins/paddings as multiples of `4px` or variables like `--space-4`).
- **Radius:** `border-radius: 12px` for cards/bento tiles, `border-radius: 9999px` for round buttons.
- **Mobile First:** Optimized for viewports in the range `360px - 428px`.

## UX Paradigms

### 1. Liquid Glass / Invisible Interface
- The viewfinder is 100% fullscreen. Controls float as glassmorphic cards to maintain visual continuity.
- Prevent layout shifts using predefined skeletons during lazy-loading of thumbnails.

### 2. 3-Touch Shutter
- **Touch 1:** Tap Shutter (or Swipe Shutter Ring to adjust Aura temperature, then tap to capture).
- **Touch 2:** Tap Bento thumbnail in the corner to slide open the Gallery.
- **Touch 3:** Tap Share button in the detail view to trigger Clipboard API/WhatsApp share.

### 3. Sensory Feedback
- **Tactile haptics:** Use the Vibration API (`navigator.vibrate`) to emit feedback on capture and dial rotation ticks.
- **Aria Compliance:** Mandatory `aria-label` for all icons and buttons.
- **Touch Targets:** Minimum dimension of `44px` for all touch interactives.
