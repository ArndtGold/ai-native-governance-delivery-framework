# Solution Design: Verified Change Control Integrity and Proportionality

- status: approved
- revision: 1
- gate: SD
- gate_approval: exact `Approval: SD` received on 2026-07-15 after same-run, same-gate and revision revalidation
- derived_from: approved PRD revision 3
- date: 2026-07-15
- owner: AGDF

## 1. Design Decision

Extend the existing canonical parser, Verified Change evaluator and interaction-presentation boundary. Do not add a second path parser, approval validator, delivery mode or closeout engine.

The solution has four coordinated parts:

1. strict artefact-path cell parsing before any path comparison or filesystem access;
2. explicit closeout artefact recognition and lifecycle-safe consolidated Verified Change roles;
3. persisted execution-scope evidence for stable historical validation; and
4. one fail-closed native-approval capability preflight that owns `native_attempt_required`.

Canonical changes propagate through the existing synchronization path. Generated surfaces remain derived output.

## 2. Ownership And Source Of Truth

| Concern | Canonical owner | Design responsibility |
|---|---|---|
| Lifecycle, modes and approval authority | `plugin/meta/agdf-runtime-contract.md` | Defines the single normative behavior and fail-closed boundaries. |
| Workflow guidance | `plugin/skills/gate-check/SKILL.md`; `plugin/skills/brownfield-analysis/SKILL.md`; `plugin/skills/release-or/SKILL.md` | References the Runtime Contract and uses the complete mode and gate-derived approval vocabulary. |
| Adapter capability declaration | `plugin/meta/agdf-plugin.definition.json` | Declares one enumerated value-transport and wait-safety vocabulary per surface. |
| Artefact-table parsing | `create-agdf/lib/control-state/run-state-parser.js` | Parses strict plain or complete-code-span path cells once. |
| Verified Change enforcement | `create-agdf/bin/create-agdf.js` | Derives permitted paths, validates role state and applies active versus completed lifecycle rules. |
| Native preflight and presentation | `create-agdf/lib/interaction-presentation.js` | Evaluates adapter capability and prevents unsafe invocation without changing approval authority. |
| Compact record schema | `plugin/control/templates/artefacts/VERIFIED_CHANGE.md` | Stores Brownfield selection, eligibility, execution snapshot and Mini-Closeout evidence. |
| Propagation | `create-agdf/scripts/sync-package-assets.js` | Synchronizes canonical runtime, skills, metadata and templates to generated surfaces. |

## 3. Strict Artefact Path Parsing

Add one exported artefact-path cell parser in `run-state-parser.js` with this result shape:

```text
raw: original trimmed cell
path: normalized repository-relative candidate or empty
format: plain | code_span | invalid
reason: none | empty | unmatched_delimiter | embedded_delimiter | invalid_path_text
```

Parsing rules:

- A plain cell contains no backtick and is preserved after outer whitespace trimming.
- A code-span cell contains exactly one opening and one closing backtick around the complete non-empty value; only that pair is removed.
- Any one-sided, embedded, repeated or partial delimiter form is `invalid`.
- Generic status/text cleanup must not be reused for path cells.
- Repository-relative safety checks remain a separate second stage and continue rejecting absolute paths, traversal, unsupported backslashes and paths outside the repository.

`parseControlState` stores the normalized `path` plus additive internal `path_format`, `path_reason` and `raw_path` evidence on each artefact entry. Consumers use only the normalized path and must surface an invalid-path finding rather than treating malformed formatting as a missing artefact.

## 4. Recognized Artefact Roles And Consolidation

Keep artefact categories distinct:

- user gates: existing `UR`, `PRD`, `SD`, `TP`, `QA`, `UAT` vocabulary;
- internal steps: existing Brownfield, implementation and review vocabulary;
- closeout artefacts: new explicit `OR` category.

Pass all three categories into `parseControlState`; do not classify `OR` as a user gate or implementation step.

Add one role-consistency analysis used by `doctor`, `gate-check` and `delivery-map`:

- the same normalized path may serve Brownfield Review, Verified Change and OR only when the selected mode is `verified_change`;
- Brownfield Review is `done` only when the record contains a complete Brownfield Selection section;
- the Verified Change row status must agree with the record status;
- OR may be `done` only when the record is `executed` and every required Mini-Closeout field is complete;
- premature, conflicting or unrelated cross-role aliases emit a revise/block finding and never satisfy a gate;
- separate Brownfield and OR files remain valid.

## 5. Run-Owned Control Path Derivation

Replace the static Verified Change control-path allowance with a derived set:

1. start with the selected `RUN_STATE.md`, `MASTER_BACKLOG.md` and the Verified Change record;
2. inspect normalized paths from recognized artefact rows in the selected run;
3. accept only paths beneath `.agdf/control/artefacts/<selected_run_id>/`;
4. reject invalid path formatting, another run's directory and unrecognized artefact roles; and
5. add only the surviving paths to the permitted control set.

This derivation does not allow every file in the run directory. Explicit linkage, recognized role and same-run containment are all mandatory.

## 6. Compact Record And Historical Evidence

Extend `VERIFIED_CHANGE.md` with a structured Brownfield Selection section and these machine-readable Record fields:

```text
baseline_commit: <full Git commit id>
execution_changed_paths: <comma-separated normalized paths>
execution_scope_status: pending | pass | fail
```

