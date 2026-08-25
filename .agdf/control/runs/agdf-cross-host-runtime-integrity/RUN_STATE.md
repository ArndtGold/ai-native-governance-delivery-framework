# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-cross-host-runtime-integrity
- lifecycle: active
- revision: 13
- revision_id: 2693f073-b1e5-40a3-a146-ffcf17a06861
- mode: structured_delivery
- current_gate: QA
- decision: pass
- owner: agent

## Objective

Ensure runtime-bearing AGDF installations for Codex, Claude Code and OpenCode resolve one
exact-version shared validator from the intended installed distribution, while portable
instruction-only profiles degrade honestly and no runtime-free source marketplace can shadow a
complete installation.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The source checkout is non-installable, generated and installed runtime profiles are provenance-checked, and final supported Codex, Claude Code and OpenCode fresh sessions consume the intended 0.13.5 surfaces. |
| What is approved? | UR Revision 1, PRD Revision 3, SD Revision 2 and TP Revision 2 are approved. Pre-implementation Brownfield Analysis passed against the revised path boundary. |
| What is missing? | Exact `Approval: QA`; UAT remains later. |
| What is the next allowed action? | Present the QA pass report and request exact `Approval: QA`. |
| What is explicitly forbidden right now? | UAT work or approval, release, publication and VCS delivery actions before QA approval. |

## Source And Scope State

