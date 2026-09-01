# CD+Tests: Release-Owned Historical Profile Compatibility

Status: done
Decision: pass_with_disclosed_baselines
Revision: 3
Date: 2026-09-01
Run: `legacy-profile-upgrade-recovery`
Based on: approved TP Revision 5 and Brownfield Analysis Revision 4

## Implemented

- Added canonical `plugin/meta/distribution-profile-history.json` with two exact contracts and six
  supported release records: `0.13.6`, `0.13.7`, `0.13.8`, `0.14.1`, `0.14.2`, `0.14.3`.
- Added a pure runtime history validator/classifier with strict schema, canonical digest, exact version
  and exact semantic contract checks.
- Replaced the incident-specific provenance registry with packaged, migration-only catalogue lookup while
  preserving current validation first.
- Extended local marketplace fixtures across all historical records and current-shape predecessors.
- Added release-history verification for supported tags, generated parity, continuity and explicit
  rejection of internally version-incoherent `agdf-v0.14.0`.
- Added generated/package projection wiring, reviewed Copilot payload measurement and directly affected
  installation, contributor and release documentation.
- Preserved existing marketplace transaction, Claude cache recovery and restart/fresh-session owners.

## Review Fixes

- Required outer ownership `source_digest` agreement for provenance-bearing current and historical
  roots while preserving authentic source-digest-less pre-provenance migration.
- Made release continuity fail closed when merge-base or baseline evidence is unavailable; only a
  confirmed initial absence permits catalogue introduction.
- Rejected valid-but-unreferenced semantic contracts.
- Propagated exact historical release, contract and digest evidence through Codex and Claude results.
- Required exact Claude version verification before committing a historical rebuild.
- Removed a failed/unverified Claude installation before filesystem rollback and prior-plugin restore.

## Deterministic Evidence

| Check | Result | Evidence |
|---|---|---|
| `test:distribution-profile-history` | pass | Six exact records, malformed catalogue and closed-policy matrices pass. |
| `test:release-version-coherence` | pass | Current source, supported tags, incoherent `0.14.0` negative and generated parity pass. |
| `test:local-marketplace` | pass | Exact migration, ownership digest, authentic pre-provenance, public evidence, host verification, uninstall-before-rollback and transaction matrices pass. |
| `test:claude-cache-recovery` | pass | Bounded Windows cleanup and one-retry contract remains green. |
| `test:lifecycle` | pass | Restart plus fresh-session behavior remains green. |
| `test:local-development-install` | pass | Existing local development behavior remains green. |
| `test:package-build` | pass | Canonical package generation and payload checks pass. |
| `release:prepare` | pass | Release-owned history validation composes with the existing release path. |
| Direct `npm.cmd pack` projection check | pass | Packaged catalogue projection is present when invoked through the native Windows executable. |
| AGDF doctor/gate/delivery-map and `git diff --check` | pass with warning | No block/revise finding; expected Context Graph update warning remains. |

## Disclosed Baseline Failures

- `test:package-contents` still fails on native Windows because its child process resolves `npm` through
  `spawnSync` and receives `ENOENT`; direct `npm.cmd pack` succeeds. This is not represented as a pass.
- Runtime Integrity still reports the pre-existing interaction-contract phrase mismatch owned by another
  active run.
- Aggregate smoke still reports the pre-existing native-Windows path expectation owned outside this
  approved TP.

These failures do not weaken focused catalogue evidence and are not repaired under this run. They remain
open inputs to mandatory review and QA.

## Evidence Boundaries

- Repository and temporary-root tests prove deterministic catalogue, migration and transaction behavior.
- They do not prove npm publication, a real native-Windows upgrade, application restart or fresh-session
  skill loading.
- No real host/cache mutation, publication, version change or VCS delivery was performed.

## Next Step

Run Task Plan Review, Clean Implementation Review and Code Review against approved TP Revision 5. Resolve
every blocking finding before QA.
