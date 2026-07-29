# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-proportionality-benchmark
- lifecycle: active
- revision: 11
- revision_id: 2141d853-c776-463c-8fe1-67575427379a
- mode: structured_delivery
- current_gate: QA
- decision: blocked
- owner: user / agent

## Objective

Die aktuelle AGDF-Routinglogik deterministisch gegen eine versionierte 40-Fall-Real-Task-Baseline
prüfen und Über-/Unter-Governance messen, ohne Gate- oder Evidenzschutz abzuschwächen.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | TP 18/18 ist ausgeführt; Implementierung, Smoke und Reviews bestehen; frische Serie v2 umfasst 120/120 Observationen, aber 27/40 Fälle sind ambiguous. |
| What is approved? | Child-UR, PRD Revision 2, SD Revision 2 und TP Revision 2 sind genehmigt; Brownfield, TP Review, Clean Review und Code Review bestehen. |
| What is missing? | Eine separat genehmigte Protokoll-Remediation; QA kann bei geltender TP-Stop-Bedingung nicht freigegeben werden. |
| What is the next allowed action? | Im Parent ist ein separater Protokoll-Child gerechtfertigt; dieser Mess-Run bleibt unverändert blockiert. |
| What is explicitly forbidden right now? | `Approval: QA`, Nachoptimierung oder Wiederholung gültiger Ergebnisse im selben Run, UAT, VCS und Release. |

## Source And Scope State

- primary_target: AGDF Proportionality Benchmark
- governance_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- evidence_sources: Parent RMP-07 Assessment, Baseline 1.0.0, Scope Draft, Tests, bestehende Mode-/Gate-/Eval-Owner
- working_directory: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- scope_stability: durch Parent-RMP-07-Scope und neue eigenständige Child-UR getrennt
- competing_scope_lines: Roadmap, Enforcement Closure und Unified Journey bleiben eigenständig
- excluded_mutation_targets: Behavior Owner, Host-Konfiguration, fremde Runs, Nutzerprojekte, VCS und Release

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exaktes `Approval: UR` am 2026-07-28 nach Revalidierung von Run, Gate, Revision 1 und dauerhaftem Artefakt. |
| PRD | approved | Exaktes `Approval: PRD` am 2026-07-28 nach Revalidierung von Run, Gate, Revision 6 und dauerhaftem Artefakt Revision 2. |
| SD | approved | Exaktes `Approval: SD` am 2026-07-28 nach Revalidierung von Run, Gate, Revision 7 und dauerhaftem Artefakt Revision 2. |
| TP | approved | Exaktes `Approval: TP` am 2026-07-28 nach Revalidierung von Run, Gate, Revision 8 und dauerhaftem Artefakt Revision 2. |
| QA | blocked | `QA_REPORT.md` entscheidet `block`: 27/40 frische Fälle ambiguous; Freigabe ist nicht anforderbar. |
| UAT | missing | Nicht zulässig. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-proportionality-benchmark/UR.md` | approved | PBM-1 bis PBM-8; exakt freigegeben 2026-07-28. |
| Brownfield Review | `.agdf/control/artefacts/agdf-proportionality-benchmark/BROWNFIELD_REVIEW.md` | done | Pass; `structured_slice`; bestehende Owner erweitern, keine zweite Routing-Autorität. |
| PRD | `.agdf/control/artefacts/agdf-proportionality-benchmark/PRD.md` | approved | Revision 2; exakt freigegeben 2026-07-28. |
| SD | `.agdf/control/artefacts/agdf-proportionality-benchmark/SD.md` | approved | Revision 2; exakt freigegeben 2026-07-28. |
| TP | `.agdf/control/artefacts/agdf-proportionality-benchmark/TP.md` | approved | Revision 2; exakt freigegeben 2026-07-28. |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-proportionality-benchmark/BROWNFIELD_ANALYSIS.md` | done | Pass; bestehende Safety-Primitiven erweitern; Codex-/Modell-/Auth-/Budget-Preflight grün. |
| CD+Tests | `.agdf/control/artefacts/agdf-proportionality-benchmark/CD_TESTS.md` | done | Implementierung/Tests grün; frische Serie 120/120; Benchmark blockiert mit 27 ambiguous. |
| Benchmark JSON | `.agdf/control/artefacts/agdf-proportionality-benchmark/PROPORTIONALITY_BENCHMARK_REPORT.json` | block | Fresh; 13 korrekt, 27 ambiguous, 0 Critical Under, 0/8 Small Over. |
| Benchmark Markdown | `.agdf/control/artefacts/agdf-proportionality-benchmark/PROPORTIONALITY_BENCHMARK_REPORT.md` | block | Projektion desselben Ergebnisobjekts. |
| Task Plan Review | `.agdf/control/artefacts/agdf-proportionality-benchmark/TASK_PLAN_REVIEW.md` | pass | 18/18 fully_done. |
| Clean Implementation Review | `.agdf/control/artefacts/agdf-proportionality-benchmark/CLEAN_IMPLEMENTATION_REVIEW.md` | pass | Gemeinsame Agent-Seam; keine Parallelstruktur. |
| CR | `.agdf/control/artefacts/agdf-proportionality-benchmark/CODE_REVIEW.md` | done | Entscheidung `pass`; keine offenen Codefindings. |
| QA Report | `.agdf/control/artefacts/agdf-proportionality-benchmark/QA_REPORT.md` | block | Ambiguitäts-Stop-Bedingung greift; keine QA-Freigabe anfordern. |
| Parent Assessment | `.agdf/control/artefacts/agdf-product-maturity-roadmap/PROPORTIONALITY_SCOPE_ASSESSMENT.md` | completed | RMP-07-Evidenzentscheidung. |
| Parent Baseline | `.agdf/control/artefacts/agdf-product-maturity-roadmap/PROPORTIONALITY_BENCHMARK_BASELINE.json` | ready | 40 reale Fälle, sechs Pfade, 19 adversariale Fälle. |
| Parent Scope | `.agdf/control/artefacts/agdf-product-maturity-roadmap/PROPORTIONALITY_BENCHMARK_SCOPE.md` | ready_for_child_ur | Vorgeschlagener Benchmark-Scope ohne Implementierungsautorität. |
| Parent Tests | `.agdf/control/artefacts/agdf-product-maturity-roadmap/PROPORTIONALITY_BASELINE_TESTS.md` | pass | Baseline- und Scope-Prüfungen grün. |
| Parent Ambiguity Assessment | `.agdf/control/artefacts/agdf-product-maturity-roadmap/PROPORTIONALITY_AMBIGUITY_ASSESSMENT.md` | assessed | 26 Protocol-Stage-Mismatches plus ein Baseline-Semantikfehler; keine nachgewiesene falsche Routingentscheidung. |

