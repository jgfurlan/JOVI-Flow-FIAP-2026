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

### 2. Mandatory Linear-GitHub Sync (Professional Observability)
Every task is a professional deliverable. Maintain a perfect audit trail for external visibility:
- **Zero Drift:** Every GitHub branch MUST link to a Linear issue.
- **Branch Naming:** `<issue-id>-<short-description>` (e.g., `ABC-12-feat-x`).
- **Commit Mandate:** Every commit message MUST start with `[issue-id]`.
- **State Automation:** 
    - Move to **"In Progress"** when research ends and implementation starts.
    - Move to **"In Review"** when PR is ready or verification starts.
    - Move to **"Done"** only after successful `verification-before-completion`.
- **Linkage:** Paste the GitHub PR/Commit URL into the Linear issue comment upon completion.

### 3. Context Efficiency
- Prefer `grep_search` and `glob` over large `read_file` calls.
- Use `graphify` tools for architectural mapping.
- Maintain `caveman` mode for terse, high-signal communication.

### 4. Verification
Mandatory use of `test-driven-development` and `verification-before-completion` skills. Success is defined by verifiable outcomes.
