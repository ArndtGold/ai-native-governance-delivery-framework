# CD+Tests: AGDF Companion in the Claude Projection of the AGDF Plugin

Decision: pass
Status: `pass`

Run: `agdf-begleiter-companion-20261025-01`
Based on: approved TP (revision 28 material), SD (revision 25 material), Brownfield Analysis pass (`BROWNFIELD_ANALYSIS-input-03.md`)
Recorded: 2026-10-26

## Decision

- decision: pass
- scope: approved TP tasks T-001 to T-009

## Task Fulfilment

| Task | Result | Evidence |
|---|---|---|
| T-001 | Host probe complete. Loading and validation in an installed build; failure isolation of the SessionStart hook, MCP and dispatch with load-time and hook-time failures. `$.store` is retained after uninstall, which led to the SD source revision of SDD-07; the plugin data directory state file is removed. | `T-001_HOST_PROBE.md`, `T-001_HOST_PROBE-02.md` |
| T-002 | Build-only companion descriptor; runtime-only `hooks` in `createClaudePluginManifest`; projection tests. | `T-002_EVIDENCE.md` |
| T-003 | Host-independent logic modules and `locales.json` (en, de); checked against all 145 run states of this repository. | `T-003_EVIDENCE.md` |
| T-004 | Host adapter `register.mjs`, `hooks.json` and `persistence.mjs`; `claude plugin validate` passed; fake-host check. | `T-004_EVIDENCE.md` |
| T-005 | Generation into the runtime plugin only; portable validator, Copilot exclusion, runtime integrity positive and negative checks, package contents. | `T-005_EVIDENCE.md` |
| T-006 | Logic, adapter and integrity suites plus six source-mode integrity cases, registered as `test:claude-companion` in `smoke-test` and in the CI `installation` domain; ten deliberate defects detected. | `T-006_EVIDENCE.md` |
| T-007 | Copilot payload unchanged at 397 / 3,495,539 with the review recorded; seven skill-eval fingerprints moved (from the gate-transition fix); compatibility re-recorded; `npm run verify:ci` passed all 27 stages. | `T-007_EVIDENCE.md` |
| T-008 | Claude section of INSTALL.md documents the companion. It was updated after T-009 with the slash-menu limit and the live result. | `T-008_EVIDENCE.md`, `T-009_EVIDENCE.md` |
| T-009 | Native `claude plugin validate` and `claude plugin test` (2/2); real installation; dated live desktop session covering four states, no-run state, gate bar, still pose, switching off and on, and a new session; byte-identical run states. | `T-009_EVIDENCE.md`, `live/` |

## Scenario Coverage

All 23 TP scenarios have evidence:

- SCN-001 to SCN-011, SCN-014 to SCN-016, SCN-018 and SCN-020: automated suites in `verify:ci`.
- SCN-013 and SCN-017: T-001 probes.
- SCN-021: T-007.
- SCN-022: native checks.
- SCN-002, SCN-004, SCN-012 and SCN-019: live session.
- SCN-023: documentation diff. The owner's review of it belongs to CR / PR.

## Deviations And Owner Decisions

- SDD-06 interpretation, accepted by the owner on 2026-10-26: a run completed during the session stays assigned so that "fertig" can be shown.
- `$.session.root()` instead of `$.session.cwd()` for the display root.
- Module-held session state redrawn with `$.ui.invalidate` instead of a `$.state` contract, so the Claude manifest needs no `types` entry.
- The AGDF core fix (Brownfield Analysis as source-revision initiating phase) travels on the same branch by owner decision of 2026-10-25.

## Verification State

- `npm run verify:ci` passed all 27 stages on the full change set before T-009.
- After T-009, only these changed: INSTALL.md text and the run's own evidence files. On them, `community-health-test`, `cli-modularization-test` and `compatibility:check` (after `npm run build:prepare`) pass.
- Open findings for CR attention: T-009 F1 to F5. All are documented; none blocks.
