# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-npm-package-payload-cleanup
- lifecycle: active
- revision: 2
- revision_id: EB46B69A-B780-4F5F-AB9C-EC91D7222749
- started_at: 2026-08-30
- mode: `structured_delivery`
- current_gate: `PRD`
- decision: `in_progress`
- owner: Arndt Gold

## Objective

Publish an explicit, runtime-complete `create-agdf` npm payload without generated submission,
review or temporary build artefacts that installed consumers do not need.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Existing package, generator, submission, installer, validator and test owners are mapped. Submission generation is a maintainer concern; the public tarball is a four-host compatibility and release contract. |
| What is approved? | UR revision 1 was approved with exact `Approval: UR` on 2026-08-30. Brownfield Review passed and selected `structured_delivery`. |
| What is missing? | Review of PRD revision 1 and exact `Approval: PRD`. |
| What is the next allowed action? | Review or refine the PRD and request the exact PRD approval. |
| What is explicitly forbidden right now? | Solution Design, Task Plan, package implementation, test-contract changes, QA, release and VCS actions. |

## Source And Scope State

- normative_instruction_source: `plugin/meta/agdf-agent-router.md` and its focused Runtime Contract modules
- multi_scope_state: `clear`
- active_scope_evidence: Approved UR revision 1, completed Brownfield Review and draft PRD revision 1 define the package-boundary scope.
- competing_scope_lines: `agdf-copilot-plugin-integration` remains independently at QA and is not reopened; existing public-distribution and release runs retain their own authority.
- branch_workspace_evidence: Branch `main` at baseline `483855231efdf24a1b841c83f00311fefc9acaf4`; pre-existing changes for `delivery-path-search-control-input-integrity` and existing Context Graph/backlog edits are unrelated and excluded.
- branch_workspace_scope_effect: `supports`

## Run Status Card

This is a compact projection of the control state. It does not replace gate-check, QA, OR or approvals.

| Run status | Value |
|---|---|
| Status | open |
| Current gate | PRD |
| Allowed now | Review or refine PRD revision 1. |
| Blocked by | Exact PRD approval is missing. |
| Missing approval | `Approval: PRD` |
| Next step | Review the PRD and provide the exact approval, request revision or decline. |
| Quality outlook | Preserve one semantic publish inventory and make every retained or excluded path evidence-backed. |

## Approvals

Valid approval format for new runs: `Approval: <GateName>`.

