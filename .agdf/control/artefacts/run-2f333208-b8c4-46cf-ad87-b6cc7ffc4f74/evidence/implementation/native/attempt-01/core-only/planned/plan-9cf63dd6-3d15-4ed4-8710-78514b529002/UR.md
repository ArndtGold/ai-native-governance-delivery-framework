# UR: Receipt lookup

Planning schema: planned-ur-v1
Planning id: plan-9cf63dd6-3d15-4ed4-8710-78514b529002
Planning priority: high

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-10-31
Owner: maintainers

## 1. Problem

Maintainers need to find one local receipt by an exact receipt identifier in existing project evidence.

## 2. Goal

Show the matching receipt path, with explicit absent and ambiguous results.

## Affected Users

Maintainers.

## 3. Scope

Read-only lookup by exact receipt identifier within this one project, following its existing receipt/evidence conventions. No preview is required.

## 4. Non-Goals

Content creation, network access, account changes and access to other projects.

## 5. Acceptance Signals

- Exactly one matching receipt displays its path.
- No matching receipt produces an explicit absence result.
- Multiple matches remain explicitly ambiguous.
- Source files remain unchanged.

## 6. Existing Source Of Truth

This project's existing receipt/evidence conventions are the current source of truth.

## 7. Risks And Unknowns

None for this bounded requirement.

## 8. Next Step

Review this UR at the normal UR review boundary. Gate approval remains open; no approval is recorded.
