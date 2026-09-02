# CD+Tests: Release-Owned Historical Profile Compatibility

Status: done
Decision: revise
Revision: 6
Date: 2026-09-02
Run: `legacy-profile-upgrade-recovery`
Based on: approved TP Revision 9 and Brownfield Analysis Revision 8 (`pass`)

## Delivered In Revision 6

- `local-marketplace.js` now owns one immutable local source snapshot and retains the existing
  normalized digest, marketplace staging, provenance, swap, commit and rollback authorities.
- Snapshot capture compares pre-source, snapshot and post-source digests. A mismatch raises typed
  `local_install_source_unstable`, cleans the exact temporary root and never enters marketplace
  preparation.
- The validated snapshot descriptor supplies canonical version, profile, source digest, source root
  and per-surface install version. Codex remains `0.14.4+codex.local-<digest>`; Claude and Copilot
  remain `0.14.4`.
- Snapshot cleanup occurs immediately after bytes enter the existing building stage and before any
  stable marketplace swap. A cleanup failure removes the stage, retries owned snapshot cleanup and
  leaves no stable marketplace.
- `install-local-plugin.js` no longer imports or computes the source digest or Codex local version.
  It selects the generated surface source and requests snapshot-owned preparation.
- OpenCode remains on its existing durable package-archive owner and was not generalized into the
  marketplace path.

## Focused Evidence

| Evidence | Result |
|---|---|
| `test:local-development-install` with isolated npm cache | pass; stable descriptor, exact Codex identity, canonical Claude/Copilot identity, caller-identity rejection, injected digest change, cleanup retry, zero host call and orchestration coverage |
| `test:local-marketplace` | pass; existing classification, migration, idempotence, swap, rollback, interrupted recovery and tamper matrices remain green |
| `test:lifecycle` | pass |
| source Runtime Integrity | pass; source mode, 10 skills and 16 control files |
| `release:prepare` | pass; 7 exact releases, 13-file release transaction, 33 coherent version surfaces and public plugin projection |
| syntax and `git diff --check` | pass |

## Aggregate Evidence

The isolated-cache `create-agdf smoke-test` passed release preparation, CLI modularization, local
validator, marketplace, Claude cache recovery, Copilot profile, local development installation,
package build/contents, lifecycle, Copilot repository retention, control state, parent reconciliation,
interaction presentation and Verified Change. It then stopped at the unchanged
`runtime-integrity-layout-test.js` fixture because its generated plugin lacks three expected
surface-local runtime modules: `validator-application.js`, `plugin-provenance.js` and
`validation-handlers.js`.

The snapshot implementation changes neither runtime packaging, generated runtime inventory nor that
fixture. The direct source Runtime Integrity check passes. This is a separately owned aggregate
baseline, but TP Revision 9 still requires a complete green smoke result, so it remains an evidence
gap. Later aggregate steps and earlier disclosed stale-eval/invalid-revision baselines were not
reclassified as green because this run stopped at the first failure.

## Scope And Side Effects

- Changed implementation paths are limited to the three TP-approved marketplace/orchestration/test
  files plus this run's control artefacts and Context Graph.
- Tests used temporary data roots and an isolated npm cache. No real Codex, Claude, Copilot or
  OpenCode registration/cache was changed.
- Public commands, marketplace layout, ownership/provenance schemas and host lifecycle remain
  unchanged.
- No commit, push, tag, publication or release was performed.

## Missing Evidence

- Green complete `create-agdf smoke-test` after the runtime-packaging fixture and any subsequent
  separately owned aggregate baselines are reconciled.
- A successful affected GitHub Actions rerun with complete tag/default-branch history.
- Direct host/UAT evidence remains separate and unauthorized.

## Decision

`revise`: CAT-T13 through CAT-T16 are implemented with strong focused evidence and the existing
marketplace/lifecycle regressions pass. Aggregate and remote evidence required by CAT-T12 remains
open, so release readiness and QA pass cannot be claimed.
