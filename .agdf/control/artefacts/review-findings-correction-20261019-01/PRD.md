# PRD: Detect invalid review finding rows at recording and correct them at OR

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-19
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Deliver the approved bounded correction of D5 inside the existing Core owners for normalized review findings, step recording, internal-step eligibility, approval material and evidence association.

### Earliest detection

Recording a TP Review, Clean Implementation Review or Code Review (internal step or the quick-task `review` step) and recording a QA report validate their normalized finding rows with the same rules that closeout applies. An invalid row refuses the recording and names the finding, the field and the expected value.

### Correction at OR

At gate OR, after `Approval: UAT`, a recorded TP Review, Clean Implementation Review or Code Review whose normalized rows are invalid can be recorded again through the existing `step.record` internal command from a corrected source. The decision and the classification of every finding (finding id, gap type, routing target, gap status) stay unchanged, and every new row is valid. The QA and UAT approvals and the QA evidence association stay valid for exactly this correction; closeout then proceeds as usual.

### Compatibility boundary

The quality contract, the Run Operations receipt schema, the approval receipts and the evidence binding format stay unchanged. No new MCP command or CLI command. The two stuck runs are recovered after release, not in this run.

## 2. UX Intent And Success

- ui_ux_impact: low
- ux_intent_definition: directly defined low-impact semantics; Brownfield Review records `ux_intent_definition_required: no` because only existing rejection results gain a precise reason and recovery text.
- primary_user_intent: Approve gates only once their evidence is valid for closeout, and never renew an approval chain because of a format error AGDF accepted earlier.
- success_signal: An agent learns about an invalid finding row when it records the review, with the exact row and field to fix; a run already stuck at OR closes after recording corrected reviews, without a new approval.
- primary_decision_or_action: The user approves gates as before; the agent corrects a refused source and records it again, or uses the correction path at OR.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Recording a review or QA report | Recorded only when every normalized finding row is valid | Existing recording result, or a refusal naming finding, field and expected value | Existing step and artefact writers using the shared normalized-finding rules | Existing CLI and MCP results |
| Structured run at OR with an invalid recorded review | Review correctable through the existing internal-step writer; approvals unchanged | Closeout refusal naming the finding and the correction path; then the existing internal-step result | Existing internal-step eligibility and closeout owners | Existing CLI and MCP results |
| Structured run at OR after a correction | QA and UAT approvals approved, QA association current, closeout possible | Existing status card and closeout result | Existing approval-material and evidence-association owners | Existing status card |
| Any other change to approved material | Approvals invalid as today | Existing approval-invalid recovery | Existing approval-material owner | Existing status card |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Detection applies to every new recording of TP Review, Clean Implementation Review, Code Review and QA reports on any route. The correction path applies only on structured routes at gate OR after `Approval: UAT`, before closeout, to a recorded review with at least one invalid normalized row.
- blockers_and_visible_next_actions: An invalid row blocks the recording with a refusal naming finding, field and expected value; the next action is to correct the source and record again. An invalid recorded review at OR blocks closeout with a refusal that names the finding and the correction path.
- recovery_paths: Refused recording: correct the source and record it again. Stuck at OR: record the review again from a corrected source with the same decision and classification, then record closeout. A refused correction leaves the run unchanged.
- relevant_state_transitions: Invalid source -> refused recording -> corrected source -> recorded review. Run at OR with invalid recorded review -> closeout refused -> corrected review recorded at OR -> approvals still valid -> closeout recorded.

## 5. Acceptance Criteria

- criterion_id: AC-001
  - working_mode: Recording a review or QA report
  - source_state: A TP Review, Clean Implementation Review, Code Review or QA report source with a normalized finding row whose value is invalid under the quality contract, including `none` as `required_next_step`
  - action: Record it through `step.record` internal, the quick-task `review` step or `artefact.record` QA
  - expected_effective_state: The recording is refused and nothing is written
  - visible_feedback: The refusal names the review type, the finding id, the invalid field and the expected value
  - blocker_failure_behavior: Fails closed without changing any control file, owned output or receipt
  - recovery_next_action: Correct the source and record it again
  - observable_success: No review or QA report with an invalid normalized row can be recorded
  - required_evidence: Core tests for each recording path with `none`, an unknown gap type, a route mismatch and an `emergent_risk` row without earliest-owner assessment

