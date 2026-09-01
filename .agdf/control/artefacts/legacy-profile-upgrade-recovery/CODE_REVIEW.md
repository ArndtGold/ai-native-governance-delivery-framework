# Code Review: Release-Owned Historical Profile Compatibility

Status: pass
Decision: pass
Revision: 2
Date: 2026-09-01
Run: `legacy-profile-upgrade-recovery`
Based on: approved TP Revision 5 and CD+Tests Revision 3

## Resolved Findings

| Finding | Severity | Resolution |
|---|---|---|
| Outer ownership source digest was not bound to observed provenance digest. | medium | Provenance-bearing current/historical roots require valid equality; authentic pre-provenance remains separately classified. |
| Release continuity treated unavailable baseline evidence as success. | medium | Merge-base/tree failures now block; only confirmed initial absence is accepted. |
| Valid unreferenced catalogue contracts were accepted. | medium | Every contract must be referenced; focused negative added. |
| Exact historical identity was dropped from installer results. | medium | Codex and Claude expose exact release, contract and digest evidence. |
| Authentic pre-provenance markers without `source_digest` were rejected by the first fix. | medium | Digest requirement now applies only after pre-provenance classification; authentic fixture added. |
| Claude historical rebuild committed without exact installed-version evidence. | high | Missing/mismatched version fails before commit and rolls back. |
| Claude rollback could leave the failed installation active. | medium | Failed installation is uninstalled before filesystem rollback and prior-plugin restoration. |

## Final Review

Independent final code review returned `PASS`. Focused marketplace, history, release, lifecycle,
package-build and release-preparation tests pass after all resolutions.

## Decision

Pass. No open correctness, security or regression finding remains in the approved scope.
