# User Requirement: Clarify the Narrow Bug Track on Pages

## Work Item

- key: `pages-narrow-bug-track-clarity`
- title: Clarify the Narrow Bug Track as a governance aid, not a delivery-path bypass
- status: approved
- approval: `Approval: UR`

## User Need

The Pages section “Choose the Lightest Safe Delivery Path” currently presents “Bug Lightweight” as though it were a peer delivery path. The canonical Runtime Contract instead defines it as a narrow defect track: a durable, evidence-based shortcut for known defects that does not remove required QA, OR or repository-specific approvals. Public copy must make this distinction clear and distinguish it from the newly machine-validated Verified Change path.

## Desired Behavior

Sharpen the existing Pages card without adding a route, component or runtime behavior:

1. rename the card to `Narrow Bug Track`;
2. describe its trigger as a reproducible, bounded defect with explicit evidence;
3. state that it is not an independent gate bypass and retains required QA, OR and repository approvals; and
4. distinguish Verified Change as the machine-validated compact change path.

## Acceptance Criteria

1. The card no longer suggests that Bug Lightweight is a peer delivery path or substitutes for full delivery controls.
2. Its trigger, path and outcome use the Runtime Contract’s defect-evidence boundary without inventing new semantics.
3. The copy distinguishes Narrow Bug Track from Verified Change without adding a new visible card or duplicating the Runtime Contract’s transition table.
4. Existing Pages layout, navigation and requirement-path rendering remain unchanged.
5. Pages checks/build and relevant repository validation pass.

## Scope Boundary

In scope: `pages/src/data/site.ts` and minimal adjacent public Pages copy required to clarify this card.

Out of scope: Runtime Contract changes, plugin/runtime behavior, a new delivery mode, a new Pages component or route, commits, pushes, pull requests and releases.

## Evidence And Approval

- source of truth: `plugin/meta/agdf-runtime-contract.md` section `Bug Lightweight Track`.
- public-copy owner: `pages/src/data/site.ts` `requirementPaths`.
- approval: `Approval: UR` received on 2026-07-14.
