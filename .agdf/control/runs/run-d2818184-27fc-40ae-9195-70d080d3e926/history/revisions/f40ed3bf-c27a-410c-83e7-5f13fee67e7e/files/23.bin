# CD+Tests: Companion core in Core (run view, MCP events, figure states)

Decision: pass
Gate: CD+Tests
Type: CD+Tests
Reviewer: Claude (implementing agent for Arndt Gold)
reviewed_at: 2026-11-06
run_id: run-d2818184-27fc-40ae-9195-70d080d3e926

## Scope

Approved TP (revision 31) tasks T-001 to T-012 on branch `feat/companion-core-run-view` cut from main `53e8e900`. T-013 (native check in the Claude desktop app) needs the owner and is UAT input. Contradictions found during implementation are listed in `evidence/CD-contradictions.md` (C1 to C5) with the interpretation used and the owner decisions of 2026-11-06.

## Implementation

| Task | Result | Main files |
|---|---|---|
| T-001 | Fixtures F01 to F13, golden status cards (CLI and MCP, de and en), companion regression cases | `packages/core/test/fixtures/companion-fixtures.js`, `packages/core/test/status-card-golden-test.js`, `packages/cli/scripts/claude-companion-parity-test.js` |
| T-002 | Core run view from the unchanged `evaluateGateCheck` report | `packages/core/lib/companion/run-view.js` |
| T-003 | Read-only command `run-view --dir --json --language [--run ID]...`, schema `run-view/1` | `packages/cli/lib/cli/*`, `packages/cli/lib/runtime/validator-application.js` |
| T-004 | Store and per-run diagnosis with MCP reason codes and counts | `run-view.js` (`projectDiagnosis`) |
| T-005 | Figure moods and reasons in Core; companion texts in the central catalog | `packages/core/lib/companion/figure-state.js`, `plugins/agdf/meta/agdf-interaction-locales.json` |
| T-006 | Companion reads the run view through `$.process.run` only; `core.mjs` and `locales.json` removed | `plugins/agdf/host-templates/claude/companion/*.mjs` |
| T-007 | Event model `companion-event/1`, pure `deriveEvent`, preview bounds, journal reader | `packages/core/lib/companion/events.js` |
| T-008 | Journal at the final result projection, once in the executing process, 256 KiB plus one rotation file, data root from the launcher | `packages/core/lib/companion/journal.js`, `packages/mcp-server/src/generation-runtime.js`, `packages/mcp-server/src/server.js`, `packages/cli/lib/mcp-dispatch-runtime.js`, `packages/cli/lib/mcp-lifecycle/plugin-runtime.js` |
| T-009 | Review facts (preview, bytes, digest, source match) and drift warnings in the run view | `journal.js`, `packages/core/lib/control-state/run-material.js` (`sealedFiles`), `run-view.js` (`readRunDrift`) |
| T-010 | Companion polls the journal every 2 s, filters by normalized root, P1 toasts and pane entries, "events unavailable", run view only on fingerprint, event or language change | `events.mjs`, `register.mjs`, `view.mjs` |
| T-011 | Host-neutral harness from Core exports and the journal format only | `packages/core/test/fixtures/host-neutral-harness.js` |
| T-012 | Generated assets rebuilt, payload and Copilot checks, compatibility record re-recorded (56 scenarios, 0 failed) | `docs/compatibility/*` |

## Verification

| Scenario | Check | Result |
|---|---|---|
| SCN-001, SCN-002, SCN-004, SCN-006, SCN-008, SCN-017 | `node --test packages/core/test/companion-run-view-test.js` | pass (7) |
| SCN-018 golden part | `node --test packages/core/test/status-card-golden-test.js` | pass |
| SCN-003, SCN-020 | `node --test packages/cli/scripts/claude-companion-parity-test.js` | pass (4), red on the baseline |
| SCN-016, SCN-022 | `node packages/cli/scripts/claude-companion-test.js`, `claude-companion-adapter-test.js`, `claude-companion-integrity-test.js` | pass |
| SCN-002 command | `node --test packages/cli/scripts/run-view-command-test.js` | pass, no control write |
| SCN-012 pure, SCN-013 bounds, SCN-010 rotation, SDD-006 interleaving | `node --test packages/core/test/companion-events-test.js` | pass (6) |
| SCN-010, SCN-012, SCN-013, SCN-015, SCN-021 tool path | `node packages/mcp-server/test/companion-journal.test.js` (facade legacy, facade modern, plugin generation, direct server) | pass; approval_requested journaled 12 to 20 ms after the call started |
| SCN-007, SCN-008, SCN-009 | `node --test packages/core/test/companion-host-neutral-test.js` and the harness part of `companion-journal.test.js` | pass (3) |
| SCN-011, SCN-014 | `claude-companion-adapter-test.js` (journal tick, root normalization, malformed lines, process-call counts, drift toast) | pass |
| SCN-019 | `test:contract`, `test:mcp-ergonomics` (61), `test:payload-budget`, `test:copilot-profile`, `compatibility:check` | pass |
| SCN-018 suites | `npm run verify:ci` up to `archives`; then every `cli-smoke` step on its own, `wrapper-smoke`, `pages-install`, `pages` | pass up to `archives` after the two corrections below; `cli-smoke` 76 of 78 steps pass, the two others are listed under defects (one corrected and re-run green including every later test of that step, one unchanged symlink-privilege case whose remaining chain tests pass on their own: `decision-resource`, `material-recovery`, `whole-flow`, `verified-change-flow`, `structured-flow`, `revision-command`, `expanded-source-revision`); `test:performance` pass; `wrapper-smoke`, `pages-install`, `pages` pass |

