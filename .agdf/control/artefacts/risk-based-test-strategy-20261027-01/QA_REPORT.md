# QA Report: Central quality policy and focused verification

Status: draft
Gate: QA
Gate approval: open
Based on: TP, implementation evidence, task-plan review
Date: 2026-10-27
Owner: Codex (qa-gate; cooperative author self-review)

## 1. QA Decision

Decision: pass

The approved policy/distribution slice has sufficient applicable evidence. TP coverage,
Brownfield fit, solution integrity, scoped code quality and required documentation are
supported. No applicable open or invalid normalized finding or incomplete UX fidelity row
remains. This technical decision grants no human approval, native qualification or release.

## 2. TP Coverage

- delivered_result: The existing central quality.md now defines proportionate Run/CI/available-nightly test placement, valid shared evidence reuse, effective regression checks, targeted finding re-verification and a verification completion condition. Actual SD/TP contract delivery, existing phase/review guidance and current templates apply that policy. Context Graph, SoT registry and architecture identify the same owner. Routine pass/detail and revise/block instructions are consistent, with existing human approval boundaries preserved.

TP_REVIEW.md assesses all eight tasks as fully_done and all twelve criteria as done.
All nineteen planned scenario assessments are mapped to concrete inputs, expected outcomes,
sources and evidence classes in CD_TESTS.md. Required Clean and Code assessments are
registered separately. The current review confirmed all 22 affected source identities and
ten protected hashes unchanged, so valid command evidence was reused.

| Quality dimension | Evidence and result |
|---|---|
| Plan coverage | TP_REVIEW.md: 8/8 tasks fully_done, 12/12 criteria done, all 19 scenarios accounted for; AC-010 policy/scenario fidelity fulfilled. |
| Solution integrity | CLEAN_IMPLEMENTATION_REVIEW.md: pass; one canonical policy owner, existing consumers/generators, no parallel inventory or new runtime authority. |
| Code quality | CODE_REVIEW.md: pass; actual diff and error paths reviewed, no actionable defect left evident in scoped surfaces. |
| QA decision | pass; qa-gate is the sole final technical quality decision owner. Human QA/UAT approvals remain separate. |

## 3. Evidence

- [CD+Tests](CD_TESTS.md) identifies baseline e50f6b02afaef3f2dbd778eb6a15718e8c0b0f5c, final source hashes, macOS/Node 22.22.3 environment, outcomes, applicability and resolved diagnostics.
- [Contracts](evidence/C01-contracts.log): existing build-contract, SD definition and TP definition tests pass. Actual bound continuations contain canonical quality content/SHA. Required resource absence refuses startup without fixture Run mutation; restoring it restores a valid continuation. Removed metadata mapping is detected separately.
- [Integrity](evidence/C02-integrity.log): instruction footprint, runtime integrity/layout, Copilot profile and payload checks pass. Exact reviewed payload is 397 files / 3,522,791 bytes (+13,330), zero headroom; no instruction limit, exclusion or permission relaxation.
- [Consumers](evidence/C03-consumers.log): interaction presentation regressions pass; skill-eval tests and 113/113 deterministic cases across 14 skills pass; package contents pass with 1,355 files. Fingerprint-only maintenance preserved all other fixture fields and native observations; deterministic replay is not a fresh model run.
- [Inventory](evidence/C04-inventory.log): CI planner 9/9 pass, six canonical navigation links and ten protected hashes pass; final diff whitespace check passes. CI workflows and authoritative inventory are unchanged.
- [Preparation](evidence/C00-prepare.log): expected growth and incomplete empty build-directory diagnostics were resolved within existing build owners. Final normal generation, assembly and release preparation stages each exit 0. Earlier build:prepare attempts failed and are retained; this is not claimed as one clean end-to-end invocation or a published release.
- [TP Review](TP_REVIEW.md), [Clean Review](CLEAN_IMPLEMENTATION_REVIEW.md), [Code Review](CODE_REVIEW.md) and BROWNFIELD_ANALYSIS.md provide the separate required assessments. Source/scenario evidence for AC-010 includes concrete pass/revise/block/detail cases and preserves complete human gate presentations.

