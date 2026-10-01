# QA Report: Explicit Local Approval Command

Status: pass
Gate: QA
Gate approval: open
Based on: Approved TP.md; BROWNFIELD_ANALYSIS.md; CD_TESTS.md; TP_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md; CR.md
Date: 2026-10-01
Owner: agent; qa-gate is the sole Quality Readiness decision owner

## QA Decision

Decision: pass

The approved cooperative local command slice is sufficiently evidenced in the repository, actual packed external consumer and generated local validators on macOS darwin/x64. One approved operation is recorded atomically with its receipt, exact replay adds no revision/restores no approval, stale/conflicting/unsupported requests do not become effects, and uncertain interrupted state remains explicit. This is a scoped QA assessment; it is not the user's Approval: QA, UAT, installed-host qualification or release readiness.

## Quality Readiness

| dimension | evidence owner | status | decisive evidence |
|---|---|---|---|
| Plan coverage | task-plan-review | pass | TP_REVIEW.md: 9/9 approved tasks, 9/9 ACs, 32/32 scenario families and fulfilled applicable command-surface fidelity |
| Solution integrity | clean-implementation-review | pass | Existing canonical approval/policy/Run owners; one sealed history; no parallel ledger/policy; qualified additive package boundary |
| Code quality | code-review | pass | Actual diff/neighbor review; CR-001/CR-002 corrected and resolved with final executable evidence |
| QA decision | qa-gate; sole decision owner | pass | Applicable evidence and normalized findings verified; no open or invalid applicable gap; explicit qualification ceiling |

Decisive reason: Approved behavior is implemented and traced to executed evidence without an unresolved applicable finding.
Permissible next action: Present this exact sealed QA report and request a new deliberate Approval: QA.

## TP Coverage

All nine tasks are fully_done with high-confidence evidence for the approved limited slice. All nine PRD criteria are done; all applicable UX Intent Fidelity rows are fulfilled using actual command-consumer JSON/status presentation and state assertions. The command surface is the requested product surface; code existence alone is not counted as visible behavior. A fresh human-visible Codex host session remains unobserved.

The approved TP does not define separate P0/P1 priorities; QA has assessed every relevant task and cannot hide an incomplete task through priority interpretation. No approved task, criterion, scenario family or Context Graph follow-up remains open. T-009's durable review and qualification inputs are complete; qa-gate alone makes this final quality decision.

## Evidence

- QA_INPUT_VERIFICATION.json: final 29 source-file hashes, all 18 execution-log hashes, additional executable consumer evidence hash, protected architecture files and unrelated backlog rows verified immediately before this decision.
- SOURCE_IDENTITY.json: exact source commit and final source digest 8181d52a5530f3d9522ccee9ba48ff1cd152f516a80fcbe4db67e94092474e34; Node v22.22.3 / darwin/x64; unchanged installed runtime explicitly lacking the new command.
- EXECUTION_EVIDENCE.json: dated commands and hashes; final review corrections rerun through unit, real-process, actual packed/generated consumer and MCP contract/continuation/safety tests. Corresponding review-final logs supersede earlier executions.
- Packed identity: create-agdf 0.14.5 development tarball d2f82e8789a2f2e833f384496e322586b3507aa7b4b9ba090677359fbf9828f3, 633 files; external package-name import/execution, 38-module closure, import-effect instrumentation, missing-resource negatives and unchanged existing export targets.
- Generated shared/Copilot validators: current module/resource inventory and manifest/version/digest captured separately; selected actual approval/replay and missing-resource assertions executed. Isolated package-build, Copilot profile, release-version coherence, package contents, local validator, plugin MCP runtime and integrity layout/negative regressions pass.
- Actual process evidence: SIGKILL before replacement, after replacement and before response; confirmed exit before abandoned-lock reclamation; simultaneous CLI/API identical/distinct/changed-payload competitors; final authoritative bytes and one-effect revision checks. Live/unknown owners remain protected.
- CR-001: SCN-002 throws from accessors on every command field if invoked; all are rejected with zero invocations and unchanged Run.
- CR-002: final unit/consumer results carry exact safe retry/unknown-owner instructions; review-consumer.json captures inspect, decline, missing reply, unsupported authority, live/unknown lock, accepted submit, replay and conflict observations. Its inspect plus eight result objects are executable consumer evidence, not human visibility proof.
- Receipt/history integrity: codec/version/row/duplicate/history corruption rejected; generic writers cannot fabricate/remove receipts; supported recovery clears effective approval while preserving only trusted history; legacy receipt-free seal is byte-identical; exact historical replay never restores approval.
- Legacy gate/control/presentation/localization/revision/recovery tests remain valid. Current-workspace cli-modularization has the same independently recorded pre-existing architecture README assertion. The complete CLI suite passes in an isolated snapshot with only that HEAD-document input restored and current changed code. No assertion or working architecture document was weakened.
- Documentation: README states the closed API, cooperative ceiling, compatibility, replay/recovery and evidence limits. Copilot payload is exactly 136 files / 1274410 bytes, 23303 bytes above its previous ceiling; provenance/exclusion/growth guards remain enforced.
- Workflow comparison: successful reference path remains three calls, one prepared presentation, zero corrections in each lane. After a lost postcommit response the new lane returns already_applied; the legacy lane rejects the retry. No call-count/time-reduction or actual-human-decision claim is made.

