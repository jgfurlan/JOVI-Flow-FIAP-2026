# Code Standards: Agent-Legibility & Compliance

## Agent-Legibility (Mandatory)
The LLM is the primary consumer of this codebase. Optimize for searchability and deterministic discovery.

1. **Global Uniqueness:** Prefix function names or namespace modules to avoid search ambiguity.
   - Format: `{module}_{action}` (e.g., `jovi_camera_init`, `jovi_db_save_media`).
2. **Explicit Error Paths:** No bare catch-alls. Every camera API or storage transaction must handle failure paths (e.g., fallback if camera permission is denied).
3. **No "Magic" Strings:** Use constants or Enums for CSS classes, IndexedDB store names, and UI routes.

## Code Compliance
- **HTML:** Semantic tags (`<section>`, `<header>`, `<footer>`, `<video>`). All buttons must have `aria-label`.
- **CSS:** Use custom properties (variables) defined in `:root`. Strict adherence to the 4pt grid system.
- **JavaScript:** Vanilla ES6 modules. No jQuery or complex framework abstractions. Keep code decoupled (e.g., separate camera logic from IndexedDB logic).

## Linting & Formatting
- **CSS:** Pre-defined design tokens in `css/jovi.css`.
- **JS:** Standard JS formatting.

## Verification Standards
- **Manual Verification:** Every feature change must be tested across mobile viewport sizes (360px - 428px).
- **Console Check:** Zero JavaScript runtime exceptions in the developer console.
- **Offline Test:** Verify functionality persists when the network is disabled (offline mode).