- normative_instruction_source: `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/UR.md`; AGDF Runtime Contract
- primary_target: AGDF cross-host plugin runtime source, resolution and installed-cache integrity
- governance_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- evidence_sources: current Codex cache; durable local marketplace; completed `automatic-version-asset-sync` and `agdf-local-plugin-install-scripts` runs; current official Codex and Claude Code plugin documentation
- working_directory: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- multi_scope_state: clear
- active_scope_evidence: User explicitly requested starting with a UR for the continuing cross-host runtime solution.
- competing_scope_lines: `agdf-public-plugin-distribution` remains a separate active external-delivery run; completed runtime-build and local-install runs are reused as existing owners rather than reopened.
- branch_workspace_evidence: Pre-existing modified `docs/presentation/agdf_cto_praesentation.key` is unrelated user work and remains isolated.
- branch_workspace_scope_effect: Only this run's currently permitted control artefacts and backlog pointer may change before later gate approvals.

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` provided on 2026-08-25 after same-run, same-gate and revision-1 revalidation. |
| PRD | approved | Exact `Approval: PRD` provided on 2026-08-25 after same-run, same-gate and revision-3 revalidation. |
| SD | approved | Exact `Approval: SD` provided on 2026-08-25 after same-run, same-gate and revision-2 revalidation. |
| TP | approved | Exact `Approval: TP` provided on 2026-08-25 after same-run, same-gate and revision-2 revalidation. |
| QA | missing | QA Report revision 2 passes and is ready for exact `Approval: QA`. |
| UAT | missing | Blocked by SD and later steps. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/UR.md` | approved | Revision 1 defines the cross-host outcome and reuse boundary. |
| Brownfield Review | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/BROWNFIELD_REVIEW.md` | done | Pass; bounded Structured Slice and existing-owner reuse selected. |
| Verified Change | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/VERIFIED_CHANGE.md` | missing | Mode not selected. |
| PRD | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/PRD.md` | approved | Bounded product behavior, ten stable acceptance criteria, non-goals and evidence-plane obligations were approved at Revision 3. |
| SD | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/SD.md` | approved | Revision 2 covers both root source marketplaces and distinguishes them from runtime-complete generated repository scaffolding. |
| TP | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/TP.md` | approved | Revision 2 adds the root Claude marketplace path and preserves generated runtime-complete repository projections. |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/BROWNFIELD_ANALYSIS.md` | done | Revised owner, path, reuse, regression and protected-baseline analysis passed and permitted bounded CD+Tests. |
| CD+Tests | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/CD_TESTS.md` | done | CRI-01 through CRI-12 implemented and verified at repository, generated-bundle, package and temporary-root evidence planes. |
| TP Review | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/TASK_PLAN_REVIEW.md` | pass | 12/12 tasks fully done; CRI-H01 through CRI-H04 direct evidence resolves CRI-TPR-01. |
| Clean Implementation Review | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/CLEAN_IMPLEMENTATION_REVIEW.md` | pass | One shared provenance/runtime owner; bounded migration only; no workaround or parallel runtime. |
| CR | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/CODE_REVIEW.md` | done | Pass after resolving five implementation findings discovered by code and real-host review. |
| QA | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/QA_REPORT.md` | pass | Sole QA decision: plan, solution, code, direct host evidence and Context Graph reconciliation pass; QA approval is still missing. |

## Mode/Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: `bounded_structured_slice`; one coherent runtime-source integrity outcome extends existing runtime and installer owners, preserves gate/runtime architecture, uses bounded local recovery and requires no coordinated external cutover. `structured_delivery` is rejected because no full-depth trigger applies.
- evidence: `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/BROWNFIELD_REVIEW.md`; `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/UX_INTENT_DEFINITION.md`

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Exact approval accepted on 2026-08-25 after same-run, same-gate and revision-1 revalidation. |
| Brownfield Review | derived_from | UR | Existing runtime, installer, marketplace, cache and host owners inspected after UR approval. |
| UX Intent Definition | derived_from | Brownfield Review | Medium UX impact required explicit activation, visible-state and recovery intent before PRD. |
| PRD | derived_from | UR | The bounded requirements preserve the approved shared-runtime, portable-profile and no-cache-patching scope. |
| PRD | informed_by | Brownfield Review | Existing runtime, installer, marketplace and host owners are extended without a parallel validator or installer. |
| PRD | informed_by | UX Intent Definition | Working modes, effective-state authority, activation, blockers, recovery and transitions are expressed as observable criteria. |
| PRD | approved_by | Approval: PRD | Exact approval accepted on 2026-08-25 after same-run, same-gate and revision-3 revalidation. |
| SD | derived_from | PRD | Architecture decisions map every PRD-RI criterion to existing owners, shared provenance and bounded host evidence. |
| SD | approved_by | Approval: SD | Exact approval accepted on 2026-08-25 after same-run, same-gate and revision-4 revalidation. |
| TP | derived_from | SD | Twelve executable tasks preserve the selected owners and map the full PRD-RI acceptance set to focused, regression and direct-host evidence. |
| SD revision 2 | derived_from | PRD | PRD-RI-02 already covers Codex and Claude; revision 2 adds the missing Claude source path without changing product scope. |
| SD revision 2 | approved_by | Approval: SD | Exact approval accepted on 2026-08-25 after same-run, same-gate and revision-2 revalidation. |
| TP revision 1 | superseded_by | SD revision 2 | Approved path list omitted `.claude-plugin/marketplace.json`; implementation is frozen pending revised gates. |
| TP revision 2 | derived_from | SD revision 2 | Revised tasks and tests cover both source-root marketplaces while preserving runtime-complete generated repository scaffolding. |
| TP revision 2 | approved_by | Approval: TP | Exact approval accepted on 2026-08-25 after same-run, same-gate and revision-2 revalidation. |
| Brownfield Analysis revision 2 | derived_from | TP revision 2 | Revalidation confirms existing owners and revised paths are sufficient for bounded implementation. |
| Brownfield Analysis | routes_to | SD revision 2 | Direct implementation inspection identified the design and approved-path gap. |
| QA_REPORT | tests | TP | QA pass is based on 12/12 TP coverage, mandatory reviews, full regression evidence and direct host observations. |
| UR | extends | completed_run:automatic-version-asset-sync | Reuse the canonical runtime build and durable marketplace architecture. |
| UR | extends | completed_run:agdf-local-plugin-install-scripts | Reuse local-development installation and cachebuster orchestration. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Final Codex loaded cache | `/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.13.5+codex.local-2532e2f19e67`; final isolated Codex session | `owned_version_matched`, matched provenance, registry access false and `SessionStart Completed` | direct host observation |
| Final Claude loaded plugin | Final Claude `hook_response` and `init.plugins` for `/Users/arndtgold/Library/Application Support/agdf/marketplaces/agdf/plugins/agdf` | enabled 0.13.5, matched final runtime and loaded-session root | direct host observation |
| Final OpenCode surface | `/Users/arndtgold/.config/opencode`; final `opencode-status --json` and fresh `opencode run` | current 0.13.5 config-local validator, complete native surface and successful fresh session | direct host observation |
| Portable profile | `create-agdf/generated/submissions/openai/agdf` | Skills-only candidate has no runtime or provenance marker | direct generated-candidate observation |
| Full regression suite | `npm --prefix create-agdf run smoke-test` | Final implementation, package, integrity, routing and 66/66 skill-eval coverage | deterministic repository evidence |

## Missing Evidence

- Exact `Approval: QA`.
- Human UAT after QA approval.
- Claude model-response evidence is unavailable until the separate Claude CLI is authenticated; plugin and hook loading evidence is complete and this does not block QA.

## Risks

- Provenance does not protect against an actor able to replace the complete installation and every ownership marker.
- The current Codex app task predates installation; the final isolated Codex CLI session is the direct fresh-host evidence.
- Claude's separately listed cache path retains an earlier same-semver copy, while the actual final fresh host loads the current durable marketplace root; status surfaces must keep these planes distinct.
- Public Skills-only portability must not be confused with a guaranteed local validator runtime.
- Unrelated user work could be included accidentally if the scope boundary is not preserved.

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`; `CG-PUBLIC-PLUGIN-DISTRIBUTION`
- context_graph_reconciliation: resolved
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: Existing nodes now record shared profile/provenance ownership, exact legacy migration, independent evidence planes and the directly observed Codex prompt limits.

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: Marketplace source authority, installed-cache provenance and shared-runtime adapter boundaries are reusable cross-host invariants if approved and delivered.
- memory_refs: `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/UR.md`

## Closeout

- next_allowed_action: Present the QA pass report and request exact `Approval: QA`; do not start UAT before same-run, same-gate and revision revalidation.
- quality_outlook: QA evidence is complete; UAT remains the next user gate only after exact QA approval.