- criterion_id: AC-002
  - working_mode: Recording a review or QA report
  - source_state: A source whose normalized rows are valid, or a pass report without a normalized finding table
  - action: Record it through the same paths
  - expected_effective_state: Recorded exactly as before this change
  - visible_feedback: The existing recording result
  - blocker_failure_behavior: No new refusal for valid sources
  - recovery_next_action: No action required; continue with the next step
  - observable_success: A source accepted at recording is also accepted by the closeout quality check
  - required_evidence: Core tests that record valid sources and then pass the closeout quality check

- criterion_id: AC-003
  - working_mode: Structured run at OR with an invalid recorded review
  - source_state: Structured run at gate OR with UR to UAT approved and a recorded TP Review, Clean Implementation Review or Code Review with at least one invalid normalized row
  - action: Record that review again through `step.record` internal from a corrected source with the same decision and the same finding classification
  - expected_effective_state: The corrected review is recorded; the run stays at OR; no approval is reset
  - visible_feedback: The existing internal-step result
  - blocker_failure_behavior: Only the review row and its owned output change
  - recovery_next_action: Record closeout
  - observable_success: A run stuck at OR only because of invalid finding rows can correct them without a source revision or renewed approval
  - required_evidence: Core test on a run with QA and UAT approvals and invalid recorded reviews

- criterion_id: AC-004
  - working_mode: Structured run at OR after a correction
  - source_state: The run after AC-003
  - action: Evaluate gate state, approval material, the QA evidence association and closeout
  - expected_effective_state: QA and UAT approvals stay approved, the QA association stays current, and closeout is accepted when all other conditions hold
  - visible_feedback: The existing status card shows gate OR without an approval-invalid finding
  - blocker_failure_behavior: Any other change to approved material, or a corrected review that is changed again outside this path, still invalidates the approvals
  - recovery_next_action: Record closeout
  - observable_success: Approvals given before the correction remain valid for exactly the corrected reviews
  - required_evidence: Core tests for valid approvals after correction and for invalidation by any other change

- criterion_id: AC-005
  - working_mode: Structured run at OR with an invalid recorded review
  - source_state: A correction attempt with a changed decision, a changed finding classification, still invalid rows, a recorded review without invalid rows, a review never recorded, or at a gate other than OR
  - action: Record the review through `step.record` internal
  - expected_effective_state: Refused, except that a review never recorded and never seen by the QA approval follows the existing late-recording path
  - visible_feedback: The existing refusal for an ineligible internal step, or the AC-001 refusal for invalid rows
  - blocker_failure_behavior: Nothing is written
  - recovery_next_action: Use the same decision and classification with valid rows at gate OR
  - observable_success: The correction cannot change a decision, hide or reclassify a finding, or replace a valid review
  - required_evidence: Core tests for each refused case

- criterion_id: AC-006
  - working_mode: Structured run at OR with an invalid recorded review
  - source_state: Closeout requested while a recorded review or the QA report has an invalid normalized row
  - action: Record closeout
  - expected_effective_state: Refused as today and nothing is written
  - visible_feedback: The refusal names the review type, the finding, the invalid field and that the review can be recorded again at OR with the same decision
  - blocker_failure_behavior: Fails closed
  - recovery_next_action: Correct the review through the AC-003 path, then record closeout again
  - observable_success: The refusal itself shows the way out
  - required_evidence: Core test of the closeout refusal text

- criterion_id: AC-007
  - working_mode: Structured run at OR with an invalid recorded review
  - source_state: A run shaped like `core-approval-lock-defects-20261017-01`: all three reviews recorded before the QA report with invalid rows, QA and UAT approved with those reviews in their material
  - action: Correct the three reviews at OR, then record closeout
  - expected_effective_state: Closeout accepted; the run is completed
  - visible_feedback: Existing closeout result
  - blocker_failure_behavior: Closeout refused before the corrections
  - recovery_next_action: No action required after closeout
  - observable_success: The first stuck run can be recovered with the released runtime
  - required_evidence: End-to-end Core test through the real writers

