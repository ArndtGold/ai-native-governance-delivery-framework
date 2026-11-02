# Product Requirements Document: Verified Change Control Integrity and Proportionality

- revision: 3
- derived_from: approved UR revision 2 and refreshed Brownfield Review revision 2

## Product Decision

Repair the inconsistencies exposed by the first real bounded Pages Verified Change without adding a new lightweight mode or weakening eligibility. Verified Change remains the single machine-validated compact path for bounded user-visible work.

Its compact record may consolidate Brownfield selection, eligibility, execution evidence and mini-OR. Separate Brownfield and OR files remain compatible but are no longer mandatory for an eligible Verified Change. Static-content work receives no special exemption: it qualifies only through the same explicit fail-closed criteria.

Native gate controls also become exact-value-capability gated. A callable host control is not automatically gate-safe. AGDF must require a native attempt only when the current adapter is callable, safe to wait for and able to preserve the canonical approval independently of visible recommendation decoration. Otherwise AGDF must classify it as unavailable before invocation and use exact text.

## User Outcome

For a qualifying change such as a canonical contact value plus one footer rendering location, the user receives:

1. one durable UR and exact UR approval;
2. one compact Verified Change record containing the evidenced Brownfield selection;
3. bounded implementation plus deterministic checks; and
4. a mini-closeout in the same record, with no artificial PRD/SD/TP/QA/UAT or separate Brownfield/OR files.

If eligibility is missing, ambiguous or false, the existing structured escalation target applies before implementation.

## Requirements

### VCI-01: Canonical Workflow And Skill Alignment

Brownfield Review and gate-check rules, mode lists and output schemas must include `verified_change` everywhere the Runtime Contract permits it. Release/OR guidance must recognize an executed Verified Change Mini-Closeout as a valid compact OR target.

Every gate interaction must derive its primary approval option from the evaluated current gate as exact `Approval: <GateName>`. No workflow skill may hard-code another gate's approval value or maintain a stale subset of the canonical mode vocabulary.

Skills must reference the canonical Runtime Contract instead of copying a second transition model.

### VCI-02: Safe Markdown Path Normalization

Control-table artefact paths written as plain repository-relative paths or complete Markdown code spans must parse to the same normalized value. A code span is complete only when it has one matching opening and closing delimiter around the entire path cell.

Normalization must occur before equality and filesystem resolution checks, while preserving rejection of absolute paths, traversal, backslashes where unsupported, one-sided or otherwise partial formatting and paths outside the repository. Path-cell normalization must not reuse a generic cleaner that independently strips unmatched leading or trailing delimiters.

### VCI-03: Run-Owned Control Artefact Boundary

Verified Change scope validation must permit control artefacts only when they are:

1. explicitly linked from the selected run state;
2. normalized repository-relative paths;
3. located beneath `.agdf/control/artefacts/<selected_run_id>/`; and
4. recognized run artefact types.

The record, selected run state and Master Backlog remain permitted control paths. Any new unrelated path or control path from another run must continue to emit `AGDF_VERIFIED_CHANGE_SCOPE_ESCAPE`.

### VCI-04: Consolidated Compact Record

For `verified_change`, one `VERIFIED_CHANGE.md` may be linked simultaneously as:

- Brownfield Review evidence after it records the selection, owners, scope reason and escalation target;
- the Verified Change eligibility/execution record; and
- OR after its Mini-Closeout records delivered work, intentionally omitted work, evidence, residual risk and next step.

Separate `BROWNFIELD_REVIEW.md` and `OR.md` remain supported. Other delivery modes retain their existing artefact requirements.

The canonical parser vocabulary must recognize `OR` as a closeout artefact distinct from user gates and internal implementation steps. Reusing one normalized path for Brownfield Review, Verified Change and OR is permitted only for a run whose selected mode is `verified_change`; it must not become a generic cross-role alias for other modes or artefact types.

The linked role states must remain lifecycle-consistent. Brownfield selection must be complete before eligibility, execution evidence must exist before the record is `executed`, and OR may be complete only after the Mini-Closeout is complete. Missing, conflicting or prematurely completed role states fail closed.

### VCI-05: Proportional Static-Content Handling

No `static_content` mode, file-count heuristic, wording-size test or “documentation only” exemption is introduced.

A static-content change is merely a worked example of generic Verified Change eligibility. It must still prove one canonical owner, bounded clean source/derived paths, explicit exclusion of gate/permission/security/persistence/architecture/API/CLI/release impact, deterministic validation and a structured escalation target.

This shortens ceremony only. It does not reduce implementation checks, scope validation or evidence.

### VCI-06: Lifecycle-Stable Validation

While a Verified Change run is active, newly introduced unlisted paths must fail closed against the captured baseline.

Execution closeout must persist a machine-readable evidence snapshot containing the exact changed repository-relative paths and the baseline identity needed to evaluate the bounded scope historically. The recorded path set must satisfy the eligible source, derived and permitted run-control boundaries at execution time.

