# Task Plan: Fail-Closed Verified Change Path

## Plan Meta

- workstream: `verified-change-path`
- derived_from: `PRD.md`, `SD.md`
- mode: `structured_delivery`
- implementation_permission: granted via `Approval: TP` on 2026-07-14

## Tasks

| Task ID | Change | Acceptance evidence |
|---|---|---|
| VCP-01 | Add `verified_change` and its complete compact lifecycle to the canonical Runtime Contract, including eligibility, prohibited impacts, baseline semantics, mini-closeout and escalation rules. | Contract names the mode once, preserves existing modes and canonical transition ownership, and states fail-closed behavior. |
| VCP-02 | Add the `VERIFIED_CHANGE.md` control artefact template and register it with control/package file manifests and generated-surface propagation. | Template has the required bounded fields/sections; generated package/control copies contain it. |
| VCP-03 | Extend run and Brownfield templates with the new mode and the Verified Change execution artefact vocabulary without weakening existing fields. | Canonical and generated templates parse/render with all legacy values intact. |
| VCP-04 | Implement one shared record parser/evaluator in `create-agdf/bin/create-agdf.js` for required fields, canonical-owner count, normalized path lists, prohibited impacts, propagation/validation requirements and execution evidence. | Focused unit/fixture tests show valid record acceptance and every missing/malformed required condition fails closed. |
| VCP-05 | Implement baseline capture/validation semantics: pre-existing unrelated tracked/untracked paths are recorded; declared candidate paths must be clean at baseline; new paths after baseline are limited to declared paths plus permitted control record/pointer files. | Fixture tests demonstrate unrelated dirty preservation, dirty candidate rejection and new unlisted-path rejection. |
| VCP-06 | Extend `doctor --json` with structured Verified Change findings and extend `gate-check --json` transition output for draft, eligible, executed and escalated records. | CLI fixtures assert current gate, allowed, forbidden, blocking reason, next action and escalation target for every state. |
| VCP-07 | Integrate the new mode into parser vocabulary, internal artefact handling, next-skill mapping and status-card mode reporting while retaining legacy parse/transition behavior. | Existing quick-task/structured and legacy-heading fixtures remain green; new mode fixture is recognized. |
| VCP-08 | Add deterministic escalation: invalid or disallowed record moves only to its declared `structured_slice` or `structured_delivery` target, never directly to implementation. | Tests assert both targets and forbidden implementation output. |
| VCP-09 | Update agent-router and relevant governance guidance to select Verified Change only after approved UR plus Brownfield evidence and to reference the canonical contract rather than duplicate transitions. | Runtime-integrity assertions and targeted guidance tests pass. |
| VCP-10 | Update runtime-integrity checks for the canonical contract additions, required template presence and generated-surface propagation without encoding a second full policy model. | Runtime-integrity passes and new negative fixtures detect absent required anchors/template. |
| VCP-11 | Update `CG-DOCUMENTATION-CEREMONY-BOUNDARY` with final contract, baseline safety rule, escalation behavior and worked-example linkage. | Context Graph node reflects implemented contract; reconciliation is visible in review/QA evidence. |
| VCP-12 | Synchronize package assets and run full focused validation. | `control-state-test`, relevant CLI fixtures, runtime integrity, package smoke, doctor and diff checks pass. |

## Traceability

| Requirement | Tasks |
|---|---|
| PRD-01: distinct mode and lifecycle | VCP-01, VCP-06, VCP-07 |
| PRD-02: fail-closed eligibility | VCP-04, VCP-05, VCP-08 |
| PRD-03: compact durable record | VCP-02, VCP-04 |
| PRD-04: deterministic enforcement | VCP-05, VCP-06, VCP-07 |
| PRD-05: compatibility | VCP-03, VCP-07, VCP-12 |
| PRD-06: guidance and propagation | VCP-02, VCP-09, VCP-10, VCP-12 |
| PRD-07: regression evidence | VCP-04 through VCP-08, VCP-10, VCP-12 |

## Test Plan

1. Add record parser/evaluator fixtures for valid, missing-owner, multi-owner, invalid-path, missing-check, missing-propagation, prohibited-impact and failed-evidence cases.
2. Add baseline fixtures for unrelated pre-existing tracked/untracked work, dirty candidate paths and newly introduced unlisted paths.
3. Add gate-transition fixtures for record states `draft`, `eligible`, `executed` and `escalated`, including both escalation targets.
4. Retain and run legacy heading, Quick Task and structured-delivery fixtures.
5. Verify canonical and generated Runtime Contract/template copies after sync.
6. Run `node create-agdf/scripts/control-state-test.js`, focused CLI tests, `node plugin/scripts/check-runtime-integrity.mjs`, `npm --prefix create-agdf run smoke-test`, `node create-agdf/bin/create-agdf.js doctor --json` and `git diff --check`.

## Guardrails

- No implementation starts from an absent, draft, invalid or ambiguous record.
- No user-visible size heuristic, file-count shortcut or “documentation only” exemption is introduced.
- No change to existing approval names or bypass of UR/Brownfield Review.
- No new public CLI command; extend existing `doctor` and `gate-check` only.
- No commit, push, pull request or release in this plan.

## Approval Required

Approve this Task Plan to permit pre-implementation Brownfield Analysis and CD+Tests: `Approval: TP`.
