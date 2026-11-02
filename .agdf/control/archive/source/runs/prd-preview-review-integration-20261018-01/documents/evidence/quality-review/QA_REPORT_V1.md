# QA Report: Bound PRD preview review

Status: draft
Gate: QA
Gate approval: open
Based on: approved TP, implementation evidence, TP/Clean/Code Reviews
Date: 2026-10-19
Owner: Codex, qa-gate decision owner; Arndt Gold decides human gates

## Quality Readiness

| Dimension | Evidence owner | Result |
|---|---|---|
| Plan coverage | task-plan-review | pass for the implementation and obligations due before QA; all 30 scenarios covered |
| Solution integrity | clean-implementation-review | pass; existing owners and trust boundaries retained |
| Code quality | code-review | pass; five reproduced findings resolved and reverified |
| QA decision | qa-gate, sole final decision owner | pass within the explicit local/Core/package/synthetic-browser qualification scope |

This projection derives from the reports below and creates no separate approval authority.

## 1. QA Decision

Decision: pass

The approved implementation and required pre-QA checks are sufficiently evidenced. No applicable
open or invalid normalized finding or unfulfilled UX fidelity row remains. This technical decision
does not grant human QA/UAT approval, native-host qualification, deployment or release.

## 2. TP Coverage

- delivered_result: Required PRD previews can now be retained as exact Run-local versions, validated before presentation and actual approval, read through the existing bound decision/Inspect owners, and explored in an isolated review surface while one existing deliberate PRD approval remains authoritative. Missing, unsafe, foreign or changed evidence cannot approve the old basis.

The approved TP remains the reference, with its exact source digest
sha256:150cea2ce16e423488ae6ec411388943f0849f82d2a0193e9c0e36d27bc859c5.
T-001 through T-009 are fully_done; the pre-QA review obligations of T-010 are complete. Its future
QA decision and deliberate QA/UAT/OR lifecycle portion was reported partially_done at review entry;
no future human gate is marked completed or treated as a circular prerequisite for this technical
evaluation. No applicable implementation task is partial or unverified.

The [TP Review](TP_REVIEW.md) evaluates every task and all 30 scenarios with evidence/confidence.
All ten applicable PRD UX criteria have fulfilled fidelity rows in the tested local/synthetic scope.
It preserves the example product's unanswered missing-proof policy, rather than selecting an answer.

The [Clean Implementation Review](CLEAN_IMPLEMENTATION_REVIEW.md) verifies the sole PRD association,
one inspector, existing presentation/transaction/history/read ownership, explicit compatibility and
safe same-material access. The separately requested Core import-cycle correction repairs ownership
beneath orchestration, retaining public identities, original algorithms and the strict graph guard.

The [Code Review](CODE_REVIEW.md) records five resolved implementation findings. Their retained red
reproductions and final regression results establish the corrections: bounded CSS DAG expansion,
relative imported images, disabled approval during retry, visible open questions, and cancelled or
expired read denial. There is no new approval type, click/view receipt or product-source authority.

## 3. Evidence

- tp_review: TP_REVIEW.md
- clean_implementation_review: CLEAN_IMPLEMENTATION_REVIEW.md
- code_review: CODE_REVIEW.md

