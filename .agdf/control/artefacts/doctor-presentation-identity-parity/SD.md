# SD: Doctor and Presentation Identity-Validation Parity

Status: approved
Gate: SD
Gate approval: revision 1 approved with exact `Approval: SD` on 2026-09-01 after same-run, same-gate and revision revalidation
Revision: 1
Based on: `.agdf/control/artefacts/doctor-presentation-identity-parity/PRD.md` (approved revision 1)
Date: 2026-09-01
Owner: agent

## 1. Solution Overview

1. A new small shared module `create-agdf/lib/control-state/run-identity.js` becomes the single code
   owner of the identity requirements: it exports `RUN_ID_PATTERN` (the existing canonical
   `/^[a-z0-9][a-z0-9._-]{0,127}$/`), `REVISION_ID_PATTERN` (the existing UUID check) and
   `validateRunIdentity({ runId, revisionId })` returning the existing finding codes
   `AGDF_RUN_ID_INVALID` / `AGDF_RUN_REVISION_ID_INVALID` (DIP-01).
2. `run-state-parser.js` consumes and re-exports `RUN_ID_PATTERN` from that module (import path
   compatibility for existing consumers) and replaces its inline checks with
   `validateRunIdentity`; behavior on the canonical path is unchanged.
3. `interaction-presentation.js` imports `RUN_ID_PATTERN` from the shared module and deletes its
   inline superset regex `/^[A-Za-z0-9._-]+$/`; the canonical pattern becomes authoritative for
   approval-snapshot eligibility (DIP-01).
4. `readRunState` (`control-evaluation/run-state.js`) applies `validateRunIdentity` to the selected
   content's Run Meta on the legacy/content path and attaches the result as `identity_findings` on
   the returned run state (DIP-02).
5. `evaluateDoctor` maps `identity_findings` to doctor findings with severity `revise` and
   `next_step` naming `run-migrate` as the deterministic repair (DIP-03).
6. `interaction-presentation.js` exports two small precondition validators following the existing
   `validateApprovalOrientationSnapshot` result shape `{ valid, errors }`:
   `validateOperationalStatusCardPreconditions(statusCard, { registry })` and
   `validateApprovalOrientationPreconditions({ statusCard, registry, requestedLocale })`. They cover
   exactly the conditions under which `renderOperationalStatusCard` / `buildApprovalOrientationSnapshot`
   currently return silent `null` before snapshot validation ever runs (missing `run_id`, invalid
   `run_id`, missing `current_gate`, unresolved locale, non-open status, missing-approval mismatch,
   user-action semantics) (DIP-04).
7. `gate-check` populates one additive JSON object `presentation_diagnostics`, present only when
   non-empty:
   - `status_presentation_errors`: precondition codes when `status_presentation` is `null`;
   - `approval_presentation_errors`: populated only when the gate was `ready` for approval —
     precondition codes when the snapshot was never built, otherwise the concrete `errors` array
     from `validateApprovalOrientationSnapshot`.
   The visible fallback uses the existing locale key `interaction.presentationFailure` with the
   error codes appended. A not-ready status interaction (expected `approval_presentation: null`)
   produces no diagnostics noise (DIP-04).
8. Renderer signatures, card layout, locale-registry schema, gate order, approval values and
   `schema_version` remain unchanged; JSON changes are additive (DIP-07).
9. Generated runtime mirrors update only via `sync-plugin-runtime.js` (DIP-07).

## 2. Ownership And Source Of Truth

| Concern | Canonical owner | Design use |
|---|---|---|
| `run_id` pattern, `revision_id` requirement | `create-agdf/lib/control-state/run-identity.js` (new) | Single definition; parser and presentation import it; no second regex anywhere |
| Canonical-path meta validation | `create-agdf/lib/control-state/run-state-parser.js` | Delegates to `validateRunIdentity`; codes and behavior unchanged |
| Legacy/content-path validation | `create-agdf/lib/control-evaluation/run-state.js#readRunState` | Attaches `identity_findings` from the shared validator |
| Doctor severity and repair step | `create-agdf/lib/control-evaluation/doctor.js` | Maps `identity_findings` to `revise` findings with `run-migrate` next step |
| Presentation preconditions and snapshot validation | `create-agdf/lib/interaction-presentation.js` | Exports precondition validators; keeps fail-closed rendering |
| Report diagnostics | `create-agdf/lib/control-evaluation/gate-check.js` | Owns `presentation_diagnostics` population and fallback copy selection |
| Localized fallback copy | locale registry key `interaction.presentationFailure` | Reused; no new locale keys |
| Generated mirrors | `create-agdf/scripts/sync-plugin-runtime.js` | Sole propagation path |

## 3. Architecture Decisions

1. **Shared module instead of cross-import.** The presentation layer must not import the full
   run-state parser (parsing concerns, larger surface); a dedicated `run-identity.js` keeps the
   dependency direction clean (both sides depend on one leaf module) and eliminates cyclic risk.
   The parser side remains the semantic owner as required by the PRD.
