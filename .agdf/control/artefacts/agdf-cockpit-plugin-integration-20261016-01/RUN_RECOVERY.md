# Run recovery: original Cockpit plugin integration intake

Date: 2026-10-16
Run: agdf-cockpit-plugin-integration-20261016-01
Status: recovered

## Incident and cause boundary

The original run was created, its UR recorded and presentation prepared successfully on 2026-10-16. The first deliberate `Approval: UR` could not be recorded because `RUN_STATE.md` was no longer present. This was a missing-file incident, not an ambiguous Run ID or invalid revision.

The working copy contained only empty run, presentation and artefact directories when diagnosed. The original files were untracked. Another chat's recorded `git status` still observed those paths and the modified master backlog at 11:45 UTC. Directory modification times and Git reflog place a shared-checkout switch from `main` to `codex/ci-ten-minute-jobs` at 11:48 UTC. The same checkout subsequently returned to `main` and fast-forwarded at 13:15 UTC.

The original data survived as unreachable Git snapshot blobs and trees, including the exact run, UR, presentation record, presentation document and previous backlog. These facts establish loss of the uncommitted working-copy state outside the AGDF writers. They do not identify the exact deleting action or its actor. A plain Git checkout normally preserves unrelated untracked files; the checkout timestamp alone cannot prove which reset, discard or host operation removed them. The retained chat command history contains no evidenced command deleting this run. Desktop log files for the relevant worker contain no usable operation trace. Do not blame a particular chat or claim a proven AGDF deletion defect.

## Exact restoration

Restored only the original missing files, refusing any overwrite:

| Original path below control | Git blob | Evidence |
|---|---|---|
| artefacts/agdf-cockpit-plugin-integration-20261016-01/UR.md | a62b7e0c070102290272c1f9839a76277a13d13c | 9817 bytes; SHA-256 312e32382d3aaabb71c9fb5f928d1ac82cd25a2d223fbc1e2382169f6f16363e |
| runs/agdf-cockpit-plugin-integration-20261016-01/RUN_STATE.md | 31d718db88bdd2b2733dbde056a509439b71b0d6 | Original revision 5c298462-e2ca-45aa-8875-55a21c807c54; original content and approval seals retained |
| runs/agdf-cockpit-plugin-integration-20261016-01/presentations/97083a1f-5d46-47a3-a9f1-e756f55bfafb.json | 80133b3cf78a37eab955d1521ac862688c40b2f5 | Original record digest 8ee4b5c8f4b463226672d8d64845798a4b280a8907e8c98a7c8ab55e79bb6896 |
| runs/agdf-cockpit-plugin-integration-20261016-01/presentations/97083a1f-5d46-47a3-a9f1-e756f55bfafb.document | a62b7e0c070102290272c1f9839a76277a13d13c | Exact originally presented UR bytes |

Git tree 1a47c63afc9294c21a7685d96c9fd4c52a4eb81d records the original run and presentations tree; 3a2b7649b954c14dfceaeeb57f0b204b734178fd records its UR directory. No state, seal, presentation identity or approval was invented. The old backlog blob was retained for evidence, not copied over the current shared backlog.

## Verification and continuation

The original `run-approve` invocation, using the original presentation and verbatim user reply `Approval: UR`, returned `outcome: approved`. Its own gate, revision, document and presentation checks passed. It advanced revision 2 to revision 3, b4ed3474-5287-42c0-8f11-42c31950a82c. Immediate bound dispatcher continuation returned `doctor_status: pass` and the permitted next step Brownfield Review. No implementation or later approval was inferred.

An independent local recovery directory at `/private/tmp/agdf-cockpit-run-recovery-20261016/` holds the source blobs, SHA-256 restoration manifest and Git tree evidence. A current run/artefact archive is maintained there during this continuation so another shared-checkout switch cannot remove the only available working copy. It is a recovery copy, not another canonical control source. No Git commit or checkout change was performed by this recovery.

## Remaining limitation

The exact external removal action is unproven. Continued work must preserve that distinction. No broad product fix or deletion-prevention guarantee follows from the operational recovery. Future code/build verification should use isolated snapshots where appropriate and must not discard another chat's uncommitted state.