| Actual observation | Current evidence | Scope and result |
|---|---|---|
| Requirement/descriptor/resource and actual approval/history/read execution | evidence/code-review/preview-final.log | Four preview programs pass; exact boundaries, hostile inputs, publication recovery, stale reply and actual persisted outcome assertions |
| Existing document/material/action/QA compatibility | evidence/code-review/core-regressions.log; evidence/core-cycle-fix/run-flow.log | Four final programs and prior full 18-program canonical group pass; older predicates preserved |
| Components and TypeScript | evidence/code-review/components-final.log | 269 tests across 24 files and typecheck pass |
| UI server | evidence/code-review/ui-browser-intermediate.log | Eight server tests passed before the then-failing component assertion; server unchanged, final corrected component/browser results are separate |
| Real Chromium and Core-backed preview port | evidence/code-review/browser-final.log and screenshots | 19 final browser cases pass; complete/missing proof, return/focus, questions, 736/360/320px and actual CSP/sandbox denial |
| Actual built SDK resource and assembled-Core lifecycle | evidence/code-review/browser-final.log | Separate synthetic SDK cases prove built-resource interaction/recovery and retirement; not a native preview-host attestation |
| Text/session metadata and expanded actual approval matrix | evidence/quality-review/approval-matrix.json and approval-matrix-final.log | Task/version/scenario/criterion/question agree; nine invalid real-file/material cases yield no receipt and no Run change, unchanged valid case succeeds |
| Exact final tarball outside checkout | evidence/code-review/final-packed-smoke.json; packed-final.log | 1344 packed files, 31 export identities, normalization, confined pinned parsers, actual renderer/imported-image regression pass |
| Full command package and source revisions | evidence/core-cycle-fix/package.log, revision.log and execution-index.json | Actual package command suite passes; current/early/source-phase and recovery coverage retained with partial-stream limitations explicit |
| Dependency graph and solution structure | evidence/code-review/contracts-boundary.log; evidence/core-cycle-fix/movement-audit.json | Strict unchanged 142-module guard passes; 42 moved declarations retained byte-identically |
| Clean source, generation, package/contract/integrity | evidence/code-review/clean-final.log; final-contracts.log; contracts-boundary.log | Fresh dependencies, generation/assembly, actual Core/Community execution, MCP package and installed-layout inventory pass |
| Canonical verification registration | evidence/core-cycle-fix/verification.log; packages/cli/package.json test:run-command-flow | Fifteen infrastructure tests pass; four new preview programs are invoked by the existing canonical command group |
| Adapter evidence | evidence/code-review/compatibility-final.log; final-contracts.log | Fresh deterministic 56-case recording and read-only recheck pass; historical native observations not upgraded |
| Measured payload | evidence/code-review/budget-final.json | 394 files / 3406116 bytes pass at the exact measured ceiling |
| Source and evidence continuity | evidence/quality-review/source-evidence-integrity.json | 163 inspected files unchanged; 102 retained files match manifests; approved sources and Run seal valid |

The supplemental matrix first expected rejected for direct protected PRD mutation. Core correctly
returned recovery_required/seal_invalid, no receipt, no state change. The harness now asserts that
exact existing outcome for those cases; the original failed expectation is retained. Specific
descriptor facts are separately tested at the material owner. No approval or validation predicate
was relaxed, and no invalid source was resealed to pass a test.

No production code changed during this quality review; verified source hashes still match the
completed Code Review. Tests were not repeated merely to produce another green log. The fresh
supplemental matrix closes the specific text/metadata and actual invalid-command evidence seam.

## 4. Missing Evidence

- qualification_limits: Installed Codex/Claude/other native-host preview rendering, supported interaction and teardown, native Windows/Linux execution, assistive-technology testing and independent human comprehension were not observed. The qualified scope is local macOS Node 22 Core/API/package/STDIO and synthetic Chromium/SDK verification; these results do not qualify any installed host.

These are explicit boundaries of the approved SD/TP, not a waiver of an applicable required test.
No particular native host is claimed supported by this change. A future native-host or additional
platform claim requires its own actual evidence. Synthetic approval fixtures are not human
responses, and agent self-review is not an independent review. Human product judgment remains UAT.

The current Run's originally approved UR/PRD bytes were preserved: its earlier prototype evidence
is not silently migrated into a new machine descriptor. New required declarations and explicit
adoption are exercised on real disposable fixture Runs through the approved version strategy.

## 5. Risks

- delivery_risks: The new executable preview path requires the tested CSP/opaque sandbox and supported static-resource grammar; unsupported content stays unavailable. File/lock validation provides cooperative filesystem assurance, not malicious-process atomicity. The measured payload has zero spare headroom, so future payload growth requires the existing explicit budget review. Installation and native-host qualification remain separate work.

