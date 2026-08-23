# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-plugin-family-language
- lifecycle: active
- revision: 20
- revision_id: adc35dda-9dd2-4738-9552-394616dc3f53
- mode: structured_slice
- current_gate: QA
- decision: revise
- owner: agent

## Objective

Establish a consistent AGDF plugin-family language in which `AGDF` is the visible brand, lowercase
`agdf` remains a technical identifier, and each plugin keeps a distinct product role.

## Current Control State

| Question | Answer |
|---|---|
| What is approved? | UR, PRD, SD and TP are approved; exact `Approval: TP` was provided on 2026-08-23 after same-run, same-gate and revision revalidation. |
| What is known? | The Codex-native repository Marketplace is generated from the canonical `AGDF` brand and fresh app-server `plugin/list` selects it with `displayName: AGDF`; full smoke, Runtime Integrity, public contract and Claude strict validation pass. |
| What is missing? | One direct native rendered Plugins-screen observation for AFL-T8 and AFL-T11. |
| What is the next allowed action? | Capture one direct rendered Plugins-screen observation without reinstalling or changing code. |
| What is explicitly forbidden right now? | QA approval request while QA is revise, visible success claims, further implementation without a new finding, reinstall, cache edits, UAT, release, publication and VCS actions. |

## Source And Scope State

