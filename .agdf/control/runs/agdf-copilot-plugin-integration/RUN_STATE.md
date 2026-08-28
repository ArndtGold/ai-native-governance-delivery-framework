# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-copilot-plugin-integration
- lifecycle: active
- revision: 6
- revision_id: 7007DB5A-DB37-458A-9CB4-40F8C7F8A07E
- started_at: 2026-08-28
- mode: `structured_delivery`
- current_gate: `CD+Tests`
- decision: `in_progress`
- owner: Arndt Gold

## Objective

Deliver AGDF as an installable GitHub Copilot plugin while preserving repository-owned governance,
portable AGDF semantics, exact approval authority and honest host-evidence boundaries.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Brownfield Review confirms existing canonical skill, generator, runtime, lifecycle, interaction and validation owners. The work changes an external plugin contract and cross-host release path. |
| What is approved? | The durable UR, PRD, Solution Design and Task and Test Plan are approved. Both Brownfield passes and UX Intent Definition are complete. |
| What is missing? | Post-restart Copilot app evidence for loaded skills, routing, precedence, disable, uninstall and hook behavior. |
| What is the next allowed action? | Record the remaining direct-host evidence and prepare QA without claiming QA pass. |
| What is explicitly forbidden right now? | QA pass, UAT, publication, release and automatic VCS actions. |

## Source And Scope State

- normative_instruction_source: `plugin/meta/agdf-agent-router.md` and its focused Runtime Contract modules
- multi_scope_state: `clear`
- active_scope_evidence: Approved durable UR plus completed Brownfield Review and UX Intent Definition for the AGDF Copilot plugin scope.
- competing_scope_lines: Existing Codex, Claude, OpenCode, public-distribution and installation-consent runs remain independent; no existing Copilot plugin delivery run was found.
- branch_workspace_evidence: Branch `main` at baseline `d473b710dad8ff3fc7f80878f029f887a40b51af`; pre-existing changes beneath `.agdf/control/artefacts/agdf-product-maturity-roadmap/` are unrelated and excluded.
- branch_workspace_scope_effect: `supports`

## Run Status Card

This is a compact projection of the control state. It does not replace gate-check, QA, OR or approvals.

| Run status | Value |
|---|---|
| Status | open |
| Current gate | CD+Tests |
| Allowed now | Record direct-host evidence and prepare QA. |
| Blocked by | Fresh-session rendered Copilot app evidence is incomplete. |
| Missing approval | none |
| Next step | Restart GitHub Copilot and verify AGDF under Installed plus the loaded `agdf-` skills. |
| Quality outlook | Preserve one shared bundle and distinguish package, installed-root, loaded-session and UAT evidence. |

## Approvals

Valid approval format for new runs: `Approval: <GateName>`.

