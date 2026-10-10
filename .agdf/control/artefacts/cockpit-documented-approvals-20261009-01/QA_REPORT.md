# QA: Compact documented approvals with truthful version links

Decision: pass
Status: pass
Gate: QA
Gate approval: open
Based on: TP
Owner: qa-gate / Codex cooperative_local
Date: 2026-10-10
Run: cockpit-documented-approvals-20261009-01
Language: en
Evaluated revision: a0eef95a-73f8-49fb-bae2-96f5fd82b5d2

## Quality Readiness

| Dimension | Outcome | Decision owner/evidence |
|---|---|---|
| Plan coverage | pass | task-plan-review; TASK_PLAN_REVIEW-02.md, T-001..T-008 fully_done and all applicable AC/UX rows fulfilled |
| Solution integrity | pass | clean-implementation-review; CLEAN_IMPLEMENTATION_REVIEW-02.md, existing owners and bounded primary solution |
| Code quality | pass | code-review; CODE_REVIEW-02.md, actual 27-path increment and all normalized findings resolved |
| QA decision | pass | qa-gate is the sole final Quality Readiness decision owner; this report |

Decisive reason: All 20 approved mandatory scenarios have current attributable executable/visible/transport/protection evidence; no unresolved normalized finding or acceptance gap remains. The implementation/check result is bounded, non-authorizing and version-specific. Next permissible action: present this exact current QA report and request a new deliberate Approval: QA. This projection neither records that approval nor replaces canonical gate-check.

## Exact source binding

| Source | Approved canonical digest |
|---|---|
| UR | sha256:db2ce267f9330751e0eb6c27027fba09b0be3e19889dff206423025b7e1a6495 |
| PRD | sha256:e4e91bc9937182dcb470cb2506a55deae611fc9d0d31358c84e9b55748185a74 |
| SD | sha256:430017b29921d6d1cfe3150786f1a3a444dff76408377032ffa693cf3d2aa834 |
| TP | sha256:ac12ce007409e7bbb936e4c23f12f8a77f3b9d4fae4ed23886b0ed37b8b5b6f4 |

The current renewed sources and source-revision archive were checked unchanged in PROTECTED_AFTER-final.json. Old sources, approvals, inline test evidence and prior native observations are historical only. The reviewed QA_REPORT tests the exact current TP, through the existing typed mapping/recording writer; no approval is inferred.

## Evidence and fulfillment

- Preparation/implementation: BROWNFIELD_ANALYSIS-02.md, CD_TESTS-02.md, renewed baseline and retained WIP copies.
- Full executable/scenario mapping: evidence/renewed/VERIFICATION.md, SCENARIO_RESULTS.json, READ_ONLY_WINDOWS.json and PROOF_FIXTURES.json. Eighteen focused Core cases, 154 actual baseline differential proof comparisons, unchanged 210 recording assertions/20 source-revision scenarios, 50 distinct scoped/lifecycle cases, 126 scoped UI cases, nine actual HTTP/worker cases, six actual STDIO fixture/protocol combinations and 25 distinct built browser cases are evidenced. Overlapping reruns are not counted as extra coverage. Latest affected authoring/transport cases were rerun after exact diagnostic classification.
- Exact qualification: BUILD_IDENTITY-quality.json, RUNTIME_QUALIFICATION-quality.json and immutable qualified-browser-review/qualified-mcp-review. Actual returned MCP HTML hash is sha256:1adf4ff5985aa747176450849cce1eeffd31c3445dead0a113c6f83ae20200c6, 1081513 bytes; current source/Core/server/dispatcher/SDK and unchanged dependency identities checked.
- Visible fidelity: real zero/four/six registrations, consumer-only multiple/long and old-absence variants, truthful state/action text, actual approved bytes and prior unconfirmed approval, real current check/correction reader/return, busy deliberate retry/reload, keyboard and light/dark compact/expanded cases. Twelve measured 320/960 transitions retained same focused DOM row/action, at least 44px targets and no horizontal loss. Screenshots were inspected; no observed resize/scroll/list instability. These observations are browser/card consumer evidence.
- Scope/protection: SCOPE_REVIEW.md, INCREMENT-final.json and increment-final.patch; 27 attributable paths, 5375 protected paths unchanged, HEAD unchanged, whitespace check passed, no VCS/install/config/publication operation. Existing snapshot containment, proof/authoring/writer/selector/session authority stays in its owners.
- T-009: This sole qa-gate operation evaluates the complete approved scope and records this genuine decision and exact source derivation. QA human approval, UAT and closeout remain later separate steps. Supporting TP Review truthfully preceded this QA operation.

## Review findings consumed

