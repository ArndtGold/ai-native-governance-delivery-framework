# AGDF Master Backlog

This file is the living control pointer for active AGDF delivery work. Detailed UR, Brownfield Review, PRD, SD, TP, QA and OR artefacts should live in stable paths and be linked from here.

## Rules

1. New product semantics, functional change or user-visible behaviour change starts as a new UR draft in a stable local artefact path, for example `.agdf/control/artefacts/<key>/UR.md`, unless an authoritative repository SoT already exists and is linked here.
2. `Approval: UR` adds or updates exactly one steering row with a document-relative Markdown link to the UR.
3. Brownfield Review is created for the same work item after UR approval when existing-system impact must be sized before PRD depth or Quick Task execution.
4. PRD, SD, TP and QA report artefacts are created for the same work item after the previous gate is approved and persisted or linked.
5. `Approval: PRD`, `Approval: SD`, `Approval: TP` and `Approval: QA` require the corresponding durable artefact or linked repository SoT before the next gate can open.
6. Generic consent such as "ok", "go ahead", "do it", "continue", "leg los" or "approved" does not update a gate. Only `Approval: <GateName>` does.
7. Keep only steering-relevant work in `Active Backlog`.
8. Every active item has exactly one linked current spec and a visible linked artefact chain.
9. Historical artefacts remain linkable but do not override the current pointer.
10. If an item is superseded, mark the replacement.
11. If active work grows beyond roughly ten items, triage the backlog.

## Active Backlog

| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |
|---:|---|---|---|---|---|---|

## Planned / Parking Lot

| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |
|---:|---|---|---|---|---|---|

## Completed / Superseded Pointers

| Key | Work item | Final status | Historical record | Outcome |
|---|---|---|---|---|
