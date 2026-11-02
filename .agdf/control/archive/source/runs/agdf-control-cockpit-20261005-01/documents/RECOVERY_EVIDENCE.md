# Cockpit run restoration evidence

Date: 2026-10-05
Run: agdf-control-cockpit-20261005-01

## Observed loss

The run state, UR and presentation record were absent while their directories remained. WebStorm2026.1 idea.log records staging these three files at 18:20:08, removing them from the index with git rm --cached at 18:20:19, reverting MASTER_BACKLOG.md with checkout HEAD at 18:20:19 and switching to main at 18:20:25. Directory timestamps and the Git reflog agree with this interval. This supports an IDE rollback during branch switching as the loss context. git rm --cached alone does not delete working-tree files; the exact filesystem deletion is not separately logged. No AGDF runtime deletion was established.

## Restored original binding

UR was recovered from local Git blob 2d00ca2a0cdea1703db590d9b4757f11d11153e6 plus the exact summary patch recorded in this chat. Its SHA-256 matches the original presentation: b90a6fe3005cf0baeb15ac46798df902f5e5909a1256b8e44d6eec5fe0f35388.

Run State revision 4 was recovered from local Git blob e8b0d58db264e487706a197339c79907e09b72bc using the recorded run-update operation. Its original timestamp 2026-10-05T16:16:17.995Z was determined by matching the original content seal, not by assigning a new timestamp. Core confirmed the exact original seal: sha256:130cb06dab6607f392c868049f0d2440bd18fa35193fc57340b84a443641a98e. Original revision: 9e158086-7437-474f-b6be-c294215055a1.

Presentation d116a103-3065-48c8-830d-42622b48dd51 was recovered from the actual original run-present output in this chat, retaining its ID, creation time and every binding field. Its record digest matches sha256:e3e201dce5206cc97910f3ed57897a219d3c0761199b22c707fde40b05d86de8. Core validateRunPresentation succeeded against the restored real target. No new presentation was created and no earlier reply was transferred to a different revision.

## Approval and resulting state

The user's previously supplied exact Approval: UR was forwarded again through installed run-approve with the original revision and presentation. Outcome: approved. Resulting revision: e2ebb8e0-59e3-49f4-b231-a2cb8a2804ed (revision 5). Current gate: Brownfield Review. Final Core seal validation: valid. The missing backlog pointer was restored under existing owned file locks using the Core table editor and atomic writer; unrelated rows were retained.

## Operational boundary

IDE rollback of uncommitted control files can discard durable run evidence. Keep active cockpit files and their MASTER_BACKLOG pointer together when switching branches; preserve them through an explicit backup or reviewed commit instead of discarding those paths. Restoration cannot prevent a deliberate external rollback. No commit, branch change or IDE preference change was performed by this repair.