Eligibility requires a valid `baseline_commit`, both existing tracked/untracked baseline fields and the existing clean-candidate assertions. If a stable Git baseline cannot be captured, the record escalates.

Validation is lifecycle-specific:

- `draft` or `eligible` on an active run: compare the live worktree with the captured baseline and reject newly introduced unlisted paths;
- `executed` on an active run: require the calculated post-baseline changed-path set to equal `execution_changed_paths`, require at least one declared source/derived path and require `execution_scope_status: pass`;
- `executed` on a completed run: do not compare against the later live worktree; validate the persisted path set against declared source/derived paths and the derived permitted run-control set, and continue validating ownership, prohibited impacts, propagation and validation evidence;
- missing, unsafe, inconsistent or empty execution evidence fails closed even after completion.

The persisted snapshot is evidence, not a replacement source of truth. It cannot authorize paths that were not eligible at execution time.

## 7. Native Approval Capability Preflight

Replace the boolean value-transport declaration with one canonical enum:

```text
approvalValueTransport:
  exact_option_value | separate_label_and_value | decorated_label_only | unknown
waitSafety:
  deliberate_no_auto_resolution | unsafe | unknown
```

Legacy boolean metadata may be read only as `unknown` at a compatibility boundary; it can never promote an adapter to gate-safe. Canonical and generated definitions use only the enum vocabulary.

Add a pure capability preflight in `interaction-presentation.js`:

```text
eligible: boolean
native_attempt_required: boolean
preflight_outcome: eligible_for_invocation | unavailable_before_invocation | unsafe_to_wait
reason: exact_transport | separate_value_transport | decorated_only | unsafe_wait | capability_missing | capability_conflict
evidence_source: runtime | static | none
```

Precedence and behavior:

1. current runtime/tool-schema evidence outranks static metadata;
2. contradictory or unconfirmed current evidence fails closed;
3. a static declaration may be used only when no current runtime evidence is available and it explicitly proves both wait safety and an exact transport mode;
4. `interaction_kind` remains `gate_approval` for a ready user gate regardless of adapter availability;
5. `native_attempt_required` is true only when preflight returns eligible;
6. missing or unsafe capability yields `native_attempt_required: false`, preflight outcome `unavailable_before_invocation` or `unsafe_to_wait`, and exact-text fallback without invoking the adapter.

`executeNativeApprovalAttempt` must require the successful preflight result in addition to the existing orientation snapshot. The exact outcome validator remains unchanged; no decorated response is normalized into approval.

Report-only CLI evaluation has no verified current host adapter and therefore fails closed to `native_attempt_required: false`. An in-process surface adapter may supply current capability evidence without adding a new public CLI flag or approval path.

## 8. Workflow Alignment

- `gate-check` derives its primary option as `Approval: ${currentGate}` and never hard-codes `Approval: SD`.
- Brownfield and gate-check mode lists include `verified_change` wherever the Runtime Contract permits it.
- Release/OR guidance accepts the executed record's complete Mini-Closeout as compact OR evidence.
- The Runtime Contract remains the only transition model; skills contain procedure and references, not copied gate tables.

## 9. Validation Design

Extend focused suites rather than add a parallel harness:

- `control-state-test.js`: plain/code-span equivalence, unmatched delimiter rejection, `OR` recognition and invalid-path findings;
- `verified-change-test.js`: same-run derived control paths, cross-run rejection, role consistency, active scope escape, recorded execution-scope equality and completed historical stability;
- `interaction-presentation-test.js`: exact/separate/decorated/unknown transport, wait-safety, runtime-over-static precedence, capability conflict and no invocation when preflight fails;
- routing and runtime-integrity tests: complete mode vocabulary, gate-derived primary option, enum schema and canonical/generated synchronization;
- package smoke: contact-email reproduction, existing separate Brownfield/OR records and non-Verified modes remain valid.

Required validation includes:

```text
node plugin/scripts/check-runtime-integrity.mjs
node create-agdf/scripts/control-state-test.js
node create-agdf/scripts/verified-change-test.js
node create-agdf/scripts/interaction-presentation-test.js
node create-agdf/scripts/test-routing.js
npm --prefix create-agdf run smoke-test
node create-agdf/bin/create-agdf.js doctor --json --run verified-change-control-integrity
git diff --check
```

Negative fixtures must mutate canonical metadata, generated metadata, one-sided path formatting, role states and capability evidence independently.

## 10. Compatibility And Failure Boundaries

- Plain paths, complete code-spanned paths, separate Brownfield/OR artefacts and all non-Verified modes retain valid behavior.
- Existing exact-text approvals remain universal and authoritative.
- No new public command, gate, approval formula, delivery mode or product-specific static-content rule is introduced.
- Unknown metadata, malformed paths, incomplete execution snapshots and conflicting role states fail closed.
- Generated artefacts are synchronized from canonical owners and are never hand-maintained.
- The completed Pages contact-email product behavior remains untouched.

## 11. Implementation Boundary

Implementation is limited to the owners and focused tests named above. Updating `CG-DOCUMENTATION-CEREMONY-BOUNDARY` and `CG-NATIVE-INTERACTION-AUTHORITY` is required before clean closeout because the change refines both durable invariants.

## 12. Decision Required

Approve this Solution Design before the Task/Test Plan is drafted:

`Approval: SD`
