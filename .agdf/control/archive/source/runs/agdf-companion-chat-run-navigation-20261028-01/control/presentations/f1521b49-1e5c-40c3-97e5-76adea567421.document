# QA Report: AGDF Companion Chat-Run Navigation and Panel Changes

Status: draft
Gate: QA
Gate approval: open
Based on: TP, implementation evidence, task-plan review
Date: 2026-10-28
Owner: Arndt Gold

## 1. QA Decision

Decision: `pass`

## 2. TP Coverage

- delivered_result: The AGDF Companion follows the run the chat is working on.
  - **Chat run.** A main-loop prompt or final answer that names an open run as a whole word makes it the chat run, shown with "Im Chat genannt". The later of a mention and a change in this session wins. Subagent turns, ids inside longer ids and completed runs change nothing.
  - **Browsing.** "Vorheriger Run" and "Nächster Run" stay available under the chat run. A browsed run shows "Von dir ausgewählt" and is stored as the selection.
  - **Return.** The next main-loop turn brings the chat run back by itself. "Zurück zum Chat-Run" appears as a plain button under the stepping row and as the first menu entry, and only while browsing. A `/clear` or a resumed transcript starts without a chat run.
  - **Status line and toasts.** While browsing they stay with the chat run.
  - **Turns.** During a turn, waiting runs keep "wartet auf Freigabe" or "wartet auf Entscheidung", and a building run keeps "baut".
  - **Footer.** The footer meets the bottom edge of the pane without a scrollbar.
  - **Panel changes.** The panel changes of `3444befe` and `2f54fbcc` are part of the delivered baseline: framed footer with icon and menu, About, a run list sized to the pane, and gate bars beside each run.
  - **Boundaries.** The companion stays read-only, opt-in, failure-isolated and Claude-only, and needs no new hook.

All nine TP tasks are fully done (T-001 to T-009), and all 23 scenarios have their evidence; see [TP Review](TP_REVIEW-input-01.md).

## 3. Evidence

- tp_review: `.agdf/control/artefacts/agdf-companion-chat-run-navigation-20261028-01/TP_REVIEW-input-01.md`
- clean_implementation_review: `.agdf/control/artefacts/agdf-companion-chat-run-navigation-20261028-01/CLEAN_IMPLEMENTATION_REVIEW-input-01.md`
- code_review: `.agdf/control/artefacts/agdf-companion-chat-run-navigation-20261028-01/CODE_REVIEW-input-01.md`

Quality Readiness (derived; `qa-gate` is the sole decision owner):

| Dimension | Source | Result |
|---|---|---|
| Plan coverage | TP Review | pass: 9/9 tasks, 23/23 scenarios, AC-001 to AC-012 fulfilled |
| Solution integrity | Clean Implementation Review | pass: assignment in one owner, no new hook, no new core mirror; SDD-02 answer-source deviation accepted by the owner |
| Code quality | Code Review | pass: independent review; CR-F01 to CR-F10 corrected, with mutation-checked tests for the code findings |
| QA decision | qa-gate | pass |

Further evidence:

- **Automated.** The companion logic, adapter and integrity suites pass on the final tree. 12 mutation checks were caught: five for the approved navigation rules and seven for the Code Review corrections.
- **Verification.** `build:prepare` passed. Compatibility was re-recorded (56 scenarios, 0 failed, fingerprint `250e20409643a5f2b4d288cdccf268872c168a870bf5d9c13665db662af2ae98`), and one unreferenced observation file was removed (`CODE_REVIEW_VERIFICATION.md`).
- **Native.** `claude plugin validate` passed. `claude plugin test` passed 6 of 6 on Claude Code 2.1.308, including a run named in the chat, browsing and the return at the next turn.
- **Live.** The host probe (`T-001_HOST_PROBE.md`) and the live check (`T-009_EVIDENCE.md`) ran in the Claude desktop app on Windows and produced `live/00` to `live/16`. They show:
  - prompt and final answer arriving as strings;
  - body reserve 0;
  - "Im Chat genannt" with "wartet auf Freigabe" during a turn;
  - the return button and the menu entry;
  - the automatic return;
  - the footer at the bottom edge, narrow and widened;
  - 150 run states byte-identical.
- **Installed build.** The corrected build is installed (`probe-results/f9j`), and its 13 companion files are byte-identical to the generated ones.

UX Intent Fidelity: AC-001 to AC-012 are fulfilled (TP Review matrix).

## 4. Missing Evidence

- qualification_limits: The live captures predate the Code Review corrections; on the final tree the corrections are proven by the suites, the mutation checks, the native test on the host engine and the byte-identical installation (TPR-F01). The status line and toasts while browsing are proven by the adapter suite, because live the probe's status line was folded behind the installed companion's entry. Text between tool calls of a turn is not part of the answer, so a run named only there counts once the final answer or the next prompt names it (T-001). Linux and macOS run only in pull-request CI; the terminal surface is covered by the native test, not by a live terminal session; Claude Code versions other than 2.1.308 are not qualified.

## 5. Risks