2. **Stricter presentation pattern is accepted.** Retiring the ad-hoc superset means run_ids with
   uppercase letters no longer render approval snapshots. This is the approved parity direction:
   such run_ids already fail the canonical parser and now also fail doctor with a named finding
   and repair step, so the state is diagnosable end to end.
3. **Precondition validators instead of renderer return-shape change.** `buildApprovalOrientationSnapshot`
   returns `null` before `validateApprovalOrientationSnapshot` can run; a caller-side validate-only
   approach therefore cannot name the reason. Exported precondition checks close that hole without
   breaking the frozen render-result contract or the existing test suite.
4. **Diagnostics only where a card was expected.** `approval_presentation: null` is the correct,
   expected result for every non-ready interaction; emitting errors there would train consumers to
   ignore the field. Diagnostics populate only for ready gates and for status-card failures.
5. **Severity `revise`, not `block`.** Consistent with the existing repairable-content vocabulary
   (`AGDF_CURRENT_GATE_MISSING` etc.); the finding names the deterministic repair. `block` remains
   reserved for structurally invalid canonical records (existing behavior).
6. **Sibling renderers are out of scope.** `renderTaskTargetOrientation` and
   `renderScopeClassificationCard` would each need their own precondition catalogue (different input
   contracts, no shared snapshot validator), which is additional design beyond the mechanism built
   here. Recorded as exclusion per DIP-05/AC-10; their silent-`null` behavior is unchanged in this
   run.

## 4. Integration Points

| Caller | Change |
|---|---|
| `gate-check.js:298` (`renderOperationalStatusCard`) | On `null`, call `validateOperationalStatusCardPreconditions`; feed `presentation_diagnostics.status_presentation_errors` |
| `gate-check.js:303-343` (`attachApprovalOrientationSnapshot` / `renderApprovalOrientationSnapshot`) | When `ready` and result `null`: precondition codes if snapshot missing, else `validateApprovalOrientationSnapshot(...).errors`; feed `presentation_diagnostics.approval_presentation_errors` |
| `doctor.js` selected-run block | Append mapped `identity_findings` after the existing placeholder checks |
| `run-state-parser.js:28-38` | Replace inline pattern tests with `validateRunIdentity`; re-export `RUN_ID_PATTERN` |
| `interaction-presentation.js:552` | Replace inline regex with imported `RUN_ID_PATTERN` |
| CLI human rendering of gate-check | Print `interaction.presentationFailure` plus codes when diagnostics are present |

## 5. Constraints And Compatibility

- All JSON changes are additive: new optional `presentation_diagnostics` object; no field removed or
  renamed; `schema_version` stays `1`.
- Healthy states render byte-identically (AC-06); existing snapshot tests act as the regression
  oracle.
- Existing consumers of `RUN_ID_PATTERN` from `run-state-parser.js` keep working via re-export.
- No locale registry schema change; `interaction.presentationFailure` exists in every locale pack
  (enforced by `validateLocaleRegistry` completeness).
- No changes to gate order, approval values, control-state schema or generated files by hand.

## 6. Test And Evidence Strategy

1. `run-identity` unit cases: valid, uppercase, leading dot, overlong `run_id`; missing, empty,
   non-UUID `revision_id` (via existing `test:control-state` owner).
2. Legacy/content-path doctor cases: a state with invalid `run_id` and a state without `revision_id`
   each yield the corresponding `revise` finding with `run-migrate` next step; doctor status is at
   least `revise` (AC-01, AC-02).
3. Gate-check diagnostics cases: ready gate with missing `revision_id` produces
   `approval_presentation_errors` containing `revision_identity`; invalid `run_id` produces the
   precondition code; not-ready status interaction produces no `presentation_diagnostics` (AC-04).
4. Status-card precondition case for `renderOperationalStatusCard` unavailability (AC-05).
5. Structural single-owner test: `interaction-presentation.js` source contains no own `run_id`
   character-class regex and imports from `run-identity.js` (AC-03).
6. Unchanged-output proof: existing envelope and card snapshot tests pass unmodified (AC-06, AC-07).
7. Sync determinism: fresh `sync-plugin-runtime.js` run yields no diff beyond the intended files;
   `git diff --check` clean (AC-08).

## 7. Risks And Open Questions

| Risk | Impact | Mitigation |
|---|---|---|
| Legacy states with now-invalid identities newly report `revise` | medium, intended | Finding names `run-migrate`; release notes in OR |
| Precondition catalogue drifts from render logic | medium | Precondition validators are called by the renderers' own guards where feasible, and the diagnostics tests assert code-for-code parity with the silent-`null` conditions |
| Consumers treat absent `presentation_diagnostics` as an error | low | Field documented as present-only-when-non-empty; additive |

Open (TP-level, non-blocking): exact placement of the human-readable fallback line in the CLI text
renderer output.

## 8. Next Step

Review this Solution Design and approve only with:

`Approval: SD`