- criterion_id: AC-008
  - working_mode: Structured run at OR with an invalid recorded review
  - source_state: A run shaped like `mcp-ergonomics-baseline-20261016-01`: Code Review recorded with invalid rows and seen by the QA approval, TP Review and Clean Implementation Review not recorded and not seen
  - action: Correct the Code Review at OR, record TP Review and Clean Implementation Review at OR, then record closeout
  - expected_effective_state: Closeout accepted; the run is completed
  - visible_feedback: Existing internal-step and closeout results
  - blocker_failure_behavior: Closeout refused before the three recordings
  - recovery_next_action: No action required after closeout
  - observable_success: The second stuck run can be recovered by its owner with the released runtime
  - required_evidence: End-to-end Core test through the real writers

- criterion_id: AC-009
  - working_mode: All
  - source_state: The change set on the fix branch
  - action: Run `npm run test:verification`, the CLI smoke suite with the Core tests and the mcp-server suite
  - expected_effective_state: All pass, apart from the known machine-dependent `test:performance` budget (F09)
  - visible_feedback: Command results recorded in CD+Tests
  - blocker_failure_behavior: A failing suite blocks QA
  - recovery_next_action: Fix the cause and rerun
  - observable_success: D5 is fixed without regressions; generated copies, payload baseline, eval fingerprints and host-compatibility evidence are refreshed through the existing tools where they change
  - required_evidence: CD+Tests command results

## 6. Non-Goals

No relaxation of the quality contract; no general way to change recorded reviews after approvals; no change of a decision or a finding classification through the correction; no correction at gates other than OR; no receipt, approval or binding schema change; no new command; no recovery of the two stuck runs in this run; no write to run `mcp-ergonomics-baseline-20261016-01` or the main checkout; no commit, push, pull request, release or reinstall.

## 7. Users And Roles

The user approves gates and decides scope. Coding agents author reviews and QA reports and record them through the existing writers. Core owns the normalized-finding rules, eligibility, approval material, evidence association and closeout. The owner commits and later recovers the stuck runs with the released runtime.

## 8. Constraints

One owner for normalized-finding validation, reused by recording, QA follow-up and closeout; no second parser. Older installed runtimes must still parse a corrected run. Core must not import process-starting or network modules. Generated runtime copies are refreshed only through the existing build stages.

## 9. Evidence Requirements

Tests drive the real step and artefact writers, eligibility, approval-material, association and closeout paths. They include the exact `none` rows of both stuck runs, every refused correction case, approvals that remain valid after a correction and become invalid for any other change, and the two acceptance cases end to end.

## 10. Risks And Open Questions

The correction changes recorded evidence after human decisions; it must stay narrow and provable. The earlier check refuses sources that recorded without error before; existing fixtures may need valid rows. An older runtime reading a corrected run may report the approvals as changed; the SD assesses this.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Recordings that run the early check | before_prd | resolved | TP Review, Clean Implementation Review and Code Review as internal steps, the quick-task review step, and the QA report | Arndt Gold, PRD owner |
| Where the correction applies | before_prd | resolved | Gate OR after Approval: UAT on structured routes, as the owner decided | Arndt Gold, PRD owner |
| What a correction may change | before_prd | resolved | Only finding evidence and required next step text; decision and finding classification stay equal, and the recorded version must have an invalid row | Arndt Gold, PRD owner |
| Recovery of the two stuck runs | before_prd | resolved | After merge and install of the released runtime; the ergonomics run by its owner | Arndt Gold, PRD owner |
| How approvals and the QA association recognise a correction | later_sd | open | SD decides inside the existing owners without a receipt schema change | Existing Core design owner (SD) |
| Refusal reasons and diagnostics shape | later_sd | open | SD decides within the existing rejection results | Existing Core design owner (SD) |
| Test mapping | later_tp | open | TP maps every criterion to concrete tests and suites | Existing task and test plan owner |

