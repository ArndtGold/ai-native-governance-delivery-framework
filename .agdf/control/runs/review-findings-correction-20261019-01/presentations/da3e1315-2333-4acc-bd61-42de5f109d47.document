# UR: Detect invalid review finding rows at recording and correct them at OR

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-19
Owner: Arndt Gold

## 1. Problem

D5 — Invalid normalized review finding rows are detected only at closeout, after every human approval, and cannot be corrected there.

On 2026-10-19 the closeout of run `core-approval-lock-defects-20261017-01` (gate OR, UR to UAT approved) was refused with `closeout_quality_unconfirmed`: "Invalid or contradictory normalized finding: TP Review/TPR-01." The recorded TP Review, Clean Implementation Review and Code Review use `none` as `required_next_step` for resolved findings in all 22 normalized finding rows. `validNormalizedGap` (`packages/core/lib/control-evaluation/normalized-gaps.js`) rejects them, as the quality contract (`plugins/agdf/meta/contracts/quality.md`, Normalized Review Gaps) requires: `none` must not appear in a normalized finding row.

The check runs only in `inspectQaReports` (`qa-follow-up.js`), which closeout calls with decision `pass` and the QA revise follow-up calls with `revise`. Recording the reviews, preparing the QA presentation and recording `Approval: QA` and `Approval: UAT` all accepted the invalid rows. After `Approval: UAT` no correction exists: internal steps cannot be re-recorded after the QA approval, and `sourceRevisionBoundary` refuses every source revision once UAT is approved. The run is stuck at OR.

Run `mcp-ergonomics-baseline-20261016-01` (gate OR, UR to UAT approved, revision 4fb76264-290d-4419-ac1b-abc19bd287b3) is stuck the same way: its recorded `CODE_REVIEW.md` has `none` in all 16 rows (CR-01 to CR-16, all resolved). Its TP Review and Clean Implementation Review are not recorded yet; their sources are already corrected so that `validNormalizedGap` accepts them.

## 2. Goal

Invalid normalized review finding rows are caught when a review is recorded, and a run already stuck at OR because of them can close without renewed approvals:

- A review or QA report whose normalized finding rows are invalid is refused when it is recorded, with a message that names the finding and the invalid field, so the author corrects it before any human approval depends on it.
- A run at OR whose recorded review has invalid normalized rows can record that review again from a corrected source with an unchanged decision, without resetting any approval, and then close out.

## Affected Users

- Users approving AGDF gates, who should never be asked to renew an approval chain because of a format defect AGDF accepted earlier.
- Coding agents that author TP Review, Clean Implementation Review, Code Review and QA reports.
- The owner of the two stuck runs, who needs a governed way to close them.

## 3. Scope

1. Earliest detection: recording TP Review, Clean Implementation Review and CR (`step.record` internal and the existing `review` step) and recording the QA report (`artefact.record` QA) validate the normalized finding rows with the same validator as closeout. An invalid row refuses the recording and names the finding id, the field and what is expected.
2. Correction path at OR: an already recorded TP Review, Clean Implementation Review or CR can be recorded again through the existing `step.record` internal command at gate OR, after `Approval: UAT`, when the recorded version has at least one invalid normalized row, the new decision equals the recorded decision, the finding classification (finding id, gap type, routing target, gap status) is unchanged, and every new row is valid. No new MCP command.
3. Approvals stay valid: the QA and UAT approval material and the QA evidence association accept exactly such a correction. Any other change to approved material still invalidates the approvals as today.
4. A closeout refused for invalid normalized rows names the affected finding and the correction path.
5. Acceptance cases in tests: a run shaped like `core-approval-lock-defects-20261017-01` (all three recorded reviews invalid) closes after correcting them; a run shaped like `mcp-ergonomics-baseline-20261016-01` (recorded CR invalid, TP Review and Clean Implementation Review not recorded) closes after correcting the CR at OR and recording the two reviews at OR through the existing late path.
6. Implementation on the branch `fix/agdf-core-approval-defects-20261017` in its worktree, building on the uncommitted D1 to D4 change. The owner commits.

## 4. Non-Goals

- Relaxing the quality contract: `none` stays forbidden in normalized finding rows.
- A general way to change recorded reviews after human approvals; changing a decision or a finding classification; correcting at gates other than OR.
- Changing the Run Operations receipt schema, the approval receipts or the evidence binding format.
- Recovering the two stuck runs themselves in this run; each is recovered with the installed fixed runtime after merge (`mcp-ergonomics-baseline-20261016-01` by its owner).
- Any write to run `mcp-ergonomics-baseline-20261016-01` or to the shared main checkout; commits, push, pull request, release or reinstalling the plugin.

## 5. Acceptance Signals

- Recording a review or QA report with `none` (or another invalid value) in a normalized finding row is refused, naming the finding id and the field; a valid source is accepted unchanged.
- In a test that reproduces the stuck state (QA and UAT approved, invalid recorded reviews), the reviews are recorded again at OR with unchanged decision and classification, the QA and UAT approvals remain valid, and closeout is accepted.
- In a test shaped like the ergonomics run, the CR is corrected at OR, TP Review and Clean Implementation Review are recorded at OR, and closeout is accepted.
- A correction with a changed decision, a changed classification or still invalid rows, a re-recording of a review without invalid rows, and a correction attempt at a gate other than OR are refused; any other change to approved material still invalidates the approvals.
- A closeout refused for invalid rows names the finding and the correction path.
- `npm run test:verification`, the CLI smoke suite and the mcp-server suite pass; the change passes this run's CR and QA.

