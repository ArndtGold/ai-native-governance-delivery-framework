<!-- AGDF LEGACY PROJECTION: NON-AUTHORITATIVE -->
<!-- canonical_source: .agdf/control/runs/agdf-copilot-plugin-integration/RUN_STATE.md -->
<!-- run_id: agdf-copilot-plugin-integration -->
<!-- revision_id: 5CBA1BA2-5CA1-41AC-BE24-80DD28320156 -->
<!-- sha256: 503ae057847347bf29185c4d342a51eab0a7b220c4dfcde09afb4427cd583f7a -->
# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-copilot-plugin-integration
- lifecycle: active
- revision: 21
- revision_id: 5CBA1BA2-5CA1-41AC-BE24-80DD28320156
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
| What is known? | The isolated Copilot profile, semantic inventory, Marketplace migration and host installation are implemented. All 13 TP tasks and mandatory reviews pass. |
| What is approved? | UR revision 2 plus PRD, SD, TP and QA revision 3 are approved. |
| What is missing? | Fresh-session Copilot evidence and exact `Approval: UAT`. |
| What is the next allowed action? | Prepare bounded fresh-session UAT evidence, then request exact UAT approval. |
| What is explicitly forbidden right now? | Publication, release, automatic VCS actions and unevidenced loaded-session or cross-platform claims. |

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
| Status | Awaiting UAT |
| Current gate | UAT |
| Allowed now | Prepare bounded fresh-session UAT evidence and request exact UAT approval. |
| Blocked by | Exact UAT approval not yet granted. |
| Missing approval | `Approval: UAT` |
| Next step | Install the current Copilot payload, restart into a fresh session and capture bounded UAT evidence. |
| Quality outlook | Preserve the distinction between installed state and fresh-session loaded behavior. |

## Approvals

Valid approval format for new runs: `Approval: <GateName>`.