After the selected run is `completed` and its record is `executed`, the validator must continue checking record structure, ownership, recorded path safety and scope, prohibited impacts and passing validation/propagation evidence against that persisted snapshot. Later unrelated live-worktree changes must not retroactively invalidate the historical completed run, but completion must never turn absence or inconsistency of recorded execution evidence into a pass.

### VCI-07: Compatibility And Propagation

Existing runs using plain paths, code-spanned paths, separate Brownfield/OR artefacts and all non-Verified delivery modes must retain their current valid behavior. Canonical changes must propagate through the existing generator to Codex, Copilot and OpenCode surfaces.

No new public CLI command, approval name or delivery mode is introduced.

### VCI-08: Regression Evidence

Automated tests must prove:

- Brownfield and gate-check guidance/output include `verified_change` across canonical and generated surfaces;
- every ready gate derives its exact primary approval value from the evaluated gate and no skill hard-codes a different gate value;
- plain and code-spanned artefact paths resolve identically while unsafe paths and one-sided backticks remain rejected;
- same-run linked UR, Brownfield and OR paths are permitted;
- another run's control path and arbitrary unlisted paths still fail closed;
- `OR` is parsed as a recognized closeout artefact and one compact record can satisfy lifecycle-consistent Brownfield, execution and mini-OR links only in `verified_change` mode;
- conflicting role states and cross-role path reuse in other modes fail closed;
- an active run still detects scope escape;
- a completed executed run validates its recorded changed-path snapshot and remains stable under later unrelated worktree changes;
- a completed record with missing or inconsistent execution-scope evidence fails closed;
- the contact-email reproduction no longer needs to classify OR as a product-derived path; and
- runtime integrity, control-state, Verified Change, routing and package smoke checks pass.

### VCI-09: Exact Native Approval Transport

The canonical surface adapter contract must distinguish callability, deliberate wait safety and exact approval transport. A native gate interaction is eligible only when the current host adapter is callable, can wait without timeout, default or hook-supplied continuation, and can prove one of these value capabilities before invocation:

- `exact_option_value`: the returned deliberate selection is byte-for-byte the canonical `Approval: <GateName>` value; or
- `separate_label_and_value`: the host may decorate presentation, but the adapter returns the separate unchanged canonical value.

Static plugin metadata may declare an expected transport capability, but it is not sufficient evidence when the current host tool schema or runtime behavior is available and contradicts or cannot confirm that declaration. Missing, stale, contradictory or unknown capability evidence must fail closed.

An adapter with decorated-label-only transport, missing capability evidence, unsafe wait behavior or unknown behavior is not gate-safe. Before producing the ready-gate projection, AGDF must derive `native_attempt_required` from this complete preflight. AGDF must:

1. expose `native_attempt_required: true` only when the adapter passes callability, wait-safety and exact-value preflight;
2. expose `native_attempt_required: false` when any preflight condition fails, avoiding the contradictory state where invocation is both required and forbidden;
3. classify the native presentation outcome as `unavailable_before_invocation`;
4. avoid invoking that native control;
5. present the exact textual approval fallback once;
6. preserve unchanged gate authority; and
7. wait for a new deliberate user response.

AGDF must never remove `(Recommended)`, localized text or other decoration after the response to synthesize approval. The existing exact validator remains authoritative.

Automated coverage must include the observed Codex case where `request_user_input` can expose only `Approval: PRD (Recommended)` as the returned option value, proving that the value is rejected, the decorated-only adapter is routed to fallback before invocation and the ready-gate projection does not claim that a native attempt is required.

## Non-Goals

- No subjective size assessment.
- No static-content bypass or extension-based trust rule.
- No relaxation of UR approval or Brownfield selection.
- No silent quality bypass.
- No post-response stripping, fuzzy matching or normalization of decorated approval labels into authority.
- No automatic commit, push, pull request or release.
- No modification of the delivered contact-email product behavior.
- No broad redesign of all AGDF artefact formats.
- No trust in a static adapter capability declaration when current host evidence is missing or contradictory.

## Acceptance Criteria

1. Skills, Runtime Contract, parser, evaluator and templates agree on the consolidated Verified Change lifecycle and complete mode vocabulary.
2. The original contact-email flow can use a compact record without extra Brownfield/OR files or false scope escapes.
3. Unsafe, ambiguous or cross-run paths remain fail-closed.
4. Active execution remains protected from newly introduced unlisted paths.
5. Completed executed records remain historically stable under future unrelated worktree changes by validating a persisted machine-readable execution-scope snapshot.
6. Static content receives a proportionate compact path only by satisfying the unchanged generic eligibility contract.
7. Canonical and generated surfaces remain synchronized and all focused validation passes.
8. Gate-check derives the exact primary approval option from the evaluated current gate; no hard-coded gate value can drift from that state.
9. `OR` is recognized as a closeout artefact, and consolidated multi-role paths are accepted only for lifecycle-consistent `verified_change` records.
10. A callable but decorated-label-only native adapter is never invoked for a gate; `native_attempt_required` is false, the exact-text fallback is selected before invocation and the exact validator remains unchanged.

## Decision Required

Approve this PRD to proceed to Solution Design: `Approval: PRD`.
