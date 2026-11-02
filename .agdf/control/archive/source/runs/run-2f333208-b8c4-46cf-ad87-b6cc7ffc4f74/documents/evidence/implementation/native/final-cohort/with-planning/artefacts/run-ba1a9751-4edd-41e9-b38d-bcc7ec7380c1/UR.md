# UR: Evidence note lookup

Planning schema: planned-ur-v1
Planning id: plan-2d2eed01-526d-4aeb-9662-8ac55066b366
Planning priority: low

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-10-31
Owner: unspecified

## 1. Problem

Maintainers need to look up existing local evidence notes by exact ID.

## 2. Goal

Enable read-only exact-ID lookup of existing local evidence notes within this project.

## Affected Users

Maintainers of this project.

## 3. Scope

Read-only lookup by exact ID against existing local evidence notes in this project. A unique match shows exactly one matched path. Missing matches are explicit. Multiple matches remain explicitly ambiguous; never choose by recency. Preserve all sources.

## 4. Non-Goals

Network access, creating new evidence, modifying evidence notes, and accessing other projects. Product implementation and delivery are not authorized by this planning capture.

## 5. Acceptance Signals

Maintainers can locate existing local evidence notes using an exact ID, within this project and without network access or evidence changes. For exactly one match, show exactly one matched path. Distinguish missing and ambiguous cases explicitly; never choose among multiple matches by recency. Preserve all sources.

## 6. Existing Source Of Truth

The project's existing evidence-note conventions are the current source of truth. Respect existing local notes and preserve all sources.

## 7. Risks And Unknowns

Multiple matches must remain explicitly ambiguous and must never be resolved by recency. Missing matches must be explicit too. The user has confirmed no other unknowns remain.

## 8. Next Step

Retain this clarified planned UR for review. Do not start a Run until a later deliberate handoff request. Gate approval remains open; this save approves nothing.