| Gate | Status | Evidence |
|---|---|---|
| UR | `approved` | Exact `Approval: UR` accepted for durable revision 2 on 2026-08-28 after revalidation. |
| PRD | `approved` | Exact `Approval: PRD` accepted for revision 3 on 2026-08-30 after same-run, same-gate and revision revalidation. |
| SD | `approved` | Exact `Approval: SD` accepted for revision 3 on 2026-08-30 after same-run, same-gate and revision revalidation. |
| TP | `approved` | Exact `Approval: TP` accepted for revision 3 on 2026-08-30 after same-run, same-gate and revision revalidation. |
| QA | `approved` | Exact `Approval: QA` accepted for durable revision 3 on 2026-09-01 after same-run, same-gate and revision revalidation. |
| UAT | `pending` | Fresh-session evidence and exact `Approval: UAT` remain outstanding. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-copilot-plugin-integration/UR.md` | `approved` | Revision 2 defines the plugin-only outcome and canonical `copilot` install command. |
| Brownfield Review | `.agdf/control/artefacts/agdf-copilot-plugin-integration/BROWNFIELD_REVIEW.md` | `done` | Revision 2 maps command, generator, migration, documentation and test owners; Structured Delivery retained. |
| Verified Change |  | `missing` | No mode decision exists. |
| PRD | `.agdf/control/artefacts/agdf-copilot-plugin-integration/PRD.md` | `approved` | Revision 3 adds a Copilot-specific single-projection artifact and fail-closed semantic inventory. |
| SD | `.agdf/control/artefacts/agdf-copilot-plugin-integration/SD.md` | `approved` | Revision 3 separates generated and staged Copilot profiles, adds semantic inventory and protects cross-host coexistence. |
| TP | `.agdf/control/artefacts/agdf-copilot-plugin-integration/TP.md` | `approved` | Revision 3 defines thirteen tasks, thirteen deterministic suites and five bounded host observations. |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-copilot-plugin-integration/BROWNFIELD_ANALYSIS.md` | `done` | Revision 3 passes and maps the minimal existing-owner implementation path, runtime closure and stop conditions. |
| CD+Tests | `.agdf/control/artefacts/agdf-copilot-plugin-integration/HOST_EVIDENCE.md` | `done` | Revision 3 separates generated, staged, installed-root and loaded-session evidence and records the real 0.14.1 install. |
| TP Review | `.agdf/control/artefacts/agdf-copilot-plugin-integration/TASK_PLAN_REVIEW.md` | `done` | Revision 3 records 13/13 tasks fully done. |
| Clean Review | `.agdf/control/artefacts/agdf-copilot-plugin-integration/CLEAN_IMPLEMENTATION_REVIEW.md` | `done` | Revision 3 passes with one generated profile and bounded legacy migration. |
| CR | `.agdf/control/artefacts/agdf-copilot-plugin-integration/CODE_REVIEW.md` | `done` | Revision 3 has no open findings. |
| QA | `.agdf/control/artefacts/agdf-copilot-plugin-integration/QA_REPORT.md` | `pass` | Revision 3 technical decision is `pass`; exact user approval was accepted after revalidation. |

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
| PRD revision 3 | `revises` | PRD revision 2 | adds the single-projection Copilot artifact and fail-closed semantic inventory requirement |
| PRD revision 3 | `derived_from` | UR revision 2 | preserves the approved plugin-only outcome while making its payload integrity measurable |
| PRD revision 3 | `approved_by` | `Approval: PRD` | exact approval accepted on 2026-08-30 after same-run, same-gate and revision revalidation |
| PRD | `derived_from` | UR | canonical current relationship for approved revision 3 |
| SD revision 1 | `superseded_by` | SD revision 2 | former complementary repository design retained as historical evidence |
| SD revision 2 | `derived_from` | PRD revision 2 | plugin-only command, generator, migration, lifecycle, documentation and test design |
| SD revision 2 | `approved_by` | `Approval: SD` | exact approval accepted on 2026-08-30 after same-run, same-gate and revision revalidation |
| SD revision 3 | `revises` | SD revision 2 | replaces the shared Copilot install root with a host-specific generated and staged profile |
| SD revision 3 | `derived_from` | PRD revision 3 | maps the single-projection and semantic inventory requirements to existing build and lifecycle owners |
| SD revision 3 | `approved_by` | `Approval: SD` | exact approval accepted on 2026-08-30 after same-run, same-gate and revision revalidation |
| SD | `derived_from` | PRD | canonical current relationship for approved revision 3 |
| TP revision 1 | `superseded_by` | TP revision 2 | former complementary repository plan retained as historical evidence |
| TP revision 2 | `derived_from` | SD revision 2 | eleven tasks cover command, scaffold, generation, lifecycle, docs, Pages, verification and reviews |
| TP revision 2 | `approved_by` | `Approval: TP` | exact approval accepted on 2026-08-30 after same-run, same-gate and revision revalidation |
| TP revision 3 | `revises` | TP revision 2 | adds host-profile build, semantic inventory, negative fixtures, isolated marketplace and coexistence tasks |
| TP revision 3 | `derived_from` | SD revision 3 | maps all revised design decisions to implementation, deterministic tests and host evidence |
| TP revision 3 | `approved_by` | `Approval: TP` | exact approval accepted on 2026-08-30 after same-run, same-gate and revision revalidation |
| TP | `derived_from` | SD | canonical current relationship for approved revision 3 |
| Brownfield Analysis revision 2 | `prepares` | TP revision 2 | historical pass for the previous scope |
| Brownfield Analysis revision 3 | `prepares` | TP revision 3 | pass; reuse path, runtime closure, isolated transaction and regression boundaries confirmed |
| QA Report revision 2 | `approved_by` | `Approval: QA` | exact approval accepted on 2026-08-30 after same-run, same-gate and revision revalidation |
| Task Plan Review revision 3 | `tests` | TP revision 3 | pass; 13/13 tasks fully done |
| Clean Implementation Review revision 3 | `reviews` | CD+Tests revision 3 | pass; one generated profile and bounded compatibility migration |
| Code Review revision 3 | `reviews` | CD+Tests revision 3 | pass; no open findings after host-discovered defects were resolved |
| QA Report revision 3 | `tests` | TP revision 3 | technical decision `pass` |
| QA Report revision 3 | `approved_by` | `Approval: QA` | exact approval accepted on 2026-09-01 after same-run, same-gate and revision revalidation |
| UX Intent Definition | `informs` | PRD | ready structured input incorporated into PRD |
| PRD revision 1 | `derived_from` | UR revision 1 | historical and superseded for future work |
| SD revision 1 | `derived_from` | PRD revision 1 | historical and superseded for future work |
| TP revision 1 | `derived_from` | SD revision 1 | historical and superseded for future work |
| Brownfield Analysis | `prepares` | TP | passed reuse and impact analysis before implementation |
| QA_REPORT | `tests` | TP | revision 3 technical decision `pass`; exact QA approval accepted and fresh-session evidence deferred to UAT |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Official Copilot plugin overview | `https://docs.github.com/en/copilot/concepts/agents/about-plugins` | App, CLI, cloud-agent and marketplace plugin availability | `direct` |
| Official Copilot plugin reference | `https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference` | Manifest, component, installation, cache and precedence contract | `direct` |
| Installed Copilot app 1.1.14 | `/Applications/GitHub Copilot.app` | Locally installed application and bundled SDK capability surface | `direct` |
| Generated Copilot profile | `create-agdf/generated/plugins/copilot/agdf/**` | Ten prefixed skills, semantic inventory, Copilot hook and exact runtime with other host surfaces absent | `direct` |
| Canonical plugin definition | `plugin/meta/agdf-plugin.definition.json` | Current cross-surface identity, skill prefix and interaction metadata | `direct` |
| Existing generated runtime owner | `create-agdf/scripts/sync-plugin-runtime.js` | Exact-version local validator composition | `direct` |
| Brownfield Review | `.agdf/control/artefacts/agdf-copilot-plugin-integration/BROWNFIELD_REVIEW.md` | Existing owners, reuse strategy, impacts and Structured Depth decision | `direct` |
| UX Intent Definition | `.agdf/control/artefacts/agdf-copilot-plugin-integration/UX_INTENT_DEFINITION.md` | Working modes, visible state authority, activation, blockers and recovery | `direct` |
| Approved PRD revision 3 | `.agdf/control/artefacts/agdf-copilot-plugin-integration/PRD.md` | Product scope plus measurable single-projection and semantic inventory requirements | `direct` |
| Approved Solution Design revision 3 | `.agdf/control/artefacts/agdf-copilot-plugin-integration/SD.md` | Host-specific build profile, semantic inventory, marketplace isolation, provenance and regression design | `direct` |
| Approved Task and Test Plan revision 3 | `.agdf/control/artefacts/agdf-copilot-plugin-integration/TP.md` | Thirteen tasks, deterministic failure fixtures, coexistence checks and bounded host observations | `direct` |
| Brownfield Analysis revision 3 | `.agdf/control/artefacts/agdf-copilot-plugin-integration/BROWNFIELD_ANALYSIS.md` | Existing-owner fit, runtime closure, transaction reuse, regressions and stop conditions | `direct` |
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
| A Copilot bundle duplicates canonical skills, runtime, installer or metadata owners. | `mitigated` | Copilot profile inventory and exact baseline fail closed on duplicate, excluded, stale, unmapped or growing payloads. |
| Copilot plugin installation or permissions are mistaken for AGDF gate approval. | `warn` | Preserve `interaction.md` and exact approval revalidation as the sole authority. |
| Retirement deletes or rewrites existing user-owned Copilot repository files. | `warn` | Stop generating and supporting the projection without automatically deleting existing files. |
| Repository or package evidence is overstated as loaded app behavior. | `warn` | Maintain separate source, bundle, installed-root, fresh-session and human-UAT evidence. |
| Native input or hook support drifts across the Copilot app, CLI and cloud agent. | `warn` | Start with the supported common subset and gate stronger claims on direct capability evidence. |

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-PUBLIC-PLUGIN-DISTRIBUTION`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: `CG-PUBLIC-PLUGIN-DISTRIBUTION` records the isolated profile, inventory, migration, installed 0.14.1 evidence and evidence-plane boundaries.

## Knowledge Persistence Decision

- memory_target: `context_graph`
- memory_reason: The host-specific payload, semantic inventory and isolated Marketplace are reusable distribution invariants.
- memory_refs: `.agdf/control/CONTEXT_GRAPH.md#CG-PUBLIC-PLUGIN-DISTRIBUTION`

## Closeout

- delivered: Copilot-only generated payload, semantic inventory and exact baseline, profile-aware validation and provenance, independent atomic Marketplace, safe predecessor migration, same-version refresh, coexistence tests, documentation, real 0.14.1 installation and mandatory review passes.
- not_delivered: UAT approval, public Marketplace publication, cross-platform parity, VCS and release.
- verification_performed: Two deterministic builds; complete smoke; package, Runtime Integrity, negative profile, coexistence and recovery tests; 66/66 skill evals; Pages checks; official CLI Marketplace and plugin read-back; installed-root validator; `git diff --check`.
- unverified: Fresh post-final-refresh Copilot app loading and native Linux/Windows parity.
- next_allowed_action: Install the current Copilot payload, restart into a fresh session and capture bounded UAT evidence.
- quality_outlook: Preserve the distinction between installed state and fresh-session loaded behavior.
