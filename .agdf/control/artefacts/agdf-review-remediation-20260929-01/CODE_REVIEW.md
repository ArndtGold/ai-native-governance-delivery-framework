# Code Review: Review v2 remediation

Decision: pass for the reviewed local diff
Date: 2026-09-29
Run: `agdf-review-remediation-20260929-01`
Basis: actual diff against `737457bdd8b4f19c18524eaa4cb469759e158836`, approved TP and Brownfield Analysis

## Code Review

- decision: pass
- findings: none open in the reviewed local source scope. Two review findings were fixed before this decision: (1) a missing target file did not check a swapped parent directory, and (2) atomic replacement could change an existing restrictive file mode. `owned-mutation.js`, `run-state-writer.js` and lifecycle tests now cover symlink/regular-directory replacement, same-byte inode replacement and mode `0600` preservation.
- missing_evidence: This diff has not run in clean Linux/Windows CI on one commit. npm registry, tagged public package and fresh loaded-host behavior were not observed. TP Review keeps these as evidence obligations; this Code Review does not promote local source checks into those claims.
- risks: A filesystem actor that can mutate a checked directory during the instant between check and rename remains outside the process-level guarantee; exact operating-system and deployment behavior awaits CI/host observation. Unknown journal, backup or registry provenance fails closed.
- required_next_step: Record CR `pass` for the exact run and revision, then ask `qa-gate` to decide with the open TP Review evidence gaps.

## Reviewed surfaces

| Surface | Concrete review evidence |
|---|---|
| Control-state integrity | `run-step-transaction.js` validates the prior seal, stages OR under locks, commits one sealed Run revision, then applies Backlog with compare/write; recovery accepts only old or committed states. Fault, external edit, existing OR and concurrent-writer fixtures pass. |
| Lock and path safety | `run-state-writer.js` reclaims only a proven dead PID, retains ambiguous locks and requires a recorded seal. Shared `contained-file.js` rejects Windows lexical escapes and real-path escape in Run, seal and Verified Change readers. |
| Host mutations | Lifecycle/OpenCode use plan snapshots and atomic replacement; marketplace checks stable digest, prior backup identity and committed phase before cleanup/recovery. Temporary-host regressions pass without changing the live installation. |
| Release and public evidence | One `agdf-v*` publish workflow, lock/version preflight, legal-file inventories, registry-state reporting, SHA-pinned Actions, generated guard projection and observation-owned Eval fingerprints pass local static/package checks. The Copilot payload ceiling was raised only to the measured 117-file / 1125353-byte inventory after the atomic-write correction; its history records the 192-byte increment. No live publish is asserted. |
| Overlap boundary | Preexisting MCP inspect README/INSTALL/architecture/protocol changes belong to `agdf-mcp-inspect-slice1-20260929-01`; broad payload and historical marketplace decisions remain with their runs. |

Context Graph impact: `link_only` to the existing control-state, public-distribution and request-activation nodes. This report supports Quality Readiness and is not a QA decision.
