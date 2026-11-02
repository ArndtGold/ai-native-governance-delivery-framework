# Product Requirements: Clarify the Narrow Bug Track on Pages

## Status

- status: approved
- approval: `Approval: PRD`
- approval date: 2026-07-14
- derived_from: `UR.md`, `BROWNFIELD_REVIEW.md`

## Product Outcome

The “Choose the Lightest Safe Delivery Path” section communicates that a Narrow Bug Track is an evidence discipline for a known defect, not a peer delivery mode or approval bypass. Readers can distinguish it from Verified Change without reading the Runtime Contract.

## Requirements

### PRD-01: Precise Card Identity

Rename the existing `Bug Lightweight` card to `Narrow Bug Track`. Its trigger must name a reproducible, bounded defect and explicit defect evidence rather than a generic fast path.

### PRD-02: Retained Controls

The card’s path/outcome must state plainly that it does not bypass required QA, OR or repository approvals. It must not claim that those controls always apply when a target repository does not require them.

### PRD-03: Verified Change Distinction

The card must identify Verified Change as the separately machine-validated compact change path. It must not reproduce its record fields, transition table or imply that every defect qualifies.

### PRD-04: Presentation Compatibility

Keep the existing three-card data model, order, section layout, anchors and rendering. The edit belongs in the existing content data unless rendering evidence proves a minimal adjacent change necessary.

## Acceptance Criteria

1. Public label is `Narrow Bug Track`.
2. The trigger references a reproducible bounded defect with clear evidence/fix boundary.
3. The path/outcome says the track retains required QA, OR and repository approvals, without inventing a new gate rule.
4. The card distinguishes Verified Change as machine-validated and compact, without duplicating its policy.
5. The section still renders exactly three cards in its existing layout.
6. Pages type/check and production build pass; no Runtime Contract or plugin file changes are made.

## Non-Goals

- No new `bug_lightweight` Mode/Slice Decision or executable control path.
- No change to Runtime Contract semantics, agent routing, approvals or skill behavior.
- No new Page component, route, navigation anchor or general Bug Track documentation section.

## Evidence And Constraints

- canonical semantics: `plugin/meta/agdf-runtime-contract.md` `Bug Lightweight Track` and `Verified Change`.
- existing public owner: `pages/src/data/site.ts` `requirementPaths`.
- visual owner: `pages/src/pages/index.astro`; preserve its current data-driven rendering.

## Required Next Step

Draft the focused Solution Design and request `Approval: SD`.
