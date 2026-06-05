# AI Workflow Rules: Execution Governance

## Core Mandates
All agents must focus exclusively on a singular system boundary or isolated subsystem task at a time.

## Methodology: Spec-Driven Development
To prevent AI drift and code contradictions, every alteration requires an isolated **Atomic Feature Spec** in `docs/superpowers/specs/`.

### Atomic Spec Format:
1. **Isolated Goal:** 1-2 sentence deterministic output definition.
2. **Design Decisions:** Component boundaries, UI mechanics, and layout properties.
3. **Step-by-Step Implementation Map:** Layer-by-layer technical checklist.
4. **Verification Array:** Pass/fail compilation and testing checklist.

## Session Governance (Superpowers)
REQUIRED: Use the `superpowers` framework for all implementation tasks.
- **Plan Mode:** Propose design specs and obtain approval before editing code.
- **Verification:** Run manual/automated tests before claiming success.

## GitLab Synchronization (Mandatory)
GitLab is the "Source of Truth" for project state. GitHub is the mirror.

1. **Issue Mapping:** Every Git branch MUST correspond to exactly one GitLab issue.
2. **Branch Naming:** Format: `jovi-<issue-id>-<short-description>` (e.g., `jovi-38-bento-gallery`).
3. **Commit Messages:** Include the GitLab issue ID in every commit message (e.g., `feat: [#38] implement asymmetric bento grid`).
4. **State Transition:** 
   - When work starts: Move GitLab issue to **"In Progress"** / assign to owner.
   - When PR is opened: Move GitLab issue to **"In Review"** and link the PR URL.
   - When merged: Move GitLab issue to **"Closed"**.

## Context Management (Graphify)
- **Session Resumption:** Use the `graphify-resumption` skill. Read the graph report and query the graph before blind searching.
- **Knowledge Sync:** Run `graphify update .` after merging any changes to ensure the "Trust Anchor" remains accurate.

## Prohibited Actions
- **No Multi-tasking:** Do not attempt to fix unrelated bugs while implementing a feature.
- **No Silent Failures:** Do not use `pass` or empty catch blocks. Always log errors or show user alerts.
