# QA Report: AGDF Companion Follow-up: Build Phase, Mode Paths, Notifications and Status Line

Status: draft
Gate: QA
Gate approval: open
Based on: TP, implementation evidence, task-plan review
Date: 2026-10-28
Owner: Arndt Gold

## 1. QA Decision

Decision: `pass`

## 2. TP Coverage

- delivered_result: The switched-on AGDF Companion shows the build phase and the run's mode path, announces waiting and blocked runs, and keeps a status line.
  - Structured runs get a `CD+Tests` mark between TP and QA. During Brownfield Analysis, CD+Tests and CR the figure builds with hammer and bricks and reads „baut“.
  - The gate bar follows the status card's path per mode, for example `✓UR ●Compact Delivery` for a quick task.
  - A switch of the shown run to „wartet auf Freigabe“ or „blockiert“ raises one toast; a soft chime is off by default and plays only with a toast. Both switches are in the panel and persist.
  - Claude's status line shows `AGDF · {Gate} · {Zustand}`, also with the panel closed and in the terminal.
  - Every language shows the name „AGDF Companion“. Template objectives are hidden, and a folder without `.agdf/control` uses Claude's `language` setting.
  - The companion stays read-only, opt-in, failure-isolated and Claude-only.

All nine TP tasks are fully done (T-001 to T-009) and all 26 scenarios have their evidence; see [TP Review](TP_REVIEW-input-02.md).

## 3. Evidence

- tp_review: `.agdf/control/artefacts/agdf-companion-followup-20261027-01/TP_REVIEW-input-02.md`
- clean_implementation_review: `.agdf/control/artefacts/agdf-companion-followup-20261027-01/CLEAN_IMPLEMENTATION_REVIEW-input-01.md`
- code_review: `.agdf/control/artefacts/agdf-companion-followup-20261027-01/CODE_REVIEW-input-01.md`

Quality Readiness (derived; `qa-gate` is the sole decision owner):

| Dimension | Source | Result |
|---|---|---|
| Plan coverage | TP Review | pass: 9/9 tasks, 26/26 scenarios, AC-001 to AC-012 fulfilled |
| Solution integrity | Clean Implementation Review | pass: mirrored core rules bound by parity tests; status-line re-set documented |
| Code quality | Code Review | pass: independent review; CR-F01 to CR-F05 corrected with mutation-checked tests, CR-F06 accepted by the owner |
| QA decision | qa-gate | pass |

Further evidence:

- **Automated.** The companion logic, adapter and integrity suites pass on the final tree. Seven mutation checks were caught: three in CD+Tests and four in Code Review.
- **Verification lanes.** `build:prepare` passes. Compatibility was re-recorded (56 scenarios, 0 failed). The Windows CI lanes `installation-part-2` and `-part-3` pass on the final tree; `packages-part-2` and `-part-4` passed on the CD+Tests tree. One transient `EPERM` in `control-maintenance-test.js` passed on rerun (`CODE_REVIEW_VERIFICATION.md`). The Copilot payload budget and the evaluation fingerprints are unchanged.
- **Native.** `claude plugin validate` and `claude plugin test` (5/5) pass on Claude Code 2.1.302.
- **Live.** The desktop host probe ran on 2026-10-27. The live session in the Claude desktop app on Windows produced `live/00` to `live/10`: build phase, toast, status line with the panel closed, quick-task bar, German text without a control folder, brand and button rows. Byte identity of the read run states holds.
- **Installed build.** The corrected build is installed (`probe-results/f9c`); the installed companion files are byte-identical to the generated ones.

UX Intent Fidelity: AC-001 to AC-012 are fulfilled (TP Review matrix).

## 4. Missing Evidence

- qualification_limits: The companion's chime was not observed live and the Windows host played the probe clip inaudibly; the status line at the start of an idle session after the LT-F01 fix is proven by the adapter suite and the native test, not live (owner waived the re-check); Linux and macOS run only in pull-request CI; the terminal surface is covered by the native test, not by a live terminal session; Claude Code versions other than 2.1.302 (CLI) and 2.1.308 (desktop engine) are not qualified.

## 5. Risks

- delivery_risks: The early-access mod API can change with a Claude Code update and then needs the native checks again; the companion mirrors three core rules that only parity tests bind; the status line relies on re-setting after every read because the desktop drops the first set; completed historical runs can show OR done where the status card waits for its completion check (SDD-02 simplification); at the default panel width the structured gate bar shows its condensed form (LT-O01).

Context graph:

- context_graph_impact: update_existing_node
- context_graph_refs: CG-RUN-STATUS-CARD
- context_graph_reconciliation: open_gap
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: `BROWNFIELD_REVIEW.md` (update `companion_projection_20261027` after implementation evidence); curation is due at OR, before any clean handoff.

