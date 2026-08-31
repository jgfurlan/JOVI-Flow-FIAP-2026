# AI Workflow Rules: Execution Governance

> Adopted from `agent-project-template` (2026-08-30), adapted for the JOVI Flow
> vanilla HTML/CSS/JS stack. Router file: `CLAUDE.md`.
> **Solo project, hard deadline 2026-09-21.** Rules are trimmed to what earns its keep at that
> scale — see the `2026-08-30` entry in `progress-tracker.md`.

## Core Mandates
Focus on a single system boundary or isolated subsystem task at a time. See
`code-standards.md` "Change Discipline (Karpathy Guidelines)" for the per-change guardrails
(think before coding, simplicity first, surgical changes, goal-driven).

## Methodology: Spec-Driven Development
Design is settled in a spec **before code is written**. Two lanes:

### Feature lane — two-file spec
For real features (e.g. `JOVI-108`, `JOVI-109`): a folder `docs/specs/<task-id>-<slug>/` with
templates from `docs/specs/TEMPLATE/`.

1. **`product.md`** — user-facing behaviour: summary, problem, goals & non-goals, testable
   invariants (happy path, edge cases, constraints), success criteria. **No implementation detail.**
2. **`tech.md`** — implementation plan grounded in the codebase: current context with
   `file:line` refs, proposed changes (modules, data flow, new state/APIs, tradeoffs), a
   step-by-step checklist, and how each `product.md` invariant is verified.

### Lightweight lane — single-file spec
For changes under ~50 LOC or bugfixes: a single `docs/specs/<task-id>-<slug>/spec.md` with
just **Problem**, **Change**, **Verification array** (§4-style, run at 360-428 px).

### No spec
Trivial one-liners (typo, constant tweak): skip the spec, just the `[JOVI-nnn]` commit.

Once a spec exists, implementation follows it. Deviations update the spec, not improvise
silently. Legacy flat specs (`docs/specs/<date>-<slug>.md`) are history only.

## Session Governance (Superpowers)
Use the `superpowers` framework for implementation tasks.
- **Plan Mode:** use `enter_plan_mode` to draft the spec and self-approve before editing code
  (solo — plan mode *is* the review gate).
- **TDD:** use the `test-driven-development` skill when there is something scriptable to
  assert (see `code-standards.md` "Testing Standards").
- **Verification:** use the `verification-before-completion` skill before claiming success.

## Branching Model
**Trunk-based.** `main` is the only long-lived branch — it is the GitHub default, the sole CI
push trigger, and the Pages deploy source. Feature work happens on short-lived
`<task-id>-<slug>` branches merged back to `main` (PR optional, solo). There is **no `develop`
branch** — it was retired 2026-08-31 after repeatedly drifting behind `main` and breaking
dependabot CI. Dependabot targets `main` explicitly (`.github/dependabot.yml`).
(A GitLab remote exists as a legacy mirror; older history uses `[#nn]` GitLab issue refs.)

## ClickUp-GitHub Synchronization
ClickUp = source of truth for project state. GitHub = source of truth for code.

**Required (cheap, keeps the audit trail):**
1. **Task Mapping:** every branch corresponds to exactly one ClickUp task.
2. **Task IDs:** ClickUp **Custom Task IDs**, `JOVI-` prefix (e.g. `JOVI-108`). Branches and
   commits key off this.
3. **Branch Naming:** `<task-id>-<short-description>` (e.g. `JOVI-108-local-asset-vendoring`).
4. **Commit Messages:** start every commit with `[<task-id>]`
   (e.g. `[JOVI-108] refactor: vendor Poppins locally`).
5. **Status:** move to **"in progress"** when implementation starts; **"complete"** after
   `verification-before-completion` passes.
6. **Task URL format:** `https://app.clickup.com/t/<task-id>`.

**Optional (solo — do when it adds value, skip when it does not):**
- The **"in review"** status, opening a PR, and pasting the PR/commit URL into the task.
- Milestone-summary comments on the parent task / linked ClickUp Doc.

## Context Management
- **Primary navigation:** `grep` / `glob` + reading files. Fastest at this codebase size.
- **Graphify:** shelved until after 2026-09-21. `graphify-out/` is stale and not maintained
  during the sprint — do not rely on it. The `graphify-resumption` skill is optional if a
  session needs orientation; otherwise read `progress-tracker.md` "Session Restoration Point".

## Prohibited Actions
- **No Multi-tasking:** do not fix unrelated bugs while implementing a task. File a separate task.
- **No Speculative Build-out:** no features, abstractions, or configurability beyond the
  spec's stated scope (see `code-standards.md` "Change Discipline").
- **No Silent Failures:** no empty `catch {}`, no swallowed errors. Every camera API and
  storage transaction handles its failure paths explicitly (log + user-visible feedback).
- **No Magic Strings:** CSS class names, IndexedDB store names, screen/route ids and status
  values come from constants or enums.
- **No Generated-Artifact Confusion:** `src/poc/` is the graded deliverable and the single
  source of truth. `graphify-out/` and any build output are artifacts — never hand-edit them.
