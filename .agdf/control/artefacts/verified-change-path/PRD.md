# Product Requirements Document: Fail-Closed Verified Change Path

## Product Decision

AGDF gains `verified_change` as a compact path for a bounded, user-visible change with known ownership and deterministic proof. It is neither a prose exception nor a relaxed Structured Slice: it has explicit eligibility, a durable compact record, automated validation and mandatory escalation whenever any condition is unknown, ambiguous or false.

The user supplies one normal `Approval: UR`. After Brownfield Review records `verified_change`, the agent may create the compact record, implement only that bounded scope, run the required checks and close with a mini-closeout. No PRD/SD/TP, pre-implementation Brownfield Analysis, QA or UAT applies to an eligible Verified Change. The framework change that introduces this path remains structured delivery.

## User Outcome

For changes like the completed README/default-prompt refinement, a user receives a trustworthy short path:

1. a concise statement of what will change and why it qualifies;
2. one explicit UR approval, not a sequence of approval prompts;
3. a visible, machine-checkable scope and validation record;
4. implementation plus deterministic validation; and
5. a compact closeout stating what changed, what was checked and whether escalation occurred.

If the change cannot prove its bounded eligibility, AGDF preserves today’s stricter structured path before implementation.

## Requirements

### PRD-01: Distinct Mode And Canonical Lifecycle

The canonical Runtime Contract must define `verified_change` as a Mode/Slice Decision value alongside `quick_task`, `structured_slice`, `structured_delivery` and `block`.

The canonical transition model must define exactly one Verified Change lifecycle:

`Approval: UR` → Brownfield Review / Mode-Slice Decision (`verified_change`) → compact Verified Change Record → bounded implementation and validation → compact closeout.

The path must not add a new user approval name or silently reuse an approval intended for a later structured artefact.

### PRD-02: Fail-Closed Eligibility

The compact record and deterministic validator must require all of the following before implementation:

1. a single named canonical owner for the changed runtime or content value;
2. a bounded, declared set of allowed source and derived paths;
3. an explicit statement that the change adds no gate, permission, security, persistence, architecture, external API, CLI or release behavior;
4. a defined deterministic propagation path when derived surfaces exist;
5. at least one deterministic acceptance/consistency check that directly covers the changed value or owner relationship; and
6. a defined escalation target (`structured_slice` or `structured_delivery`) when any condition fails, is absent or is ambiguous.

The SD decides the exact schema and which conditions are machine-validated from the record versus certified by a command. Any unavailable validator, unknown owner, unbounded path, failed check or undocumented impact must fail closed before implementation.

### PRD-03: Compact Durable Record And Closeout

Verified Change must use a durable compact record rather than an informal chat claim. It must capture, at minimum:

- approved UR reference and Brownfield evidence;
- canonical owner, allowed source/derived paths and intended change;
- eligibility assertions and declared prohibited-impact categories;
- propagation and validation commands or deterministic evidence source;
- execution result, changed-path evidence, checks, escalation result and next step.

The record must be compact enough to replace PRD/SD/TP/QA/UAT for an eligible change, while remaining auditable and parseable by the control tooling.

### PRD-04: Deterministic Runtime Enforcement

The executable control model must recognize `verified_change`, report it clearly through gate status and refuse to present implementation as allowed unless a valid compact record proves eligibility.

`doctor` or an equivalent command must detect at least malformed/missing mandatory record fields, invalid mode usage, unsupported impact declarations and incomplete mandatory validation evidence. The validator must not be fooled by unrelated dirty files outside the declared scope; validation must be scoped to the record’s declared ownership and paths.

### PRD-05: Compatibility And Non-Regression

Existing Trivial Change, Narrow Code-Fix, Quick Task, Structured Slice and Structured Delivery behavior must remain unchanged. Existing run records without `verified_change` must parse with their current semantics. The new mode must not duplicate the canonical transition table in skills or generated guidance.

### PRD-06: Guidance And Propagation

The canonical Runtime Contract, agent router, relevant templates and generated surface copies must explain when to select or reject Verified Change. Human-facing guidance must state that a user-visible change is not automatically eligible; bounded ownership plus deterministic proof are required.

### PRD-07: Regression Evidence

Automated coverage must include:

- one qualifying canonical-metadata-plus-copy scenario;
- missing or multiple canonical owner rejection;
- unbounded/disallowed path rejection;
- failed or missing deterministic validation rejection;
- disallowed impact declaration rejection;
- escalation to the existing structured paths; and
- unchanged behavior for existing modes and legacy run records.

## Non-Goals

- No global relaxation of UR approval or Brownfield Review.
- No automatic classification from file count, wording size or “documentation only”.
- No bypass for permissions, security, persistence, architecture, runtime contract, API, CLI or release changes.
- No retroactive reclassification of existing runs.
- No new public CLI command unless SD proves it is necessary for deterministic validation; extending existing validator output is preferred.

## Acceptance Criteria

1. A qualifying bounded metadata/copy change can complete after approved UR, Brownfield decision, compact record and deterministic checks, with no later user approvals.
2. Every ineligible, ambiguous or unsupported case is blocked from the compact path and explicitly routed to `structured_slice` or `structured_delivery`.
3. Gate status, templates, parser and validator agree on the mode and next permitted action.
4. The compact record is durable, concise and provides enough evidence for a later audit without creating a second control model.
5. Existing lightweight and structured paths retain their documented behavior and pass regression tests.
6. Canonical and generated policy surfaces remain synchronized; runtime integrity, control-state tests, package smoke, doctor and diff checks pass.

## Decision Required

Approve this PRD to proceed to Solution Design: `Approval: PRD`.
