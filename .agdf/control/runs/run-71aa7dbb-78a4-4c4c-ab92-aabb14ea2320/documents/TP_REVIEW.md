# TP Review: Single Core reader for the companion event journal

Gate: TP Review
Type: TP Review
Status: `done`

## Run

- run_id: run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320
- approved_tp: sha256:07fee34825864b4c8fa4f54c3987d65952fed6f9fd0793e08d5ba6001271d08d
- approved_prd: sha256:38bcd377de8c3b429d8f2394f2cb3b711cfa648489364b9b506316b6097c5da2
- approved_sd: sha256:2934a7c419645896a9ce640accb97ad8fcf12d2ea08125fbe5bc07ab8ac1c06f
- reviewer: Claude (agent)
- reviewed_at: 2026-11-27
- evidence_state: the code after the Code Review fixes (CR-01, CR-03, CR-04, CR-06), with the suites re-run on that state (CODE_REVIEW.md, Re-verification After Fixes)

## Task Coverage

| task_id | Status | Evidence |
|---|---|---|
| T-001 | fulfilled | `read-companion-events.js` (renamed, generalized), `cockpit-session.js` `selectedRunEvents`, `scripts/core-projection.mjs` |
| T-002 | fulfilled | `run-view.js` events first and additive `events`; `parse-args.js`, `command-registry.js`, `project-read-command.js` |
| T-003 | fulfilled | `run-inventory.js` `runLastActivity`; `cockpit.js` `last_activity`; `types.ts` |
| T-004 | fulfilled | `run-state.mjs`, `register.mjs`, `events.mjs`, `view.mjs` (incl. the CR fixes) |
| T-005 | fulfilled | `CompanionCard.tsx`, `companion-figure.d.ts` |
| T-006 | fulfilled | `companion-journal-contract-test.js`, `fixtures/companion-journal-fixtures.js`, `test:companion-run-view` |
| T-007 | fulfilled | adapted tests listed in CD_TESTS.md, plus the CR regression cases in `claude-companion-adapter-test.js` and `claude-companion-test.js` |
| T-008 | fulfilled | payload baseline, `build:prepare`, `compatibility:record`, `compatibility:check` (56 scenarios, 0 failed) after the CR fixes |

## Scenario Coverage

| scenario_id | criterion_id | design_decision_id | Status | Evidence |
|---|---|---|---|---|
| SCN-001 | AC-001 | SDD-004 | fulfilled | contract test SCN-001 pass |
| SCN-002 | AC-001 | SDD-005 | fulfilled | `claude-companion-test.js` export assertions pass |
| SCN-003 | AC-002 | SDD-001 | fulfilled | contract test SCN-003 pass |
| SCN-004 | AC-002 | SDD-001 | fulfilled | contract test SCN-004 and `cockpit-session-test.js` pass |
| SCN-005 | AC-002 | SDD-001 | fulfilled | contract test SCN-005 pass with a real junction and the drive letter in the other case (not skipped) |
| SCN-006 | AC-003 | SDD-002 | fulfilled | `build:prepare`, payload baseline diff, `test:copilot-profile` and `test:package-contents` pass |
| SCN-007 | AC-003 | SDD-003 | fulfilled | `run-view-command-test.js` SCN-007 pass |
| SCN-008 | AC-004 | SDD-004 | fulfilled | `claude-companion-adapter-test.js` pass incl. shared-read, oversized/missing journal and transient-failure cases |
| SCN-009 | AC-005 | SDD-007 | fulfilled | `claude-companion-test.js` time-text cases and dated pane line pass |
| SCN-010 | AC-006 | SDD-006 | fulfilled | `companion-reading.test.tsx` confirmation test and `historyEvents` unit cases pass |
| SCN-011 | AC-007 | SDD-006 | fulfilled | `companion-reading.test.tsx` sticky test and `cockpit-session-test.js` `last_activity`/history pass |
| SCN-012 | AC-008 | SDD-008 | fulfilled | contract test SCN-012 pass |
| SCN-013 | AC-009 | none | fulfilled | suites of the Test Plan and `compatibility:check` pass; two cockpit-core host-limit failures documented in CD_TESTS.md |

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| AC-004 | M1 Claude companion on, journal changed | T-004 | adapter test renders the real pane and records the host toasts for each journal change (`shown()` lines, `host.log.toasts`) | fulfilled | none |
| AC-005 | M1 pane with an event of an earlier day | T-004 | adapter test pane line `2000-01-01 hh:mm Effect unknown ...` (English) and unit pane line `04.11. 09:15 ...` (German) | fulfilled | none |
| AC-006 | M2 Codex card of a selected run | T-005 | vitest renders the card: only the confirmed `Freigabe erfasst für Nutzeranforderungen` line, no unconfirmed PRD approval or completion; completion listed once the lifecycle is completed | fulfilled | none |
| AC-007 | M2 Codex card with five newer events | T-005 | vitest renders `09:01 Wirkung unbekannt ...` as the fifth line while uncertain and drops it after a later `last_activity` | fulfilled | none |

Visible evidence is rendered output of the real modules in the test hosts (Claude fake host, jsdom); the live Claude desktop pane and the Codex app were not opened (stated gap since the PRD).

## Normalized Findings

No applicable finding: every task and scenario of the approved TP is fulfilled with the evidence above; native live-host checks are out of the TP scope (TP section 5) and are not a plan gap.

## Decision

- decision: pass
