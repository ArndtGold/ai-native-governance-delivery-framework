# Task And Test Plan

## Document Control

- work item: `agdf-onboarding-fit-default-prompt`
- derived from: `.agdf/control/artefacts/agdf-onboarding-fit-default-prompt/SD.md`
- gate approval: `Approval: TP` pending post-artefact confirmation

## 1. Implementation Tasks

| Task ID | Task | Acceptance mapping | Evidence |
|---|---|---|---|
| OFP-01 | Update the canonical Codex `defaultPrompt` array in `plugin/meta/agdf-plugin.definition.json` with the approved suitability-assessment prompt at position 1. | PRD-01, PRD-02, PRD-03; AC-01, AC-02, AC-03 | Canonical definition diff |
| OFP-02 | Synchronize the Codex manifest and generated package metadata through `npm --prefix create-agdf run sync-package-assets`. | PRD-04, PRD-05; AC-04, AC-05 | Sync output and generated diff |
| OFP-03 | Confirm no unintended changes to skills, hooks, runtime contract, gates or evaluators. | PRD-03; AC-03 | Diff inspection |

## 2. Verification Tasks

| Task ID | Verification | Acceptance mapping | Evidence |
|---|---|---|---|
| OFP-04 | Run `node plugin/scripts/check-runtime-integrity.mjs`. | PRD-05, PRD-06; AC-05 | Command result |
| OFP-05 | Run `npm --prefix agdf run smoke-test`. | PRD-06; AC-06 | Command result |
| OFP-06 | Run `npm --prefix create-agdf run smoke-test`. | PRD-06; AC-06 | Command result |
| OFP-07 | Run `npx --yes @agdf/cli@latest doctor --json`. | PRD-06; AC-07 | JSON result with zero findings |
| OFP-08 | Run `git diff --check` and inspect the final diff for scope compliance. | PRD-05; AC-04, AC-05 | Clean diff-check and review note |

## 3. Implementation Order

1. OFP-01: update canonical metadata.
2. OFP-02: synchronize generated surfaces.
3. OFP-03: inspect scope and ownership.
4. OFP-04 through OFP-08: execute verification in the listed order.

## 4. Test And Risk Coverage

| Risk | Covered by |
|---|---|
| First prompt has wrong order or wording | OFP-01, OFP-03 |
| Codex manifest or generated package drift | OFP-02, OFP-04 |
| Existing package behavior regresses | OFP-05, OFP-06 |
| Control-state/backlog inconsistency | OFP-07 |
| Unintended file or formatting changes | OFP-03, OFP-08 |

## 5. Boundaries

- No new tests are required for gate semantics because no gate behavior changes.
- No implementation may begin until valid post-artefact `Approval: TP` is recorded and pre-implementation Brownfield Analysis is complete.
- Any failing runtime-integrity, smoke, doctor or diff check requires revise/block rather than silent acceptance.

## 6. Completion Evidence

The task is complete only when OFP-01 through OFP-08 have traceable evidence, the final diff remains within the approved metadata propagation boundary, and the required review/QA gates are completed.

## 7. Gate Decision

This Task And Test Plan is ready for user confirmation. After valid post-artefact `Approval: TP`, perform pre-implementation Brownfield Analysis, then CD+Tests.
