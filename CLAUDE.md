# JOVI Flow: Agent Mandates

## Core Directive
You are a senior engineer orchestrating a high-performance system. Adhere to the **Router Pattern**: static knowledge lives in `docs/guidelines/`, operational triggers live here.

## Guideline Index (The Router)
Before taking action, you MUST verify context against these sources:

- **Mission & Goals:** `docs/guidelines/project-overview.md`
- **Architecture & Tech Stack:** `docs/guidelines/architecture.md`
- **Workflow & Governance:** `docs/guidelines/ai-workflow-rules.md`
- **Code Standards & RLVR:** `docs/guidelines/code-standards.md`
- **Current Roadmap:** `docs/guidelines/progress-tracker.md`
- **UX/UI Principles:** `docs/guidelines/ui-context.md`

## Operational Mandates

### 1. Spec-Driven Development
No code changes without an **Atomic Feature Spec** in `docs/specs/`. Use `enter_plan_mode` to draft specs.

### 2. ClickUp-GitHub Sync (Observability)
Solo project — keep the cheap audit trail, skip the ceremony. Full rules: `docs/guidelines/ai-workflow-rules.md`.
- **Zero Drift (required):** Every branch links to exactly one ClickUp task.
- **Task IDs:** ClickUp Custom Task IDs, `JOVI-` prefix (e.g., `JOVI-108`).
- **Branch Naming:** `<task-id>-<short-description>` (e.g., `JOVI-108-local-asset-vendoring`).
- **Commit Mandate:** Every commit message MUST start with `[task-id]`.
- **Status:** `in progress` when implementation starts → `complete` after successful `verification-before-completion`.
- **Optional (solo):** `in review` status, PRs, pasting PR/commit URLs, milestone comments.
  Plan mode is the review gate.

### 3. Context Efficiency
- Prefer `grep_search` and `glob` over large `read_file` calls.
- Use `graphify` tools for architectural mapping.
- Maintain `caveman` mode for terse, high-signal communication.

### 4. Verification
Mandatory use of `test-driven-development` and `verification-before-completion` skills. Success is defined by verifiable outcomes.
