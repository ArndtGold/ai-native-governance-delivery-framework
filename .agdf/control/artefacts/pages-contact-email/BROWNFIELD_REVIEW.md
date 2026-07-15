# Brownfield Review: Add a Contact Email to Pages

## Decision

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `verified_change`
- required_next_gate: `none`
- related_ur: `.agdf/control/artefacts/pages-contact-email/UR.md`

## Scope And Existing Ownership

The approved scope is a bounded extension of the existing public Pages footer. The site already has the required ownership and rendering structure:

- `pages/src/data/site.ts` is the canonical owner for public site metadata;
- `pages/src/pages/index.astro` owns the existing footer and renders links from `site` data;
- `pages/package.json` provides deterministic Astro type and build validation.

No new route, component, form, service, persistence layer, permission, policy or runtime integration is needed.

## Current Coverage

- status: `partially_done`
- existing: a responsive footer and central site metadata object already exist.
- missing: the contact email value and one footer link that uses it.

## Reuse Strategy

- strategy: `extend`
- canonical owner: `pages/src/data/site.ts`
- visible owner: the existing footer link group in `pages/src/pages/index.astro`
- implementation boundary: add one canonical email value and one `mailto:` footer link.

## Impact And Compatibility

- interfaces: additive internal site metadata only.
- data model or migration: none.
- backwards compatibility: existing footer links and anchors remain unchanged.
- security and privacy: no form, tracking, submission endpoint or user-data processing is introduced; the explicitly requested public mailbox becomes visible to visitors and crawlers.
- regression evidence: `npm --prefix pages run check`, `npm --prefix pages run build`, a focused rendered-output assertion for `mailto:agdf@iself.eu`, and `git diff --check`.

## Risk Review

- parallel structure risk: none; the email value stays in the existing `site` object and rendering stays in the existing footer.
- source-of-truth drift: none if the address is declared once in `site.ts` and referenced from the footer.
- UI ownership risk: none; the footer remains the single visible owner for this contact entry.
- UI monolith risk: none; this is one additive link in an existing static link group.
- residual risk: normal public-email scraping and spam exposure, inherent in the explicitly requested public contact address.

## Mode / Slice Decision

`verified_change` is selected because the change has one canonical owner, two bounded clean candidate paths, no prohibited impact, no generated-path propagation, deterministic validation and a declared `structured_slice` escalation target. A compact fail-closed record is sufficient; PRD, SD and TP would add no material decision value for this scope.

Implementation-preparation Brownfield Analysis is not required unless Verified Change eligibility fails or scope expands.

## Context Graph Impact

- impact: `none`
- reason: this is a one-off public contact value and does not create a reusable architectural decision, risk policy or cross-run invariant.

## Required Next Step

Create and validate `.agdf/control/artefacts/pages-contact-email/VERIFIED_CHANGE.md`. Implementation is allowed only after every eligibility condition passes.
