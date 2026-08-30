# Code Standards: Agent-Legibility & Compliance

## Change Discipline (Karpathy Guidelines)
Behavioral guardrails against common LLM coding mistakes. Bias toward caution over speed; use
judgement on trivial tasks. Full skill: `andrej-karpathy-skills:karpathy-guidelines`.

1. **Think before coding.** State assumptions explicitly. If multiple interpretations exist,
   surface them — do not pick silently. If a simpler approach exists, say so. If something is
   unclear, stop and name it.
2. **Simplicity first.** Minimum code that solves the stated problem. No speculative features,
   no abstractions for single-use code, no unrequested "configurability", no error handling
   for impossible states. If 200 lines could be 50, rewrite it. Test: would a senior engineer
   call this overcomplicated?
3. **Surgical changes.** Touch only what the task requires. Do not "improve" adjacent code,
   comments, or formatting. Do not refactor what is not broken. Match existing style. Remove
   only the imports/vars/functions **your** change orphaned; pre-existing dead code gets
   mentioned, not deleted. Every changed line must trace to the request.
4. **Goal-driven execution.** Turn the task into a verifiable goal before starting
   ("fix the bug" → "write a check that reproduces it, then make it pass"). For multi-step
   work, state a short plan with a `verify:` line per step, then loop until every check passes.

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

## Testing Standards
Use the `test-driven-development` skill (RED → GREEN → REFACTOR) when there is something
scriptable to assert.

What "a check" means on this stack (no bundler, no framework, solo maintainer):
- **Scriptable logic** — pure functions such as sharpness/Laplacian math, Kelvin→RGB, date
  formatting — gets a real automated test. Extract such logic into small, importable helpers
  so it can be exercised in isolation. Runner: `node --test` (planned, post-21/09 — see
  `progress-tracker.md`).
- **UI / DOM / camera behaviour** — the "test" is the explicit manual verification array in
  the spec's `tech.md` §4 (or `spec.md` §4 for lightweight specs), executed at 360-428 px and
  recorded pass/fail on the branch before merge.
- Nothing lands on `main` without the change's invariants covered by one of the two above.

## Verification Standards
- **Manual Verification:** Every feature change must be tested across mobile viewport sizes (360px - 428px).
- **Console Check:** Zero JavaScript runtime exceptions in the developer console.
- **Offline Test:** Verify functionality persists when the network is disabled (offline mode).
- **Completion Gate:** Run the `verification-before-completion` skill before moving a ClickUp
  task to "complete".