| Gate | Status | Evidence |
|---|---|---|
| UR | `approved` | Exact `Approval: UR` supplied by Arndt Gold on 2026-08-28 for revision 1. |
| PRD | `approved` | Exact `Approval: PRD` supplied by Arndt Gold on 2026-08-28 for revision 3. |
| SD | `approved` | Exact `Approval: SD` supplied by Arndt Gold on 2026-08-28 for revision 4. |
| TP | `approved` | Exact `Approval: TP` supplied by Arndt Gold on 2026-08-28 for revision 5. |
| QA | `missing` | none |
| UAT | `missing` | none |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-copilot-plugin-integration/UR.md` | `approved` | Defines the installable plugin outcome and authority boundaries. |
| Brownfield Review | `.agdf/control/artefacts/agdf-copilot-plugin-integration/BROWNFIELD_REVIEW.md` | `done` | Existing owners mapped; Structured Delivery selected. |
| Verified Change |  | `missing` | No mode decision exists. |
| PRD | `.agdf/control/artefacts/agdf-copilot-plugin-integration/PRD.md` | `approved` | Defines plugin outcome, working modes, lifecycle, recovery, compatibility and evidence. |
| SD | `.agdf/control/artefacts/agdf-copilot-plugin-integration/SD.md` | `approved` | Defines the shared generated bundle, Copilot manifest, prefixed skills, lifecycle adapter, consent hook and evidence boundaries. |
| TP | `.agdf/control/artefacts/agdf-copilot-plugin-integration/TP.md` | `approved` | Maps fifteen implementation tasks to twelve PRD criteria, deterministic suites and direct-host evidence. |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-copilot-plugin-integration/BROWNFIELD_ANALYSIS.md` | `done` | Existing owners, reuse path, compatibility, regression and parallel-structure risks pass. |
| CD+Tests | `.agdf/control/artefacts/agdf-copilot-plugin-integration/HOST_EVIDENCE.md` | `done` | Copilot package, installer and tests implemented; 66/66 deterministic skill evals pass. |
| CR | `.agdf/control/artefacts/agdf-copilot-plugin-integration/CODE_REVIEW.md` | `pass` | No code-review findings. |
| QA |  | `missing` | Not allowed. |

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `PRD`
- scope_reason: `external_contract_depth`; the work establishes a versioned Copilot plugin contract and cross-host installation, activation, compatibility and release behavior. Structured Slice is rejected because external contract and release/cross-host depth are directly in scope.
- evidence: `.agdf/control/artefacts/agdf-copilot-plugin-integration/BROWNFIELD_REVIEW.md`; `.agdf/control/artefacts/agdf-copilot-plugin-integration/UX_INTENT_DEFINITION.md`
- transparency_note: A useful first release may omit native gate UI and default-marketplace publication, but the remaining plugin contract and lifecycle still require full structured depth.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | `approved_by` | `Approval: UR` | exact approval recorded on 2026-08-28 |
| Brownfield Review | `sizes` | UR | completed review and Structured Delivery decision |
| UX Intent Definition | `informs` | PRD | ready structured input incorporated into PRD |
| PRD | `approved_by` | `Approval: PRD` | exact approval recorded on 2026-08-28 |
| PRD | `derived_from` | UR | approved artefact at `.agdf/control/artefacts/agdf-copilot-plugin-integration/PRD.md` |
| SD | `approved_by` | `Approval: SD` | exact approval recorded on 2026-08-28 |
| SD | `derived_from` | PRD | approved artefact at `.agdf/control/artefacts/agdf-copilot-plugin-integration/SD.md` |
| TP | `approved_by` | `Approval: TP` | exact approval recorded on 2026-08-28 |
| TP | `derived_from` | SD | approved artefact at `.agdf/control/artefacts/agdf-copilot-plugin-integration/TP.md` |
| Brownfield Analysis | `prepares` | TP | passed reuse and impact analysis before implementation |
| QA_REPORT | `tests` | TP | pending fresh-session app evidence and QA decision |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Official Copilot plugin overview | `https://docs.github.com/en/copilot/concepts/agents/about-plugins` | App, CLI, cloud-agent and marketplace plugin availability | `direct` |
| Official Copilot plugin reference | `https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference` | Manifest, component, installation, cache and precedence contract | `direct` |
| Installed Copilot app 1.1.14 | `/Applications/GitHub Copilot.app` | Locally installed application and bundled SDK capability surface | `direct` |
| Existing Copilot projection | `create-agdf/generated/.github/skills/**` | Ten prefixed skills and shared contract dependencies | `direct` |
| Canonical plugin definition | `plugin/meta/agdf-plugin.definition.json` | Current cross-surface identity, skill prefix and interaction metadata | `direct` |
| Existing generated runtime owner | `create-agdf/scripts/sync-plugin-runtime.js` | Exact-version local validator composition | `direct` |
| Brownfield Review | `.agdf/control/artefacts/agdf-copilot-plugin-integration/BROWNFIELD_REVIEW.md` | Existing owners, reuse strategy, impacts and Structured Depth decision | `direct` |
| UX Intent Definition | `.agdf/control/artefacts/agdf-copilot-plugin-integration/UX_INTENT_DEFINITION.md` | Working modes, visible state authority, activation, blockers and recovery | `direct` |
| Approved PRD | `.agdf/control/artefacts/agdf-copilot-plugin-integration/PRD.md` | Product scope, acceptance criteria, non-goals, support and evidence boundaries | `direct` |
| Approved Solution Design | `.agdf/control/artefacts/agdf-copilot-plugin-integration/SD.md` | Shared bundle ownership, Copilot manifest and skill projection, lifecycle, consent and evidence design | `direct` |
| Draft Task and Test Plan | `.agdf/control/artefacts/agdf-copilot-plugin-integration/TP.md` | Fifteen tasks, ten deterministic suites, ten host observations and full PRD coverage | `direct` |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-copilot-plugin-integration/BROWNFIELD_ANALYSIS.md` | Existing-owner fit, reuse path, regressions, compatibility and clean implementation boundary | `direct` |
| Copilot host evidence | `.agdf/control/artefacts/agdf-copilot-plugin-integration/HOST_EVIDENCE.md` | Official npm CLI install, exact version, ten installed skills and persistent Copilot plugin state | `direct` |
| Full deterministic suite | `npm --prefix create-agdf run smoke-test` | Release build, lifecycle, integrity, interaction, routing, 66 skill evals and regressions | `direct` |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Fresh-session skill discovery in the installed Copilot app | `warn` | Restart the app and capture Installed Plugins plus the loaded `agdf-` skill inventory. |
| Direct Linux and native-Windows lifecycle behavior | `warn` | Require separately authorized host evidence before cross-platform parity claims. |
| Gate-safe native Copilot input transport | `warn` | Keep exact-text approval as the baseline until a later adapter preflight proves exact values and deliberate waiting. |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| A Copilot bundle duplicates canonical skills, runtime, installer or metadata owners. | `warn` | Brownfield Review must identify one generator and reuse existing runtime and lifecycle owners. |
| Copilot plugin installation or permissions are mistaken for AGDF gate approval. | `warn` | Preserve `interaction.md` and exact approval revalidation as the sole authority. |
| Repository bootstrap is removed even though it owns project-specific files and control setup. | `warn` | Define plugin and repository bootstrap as complementary surfaces with explicit ownership. |
| Repository or package evidence is overstated as loaded app behavior. | `warn` | Maintain separate source, bundle, installed-root, fresh-session and human-UAT evidence. |
| Native input or hook support drifts across the Copilot app, CLI and cloud agent. | `warn` | Start with the supported common subset and gate stronger claims on direct capability evidence. |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-PUBLIC-PLUGIN-DISTRIBUTION`; `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-TASK-TARGET-AUTHORITY`; `CG-RUN-STATUS-CARD`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: Brownfield Review links existing nodes that own plugin-distribution evidence, approval transport, target authority and deterministic status. The approved SD establishes the proposed shared-bundle and Copilot lifecycle boundary; CPI-T15 requires reconciliation after implementation evidence confirms it.

