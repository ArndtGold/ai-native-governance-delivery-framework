# TP Review: AGDF Companion in the Claude Projection of the AGDF Plugin

Decision: pass
Status: `pass`

## Decision

- decision: pass
- run_id: `agdf-begleiter-companion-20261025-01`
- reviewed_at: 2026-10-26
- reviewer: Claude Code implementing agent
- basis:
  - approved TP (T-001 to T-009, SCN-001 to SCN-023), SD and PRD;
  - `CD_TESTS-input-01.md`, plus `CD_TESTS-input-02.md` for the QA revise corrections;
  - Code Review pass (`CODE_REVIEW-input-03.md`);
  - task evidence `T-001_HOST_PROBE*.md`, `T-002_EVIDENCE.md` to `T-009_EVIDENCE.md`, and `live/`;
  - the first review `TP_REVIEW-input-01.md` (revise).
- summary: all nine tasks are fully done; TPR-F01 to TPR-F03 are resolved.

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| T-001 | fully_done | `T-001_HOST_PROBE.md`, `T-001_HOST_PROBE-02.md`: loading, failure isolation of the SessionStart hook, MCP and dispatch (SCN-013); uninstall leaves no companion state (SCN-017) | none | none |
| T-002 | fully_done | `T-002_EVIDENCE.md`: runtime-only `hooks` from the companion descriptor; projection tests | none | none |
| T-003 | fully_done | `T-003_EVIDENCE.md` and `CD_TESTS-input-02.md`: all four core lifecycles parse; only `active` runs are open; superseded and abandoned runs are never assigned; the missing-control message names the checked folder (en, de); without an observed turn the „läuft“ reason names the next step | none | none |
| T-004 | fully_done | `T-004_EVIDENCE.md`; CR corrections in `CODE_REVIEW-input-02.md`; the adapter suite drops a selection on a superseded run; the stepping buttons carry localized accessible names (en, de; native engine check) | none | none |
| T-005 | fully_done | `T-005_EVIDENCE.md`; regenerated plugin passes the runtime integrity and companion integrity checks (SCN-015, SCN-016) | none | none |
| T-006 | fully_done | `T-006_EVIDENCE.md` and `CD_TESTS-input-02.md`: parity fixtures for superseded and abandoned runs against the core reader (SCN-005); the companion lifecycle set is asserted equal to the core set; reader and view tests cover the folder name (SCN-009); mutation check 6/6 | none | none |
| T-007 | fully_done | `T-007_EVIDENCE.md` and `CD_TESTS-input-02.md`: runtime plugin and provenance regenerated, compatibility re-recorded and checked; passed all 27 stages (exit 0, 2026-10-26; cli-smoke 4926 s), including the three companion suites and all 22 source/phase cells of the MCP source-revision test | none | none |
| T-008 | fully_done | `T-008_EVIDENCE.md`; `INSTALL.md` now also states that only active runs are open and that the missing-control message names the checked folder (SCN-023) | none | none |
| T-009 | fully_done | `T-009_EVIDENCE.md`: native and live checks (SCN-002, SCN-004, SCN-012, SCN-019, SCN-022). On the corrected build, native `claude plugin validate` passes and `claude plugin test` passes 3/3 | The installed desktop build predates the corrections; a live spot check is planned before UAT | UAT live spot check |

## Summary

- fully_done: T-001 to T-009
- partially_done: none
- not_done: none
- out_of_scope_changes: The AGDF core fix (Brownfield Analysis as an initiating phase of a source revision). It ships in the companion pull request by owner decision, and the mixed-version limit is documented (CR-F11).
- risks: The companion reads `RUN_STATE.md` with its own bounded parser (SDD-04). Fixture parity binds the fields, and the lifecycle vocabulary is bound to the core set.
- required_next_step: Rerun the QA gate.

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| AC-001 | off / on, toggle and persistence | T-004, T-009 | `live/09-off-closed.png`, `live/10-on-again-still.png`, `live/11-new-session-auto-open-still.png` | fulfilled | none |
| AC-002 | on, assigned run at default width | T-006, T-009 | `live/03-laeuft.png` to `live/06-fertig.png` | fulfilled | none |
| AC-003 | on, run-derived state | T-003, T-006, T-009 | Four states in `live/03` to `live/06`. Superseded and abandoned runs read as closed, not unreadable (logic suite, core parity). The run-derived „läuft“ reason names the next step, and only an observed turn says that Claude is working. The live screenshot `live/03-laeuft.png` predates this text. | fulfilled | none |
| AC-004 | on, no run assigned / selected | T-003, T-006, T-009 | `live/01-no-run-real-repository.png`, `live/02-no-run-live-project.png`; closed runs are not offered and a selection on them is dropped (adapter suite) | fulfilled | none |
| AC-005 | on, German panel | T-003, T-009 | All labels German in `live/03` to `live/06`. The German folder message has no English text (view suite). The engine renders the stepping buttons named „Vorheriger Run“ and „Nächster Run“ (native test). | fulfilled | none |
| AC-006 | on, status unavailable | T-003, T-006 | Desktop pane rendered by the Claude Code 2.1.302 engine in `claude plugin test`: "No AGDF control folder in “live-project”." with "Checked project folder: C:/live-project" | fulfilled | none |
| AC-007 | all modes, read-only | T-004, T-009 | `live/harness-ledger.json`; no approval or continuation control in any screenshot | fulfilled | none |
| AC-008 | incompatible or failing host | T-001, T-006 | `T-001_HOST_PROBE-02.md` debug log and stream output | fulfilled | none |
| AC-009 | install and uninstall | T-001, T-005 | `T-001_HOST_PROBE.md` file listing | fulfilled | none |
| AC-010 | still pose, accessories | T-006, T-009 | `live/04-wartet.png`, `live/08-still-after-turn.png` | fulfilled | none |

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-F01 | implementation_gap | CD+Tests | resolved | `CD_TESTS-input-02.md`. `run-state.mjs` parses `active`, `completed`, `superseded` and `abandoned`. `assignment.mjs` treats only `active` as open and assigns only `active` or `completed`. Superseded and abandoned fixtures match the core reader. The adapter suite drops a selection on a superseded run. Re-introducing the old rules fails the suites. | none |
| TPR-F02 | implementation_gap | CD+Tests | resolved | `CD_TESTS-input-02.md`. The `no_control` snapshot carries `root`. `view.mjs` shows `messages.noControl` with the folder name and `messages.noControlHint` with the full path (en, de). Reader, view and terminal tests cover it, and native `claude plugin test` renders it in the desktop pane. | none |
| TPR-F03 | evidence_gap | evidence_obligation | resolved | `CD_TESTS-input-02.md`: `npm run verify:ci` on the corrected tree, passed all 27 stages (exit 0, 2026-10-26; cli-smoke 4926 s), including the three companion suites and all 22 source/phase cells of the MCP source-revision test | none |