## 6. Existing Source Of Truth

- `plugins/agdf/meta/contracts/quality.md` (Normalized Review Gaps) and `packages/core/lib/control-evaluation/normalized-gaps.js` (`validNormalizedGap`, `declaredRoutes`).
- `packages/core/lib/control-evaluation/qa-follow-up.js` (`inspectQaReports`) and `packages/core/lib/control-state/run-steps.js` (step recording, closeout quality check).
- `packages/core/lib/control-state/run-operation-proof.js` (`internalStepEligibility`, D4 late path), `packages/core/lib/control-state/presentation-decision.js` (`approvedMaterialFindings`), `packages/core/lib/control-state/evidence-bindings.js` (`bindingSourceAssociation`, `evidenceApplicability`), `packages/core/lib/control-state/run-operations.js` (receipts).
- Evidence: the refused closeout operation `0dfceb39-e382-46ac-bfca-4b70ffad2aeb` on run `core-approval-lock-defects-20261017-01`, and the owner's analysis of run `mcp-ergonomics-baseline-20261016-01`.

## 7. Risks And Unknowns

- The correction path changes recorded evidence after human decisions. It must stay narrow and provable: only invalid rows trigger it, decision and classification stay equal, and the proof must survive without a receipt schema change. The SD decides how the approvals recognise a correction.
- A run corrected by the new runtime may look changed to an older installed runtime; the SD assesses this compatibility effect.
- The earlier check may refuse reviews or QA reports that agents wrote in the past without error; the refusal must say exactly what to fix.
- The installed plugin runtime 0.14.5 that governs this run contains neither D4 nor D5; this run's own reviews must therefore use valid rows and be recorded before the QA report.

## 8. Next Step

Review this UR and approve only with `Approval: UR`. Then the Brownfield Review and Mode/Slice decision follow. Nothing is implemented yet.

## AGDF Approval Summary (de; source=en)

- Problem: Ungültige normalisierte Befundzeilen in Reviews werden erst beim Closeout erkannt, nach allen menschlichen Freigaben, und lassen sich dort nicht mehr korrigieren. Der Run core-approval-lock-defects-20261017-01 steht deshalb am OR fest: Alle 22 Befundzeilen seiner drei Reviews haben `none` als required_next_step, was der Quality-Vertrag verbietet. Erfassen, QA-Vorlage und die Freigaben QA und UAT haben das akzeptiert; nach der UAT-Freigabe sind weder Neuerfassung noch Quellrevision möglich. Der Run mcp-ergonomics-baseline-20261016-01 steckt genauso fest (16 ungültige Zeilen im erfassten Code Review).
- Ziel: Ungültige Befundzeilen werden schon beim Erfassen eines Reviews oder QA-Berichts mit Befund-ID und Feld abgelehnt. Ein Run am OR-Gate kann ein betroffenes Review aus einer korrigierten Quelle mit unveränderter Entscheidung neu erfassen, ohne Freigaben zurückzusetzen, und danach abschließen.
- Betroffene: Nutzer, die Gates freigeben; Coding-Agenten, die Reviews und QA-Berichte schreiben; der Owner der beiden festsitzenden Runs.
- Umfang: Prüfung der Befundzeilen beim Erfassen von TP Review, Clean Implementation Review, CR und QA-Bericht mit demselben Prüfer wie beim Closeout; Korrekturpfad am OR-Gate über das bestehende step.record, nur wenn die erfasste Fassung ungültige Zeilen hat und Entscheidung sowie Klassifikation der Befunde gleich bleiben; QA- und UAT-Freigaben bleiben genau bei einer solchen Korrektur gültig; eine Closeout-Ablehnung nennt Befund und Korrekturpfad; zwei Abnahmefälle im Test, geformt wie die beiden festsitzenden Runs.
- Abnahme: Ungültige Zeilen werden beim Erfassen mit Befund und Feld abgelehnt; im nachgestellten festsitzenden Zustand gelingen Korrektur und Closeout bei gültig bleibenden Freigaben, auch im Fall des Ergonomie-Runs mit nachgetragenen Reviews; geänderte Entscheidung oder Klassifikation, gültige Altfassung und andere Gates werden abgelehnt; die Suiten sind grün, CR und QA bestanden.
- Quellen und Abgrenzung: Zuständig bleiben quality.md, normalized-gaps.js, qa-follow-up.js, run-steps.js, run-operation-proof.js, presentation-decision.js und evidence-bindings.js. Nicht enthalten: eine Lockerung des Vertrags, allgemeines Ändern erfasster Reviews, Änderungen am Receipt-Schema, die Reparatur der beiden Runs selbst und jede Änderung am Ergonomie-Run.
- Risiken und Klärung: Der Korrekturpfad ändert Evidenz nach menschlichen Entscheidungen und muss eng und nachweisbar bleiben, ohne neues Receipt-Feld; das SD entscheidet, wie die Freigaben die Korrektur erkennen und wie ältere Laufzeiten damit umgehen. Die installierte Laufzeit enthält weder D4 noch D5, daher nutzt dieser Run nur gültige Zeilen.
- Nächster Schritt: Diese UR prüfen und nur mit `Approval: UR` freigeben. Danach folgen Brownfield Review und Mode/Slice-Entscheidung.