- normative_instruction_source: `.agdf/control/artefacts/agdf-plugin-family-language/UR.md`; AGDF Runtime Contract
- multi_scope_state: clear
- active_scope_evidence: User asked to start with the visible lowercase `agdf` entry and establish a shared marketing language; the current AGDF repository owns that Marketplace projection.
- competing_scope_lines: `agdf-public-plugin-distribution` remains at UAT under its existing approved scope; AGDF Project Inventory is a separate repository and is evidence only for this first slice.
- branch_workspace_evidence: The worktree was clean before this run was created.
- branch_workspace_scope_effect: Only the new run control state and UR are in scope before UR approval.

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` provided on 2026-08-23 after revalidation of run, gate, revision and durable UR. |
| Brownfield Review | done | Existing owners, public-run boundary, host evidence boundary and Verified Change eligibility are recorded. |
| PRD | approved | Exact `Approval: PRD` provided on 2026-08-23 after same-run, PRD gate, revision and durable-artefact revalidation. |
| SD | approved | Revision 2 received exact `Approval: SD` on 2026-08-23 after same-run, same-gate and revision revalidation. |
| TP | approved | Revision 2 received exact `Approval: TP` on 2026-08-23 after same-run, same-gate and revision revalidation. |
| Brownfield Analysis | done | Revision 2 analysis passes with clean candidate paths, existing renderer/sync owners and unchanged Claude boundary. |
| CD+Tests | done | Canonical repository Marketplace projection, focused suites, app-server assertion and complete smoke test pass. |
| CR | done | Revision 2 Code Review passes with no open correctness, security, compatibility or maintainability finding. |
| QA | revise | AFL-TPR-07 and AFL-TPR-08 are resolved; AFL-TPR-09 remains open for one direct rendered Plugins-screen observation. |
| UAT | missing | UAT is not reachable while QA remains revise. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-plugin-family-language/UR.md` | approved | Defines the visible brand, technical identifier boundary, first-slice scope and evidence classes. |
| Brownfield Review | `.agdf/control/artefacts/agdf-plugin-family-language/BROWNFIELD_REVIEW.md` | done | Reuses the existing canonical `AGDF` value and selects Verified Change. |
| Verified Change | `.agdf/control/artefacts/agdf-plugin-family-language/VERIFIED_CHANGE.md` | escalated | Formal eligibility failed before implementation; declared target is `structured_slice`. |
| PRD | `.agdf/control/artefacts/agdf-plugin-family-language/PRD.md` | approved | Bounded visible brand, technical identity, public-contract isolation and evidence semantics are defined. |
| SD | `.agdf/control/artefacts/agdf-plugin-family-language/SD.md` | approved | Revision 2 adds the Codex-native repository Marketplace projection and preserves the unchanged Claude manifest. |
| TP | `.agdf/control/artefacts/agdf-plugin-family-language/TP.md` | approved | Revision 2 adds AFL-T9 through AFL-T11 for canonical projection, cross-host isolation and fresh QA evidence. |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-plugin-family-language/BROWNFIELD_ANALYSIS.md` | done | Revision 2 pass; canonical renderer and asset synchronization owners are reused. |
| CD+Tests | `.agdf/control/artefacts/agdf-plugin-family-language/CD_TESTS.md` | done | Repository projection, cross-host isolation, app-server selection and full regressions pass. |
| TP Review | `.agdf/control/artefacts/agdf-plugin-family-language/TP_REVIEW.md` | revise | 9/11 fully done; AFL-T8 and AFL-T11 await direct rendered-screen evidence. |
| Clean Implementation Review | `.agdf/control/artefacts/agdf-plugin-family-language/CLEAN_IMPLEMENTATION_REVIEW.md` | pass | Host-native projection from one canonical owner; no cache or Claude workaround. |
| CR | `.agdf/control/artefacts/agdf-plugin-family-language/CODE_REVIEW.md` | done | Revision 2 pass; no open code finding. |
| QA | `.agdf/control/artefacts/agdf-plugin-family-language/QA_REPORT.md` | revise | App-server reports `AGDF`; native rendered-screen evidence remains unavailable in this task. |

## Mode/Slice Decision

- decision: structured_slice
- required_next_gate: Brownfield Analysis
- scope_reason: `bounded_structured_slice`; one coherent local Marketplace outcome with known authority, bounded propagation and rollback, no full-depth trigger, and fail-closed escalation from the invalid compact record.
- evidence: `.agdf/control/artefacts/agdf-plugin-family-language/BROWNFIELD_REVIEW.md`; `.agdf/control/artefacts/agdf-plugin-family-language/VERIFIED_CHANGE.md`; `.agdf/control/artefacts/agdf-plugin-family-language/PRD.md`.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| User request | motivates | UR | User asked to begin with lowercase `agdf` and create one shared marketing language. |
| UR | approved_by | `Approval: UR` | Exact approval provided on 2026-08-23 after same-run, UR gate, revision and durable-artefact revalidation. |
| Brownfield Review | sizes | UR | Existing owners, reuse path, parallel-structure risk, public-run boundary and host evidence classes were inspected. |
| Brownfield Review | selects_mode | verified_change | Eligible compact record proves one canonical owner, bounded clean paths and deterministic validation. |
| Verified Change | escalates_to | structured_slice | `AGDF_VERIFIED_CHANGE_IMPACTS_INVALID` failed formal eligibility before implementation. |
| PRD | derived_from | UR | Bounded structured requirements preserve the exact visible/technical identity and evidence boundaries. |
| PRD | approved_by | `Approval: PRD` | Exact approval provided on 2026-08-23 after same-run, PRD gate, revision and durable-artefact revalidation. |
| SD | derived_from | PRD | One canonical brand value, exact identity mapping, bounded legacy migration, rollback reuse and evidence separation cover AFL-1 through AFL-7. |
| SD revision 2 | approved_by | `Approval: SD` | Exact approval provided on 2026-08-23 after same-run, same-gate and revision revalidation. |
| TP | derived_from | SD | Approved revision 2 adds AFL-T9 through AFL-T11 for the Codex-native repository projection and cross-host evidence. |
| TP revision 2 | derived_from | SD revision 2 | AFL-T9 through AFL-T11 cover the new repository projection, cross-host validation and refreshed quality evidence. |
| TP revision 2 | approved_by | `Approval: TP` | Exact approval provided on 2026-08-23 after same-run, same-gate and revision revalidation. |
| Brownfield Analysis | verifies | TP revision 2 | Expanded candidate paths are clean and reuse existing owners with unchanged Claude metadata. |
| CD+Tests | implements | TP revision 2 | AFL-T9 and AFL-T10 are delivered; AFL-T11 awaits direct rendered evidence only. |
| TP Review | verifies | TP revision 2 | Nine tasks are fully done; AFL-T8 and AFL-T11 share evidence gap AFL-TPR-09. |
| Clean Implementation Review | reviews | CD+Tests | Primary host-native projection is clean with no parallel decision owner or workaround. |
| CR | reviews | CD+Tests | No open correctness, security, compatibility or maintainability finding. |
| QA | tests | TP revision 2 | Decision revise; only AFL-TPR-09 remains open for direct rendered Plugins evidence. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Visible Codex Plugins screen | User-provided screenshot on 2026-08-23 | Lowercase `agdf` Marketplace label and separately branded Project Inventory label | direct host observation |
| Canonical AGDF plugin definition | `plugin/meta/agdf-plugin.definition.json` | Product metadata and technical ID | direct repository evidence |
| Registered and installed Marketplace inventory | `codex plugin marketplace list --json`; `codex plugin list --json` | Technical Marketplace and plugin IDs currently active | direct local runtime evidence |
| Installed Marketplace manifests | `~/Library/Application Support/agdf/marketplaces/agdf/` | Current installed display metadata | direct installed-package evidence |
| Verified Change baseline | Git commit `cf1cb5d753feb5fb5e415f0e8c7f8442f204993e`; candidate-path status empty | Candidate source paths are clean before eligibility | direct repository evidence |
| Pre-implementation baseline | Focused Marketplace, Runtime Integrity and public plugin tests on 2026-08-23 | Existing behavior and public-contract isolation before implementation | deterministic pass |
| Post-change repository validation | Focused Marketplace, Runtime Integrity, public plugin, local development install and whitespace checks | AFL-T2 through AFL-T5 repository result | deterministic pass |
| Corrected supported local Codex refresh | `npm --prefix create-agdf run install:codex`; registered and installed manifest inspection | AFL-T7 registration revision 1, owned root, enabled plugin, `displayName: AGDF` and version `0.13.5+codex.local-619acdcbd1f9` | direct installed-state evidence |
| Prior post-restart Codex Plugins screen | User-provided screenshot on 2026-08-23 before AFL-TPR-03 correction | Diagnosed stale lowercase `agdf` registration rendering; does not prove corrected host result | direct prior host observation |
| Failed restart cache inspection | User report plus `codex plugin list --json` and active cache inspection | Restarted Codex loaded base version/cache `0.13.5` while Marketplace source projected the cachebuster | direct host and runtime evidence |
| Exact-selector reinstall | Corrected repository installer, native inventory and cache directory inspection | `agdf@agdf --json` leaves only cache `0.13.5+codex.local-619acdcbd1f9`; base cache absent | direct current-runtime evidence |
| Codex app-server Plugins data | Fresh `plugin/list` request with this repository cwd | Selects `.claude-plugin/marketplace.json`, exposes no Marketplace display name and reports source plugin version `0.13.5`; temporary diagnostic display metadata produced `AGDF` and was reverted | direct host-backend evidence |
| Codex-native repository Marketplace | `.agents/plugins/marketplace.json`; canonical renderer and sync projection | Marketplace `displayName: AGDF`, technical IDs `agdf`, repository source `./plugin` | direct repository evidence |
| Post-change Codex app-server Plugins data | Fresh `plugin/list` request with this repository cwd | Selects `.agents/plugins/marketplace.json`, exposes `AGDF`, core product name unchanged and valid repository version `0.13.5` | direct host-backend evidence |
| Revision 2 regression suite | Focused package tests, Runtime Integrity, Claude strict validation and complete smoke test | All pass, including 66/66 deterministic skill evals | deterministic pass |

## Risks

- Native rendered Plugins-screen evidence is unavailable from this task; app-server evidence must not be overstated as rendered UI proof.
- Family language could blur product authority unless companion roles remain explicit.

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: `.agdf/control/CONTEXT_GRAPH.md#release_built_plugin_distribution_2026_07_18`; `.agdf/control/SOT_REGISTRY.md`
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Existing local Marketplace staging and rollback ownership applies without a new graph node.

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: The naming rule, UI observation and bounded reuse decision are owned by this run and the canonical plugin definition.
- memory_refs: `.agdf/control/artefacts/agdf-plugin-family-language/UR.md`; `.agdf/control/artefacts/agdf-plugin-family-language/BROWNFIELD_REVIEW.md`; `.agdf/control/artefacts/agdf-plugin-family-language/VERIFIED_CHANGE.md`

## Closeout

- next_allowed_action: Capture one direct rendered Plugins-screen observation without reinstalling or changing code.
- quality_outlook: Preserve one canonical metadata owner and keep repository, installed-package and direct-host evidence separate.
