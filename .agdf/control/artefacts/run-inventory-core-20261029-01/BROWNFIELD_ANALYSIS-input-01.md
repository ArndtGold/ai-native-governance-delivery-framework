# Brownfield Analysis: Shared Core Run Inventory from Stored Run State

Decision: pass
Mode: pre_implementation_analysis
run_id: run-inventory-core-20261029-01
Reviewer: Claude Code implementing agent
reviewed_at: 2026-10-29

## Scope

Approved TP revision 10 (T-001 to T-009) for the approved SD revision 8 and PRD revision 6.

## Current Coverage

| Task | Coverage | Evidence |
|---|---|---|
| T-001 placeholder rule move | not_done | `isDecisionContentPlaceholder` lives in `packages/core/lib/control-evaluation/decision-content-readiness.js:9-13`, whose imports reach `control-read/fs.js`; callers: `decision-content-readiness.js:15`, `control-state/run-state-edits.js:6,115`, `packages/cli/scripts/claude-companion-test.js:16,526` (placeholder parity with the companion) |
| T-002 inventory module | not_done | No shared run-list module; the pure helpers exist: `control-state/run-state-document.js` (`scalarFields`, `sectionTableRows`, `parseControlState`, no imports) and `run-identity.js` (patterns only) |
| T-003 reader | partially_done | `run-state-reader.js:20-56` `discoverRuns` reads, validates and memoizes every run; it already reports missing `RUN_STATE.md`, invalid paths and pending journals as invalid runs |
| T-004 doctor | partially_done | `control-evaluation/doctor.js:44-82` builds `inventory: { state, active_count }`; extension point is that object |
| T-005 inspect operation | not_done | `control-inspect/selection.js:3-4` lists operations; `service.js:206-302` switches on them; the definition measures 4993 of 5000 bytes (`contract.js:17`, measured 2026-10-29); `renderActiveRunInventory` (`interaction-presentation.js:1251-1266`) and its `activeRunInventory` copy exist |
| T-006 CLI command | not_done | Read command pattern in `packages/cli/lib/cli/validation-handlers.js:142-165` (doctor, delivery-map) and `command-registry.js:38-40` |
| T-007 routing | not_done | Catalog entry `control.doctor` and section "Active Run Inventory" in `plugins/agdf/meta/contracts/request-activation.md:142,178-187`; router line `plugins/agdf/meta/agdf-agent-router.md:122-123`; skill line `plugins/agdf/skills/gate-check/SKILL.md:33`; cases in `evals/request-activation/cases/de.json` and `en.json`; `packages/cli/scripts/active-run-inventory-test.js:16-40` |
| T-008 documentation | not_done | Handbook chapter 4 (de/en) and `docs/architecture/07-ui-konzept.md` section 9 row "Vorhaben finden" name the missing inventory read scope |
| T-009 verification | not_done | Suites named in the TP exist; `test:control-inspect` in `packages/cli/package.json:98` is part of the CI domains (`scripts/ci-test-domains.mjs:26`) |

## Reuse Strategy

- extend: `discoverRuns` output feeds the inventory; no new file reading.
- extend: `run-state-document.js` helpers for sections and tables; no new Markdown parser.
- refactor: the placeholder rule moves to a pure module with a re-export, so the companion parity test keeps importing from `decision-content-readiness.js`.
- extend: the shared control-inspect service, selection rules and `renderActiveRunInventory` copy for the new operation and its presentation.
- extend: the existing doctor all-active report object.
- new: only `run-inventory.js`, `run-inventory-reader.js`, `decision-content-placeholder.js` and the test file.

## Affected Interfaces And Data

- `agdf_inspect` input schema: one new operation value in two enums; two shortened descriptions. No other code or test checks the text "Never with gate-check" or "All runs: doctor/delivery-map" (search over `packages`, `scripts`, `evals`, `plugins`, `docs` on 2026-10-29).
- `packages/cli/scripts/control-inspect-test.js:36-37` asserts the exact operation list and must be extended; its schema-versus-selection loop (`:57-71`) covers the new unbound operation automatically.
- Doctor JSON: two new fields; the SessionStart session check reads only status and findings.
- Request-activation catalog: one new operation entry; the evaluation library checks command owners.
- No stored data, run state or backlog changes.

## Regression Risks And Test Impact

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| The definition budget leaves 7 bytes today | `CONTROL_INSPECT_FUNCTION_DEFINITION` measured 4993 bytes | `warn` | Measure after T-005; stop and return to SD if above 5000 |
| `packages/cli/runtime/` and `packages/cli/generated/` are ignored build copies | `.gitignore:29,31` | `none` | Refresh them with `sync-package-assets` before CLI and MCP package tests |
| The companion's placeholder parity test imports the old path | `claude-companion-test.js:16,526` | `none` | Keep the re-export; run the companion suite |
| Doctor output grows by about one kilobyte per hundred runs | measured doctor JSON 121858 bytes for 57 active runs | `none` | Within the 1 MiB MCP output limit; SCN-017 measures time |

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-RUN-SCOPED-CONTROL-STATE`
- context_graph_required_action: `update`
- context_graph_evidence: The shared inventory becomes the run-list owner beside the shared resolver; recorded at closeout.

## Minimal Clean Implementation Path

T-001, then T-002 with its Core test, T-003, T-004, T-005 with the budget measurement, T-006, T-007, T-008, T-009. No parallel parser, writer or locale entry is introduced.