- delivery_risks: The early-access mod API can change with a Claude Code update, and the native checks would then have to run again. Recognition depends on the run id appearing as a whole word in the prompt or the final answer, and a run id that only appears in quoted text also counts, because the companion reads text, not intent. The chat run lives in the session's memory only, so a reload of the mod or a new conversation starts without one. Context Graph curation is due at OR.

Context graph:

- context_graph_impact: update_existing_node
- context_graph_refs: CG-RUN-STATUS-CARD
- context_graph_reconciliation: open_gap
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: `BROWNFIELD_REVIEW.md` says to curate the entry `companion_followup_20261028` after implementation and live evidence. Curation is due at OR, before any clean handoff.

Documented deviation:

- SDD-02 names the text that `next(e)` returns as the answer source at turn end. The companion reads `e.answer` first, which the host declares as the turn's final visible text, and falls back to `next(e).text`.
- Visible behaviour is unchanged.
- Owner decision 2026-10-28: "Abweichung festhalten", without an SD revision.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-F01 | implementation_gap | CD+Tests | resolved | `CODE_REVIEW-input-01.md`: a run in an unknown state keeps stepping and the way back; mutation-checked | none |
| CR-F02 | implementation_gap | CD+Tests | resolved | `CODE_REVIEW-input-01.md`: every recorded mention is announced; mutation-checked | none |
| CR-F03 | implementation_gap | CD+Tests | resolved | `CODE_REVIEW-input-01.md`: a new conversation starts without a chat run; mutation-checked | none |
| CR-F04 | evidence_gap | evidence_obligation | resolved | `CODE_REVIEW-input-01.md`: overlay, browsing-toast and return-control tests strengthened | none |
| CR-F05 | implementation_gap | CD+Tests | resolved | `CODE_REVIEW-input-01.md`: the answer is matched after the post-turn read; mutation-checked | none |
| CR-F06 | implementation_gap | CD+Tests | resolved | `CODE_REVIEW-input-01.md`: `e.answer` is preferred; mutation-checked; SDD-02 wording deviation accepted by the owner | none |
| CR-F07 | implementation_gap | CD+Tests | resolved | `CODE_REVIEW-input-01.md`: a step onto the chat run is no browsing; mutation-checked | none |
| CR-F08 | implementation_gap | CD+Tests | resolved | `CODE_REVIEW-input-01.md`: a long text's window keeps its boundary; mutation-checked | none |
| CR-F09 | implementation_gap | CD+Tests | resolved | `CODE_REVIEW-input-01.md`: mention time from `$.clock.now()` without delaying the event | none |
| CR-F10 | evidence_gap | evidence_obligation | resolved | `CODE_REVIEW-input-01.md`: `INSTALL.md` wording corrected | none |
| TPR-F01 | evidence_gap | evidence_obligation | resolved | `TP_REVIEW-input-01.md`: live captures predate the corrections; final tree proven by the native host test and the byte-identical installation | none |
| CIR-F01 | design_gap | SD | resolved | `CLEAN_IMPLEMENTATION_REVIEW-input-01.md`: SDD-02 answer-source deviation accepted by the owner on 2026-10-28 | none |

## 6. Required Next Step

Request `Approval: QA` for this pass report, then UAT.

## 7. Gate Approval

Approve this QA decision only with:

`Approval: QA`

## AGDF Approval Summary (de; source=en)

- Ergebnis: Der AGDF Companion folgt jetzt dem Run, an dem der Chat arbeitet: Nennt ein Prompt oder die letzte Antwort eines Haupt-Turns die ID eines offenen Runs, zeigt das Panel ihn mit „Im Chat genannt“; Blättern zeigt andere Runs mit „Von dir ausgewählt“, der nächste Turn springt von selbst zurück, und „Zurück zum Chat-Run“ steht als Button unter den Blätter-Buttons und als erster Menüeintrag; Statuszeile und Meldungen bleiben beim Blättern beim Chat-Run, wartende Runs zeigen während eines Turns „wartet auf Freigabe“, die Fußzeile sitzt bündig am unteren Rand; die Panel-Änderungen der Commits 3444befe und 2f54fbcc sind miterfasst; alle neun Aufgaben und 23 Szenarien sind belegt, das unabhängige Code Review ist mit zehn korrigierten Befunden und einer von dir akzeptierten Abweichung bestanden, Suiten, 12 Mutationstests, native Prüfungen 6 von 6 und der Live-Test im Desktop sind grün.
- Grenzen: Die Live-Aufnahmen entstanden vor den Code-Review-Korrekturen, der korrigierte Stand ist automatisiert, nativ und durch die byte-gleiche Installation belegt; Statuszeile und Meldungen beim Blättern sind automatisiert belegt; Text zwischen Werkzeugaufrufen zählt erst, wenn die letzte Antwort oder der nächste Prompt den Run nennt; Linux und macOS laufen erst in der PR-CI, das Terminal ist nur nativ geprüft, andere Claude-Code-Versionen sind nicht qualifiziert.
- Risiken: Die Mod-API ist Early Access; die Erkennung braucht die Run-ID als ganzes Wort, auch eine zitierte ID zählt; der Chat-Run lebt nur im Sitzungsspeicher und beginnt nach einem Neuladen des Mods oder einem neuen Gespräch leer; die Pflege des Kontextgraphen steht bis zum OR aus.