## Knowledge Persistence Decision

- memory_target: `scope_artifact`
- memory_reason: Approved product and design decisions plus the draft execution plan remain owned by this run until implementation evidence permits reusable Context Graph reconciliation.
- memory_refs: `.agdf/control/artefacts/agdf-copilot-plugin-integration/PRD.md`; `.agdf/control/artefacts/agdf-copilot-plugin-integration/SD.md`; `.agdf/control/artefacts/agdf-copilot-plugin-integration/TP.md`

## Closeout

- delivered: Approved design chain, Copilot plugin bundle, exact runtime, public-command lifecycle adapter, one-command npm installer, persistent Copilot installation, Code Review and full deterministic test evidence.
- not_delivered: Fresh-session app acceptance, QA, UAT, publication, VCS and release.
- verification_performed: Full `create-agdf` smoke suite; 66/66 skill evals; Runtime Integrity in the installed root; direct `npm run install:copilot`; Copilot post-install list with AGDF `0.13.8`.
- unverified: Loaded app skill inventory, hook execution, native gate UI, collision behavior and cross-platform behavior.
- next_allowed_action: Restart GitHub Copilot, record direct-host evidence and prepare QA.
- quality_outlook: Preserve one shared bundle and distinguish package, installed-root, loaded-session and UAT evidence.