No unresolved security, source-of-truth, implementation or product-semantic defect was identified
within this scope. Raw source and rendered snapshot identity remain separate, exact and bounded.
A failed or stale access path cannot become successful review/approval by retry or a frame message.
Retained historical compatibility keeps its original predicates; it does not create preview proof
for older receipts. No temporary workaround, second status-policy owner or silent default was found.

Documentation and Context Graph assessment:
- memory_target: scope_artifact
- memory_reason: Keep this Run's evidence and limits with its artifacts; no personal-memory change.
- context_graph_impact: link_only
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-NATIVE-INTERACTION-AUTHORITY; .agdf/control/SOT_REGISTRY.md; SD.md; CLEAN_IMPLEMENTATION_REVIEW.md
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Clean Review verifies existing Core/contract/drafting/read/package owners and links current implementation without rewriting historical or unrelated open host evidence.
- impact_codes: AGDF_STATUS_CARD_PARALLEL_RULE_MODEL checked; no parallel rule model introduced.

German canonical handbook and derived English reference/parity checks pass. The PRD/UR/UX guidance
distinguishes retained proposed interaction from binding product criteria and deliberate approval.
No source-of-truth drift was found; older Context Graph nodes' outstanding qualifications remain intact.

## 6. Required Next Step

Present this exact QA report through the existing gate-check/presentation owner for a new deliberate
human QA response. Approval permits UAT preparation; it does not grant UAT, installation, merge,
publication or release. Remain at QA until that exact approval is recorded.

## 7. Gate Approval

Approve this QA decision only with:

`Approval: QA`

## AGDF Approval Summary (de; source=en)

- Ziel: Die vorgeschlagene Bedienung vor der Implementierung beurteilen und bewusst dieselbe geprüfte PRD-Grundlage freigeben.
- Ergebnis: Erforderliche PRD-Vorschauen sind als genaue Fassung beim Run ablegbar und aus der bestehenden Entscheidung zugänglich. Core prüft Quellen, Dateien und Prüfsummen vor Präsentation und tatsächlicher Freigabe. Fehlende, unsichere, fremde oder veränderte Nachweise können die alte Grundlage nicht freigeben. Die isolierte Vorschau verändert nur Beispielzustände; eine bestehende bewusste PRD-Freigabe bleibt maßgeblich.
- Entscheidung: QA pass für den belegten lokalen Core-, Paket-, STDIO- und Browserharness-Umfang. TP-, Clean- und Code-Review sind bestanden. Die neun Implementierungsaufgaben und alle 30 Szenarien sind belegt; spätere menschliche QA-/UAT-Entscheidungen und OR bleiben offen.
- Belege: 269 Komponententests, 19 Browserfälle, echte Datei-/Freigabe-/Historien-/Sitzungstests, zusätzliche ungültige Freigabefälle, strikte Paketgrenzen, isoliertes Produktionspaket und sauberer Quellstart sind grün. Fünf Code-Review-Befunde sind behoben und nachgeprüft. Bestätigte Produktquellen und gespeicherte Nachweise sind unverändert geprüft.
- Grenzen: Keine neue Qualifikation eines installierten Codex-/Claude- oder anderen nativen Hosts, keine native Windows-/Linux-Ausführung, keine assistive Prüfung und keine unabhängige menschliche Verständlichkeitsprüfung. Agenten- und synthetische Browserbeobachtung werden ausdrücklich getrennt. Die offene Nachweisregel des Beispielprodukts bleibt unbeantwortet.
- Risiken: Isolation und die begrenzte unterstützte Ressourcengrammatik sind erforderlich. Die Dateiprüfung setzt kooperative Schreibzugriffe voraus. Das gemessene Paketbudget hat keinen freien Spielraum. Installation, zusätzliche Plattformen und native Host-Zusagen brauchen eigene Nachweise.
- Nächster Schritt: Diese QA-Entscheidung bewusst mit Approval: QA annehmen oder Änderungen verlangen. Eine QA-Freigabe erlaubt die UAT-Vorbereitung. UAT, Installation, Merge und Veröffentlichung sind damit nicht freigegeben.

