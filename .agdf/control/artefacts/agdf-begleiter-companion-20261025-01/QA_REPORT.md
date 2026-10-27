# QA Report: AGDF Companion in the Claude Projection of the AGDF Plugin

Status: draft
Gate: QA
Gate approval: open
Based on: TP, implementation evidence, task-plan review
Date: 2026-10-26
Owner: Arndt Gold

## 1. QA Decision

Decision: `pass`

## 2. TP Coverage

- delivered_result: An opt-in AGDF companion panel in the Claude projection of the AGDF runtime plugin.
  - `/agdf-companion` switches it on and off. The choice is stored in the AGDF plugin data directory, which uninstall removes.
  - The panel shows the four run states with a figure, a single-line gate bar, the run origin, a one-line objective and the localized next step. A run-derived „läuft“ names the next step. Only an observed turn says that Claude is working.
  - Assignment follows the run changed in the session, then the remembered selection, otherwise „Kein Run zugeordnet“. Only active runs are open; superseded and abandoned runs are closed and never assigned.
  - Without a control folder the panel names the checked folder. The stepping buttons carry localized accessible names.
  - It runs on desktop with a terminal text fallback, is read-only and keeps failures isolated.
  - The AGDF core now accepts Brownfield Analysis as an initiating phase of a source revision.

All nine TP tasks are fully done (T-001 to T-009); see [TP Review](TP_REVIEW-input-02.md). The first QA round (revise, revision 45) found TPR-F01, TPR-F02, TPR-F03 and CIR-F01. All four are resolved in CD+Tests (`CD_TESTS-input-02.md`), together with owner requests 3 and 4.

## 3. Evidence

- tp_review: `.agdf/control/artefacts/agdf-begleiter-companion-20261025-01/TP_REVIEW-input-02.md`
- clean_implementation_review: `.agdf/control/artefacts/agdf-begleiter-companion-20261025-01/CLEAN_IMPLEMENTATION_REVIEW-input-02.md`
- code_review: `.agdf/control/artefacts/agdf-begleiter-companion-20261025-01/CODE_REVIEW-input-03.md`

Quality Readiness (derived; `qa-gate` is the sole decision owner):

| Dimension | Source | Result |
|---|---|---|
| Plan coverage | TP Review | pass: 9/9 tasks fully done |
| Solution integrity | Clean Implementation Review | pass: CIR-F01 resolved |
| Code quality | Code Review | pass: no findings in the corrections; CR-F01 to CR-F11 resolved earlier |
| QA decision | qa-gate | pass |

Further evidence:

- **Automated.** `npm run verify:ci` on the final tree passed all 27 stages (2026-10-26, cli-smoke 4926 s). This includes the companion logic, adapter and integrity suites and all 22 cells of the MCP source-revision matrix. A run before owner requests 3 and 4 failed once in that matrix (PRD/QA cell, CLI replay `effect_unknown`); the cell passed alone and in the final run.
- **Mutation check.** 10/10 for the QA corrections and 12/12 for the CR corrections.
- **Native.** On Claude Code 2.1.302, `claude plugin validate` passes and `claude plugin test` passes 3/3, including the folder message and the accessible names of the stepping buttons in the engine-rendered desktop pane.
- **Live.** The dated desktop session of T-009 (`live/01` to `live/11`, byte identity in `live/harness-ledger.json`) covers toggle, persistence, four states, gate bar, still pose and new session.
- **Brownfield fit.** Brownfield Analysis passed (`BROWNFIELD_ANALYSIS-input-03.md`). The companion reuses the generation, integrity, Copilot exclusion, locale registry and CI plan owners.
- **Compatibility.** Re-recorded (56 scenarios, 0 failed) and checked. The Copilot payload is reviewed at 397 files / 3,495,901 bytes.

UX Intent Fidelity: AC-001 to AC-010 are fulfilled.

## 4. Missing Evidence

- qualification_limits: The live desktop session ran on a build from before the CR and QA corrections. The corrected reason text, folder message and button names are proven by automated and native engine tests, not yet by a person in the desktop app; a live spot check of the corrected build is planned before UAT approval. Linux and macOS run only in pull-request CI. The mobile surface and Claude Code versions other than 2.1.302 are not qualified.

