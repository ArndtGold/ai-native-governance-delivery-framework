# QA Report: Doctor and Presentation Identity-Validation Parity

Date: 2026-09-01
Revision: 1
Decision: pass
Owner: qa-gate
References: TP_REVIEW.md, CLEAN_REVIEW.md, CODE_REVIEW.md, BROWNFIELD_ANALYSIS.md

## Quality Readiness

| Dimension | Status | Owner evidence |
|---|---|---|
| Plan coverage | pass | TP Review 2026-09-01: 8/9 fully_done; DIP-T9 completed by the three reviews plus this QA decision |
| Solution integrity | pass | Clean Review 2026-09-01: single identity owner, validators consumed by renderers, no parallel structures; found duplication removed during review |
| Code quality | pass | Code Review 2026-09-01: backtick-strip parity defect fixed and retested; two non-blocking advisories recorded |
| QA decision | pass | this report |

Decision owner: qa-gate. Decisive reason: every acceptance criterion has direct repository evidence
and the two disclosed deviations are justified, visible and content-neutral. Permissible next action:
request exact `Approval: QA`, then bounded UAT.

## QA Gate

- decision: pass
- evidence:
  - AC-01/AC-02: IPP-2 CLI evidence — legacy state with invalid `run_id` and without `revision_id`
    yields `AGDF_RUN_ID_INVALID` / `AGDF_RUN_REVISION_ID_INVALID` findings, severity `revise`,
    `run-migrate` repair step; doctor status never mere `warn` for identity defects.
  - AC-03: structural test — presentation imports `run-identity.js`, retired superset regex is absent,
    parser re-export is object-identical.
  - AC-04: `presentation_diagnostics` populated additively; both CLI fallback lines carry concrete
    codes (print-level tests); E2E-positive JSON via CLI fixtures unreachable by design because
    upstream fail-closed layers fire first (disclosed TP Review deviation 1).
  - AC-05: `validateOperationalStatusCardPreconditions` exported, unit-tested and consumed by the
    renderer itself.
  - AC-06: pre-existing snapshot and negative assertions pass unmodified; live gate-check on the
    selected run renders unchanged with no diagnostics key (IPP-4 healthy-run assertion).
  - AC-07: green on this host — control-state, interaction-presentation, verified-change,
    parent-reconciliation, delivery-path-search (+unit), local-marketplace, copilot-profile, routing,
    package-build, release-version-coherence, public-plugin; no assertion weakened.
  - AC-08: `sync-package-assets` idempotent; mirror `run-identity.js` byte-identical;
    `git diff --check` clean; no hand-edited generated file.
  - AC-09: JSON changes additive only; no new codes, gates, approval values or schema fields.
  - AC-10: sibling-renderer exclusion recorded in SD §3.6 and Clean Review.
- missing_evidence:
  - Live-host rendering of the extended fallback lines (Codex/Claude/OpenCode sessions) — not claimed;
    repository evidence plane only.
  - `test:lifecycle`, `test:cli-modularization`, `test:local-validator`, Runtime Integrity scripts and
    `test:package-contents` fail on this native-Windows host identically on clean `main` (stash
    comparison) — pre-existing host limitations, not regressions of this change.
- risks:
  - Intended severity tightening: un-migrated legacy states and fresh legacy scaffolds now report two
    additional `revise` findings with a named repair path; disclosed for the OR.
  - Copilot payload baseline consciously raised to 79 files / 568459 bytes for the new runtime module.
- required_next_step: Request exact `Approval: QA`, then perform bounded UAT (fresh-session doctor and
  gate-check observation against a defective legacy state) before delivery closeout.
- impact_codes: none
- context_graph_impact: link_only; invariant lives in `run-identity.js` and its tests; no node created.
