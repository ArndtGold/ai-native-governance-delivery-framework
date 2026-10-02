# UR: Truthful quick-task closeout status

Status: draft
Gate: UR
Gate approval: open
Date: 2026-10-02
Owner: Repository owner

## 1. Problem

Two live runs on 2026-10-02 (run `add-subtract`, Claude Code, CLI binding and MCP) completed a
`quick_task` through OR-lite, but the final status still signalled open work:

- The status card appended a Quality Readiness projection reporting "revise" with plan coverage,
  solution integrity and QA decision "evidence missing", next to status "pass". A `quick_task` has no
  TP Review, Clean Implementation Review or QA gate, so these rows can never be satisfied. The
  projection's "next action" line also showed the raw English `next_allowed_action` in a German card.
- After the OR-lite closeout, `status_card.next_skill` stayed `release-or`. A `continue_delivery`
  dispatch therefore returned a `skill_continuation` for `release-or` although the OR is already done.

## 2. Goal

A completed compact run reports exactly what is true: done, no pending quality verdict, no further
skill to run. The Quality Readiness projection appears only where its four dimensions apply, and all
of its lines are localized.

## 3. Scope

- No Quality Readiness projection for runs routed `quick_task` (Compact Delivery), whose route has no
  TP Review, Clean Implementation Review or QA gate.
- Where the projection still renders, its next-action line uses the localized operational value, the
  same value the status card shows, instead of the raw English free text.
- When the OR artefact is `done`, `status_card.next_skill` is `none`, so `continue_delivery` returns
  the terminal status card instead of a `release-or` continuation.
- Regression tests for these three behaviours.

## 4. Non-Goals

- No change to the projection for structured routes, to `pass | revise | block` semantics, gate order
  or `qa-gate` authority.
- No change to the pending-OR path: after `Approval: UAT`, `release-or` remains the next skill.
- No change to the terminal stop at Quick Task Execution, to `init` availability or to the
  CONTEXT_GRAPH example node (separate findings).

## 5. Acceptance Signals

- A completed `quick_task` run's status card shows no Quality Readiness block.
- A structured run with review artefacts still shows the projection, with a localized next action.
- `continue_delivery` on a run whose OR is `done` returns `control_result` with the status card, and
  `next_skill` is `none`.
- Existing gate-check, skill-dispatch and localization tests stay green.

## 6. Existing Source Of Truth

- `packages/core/lib/control-evaluation/gate-check.js` (`nextSkillByGate`,
  `qualityReadinessForRunState`, `printGateCheckStatusCard`).
- `packages/core/lib/interaction-presentation.js` (`buildQualityReadiness`, operational value
  localization).
- `packages/core/lib/skill-dispatch/service.js` (`next_skill` routing for `continue_delivery`).
- Runtime contract `quality.md` §Quality Readiness Projection.

## 7. Risks And Unknowns

- `quality.md` describes the projection generically ("after CD+Tests"). Brownfield Review must confirm
  that suppressing it for `quick_task` matches the contract, or whether `verified_change` needs the
  same treatment.
- `next_skill` feeds `gate_route` in dispatch results; consumers relying on `release-or` at OR need
  checking.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

## AGDF Approval Summary (de; source=en)
- Problem: Ein abgeschlossener Quick Task zeigt eine Quality-Readiness-Zeile „Überarbeitung erforderlich“ neben „bestanden“, mit englischer nächster Aktion; außerdem verweist next_skill nach erledigtem OR noch auf release-or.
- Ziel: Ein abgeschlossener kompakter Lauf meldet wahrheitsgemäß „fertig“, ohne offenes Qualitätsurteil und ohne weiteren Skill.
- Umfang: Keine Quality-Readiness-Projektion für quick_task, lokalisierte nächste Aktion in der Projektion, next_skill none bei erledigtem OR, dazu Regressionstests.
