# Code Review: Guided AGDF UX Interaction Delivery

Status: done
Decision: pass
Reviewed at: 2026-07-15
Reviewed scope: actual diff in control-state projection, interaction helpers and
tests, canonical guidance, Pages data/rendering, and run-control artefacts.

## Findings

No correctness, security or regression finding remains in the implemented
diff.

- correctness: Ambiguous state remains blocked; the new candidate data is
  returned only as clarification metadata. Candidate titles are bounded and do
  not derive from raw Objective content. Attempt receipts cannot authorize.
- regression: Focused interaction and control-state checks, synchronization,
  runtime integrity, Pages check/build, aggregate package smoke and diff check
  all passed.
- security: No external integration, secret handling, approval persistence or
  host-owned UI simulation was added.
- maintainability: The implementation reuses existing parser and presentation
  owners. The tests cover the new public projection and receipt invariants.

## Scope observations (not code defects)

The TP Review records incomplete planned coverage: canonical discovery-source
derivation, version/screenshot labels, several focused negative fixtures and
live-host observation. These are QA inputs and must not be treated as completed
by this pass.

## Required next step

Run QA; the expected decision is `revise` unless the TP Review gaps are
resolved or explicitly re-scoped.

## Remediation Refresh (2026-07-15)

- decision: `pass`
- findings: none in the remediation diff. The JSON-derived Pages grouping,
  visible evidence labels and receipt-outcome fixtures preserve existing
  authority and build successfully.

## Final Refresh (2026-07-15)

- decision: `pass`
- findings: none. The actual diff keeps QA revise fail-closed, makes locale and
  fallback contract anchors testable, and derives Pages grouping from the
  canonical plugin definition.
- missing_evidence: Host-native rendering remains deliberately unclaimed; this
  is an evidence boundary, not an implementation defect.
- required_next_step: QA gate review.

## Follow-up Code Review Refresh (2026-07-15)

- decision: `revise`
- verified: exact normalized reconciliation, fail-closed ambiguity, single native attempt, single fallback and localized delivery status are covered by focused tests.
- remaining P1: no call site connects reconciliation to pre-creation run selection; no repository-owned host adapter can prove native button rendering.
- remaining P2: hook non-authority still lacks an executable host-boundary fixture.

## Follow-up Code Review: Reliable Native Approval Invocation

- decision: `revise`
- finding: `[P1]` The new `native_attempt_required` field is only a projection signal; no code path
  invokes or observes a host-native question, so the core reliability behavior is not implemented.
  Evidence: `create-agdf/bin/create-agdf.js` adds the field, but the diff contains no adapter-call
  owner or exactly-one-attempt seam.
- finding: `[P1]` The approved pre-creation reconciliation is absent. Existing
  `buildRunCandidates()` intentionally filters to active runs and cannot identify a matching
  completed delivery before a new run is created.
- finding: `[P2]` `delivery_state` is exposed in machine status output but is not yet rendered as the
  plain-language lifecycle/closeout distinction required by the PRD.
- security_and_authority: no authority or persistence regression found; exact approval and canonical
  run state remain authoritative.
- required_next_step: implement the missing bounded seams and add their focused tests before QA.

## Shared Pages Scope Reconciliation (2026-07-15)

- decision: `pass`
- findings: none. The later `pages/src/data/skills.ts` role-copy change is
  bounded to the shared discovery presentation, preserves canonical metadata
  ownership and passes the current interaction, integrity and Pages checks.
- required_next_step: QA gate review.
