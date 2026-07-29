# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-product-maturity-roadmap
- lifecycle: active
- revision: 39
- revision_id: e744823d-103c-467e-8c91-c230a2ff8ea5
- mode: structured_delivery
- current_gate: CD+Tests
- decision: in_progress
- owner: user / agent

## Objective

AGDF entlang fünf evidenzbasierter Reifegradlinien weiterentwickeln: weniger sichtbare Zeremonie,
ehrliche technische Durchsetzung, echte Host-/Mehrturn-Conformance, bessere Proportionalität und
einfachere Nutzerinteraktion.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | `STAGED_PRODUCT_FINDINGS_ASSESSMENT.md` trennt r3 in Benchmark-Semantik/-Evidenzgaps, eine fehlende Structured-Depth-Grenze und einen QA-Block-Approval-Projektionsfehler. Die dauerhafte QA-`pass`-Prüfung verhindert UAT; ein Autoritätsbypass ist nicht belegt. |
| What is approved? | Roadmap-UR, PRD, SD und TP sind durch exakte Freigaben vom 2026-07-28 genehmigt; Pre-Implementation Brownfield Analysis entscheidet `pass`. |
| What is missing? | Eigene Child-URs für QA Transition Integrity und Structured Delivery Depth Boundary; Benchmark v3 bleibt von der kanonischen Depth-Entscheidung abhängig; RMP-09 bis RMP-12. |
| What is the next allowed action? | Die separate Child-UR Revision 1 für `agdf-qa-block-transition-integrity` prüfen und entscheiden. |
| What is explicitly forbidden right now? | Runtime-/Plugin-Code im Parent, Approval-Vererbung, vorsorgliche Child-Scopes ohne Gap und automatische VCS-Aktionen. |

## Source And Scope State

