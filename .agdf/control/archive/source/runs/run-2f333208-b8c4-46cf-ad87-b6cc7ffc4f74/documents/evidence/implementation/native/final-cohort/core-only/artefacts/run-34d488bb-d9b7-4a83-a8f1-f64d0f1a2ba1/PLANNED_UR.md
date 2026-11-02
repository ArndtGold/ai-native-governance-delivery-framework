# UR: Receipt lookup

Planning schema: planned-ur-v1
Planning id: plan-92f42be5-fcb7-488a-ad8e-42ed96904d2f
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

Read-only exact receipt identifier lookup within this one project's existing evidence. No preview is required.

## 4. Non-Goals

Content creation, source file changes, network access, account changes and lookup in other projects.

## 5. Acceptance Signals

Exactly one match displays its matching path. No match produces an explicit absent result. Multiple matches remain explicitly ambiguous. Source files remain unchanged.

## 6. Existing Source Of Truth

This project's existing receipt/evidence conventions are authoritative. Maintainers are the supplied users; no more specific source owner is identified.

## 7. Risks And Unknowns

None for this bounded requirement.

## 8. Next Step

Review this UR at the normal UR review boundary. Gate approval remains open; no approval or downstream delivery is authorized.
