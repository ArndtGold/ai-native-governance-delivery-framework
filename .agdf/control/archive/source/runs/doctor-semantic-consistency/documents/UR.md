# UR: Doctor Semantic Consistency

Status: approved
Gate: UR
Gate approval: `Approval: UR`
Date: 2026-07-09
Owner: agent

## 1. Problem

AGDF can currently report a clean `doctor` result while `gate-check` later finds semantic inconsistencies in the same durable control state.

The recent cleanup exposed a concrete example: the QA artefact existed and was linked, but the artefact table used `approved` where the gate-check parser expected `passed` or `pass`. That produced a false `missing_durable_qa_artefact` blocker even though the human-readable state looked complete.

## 2. Goal

Make AGDF detect obvious control-state semantic inconsistencies earlier and more clearly, especially mismatches between:

- approvals
- durable artefact rows
- gate-specific status vocabulary
- run status card
- delivery map relationships
- source/workspace evidence

## 3. Scope

In scope for this first slice:

- Improve `doctor` or shared validation so it catches gate/artefact status mismatches before `gate-check` fails later.
- Clarify or normalize QA status handling for durable artefacts.
- Add focused tests for the status mismatch that caused the false QA blocker.
- Keep source-of-truth ownership in the existing CLI/control validation code.
- Preserve current gate discipline: `doctor` may detect inconsistencies, but `gate-check` remains the operative permission decision.

## 4. Non-Goals

- No redesign of the full AGDF gate model.
- No new control-state storage format.
- No broad rewrite of `gate-check`.
- No automatic migration of all historical artefacts.
- No release, publish, tag, push or pull request.

## 5. Acceptance Signals

- A fixture with QA approval plus a QA artefact row using the wrong semantic status is reported by `doctor` or an equivalent validation path with a clear finding.
- A valid QA-passed/UAT-ready fixture still passes.
- `gate-check --json` and `gate-check --status-card` continue to work for the current repo state.
- Runtime Integrity and `create-agdf` smoke tests pass.

## 6. Existing Source Of Truth

- `create-agdf/bin/create-agdf.js`
- `create-agdf/scripts/smoke-test.js`
- `plugin/meta/agdf-runtime-contract.md`
- `.agdf/control/AGDF_RUN.md`
- `.agdf/control/MASTER_BACKLOG.md`

## 7. Risks And Unknowns

- `doctor` might become too strict and block harmless historical language.
- Status normalization could hide meaningful distinctions if applied too broadly.
- The right implementation boundary may be shared parser logic rather than a `doctor`-only check.
- Brownfield Review should confirm whether this is a quick task or a structured slice.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`
