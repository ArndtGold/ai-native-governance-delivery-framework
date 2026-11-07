# Brownfield Analysis: Companion core in Core (pre-implementation, after the source revision of 2026-11-06)

Decision: pass
Gate: Brownfield Analysis
Type: Brownfield Analysis
Mode: pre_implementation_analysis
Reviewer: Claude (agent analysis for Arndt Gold)
reviewed_at: 2026-11-06
run_id: run-d2818184-27fc-40ae-9195-70d080d3e926

## Run

- related_prd: `.agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/PRD.md` @ sha256:9b959dc9680207e368d8baf7ffb73e942f2e31f409b6cdf45b71dda51414cf66 (approved, revision 43; AC-008 narrowed, decision P5)
- related_sd: `.agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/SD.md` @ sha256:4477fc25e6168443d09836806447758454dfa5c45242517044e63964990230fa (approved, revision 45; SDD-003, SDD-008)
- related_tp: `.agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/TP.md` @ sha256:c3821a2e9247a82141accf097456cb75a526fe5b3f217c6a814815932f9e3fbf (approved, revision 47; T-004, T-009, SCN-004, SCN-014)
- source revision: `f40ed3bf-c27a-410c-83e7-5f13fee67e7e` from QA (proposal `evidence/PRD-revision-proposal-01.json`), which wrote the owner decisions C1 and C5 of 2026-11-06 into the approved sources
- previous analysis of this TP family: `BROWNFIELD_ANALYSIS-input-03.md` (pass for TP revision 31)
- retained work: the complete implementation of T-001 to T-012 on branch `feat/companion-core-run-view` (uncommitted), including the CR corrections (CR-A1 to CR-C6) and the QA follow-up corrections (CIR-01 to CIR-06, RV-01 to RV-07) described in `evidence/CD_TESTS-input-02.md`

## Objective

Re-verify the implementation path against the revised approved sources before CD+Tests is recorded again. The revision changes wording and expectations only: it narrows the drift scope and reserves `too_large`; it adds no task.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact of the revision |
|---|---|---|---|
| Per-run diagnosis reason | `diagnosisReason` in `packages/core/lib/companion/run-view.js`, using the reader findings' `classification` like `run-state-resolver.js` | `companion-run-view-test.js` SCN-004/SCN-006 and "CIR-03": F12 yields `run_state_invalid`, `too_large` stays with count 0 | none: the revised SDD-003 and T-004 describe the delivered behavior |
| Drift warning | `readRunDrift` in `run-view.js` over the effective artefact bindings and latest evidence reports, digest owner `artefactFileDigest` | SCN-014 drift case and adapter toast case; record-time source match in `journal.js` review facts (SCN-013) | none: the revised SDD-008, AC-008, T-009 and SCN-014 describe the delivered behavior |
| Reader snapshot | `captureControlScope` (SD section 4) for the inventory and each evaluated run, via the resolved root | QA follow-up CIR-01, RV-01 to RV-03 | none from the revision; T-002 is now fulfilled as written |
| Owner constants | `RUN_STEP_SLOTS` (`run-identity.js`), `COMMAND_TOOL_NAMES` (`mcp-tool-errors.js`), `BOUNDED_READ_CODES` (`run-classification.js`), `readRunInventory` option `observe` | QA follow-up CIR-04, RV-02 | none from the revision |

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: low
- architecture_reason: the revision changes no boundary; the reader integration point (`captureControlScope`) and the owner reuse were corrected in the QA follow-up to match SD section 4
- architecture_evidence: SD @ sha256:4477fc25e6168443d09836806447758454dfa5c45242517044e63964990230fa; `evidence/CD_TESTS-input-02.md`; `evidence/CODE_REVIEW-input-02.md`
- architecture_missing_evidence: none
- architecture_next_owner_and_action: CD+Tests records the delivered implementation against the revised TP

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Diagnosis reasons follow the reader classification owner | `diagnosisReason`, `run-state-resolver.js` | none | none |
| Drift reuses the binding readers and the node digest owner | `readArtefactBindings(...).active`, `readEvidenceBindings`, `artefactFileDigest` | none | none |
| Companion mirrors of Core values | pinned in `claude-companion-test.js` (CIR-04) | none | none |

## Implementation Path

1. No code change follows from the revision: the delivered implementation already reserves `too_large` with count 0 and compares bound documents plus the record-time source match.
2. CD+Tests is recorded from `evidence/CD_TESTS-input-02.md`, which covers T-001 to T-012, the CR corrections and the QA follow-up corrections with their verification.
3. CR, TP Review and Clean Implementation Review are recorded again against the revised sources; T-013 (native desktop check) remains the owner's task.

## Regression Risk And Test Impact

- The revision changes no test expectation: SCN-004 already asserts `run_state_invalid` for F12, and SCN-014 asserts drift of a bound document.
- The targeted verification of the corrected tree (30 checks, companion re-run, red checks) in `evidence/CD_TESTS-input-02.md` applies unchanged; PR CI runs the full `packages/mcp-server` suite before merge.

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: no curated node owns the companion or the status card; the SD integration points carry the ownership

## Decision

- decision: pass
- evidence: revised approved PRD, SD and TP above; repository evidence listed in the Existing-System View
- missing_evidence: none for recording CD+Tests; native evidence follows in T-013
- risks: none new from the revision
- required_next_step: record CD+Tests from `evidence/CD_TESTS-input-02.md`

## Next Permissible Step

- next_allowed_action: CD+Tests for the approved TP
- forbidden_until_then: none beyond the TP order

## Quality Outlook

- quality_outlook: the revision aligns the sources with the delivered behavior; open after CD+Tests is only the native desktop check T-013
