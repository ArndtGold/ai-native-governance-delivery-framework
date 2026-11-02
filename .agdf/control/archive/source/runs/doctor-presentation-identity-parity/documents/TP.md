# TP: Doctor and Presentation Identity-Validation Parity

Status: approved
Gate: TP
Revision: 1
Gate approval: revision 1 approved with exact `Approval: TP` on 2026-09-01 after same-run, same-gate and revision revalidation
Based on: `.agdf/control/artefacts/doctor-presentation-identity-parity/SD.md` (approved revision 1)
Date: 2026-09-01
Owner: agent

## 1. Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| DIP-T1 | Run pre-implementation Brownfield Analysis: revalidate the exact candidate files, current inline-regex sites, renderer consumer inventory, clean baseline and the sync owner before any edit | AC-03, AC-08 | Brownfield Analysis with pass/revise/block decision and exact allowed paths |
| DIP-T2 | Create `create-agdf/lib/control-state/run-identity.js` exporting `RUN_ID_PATTERN`, `REVISION_ID_PATTERN` and `validateRunIdentity({ runId, revisionId })` returning the existing codes `AGDF_RUN_ID_INVALID` / `AGDF_RUN_REVISION_ID_INVALID`; add unit cases (valid, uppercase, leading dot, overlong run_id; missing, empty, non-UUID revision_id) | AC-03, AC-09 | New module plus passing `test:control-state` unit assertions |
| DIP-T3 | Make `run-state-parser.js` consume `validateRunIdentity` and re-export `RUN_ID_PATTERN`; prove canonical-path behavior and finding codes are unchanged | AC-03, AC-06, AC-07 | Focused diff and unchanged existing parser test results |
| DIP-T4 | Replace the inline `run_id` regex in `interaction-presentation.js` with the imported `RUN_ID_PATTERN`; add exported `validateOperationalStatusCardPreconditions` and `validateApprovalOrientationPreconditions` covering exactly the silent-`null` conditions, without changing renderer signatures or frozen result shapes | AC-03, AC-05, AC-06 | Focused diff, new exported validators, unchanged snapshot tests |
| DIP-T5 | Attach `identity_findings` in `readRunState` on the legacy/content path and map them in `evaluateDoctor` to severity `revise` findings with a `run-migrate` repair `next_step` | AC-01, AC-02 | Doctor JSON for defective fixture states showing both findings |
| DIP-T6 | Populate additive `presentation_diagnostics` in `gate-check`: status-card precondition errors on `null` status presentation; approval errors only when the gate was ready (precondition codes if the snapshot was never built, otherwise `validateApprovalOrientationSnapshot(...).errors`); render the localized `interaction.presentationFailure` fallback line with codes in the human CLI output | AC-04, AC-09 | Gate-check JSON and CLI output for defective and healthy fixtures |
| DIP-T7 | Add the parity test set: legacy state with invalid `run_id`, legacy state without `revision_id` (doctor `revise` + diagnosed card loss instead of silence), no-diagnostics assertion for a not-ready status interaction, and the structural single-owner test proving `interaction-presentation.js` holds no own `run_id` character-class regex | AC-01 - AC-04, AC-06 | New passing test cases in the existing suites |
| DIP-T8 | Regenerate mirrors via `sync-plugin-runtime.js` and run the full regression set (`test:control-state`, `test:interaction-presentation`, `test:lifecycle`, `test:cli-modularization`, Runtime Integrity, aggregate smoke); verify `git diff --check` and no hand-edited generated file | AC-07, AC-08, AC-09 | Passing command outputs and changed-path evidence |
| DIP-T9 | Complete Task Plan Review, Clean Implementation Review, Code Review and QA, resolving every blocking finding; record the sibling-renderer exclusion decision visibly | AC-10 and all | Durable review and QA reports with evidence mappings |

## 2. Test Plan

### Repository implementation checks

1. `npm --prefix create-agdf run test:control-state`
   - `run-identity` unit matrix (valid/invalid `run_id`, valid/missing/non-UUID `revision_id`);
   - canonical-path parser behavior unchanged (same codes, same verdicts);
   - legacy/content-path doctor findings for both identity defects with `revise` severity and
     `run-migrate` next step.
2. `npm --prefix create-agdf run test:interaction-presentation`
   - existing snapshot and negative cases pass unmodified (healthy states byte-identical);
   - new precondition-validator cases mirror every silent-`null` condition code-for-code;
   - structural single-owner assertion (no second `run_id` regex; import from `run-identity.js`).
3. `npm --prefix create-agdf run test:lifecycle` and `npm --prefix create-agdf run test:cli-modularization`
   - gate-check JSON contains `presentation_diagnostics` only when non-empty;
   - ready-gate defective fixture shows `approval_presentation_errors` (including the
     `revision_identity` case); not-ready status interaction shows no diagnostics;
   - human CLI output renders the localized `interaction.presentationFailure` line with codes.
4. `node plugin/scripts/check-runtime-integrity.mjs`
   - runtime contracts and generated-manifest integrity preserved.
5. `npm --prefix create-agdf run smoke-test`
   - aggregate regression without weakened assertions.
6. `git diff --check`
   - no whitespace or conflict-marker defects; changed paths match the declared scope.

### Negative controls

- A healthy canonical run renders `status_presentation` and (when ready) `approval_presentation`
  with no `presentation_diagnostics` key present.
- A tampered fixture with an unknown error code must not crash the CLI fallback rendering.

## 3. Brownfield Scope

Allowed implementation paths:

- `create-agdf/lib/control-state/run-identity.js` (new)
- `create-agdf/lib/control-state/run-state-parser.js`
- `create-agdf/lib/control-evaluation/run-state.js`
- `create-agdf/lib/control-evaluation/doctor.js`
- `create-agdf/lib/control-evaluation/gate-check.js`
- `create-agdf/lib/interaction-presentation.js`
- `create-agdf/lib/cli/**` only where the human gate-check rendering prints the fallback line
- test scripts under `create-agdf/scripts/` owned by the suites named in the Test Plan
- `create-agdf/generated/**` exclusively via `sync-plugin-runtime.js`

## 4. Out Of Scope

- `renderTaskTargetOrientation` and `renderScopeClassificationCard` (recorded exclusion per SD §3.6)
- locale registry schema or copy changes beyond consuming the existing `presentationFailure` key
- run-state schema, gate order, approval values, `schema_version`
- migration or rewriting of existing legacy run states
- commit, push, PR, release, publication, installed-host mutation

## 5. Risks And Blockers

| Risk | Impact | Handling |
|---|---|---|
| Precondition catalogue diverges from renderer guards over time | medium | DIP-T7 parity tests assert code-for-code coverage of every silent-`null` condition |
| Existing fixtures use uppercase or ad-hoc run_ids that newly fail | medium | DIP-T1 inventories fixtures before edits; fixture repair stays inside allowed paths |
| CLI fallback line placement conflicts with envelope rendering | low | Open TP-level placement decision resolved in DIP-T6 with snapshot evidence |

## 6. Next Step

Review this Task/Test Plan and approve only with:

`Approval: TP`