| Gate | Status | Evidence |
|---|---|---|
| UR | `approved` | `Approval: UR` recorded 2026-08-30 for revision 1 |
| PRD | `missing` | none |
| SD | `missing` | none |
| TP | `missing` | none |
| QA | `missing` | none |
| UAT | `missing` | none |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-npm-package-payload-cleanup/UR.md` | `approved` | Revision 1 approved 2026-08-30. |
| PRD | `.agdf/control/artefacts/agdf-npm-package-payload-cleanup/PRD.md` | `draft` | Revision 1; approval open. |
| SD |  | `not_applicable` | Not allowed. |
| TP |  | `not_applicable` | Not allowed. |
| Brownfield Review | `.agdf/control/artefacts/agdf-npm-package-payload-cleanup/BROWNFIELD_REVIEW.md` | `done` | Existing owners mapped; Structured Delivery selected. |
| Verified Change |  | `missing` | No mode decision exists. |
| Brownfield Analysis |  | `missing` | Not allowed. |
| CD+Tests |  | `missing` | Not allowed. |
| CR |  | `missing` | Not allowed. |
| QA |  | `missing` | Not allowed. |
| OR |  | `missing` | Not allowed. |

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `PRD`
- scope_reason: `external_contract_depth`; the public npm path contract and four supported host payloads must change and validate together, so a local Structured Slice would leave external consumers and release rollback unproven.
- evidence: `.agdf/control/artefacts/agdf-npm-package-payload-cleanup/BROWNFIELD_REVIEW.md`
- transparency_note: UI/UX intent work is not applicable; full depth is driven by public package compatibility and release/cross-host impact, not file count.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | `approved_by` | `Approval: UR` | exact approval recorded for revision 1 on 2026-08-30 |
| PRD | `derived_from` | UR | draft revision 1 derived from approved UR and completed Brownfield Review |
| SD | `derived_from` | PRD | not allowed |
| TP | `derived_from` | SD | not allowed |
| QA_REPORT | `tests` | TP | not allowed |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| npm pack dry-run for 0.14.2 | `npm pack --dry-run --json --ignore-scripts` in `create-agdf` | 373 files; 378,854 packed bytes; 2,399,718 unpacked bytes | `direct` |
| Generated submission inventory | `create-agdf/generated/submissions/openai/agdf/**`; `create-agdf/generated/plugins/agdf/submission/openai/**` | 51 obvious non-runtime files and 261,008 unpacked bytes | `direct` |
| Current broad publish owner | `create-agdf/package.json` | Whole `generated` directory is included by the package allowlist | `direct` |
| Current package contract owner | `create-agdf/scripts/package-contents-test.js` | Required-file assertions currently include submission material | `direct` |
| Runtime payload owners | `create-agdf/scripts/sync-plugin-runtime.js`; generated host profiles | Offline validator, diagnostics and supported host installation payloads | `direct` |
| Brownfield Review | `.agdf/control/artefacts/agdf-npm-package-payload-cleanup/BROWNFIELD_REVIEW.md` | Existing coverage, reuse path, public contract impact and Structured Depth decision | `direct` |
| Draft PRD revision 1 | `.agdf/control/artefacts/agdf-npm-package-payload-cleanup/PRD.md` | Semantic package inventory requirements and acceptance evidence | `direct` |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Final file-level consumer map for non-submission metadata | `warn` | Resolve in Solution Design before any exclusion beyond the proven submission classes. |
| Clean-client completeness after exclusions | `warn` | Define deterministic installation and runtime probes in the Task/Test Plan. |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| A runtime-required file is classified as development-only. | `warn` | Require consumer and lifecycle evidence before exclusion; later execution must stop if that evidence is absent. |
| Package cleanup creates a second hand-maintained inventory. | `warn` | Reuse one semantic generated profile or deterministic allowlist owner. |
| Local submission generation is accidentally removed. | `warn` | Separate generation from publication; preserve canonical and generated review sources. |
| Size reduction is optimized at the expense of supported-host completeness. | `warn` | Treat runtime completeness as the invariant and size only as measured evidence; later execution must stop on any completeness regression. |
| The Copilot QA scope is silently expanded or invalidated. | `warn` | Keep the runs independent and retest package coexistence later without rewriting Copilot approvals. |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-PUBLIC-PLUGIN-DISTRIBUTION`; `CG-CROSS-HOST-RUNTIME-INTEGRITY`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: Existing nodes own public distribution and runtime completeness; Brownfield Review must decide whether package-boundary knowledge justifies an update or new node.

## Knowledge Persistence Decision

- memory_target: `scope_artifact`
- memory_reason: The cleanup intent and current measurements are run-specific until Brownfield Review identifies a reusable package invariant.
- memory_refs: `.agdf/control/artefacts/agdf-npm-package-payload-cleanup/UR.md`

## Closeout

- delivered: Approved UR revision 1, completed Brownfield Review with Structured Delivery selection and draft PRD revision 1.
- not_delivered: Solution Design, Task Plan, package changes, test changes, QA, UAT, release and VCS actions.
- verification_performed: Exact same-run/gate/revision revalidation; package, generator, public-candidate, installer, runtime and test owner inspection; measured npm dry-run inventory; Structured Depth evaluation.
- unverified: Final non-submission metadata classification, selected technical publish mechanism, clean-client completeness and resulting package size.
- next_allowed_action: Review PRD revision 1 and provide exact `Approval: PRD`, request revision or decline.
- quality_outlook: Keep one semantic publish inventory and prove each exclusion against every supported lifecycle.
