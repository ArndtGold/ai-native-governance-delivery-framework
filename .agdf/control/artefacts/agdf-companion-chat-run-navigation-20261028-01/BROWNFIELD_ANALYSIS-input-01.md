# Brownfield Analysis: AGDF Companion Chat-Run Navigation and Panel Changes of 2026-10-28

Decision: pass
Mode: `pre_implementation_analysis`
Status: `pass`

## Run

- run_id: `agdf-companion-chat-run-navigation-20261028-01`
- related_sd: `.agdf/control/artefacts/agdf-companion-chat-run-navigation-20261028-01/SD.md` (approved, revision 11)
- related_tp: `.agdf/control/artefacts/agdf-companion-chat-run-navigation-20261028-01/TP.md` (approved, revision 13)
- current_gate: Brownfield Analysis
- reviewer: Claude
- reviewed_at: 2026-10-28

## Brownfield Analysis

- mode: pre_implementation_analysis
- decision: pass
- scope: Approved TP tasks T-001 to T-009 (SDD-01 to SDD-12).
- evidence: `assignment.mjs:16-32` (`assignRun` with changed-in-session first, then selection; `stepSelection`); `notice.mjs:14-22` (`observedRun` calls `assignRun` with snapshot, session start and selection); `view.mjs:35-62` (`buildPanelView` calls `assignRun`, maps origins, builds `openRuns` with condensed bars); `register.mjs:65-90` (`announce` builds the observation), `:107` (selection drop on refresh), `:191-199` (`select` and `step` presses), `:255-275` (run list and stepping row drawn only when `originKind` is not `session`), `:278` (root `minHeight: rows - 1`), `:344-366` (`turn.start` and `turn.complete`, `const answered = await next(e)`), `:381` (render passes view input); `state.mjs:39-43` (`displayState` overlay); suites `packages/cli/scripts/claude-companion-test.js` (assignment and state tests) and `claude-companion-adapter-test.js` (fake host with `turn.start`/`turn.complete`, footer, menu and list tests).
- missing_evidence: Whether the Windows desktop hands the main-loop answer text to `turn.complete` and whether a fractional body reserve avoids the scrollbar (T-001 probe, before adapter work).
- current_coverage: partial — assignment, stepping, origins, overlay, footer, menu, sized list and gate bars exist with tests; recognition of named runs, chat mention, browsing state, automatic return, return control, status line while browsing, waiting precedence and the reduced reserve do not.
- reuse_strategy: extend — `assignRun` stays the single owner and gains `mention`, `isBrowsing` and `chatRunId`; `observedRun` and `buildPanelView` pass the same inputs; the existing turn hooks feed the mention; the footer menu gains one conditional entry; `displayState` changes one condition; the sizing constant changes after the probe; the suites extend their existing helpers.
- risks: (1) Three call sites of `assignRun` (`view.mjs`, `notice.mjs`, `register.mjs:107`) must pass consistent inputs, or panel and status line diverge; the adapter tests must cover both. (2) Dropping the stored selection on refresh (`register.mjs:107`) must not fire for a chat run that is shown while a selection exists. (3) Whole-token matching must treat `.` and `_` as id characters because run ids may contain them. (4) The stepping row's new visibility must keep the list mode for "no run assigned".
- context_graph_impact: unchanged from the Brownfield Review (update `CG-RUN-STATUS-CARD` after implementation evidence, before closeout).
- required_next_step: CD+Tests, beginning with the T-001 host probe.

## Minimal Clean Implementation Path

1. T-001: probe mod in this session's dev-mods folder showing the answer text at `turn.complete` and the body with reserves of 0, 0.25 and 0.5 rows; capture the window; remove the probe.
2. T-002: `namedRun` in `assignment.mjs`; `session.chatMention` in the turn hooks.
3. T-003: `assignRun` inputs and result; `session.isBrowsing`; presses set it; main-loop `turn.start` clears it; stepping row condition.
4. T-004: return button and menu entry; texts.
5. T-005: `announce` with browsing off; `displayState` keeps `wartet`.
6. T-006: sizing constant from T-001 in the root and `listCapacity`.
7. T-007 to T-009: suites, native test, generators, `INSTALL.md`, live check.

## Findings

No finding blocks or revises the approved TP; the risks above are implementation obligations inside T-002 to T-007.

## Next Permissible Step

- next_allowed_action: CD+Tests for the approved TP, beginning with T-001.
- forbidden_until_then: none beyond the TP order.
