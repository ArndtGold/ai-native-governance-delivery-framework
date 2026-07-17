# Task and Test Plan: Single-Install OpenCode Activation

Status: approved
Gate: TP
Gate approval: `Approval: TP` accepted on 2026-07-17 after selected-run, same-gate, revision and durable-artefact revalidation.
Revision: 2
Date: 2026-07-17
Owner: agent

## Scope

Implement the approved Structured Slice using the existing OpenCode plugin, installer, scaffold,
generation and test owners. No host installation or VCS action is part of the plan.

| task_id | Task | Owner | Acceptance criteria | Verification |
|---|---|---|---|---|
| OSA-01 | Add one pure repository-activation helper that distinguishes valid durable control, invalid/missing control and legacy local compatibility. | `create-agdf/lib/` | No `.opencode/**` file is required for active state; invalid control fails closed. | Focused helper fixtures through lifecycle/OpenCode tests. |
| OSA-02 | Refactor `opencode-plugin.js` to consume the helper for environment state and early canonical system guidance. | `create-agdf/opencode-plugin.js` | Active repositories receive routing before compaction; inactive ones only receive orientation; no gate authority changes. | Hook fixtures for system transform, compaction and shell environment. |
| OSA-03 | Extend OpenCode status evaluation and human/JSON presentation with installation, activation, legacy compatibility and session separation. | `create-agdf/lib/installers/opencode.js` | Status is additive, truthful and gives one actionable next step per state. | Focused status fixtures, including source/package version skew. |
| OSA-04 | Refactor `opencode-repo` planning into non-duplicating activation/migration behavior. | `create-agdf/lib/scaffold/plan.js` and presentation owners | New activation does not copy shared runtime assets; existing owned legacy assets are preserved; user-owned files remain untouched. | Scaffold plan and lifecycle migration fixtures. |
| OSA-05 | Synchronize canonical generated assets, documentation and integrity assertions to the new model. | canonical metadata, sync script, docs and tests | Global `agdf-global-*` boundary is accurately documented; no second policy owner appears. | `sync-package-assets`, routing, Runtime Integrity positive/negative checks. |
| OSA-06 | Run focused and aggregate verification, record evidence and preserve live-host limits for UAT. | test owners and control artefacts | All OSA-01 through OSA-05 assertions pass; no live OpenCode behavior is claimed without observation. | `test:lifecycle`, focused OpenCode tests, package smoke, Runtime Integrity, doctor and `git diff --check`. |

## Dependencies And Order

OSA-01 precedes OSA-02 through OSA-04. OSA-02 through OSA-04 may proceed after the helper is
covered. OSA-05 follows the canonical source changes. OSA-06 runs after all production and generated
changes. Any scope expansion to global skill renaming, deletion of local assets, gate authority or
an unproven OpenCode precedence rule stops and returns to design review.

## Regression And Safety Constraints

- Existing global `agdf-global-*` skills and legacy local `agdf-*` skills must not be renamed or
  silently removed.
- Explicit `permission.question: deny` remains unchanged and exact-text fallback remains canonical.
- All file removal must be ownership-proven and explicit; default migration is non-destructive.
- Runtime/installed/generated version differences remain visible in status rather than normalized away.
- Repository-side hook tests do not substitute for authenticated live OpenCode evidence.

## Evidence And Review Plan

- Pre-implementation Brownfield Analysis validates the helper/module seam, OpenCode hook types,
  scaffold ownership and test fixtures before coding.
- CD+Tests records task-level implementation and verification evidence.
- Task Plan Review, Clean Implementation Review and Code Review run before QA.
- QA evaluates evidence and UAT distinguishes live OpenCode observation from repository conformance.

## Next Step

Perform the pre-implementation Brownfield Analysis before any code change.
