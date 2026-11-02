# Brownfield Analysis: Complete Approval Orientation

Status: pass
Mode: pre_implementation_analysis
Date: 2026-07-15
Owner: AGDF

## Brownfield Analysis

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `none`
- artefact: `.agdf/control/artefacts/approval-orientation-completeness/BROWNFIELD_ANALYSIS.md`
- scope: Implement AOC-01 through AOC-08 by extending the existing interaction
  presentation helper, gate-check evaluator/presentation bridge, Runtime
  Contract, canonical gate-check skill, integrity checks and generated assets.
- evidence: `buildStatusCard` and `buildHumanPresentation` already derive the
  required state and human identity; `interaction-presentation.js` already owns
  immutable non-authorizing interaction values, artefact refs, locale
  resolution and Quality Readiness; `printGateCheckStatusCard` owns readable
  status projection; Runtime Contract and `gate-check` own approval-time
  composition; existing interaction/control-state/integrity tests cover all
  relevant extension points.
- transparency: CD+Tests is allowed because every approved task maps to an
  existing owner and regression harness. No new adapter, renderer, evaluator,
  persistence model or locale registry is needed.
- missing_evidence: Live host layout remains unavailable and is reserved for
  UAT. Repository implementation may prove semantic ordering and generated
  guidance, not host-owned visual placement.
- current_coverage: `partially_done`. Status and transition data are already
  available from one evaluated run, but no immutable combined snapshot or
  canonical two-card approval requirement exists.
- reuse_strategy: `extend`. Add one pure helper beside existing presentation
  helpers, attach its output non-enumerably to the existing status card, update
  the canonical contract/skill, and extend existing fixtures/integrity checks.
- risks: A helper that evaluates readiness would duplicate gate authority; an
  enumerable snapshot could alter JSON compatibility; copied localized copy
  would create drift; full dashboard fields would violate the approved compact
  boundary. The TP tests explicitly reject each risk.
- context_graph_impact: `none`; existing decision-surface ownership is being
  refined without a new architectural node.
- required_next_step: Implement AOC-01 through AOC-07, synchronize generated
  assets, execute AOC-08 verification and persist CD+Tests evidence.

## Exact Owner Map

| Task | Existing owner | Extension point |
|---|---|---|
| AOC-01 | `create-agdf/lib/interaction-presentation.js` | Pure immutable helper beside existing interaction builders. |
| AOC-02 | `buildStatusCard` / `buildHumanPresentation` in `create-agdf/bin/create-agdf.js` | Non-enumerable derived snapshot after canonical evaluation. |
| AOC-03 | Runtime Contract and canonical `gate-check` | Replace one-card-only rule with fixed two-card sequence. |
| AOC-04 | `agdf-interaction-locales.json` and locale helpers | Reuse existing status/primary/interaction keys. |
| AOC-05 | `interaction-presentation-test.js` | Table-driven gate/outcome/snapshot tests. |
| AOC-06 | `control-state-test.js` | Ready/non-ready and compatibility fixtures. |
| AOC-07 | sync script and Runtime Integrity | Canonical/generated alignment and negative drift checks. |
| AOC-08 | existing package/Pages/doctor checks | Full regression and evidence boundary. |

## Parallel-Structure Guard

The snapshot may compose evaluated data only. It must not read files, choose a
run, determine readiness, normalize gate authority, store approval or own host
rendering. Violating this guard changes the Brownfield decision to `block`.