- primary_target: AGDF-Produktreifegrad-Roadmap
- governance_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- evidence_sources: aktuelle AGDF-Contracts, Skills, Control State, aktive und abgeschlossene Runs, Repository-Tests und explizite Live-Host-Evidenzgrenzen
- working_directory: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- scope_stability: durch den unmittelbar vorausgehenden benannten Run und exaktes `Approval: UR` bestätigt
- competing_scope_lines: `task-target-resolution-boundary`, `agdf-interaction-ownership-quick-path-ux`, `opencode-single-install-activation`, `opencode-surface-hardening-parity` und weitere aktive Runs bleiben eigenständig
- excluded_mutation_targets: Implementierungscode, bestehende fremde Runs, VCS, Release und Reinstall

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exaktes `Approval: UR` am 2026-07-28 nach Run-, Ziel- und Scope-Revalidierung. |
| PRD | approved | Exaktes `Approval: PRD` am 2026-07-28 nach same-run, same-gate, revision-4 und durable-artefact revalidation. |
| SD | approved | Exaktes `Approval: SD` am 2026-07-28 nach same-run, same-gate, revision-5 und durable-artefact revalidation. |
| TP | approved | Exaktes `Approval: TP` am 2026-07-28 nach same-run, same-gate, revision-6 und durable-artefact revalidation. |
| QA | missing | Nicht zulässig. |
| UAT | missing | Nicht zulässig. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-product-maturity-roadmap/UR.md` | approved | Fünf Reifegradlinien, Lieferstrategie, Akzeptanzsignale und Nicht-Ziele. |
| Brownfield Review | `.agdf/control/artefacts/agdf-product-maturity-roadmap/BROWNFIELD_REVIEW.md` | done | `structured_delivery`; Roadmap koordiniert, Implementierung wird in eigenständige Runs geschnitten. |
| UX Intent Definition | `.agdf/control/artefacts/agdf-product-maturity-roadmap/UX_INTENT_DEFINITION.md` | ready | High-Impact-Analyse; Ziel, Modi, Zustände, Blocker, Recovery und PRD-Kriterien definiert. |
| PRD | `.agdf/control/artefacts/agdf-product-maturity-roadmap/PRD.md` | approved | PMR-1 bis PMR-7; freigegeben 2026-07-28. |
| SD | `.agdf/control/artefacts/agdf-product-maturity-roadmap/SD.md` | approved | AD-1 bis AD-10; freigegeben 2026-07-28. |
| TP | `.agdf/control/artefacts/agdf-product-maturity-roadmap/TP.md` | approved | RMP-01 bis RMP-12; freigegeben 2026-07-28. |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-product-maturity-roadmap/BROWNFIELD_ANALYSIS.md` | done | Pass; Phase A bleibt auf run-eigene Control-Artefakte begrenzt. |
| CD+Tests | `.agdf/control/artefacts/agdf-product-maturity-roadmap/CD_TESTS.md` | in_progress | RMP-01 bis RMP-08 done; RMP-09 bis RMP-12 bleiben offen. |
| RMP-07 Assessment | `.agdf/control/artefacts/agdf-product-maturity-roadmap/PROPORTIONALITY_SCOPE_ASSESSMENT.md` | completed | Baseline-Eingangsevidenz erfüllt; Child-Scope gerechtfertigt. |
| Proportionality Baseline | `.agdf/control/artefacts/agdf-product-maturity-roadmap/PROPORTIONALITY_BENCHMARK_BASELINE.json` | ready | 40 reale Fälle, sechs Pfade, 19 adversariale Fälle, 40/40 Quellen. |
| Proportionality Scope | `.agdf/control/artefacts/agdf-product-maturity-roadmap/PROPORTIONALITY_BENCHMARK_SCOPE.md` | ready_for_child_ur | Benchmark erweitert bestehende Eval-Owner und bewahrt alle PMR-4-Schwellen. |
| Proportionality Tests | `.agdf/control/artefacts/agdf-product-maturity-roadmap/PROPORTIONALITY_BASELINE_TESTS.md` | pass | Struktur-, Coverage-, Adversarial-, Referenz-, Redaction-, Schwellen- und Scope-Prüfungen grün. |
| Child UR | `.agdf/control/artefacts/agdf-proportionality-benchmark/UR.md` | approved | Exaktes Child-`Approval: UR` am 2026-07-28; Parent-Approvals wurden nicht vererbt. |
| Child Brownfield Review | `.agdf/control/artefacts/agdf-proportionality-benchmark/BROWNFIELD_REVIEW.md` | done | Pass; `structured_slice`; bestehende Eval-/Routing-Owner erweitern, keine zweite Autorität. |
| Child PRD | `.agdf/control/artefacts/agdf-proportionality-benchmark/PRD.md` | approved | Revision 2; exakt freigegeben 2026-07-28. |
| Child SD | `.agdf/control/artefacts/agdf-proportionality-benchmark/SD.md` | approved | Revision 2; separat exakt freigegeben 2026-07-28. |
| Child TP | `.agdf/control/artefacts/agdf-proportionality-benchmark/TP.md` | approved | Revision 2; separat exakt freigegeben 2026-07-28. |
| Child Brownfield Analysis | `.agdf/control/artefacts/agdf-proportionality-benchmark/BROWNFIELD_ANALYSIS.md` | done | Pass; bestehende Safety-Primitiven erweitern; expliziter Codex-/Modell-/Auth-/Budget-Preflight grün. |
| Child CD+Tests | `.agdf/control/artefacts/agdf-proportionality-benchmark/CD_TESTS.md` | done | Implementierung, Smoke und frische 120er-Serie vollständig. |
| Child Benchmark | `.agdf/control/artefacts/agdf-proportionality-benchmark/PROPORTIONALITY_BENCHMARK_REPORT.md` | block | 13 korrekt, 27 ambiguous, 0 Critical Under, 0/8 Small Over. |
| Child Reviews | `.agdf/control/artefacts/agdf-proportionality-benchmark/TASK_PLAN_REVIEW.md` | pass | TP 18/18; Clean/Code Review ebenfalls pass. |
| Child QA | `.agdf/control/artefacts/agdf-proportionality-benchmark/QA_REPORT.md` | block | Ambiguitäts-Stop-Bedingung greift; keine QA-Freigabe. |
| Ambiguitäts-Produktbefund | `.agdf/control/artefacts/agdf-product-maturity-roadmap/PROPORTIONALITY_AMBIGUITY_ASSESSMENT.md` | assessed | 26 Protocol-Stage-Mismatches, ein Baseline-Semantikfehler, null belegte Routingfehler; separater Protokoll-Child gerechtfertigt. |
| Protokoll-Child UR | `.agdf/control/artefacts/agdf-staged-proportionality-observation/UR.md` | approved | SPO-1 bis SPO-8; exakt freigegeben 2026-07-29. |
| Protokoll-Child Brownfield | `.agdf/control/artefacts/agdf-staged-proportionality-observation/BROWNFIELD_REVIEW.md` | done | Pass; `structured_slice`; vorhandene Pipeline erweitern. |
| Protokoll-Child PRD | `.agdf/control/artefacts/agdf-staged-proportionality-observation/PRD.md` | approved | Stage-/Pfadtrennung, Blindheit, historische Integrität und getrenntes Grading; exakt freigegeben 2026-07-29. |
| Protokoll-Child SD | `.agdf/control/artefacts/agdf-staged-proportionality-observation/SD.md` | approved | Eine profilfähige Pipeline, 72 Pflichtscenarios, Schema v2 und Legacy-Integritätsgrenze; exakt freigegeben 2026-07-29. |
| Protokoll-Child TP | `.agdf/control/artefacts/agdf-staged-proportionality-observation/TP.md` | approved | Revision 1; exakt freigegeben 2026-07-29. |
| Protokoll-Child QA | `.agdf/control/artefacts/agdf-staged-proportionality-observation/QA_REPORT.md` | block | Fresh r3 216/216; TP 24/24, Clean/Code pass; Block ausschließlich durch gültige Produktabweichungen. |
| Protokoll-Child OR | `.agdf/control/artefacts/agdf-staged-proportionality-observation/OR.md` | block | OR-full; Produktbefund upstream bewerten, kein Delivery-Handoff. |
| Staged Product Findings | `.agdf/control/artefacts/agdf-product-maturity-roadmap/STAGED_PRODUCT_FINDINGS_ASSESSMENT.md` | assessed | Drei getrennte Folgepfade; kein pauschaler Routingfehler und kein belegter Autoritätsbypass. |
| Enforcement Closure Scope | `.agdf/control/artefacts/agdf-product-maturity-roadmap/ENFORCEMENT_CLOSURE_SCOPE.md` | ready_for_child_ur | QA-Block-Approval-Projektion, bestehender Owner und negativer Test. |
| QA Transition Child UR | `.agdf/control/artefacts/agdf-qa-block-transition-integrity/UR.md` | draft | Revision 1; separate exakte Freigabe fehlt. |
| QA |  | missing | Nicht zulässig. |