The decision is based on these complementary observations and the actual policy/consumer
meaning, not a green aggregate alone. Initial test-harness parser failures are not counted
as defect-detection proof. Stable results were not recollected merely for QA.

## 4. Missing Evidence

- qualification_limits: No remote PR/merge CI, full local smoke suite, native installed-agent behavior, live host rendering, independent reviewer or measured time/file savings was obtained. Source consistency and documented semantic scenarios establish policy meaning; structural and package tests establish delivery/integrity only. Candidate build 0.20.2 was not installed; loaded governance remains 0.20.1.

No required proof is missing for the approved policy/distribution acceptance. These limits
are explicit non-claims under PRD AC-010/011/012 and its non-goals, not accepted deviations
from missing mandatory proof. Any later native-compliance, remote-CI or savings claim needs
its own applicable evidence and authorization. No fresh model observation is inferred from
updated deterministic fixture source identities.

## 5. Risks

- delivery_risks: Cooperative policy instructions can be misapplied by an agent; package parity does not provide universal enforcement. Existing required reviews, evidence-gap routing and deliberate gates remain necessary. The exact payload has zero headroom, so later growth will require another attributed review under the existing owner.

No current blocking correctness, security, SoT drift or approval-boundary risk was identified
in the approved slice. No blanket waiver, new evaluator, history rewrite, CI restructuring,
evidence deletion or installed-host repair is included. All reviews are author self-reviews;
separate report files do not create independent assurance.

## 6. Required Next Step

Present this exact QA material through the existing run-present owner and obtain the
new deliberate human response `Approval: QA`. Remain at QA until that response is
recorded. UAT, closeout, commit, push, PR and release are not authorized by this report.

## 7. Gate Approval

Approve this QA decision only with:

`Approval: QA`

## Context Graph and Knowledge

- context_graph_impact: new_node_required
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-quality-contract; .agdf/control/CONTEXT_GRAPH.md#cg-ux-intent-before-prd; .agdf/control/SOT_REGISTRY.md; docs/architecture/README.md
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: General quality node, UX navigation, explicit SoT ownership and architecture entry/01/02/03 references are complete. Six links resolve to the canonical quality owner. Earlier Brownfield open work is completed; Clean/TP assessments use the supported resolved value while preserving original registered evidence.
- memory_target: context_graph
- memory_reason: Durable quality ownership is maintained at its existing project context owner; Run-specific evidence remains here.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md; .agdf/control/SOT_REGISTRY.md

## AGDF Approval Summary (de; source=en)

- Ziel: Tests und Nachweise am Änderungsrisiko ausrichten, gültige Ergebnisse wiederverwenden und unnötige Wiederholungen beenden, ohne erforderliche Abdeckung oder Freigaben zu schwächen.
- Ergebnis: quality.md ist erweitert und wird SD/TP tatsächlich mitgeliefert; bestehende Vorlagen und Reviews wenden den Vertrag an. Context Graph, SoT-Registry und Architektur verweisen auf denselben Owner. Alle 8 Aufgaben, 12 Kriterien und 19 geplanten Szenarien sind abgedeckt. TP-, Clean- und Code-Review sind erfasst; technisches QA-Ergebnis: pass.
- Grenzen: Quellen-/Szenariobewertung, Vertragslieferung und Paketintegrität sind belegt. Keine native Agentenbefolgung, unabhängige Prüfung, entfernte CI-Ausführung oder gemessene Zeitersparnis; keine Installation erfolgt.
- Risiken: Kooperative Regeln bleiben auf korrekte Anwendung und bestehende Kontrollen angewiesen. Das exakt geprüfte Payload-Budget enthält keinen Spielraum. Keine offene blockierende Abweichung im freigegebenen Umfang festgestellt.
- Nachweise: CD_TESTS.md mit fünf gebündelten Prüfprotokollen, TP_REVIEW.md, CLEAN_IMPLEMENTATION_REVIEW.md und CODE_REVIEW.md; Vertrags-/Integritätsprüfungen, 113/113 deterministische Replay-Fälle und 9/9 CI-Planerfälle bestanden.
- Nächster Schritt: Dieses konkrete QA-Ergebnis mit Approval: QA freigeben. Danach folgt UAT; Commit, Push, PR, Installation und Release sind dadurch nicht erteilt.