## 5. Risks

- delivery_risks: The early-access mod API can change with a Claude Code update and then needs the native checks again; runs revised from Brownfield Analysis need the same or newer AGDF on every host; the companion's own bounded `RUN_STATE.md` parser (SDD-04) stays bound to the core only by its tests; one CLI replay in the MCP source-revision matrix failed once under load and was not reproduced.

Context graph:

- context_graph_impact: update_existing_node
- context_graph_refs: CG-PUBLIC-PLUGIN-DISTRIBUTION, CG-RUN-STATUS-CARD
- context_graph_reconciliation: open_gap
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: `BROWNFIELD_ANALYSIS.md` (update both nodes after implementation evidence); curation is due at OR, before any clean handoff.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-F01 | implementation_gap | CD+Tests | resolved | `CD_TESTS-input-02.md`, `TP_REVIEW-input-02.md`: all four core lifecycles parse; only `active` is open; superseded and abandoned runs are never assigned and drop a selection; parity, adapter and mutation tests | none |
| TPR-F02 | implementation_gap | CD+Tests | resolved | `CD_TESTS-input-02.md`, `TP_REVIEW-input-02.md`: the `no_control` snapshot carries `root`; the message names the folder and the hint the full path (en, de); reader, view, terminal and native tests | none |
| TPR-F03 | evidence_gap | evidence_obligation | resolved | `CD_TESTS-input-02.md`: `npm run verify:ci` on the final tree passed all 27 stages | none |
| CIR-F01 | implementation_gap | CD+Tests | resolved | `CLEAN_IMPLEMENTATION_REVIEW-input-02.md`: the companion `LIFECYCLES` is asserted equal to the core `LIFECYCLES`; the mutation to the two-value set fails the suite | none |

## 6. Required Next Step

Request `Approval: QA` for this pass report. Before UAT approval, reinstall the corrected build into Claude and spot-check it live.

## 7. Gate Approval

Approve this QA decision only with:

`Approval: QA`

## AGDF Approval Summary (de; source=en)

- Ergebnis: Das AGDF-Plugin für Claude bringt den abschaltbaren Begleiter mit. `/agdf-companion` schaltet ihn ein und aus, und die Wahl liegt im AGDF-Plugin-Datenordner, den die Deinstallation entfernt. Das Panel zeigt die vier Zustände mit Figur, einzeiliger Gate-Leiste, Herkunft, einzeiligem Ziel und lokalisiertem nächstem Schritt. Ohne beobachteten Turn nennt „läuft“ den nächsten Schritt. Nur aktive Runs gelten als offen. Ohne Kontrollordner nennt das Panel den geprüften Ordner, und die Blätter-Buttons ◀ ▶ haben lokalisierte Namen. Der Begleiter liest nur und isoliert Fehler. Der AGDF-Kern akzeptiert zusätzlich die Brownfield Analysis als auslösende Phase einer Quellrevision. Alle neun Aufgaben sind erledigt, die vier Befunde der ersten QA-Runde gelöst, und `npm run verify:ci` ist mit allen 27 Stufen grün.
- Grenzen: Der Live-Test im Desktop lief mit einem Stand vor den CR- und QA-Korrekturen; Begründungstext, Ordnermeldung und Button-Namen sind automatisiert und nativ geprüft, aber noch nicht live, und ein kurzer Live-Test des korrigierten Stands ist vor der UAT-Freigabe geplant. Linux und macOS laufen erst in der PR-CI; Mobile und andere Claude-Code-Versionen als 2.1.302 sind nicht qualifiziert.
- Risiken: Die Mod-API ist Early Access, ein Claude-Update kann die nativen Prüfungen erneut nötig machen. Nach einer Revision aus der Brownfield Analysis brauchen alle Hosts dieselbe oder eine neuere AGDF-Version. Der eigene Leser des Begleiters ist nur durch Tests an den Kern gebunden. Eine CLI-Wiederholung im MCP-Revisionstest schlug einmal unter Last fehl und war nicht reproduzierbar. Die Pflege des Kontextgraphen steht bis zum OR aus.
