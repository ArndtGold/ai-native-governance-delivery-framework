# QA Report: Release-Owned Historical Profile Compatibility

Status: pass
Decision: pass
Gate approval: exact `Approval: QA` accepted on 2026-09-01 after same-run, QA-gate, durable
Revision 2 and run revision_id `4CDFB6C4-4DA1-44D0-ADAD-8F4BBB98F50B` revalidation
Revision: 2
Date: 2026-09-01
Run: `legacy-profile-upgrade-recovery`
Based on: approved TP Revision 5, CD+Tests Revision 3 and mandatory reviews Revision 2

## Scope Decision

QA covers the repository-owned catalogue, exact migration classification, ownership/provenance
authority, canonical rebuild and rollback, historical host evidence, release continuity, generated and
package projections, and preservation of bounded Claude recovery/lifecycle behavior.

It does not claim npm publication, a real native-Windows upgrade, application restart or fresh-session
skill loading.

## Passing Evidence

| Evidence | Result |
|---|---|
| Distribution profile history suite | pass: six exact releases and malformed/closed-policy matrices |
| Release version coherence | pass: 33 surfaces, six snapshots and explicit incoherent `agdf-v0.14.0` rejection |
| Local marketplace | pass: authority, migration, exact historical evidence, host verification and rollback matrices |
| Claude cache recovery | pass |
| Lifecycle | pass |
| Local development install | pass |
| Package build | pass: deterministic complete builds |
| Release preparation and public plugin | pass |
| Native `npm.cmd pack --dry-run --json` | pass: shared and Copilot catalogue projections present |
| Mandatory reviews | pass after seven resolved findings; independent final Code Review `PASS` |
| Doctor, gate-check and delivery-map | no block/revise; expected Context Graph update warning |
| `git diff --check` | pass |

## Disclosed Non-Success Baselines

- `test:package-contents` exits non-zero on native Windows at `spawnSync npm ENOENT`; direct
  `npm.cmd pack --dry-run --json` succeeds and contains both catalogue projections.
- Runtime Integrity exits non-zero on the pre-existing interaction-contract ownership-boundary phrase
  owned by another active run.
- Aggregate smoke exits non-zero on the pre-existing status-card/native-Windows expectation owned
  outside this TP.

These failures remain non-successful. They do not contradict a requirement changed by this run, do not
mask a focused catalogue failure and were not weakened or repaired under this scope.

## Risk And Evidence Boundaries

- Unknown versions, malformed history, ownership/provenance/digest mismatch and unavailable release
  continuity evidence fail closed.
- Authentic pre-provenance migration remains supported without extending catalogue authority.
- Historical Claude rebuilds require exact installed-version evidence before commit and uninstall any
  failed installation before filesystem/prior-plugin restoration.
- Direct host mutation and loaded-session evidence remain UAT-only.

## Decision

Pass. The repository implementation satisfies approved TP Revision 5 with unrelated baseline failures
explicitly preserved. Exact `Approval: QA` may advance the run to UAT preparation only.

## Next Step

Review this report and approve only with:

`Approval: QA`
