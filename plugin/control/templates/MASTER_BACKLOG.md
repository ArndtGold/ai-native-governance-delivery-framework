# AGDF Master Backlog

This file is the living control pointer for active AGDF delivery work. Detailed UR, PRD, SD, TP, QA and OR artefacts should live in stable paths and be linked from here.

## Rules

1. New product semantics, functional change or user-visible behaviour change starts as a new UR draft in a stable local artefact path, for example `.agdf/control/artefacts/<key>/UR.md`, unless an authoritative repository SoT already exists and is linked here.
2. `Approval: UR` adds or updates exactly one steering row with a link to the UR.
3. PRD, SD, TP and QA report artefacts are created for the same work item after the previous gate is approved and persisted or linked.
4. `Approval: PRD`, `Approval: SD`, `Approval: TP` and `Approval: QA` require the corresponding durable artefact or linked repository SoT before the next gate can open.
5. Generic consent such as "ok", "go ahead", "do it", "continue", "leg los" or "approved" does not update a gate. Only `Approval: <GateName>` does.
6. Keep only steering-relevant work in `Active Backlog`.
7. Every active item has exactly one current spec pointer and a visible artefact chain.
8. Historical artefacts remain linkable but do not override the current pointer.
9. If an item is superseded, mark the replacement.
10. If active work grows beyond roughly ten items, triage the backlog.

## Active Backlog

| Prio | Key | Title | Status | UR | PRD | SD | TP | QA | OR | Current Spec | Notes |
|---:|---|---|---|---|---|---|---|---|---|---|---|
| P1 |  |  | `in_progress | blocked` |  |  |  |  |  |  |  |  |

## Planned / Parking Lot

| Prio | Key | Title | Status | UR | PRD | SD | TP | QA | OR | Current Spec | Notes |
|---:|---|---|---|---|---|---|---|---|---|---|---|
| P2 |  |  | `planned | review_needed` |  |  |  |  |  |  |  |  |

## Completed / Superseded Pointers

| Key | Title | Final Status | Current or Historical Link | Notes |
|---|---|---|---|---|
|  |  | `done | superseded | abandoned` |  |  |
