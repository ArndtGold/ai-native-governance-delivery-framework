# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: approval-orientation-internal-step-integrity
- lifecycle: completed
- revision: 4
- revision_id: C844B05C-3C8A-43CF-804B-42BD3F27A4F8
- started_at: 2026-08-21
- mode: `quick_task`
- current_gate: `OR`
- decision: `pass`
- owner: Arndt Gold

## Objective

Correct approval orientation so internal post-approval steps remain distinct from future user
decisions, without changing gate authority, approval formulas, schemas or persistence semantics.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Approval orientation now preserves immediate internal steps while deriving user-decision narration from canonical user-action semantics; contradictory inputs fail closed. |
| What is approved? | UR Revision 1 through exact `Approval: UR` on 2026-08-21 after same-run, same-gate, revision and durable-artefact revalidation. |
| What is missing? | Nothing in the approved repository-fix scope; installed-cache and authenticated-host behaviour remain explicit non-claims. |
| What is the next allowed action? | Use delivery closeout only after an explicit VCS handoff request; handle reinstall, release or live-host verification as separate lifecycle work. |
| What is explicitly forbidden right now? | Automatic commit, push, PR, reinstall, release or live-host claims. |

## Source And Scope State

- primary_target: canonical approval-orientation projection and validation
- governance_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- evidence_sources: current UR/TP approval snapshots, interaction contract, gate-transition contract,
  `gate-check.js`, `interaction-presentation.js`, locale registry and existing tests
- working_directory: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- scope_stability: clear; concrete symptom, expected behaviour, fix boundary and evidence plan are recorded
- competing_scope_lines: `codex-harness-conformance-slice` remains independent and unapproved
- excluded_mutation_targets: Harness conformance artefacts, unrelated active runs,
  `.github/workflows/publish-create-agdf.yml`, VCS, release, reinstall and live-host state
- branch_workspace_evidence: branch `main` at baseline
  `23fef180a4d8aa540270b566f6eb2a99a7e54194`; pre-existing Harness control-state changes and
  untracked publish workflow remain unrelated

## Run Status Card

This is a compact projection of the control state. It does not replace gate-check, QA, OR or approvals.

| Run status | Value |
|---|---|
| Status | completed |
| Current gate | OR |
| Allowed now | Read-only review or explicitly requested delivery closeout. |
| Blocked by | none |
| Missing approval | none |
| Next step | None for the repository fix; VCS and distribution actions remain separate and explicit. |
| Quality outlook | Repository fix, focused regressions, full smoke, Code Review and OR-lite pass; live-host effect is unclaimed. |

## Approvals

Valid approval format for new runs: `Approval: <GateName>`.

