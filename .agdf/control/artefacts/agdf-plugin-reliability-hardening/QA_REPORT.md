# QA Report: Dual-Layout Runtime-Integrity Validation

Status: pass
Decision owner: qa-gate
Date: 2026-07-16
Owner: agent
QA approval: `Approval: QA` provided in session on 2026-07-16

## QA Gate

- decision: pass
- evidence: approved TP; pre-implementation Brownfield Analysis pass; CD+Tests; TP Review 7/7
  fully done; Clean Implementation Review pass; Code Review pass; focused and aggregate automated
  validation; package dry-runs; syntax and whitespace checks
- missing_evidence: none for the QA decision
- risks: the already-installed immutable 0.9.0 cache still contains its published script until a
  later reinstall/release path deploys this source change; no cache mutation is part of this run
- required_next_step: request deliberate `Approval: UAT`; release remains separately gated
- impact_codes: none

## Quality Readiness Evidence

| Dimension | Result | Evidence |
|---|---|---|
| Plan coverage | pass | 7/7 AIRH tasks fully done |
| Solution integrity | pass | One canonical validator; no fallback, shim or parallel fixture owner |
| Code quality | pass | No correctness, security, compatibility or maintainability finding remains |
| QA decision | pass | qa-gate; all required evidence is present |

## Acceptance Criteria

- AC-01 source mode: pass
- AC-02 installed mode: pass
- AC-03 missing installed invariant: pass, rejected as expected
- AC-04 partial root: pass, stable fail-closed diagnostic without filesystem stack trace
- AC-05 existing negative suite: pass
- AC-06 aggregate/package/diff validation: pass
- AC-07 CI/release reachability: pass through the existing aggregate smoke invocation

## Context Graph

- context_graph_impact: link_only
- context_graph_refs: `CG-AGDF-RUN-SCOPED-CONTROL-STATE`;
  `.agdf/control/artefacts/agdf-plugin-reliability-hardening/BROWNFIELD_REVIEW.md`
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: The selected run links the implementation to the existing cross-platform
  and regression-evidence invariant; no new node or SoT owner is needed.

## Approval

Exact `Approval: QA` was provided on 2026-07-16 after same-run/same-gate revalidation. Prepare the
UAT decision without implying deployment or release.
