# QA Report: Copilot-Specific AGDF Payload

Status: done
Decision: revise
Revision: 6
Date: 2026-09-02
Run: `agdf-copilot-plugin-integration`
Based on: approved TP Revision 3, negative macOS UAT, focused correction evidence and mandatory
reviews Revision 4

## Quality Readiness

| Dimension | Status | Decisive evidence |
|---|---|---|
| Plan coverage | revise | 12/13 tasks fully done; only CPI3-T11 remains partial for the combined aggregate baseline |
| Solution integrity | pass | both unavailable CLI variants converge on one existing pinned fallback without a new lifecycle path |
| Code quality | pass | Code Review Revision 4 has no open correctness, failure-isolation, compatibility or maintainability finding |
| QA decision | revise | `qa-gate` cannot pass while CPI-TPR4-01 remains open |

Sole decision owner: `qa-gate`.

## QA Gate

- decision: revise
- evidence: the exact observed missing-binary launcher result now uses the same pinned official npm
  fallback as `ENOENT`; unrelated errors remain fail-closed. Release preparation, local development
  installation, lifecycle, Copilot profile, marketplace, CLI modularization and diff validation pass.
  The corrected real install succeeds; official CLI read-back reports `agdf@agdf` 0.14.4 and the
  installed validator reports matched provenance with ten skills.
- missing_evidence: complete combined-worktree smoke after its separately owned runtime-packaging
  baseline is repaired. Fresh-session behavior remains a later UAT boundary.
- risks: current installation and installed-root behavior are directly proven, but QA readiness would
  overstate aggregate repository evidence while CPI3-T11 remains partial.
- required_next_step: repair the foreign aggregate baseline, rerun complete smoke and refresh QA.
- impact_codes: `qa_revise_required`, `evidence_gap`

## Normalized Findings Consumed

| finding_id | gap_type | routing_target | gap_status | QA disposition |
|---|---|---|---|---|
| CPI-QA4-01 | implementation_gap | CD+Tests | resolved | anchored launcher-unavailable classifier and exact regression test are present and green |
| CPI-TPR4-01 | evidence_gap | evidence_obligation | open | corrected real installation is resolved; complete aggregate evidence still prevents QA pass |

## Evidence Boundaries

- Previous QA approval remains historical evidence for Revision 3 only.
- No QA or UAT approval is requested while CPI-TPR4-01 is open.
- Corrected installation and installed-root evidence do not prove fresh-session loading.
- No publication, release, commit or push was performed.
