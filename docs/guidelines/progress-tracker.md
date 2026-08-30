# Progress Tracker: Dynamic State Anchor

## Current Project Phase
**Sprint 2:** Front-end HTML/CSS/JS implementation. **Hard deadline: 2026-09-21. No late window.**
Deliverable = one ZIP uploaded to the FIAP platform (`src/poc/`) + a `.pdf` presentation.
Grading: 15 pts code (funcionalidade + correct HTML/CSS/JS/Bootstrap-or-Tailwind), 5 pts presentation.

## Active Implementation
- **Current Task:** Sprint 2 hardening of `src/poc/` for the ZIP deliverable.
- **Status:** Specs drafted, awaiting approval:
  - `docs/specs/JOVI-108-local-asset-vendoring/` — remove all CDN deps (Bootstrap, Poppins); render offline.
  - `docs/specs/JOVI-109-camera-demo-mode/` — synthetic viewfinder so every screen works with no camera / on `file://`.

## Completed Features
- ✅ JOVI-101 Negócio (validated dores and benchmarks).
- ✅ JOVI-102 MER (database schema + dicionário).
- ✅ JOVI-104 Validação Técnica (getUserMedia & IndexedDB core POC).
- ✅ JOVI-103 UI Refinement (Liquid Glass viewfinder, Aura Ring shutter, Bento gallery, View Transitions).
- ✅ JOVI-106 View Transition / Bento morphing bug fix.
- ✅ Sprint 1 PDF compiled (`docs/jovi-flow-sprint1.pdf`).

## Historical Decisions
- **2026-04-16:** Standardized on Bootstrap 5.3.3 + Vanilla JS to eliminate bundle overhead.
- **2026-05-20:** Compiled Sprint 1 assets into `jovi-flow-sprint1.pdf`.
- **2026-05-21:** Enforced spec-driven workflow (`superpowers:brainstorming`).
- **2026-06-07:** Resolved View Transition UI bug (JOVI-106) via `graphify` tracing + `superpowers:systematic-debugging`. **Lesson:** prove root cause (uniqueness collision on `.active` / `view-transition-name`) before imperative JS workarounds.
- **2026-08-30:** Reviewed `docs/jovi-flow-sprint2.pdf`. Confirmed constraints: ZIP-only delivery, external links not graded, network not guaranteed → CDN deps became a **correctness defect**. Opened JOVI-108 / JOVI-109.
- **2026-08-30:** Adopted the `agent-project-template` workflow (scoped): two-file spec system (`docs/specs/<id>-<slug>/{product,tech}.md` + `TEMPLATE/`), refreshed `ai-workflow-rules.md`, added TDD section to `code-standards.md`. Real JOVI guideline content (architecture, overview, ui-context) kept as-is.
- **2026-08-30:** Bootstrap slated for removal — usage is ~7 utility classes, JS bundle unused, `jovi.css` owns the design system (JOVI-108).
- **2026-08-30:** Swapped project tracker Linear → **ClickUp** (Custom Task IDs, `JOVI-` prefix). Updated `CLAUDE.md` + all guidelines.
- **2026-08-30:** Workflow trimmed for **solo maintainer + pre-deadline**: folded `andrej-karpathy-skills:karpathy-guidelines` (think-before-coding / simplicity / surgical / goal-driven) into `code-standards.md`; added a **lightweight single-file `spec.md` lane** for < ~50 LOC changes; **Graphify shelved** until after 2026-09-21 (grep/glob primary); ClickUp `in review` / PR / milestone-comment steps made **optional** (plan mode = review gate); UX docs **consolidated 4 → 1** (`ui-context.md`; deleted `JOVI_Camera_SmartCanvas_Design.md` + `JOVI_Camera_UX_DeepDive.md`).

## Feature Queue (ClickUp Tasks)
1. `JOVI-108` Local asset vendoring — zero external requests. **Blocker.** Do first.
2. `JOVI-109` Camera demo mode — cameraless fallback for `file://` / no-camera grading. Depends on 108.
3. `JOVI-110` (proposed) Delete `src/prototype/`; ZIP layout with `index.html` at root.
4. `JOVI-111` (proposed) Robustness pass: stuck capture button (`finally`), `switchCamera` facing bug, delete-by-id not by base64, gallery incremental render.
5. `JOVI-112` (proposed) Rubric features: "sugestões automáticas de uso" + "feedback visual de performance" (skeleton screens).
6. `JOVI-113` (proposed) Sprint 2 presentation `.pdf` — team names + RMs, feature→need mapping, data model.
7. `JOVI-114` (proposed) Mobile-first QA pass 360/390/428 px; `prefers-reduced-motion`; drop `user-scalable=no`; local Lighthouse vs the <200ms claim.

### Post-submission (after 2026-09-21)
- `JOVI-115` (proposed) Add `node --test` runner + tests for pure helpers (Kelvin→RGB, Laplacian sharpness, `formatDate`); extract those helpers out of `app.js`.
- Revisit Graphify; add a `commit-msg` hook enforcing the `[JOVI-nnn]` prefix.

## Session Restoration Point
Next agent: read `CLAUDE.md`, then `docs/specs/JOVI-108-local-asset-vendoring/` and
`docs/specs/JOVI-109-camera-demo-mode/`. Navigate with `grep`/`glob` + file reads (Graphify is
shelved until after 2026-09-21). Implement JOVI-108 first.
