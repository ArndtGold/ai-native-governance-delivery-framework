# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-npm-package-payload-cleanup
- lifecycle: active
- revision: 3
- revision_id: 03ee638e-095a-4dd0-ab8f-27d7bd49a4ac
- content_seal: sha256:419cf700f5024e2ebda7c61b03e557ba7d0481d11f240d4adb4d806e54a0ce83
- approval_seal: sha256:1a12f3626da09769bb507d5e9b17ea96172d8ee951f7c05ca7c39d37db56a2ea
- updated_at: 2026-09-30T08:31:09.726Z
- started_at: 2026-08-30
- mode: `structured_delivery`
- current_gate: UR
- decision: `in_progress`
- owner: Arndt Gold

## Objective

Publish an explicit, runtime-complete `create-agdf` npm payload without generated submission,
review or temporary build artefacts that installed consumers do not need.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Recovery reset approvals without independent provenance; the ordinary approval sequence resumes. |
| What is approved? | Nothing yet. |
| What is missing? | Exact Approval: UR. |
| What is the next allowed action? | Fill the current UR control state, persist the UR draft, and request exact approval: Approval: UR. |
| What is explicitly forbidden right now? | create later-gate artefacts beyond the current allowed gate; run Brownfield Analysis as implementation preparation; implement code; claim QA or release readiness |

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
| UR | missing |  |
| PRD | missing |  |
| SD | missing |  |
| TP | missing |  |
| QA | missing |  |
| UAT | missing |  |

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
- next_allowed_action: Fill the current UR control state, persist the UR draft, and request exact approval: Approval: UR.
- quality_outlook: Keep one semantic publish inventory and prove each exclusion against every supported lifecycle.