Resolved rows are the concrete proposal for this PRD decision, not an approval or claim of previous human selection.

## 11. Next Step

Review this bounded PRD and approve only with `Approval: PRD`. It permits the SD stage, not implementation.

## AGDF Approval Summary (de; source=en)

- Ziel: Ungültige normalisierte Befundzeilen fallen schon beim Erfassen eines Reviews oder QA-Berichts auf, und ein Run, der deshalb am OR-Gate feststeckt, kann ohne erneute Freigaben abschließen.
- Umfang: Beim Erfassen von TP Review, Clean Implementation Review, Code Review und QA-Bericht werden die Befundzeilen mit denselben Regeln wie beim Closeout geprüft. Am OR-Gate nach Approval: UAT darf ein erfasstes Review mit ungültigen Zeilen über das bestehende step.record neu erfasst werden, wenn Entscheidung und Klassifikation aller Befunde gleich bleiben und alle neuen Zeilen gültig sind; QA- und UAT-Freigabe sowie die QA-Zuordnung bleiben genau dafür gültig.
- AC-001: Eine Quelle mit ungültiger Befundzeile, etwa `none` als required_next_step, wird beim Erfassen abgelehnt; die Meldung nennt Review, Befund, Feld und erwarteten Wert; nichts wird geschrieben.
- AC-002: Gültige Quellen und Pass-Berichte ohne Befundtabelle werden wie bisher erfasst, und was beim Erfassen angenommen wird, besteht auch die Qualitätsprüfung beim Closeout.
- AC-003: Am OR-Gate nach UAT-Freigabe wird ein erfasstes Review mit ungültigen Zeilen aus korrigierter Quelle mit gleicher Entscheidung und Klassifikation neu erfasst; der Run bleibt am OR, keine Freigabe wird zurückgesetzt.
- AC-004: Nach der Korrektur bleiben QA- und UAT-Freigabe gültig und die QA-Zuordnung aktuell, der Closeout gelingt; jede andere Änderung am freigegebenen Material macht die Freigaben weiterhin ungültig.
- AC-005: Abgelehnt werden Korrekturen mit geänderter Entscheidung, geänderter Klassifikation, weiterhin ungültigen Zeilen, an einem gültigen Review oder an einem anderen Gate; ein nie erfasstes und ungesehenes Review folgt dem bestehenden Nachtragsweg.
- AC-006: Ein wegen ungültiger Zeilen abgelehnter Closeout nennt Review, Befund, Feld und den Korrekturweg am OR-Gate.
- AC-007: Ein Run wie core-approval-lock-defects-20261017-01 mit drei ungültigen Reviews schließt nach deren Korrektur am OR ab.
- AC-008: Ein Run wie mcp-ergonomics-baseline-20261016-01 schließt ab, nachdem das Code Review am OR korrigiert und TP Review sowie Clean Implementation Review am OR nachgetragen sind.
- AC-009: test:verification, die CLI-Smoke-Suite und die mcp-server-Suite bestehen bis auf den bekannten Performance-Test F09; generierte Kopien, Payload-Baseline, Eval-Fingerprints und Kompatibilitätsevidenz werden bei Bedarf mit den bestehenden Werkzeugen aktualisiert.
- Entscheidungen: Geprüft werden interne Reviews, der Review-Schritt des Quick Task und der QA-Bericht. Korrektur nur am OR-Gate nach UAT-Freigabe und nur bei ungültiger Altfassung; Entscheidung und Klassifikation bleiben gleich. Die beiden festsitzenden Runs werden nach Merge und Installation repariert. Offen für das SD: wie Freigaben und QA-Zuordnung die Korrektur ohne Schemaänderung erkennen und wie die Ablehnungen aussehen.
- Abgrenzung: Keine Lockerung des Vertrags, kein allgemeines Ändern erfasster Reviews, keine Schemaänderung, kein neuer Befehl, keine Reparatur der beiden Runs in diesem Run, keine Git-Aktion oder Veröffentlichung.
- Nächster Schritt: Diesen PRD prüfen und nur mit `Approval: PRD` freigeben; danach folgt das SD, noch keine Implementierung.
