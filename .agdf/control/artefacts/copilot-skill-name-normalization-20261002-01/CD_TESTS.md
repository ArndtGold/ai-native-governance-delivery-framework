# CD+Tests: Shared skill-name resolution

Status: done
Gate: CD+Tests
Date: 2026-10-02
Based on: approved TP.md and SD.md

## Deliverables

The existing Core dispatcher contract now derives exact host names from the trusted plugin definition. Core services bind that definition; production callers cannot substitute a model-owned inventory. Canonical IDs remain stable in dispatcher results and continuations. Unknown host names and ambiguous/invalid catalogs fail before target evaluation. Existing localized recovery lists catalog-derived valid forms. Shared projection is used by package generation and the global OpenCode adapter; it edits identity frontmatter and explicit UI references while retaining canonical parameters and paths. Architecture and router documentation reflect all four hosts.

Nine judgment-skill runtime/dispatch paragraphs were compacted to retain the existing Copilot budget. Language, target authority, activation fingerprint, binding restrictions and terminal-stop rules remain unchanged. No budget or assertion was relaxed.

## Baseline and execution boundary

Baseline commit: 4184dbdb9aa0a049a6add75d0775235800b3945c. `evidence/baseline.log` demonstrates that the original normalizer rejects agdf-gate-check and that the original broad Copilot substitution changes a technical gate-check contract path. This is source reproduction, not a recorded fresh Copilot session.

The pre-existing untracked plugins/agdf/hooks/ blocks the portable-source validator in the primary checkout. It was preserved. Build/package/integrity checks ran in /tmp/agdf-skill-fix-snapshot, copied from the same modified source with only that foreign hook directory and Git/control build noise excluded. Test-owned control fixtures were then copied; no test approval was applied to this delivery run. Generated outputs were copied back to the primary checkout. Source behavior and package evidence do not prove installation or live model behavior.

## Verification

| Command | Result | Evidence |
|---|---|---|
| node packages/core/test/skill-names-test.js | pass | dispatcher.log |
| npm --prefix packages/cli run test:skill-dispatch | pass, including 40 adapter cases | dispatcher.log |
| node scripts/skill-name-projection-test.mjs | pass | projection.log |
| npm run build | pass in isolated source snapshot | build-final.log; build-repeat.log |
| npm --prefix packages/cli run test:copilot-profile | pass, including integrated projection regression | copilot.log |
| npm --prefix packages/cli run test:opencode-hardening | pass | tool execution and generated fixture |
| npm --prefix packages/cli run test:agent-skills-conformance | pass | source and four generated surfaces |
| npm --prefix packages/cli run test:instruction-footprint | pass | generated/temp-install evidence; loaded_host_evidence false |
| npm --prefix packages/cli run test:payload-budget | pass | profiles.log |
| npm --prefix packages/mcp-server test | pass, all eight suites plus new host-name protocol regression | mcp.log |
| npm --prefix packages/cli run test:interaction-presentation | pass | rendered interaction fixtures |
| npm --prefix packages/cli run test:operational-localization | pass | render.log |
| npm --prefix packages/cli run test:package-contents | pass | package-contents.log |
| npm --prefix packages/cli run test:package-build | pass | package-build.log |
| node plugins/agdf/scripts/check-runtime-integrity.mjs | pass in isolated snapshot and primary checkout (source mode) | integrity.log; primary source check |
| git diff --check | pass in primary checkout | reviewed diff |

Two unchanged builds produced identical combined generated/Core-resource/npm bytes: SHA-256 500f5ff3808d97fbcc8c4991195b2d1645250f73cf98e2b00a932176b9be167e (determinism.json). Copilot inventory: 179 files, 1476466 bytes, below unchanged ceilings of 179 files/1476640 bytes.

Initial diagnostic failures were resolved: stale generated digest required assembly; parallel profile regeneration transiently removed runtime files, so generation and dispatcher tests were separated; the new CLI fixture initially expected exit 0 for unresolved targets, corrected to the existing exit 2 contract. All final applicable commands passed. The primary-source hook validation failure remains an explicitly isolated pre-existing condition.

## Scenario coverage

| scenario_id | criterion_id | decision_id | Evidence and observed result |
|---|---|---|---|
| SCN-001 | AC-001 | SDD-001 | Core catalog matrix: every registered host/skill form resolves deterministically |
| SCN-002 | AC-001 | SDD-003 | Canonical/alias result skill and host_action parity; CLI/MCP matrix |
| SCN-003 | AC-002 | SDD-001 | Changed definition id/prefix fixture propagates without hardcoded aliases |
| SCN-004 | AC-002 | SDD-002 | Trusted Core definition overrides raw inventory; tool extra surface rejected |
| SCN-005 | AC-002 | SDD-002 | Existing direct canonical Core suite and function contract remain compatible |
| SCN-006 | AC-003 | SDD-003 | Unknown/doubled/foreign/uppercase/slash/newline/overlong matrix; no target/gate calls |
| SCN-007 | AC-003 | SDD-004 | Alias-ID collision, duplicates, invalid/empty catalog and prefixes reject before target |
| SCN-008 | AC-003 | SDD-004 | Every registered locale renders skill forms; injection/overlong and unrelated fields reject |
| SCN-009 | AC-004 | SDD-001 | Shared helper used by generator/adapter; all four surfaces and global OpenCode tested |
| SCN-010 | AC-004 | SDD-005 | Actual skill files retain skill_id/--skill/contract paths; correct frontmatter |
| SCN-011 | AC-004 | SDD-005 | Backticks, path substrings and name lines outside frontmatter preserved; explicit UI mapped |
| SCN-012 | AC-004 | SDD-005 | Determinism, unchanged budgets, integrity and package tests pass |
| SCN-013 | AC-005 | SDD-002 | Real CLI subprocess and stdio MCP all-host/name matrix pass; trusted surface retained |
| SCN-014 | AC-005 | SDD-003 | No-target aliases remain target_unresolved/authorizes false; bound fixture continuation |
| SCN-015 | AC-005 | SDD-003 | Canonical continuation IDs and existing gate/run binding matrix pass |
| SCN-016 | AC-006 | SDD-006 | Architecture/router docs updated; reports distinguish source/package from live host |

## Knowledge and limits

- memory_target: scope_artifact
- memory_reason: run evidence remains here; reusable name semantics belong to the existing dispatcher architecture documentation.
- memory_refs: docs/architecture/02-dispatcher.md; this report and evidence/
- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- missing_evidence: fresh installed/model sessions intentionally outside approved TP scope.
- required_next_step: Mandatory code review and supporting plan/structure reviews, then QA.