## Mode/Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: Begrenzter deterministischer Benchmark in bestehenden Eval-Ownern, aber neue messbare Ergebnissemantik über mehrere zusammenhängende Code-/Datenowner und explizite Parallel-Autoritätsgrenzen erfordern ein kleines PRD, SD und TP.
- evidence: `.agdf/control/artefacts/agdf-proportionality-benchmark/BROWNFIELD_REVIEW.md`

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| Parent TP RMP-07 | proposes | Child UR | Scope nur nach 40-Fall-Baseline; keine Approval-Vererbung. |
| Parent Baseline | informs | Child UR | 40 reale Fälle, sechs Pfade, 19 adversariale Fälle und 40/40 Quellen. |
| Child UR | derived_from | Parent Scope | PBM-1 bis PBM-8 bewahren 40-/25%-/0-/10%-Kriterien und Owner-Grenzen. |
| UR | approved_by | Approval: UR | Exakte Freigabe am 2026-07-28 für Run, Gate und Revision 1. |
| Brownfield Review | sizes | Child UR | `structured_slice`; Eval-Infrastruktur erweitern, keinen freien Tasktext-Classifier oder zweiten Mode-Owner schaffen. |
| PRD | derived_from | UR | PBM-1 bis PBM-12 operationalisieren die genehmigte Child-UR unter den Grenzen der Brownfield Review. |
| PRD | approved_by | Approval: PRD | Exakte Freigabe am 2026-07-28 für Run, Gate und Revision 2. |
| SD Revision 1 | derived_from | PRD Revision 1 | Historische Decision-Fixture-Architektur; durch Revision 2 ersetzt. |
| SD Revision 1 | approved_by | Approval: SD | Historische Freigabe am 2026-07-28 für Run, Gate und Revision 3. |
| TP Revision 1 | derived_from | SD Revision 1 | Historischer Plan; stoppte korrekt bei PB-T02 und ist ersetzt. |
| TP Revision 1 | approved_by | Approval: TP | Historische Freigabe am 2026-07-28 für Run, Gate und Revision 4. |
| Brownfield Analysis Revision 1 | prepares | TP Revision 1 | `revise`; PB-T02 Stop-Kriterium griff und routete `requirements_gap` zum PRD. |
| PRD Revision 2 | resolves | Brownfield Analysis requirements_gap | Nutzer wählt frische wiederholte Agent-Beobachtung; Live-Entscheidung bleibt variabel, Grading/Replay deterministisch. |
| PRD Revision 2 | approved_by | Approval: PRD | Exakte Freigabe am 2026-07-28 für Run, Gate und Revision 6. |
| SD | derived_from | PRD | Revision 2 trennt Blind-Corpus und Live-Aufzeichnung strikt vom deterministischen Offline-Grading; das PRD-Artefakt steht auf genehmigter Revision 2. |
| SD | approved_by | Approval: SD | Exakte Freigabe der Revision 2 am 2026-07-28 für Run, Gate und Revision 7. |
| TP | derived_from | SD | Revision 2 plant Safety Core, fixe Agent-Serie, mindestens 120 Observationen, Offline-Grading, Reviews und QA. |
| TP | approved_by | Approval: TP | Exakte Freigabe der Revision 2 am 2026-07-28 für Run, Gate und Revision 8. |
| Brownfield Analysis | prepares | TP | `pass`; bestehende Safety-/Recorder-Primitiven sind wiederverwendbar und der explizite Codex-Preflight ist grün. |
| CD+Tests | implements | TP | PB2-T02 bis PB2-T16 umgesetzt; Safety, Offline-Lane und frische 120er-Serie vollständig. |
| Task Plan Review | verifies | TP | 18/18 Tasks fully_done; blockierendes Messergebnis bleibt QA-Eingang. |
| Clean Implementation Review | reviews | CD+Tests | Pass; sauberer gemeinsamer Agent-Executor und fokussierter Benchmark-Owner. |
| CR | reviews | CD+Tests | Pass; keine offenen Implementierungsfindings. |
| QA_REPORT | tests | TP | `block`; 27/40 frische Fälle ambiguous, daher keine QA-Freigabe. |
| Parent Ambiguity Assessment | evaluates | QA block | Separater Protokoll-Scope gerechtfertigt; v2-Evidenz bleibt unverändert und dieser Run wird nicht nachoptimiert. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| RMP-07 Assessment | Parent `PROPORTIONALITY_SCOPE_ASSESSMENT.md` | Gap-to-scope-Entscheidung | direct |
| Baseline 1.0.0 | Parent `PROPORTIONALITY_BENCHMARK_BASELINE.json` | 40 reale Sollfälle | direct |
| Baseline Tests | Parent `PROPORTIONALITY_BASELINE_TESTS.md` | Coverage, Adversarialität, Quellen und Redaction | direct |
| Codex Live Preflight | `BROWNFIELD_ANALYSIS.md` | Codex 0.145.0, ChatGPT-Auth, explizites `gpt-5.6-sol`, read-only Schemaausgabe und 0 Mutationen | direct |
| Fresh Live Series v2 | `evals/proportionality/observations/codex-gpt-5.6-sol-agdf-0.11.4-20260728-v2/` | 120/120 Observationen, 120 Versuche, feste Provenienz, keine Safety-Verletzung | direct |
| Benchmark Report | `PROPORTIONALITY_BENCHMARK_REPORT.json` | 13 korrekt, 27 ambiguous, 0 Critical Under, 0/8 Small Over; Freshness fresh | direct |

