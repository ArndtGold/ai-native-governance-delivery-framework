# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-copilot-plugin-integration
- lifecycle: active
- revision: 14
- revision_id: CEA7616E-A21B-4B32-B290-8F3EE4748E64
- started_at: 2026-08-28
- mode: `structured_delivery`
- current_gate: `UAT`
- decision: `open`
- owner: Arndt Gold

## Objective

Make the installable AGDF plugin the only supported GitHub Copilot integration while preserving
repository-owned governance, exact approval authority and honest host-evidence boundaries.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The user has replaced the complementary plugin and repository model with one supported Copilot plugin path. The public `copilot` command must install that plugin. Existing repository files must not be deleted automatically. |
| What is approved? | UR, PRD, Solution Design and Task and Test Plan revision 2 are approved. Brownfield implementation preparation revision 2 passes. |
| What is missing? | UAT evidence and exact `Approval: UAT`; fresh post-update Copilot app loading remains the primary visible observation. |
| What is the next allowed action? | Prepare bounded UAT evidence and request the exact UAT decision when ready. |
| What is explicitly forbidden right now? | Claiming UAT, publication or release and performing automatic VCS actions without the corresponding authority. |

## Source And Scope State

- normative_instruction_source: `plugin/meta/agdf-agent-router.md` and its focused Runtime Contract modules
- multi_scope_state: `clear`
- active_scope_evidence: Approved UR revision 2 plus completed Brownfield Review and UX Intent Definition revision 2 define the plugin-only Copilot scope.
- competing_scope_lines: Existing Codex, Claude, OpenCode, public-distribution and installation-consent runs remain independent; no existing Copilot plugin delivery run was found.
- branch_workspace_evidence: Branch `main` at baseline `d473b710dad8ff3fc7f80878f029f887a40b51af`; pre-existing changes beneath `.agdf/control/artefacts/agdf-product-maturity-roadmap/` are unrelated and excluded.
- branch_workspace_scope_effect: `supports`

## Run Status Card

This is a compact projection of the control state. It does not replace gate-check, QA, OR or approvals.

| Run status | Value |
|---|---|
| Status | open |
| Current gate | UAT |
| Allowed now | Prepare visible UAT evidence for the plugin-only Copilot outcome. |
| Blocked by | none |
| Missing approval | none |
| Next step | Restart Copilot, verify the refreshed plugin and prefixed skills, then prepare the UAT decision. |
| Quality outlook | Provide one Copilot plugin path, preserve existing user files and remove the parallel supported repository surface cleanly. |

## Approvals

Valid approval format for new runs: `Approval: <GateName>`.