| Gate | Status | Evidence |
|---|---|---|
| UR | `approved` | Exact `Approval: UR` on 2026-08-21 after same-run, same-gate, Revision-1 and durable-artefact revalidation. |
| PRD | `not_applicable` | Brownfield Review selected `quick_task`. |
| SD | `not_applicable` | Brownfield Review selected `quick_task`. |
| TP | `not_applicable` | Brownfield Review selected `quick_task`. |
| QA | `not_applicable` | Quick Task; regression evidence, mandatory Code Review and OR-lite remain required. |
| UAT | `not_applicable` | Quick Task without a separate UAT surface. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/approval-orientation-internal-step-integrity/UR.md` | `approved` | Revision 1; exact approval persisted after revalidation. |
| Brownfield Review | `.agdf/control/artefacts/approval-orientation-internal-step-integrity/BROWNFIELD_REVIEW.md` | `done` | Pass; `quick_task` under the Narrow Code-Fix Criterion. |
| PRD |  | `not_applicable` | Path not yet selected. |
| SD |  | `not_applicable` | Path not yet selected. |
| TP |  | `not_applicable` | Path not yet selected. |
| CD+Tests | `.agdf/control/artefacts/approval-orientation-internal-step-integrity/CD_TESTS.md` | `done` | AOI-1 through AOI-6 pass; focused and aggregate tests green. |
| CR | `.agdf/control/artefacts/approval-orientation-internal-step-integrity/CODE_REVIEW.md` | `done` | Pass; no open findings. |
| QA |  | `not_applicable` | Quick Task; no separate QA gate. |
| OR | `.agdf/control/artefacts/approval-orientation-internal-step-integrity/OR.md` | `done` | OR-lite pass; repository scope complete. |

## Mode/Slice Decision

- decision: `quick_task`
- required_next_gate: `none`
- scope_reason: Existing semantics and owners are unambiguous; the production correction is confined
  to the approval-orientation builder and necessarily coupled validator in one file, with no schema,
  contract, locale, architecture, policy, persistence or release expansion.
- evidence: `.agdf/control/artefacts/approval-orientation-internal-step-integrity/BROWNFIELD_REVIEW.md`

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| Reproduction | exposes | UR | Internal Brownfield step is mislabeled as the next user decision. |
| UR | `approved_by` | `Approval: UR` | exact approval on 2026-08-21 after Revision-1 revalidation |
| Brownfield Review | sizes | Mode/Slice Decision | `quick_task`; existing owners, fix boundary and deterministic tests are clear |
| CD+Tests | implements_and_tests | UR | AOI-1 through AOI-6 pass; full smoke and focused suites green |
| Code Review | reviews | CD+Tests | pass; no open findings |
| OR | closes | Quick Task | OR-lite pass; no automatic delivery action |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Canonical transition fields | `create-agdf/lib/control-evaluation/gate-check.js` | UR/TP internal step, `next_user_gate: none`, `user_action_required: no` | `direct` |
| Faulty renderer derivation | `create-agdf/lib/interaction-presentation.js` | user-decision copy derived from immediate process step | `direct` |
| Same-bug validator derivation | `create-agdf/lib/interaction-presentation.js` | validator reconstructs and accepts the same faulty sentence | `direct` |
| Interaction contract | `plugin/meta/contracts/interaction.md` | internal steps require no-user-action narration | `direct` |
| Locale registry | `plugin/meta/agdf-interaction-locales.json` | existing localized no-action and next-decision copy | `direct` |
| Existing regression gap | `create-agdf/scripts/interaction-presentation-test.js`; `create-agdf/scripts/smoke-test.js` | structure covered, transition semantics not asserted | `direct` |
| Implementation diff | `create-agdf/lib/interaction-presentation.js` | canonical user-action derivation and fail-closed consistency | `direct` |
| Focused regressions | `npm --prefix create-agdf run test:interaction-presentation`; `test:control-state` | EN/DE internal and user-gate narration plus control-state compatibility | `direct` |
| Aggregate regression | `npm --prefix create-agdf run smoke-test` | full package, Runtime Integrity, conformance, eval and routing coverage | `direct` |
| Code Review | `.agdf/control/artefacts/approval-orientation-internal-step-integrity/CODE_REVIEW.md` | correctness, regression, security and maintainability | `direct` |

## Missing Evidence

- None in the approved repository-fix scope.
- Installed-package and authenticated-host behaviour were intentionally not required and remain
  explicit non-claims.

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Installed caches do not yet contain this workspace fix. | `warn` | Reinstall only through separately requested lifecycle work; do not infer live-host effect. |
| Future transition producers could omit explicit user-action fields. | `warn` | Builder fails closed; retain focused regression coverage. |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-RUN-STATUS-CARD`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: The defect sits within existing interaction and status-projection owners;
  no new authority node is proposed.

## Knowledge Persistence Decision

- memory_target: `scope_artifact`
- memory_reason: Root cause and fix boundary are specific to this corrective run until verified.
- memory_refs: `.agdf/control/artefacts/approval-orientation-internal-step-integrity/UR.md`

## Closeout

- delivered: Approved UR, Brownfield Review, `quick_task` implementation, AOI-1 through AOI-6,
  focused and aggregate regressions, Code Review pass and OR-lite.
- intentionally_not_delivered: Harness-scope changes, schema/contract/locale changes, VCS, release,
  reinstall and authenticated-host evidence.
- verification_performed: Focused interaction and control-state tests, repository approval-envelope
  observation, full package smoke, Runtime Integrity, 66/66 deterministic skill evals, routing render,
  diff check and Code Review.
- unverified: Installed-plugin-cache and authenticated-host behaviour.
- next_allowed_action: Use delivery closeout only after an explicit VCS handoff request; otherwise none.
- quality_outlook: Repository fix is cleanly closed and regression-protected; distribution and live-host effect remain separate.
