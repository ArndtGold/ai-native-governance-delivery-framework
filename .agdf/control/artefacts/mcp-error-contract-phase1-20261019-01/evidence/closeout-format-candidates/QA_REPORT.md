# QA Report: MCP error contract Phase 1

Status: pass
Gate: QA
Gate approval: open
Based on: approved TP; registered CD+Tests/CR/TP Review/Clean Review; actual source, runtime, visible and evaluation evidence
Date: 2026-10-19
Owner: Codex, qa-gate (sole technical QA decision owner)

## 1. QA Decision

Decision: pass

The approved Phase 1 result is sufficiently evidenced: all 28 mandatory scenarios, all eight PRD criteria, Brownfield fit, exact source/package composition and the visible UX states are fulfilled. The routed latency finding is resolved by the scoped source repair and two current unchanged qualification passes. No open or unknown normalized finding, source-of-truth drift or mandatory evidence gap remains. This is the technical qa-gate decision; human gate approval remains open.

## 2. TP Coverage

- delivered_result: Failed AGDF MCP operations are explicitly recognizable through isError and bounded cause/effect/correction text. Successful blocked/readiness/status reports and exact decision/receipt semantics remain successful and unchanged. The unchanged 32-row protocol matrix reduces AGDF failures missing isError from 9 to 0; current cold/warm p95 confirmation is 701.275/611.639 ms under the existing 1500/1000 ms bounds.

TP_REVIEW.md assesses T-001 through T-010 individually as fully_done for their current implementation-to-QA preparation obligations. It maps all eight canonical PRD criteria and all 28 scenarios, with high confidence inside the approved local/synthetic qualification. Applicable UX Intent Fidelity rows are all fulfilled with actual error content and browser evidence. QA/UAT/OR human decisions are future governed transitions and are not claimed complete.

The original TP sources and every approved UR/PRD/SD/TP byte remain unchanged. The user-authorized narrow CD repair removes repeated Run validation and unused eager SDK compilation without a new worker project, schema, validator implementation, persistent governance cache or permission.

## 3. Evidence

| Quality dimension | Assessment | Decisive evidence |
|---|---|---|
| Plan coverage | pass | TP_REVIEW.md; evidence/scenario-evidence.json: 28/28; current mandatory checks and UX fidelity |
| Solution integrity | pass | CLEAN_IMPLEMENTATION_REVIEW.md; single domain/projection/receipt/locale/lifecycle owners and explicit retained guards |
| Code quality | pass | CODE_REVIEW.md; actual diff and 40 exact source hashes; first-use SDK input/output and fresh-source integrity regressions |
| QA decision | pass, solely qa-gate | Complete scoped evidence, no open normalized finding, Brownfield/Context Graph reconciliation resolved |

- Current canonical CD_TESTS.md, CODE_REVIEW.md, TP_REVIEW.md and CLEAN_IMPLEMENTATION_REVIEW.md are registered actual results. BROWNFIELD_ANALYSIS.md remains applicable; PERFORMANCE_FIX.md assesses the later narrow repair at its existing CD owner.
- evidence/checks-final.json retains exact commands, exits and all historical failures; checks-fix2.json contains the current affected checks. fix-protocol-disposition.json and fix-browser-disposition.json distinguish the corrected test transport / permitted browser environment from actual product behavior. The current browser SDK trace is 4/4 passed; both final UI assets are byte-identical to their full applicable browser/component evidence.
- Actual owned SDK/stdio cases cover both eras and all seven regular tools; real child replacement/old-view routing, safety/cancellation/termination, provenance/SDK, exact npm archives and command/replay/protected-state cases pass. All four current structured-delivery/slice flows through the real entrypoint pass on disposable fixtures with synthetic decisions.
- Both unchanged performance qualifications pass: cold/warm p95 1088.087/876.261 ms and 701.275/611.639 ms; every 20/20 sample and first tool call is included. PERFORMANCE_FIX.md retains causal source diagnosis and its limits.
- evidence/EVALUATION.md and fresh protocol/tools captures show the intended 9 -> 0 error-channel change, unchanged classes/outcomes/normalized structured sizes, identical tools/list and all 30 immutable evaluation inputs/baselines. Intended comparison exits 1 remain changed comparisons, not passing unchanged comparisons.
- source-final.json and identity-verification.json bind all 40 source files, HEAD a8a867a3578a2d8b16853860276c401ddd04db28, real dependency snapshot, dispatcher 06458476cf47fa77a3563eba4b8fcbd7d8e8455b4b368975f13b3d1d46aa2931, server 582e9481dff95e9a1284e2f5bd120a921bea723e3b0aafca4f40dc9b55446d8a and SDK 2.0.0. Canonical build, exact payload recording, inventory and compatibility/freshness pass.
- Registered evidence/CD_RECORDING_PROVENANCE.md corrects the current CD report's file-preservation assumption: the existing owner published the reviewed input at canonical CD_TESTS.md. Its older decision/digest history and contemporaneous raw evidence are retained; a byte-identical old Markdown body is not claimed. This clarification does not alter the current test/source verdict.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CD-PERF-001 | emergent_risk | CD+Tests | resolved | Earliest-owner assessment: the unchanged approved sources route this implementation-time latency finding to CD+Tests; evidence/PERFORMANCE_FIX.md documents that assessment and the actual repair. Current CD_TESTS.md; evidence/PERFORMANCE_FIX.md; evidence/fix2-performance.log; evidence/fix2-performance-confirmation.log; exact current source/runtime identities | Retain the resolved finding and its evidence; continue only through the current canonical lifecycle owner. |

