# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: cross-surface-plugin-opt-out
- lifecycle: active
- revision: 9
- revision_id: E661CAC5-0660-4036-8246-3E36898489C8
- mode: `structured_delivery`
- current_gate: `QA`
- decision: `revise`
- owner: Arndt Gold

## Objective

Make plugin deactivation and removal explicit, safe and verifiable across supported AGDF surfaces,
including a repository-local GitHub Copilot opt-out and an honest independent-instructions boundary.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Personal and shared Copilot repository opt-out are implemented through one safe settings/lifecycle path. Focused, package and broad component evidence pass; the combined aggregate remains blocked by named foreign release and gate-validation fixtures. |
| What is approved? | UR revision 2 plus PRD, SD and TP revision 1 are approved after same-run, same-gate and revision revalidation. |
| What is missing? | One clean full smoke and skill-evaluation pass after the foreign baseline is reconciled. |
| What is the next allowed action? | Resolve the release/gate-validation baseline in its owning run, then rerun full smoke and skill evaluations for this run. |
| What is explicitly forbidden right now? | `Approval: QA` request, UAT, release claims and automatic VCS actions while QA is `revise`. |

## Source And Scope State

- normative_instruction_source: `plugin/meta/agdf-agent-router.md` and focused Runtime Contract modules
- multi_scope_state: `clear`
- active_scope_evidence: Current user request plus deliberate selection of both Copilot modes with personal-local as default; `.agdf/control/artefacts/cross-surface-plugin-opt-out/UR.md` revision 2
- competing_scope_lines: `agdf-copilot-plugin-integration` is already awaiting UAT for its approved plugin-only installation scope and does not authorize this later lifecycle extension; other active release and host-evidence runs remain independent.
- branch_workspace_evidence: Existing release-profile changes and untracked image assets predate this run and are excluded from its scope.
- branch_workspace_scope_effect: `supports`

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | `approved` | Exact `Approval: UR` accepted for revision 2 on 2026-09-01 after same-run, same-gate and revision revalidation. |
| PRD | `approved` | Exact `Approval: PRD` accepted for revision 1 on 2026-09-02 after same-run, same-gate and revision revalidation. |
| SD | `approved` | Exact `Approval: SD` accepted for revision 1 on 2026-09-02 after same-run, same-gate and revision revalidation. |
| TP | `approved` | Exact `Approval: TP` accepted for revision 1 on 2026-09-02 after same-run, same-gate and revision revalidation. |
| QA | `missing` | Not allowed before implementation and mandatory reviews. |
| UAT | `missing` | Not allowed before QA pass and approval. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/cross-surface-plugin-opt-out/UR.md` | `approved` | Revision 2 records the approved two-mode outcome. |
| Brownfield Review | `.agdf/control/artefacts/cross-surface-plugin-opt-out/BROWNFIELD_REVIEW.md` | `done` | Existing owners mapped; Structured Delivery selected for the public CLI and external host contract. |
| Verified Change |  | `missing` | No Mode/Slice Decision exists. |
| PRD | `.agdf/control/artefacts/cross-surface-plugin-opt-out/PRD.md` | `approved` | Revision 1 defines the public lifecycle behavior, both Copilot modes and the four-surface support matrix. |
| SD | `.agdf/control/artefacts/cross-surface-plugin-opt-out/SD.md` | `approved` | Revision 1 defines CLI compatibility, target paths, ignore safety, strict JSON, atomic settings ownership and evidence boundaries. |
| TP | `.agdf/control/artefacts/cross-surface-plugin-opt-out/TP.md` | `approved` | Revision 1 maps 12 bounded tasks to 15 evidence checks and mandatory reviews. |
| Brownfield Analysis | `.agdf/control/artefacts/cross-surface-plugin-opt-out/BROWNFIELD_ANALYSIS.md` | `done` | Revision 1 passes with clean candidate paths, existing-owner reuse and isolated parallel scope. |
| CD+Tests | `.agdf/control/artefacts/cross-surface-plugin-opt-out/CD_TESTS.md` | `done_with_open_evidence_gap` | Approved implementation and focused evidence pass; aggregate foreign-baseline failures are recorded. |
| TP Review | `.agdf/control/artefacts/cross-surface-plugin-opt-out/TASK_PLAN_REVIEW.md` | `revise` | 11/12 tasks fully done; `CSO-T11` remains partial. |
| Clean Review | `.agdf/control/artefacts/cross-surface-plugin-opt-out/CLEAN_IMPLEMENTATION_REVIEW.md` | `pass` | One primary settings/lifecycle solution without fallback or parallel owner. |
| CR | `.agdf/control/artefacts/cross-surface-plugin-opt-out/CODE_REVIEW.md` | `pass` | No scoped code finding remains. |
| QA | `.agdf/control/artefacts/cross-surface-plugin-opt-out/QA_REPORT.md` | `revise` | Open aggregate evidence gap prevents QA pass and approval request. |

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `PRD`
- scope_reason: `external_contract_depth`; public CLI behavior and externally consumed personal/shared Copilot settings must change coherently with cross-surface documentation and tests.
- evidence: `.agdf/control/artefacts/cross-surface-plugin-opt-out/BROWNFIELD_REVIEW.md` revision 1; `.agdf/control/artefacts/cross-surface-plugin-opt-out/UR.md` revision 2
- transparency_note: Compact paths are ineligible because the approved outcome changes public CLI semantics; bounded existing owners still define the clean implementation path.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR revision 1 | `defines` | cross-surface plugin opt-out scope | Current user request plus repository and official Copilot documentation inspection |
| UR revision 1 | `approved_by` | `Approval: UR` | Exact approval accepted on 2026-09-01 after same-run, same-gate and revision revalidation |
| Brownfield Review revision 1 | `finds_requirements_gap_in` | UR revision 1 | Personal-local versus shared behavior was not represented in the approved revision. |
| UR revision 2 | `revises` | UR revision 1 | Adds personal-local default and explicit shared mode after deliberate user clarification. |
| UR revision 2 | `approved_by` | `Approval: UR` | Exact approval accepted on 2026-09-01 after same-run, same-gate and revision revalidation. |
| UR | `approved_by` | `Approval: UR` | Canonical current relationship for approved revision 2. |
| Brownfield Review revision 1 | `sizes` | UR revision 2 | Pass; Structured Delivery selected for the external public CLI and host configuration contract. |
| PRD revision 1 | `derived_from` | UR revision 2 | Both Copilot modes and the cross-surface lifecycle matrix map the approved need to observable acceptance criteria. |
| PRD revision 1 | `approved_by` | `Approval: PRD` | Exact approval accepted on 2026-09-02 after same-run, same-gate and revision revalidation. |
| PRD | `derived_from` | UR | Canonical current relationship for approved revision 1. |
| PRD | `approved_by` | `Approval: PRD` | Canonical current relationship for approved revision 1. |
| SD revision 1 | `derived_from` | PRD revision 1 | Design fixes the explicit shared option, safe personal precondition, atomic settings owner and bounded verification. |
| SD revision 1 | `approved_by` | `Approval: SD` | Exact approval accepted on 2026-09-02 after same-run, same-gate and revision revalidation. |
| SD | `derived_from` | PRD | Canonical current relationship for approved revision 1. |
| SD | `approved_by` | `Approval: SD` | Canonical current relationship for approved revision 1. |
| TP revision 1 | `derived_from` | SD revision 1 | Tasks and tests preserve the approved option, settings, lifecycle, documentation and evidence boundaries. |
| TP revision 1 | `approved_by` | `Approval: TP` | Exact approval accepted on 2026-09-02 after same-run, same-gate and revision revalidation. |
| TP | `derived_from` | SD | Canonical current relationship for approved revision 1. |
| TP | `approved_by` | `Approval: TP` | Canonical current relationship for approved revision 1. |
| Brownfield Analysis revision 1 | `prepares` | TP revision 1 | Pass; clean existing-owner path and isolated foreign release-profile scope. |
| CD+Tests revision 1 | `implements_and_tests` | TP revision 1 | Scoped implementation and focused evidence pass; aggregate evidence gap remains open. |
| Task Plan Review revision 1 | `verifies` | TP revision 1 | 11/12 fully done; `CSO-T11` partial for aggregate evidence. |
| Clean Implementation Review revision 1 | `reviews` | CD+Tests revision 1 | Pass; no fallback or parallel structure. |
| Code Review revision 1 | `reviews` | CD+Tests revision 1 | Pass; no scoped finding. |
| QA_REPORT | `tests` | TP | Revision 1 decision is `revise`; open evidence gap `CSO-TPR-01`. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Existing lifecycle implementation | `create-agdf/lib/lifecycle/operations.js` | Codex-only repository disable and supported global uninstall owners | direct |
| Existing Copilot settings owner | `create-agdf/lib/installers/copilot-settings.js` | Safe user-level settings parsing and atomic writes | direct |
| Current lifecycle documentation | `INSTALL.md`; `README.md`; `create-agdf/README.md` | Incomplete public disable and removal guidance | direct |
| Official Copilot configuration reference | `https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference` | Repository-level `enabledPlugins` merge behavior | direct |
| Official Copilot instructions reference | `https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions` | Independent loading of `AGENTS.md` and other custom instructions | direct |
| Scoped implementation evidence | `.agdf/control/artefacts/cross-surface-plugin-opt-out/CD_TESTS.md` | CLI, settings, lifecycle, retention, documentation and test results | strong |
| Mandatory reviews and QA | `TASK_PLAN_REVIEW.md`; `CLEAN_IMPLEMENTATION_REVIEW.md`; `CODE_REVIEW.md`; `QA_REPORT.md` | 11/12 coverage, clean solution, scoped code pass and QA revise | strong |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Direct fresh-session behavior for repository-disabled Copilot AGDF | `warn` | Keep as later host evidence; do not infer from repository fixtures. |
| Clean aggregate evidence on the combined active worktree | `revise` | Reconcile foreign release/gate-validation fixtures, then rerun smoke and skill evaluations. |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| A local opt-out overwrites unrelated Copilot settings. | `warn` | Reuse atomic settings ownership, preserve unrelated keys and fail closed on invalid or unowned paths. |
| Plugin-disabled is mistaken for all AGDF instructions disabled. | `warn` | Document and separately verify plugin and instruction discovery. |
| Unsupported host behavior is presented as parity. | `warn` | Publish an explicit support matrix and separate repository, CLI and fresh-session evidence. |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: The existing node owns lifecycle command routing and focused adapter boundaries; revised product semantics remain in the UR.

## Knowledge Persistence Decision

- memory_target: `context_graph`
- memory_reason: Cross-surface lifecycle support and instruction-discovery boundaries are reusable product contracts.
- memory_refs: `.agdf/control/CONTEXT_GRAPH.md#CG-CREATE-AGDF-CLI-COMPOSITION`

## Closeout

- delivered: Approved structured artefacts, passing Brownfield Analysis, personal/shared Copilot repository opt-out implementation, synchronized public guidance, focused and package evidence, mandatory reviews and QA revision 1.
- not_delivered: QA pass or approval, fresh-host UAT, VCS, release and publication.
- verification_performed: CLI, lifecycle, real-Git retention, strict JSON/path/atomicity fixtures, Runtime Integrity, package contents/build, broad component regressions, routing and diff checks; complete smoke attempted.
- unverified: Effective repository-disabled Copilot behavior in a fresh host session and managed-policy precedence.
- next_allowed_action: Reconcile the named foreign aggregate baseline in its owning run, then rerun full smoke and skill evaluations; do not request QA approval before pass.
- quality_outlook: Scoped implementation is clean and well covered, but QA correctly remains revise until combined-worktree aggregate evidence is green.
