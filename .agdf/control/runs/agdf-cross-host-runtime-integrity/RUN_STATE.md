# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-cross-host-runtime-integrity
- lifecycle: active
- revision: 19
- revision_id: eca39c21-3c9d-4d8f-9124-2c0ac5ead162
- mode: structured_delivery
- current_gate: QA
- decision: in_progress
- owner: agent

## Objective

Ensure runtime-bearing AGDF installations for Codex, Claude Code and OpenCode resolve one
exact-version shared validator from the intended installed distribution, while portable
instruction-only profiles degrade honestly and no runtime-free source marketplace can shadow a
complete installation.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | CRI-13 through CRI-15 are complete. Repository implementation, focused tests, full smoke, Clean Review and Code Review pass. QA Revision 4 remains revise only because direct native-Windows CRI-H05 evidence is absent. |
| What is approved? | UR Revision 1, PRD Revision 3, SD Revision 3 and TP Revision 3 are approved. TP Revision 2 remains historical approved evidence only. |
| What is missing? | Direct native-Windows CRI-H05 execution, then refreshed TP Review and QA. |
| What is the next allowed action? | Execute the complete local-marketplace suite and owned pre-provenance rebuild, host-failure rollback and commit probe on native Windows; attach direct evidence and rerun QA. |
| What is explicitly forbidden right now? | QA pass or approval, UAT, release, publication and VCS delivery actions before CRI-TPR-02 is resolved. |

## Source And Scope State

- normative_instruction_source: `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/UR.md`; AGDF Runtime Contract
- primary_target: AGDF cross-host plugin runtime source, resolution and installed-cache integrity
- governance_target: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- evidence_sources: current Codex cache; durable local marketplace; completed `automatic-version-asset-sync` and `agdf-local-plugin-install-scripts` runs; current official Codex and Claude Code plugin documentation
- working_directory: `/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework`
- multi_scope_state: clear
- active_scope_evidence: User explicitly requested starting with a UR for the continuing cross-host runtime solution.
- competing_scope_lines: `agdf-public-plugin-distribution` remains a separate active external-delivery run; completed runtime-build and local-install runs are reused as existing owners rather than reopened.
- branch_workspace_evidence: Revision-3 baseline contained only this run's control artefacts; no unrelated tracked change was present or modified.
- branch_workspace_scope_effect: Revision-3 implementation is limited to approved installer owners, their direct test and this run's control artefacts.

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` provided on 2026-08-25 after same-run, same-gate and revision-1 revalidation. |
| PRD | approved | Exact `Approval: PRD` provided on 2026-08-25 after same-run, same-gate and revision-3 revalidation. |
| SD | approved | Exact `Approval: SD` accepted on 2026-08-26 after same-run, same-gate and run-revision-15 revalidation. |
| TP | approved | Exact `Approval: TP` accepted on 2026-08-26 after same-run, same-gate and run-revision-16 revalidation; Revision 2 remains historical approved evidence only. |
| QA | revise | QA Report Revision 4 resolves both implementation findings and retains one open native-Windows evidence gap, CRI-TPR-02. |
| UAT | missing | Blocked by QA revise. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/UR.md` | approved | Revision 1 defines the cross-host outcome and reuse boundary. |
| Brownfield Review | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/BROWNFIELD_REVIEW.md` | done | Pass; bounded Structured Slice and existing-owner reuse selected. |
| Verified Change | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/VERIFIED_CHANGE.md` | missing | Mode not selected. |
| PRD | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/PRD.md` | approved | Bounded product behavior, ten stable acceptance criteria, non-goals and evidence-plane obligations were approved at Revision 3. |
| SD | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/SD.md` | approved | Revision 3 defines owned pre-provenance rebuild eligibility, atomic recovery, strict rejection boundaries and target-platform path semantics. |
| TP | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/TP.md` | approved | Revision 3 adds CRI-13 through CRI-18, CRI-T18 through CRI-T25 and direct native-Windows CRI-H05 evidence. |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/BROWNFIELD_ANALYSIS.md` | done | Revision 3 passed; the existing installer, transaction, provenance, lifecycle and test owners permit bounded CRI-13 through CRI-18 CD+Tests. |
| CD+Tests | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/CD_TESTS.md` | done | Revision 3 implements secure rebuild, exact rollback, target-platform paths and evidence projection; all repository checks pass. |
| TP Review | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/TASK_PLAN_REVIEW.md` | revise | 15/18 tasks fully done; CRI-16 through CRI-18 remain partial only for native-Windows CRI-H05 and QA closeout. |
| Clean Implementation Review | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/CLEAN_IMPLEMENTATION_REVIEW.md` | pass | One marketplace and transaction owner; no workaround, cache patch, platform skip or parallel structure. |
| CR | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/CODE_REVIEW.md` | done | Revision 3 passes after semantic-version eligibility and actual host-failure rollback coverage were added. |
| QA | `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/QA_REPORT.md` | revise | Revision 4 resolves CRI-QA-01 and CRI-QA-02 implementation work; open CRI-TPR-02 requires direct native-Windows evidence. |

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
| QA_REPORT revision 3 | supersedes | QA_REPORT revision 2 | Native-Windows evidence invalidates the prior migration-completeness claim and routes the earliest open finding to SD. |
| CRI-QA-01 | routes_to | SD revision 3 | Recovery for an AGDF-owned pre-provenance root needs an explicit fail-closed design before implementation. |
| CRI-QA-02 | routes_to | CD+Tests | Native-Windows path expectations in `local-marketplace-test.js` must become platform-independent and execute on the actual host. |
| SD revision 3 | derived_from | PRD revision 3 and QA Report revision 3 | Preserves the approved product boundary while adding the missing recovery and Windows-test architecture. |
| SD revision 3 | supersedes | SD revision 2 for future work | Historical approvals and evidence remain recorded; new TP drafting requires exact approval of revision 3. |
| SD revision 3 | approved_by | Approval: SD | Exact approval accepted on 2026-08-26 after same-run, same-gate and run-revision-15 revalidation. |
| TP revision 3 | derived_from | SD revision 3 and QA Report revision 3 | Converts the approved rebuild and Windows-test design into bounded implementation, regression and evidence tasks. |
| TP revision 3 | approved_by | Approval: TP | Exact approval accepted on 2026-08-26 after same-run, same-gate and run-revision-16 revalidation. |
| Brownfield Analysis revision 3 | derived_from | TP revision 3 | Current owner, path, transaction, compatibility and regression evidence passed before implementation. |
| CD+Tests revision 3 | implements | TP revision 3 | Secure owned rebuild, canonical-only staging, atomic rollback, target-platform paths and evidence projection pass repository verification. |
| TP Review revision 3 | tests | TP revision 3 | 15/18 fully done; CRI-TPR-02 keeps native-Windows evidence open. |
| Clean Implementation Review revision 3 | reviews | CD+Tests revision 3 | Pass with one existing installer and transaction owner and no fallback-heavy path. |
| Code Review revision 3 | reviews | CD+Tests revision 3 | Pass with no open code finding. |
| QA Report revision 4 | tests | TP Review and implementation reviews revision 3 | Revise solely for open native-Windows evidence gap CRI-TPR-02. |
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
| Native-Windows pre-provenance reinstall | `.agdf/control/artefacts/windows-native-install-viability/VERIFIED_CHANGE.md` | Reproduced markerless owned-root failure and manual-recovery dependency; exposed non-portable local-marketplace assertions | direct host observation |
| Revision-3 repository verification | Focused tests, canonical release preparation, source Runtime Integrity and full `create-agdf` smoke | Secure rebuild, exact rollback, target-platform paths, package and 66/66 skill-eval regressions | deterministic repository evidence |

