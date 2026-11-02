# QA Report: MCP ergonomics baseline evaluation

Status: draft
Gate: QA
Gate approval: open
Based on: TP, CD+Tests, Brownfield Analysis, Code Review, protocol and native run evidence
Date: 2026-10-17
Owner: Arndt Gold

## 1. QA Decision

Decision: `pass`

## 2. TP Coverage

- delivered_result: A repeatable MCP ergonomics evaluation under `evals/mcp-ergonomics/` with a protocol layer (32-call matrix over the seven `agdf` tools and the cockpit with and without UI capability), a native Claude Code layer (Opus 5.5 and Sonnet 5.5, `with_skills` and `mcp_only`, six tasks, two rounds, 25 USD cap), promote with fail-closed redaction and compare; the baseline `evals/mcp-ergonomics/baselines/2026-10-16-win32-x64/` from protocol run D and native run 3 (48 of 48 sessions measured, 9.48 USD), with unchanged AGDF MCP interfaces.

All thirteen TP tasks are done:

| task_id | Status | Evidence |
|---|---|---|
| T-001 to T-010 | done | `evidence/IMPLEMENTATION_STATUS.md` |
| T-011 | done | `CD_TESTS.md`, `evidence/BASELINE_COMPARE.json`; T6 re-evaluated and runner corrections in `evidence/CR_FIX_VERIFICATION.json`, `evidence/CR13_NATIVE_SMOKE.md` |
| T-012 | done | baseline promoted again after the Code Review fixes; protocol run E and native run 3 compare `unchanged` (`evidence/CR_FIX_VERIFICATION.json`) |
| T-013 | done | `tools/list` byte-identical to T-002, diff scope within SDD-014, suites pass (`CODE_REVIEW.md`) |

PRD acceptance AC-001 to AC-015 is covered through the TP traceability (TP section 2). AC-012 is met in the working tree; see Missing Evidence.

## 3. Evidence

- Protocol layer: runs D and E identical in every non-timing metric with identical server, dispatcher and SDK digests; 32 calls, 14 `ok`, 9 `sdk_validation`, 9 `agdf_failure`, all 9 AGDF failures without `isError` (F01).
- Native layer: run 3 measured 48 of 48 sessions, `complete`, isolation manifests unchanged, credential copy removed; every pre-session MCP check connected at the first attempt; variants verified per session (tool sets, no foreign MCP server, skills and hook guard as specified).
- Success by task (with_skills / mcp_only, 4 sessions each): T1 0/4 vs 4/4, T2 4/4 vs 0/4, T3 4/4 vs 1/4, T4 0/4 vs 0/4, T5 2/4 vs 0/4, T6 0/4 vs 0/4.
- Compare: protocol run E and native run 3 `unchanged` against the baseline; the pre-fix native output compares `changed` on the four T6 cells, so the compare detects real changes.
- Brownfield fit: `BROWNFIELD_ANALYSIS.md` pass; the evaluation reuses the MCP test harness, owned-runtime fixture, fixture builders and workspace snapshots; `claude-host-e2e.mjs` shares the extracted session module; no file under `packages/` changed.
- Solution integrity and code quality: `CODE_REVIEW.md` pass with three independent reviewers; sixteen findings CR-01 to CR-16 resolved; no open normalized finding.
- Tests: `test:mcp-ergonomics` 37 of 37, `test:verification`, `test:host-compatibility`, `compatibility:check`, mcp-server `test:package` and `test:sdk-digest` pass; the `mcp-ergonomics` stage runs in the verify-ci repository lane.
- Documentation: `evals/mcp-ergonomics/METRICS.md` (counting and comparison rules) and `README.md` (commands, authentication, re-evaluation) match the code.
- Governance: UAT preparation could not read the localized UR goal (invalid summary field). UR source revision `ad5a4176-32d1-4b55-a42f-779bb2d8eaee` corrected only that summary; UR, PRD, SD and TP were renewed with unchanged English content and approved again on 2026-10-17, and Brownfield Review, Brownfield Analysis, CD+Tests and CR were recorded afresh after a fresh run (37 of 37 unit tests and all suites pass, `tools/list` and baseline compare unchanged).
- Context Graph: `context_graph_impact: link_only`; `context_graph_refs`: `evals/mcp-ergonomics/baselines/2026-10-16-win32-x64/`; `context_graph_required_action: link` at closeout, as decided in the Brownfield Analysis; `context_graph_reconciliation: open_gap` until OR; `context_graph_gate_effect: none` for QA.

## 4. Missing Evidence

- qualification_limits: Native results hold only for Claude Code 2.1.296 on Windows with Opus 5.5 and Sonnet 5.5; Codex is a separate follow-up. Two repetitions show a range, not a spread. T6 values come from the corrected predicate applied to the recorded transcripts, which is exact because no T6 session wrote evidence. Signal cleanup and charging an unknown session cost are unit-tested only. The root scripts ran in the working tree after a build, not from a fresh clone, because nothing is committed yet. The native host E2E probe was not re-run after the shared session module changed; its parser equivalence is unit-tested.

Protocol and native layers ran under Node v22.22.3 and v24.19.0; both are recorded in the baseline provenance.

## 5. Risks

- delivery_risks: The pre-existing `packages/mcp-server` `test:performance` failure (warm dispatch p95 about 2.5 s against 1 s, F09) is unchanged and outside this run. The AGDF MCP connect timeouts of native run 2 (29 sessions) are unexplained; the pre-session check now records launcher diagnostics if they recur. Native runs can still copy credentials with the explicit `--credentials-copy` opt-in. The work is uncommitted in the `main` working tree and partly staged.

## 6. Required Next Step

Request `Approval: QA` for this report; after approval, UAT.

## 7. Gate Approval

Approve this QA decision only with:

`Approval: QA`

## AGDF Approval Summary (de; source=en)

- Ziel: Eine wiederholbare MCP-Ergonomie-Messung mit einer eingecheckten Baseline der heutigen AGDF-MCP-Schnittstellen, gegen die spätere Phasen unverändert vergleichen können.
- Ergebnis: Messkomponente unter evals/mcp-ergonomics mit Protokoll-Schicht (32 Aufrufe) und nativer Claude-Code-Schicht (Opus 5.5 und Sonnet 5.5, mit Skills und nur MCP, sechs Aufgaben, zwei Runden); Baseline 2026-10-16-win32-x64 mit 48 von 48 gemessenen Sessions für 9,48 USD; Schnittstellen unverändert; alle 13 TP-Aufgaben erledigt, Code Review mit 16 behobenen Befunden bestanden, alle Tests grün.
- Grenzen: Nur Claude Code 2.1.296 unter Windows; zwei Wiederholungen zeigen eine Spanne; T6 aus den aufgezeichneten Transkripten neu bewertet; Signal-Aufräumen und unbekannte Kosten nur per Unit-Test geprüft; Skripte im Arbeitsbaum, nicht aus frischem Klon ausgeführt, weil noch nichts committet ist.
- Risiken: Bestehender Performance-Testfehler im MCP-Server (F09) unverändert; Verbindungs-Timeouts aus Lauf 2 ungeklärt, werden künftig diagnostiziert; Arbeit liegt uncommittet im main-Arbeitsbaum.