## Mode/Slice Decision

- decision: `structured_delivery`
- required_next_gate: PRD
- scope_reason: Mehrere Hosts, Produktversprechen, UX, Routing-Qualität und Enforcement-Transparenz erfordern einen strukturierten Rahmen; ausführbare Arbeit bleibt in getrennten Runs.
- evidence: `.agdf/control/artefacts/agdf-product-maturity-roadmap/BROWNFIELD_REVIEW.md`

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exakte Freigabe am 2026-07-28 für `agdf-product-maturity-roadmap`. |
| UR | constrained_by | bestehende aktive und abgeschlossene AGDF-Runs | Brownfield Review muss Wiederverwendung und Scope-Grenzen bestimmen. |
| Brownfield Review | sizes | UR | `structured_delivery`; bestehende Owner wiederverwenden und ausführbare Restlücken in getrennte Runs schneiden. |
| UX Intent Definition | informs | PRD | Entscheidung `ready`; Nutzerziel, Modi, Zustände, Blocker, Recovery und zehn vorgeschlagene Akzeptanzkriterien. |
| PRD | derived_from | UR | PMR-1 bis PMR-7 operationalisieren die fünf genehmigten Reifegradlinien ohne gemeinsamen Implementierungs-Scope. |
| PRD | approved_by | `Approval: PRD` | Exakte Freigabe am 2026-07-28 nach Revalidierung von Run, Gate, Revision 4 und dauerhaftem Artefakt. |
| SD | derived_from | PRD | AD-1 bis AD-10 definieren Programmgrenze, unabhängige Child-Runs, vorhandene Owner und evidence-first Reihenfolge. |
| SD | approved_by | `Approval: SD` | Exakte Freigabe am 2026-07-28 nach Revalidierung von Run, Gate, Revision 5 und dauerhaftem Artefakt. |
| TP | derived_from | SD | RMP-01 bis RMP-12 planen Parent-Koordination und getrennte Child-Gates ohne Roadmap-Code-Scope. |
| TP | approved_by | `Approval: TP` | Exakte Freigabe am 2026-07-28 nach Revalidierung von Run, Gate, Revision 6 und dauerhaftem Artefakt. |
| Brownfield Analysis | prepares | Parent Phase A | Pass; bestehende Run-/Backlog-/Artefakt-Owner reichen ohne Runtime-Änderung aus. |
| CD+Tests Phase A | implements | TP RMP-01 bis RMP-04 | Baseline-, Workstream- und Conformance-Scope-Artefakte erstellt. |
| Child UR/PRD/SD/TP | derived_from | Roadmap Conformance Scope | Child-UR, PRD, SD und TP sind separat genehmigt; Brownfield Analysis ist `pass`; keine Parent-Approval-Vererbung. |
| Child OR | fulfills | TP RMP-06 | QA und UAT akzeptiert; 16 Passes, 8 Limitierungen und 12 `host_unavailable` unverändert als BL-11/WS-01 verlinkt. |
| RMP-07 Assessment | evaluates | BL-10 und BL-11 | `no_child_scope_yet`; Modus-/Hostgrenzen sind keine Über-/Unter-Governance-Evidenz. |
| Proportionality Baseline | resolves | RMP-07 evidence prerequisite | 40 reale Fälle, sechs Pfade, 19 adversariale Fälle und 40/40 kanonische Quellen. |
| Proportionality Scope | derived_from | Baseline und RMP-07 Assessment | Child-UR wurde separat genehmigt; keine Approval-Vererbung. |
| Child UR | derived_from | Proportionality Scope | PBM-1 bis PBM-8; separat exakt genehmigt. |
| Child Brownfield Review | sizes | Child UR | `structured_slice`; deterministischer Benchmark in bestehenden Ownern. |
| Child PRD | derived_from | Child UR und Brownfield Review | PBM-1 bis PBM-12; separat exakt genehmigt. |
| Child SD | derived_from | Child PRD | Source-fingerprinted Decision-Fixtures, bestehende Validatoren und eine gemeinsame Ergebnis-/Berichtspipeline. |
| Child TP | derived_from | Child SD | Brownfield-/Architektur-Proof vor Safety Core, 40-Fall-Corpus, Integration, Reviews und QA. |
| Child Brownfield Analysis | prepares | Child TP | `revise`; Evidenzmodell muss im PRD bewusst entschieden werden, bevor Implementierung zulässig ist. |
| Child PRD Revision 2 | resolves | Child Brownfield Analysis | Nutzer wählt frische wiederholte Agent-Beobachtung und deterministisches Grading/Replay. |
| Child SD Revision 2 | derived_from | Child PRD Revision 2 | Blind-Corpus und Live-Aufzeichnung bleiben strikt vom Offline-Grading getrennt. |
| Child SD Revision 2 | approved_by | Approval: SD | Exakte separate Freigabe am 2026-07-28 nach Child-Revision 7. |
| Child TP Revision 2 | derived_from | Child SD Revision 2 | Safety Core, fixe Live-Agent-Serie, Offline-Grading, Reviews und QA. |
| Child TP Revision 2 | approved_by | Approval: TP | Exakte separate Freigabe am 2026-07-28 nach Child-Revision 8. |
| Child Brownfield Analysis Revision 2 | prepares | Child TP Revision 2 | `pass`; Codex 0.145.0 mit explizitem `gpt-5.6-sol` ist authentifiziert, read-only und mutationsfrei vorgeprüft. |
| Child CD+Tests | implements | Child TP Revision 2 | 18/18 Tasks einschließlich frischer 120er-Serie und deterministischem Bericht ausgeführt. |
| Child QA | evaluates | Child Benchmark | `block`; 27/40 Fälle ambiguous, daher separate Produktentscheidung nötig. |
| Ambiguitäts-Produktbefund | evaluates | Child QA block | 26 Fälle messen einen pre-UR Zustand gegen post-Brownfield Sollpfade; `PB-008` vermischt read-only Zielklärung und Produktänderung. |
| Protokoll-Child UR | derived_from | Ambiguitäts-Produktbefund | Eigene Revision 1; keine Parent- oder Vorgänger-Approval-Vererbung. |
| Protokoll-Child Brownfield | sizes | Protokoll-Child UR | `structured_slice`; UI/UX `low`, keine UX Intent Definition erforderlich. |
| Protokoll-Child PRD | derived_from | Protokoll-Child UR | Revision 1 ist separat exakt freigegeben. |
| Protokoll-Child SD | derived_from | Protokoll-Child PRD | Revision 1 ist separat exakt freigegeben. |
| Protokoll-Child TP | approved_by | Approval: TP | Revision 1 am 2026-07-29 separat exakt freigegeben. |
| Protokoll-Child Live-Serie | implements | Protokoll-Child TP | 216/216 gültige Observationen, ein Timeout-Retry, keine Safetyfehler. |
| Protokoll-Child QA | evaluates | Protokoll-Child Live-Serie | `block`; TP 24/24 und Reviews pass, aber zwei Critical Under, drei Stage-Abweichungen und acht Mixed/Ambiguous; Gate-Checker-Approval-Projektion als separater Produktgap. |
| Staged Product Findings | evaluates | Protokoll-Child QA | Benchmark-Semantik/-Evidenz, Structured-Depth-Requirements und QA-Transition getrennt; kein Autoritätsbypass belegt. |
| Enforcement Closure Scope | derived_from | SPF-06 | Garantie, Owner, Zielklasse und negativer Test für QA-Block Transition Integrity. |
| QA Transition Child UR | derived_from | Enforcement Closure Scope | QBT-1 bis QBT-7; Parent-Approvals werden nicht vererbt. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Bestehende Compact-Interaction- und lokale Validator-Lösung | `agdf-interaction-ownership-quick-path-ux` | R1, Teile von R2 und R5 | direct |
| Neue vorgelagerte Task-Target-Grenze | `task-target-resolution-boundary` | Mehrturn-Zielbindung und UAT-Baseline | direct |
| Aktive OpenCode Enforcement-/Host-Lücken | `opencode-surface-hardening-parity`; `opencode-plugin-honesty-hardening` | R2 und R3 | direct |
| Bestehende proportionale Pfade und Erklärbarkeit | Modes, Gate Transition, Scope Classification, Gate Rationale | R1 und R4 | direct |
| Akzeptierte Live Host Conformance | `agdf-live-host-conformance-matrix/OR.md`; BL-11 | R2, R3, R6 und Grenzen für RMP-07 bis RMP-10 | user_accepted |