| Gate | Status | Evidence |
|---|---|---|
| UR | `approved` | Exact `Approval: UR` accepted for durable revision 2 on 2026-08-28 after revalidation. |
| PRD | `approved` | Exact `Approval: PRD` accepted for durable revision 2 on 2026-08-28 after revalidation. |
| SD | `approved` | Exact `Approval: SD` accepted for durable revision 2 on 2026-08-30 after revalidation. |
| TP | `approved` | Exact `Approval: TP` accepted for durable revision 2 on 2026-08-30 after revalidation. |
| QA | `approved` | Exact `Approval: QA` accepted for QA Report revision 2 on 2026-08-30 after same-run, same-gate and revision revalidation. |
| UAT | `missing` | none |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-copilot-plugin-integration/UR.md` | `approved` | Revision 2 defines the plugin-only outcome and canonical `copilot` install command. |
| Brownfield Review | `.agdf/control/artefacts/agdf-copilot-plugin-integration/BROWNFIELD_REVIEW.md` | `done` | Revision 2 maps command, generator, migration, documentation and test owners; Structured Delivery retained. |
| Verified Change |  | `missing` | No mode decision exists. |
| PRD | `.agdf/control/artefacts/agdf-copilot-plugin-integration/PRD.md` | `approved` | Revision 2 defines one Copilot plugin path, canonical commands, retirement and non-deletion behavior. |
| SD | `.agdf/control/artefacts/agdf-copilot-plugin-integration/SD.md` | `approved` | Revision 2 maps command routing, generator cleanup, non-deletion, lifecycle reuse, docs and tests. |
| TP | `.agdf/control/artefacts/agdf-copilot-plugin-integration/TP.md` | `approved` | Revision 2 maps eleven tasks to all twelve PRD criteria, deterministic tests and bounded host evidence. |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-copilot-plugin-integration/BROWNFIELD_ANALYSIS.md` | `done` | Revision 2 confirms reuse of existing handler, generator, scaffold, lifecycle, docs and test owners. |
| CD+Tests | `.agdf/control/artefacts/agdf-copilot-plugin-integration/HOST_EVIDENCE.md` | `done` | Plugin-only implementation, regression evidence, local Marketplace and installed `agdf@agdf` `0.13.8` are recorded. |
| TP Review | `.agdf/control/artefacts/agdf-copilot-plugin-integration/TASK_PLAN_REVIEW.md` | `done` | Pass: revision 2 records 11/11 tasks fully done with bounded host evidence. |
| Clean Review | `.agdf/control/artefacts/agdf-copilot-plugin-integration/CLEAN_IMPLEMENTATION_REVIEW.md` | `done` | Pass: one clean plugin owner; no compatibility alias, repository cleanup path or parallel surface. |
| CR | `.agdf/control/artefacts/agdf-copilot-plugin-integration/CODE_REVIEW.md` | `done` | Pass: revision 2 has no open findings. |
| QA | `.agdf/control/artefacts/agdf-copilot-plugin-integration/QA_REPORT.md` | `pass` | Revision 2 passes and exact QA approval is recorded. |

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `PRD`
- scope_reason: `external_contract_depth`; `copilot` changes meaning, two public setup targets are retired and plugin, CLI, generator, migration, tests and public documentation must move together.
- evidence: `.agdf/control/artefacts/agdf-copilot-plugin-integration/BROWNFIELD_REVIEW.md` revision 2; `.agdf/control/artefacts/agdf-copilot-plugin-integration/UX_INTENT_DEFINITION.md` revision 2
- transparency_note: The plugin runtime is already implemented, but the breaking command and supported-surface change require a realigned structured chain.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR revision 1 | `approved_by` | `Approval: UR` | historical approval recorded on 2026-08-28; superseded by revision 2 |
| UR revision 2 | `revises` | UR revision 1 | removes the supported Copilot repository surface and makes `copilot` the plugin installer |
| UR revision 2 | `approved_by` | `Approval: UR` | exact approval accepted on 2026-08-28 after same-run, same-gate and revision revalidation |
| UR | `approved_by` | `Approval: UR` | canonical current relationship for approved revision 2 |
| Brownfield Review revision 1 | `sizes` | UR revision 1 | historical and superseded by revision 2 |
| Brownfield Review revision 2 | `sizes` | UR revision 2 | pass; Structured Delivery retained for the plugin-only external contract |
| UX Intent Definition revision 2 | `informs` | PRD revision 2 | ready plugin-only installation, state and recovery intent |
| PRD revision 1 | `superseded_by` | PRD revision 2 | former complementary repository contract retained as historical evidence |
| PRD revision 2 | `derived_from` | UR revision 2 | plugin-only requirements aligned with Brownfield Review and UX Intent revision 2 |
| PRD revision 2 | `approved_by` | `Approval: PRD` | exact approval accepted on 2026-08-28 after same-run, same-gate and revision revalidation |
| PRD | `derived_from` | UR | canonical current relationship for approved revision 2 |
| SD revision 1 | `superseded_by` | SD revision 2 | former complementary repository design retained as historical evidence |
| SD revision 2 | `derived_from` | PRD revision 2 | plugin-only command, generator, migration, lifecycle, documentation and test design |
| SD revision 2 | `approved_by` | `Approval: SD` | exact approval accepted on 2026-08-30 after same-run, same-gate and revision revalidation |
| SD | `derived_from` | PRD | canonical current relationship for approved revision 2 |
| TP revision 1 | `superseded_by` | TP revision 2 | former complementary repository plan retained as historical evidence |
| TP revision 2 | `derived_from` | SD revision 2 | eleven tasks cover command, scaffold, generation, lifecycle, docs, Pages, verification and reviews |
| TP revision 2 | `approved_by` | `Approval: TP` | exact approval accepted on 2026-08-30 after same-run, same-gate and revision revalidation |
| TP | `derived_from` | SD | canonical current relationship for approved revision 2 |
| Brownfield Analysis revision 2 | `prepares` | TP revision 2 | pass; clean existing-owner path confirmed before implementation |
| QA Report revision 2 | `approved_by` | `Approval: QA` | exact approval accepted on 2026-08-30 after same-run, same-gate and revision revalidation |
| UX Intent Definition | `informs` | PRD | ready structured input incorporated into PRD |
| PRD revision 1 | `derived_from` | UR revision 1 | historical and superseded for future work |
| SD revision 1 | `derived_from` | PRD revision 1 | historical and superseded for future work |
| TP revision 1 | `derived_from` | SD revision 1 | historical and superseded for future work |
| Brownfield Analysis | `prepares` | TP | passed reuse and impact analysis before implementation |
| QA_REPORT | `tests` | TP | pending fresh-session app evidence and QA decision |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Official Copilot plugin overview | `https://docs.github.com/en/copilot/concepts/agents/about-plugins` | App, CLI, cloud-agent and marketplace plugin availability | `direct` |
| Official Copilot plugin reference | `https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference` | Manifest, component, installation, cache and precedence contract | `direct` |
| Installed Copilot app 1.1.14 | `/Applications/GitHub Copilot.app` | Locally installed application and bundled SDK capability surface | `direct` |
| Generated Copilot plugin skills | `create-agdf/generated/plugins/agdf/copilot-skills/**` | Ten prefixed plugin skills and shared contract dependencies; obsolete repository projection absent | `direct` |
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
| A Copilot bundle duplicates canonical skills, runtime, installer or metadata owners. | `warn` | Refreshed Brownfield Review must identify one generator and reuse existing runtime and lifecycle owners. |
| Copilot plugin installation or permissions are mistaken for AGDF gate approval. | `warn` | Preserve `interaction.md` and exact approval revalidation as the sole authority. |
| Retirement deletes or rewrites existing user-owned Copilot repository files. | `warn` | Stop generating and supporting the projection without automatically deleting existing files. |
| Repository or package evidence is overstated as loaded app behavior. | `warn` | Maintain separate source, bundle, installed-root, fresh-session and human-UAT evidence. |
| Native input or hook support drifts across the Copilot app, CLI and cloud agent. | `warn` | Start with the supported common subset and gate stronger claims on direct capability evidence. |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-PUBLIC-PLUGIN-DISTRIBUTION`; `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-TASK-TARGET-AUTHORITY`; `CG-RUN-STATUS-CARD`
- context_graph_reconciliation: `complete`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: Brownfield Review revision 2 links the changed public command and removed repository consumer to existing CLI composition, distribution and authority owners.

## Knowledge Persistence Decision

- memory_target: `scope_artifact`
- memory_reason: Revised product scope remains owned by this run until the artefact chain is realigned.
- memory_refs: `.agdf/control/artefacts/agdf-copilot-plugin-integration/UR.md` revision 2

## Closeout

- delivered: One supported Copilot plugin command, retired parallel targets and repository projection, retained user files, refreshed docs and Pages, direct local install, 11/11 TP tasks and mandatory review passes.
- not_delivered: UAT, publication, VCS and release.
- verification_performed: Focused CLI, routing, local installer, retention, package and Pages tests; full smoke and 66/66 skill evals; direct Marketplace and `agdf@agdf` `0.13.8` read-back; `git diff --check`.
- unverified: Fresh post-update Copilot app loading and native Linux/Windows parity.
- next_allowed_action: Prepare bounded UAT evidence and request exact `Approval: UAT` only when the visible outcome is ready for acceptance.
- quality_outlook: Provide one Copilot plugin path without deleting existing user-owned repository files.
