# Progress Tracker: Dynamic State Anchor

## Current Project Phase
**Sprint 2:** Front-end HTML/CSS/JS implementation. **Hard deadline: 2026-09-21. No late window.**
Deliverable = one ZIP uploaded to the FIAP platform (`src/poc/`) + a `.pdf` presentation.
Grading: 15 pts code (funcionalidade + correct HTML/CSS/JS/Bootstrap-or-Tailwind), 5 pts presentation.

## Active Implementation
- **Current Task:** `JOVI-109` — camera demo mode (spec written, not started).
- **Status:**
  - `JOVI-108` **implemented** on branch `JOVI-108-tailwind-liquidglass-foundation`, verification passing
    (headless smoke: 0 failed / 0 external requests, Poppins applied, Tailwind utilities + `@theme` live,
    CSS 22 KB / ~5.4 KB gz). Spec: `docs/specs/JOVI-108-tailwind-liquidglass-foundation/`.
  - `JOVI-109` next — synthetic viewfinder so every screen works with no camera / on `file://`.

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
- **2026-08-31:** Market + tech research (Tailwind vs Bootstrap 2026, Liquid Glass, camera APIs, perf budgets). **Decided:** CSS framework = **Tailwind v4 hybrid** (utilities + `@theme` + `@layer components`); UI = **Liquid Glass** (brand-authentic — vivo OriginOS 6 "Origin Design"); Tailwind delivery = `npm` devDependency (standalone binary is 107 MB, over GitHub's file limit). Research + decision archived in the approved plan.
- **2026-08-31:** `JOVI-108` implemented — Bootstrap + all CDNs removed; Tailwind v4 wired (`input.css` → generated `jovi.css`, 22 KB / ~5.4 KB gz); Poppins self-hosted (SIL OFL); Liquid Glass base hardened for blur cost / contrast / `prefers-reduced-transparency` + `prefers-reduced-motion`; `ci.yml` updated (`npm ci`, stylelint→`input.css`, CSS-in-sync check).
- **2026-08-30:** Swapped project tracker Linear → **ClickUp** (Custom Task IDs, `JOVI-` prefix). Updated `CLAUDE.md` + all guidelines.
- **2026-08-30:** Workflow trimmed for **solo maintainer + pre-deadline**: folded `andrej-karpathy-skills:karpathy-guidelines` (think-before-coding / simplicity / surgical / goal-driven) into `code-standards.md`; added a **lightweight single-file `spec.md` lane** for < ~50 LOC changes; **Graphify shelved** until after 2026-09-21 (grep/glob primary); ClickUp `in review` / PR / milestone-comment steps made **optional** (plan mode = review gate); UX docs **consolidated 4 → 1** (`ui-context.md`; deleted `JOVI_Camera_SmartCanvas_Design.md` + `JOVI_Camera_UX_DeepDive.md`).
- **2026-08-31:** **Retired the `develop` branch — trunk-based on `main` now.** `develop` had drifted ~20 commits behind `main` (never got the JOVI-106 View Transitions selector fix) and its stale `jovi.css` failed `stylelint no-duplicate-selectors` on every dependabot merge (3 red CI runs). The 3 real dependabot bumps (`actions/checkout` v7, `actions/setup-node` v7, `puppeteer` 25.8.0) were cherry-picked onto `main`; GitHub default branch → `main`; `dependabot.yml` pinned to `target-branch: main`; `ci.yml` push trigger reduced to `[main]`; `develop` deleted on GitHub + GitLab mirror.

## Feature Queue (ClickUp Tasks)
1. ~~`JOVI-108` Tailwind v4 hybrid + Liquid Glass foundation + zero external requests.~~ **DONE 2026-08-31** (branch `JOVI-108-tailwind-liquidglass-foundation`).
2. `JOVI-109` Camera demo mode — cameraless fallback for `file://` / no-camera grading. **Next.**
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