CODE_REVIEW-02 normalized CR-001..CR-003 are implementation_gap → CD+Tests, resolved, with concrete shared handoff validation, recorded-approval association and exact diagnostic-code negative regressions plus affected actual transport/browser evidence. Their classification was consumed unchanged. TP/Clean reviews introduce no open or unknown normalized finding. All six applicable UX Intent Fidelity rows are fulfilled. No missing PRD acceptance, design/owner decision, plan coverage or unexplained SoT drift was invented or suppressed.

## Limits, missing evidence and risks

- missing_evidence: none mandatory under approved SD/TP.
- native_host_observed: false. No fresh native Codex MCP-App initialize/render/interaction/teardown for these exact final assets. Native observation is optional in this TP; NATIVE_LIMITS.md explicitly separates it from required passing browser/HTTP/STDIO qualification. Earlier user observations do not transfer.
- risks: Version/proof and current-result association remain policy-sensitive; future changes must retain exact negative/parity/boundary tests. Existing event/timeout tests are sensitive to execution conditions; initial sandbox/parallel failures and fixture errors remain in VERIFICATION with unchanged successful host/serial reruns, not waived assertions. No production workaround was added. Consumer-only multiple-reference/old-server fixtures do not claim a registry expansion or canonical approval.
- impact_codes: AGDF_STATUS_CARD_PARALLEL_RULE_MODEL assessed; no parallel transition/approval model, new writer or App semantic evaluator.

## Knowledge and documentation

- memory_target: scope_artifact
- memory_reason: Run-specific executable qualification, source/protection and visible evidence
- memory_refs: evidence/renewed; MCP_CANDIDATES.md
- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Protected Context Graph/SoT registry unchanged; existing docs/architecture/06-agdf-cockpit.md documents the tested additive contract. No durable graph knowledge or owner migration claimed.

## Required next step

Present this exact report through the existing canonical run-present and request a new deliberate Approval: QA. Until then QA is not approved; UAT/OR/release or automatic VCS actions are not permitted.

## AGDF Approval Summary (de; source=en)

- Ziel: Die kompakte Dokumentübersicht mit zwei Spalten, verständlichen Zuständen und versionsgerechten Leselinks wurde umgesetzt. Die große Dokumentansicht zeigt passende Prüfbefunde und ursprüngliche Freigabeangaben.
- Ergebnis: QA pass. Code Review und Clean Review bestehen; 8/8 Aufgaben vor QA und alle sechs UX-Kriterien sind erfüllt. Die abschließende QA-Bewertung ist durchgeführt; eine menschliche QA-Freigabe steht noch aus.
- AC-001: Tatsächlich registrierte Dokumente einschließlich Entwürfen zählen korrekt; null/vier/sechs sowie mehrere und lange Verweise, fehlende Quellen und die kompakte Liste sind geprüft. Keine aufklappbaren Listeneinträge oder eigener Freigabelink.
- AC-002: Echte passende Entwurfsbefunde stimmen zwischen Prüfung, Zeile und Leser überein. Gültige Navigation erhält einen begrenzten Befund; Neuladen, geänderte Quellen und Sitzungsende entwerten ihn. Unbekannte oder technische Fehler bestätigen keinen Dokumentfehler.
- AC-003: Die bestehende Belegprüfung bleibt unverändert. Bestätigte Freigabe verlangt exakte gelesene Bytes und aktuelle Integrität; geänderte, fremde, beschädigte oder unbestätigte Fassungen erhalten keine falsche Freigabebehauptung.
- AC-004: Große Ansicht, Tastatur, Schließen/Fokusrückkehr, Scrollen und gemessene 320/960-Pixel-Container bestehen mit stabilen Zeilen. Herkunftslücken werden ausdrücklich benannt.
- AC-005: Core-, UI-, reale HTTP-/Worker- und STDIO-MCP-Prüfungen bestehen; Zusatzdaten werden streng zugeordnet, alte fehlende Angaben bleiben unsicher. Lesevorgänge ändern keine Kontrollquellen und prüfen nicht automatisch.
- AC-006: Quellen, Builds, Laufzeit und 5375 geschützte Dateien sind geprüft. Pflichtreviews und alle 20 Szenarien sind belegt. Die native Codex-Host-Beobachtung dieser finalen Fassung fehlt und war optional; frühere Belege werden nicht übertragen.
- Umfang und Grenze: Keine Installation, Konfiguration, Git-Aktion oder Veröffentlichung. Frühere Testfehler und erfolgreiche Wiederholungen sind im Prüfbericht nachvollziehbar dokumentiert; kein Pflichtfall wurde übersprungen.
- Nächster Schritt: Neue Approval: QA für diesen Bericht. Danach folgt die separate UAT-Freigabe; QA pass ersetzt keine menschliche Freigabe.
