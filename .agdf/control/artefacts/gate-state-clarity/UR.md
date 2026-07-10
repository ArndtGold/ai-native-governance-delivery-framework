# User Requirement: Gate State Clarity

## Status

- status: approved
- approval: Approval: UR (2026-07-10)
- owner: agent
- created_at: 2026-07-10

## Problem

AGDF gate/status output can be formally correct while still being unclear to the user. In recent delivery work, `open` status at a user gate did not make the next approval path obvious enough. The output named the current gate and missing approval, but it did not consistently distinguish:

- the current operative gate
- the exact required approval
- the next gate or internal step after that approval
- what is allowed now versus what becomes allowed only after approval

This creates friction because users may reasonably expect the status card to show the next permissible gate transition directly, not only the single next action.

## Objective

Make AGDF gate/status output more explicit and less ambiguous by showing current gate, required approval, next gate or internal step after approval, and the boundary between currently allowed and post-approval allowed actions.

## Acceptance Criteria

1. Gate/status output shows the current gate and status using user-readable wording.
2. When an approval is missing, the output shows the exact required approval formula and the next gate or internal step that approval unlocks.
3. The output distinguishes `allowed now` from `allowed after approval` so implementation or later artefacts are not implied prematurely.
4. `open` and `blocked` wording is sharpened so `open at gate` cannot be mistaken for authority to skip the missing approval.
5. The same semantics are reflected consistently in the CLI status-card output, JSON output and durable run-status guidance where applicable.
6. Focused tests cover at least one user-gate approval case, one internal-step case and one completed/OR handoff case.

## Scope

- In scope: AGDF gate-check/status-card semantics, JSON fields where needed, durable status-card wording/templates, focused smoke coverage and directly affected documentation or runtime contract wording.
- Out of scope: changing the approval formula, changing the gate order, bypassing approvals, changing QA/UAT semantics, or introducing a second gate model.

## Risks

- The current gate model is intentionally centralized in the Runtime Contract; changes must not duplicate or fork the gate table.
- More output fields can become noisy if they repeat the same action in different words.
- Backward compatibility matters for existing JSON consumers; new fields should be additive unless a breaking change is explicitly approved.

## Required Next Step

Exact approval required:

`Approval: UR`
