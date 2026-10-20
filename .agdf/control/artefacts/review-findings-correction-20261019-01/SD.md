# SD: Detect invalid review finding rows at recording and correct them at OR

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-19
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

The approved PRD is solved inside the existing owners:

- One shared inspector for normalized finding tables reports field-level problems. Closeout, the QA revise follow-up and every recording of a review or QA report use it, so a source accepted at recording is accepted at closeout.
- At gate OR after `Approval: UAT`, the existing internal-step writer accepts a corrected review when the recorded version has an invalid row and the decision and finding classification are unchanged.
- The approval-material and QA-association checks recognise such a correction from the existing Run Operations receipts: every recording of that review after the UAT approval, with the status the approvals saw. No receipt field is added.
- A closeout refused for an invalid row names the finding and the correction path.

## 2. Ownership And Source Of Truth

| Responsibility | Authoritative owner | Consumption and boundary |
|---|---|---|
| Product need and acceptance | Approved UR (revision 4) and PRD (revision 7) | Read only; this SD records technical realization |
| Normalized-finding rules | `plugins/agdf/meta/contracts/quality.md` via `packages/core/lib/control-evaluation/normalized-gaps.js` | Contract unchanged; `normalized-gaps.js` gains field-level diagnostics and the table reader |
| Report inspection for closeout and QA follow-up | `packages/core/lib/control-evaluation/qa-follow-up.js` (`inspectQaReports`) | Uses the shared table reader; behaviour and messages for valid input unchanged |
| Recording | `packages/core/lib/control-state/run-steps.js` (internal and `review` steps, closeout), `run-artefact-recording.js` (QA report) | Calls the shared inspector before writing; refusal through the existing rejection result |
| Correction eligibility | `packages/core/lib/control-state/run-operation-proof.js` (`internalStepEligibility`) | One new narrow branch next to the D4 late path |
| Correction proof | `packages/core/lib/control-state/evidence-bindings.js` (new `reviewCorrections`) | Derived from Run Operations and Approval Operations receipts; read only |
| Approval-material and association integrity | `presentation-decision.js` (`approvedMaterialFindings`), `evidence-bindings.js` (`bindingSourceAssociation`, `evidenceApplicability`), `control-evaluation/run-state.js` | Exempt exactly a proven correction, alongside the D4 unseen-review exception |

## 3. Architecture Decisions

- SDD-001: `normalized-gaps.js` exports `normalizedGapProblems(row, routes)`, returning `{ field, expected }` entries for each violated rule (column count, empty or overlong id, unknown gap type, route not allowed for the gap type, gap status, empty or placeholder evidence, empty or placeholder required next step, `requirements_gap` to UR without changed intent, `emergent_risk` without earliest-owner assessment); `validNormalizedGap` becomes `normalizedGapProblems(...).length === 0`. It also exports `readNormalizedFindings(content)`, the table scan now inside `inspectQaReports` (header detection, malformed header, malformed row, duplicate id, rows); rationale: closeout, QA follow-up and recording must judge a row identically, which only one implementation guarantees; consequence: `inspectQaReports` delegates its table scan and row check, and every consumer gets field-level diagnostics.
- SDD-002: A new `reviewFindingDiagnostics(type, content, decision)` in `normalized-gaps.js` applies the per-source rules of `inspectQaReports` (malformed table, duplicate or invalid row, missing findings for a revise or block decision) and returns diagnostics `{ review, finding_id, field, expected }`. `inspectQaReports` keeps its own decision check and QA reference following and uses the same rules. Recording calls it before any write: `step.record` internal for `TP Review`, `Clean Implementation Review` and `CR`, the quick-task `review` step, and `artefact.record` QA. A non-empty result refuses with reason `review_findings_invalid` and the diagnostics; rationale: recording is the earliest point at which the content is bound to the run, and applying the closeout rules there means nothing accepted can fail later for format; consequence: sources with invalid rows, including existing test fixtures, must be corrected before they can be recorded.
- SDD-003: `internalStepEligibility` gains `reviewCorrectionCandidate`: structured route, active run, current gate `OR`, QA and UAT approved, internal step `TP Review`, `Clean Implementation Review` or `CR`, and a canonical row of that type with a path and a recorded status. After the writer has read the new source, it requires: the recorded file has at least one diagnostic under SDD-002 for its recorded decision; the new decision equals the decision read from the recorded file, and the resulting status equals the recorded row status; the multiset of `(finding_id, gap_type, routing_target, gap_status)` is equal; the new source has no diagnostic. Otherwise the existing `internal_step_not_ready` refusal is returned with a `correction` detail naming the failed condition. The `Clean Review` alias row is not corrected through this path; rationale: the owner decided on a correction at OR with an unchanged decision, and requiring an invalid recorded version plus an equal classification keeps it from becoming a general rewrite of approved evidence; consequence: both stuck runs can be corrected, while every other re-recording after QA approval stays refused.
- SDD-004: `evidence-bindings.js` exports `reviewCorrections(state)`. It reads the valid Run Operations receipts and the current UAT approval receipt; for each of the three review types it takes the step receipts recorded after the UAT approval revision. If there are any, the last receipt before that revision is the version the approvals saw; the correction is proven only when every later receipt has the same status as that version and the current artefact row carries the digest of the last receipt. It returns `type -> { seen_digest, current_digest }`; invalid or missing receipts give an empty result (fail closed); rationale: after the UAT approval only SDD-003 and the D4 late path can record a review, so the existing receipts already prove a correction without a new field; consequence: no receipt schema change and older runtimes keep parsing the run, but the proof depends on that eligibility rule staying narrow.
- SDD-005: `approvedMaterialFindings` normalises the current material before comparing it with the approval receipt: required reviews unseen by the approval are dropped (D4, unchanged), and a source whose type has a proven correction and whose digest is the correction's current digest is compared with the seen digest. `bindingSourceAssociation` accepts the same substitution for a source recorded with the seen digest; `evidenceApplicability` rechecks a QA row with the corrections when it is not current and reports `current_with_corrected_reviews`. `run-state.js` computes the corrections once and passes them in. Any other difference still invalidates the approval or supersedes the association; rationale: the approvals saw the corrected review with the same decision and classification, so only its wording changed, and handling it next to the D4 exception keeps a single exception point; consequence: approvals and the QA association stay valid for exactly the proven corrections, and closeout proceeds without a renewed approval.
- SDD-006: When closeout is refused because `inspectQaReports` finds an invalid normalized row, the refusal keeps reason `closeout_quality_unconfirmed` and its detail names review, finding, field and expected value and adds: record the review again at gate OR from a corrected source with the same decision and finding classification, then record closeout; rationale: the stuck run's owner should learn the recovery from the refusal itself rather than from the source code; consequence: the closeout refusal text grows, while its reason code and fail-closed behaviour stay unchanged.
- SDD-007: Verification uses the existing suites: Core tests through the CLI smoke chain, the mcp-server suite and `npm run test:verification`, with new tests in a new Core test file wired into `test:run-command-flow`. Generated copies, the Copilot payload baseline, eval fingerprints and the host-compatibility evidence are refreshed only through their existing tools; rationale: the change touches shared Core paths that many existing suites exercise; consequence: fixture fallout and re-pins appear as explicit TP tasks and CD+Tests evidence.