## Missing Evidence

- exakte Freigabe der QA Transition Child UR;
- kanonische Structured-Depth-Entscheidung und davon abhängige Benchmark-v3-Evidenz;
- authentifizierte native-UI-/Mehrturn-/Restart-Conformance bleibt eine akzeptierte BL-11-Grenze.

## Risks

- Mega-Run statt kleiner unabhängiger Arbeitslinien.
- Duplikation bestehender Interaction-, Routing-, Enforcement- oder Presentation-Owner.
- UX-Vereinfachung verbirgt Autorität oder Evidenz.
- Repository-/Replay-Evidenz wird als Live-Host-Nachweis missverstanden.

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-TASK-TARGET-AUTHORITY`; `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-DOCUMENTATION-CEREMONY-BOUNDARY`; `CG-DELIVERY-PATH-SEARCH`; `CG-RUN-STATUS-CARD`; `CG-UX-INTENT-BEFORE-PRD`
- context_graph_reconciliation: `resolved_for_review`
- context_graph_required_action: link
- context_graph_gate_effect: `none`
- context_graph_evidence: Brownfield Review entscheidet `link_only`; die Roadmap koordiniert bestehende Autoritätsknoten und schafft noch keine neue Architekturautorität.

## Closeout

- delivered: genehmigte Parent-UR/PRD/SD/TP; RMP-01 bis RMP-08; staged Protokoll-Child bis QA/OR; dreigeteilte Produktbewertung; Enforcement Scope und separate QA Transition Child UR Revision 1.
- intentionally_not_delivered: Child-UR-Freigabe, Brownfield Review, Produkt-/Runtimeänderung, Structured-Depth-Child, Benchmark v3, RMP-09 bis RMP-12, Roadmap-QA/UAT, VCS und Release.
- next_allowed_action: Child-UR Revision 1 prüfen und separat exakt `Approval: UR` erteilen,
  Überarbeitung anfordern oder ablehnen.
- quality_outlook: Bestehende Teilimplementierungen zuerst verifizieren und nur reale Restlücken in neue Runs überführen.