## Defects Found By The Full Verification

| Stage | Defect | Correction |
|---|---|---|
| `archives` (`test-package-consumers.mjs`) | The Copilot runtime projection leaves `control-inspect/cockpit.js` out, but `run-view.js` imported `boundedCode` and `projectCockpitAssessment` from it; since the CLI loads the `run-view` handler statically, every Copilot runtime command failed (`ERR_MODULE_NOT_FOUND`) | Both pure functions moved unchanged to `packages/core/lib/control-inspect/run-classification.js`, which every profile carries; `cockpit.js` re-exports them, so the cockpit is unchanged |
| `cli-package` (`package-contents-test.js`) | The Claude-companion path rule also matched Core's `runtime/core/lib/companion/` | Rule narrowed, exact positive check added (see below) |
| `cli-smoke` (`test:codex-plugin-mcp`) | The plugin launcher passed `AGDF_COMPANION_DATA_ROOT` into the preparation step `ensure()` as well, not only into the facade processes | The variable is added to a separate facade environment only; `ensure()` receives the unchanged environment |
| `cli-smoke` (`test:mcp-server`, `safety.test.js`) | The new journal module was not declared in the reviewed filesystem write boundary of the reachable MCP graph | `runtime/core/lib/companion/journal.js` declared with `renameSync` and `mkdirSync` (its own directory and one rotation); its append stays below the plugin data root |
| `cli-smoke` (`import-cockpit-archive-test.mjs`) | Inside the long smoke chain the unchanged archive import test failed with `EPERM` while renaming a temporary folder | Not changed: the test passes on its own (15 of 15, twice) and inside `test:control-maintenance` (twice); recorded as a Windows file-lock flake of an unchanged test |
| `cli-smoke` (`test:run-command-flow`, `packages/core/test/project-initialization-test.js`) | Cases 18 and 29 fail with `EPERM` because their own setup calls `symlinkSync` (lines 110 and 262) without the symlink skip guard; this Windows account has no symlink privilege | Not changed: the test and `canonical-initialization.js` are unchanged since main `75e99d2f`; the failure happens in test setup before any product code runs. The remaining tests of the chain were run on their own |

## Changed Existing Tests

| Test | Change | Why no assertion is weakened |
|---|---|---|
| `claude-companion-test.js` | Rewritten around run-view entries; figure geometry, chime, persistence, language setting, assignment and chat-run navigation kept unchanged | Run rules moved to Core (SDD-001) and are asserted there against the status card; the process boundary (SCN-022) and catalog keys are new checks |
| `claude-companion-adapter-test.js` | Fake `$.process` runs the real validator in process; stepping neighbours come from the run view (C4); review blocks are reported through the run view (C3); a valid empty control folder for the project switch; two timers; a touched run file before post-turn reads (SDD-007) | Every behaviour check stays; new checks for process failures, journal ticks, P1 notices, drift and process-call counts |
| `claude-companion-integrity-test.js` | Added import, process-call and generated-runtime checks | Additive |
| `claude-companion-parity-test.js` | Setup reads through a process adapter and catalog labels | T-001 assertions unchanged; SCN-020 added |
| `cli-modularization-test.js` | `run-view` in the expected command list and option shape | Same exactness for the new command |
| `package-contents-test.js` | The Claude-companion path rule no longer matches Core's host-neutral `runtime/core/lib/companion/` modules | The Claude companion rule is unchanged; a new check requires exactly the four Core modules in both runtime copies |
| `packages/mcp-server/test/safety.test.js` | One new entry in the declared write-owner map for the journal module | The symbol scan is unchanged and exact; the entry declares the new owner instead of widening any existing one |

## Owner Decisions On Contradictions

Decided by Arndt Gold on 2026-11-06 after the full verification (details in `evidence/CD-contradictions.md`).

| Item | Decision | Effect on this delivery |
|---|---|---|
| C1 `too_large` | Keep the reason with count 0; never invent it | Deviation from the SDD-003/T-004 wording accepted; an oversized run shows `run_state_invalid` |
| C2 refresh cost | Accept 1.31 to 1.42 s per run-view call on this repository's store | No follow-up; calls happen only on fingerprint, event or language change |
| C3 review results | The status card is authoritative | A recorded review `revise`/`block` is no companion block and raises no notice |
| C4 order and session change | Informational, no decision requested | Order and "changed in this session" use the run view's `last_activity` |
| C5 drift sources | Accept the interim | Drift covers bound documents; the input file of a recording is compared only at record time in its journal event |

## Limits

- Drift of a recording's input file after recording is not detected (C5, accepted).
- A thrown failure of unknown effect is exercised through the directly executing server with an injected executor; through the plugin generation the same catch path is exercised with a thrown not-dispatched failure. A real unknown-effect failure inside a generation cannot be provoked without fault injection.
- Concurrent journal writers are covered by a bounded interleaving test, not by a multi-process stress run.
- `run_completed` and `recovery_required` are derived from real projected results in the pure test; a full closeout run is outside the tool-path suite.
- T-013 (native desktop check with screenshots and measured refresh time) is open and needs the owner.
