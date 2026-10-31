# AGDF Master Backlog

Optional legacy planning/history reference. Current Run membership, control, approvals and evidence
belong to `.agdf/control/runs/<run_id>/RUN_STATE.md` and its registered artefacts. Fresh setup does
not seed this live file; new Run operations never maintain its rows or acquire its lock.

## Rules

1. Preserve existing planning and historical information, original sections, links and provenance.
2. The optional legacy view is read-only and separate from current Run counts and evaluation.
3. Backlog-only ideas are not Runs; no automatic conversion, approval transfer or history deletion.
4. A missing, malformed or stale legacy backlog cannot veto valid Run work. Gate rules remain with
   the canonical control contracts and exact Run approvals, never a table row.
5. Preserve each document-relative Markdown link, such as `[UR](artefacts/<key>/UR.md)`, with its
   original meaning for legacy data.
6. The existing parser in `packages/core/lib/control-evaluation/shared.js` remains authoritative for
   legacy status/link/scope vocabulary. Old wide tables and raw historical links remain inspectable;
   do not silently rewrite them as part of Run work. Optional scope tags include
   `[framework-maintenance]` and `[external-delivery]` and confer no authority.
7. Explicit supported recovery may finish only an old journal's already-recorded backlog output,
   preserving original old/next bytes, lock order and conflict checks. No new synchronization follows.
8. Do not replace this optional file with another mandatory shared planning index. Worktree
   preparation follows the sole task-target-resolution placement/reuse/ignore rule.

## Active Backlog

| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |
|---:|---|---|---|---|---|---|

## Planned / Parking Lot

| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |
|---:|---|---|---|---|---|---|

## Completed / Superseded Pointers

| Key | Work item | Final status | Historical record | Outcome |
|---|---|---|---|---|