## Normalized Findings Consumed

CR-001 and CR-002 are implementation_gap -> CD+Tests, both resolved with the routed production corrections and fresh evidence. Their classifications are consumed unchanged from CR.md. TP/clean reports contain no open or invalid normalized finding. There is no requirements/design/plan gap being invented or silently reclassified by QA.

## Missing Evidence

None required for the accepted source/packed/generated cooperative macOS slice. The following stronger claims are unsupported and excluded from this pass: native Linux/Windows behavior/durability; new command in the currently installed plugin; fresh human-visible host observation or measured human reading time; independently verified human decision; complete current-workspace smoke or release qualification. The existing README baseline failure is visible, not labelled green or silently removed.

## Risks

- The supported authority remains cooperative caller-forwarded deliberate reply. Hashes/presentations/receipts are not independent human proof or a defense against an OS user's arbitrary filesystem writes.
- Receipt-bearing Runs require an aware upgraded runtime. Legacy receipt-free Runs retain the original seal/behavior; no receipt migration or backfill is claimed.
- Filesystem interruption evidence covers the selected native environment and supported file/directory flush acknowledgement, not hardware power-loss guarantees or unexecuted native platforms.
- Unrelated architecture documentation work remains separately owned. Its existing assertion failure must be resolved and complete smoke rerun before a whole-workspace release claim.
- No publication, installation or VCS action is part of this QA scope. Later rollout qualification needs its own authorization and current evidence.

## Context Graph and persistence

- context_graph_impact: link_only
- context_graph_refs: CG-RUN-SCOPED-CONTROL-STATE; CG-MCP-DISPATCH-ADAPTER
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Existing canonical nodes, BROWNFIELD_ANALYSIS.md and linked CD/review/QA evidence preserve the state/adapter owners. No new SoT or graph curation obligation was introduced.
- memory_target: scope_artifact
- memory_reason: Evidence, local measurements and qualification belong to this Run.
- memory_refs: QA_REPORT.md; QA_INPUT_VERIFICATION.json; SOURCE_IDENTITY.json; EXECUTION_EVIDENCE.json; TP_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md; CR.md
- impact_codes: not_applicable; no additional project quality-code registry was required by this slice

## Required Next Step

Prepare and show the current revision-bound QA presentation, then request a NEW deliberate Approval: QA. Existing UR/PRD/SD/TP approvals or "leg los" do not approve QA. UAT remains gated; this assessment does not authorize installation, release or project VCS actions.

## AGDF Approval Summary (de; source=en)

- Entscheidung: QA pass für den freigegebenen lokalen, kooperativen Slice auf macOS. CLI und öffentliche API nutzen denselben Freigabeservice; Freigabe und Beleg werden gemeinsam gespeichert. Exakte Wiederholung erkennt die ursprüngliche Wirkung ohne zusätzliche Revision oder Wiederherstellung widerrufener Freigaben.
- TP-Abdeckung: Neun von neun Aufgaben, alle neun Abnahmekriterien und 32 Szenariofamilien sind belegt. Plan-, Struktur- und Code Review sind abgeschlossen. Zwei im Code Review gefundene Randfälle wurden korrigiert und erneut geprüft.
- Belege: Quelltests, echte parallele und abgebrochene Prozesse, externer Verbraucher des tatsächlich entpackten npm-Pakets sowie generierte Validatoren sind geprüft. Finale Quell- und Log-Hashes sind verifiziert. Der normale Erfolgsweg bleibt bei drei Aufrufen; der Gewinn liegt in der eindeutigen Wiederholung nach verlorener Antwort.
- Fehlt: Neue installierte Plugin-Ausführung, frische sichtbare Host-Beobachtung, native Linux-/Windows-Prüfung und unabhängiger menschlicher Entscheidungsnachweis sind nicht qualifiziert. Der bekannte, vorbestehende Architektur-Dokumentationstest verhindert eine Aussage über eine vollständig grüne Workspace-Suite.
- Risiken: Die Autorität bleibt kooperativ; neue Beleg-Runs brauchen die passende Runtime. Installation und Veröffentlichung gehören nicht zum freigegebenen Umfang. Die Qualitätsbewertung ersetzt keine Nutzerabnahme.
- Nächster Schritt: Mit Approval: QA diese konkrete Qualitätsbewertung bestätigen; anschließend folgt UAT. Bis dahin bleiben Nutzerabnahme und Veröffentlichung gesperrt.