## Missing Evidence

- Direct post-change native-Windows CRI-H05 execution of the complete local-marketplace suite and rebuild transaction.
- Refreshed TP Review and QA pass after CRI-H05 evidence is attached.
- Human UAT after a later QA pass and exact QA approval.
- The separate 12-case Claude loaded-host observation remains pending a user restart and fresh session.

## Risks

- Provenance does not protect against an actor able to replace the complete installation and every ownership marker.
- The current Codex app task predates installation; the final isolated Codex CLI session is the direct fresh-host evidence.
- Claude's separately listed cache path retains an earlier same-semver copy, while the actual final fresh host loads the current durable marketplace root; status surfaces must keep these planes distinct.
- Public Skills-only portability must not be confused with a guaranteed local validator runtime.
- Unrelated user work could be included accidentally if the scope boundary is not preserved.
- Missing provenance must never become migration authority; recovery must rely on a separately evidenced AGDF-owned transaction boundary and rebuild a fresh installation.
- Target-platform tests cannot prove native-Windows filesystem and command behavior until CRI-H05 runs directly there.

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`; `CG-PUBLIC-PLUGIN-DISTRIBUTION`
- context_graph_reconciliation: resolved
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: `CG-CREATE-AGDF-CLI-COMPOSITION` records that trusted marker-bearing migration stays unchanged while a separately classified AGDF-owned pre-provenance root may only be set aside for canonical atomic rebuild.

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: Marketplace source authority, installed-cache provenance and shared-runtime adapter boundaries are reusable cross-host invariants if approved and delivered.
- memory_refs: `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/UR.md`

## Closeout

- next_allowed_action: Execute CRI-H05 on native Windows, attach direct evidence and rerun TP Review and QA.
- quality_outlook: Preserve fail-closed provenance while making supported reinstall recovery deterministic and native-Windows-testable.
