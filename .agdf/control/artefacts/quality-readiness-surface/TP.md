# TP: Quality Readiness Surface

Status: approved
Gate: TP
Gate approval: `Approval: TP`
Date: 2026-07-15
Owner: agent

## 1. Delivery Scope

Implement the approved derived Quality Readiness projection using the existing review, QA,
aggregation and presentation owners. No task may introduce a fifth review, a second QA decision,
or a new persistence model.

## 2. Tasks

| task_id | Task | Owner paths | Acceptance criteria | Evidence |
|---|---|---|---|---|
| QRS-01 | Define the canonical derived projection contract: four unique dimensions, canonical owner mapping, overall status, decisive reason, next action and decision owner. | `create-agdf/lib/interaction-presentation.js`; `create-agdf/lib/control-state/aggregate.js` | Projection is pure/derived, has exactly four rows and cannot carry approval authority. | Focused unit/presentation tests including duplicate-row and authority-negative cases. |
| QRS-02 | Add the compact primary and detail presentation rules to the Runtime Contract without creating a second Run Status Card or gate model. | `plugin/meta/agdf-runtime-contract.md` | Localized compact projection, detail-expansion conditions and authority boundary are explicit. | Runtime-integrity checks and negative drift coverage. |
| QRS-03 | Align skill routing and discovery copy so the three reviews are evidence dimensions and `qa-gate` is the single decision owner. | `plugin/meta/agdf-agent-router.md`; `plugin/meta/agdf-plugin.definition.json`; `pages/src/data/skills.ts`; relevant `help.md` files | Each role has one plain-language question; visible repetitive boundary text is reduced without losing normative rules. | Data/render checks and generated-asset synchronization. |
| QRS-04 | Render the projection in the existing human-facing interaction/compact-status path and retain report references for non-pass detail. | Existing interaction and CLI presentation owners only | `pass`, `revise`, `block`, missing evidence and conflicting evidence render deterministically; no full report body floods chat. | Focused fixtures for each state and cross-surface compact output. |
| QRS-05 | Add regression coverage for canonical aggregation, owner uniqueness, decisive-reason ordering, no-authority behavior and machine compatibility. | Existing presentation, runtime-integrity and control-state test suites | All acceptance scenarios pass; a projection cannot make QA pass or accept `Approval: QA`. | Focused tests, runtime integrity, control-state tests. |
| QRS-06 | Synchronize package assets and run targeted plus aggregate validation. | `create-agdf/scripts/sync-package-assets.js`; existing smoke/routing scripts | Generated surfaces match canonical sources; no unrelated diffs. | Sync, routing, runtime integrity, relevant unit tests, package smoke and `git diff --check`. |

## 3. Test Matrix

| Scenario | Expected result |
|---|---|
| All evidence passes and QA passes | One `pass` projection; QA Gate remains the decision owner. |
| TP coverage is partial | Overall `revise`; Plan coverage is decisive; one remediation action is visible. |
| Clean or code review blocks | Overall `block`; affected dimension and evidence source are expanded. |
| QA evidence missing | Not `pass`; the next permissible action identifies the missing review/QA evidence. |
| Multiple equal-severity findings | Decisive reason uses canonical source order. |
| Projection receives approval-like text | It remains presentation only and cannot advance an AGDF gate. |

## 4. Out Of Scope

- Changing the four reports' required evidence or decisions.
- Rewriting review workflows into one combined skill.
- New dashboards, persistence, host-native approval controls or approval formulas.
- Broad Pages redesign beyond the existing skill discovery copy needed for role clarity.

## 5. Completion Criteria

- All QRS tasks have implementation and test evidence.
- Brownfield Analysis passes before CD+Tests.
- Task Plan Review, Clean Implementation Review, Code Review and QA Gate run in their existing
  roles after CD+Tests.
- Any incomplete task remains explicitly visible as `partially_done` or `not_done`.

## 6. Next Step

Review this TP and approve only with:

`Approval: TP`