## 4. Integration Points

### Detection at recording

`run-steps.js` internal branch: after `readReportDecision` confirms the decision and before `prepareOwnedOutput`, call `reviewFindingDiagnostics` for the three review types. `review` branch: the same for its CR source. `run-artefact-recording.js`: for gate QA, the same for the QA report destination content with the destination status as decision. Refusals write nothing.

### Correction at OR

`internalStepEligibility` returns true for a candidate (SDD-003 structural part); `run-steps.js` then applies the content conditions before writing, using the recorded file at the row path and the new source. A correction writes the same row, owned output, evidence binding and step receipt as any internal-step recording.

### Approval and association integrity

`reviewCorrections(state)` is computed in `run-state.js` next to the D4 `lateReviewTypes` and passed to `evidenceApplicability`; `approvedMaterialFindings` computes it from the state it already receives.

## 5. Constraints And Compatibility

- Quality contract, receipt schemas, approval receipts, evidence bindings, owned-output seal and MCP and CLI command shapes are unchanged.
- An older runtime parses a corrected run unchanged, but without SDD-005 it reports the corrected review as changed approval material; the stuck runs are therefore recovered only with the released runtime.
- The early check refuses sources that used to record without error; the refusal names exactly what to fix.
- Core imports stay within its existing dependencies.

## 6. Test And Evidence Strategy

TP maps each criterion and decision to tests:

- Inspector: `normalizedGapProblems` for every rule; `readNormalizedFindings` for malformed header and row and duplicates; `inspectQaReports` unchanged for valid input.
- Recording: each path refuses `none` and the other invalid shapes with diagnostics and writes nothing; valid sources record and then pass the closeout quality check.
- Correction: on a run with QA and UAT approved and invalid recorded reviews, each review is corrected at OR; approvals stay approved, the QA association stays current, closeout is accepted (case shaped like `core-approval-lock-defects-20261017-01`). Case shaped like `mcp-ergonomics-baseline-20261016-01`: CR corrected, TP Review and Clean Implementation Review late-recorded at OR, closeout accepted.
- Negative: changed decision, changed classification, still invalid rows, valid recorded review, gate other than OR, alias row, and another change to approved material each fail as specified.
- Closeout refusal text for an invalid row.
- Suites as in SDD-007.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Shared inspector refuses invalid rows at every review and QA recording with field-level diagnostics | `normalized-gaps.js`, `run-steps.js`, `run-artefact-recording.js` | SDD-001, SDD-002 | Existing fixtures with invalid rows must be corrected |
| AC-002 | Same per-source rules as closeout; valid sources record unchanged | `normalized-gaps.js`, `qa-follow-up.js` | SDD-001, SDD-002 | None for valid sources |
| AC-003 | Narrow correction branch at OR through the existing internal-step writer | `run-operation-proof.js`, `run-steps.js` | SDD-003 | No new command |
| AC-004 | Receipt-derived correction proof keeps approvals and the QA association valid; any other change still invalidates | `evidence-bindings.js`, `presentation-decision.js`, `run-state.js` | SDD-004, SDD-005 | Older runtimes report corrected material as changed |
| AC-005 | Content conditions refuse changed decisions or classifications, invalid new rows, valid recorded reviews, other gates and alias rows | `run-operation-proof.js`, `run-steps.js` | SDD-002, SDD-003 | None |
| AC-006 | Closeout refusal names finding, field and the correction path | `run-steps.js`, `qa-follow-up.js` | SDD-006 | Message text only |
| AC-007 | End-to-end test of three corrections and closeout | Core test through real writers | SDD-003, SDD-004, SDD-005 | None |
| AC-008 | End-to-end test of CR correction plus D4 late recording and closeout | Core test through real writers | SDD-003, SDD-004, SDD-005 | Relies on the D4 late path of this branch |
| AC-009 | Existing suites and refresh tools | Existing test scripts and tools | SDD-007 | Payload and evidence re-pins |

## 8. Risks And Open Questions

- The correction proof relies on the rule that only SDD-003 and the D4 late path record reviews after the UAT approval; a later change to eligibility must keep that rule or extend the proof.
- If a run was approved with a review whose rows were valid and the review is never re-recorded, nothing changes; the exception applies only to receipts after the UAT approval.
- Fixture fallout from the earlier check is expected; TP plans valid rows without weakening assertions.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| How approvals and the QA association recognise a correction | before_sd | resolved | Derived from existing Run Operations receipts after the UAT approval with an unchanged status; no receipt field | Arndt Gold, SD owner |
| Refusal reasons and diagnostics | before_sd | resolved | `review_findings_invalid` with `{ review, finding_id, field, expected }` at recording; `internal_step_not_ready` with a correction detail for refused corrections; closeout keeps `closeout_quality_unconfirmed` with an extended detail | Arndt Gold, SD owner |
| Alias rows | before_sd | resolved | The `Clean Review` alias is not corrected through this path | Arndt Gold, SD owner |
| Test file placement and fixture updates | later_tp | deferred | TP names the files and the fixture changes per criterion | Existing task and test plan owner |

## 9. Next Step

Review this solution design and approve only with `Approval: SD`. It permits the Task/Test Plan, not implementation.

## AGDF Approval Summary (de; source=en)

- Ziel: D5 wird innerhalb der bestehenden Zuständigkeiten behoben: ungültige Befundzeilen fallen beim Erfassen auf, und ein am OR-Gate festsitzender Run kann ein Review korrigieren und abschließen, ohne dass Freigaben ungültig werden.
- Lösung: Ein gemeinsamer Prüfer für Befundtabellen liefert Felddiagnosen und wird von Closeout, QA-Nachbearbeitung und jeder Erfassung von Review oder QA-Bericht genutzt. Am OR-Gate nach UAT-Freigabe nimmt der bestehende Schreiber ein korrigiertes Review an, wenn die erfasste Fassung eine ungültige Zeile hat und Entscheidung sowie Klassifikation gleich bleiben. Freigabematerial und QA-Zuordnung erkennen die Korrektur an den vorhandenen Receipts nach der UAT-Freigabe mit unverändertem Status.
- Entscheidungen: SDD-001 ein Prüfer mit Felddiagnosen und Tabellenleser. SDD-002 Prüfung vor jedem Schreiben mit `review_findings_invalid`. SDD-003 Korrektur nur am OR, nur bei ungültiger Altfassung, gleiche Entscheidung und Klassifikation, kein Alias. SDD-004 Korrekturnachweis aus den bestehenden Receipts. SDD-005 Ausnahme für Freigabematerial und QA-Zuordnung neben der D4-Ausnahme. SDD-006 Closeout-Ablehnung nennt den Korrekturweg. SDD-007 bestehende Suites und Werkzeuge.
- Verträglichkeit: Vertrag, Receipt-Schemas, Bindungen und Befehle bleiben unverändert. Ältere Laufzeiten lesen einen korrigierten Run weiter, melden das korrigierte Review aber als geändertes Material; die beiden Runs werden daher erst mit der neuen Laufzeit repariert.
- Risiken: Der Nachweis setzt voraus, dass nach der UAT-Freigabe nur der Korrekturweg und der D4-Nachtrag Reviews erfassen. Die frühe Prüfung kann bestehende Test-Fixtures brechen.
- Nächster Schritt: Dieses SD prüfen und nur mit `Approval: SD` freigeben; danach folgt der Task-/Testplan, noch keine Implementierung.
