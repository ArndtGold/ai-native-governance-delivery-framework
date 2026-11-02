# Product Requirements: Gate State Clarity

## Status

- status: approved
- approval: Approval: PRD (2026-07-10)
- delivery_mode: structured_slice

## Product Outcome

AGDF gate/status output makes the current authority boundary obvious: the user can see the current gate, the exact approval needed, what that approval unlocks, what is allowed now, and what remains forbidden until a later gate.

## Users And Jobs

- A user running `gate-check --status-card` needs to know whether they can proceed, which approval is missing, and what happens after that approval.
- A user reading `gate-check --json` needs machine-readable fields that distinguish current permission from post-approval transition.
- An agent using durable `.agdf/control/AGDF_RUN.md` needs consistent wording so it does not imply later-gate authority prematurely.
- A maintainer needs the change to reuse the existing gate model and not introduce a second transition table.

## Functional Requirements

### Status-Card Output

1. The compact status-card output must continue to show status, current gate, blocked-by, missing approval, next step, quality outlook, allowed now and forbidden now.
2. When a user approval is missing, the status-card must additionally show the next gate or internal step that the exact approval unlocks.
3. When useful, the status-card must show what becomes allowed only after the missing approval is supplied.
4. Wording must avoid implying that `open` at a gate means later artefacts or implementation are already allowed.
5. Completed or OR handoff states must not show misleading post-approval fields when no approval is missing.

### JSON Output

1. `gate-check --json` must expose additive machine-readable fields for the same transition information.
2. Existing JSON fields must remain backward-compatible unless a breaking change is explicitly approved.
3. The new fields must be absent, empty or `none` in completed/OR states where there is no missing approval.

### Durable Guidance

1. Runtime Contract wording must describe the distinction between current gate, missing approval, next step, next gate after approval and allowed after approval.
2. AGDF run-status guidance or templates must use the same semantics where they present a compact status projection.
3. The canonical gate order and transition model must remain centralized in the Runtime Contract and existing gate-check logic.

## Acceptance Criteria

1. A PRD-gated status-card case shows current gate `PRD`, missing approval `Approval: PRD`, next gate or internal step after approval, and allowed-after-approval text without implying SD/TP/implementation authority now.
2. An internal-step case, such as Brownfield Review after UR approval, shows no missing approval and does not invent an approval-gated transition.
3. An OR/completed handoff case shows no missing approval and no misleading next-gate-after-approval field.
4. `gate-check --json` includes additive transition fields with deterministic values for the same cases.
5. Existing smoke tests remain green and focused new smoke assertions cover the three required cases.
6. Runtime integrity checks pass and generated output stays synchronized from authoritative `plugin/` sources.

## Non-Goals

- Changing the gate order.
- Changing approval formulas.
- Allowing implicit approvals.
- Making Brownfield Review, SD, TP, implementation, QA or UAT skip their existing controls.
- Creating a second gate-transition model.
- Redesigning the full status-card UI beyond the minimum clarity fields.

## Constraints And Risks

- Backward compatibility for JSON consumers requires additive fields.
- The implementation must derive transition wording from existing gate decisions rather than a duplicate table.
- Extra output lines should be concise enough for interactive CLI use.
- Templates and generated package output must follow the existing source-of-truth and sync flow.

## Success Evidence

- Focused smoke tests cover a missing-approval user gate, an internal-step state and an OR/completed state.
- `npm --prefix create-agdf run smoke-test` passes.
- `node plugin/scripts/check-runtime-integrity.mjs` passes.
- `git diff --check` passes.

## Required Next Step

Review this PRD and provide exact approval:

`Approval: PRD`