## Missing Evidence

- separat genehmigte Remediation des stufengerechten Beobachtungsprotokolls;
- QA-Pass bleibt bis zur aufgelösten Stop-Bedingung unzulässig;
- UAT und Delivery-Evidenz.

## Risks

- erwarteter Pfad driftet von kanonischen Ownern;
- Benchmark wird parallele Routing-Autorität;
- Interaktionsreduktion verdeckt Unter-Governance;
- nicht-deterministische Modellurteile werden als Testevidenz ausgegeben.

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-DOCUMENTATION-CEREMONY-BOUNDARY`; `CG-DELIVERY-PATH-SEARCH`
- context_graph_reconciliation: `resolved_for_review`
- context_graph_required_action: `link`
- context_graph_gate_effect: `none`
- context_graph_evidence: Der frische Benchmark zeigt eine Ambiguitätsgrenze bestehender Delivery-Path-/Ceremony-Owner; es entsteht kein neuer Policy-Knoten.

## Closeout

- delivered: Child-UR/PRD/SD/TP genehmigt; Brownfield pass; TP 18/18; Implementierung, vollständiger Smoke, frische 120er-Serie, deterministischer Bericht und Pflichtreviews abgeschlossen.
- intentionally_not_delivered: QA-Pass, UAT, Remediation der 27 Ambiguitätsfälle, VCS und Release.
- next_allowed_action: Diesen Run unverändert blockiert erhalten; Protokoll-Remediation nur in einem neuen Child mit eigener UR; kein `Approval: QA`.
- quality_outlook: Deterministische Istmessung muss Gate-Schutz stärker gewichten als Interaktionsreduktion und darf keine zweite Routing-Autorität schaffen.