Observation for UAT (owner decision, not a finding): LT-O01 — at the default docked panel width the full structured bar (39 columns) condenses to `✓✓✓✓●○○○ CD+Tests`; a wider panel shows the full bar.

Documented deviation: SDD-07 says the status line is set when its text changed; it is now set after every applied read because the desktop dropped the first set (owner decision 2026-10-28).

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| LT-F01 | implementation_gap | CD+Tests | resolved | `T-009_EVIDENCE.md`, `CD_TESTS.md`: status line set after every applied read; adapter suite and native test assert it; owner waived the live re-check | none |
| LT-F03 | evidence_gap | evidence_obligation | resolved | `T-009_EVIDENCE.md`: sound reported as observed (not audible on Windows), the call evidenced by the suites and the native test | none |
| CR-F01 | implementation_gap | CD+Tests | resolved | `CODE_REVIEW-input-01.md`: no chime without a shown toast; mutation-checked | none |
| CR-F02 | implementation_gap | CD+Tests | resolved | `CODE_REVIEW-input-01.md`: reads running at switch-off are discarded; mutation-checked | none |
| CR-F03 | implementation_gap | CD+Tests | resolved | `CODE_REVIEW-input-01.md`: switch-off stops reading, clears the status line and closes the pane before writing; mutation-checked | none |
| CR-F04 | implementation_gap | CD+Tests | resolved | `CODE_REVIEW-input-01.md`: backticked approvals parsed like the core; mutation-checked | none |
| CR-F05 | evidence_gap | evidence_obligation | resolved | `CODE_REVIEW-input-01.md`: adapter test proves that the AGDF config wins over Claude's setting | none |
| CR-F06 | design_gap | SD | resolved | `CODE_REVIEW-input-01.md`: SDD-07 wording deviation accepted by the owner on 2026-10-28 | none |
| TPR-F01 | evidence_gap | evidence_obligation | resolved | `TP_REVIEW-input-02.md`: terminal surface covered by the native test as the TP allowed | none |
| CIR-F01 | design_gap | SD | resolved | `CLEAN_IMPLEMENTATION_REVIEW-input-01.md`: same deviation as CR-F06, accepted by the owner | none |

## 6. Required Next Step

Request `Approval: QA` for this pass report; then UAT, where the owner also decides on observation LT-O01.

## 7. Gate Approval

Approve this QA decision only with:

`Approval: QA`

## AGDF Approval Summary (de; source=en)

- Ergebnis: Der eingeschaltete AGDF Companion zeigt in strukturierten Runs die Marke `CD+Tests` und während Brownfield Analysis, CD+Tests und CR den Zustand „baut“ mit Hammer und Ziegeln; die Gate-Leiste folgt dem Pfad der Statuskarte je Modus, etwa `✓UR ●Compact Delivery`; beim Wechsel auf „wartet auf Freigabe“ oder „blockiert“ kommt genau eine Meldung, der leise Ton ist aus und spielt nur mit Meldung; die Claude-Statuszeile zeigt `AGDF · {Gate} · {Zustand}` auch bei geschlossenem Panel; überall heißt er „AGDF Companion“, Vorlagenziele sind ausgeblendet, ohne Kontrollordner gilt Claudes Spracheinstellung; alle neun Aufgaben und 26 Szenarien sind belegt, das unabhängige Code Review ist mit fünf korrigierten Befunden und einer von dir akzeptierten Abweichung bestanden, Suiten, Mutationstests, native Prüfungen und die Windows-Lanes sind grün, der Live-Test im Desktop belegt Bauphase, Meldung, Statuszeile, Quick-Task-Leiste und Deutsch ohne Kontrollordner.
- Grenzen: Der Ton des Begleiters war live nicht zu hören bzw. nicht beobachtet, unter Windows bleibt er stumm; die Statuszeile beim Start einer untätigen Session nach der Korrektur ist automatisiert und nativ belegt, live hast du auf die Nachprüfung verzichtet; Linux und macOS laufen erst in der PR-CI, das Terminal ist nur nativ geprüft, andere Claude-Code-Versionen sind nicht qualifiziert.
- Risiken: Die Mod-API ist Early Access; drei gespiegelte Kernregeln sind nur durch Paritätstests gebunden; die Statuszeile hängt am erneuten Setzen nach jedem Lesen; abgeschlossene Alt-Runs können OR früher als erledigt zeigen als die Statuskarte; bei Standardbreite des Panels erscheint die Gate-Leiste in Kurzform (Entscheidung bei der UAT); die Pflege des Kontextgraphen steht bis zum OR aus.
