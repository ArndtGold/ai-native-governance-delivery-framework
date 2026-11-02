# UR: Reduce AGDF's Own Framework-Maintenance Overhead

Status: approved
Gate: UR
Gate approval: `Approval: UR` provided on 2026-07-13
Date: 2026-07-13
Owner: agent

## 1. Problem

A significant share of `MASTER_BACKLOG.md`'s "Completed" work is AGDF maintaining itself rather than
delivering external product value: plugin-manifest-drift fixes, Codex/Claude/Copilot/OpenCode
cross-surface parity, backlog-vocabulary unification. This overhead is currently invisible as a tracked
metric and is remediated reactively via full gated Structured Delivery runs after the fact, rather than
prevented mechanically before it reaches the backlog at all.

This session provides a fresh, concrete data point: for run `agdf-run-scoped-control-state`'s
UAT-preparation phase, two real but small defects (~15 lines of code across 2 files — a Windows
`fsync` platform guard, a CLI crash on ambiguous run selection) triggered two full governance cycles
(Code Review, Clean Implementation Review, Task Plan Review, a QA-gate delta decision, a renewed
`Approval: QA`, an Orchestration Report, and a Delivery Closeout) touching seven durable artefact files.
The ceremony volume was a multiple of the code diff itself.

Important nuance: not all of that ceremony was waste. It caught two real bugs before UAT acceptance,
which is the gate discipline working as intended. The problem is not that governance exists — it is that
there is no mechanism to scale governance depth to the size and mechanical-checkability of the change, and
no visibility into how much of the backlog is self-maintenance versus external delivery.

## 2. Goal

Make AGDF's own governance overhead proportional and visible: mechanically checkable drift (manifest,
vocabulary, schema consistency) should be prevented automatically before it becomes a backlog item, and
the backlog should make the framework-maintenance-vs-external-delivery ratio visible rather than
anecdotal.

## 3. User Outcomes

- Mechanical drift (plugin-manifest fields, canonical vocabulary, generated-surface consistency) is
  caught by an automated check before it needs a gated Structured Delivery run to fix.
- Non-canonical surface projections (Copilot, OpenCode, generated Codex copies) are generated from the
  canonical `agdf-plugin.definition.json` rather than manually maintained per fix.
- `MASTER_BACKLOG.md` distinguishes `framework-maintenance` scope from `external-delivery` scope so a
  maintainer or adopting team can see the ratio at a glance instead of inferring it from reading every row.
- The existing "Non-Normative Trivial Change Boundary" is reassessed against real cases (including this
  session's two fixes) to determine whether narrowly-scoped, root-cause-clear code fixes should qualify
  for a lighter path than the full CR/Clean-Review/TP-Review/QA-gate/OR chain.

## 4. Required Product Boundaries

- Identify which currently-manual drift checks (manifest fields, backlog vocabulary, generated-surface
  parity) can be expressed as deterministic `doctor`/CI checks that run before a defect reaches the
  backlog.
- Add a `scope` distinction (or equivalent visible field) to `MASTER_BACKLOG.md` entries so
  framework-maintenance and external-delivery work are distinguishable without reading full outcome text.
- Do not remove or weaken governance for genuine product-semantic, architecture, policy, persistence, or
  security-relevant changes — this UR only targets mechanically-checkable or narrowly-scoped
  root-cause-clear defect fixes.
- Any change to the Trivial Change Boundary must stay an explicit, fail-closed path/criteria list, not a
  prose judgment call — consistent with why the original boundary (`CG-DOCUMENTATION-CEREMONY-BOUNDARY`)
  was designed that way.

## 5. Non-Goals

- Reducing the number of supported agent surfaces (Codex/Claude/Copilot/OpenCode).
- Any weakening of gate discipline, exact approval formulas, or QA/UAT requirements for genuine product
  changes.
- A full rewrite of the Runtime Contract's gate model — this is a scoped addition/refinement, not a
  redesign.

## 6. Acceptance Signals

- At least one class of previously-manual drift check (e.g. plugin-manifest field consistency) runs as
  an automated `doctor`/CI check instead of requiring a dedicated gated run to catch after the fact.
- `MASTER_BACKLOG.md` entries visibly distinguish framework-maintenance from external-delivery scope.
- The Trivial Change Boundary decision (widen, keep, or explicitly reject widening) is documented with a
  concrete rationale referencing at least one real historical case.
- No regression in existing drift/parity/runtime-integrity checks.

## 7. Existing Sources Of Truth And Brownfield Touchpoints

- `plugin/meta/agdf-runtime-contract.md` (Non-Normative Trivial Change Boundary, Relevant Run definition).
- `.agdf/control/MASTER_BACKLOG.md` (template Rules section, canonical status/artefact vocabulary).
- `create-agdf/bin/create-agdf.js` (`doctor` finding logic, e.g. `AGDF_LEGACY_PROJECTION_DRIFT`,
  `AGDF_BACKLOG_POINTER_EMPTY`, `AGDF_BACKLOG_ARTEFACT_LABEL_UNKNOWN`).
- `plugin/meta/agdf-plugin.definition.json` (canonical plugin definition, source for generated surfaces).
- `create-agdf/scripts/sync-package-assets.js` (existing generation/propagation mechanism).
- `.agdf/control/CONTEXT_GRAPH.md` node `CG-DOCUMENTATION-CEREMONY-BOUNDARY` (prior related decision).
- `.github/workflows/agdf-guardrails.yml` (CI enforcement surface for any new automated check).

## 8. Risks And Open Questions

- Automating manifest/vocabulary drift detection could itself introduce a second source of truth if not
  carefully scoped to read from the canonical definition only — Brownfield Review must confirm single
  ownership.
- A `scope` field on `MASTER_BACKLOG.md` risks becoming another vocabulary drift surface unless it reuses
  the existing canonical-vocabulary enforcement mechanism.
- Widening the Trivial Change Boundary risks the same scope-creep-loophole risk raised and rejected during
  the original boundary's Brownfield Review/PRD — any widening must stay an explicit allow-list, not a
  judgment call, and Brownfield Review must weigh this explicitly.
- It is not yet clear whether today's two defect fixes would have genuinely qualified for a lighter path
  even under a widened boundary (both touched executable code, which the current boundary explicitly
  excludes) — Brownfield Review must assess this concretely rather than assume it.

## 9. Next Step

Review this UR and approve only with:

`Approval: UR`