## 4. Missing Evidence

- qualification_limits: Local supported Node 22.22.3/darwin-x64 Core/SDK/actual STDIO and archives, plus synthetic browser/host fixtures. No fresh native Codex/Claude agent recovery, native Windows behavior, remote CI, paid-model success/token/cost, installed-host rollout or release qualification is established.

No mandatory scoped scenario is missing or unverifiable. Native observations in the historical baseline remain dated and separate. These limits follow the approved TP and do not waive a required test. Technical review assurance is cooperative local on the implementation host, not an independent human review.

## 5. Risks

- delivery_risks: None currently open within the accepted Phase 1 implementation/test boundary. Future unknown codes/effects retain the bounded stop/original-operation path; local scheduling can vary and current p95 qualification is not a universal response-time guarantee.

Lazy SDK compilation pays its cost on the first actual tool call, which remains in the unchanged benchmark and has explicit negative input/output regression coverage. No caller data or governance decision is cached. Later calls and all existing mutation owners recheck current sources/bindings. Historical unsuccessful timing/setup attempts remain visible; no acceptance-by-deviation is requested.

The existing CG-MCP-DISPATCH-ADAPTER node is updated with scoped error-channel and latency evidence while preserving historical F02–F05 and native limits. There is no parallel acceptance/policy/knowledge authority.

- memory_target: context_graph
- memory_reason: Preserve the source-bounded error-contract and actual routed repair findings.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER
- Situation: All planned Phase 1 implementation and current quality dimensions pass locally; deliberate human QA and later lifecycle decisions remain pending.
- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER
- context_graph_reconciliation: resolved
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: Existing mcp_error_contract_phase1_20261019 entry, EVALUATION.md and registered current CD/review sources.

## 6. Required Next Step

Record this exact report through the current QA_REPORT-tests-TP relationship owner, prepare its revision-bound QA presentation and request the deliberate human decision. Approval: QA is the next user gate; it is not supplied by this report or the earlier TP approval. Later UAT and OR follow only their actual canonical routing.

## 7. Gate Approval

Approve this QA decision only with:

`Approval: QA`


## AGDF Approval Summary (de; source=en)

- Ziel: Fachliche MCP-Fehler eindeutig erkennen und mit konkreter Ursache, Wirkungsgrenze und zulässiger Korrektur beantworten.
- Umfang: Phase 1 ist im Repository umgesetzt und lokal geprüft. Fehlerflag und Hinweise sind ergänzt; erfolgreiche Statusberichte, Freigabebindungen und ursprüngliche Operationsbelege behalten ihre Bedeutung.
- Ergebnis: Die unveränderte Protokollmessung zeigt 9 auf 0 fachliche Fehlerfälle ohne isError. Alle 28 Pflichtszenarien sind belegt. Code Review, TP Review und Clean Review stehen auf pass; qa-gate entscheidet technisch pass.
- Umsetzung: Doppelte Zustandsprüfung und unnötige Vorabkompilierung sind entfernt. Zwei unveränderte Prüfungen mit je 20 Kaltstarts und 20 Dispatch-Aufrufen bestehen. Zuletzt: Kaltstart-p95 701 ms bei höchstens 1500 ms; Dispatch-p95 612 ms bei höchstens 1000 ms. Grenzwerte, Fristen und Messverfahren bleiben bestehen.
- Nachweise: Tatsächliche SDK/STDIO-Aufrufe, Generationenwechsel, npm-Archive, vollständige Abläufe, Wiederaufnahmebelege und Browser-SDK-Prüfung sind bestanden. Frühere Fehlversuche und ihre eindeutigen Wiederholungsnachweise bleiben dokumentiert.
- Grenzen: Nachweis für den lokalen Quellstand und synthetische Browser-/Host-Fixtures. Neue native Agentenerholung, Windows-Nativverhalten, Remote-CI oder Ausrollung sind nicht qualifiziert; diese Aussagen sind nicht Teil der freigegebenen Phase-1-Abnahme.
- Risiken: Keine offenen Fehler oder fehlenden Pflichtnachweise im freigegebenen Umfang. Unbekannte Wirkungen verlangen weiterhin die Prüfung der ursprünglichen Operation; lokale Laufzeiten können je nach Systemlast schwanken.
- Entscheidung: Jetzt steht die menschliche QA-Freigabe an. Die bisherigen Freigaben reichen bis TP. Approval: QA führt zur späteren UAT; es erteilt keine Veröffentlichung oder Git-Freigabe.
