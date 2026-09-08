# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-copilot-plugin-integration
- lifecycle: active
- revision: 40
- revision_id: 0F76B326-6783-4469-A9E2-38BA35209C31
- started_at: 2026-08-28
- mode: `structured_delivery`
- current_gate: `QA`
- decision: `revise`
- owner: Arndt Gold

## Objective

Make the installable AGDF plugin the only supported GitHub Copilot integration while preserving
repository-owned governance, exact approval authority and honest host-evidence boundaries.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The latest loaded Copilot `qa-gate` observation still rendered English in a German conversation and a later model translation altered the canonical card. The common function description, binding grammar and all ten executable skills now carry the same current-conversation language rule. Supported regional variants normalize to `de` or `en`; unsupported tags render through the complete English pack; a missing value remains invalid before dispatch. The resolved language reaches target rendering, gate evaluation and skill continuation. One uninterrupted final smoke passes with 83/83 evals and 467 package files. Generated, staged and installed `qa-gate`, runtime and locale bytes match; refreshed AGDF 0.14.5 directly renders complete English and German target and selected-run cards without diagnostics. |
| What is approved? | UR revision 2, PRD revision 3, SD revision 4 and TP revision 4 are approved. Earlier QA approvals are historical only. |
| What is missing? | A fully restarted Copilot session proving that `qa-gate` selects `de` from the German conversation before dispatch; repository-bound and optional consented SessionStart observations remain separate. |
| What is the next allowed action? | Fully quit and reopen GitHub Copilot, start a new German repo-less session and invoke `agdf-qa-gate`. |
| What is explicitly forbidden right now? | QA pass or approval request, UAT approval, publication, release and automatic VCS actions. |

## Source And Scope State

- normative_instruction_source: `plugin/meta/agdf-agent-router.md` and its focused Runtime Contract modules
- multi_scope_state: `clear`
- active_scope_evidence: Approved UR revision 2 plus completed Brownfield Review and UX Intent Definition revision 2 define the plugin-only Copilot scope.
- competing_scope_lines: Existing Codex, Claude, OpenCode, public-distribution and installation-consent runs remain independent; no existing Copilot plugin delivery run was found.
- branch_workspace_evidence: Branch `main` at committed documentation baseline `599b23b`; the current diff contains the cross-skill conversation-language correction, its deterministic evidence, installed-state evidence and this run revision. The pre-existing untracked host-compatibility observation belongs to the separate MCP lifecycle run.
- branch_workspace_scope_effect: `supports`

## Run Status Card

This is a compact projection of the control state. It does not replace gate-check, QA, OR or approvals.

| Run status | Value |
|---|---|
| Status | Common conversation-language correction is installed; fresh loaded Copilot verification remains open |
| Current gate | QA |
| Allowed now | Fully restart Copilot and invoke `agdf-qa-gate` in a new German repo-less session; continue repository-bound evidence afterward. |
| Blocked by | Host-evidence obligations CPI-TPR12-02 and CPI-TPR11-01. |
| Missing approval | none |
| Next step | Fully restart Copilot and verify that the first `qa-gate` target card is complete and German without translation. |
| Quality outlook | Prove current-conversation language selection and preserve verbatim canonical-card transfer in the installed Copilot host. |

## Approvals

Valid approval format for new runs: `Approval: <GateName>`.

| Gate | Status | Evidence |
|---|---|---|
| UR | `approved` | Exact `Approval: UR` accepted for durable revision 2 on 2026-08-28 after revalidation. |
| PRD | `approved` | Exact `Approval: PRD` accepted for revision 3 on 2026-08-30 after same-run, same-gate and revision revalidation. |
| SD | `approved` | Exact `Approval: SD` accepted for revision 4 on 2026-09-03 after same-target, same-run, same-gate and revision revalidation. |
| TP | `approved` | Exact `Approval: TP` accepted for revision 4 on 2026-09-03 after same-target, same-run, same-gate and revision revalidation. |
| QA | `revise` | Revision 16 consumes the complete missing, unsupported and regional language correction and retains the fresh loaded-host evidence obligation; no approval is requested. |
| UAT | `revise` | Target and concise-output behavior pass, but the latest `qa-gate` session remains English; corrected installed behavior is not yet observed after restart. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-copilot-plugin-integration/UR.md` | `approved` | Revision 2 defines the plugin-only outcome and canonical `copilot` install command. |
| Brownfield Review | `.agdf/control/artefacts/agdf-copilot-plugin-integration/BROWNFIELD_REVIEW.md` | `done` | Revision 2 maps command, generator, migration, documentation and test owners; Structured Delivery retained. |
| Verified Change |  | `missing` | No mode decision exists. |
| PRD | `.agdf/control/artefacts/agdf-copilot-plugin-integration/PRD.md` | `approved` | Revision 3 adds a Copilot-specific single-projection artifact and fail-closed semantic inventory. |
| SD | `.agdf/control/artefacts/agdf-copilot-plugin-integration/SD.md` | `approved` | Revision 4 adds ordered target binding, physical host-context classification, fail-closed activation and honest instruction-only enforcement. |
| TP | `.agdf/control/artefacts/agdf-copilot-plugin-integration/TP.md` | `approved` | Revision 4 adds six target-binding tasks, six deterministic suites and separate repo-less and repository-bound host observations. |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-copilot-plugin-integration/BROWNFIELD_ANALYSIS.md` | `done` | Revision 4 passes with one CLI resolver, existing validator dispatch, presentation owner and SessionStart generator. |
| CD+Tests | `.agdf/control/artefacts/agdf-copilot-plugin-integration/HOST_EVIDENCE.md` | `done` | User screenshot, complete language contract, final aggregate, refreshed installed 0.14.5 and exact Skill/runtime/locale identity are recorded; fresh-session evidence remains separate. |
| TP Review | `.agdf/control/artefacts/agdf-copilot-plugin-integration/TASK_PLAN_REVIEW.md` | `revise` | Revision 15 records current 15/19 overall coverage, the complete English/German edge matrix and the open loaded `qa-gate` language obligation. |
| Clean Review | `.agdf/control/artefacts/agdf-copilot-plugin-integration/CLEAN_IMPLEMENTATION_REVIEW.md` | `done` | Revision 14 passes for one common function-owned language rule and one existing locale owner with a bounded complete-English fallback. |
| CR | `.agdf/control/artefacts/agdf-copilot-plugin-integration/CODE_REVIEW.md` | `done` | Revision 14 passes after language normalization, fallback, propagation and installed-runtime regression review. |
| QA | `.agdf/control/artefacts/agdf-copilot-plugin-integration/QA_REPORT.md` | `revise` | Revision 16 retains the fresh loaded German `qa-gate` and repository-bound evidence obligations. |
| OR | `.agdf/control/artefacts/agdf-copilot-plugin-integration/OR.md` | `done` | Current installer correction is installed; QA revise and next desktop observation remain explicit. |

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
| UAT GeneralChat observation | `reveals` | SD revision 3 | instruction-only target contract did not prevent the chat working directory from becoming false repository authority |
| SD revision 4 | `revises` | SD revision 3 | adds a code-owned target preflight and separates unresolved target from ungoverned repository state |
| SD revision 4 | `derived_from` | PRD revision 3 | preserves plugin-only scope while hardening the approved active repository and ungoverned repository modes |
| SD revision 4 | `approved_by` | `Approval: SD` | exact approval accepted on 2026-09-03 after same-target, same-run, same-gate and revision revalidation |
| SD | `derived_from` | PRD | canonical current relationship for approved revision 4 |
| TP revision 1 | `superseded_by` | TP revision 2 | former complementary repository plan retained as historical evidence |
| TP revision 2 | `derived_from` | SD revision 2 | eleven tasks cover command, scaffold, generation, lifecycle, docs, Pages, verification and reviews |
| TP revision 2 | `approved_by` | `Approval: TP` | exact approval accepted on 2026-08-30 after same-run, same-gate and revision revalidation |
| TP revision 3 | `revises` | TP revision 2 | adds host-profile build, semantic inventory, negative fixtures, isolated marketplace and coexistence tasks |
| TP revision 3 | `derived_from` | SD revision 3 | maps all revised design decisions to implementation, deterministic tests and host evidence |
| TP revision 3 | `approved_by` | `Approval: TP` | exact approval accepted on 2026-08-30 after same-run, same-gate and revision revalidation |
| TP revision 4 | `revises` | TP revision 3 | adds code-owned target preflight, GeneralChat suppression, SessionStart context classification and two-path host UAT |
| TP revision 4 | `derived_from` | SD revision 4 | maps all target-binding decisions to implementation, tests, propagation and host evidence |
| TP revision 4 | `approved_by` | `Approval: TP` | exact approval accepted on 2026-09-03 after same-target, same-run, same-gate and revision revalidation |
| TP | `derived_from` | SD | canonical current relationship for approved revision 4 |
| Brownfield Analysis revision 2 | `prepares` | TP revision 2 | historical pass for the previous scope |
| Brownfield Analysis revision 3 | `prepares` | TP revision 3 | pass; reuse path, runtime closure, isolated transaction and regression boundaries confirmed |
| Brownfield Analysis revision 4 | `prepares` | TP revision 4 | pass; existing CLI, runtime, interaction and generated-profile owners support the target-binding correction without parallel authority |
| Task Plan Review revision 8 | `tests` | TP revision 4 | revise; 16/19 fully done and three fresh-host evidence tasks partial |
| Clean Implementation Review revision 7 | `reviews` | CD+Tests revision 4 | pass; one primary solution and no parallel target authority |
| Code Review revision 7 | `reviews` | CD+Tests revision 4 | pass; no open code finding after edge-case corrections |
| QA Report revision 9 | `tests` | TP revision 4 | revise; fresh repo-less and repository-bound Copilot evidence remains open |
| Fresh repo-less Copilot observation | `reveals` | QA Report revision 9 | target classification passes, but a prior-UR and approval branch leaks after unresolved |
| Task Plan Review revision 9 | `tests` | TP revision 4 | revise; 16/19 fully done and refreshed host evidence remains open |
| Clean Implementation Review revision 8 | `reviews` | CD+Tests revision 5 | pass; unresolved is terminal in the existing target owner without a shim |
| Code Review revision 8 | `reviews` | CD+Tests revision 5 | pass; no open code finding after early-return correction |
| QA Report revision 10 | `revises` | QA Report revision 9 | observed instruction-order defect is resolved in installed bytes; second restarted observation remains open |
| Second repo-less Copilot observation | `reveals` | QA Report revision 10 | terminal stopping passes; forced `current_repository`, English fallback and extra narration remain incorrect |
| Task Plan Review revision 10 | `tests` | TP revision 4 | revise; 16/19 fully done and final refreshed host evidence remains open |
| Clean Implementation Review revision 9 | `reviews` | CD+Tests revision 6 | pass; native no-target resolver path replaces forced target authority without a shim |
| Code Review revision 9 | `reviews` | CD+Tests revision 6 | pass; no open code finding after invocation, locale and concise-output corrections |
| QA Report revision 11 | `revises` | QA Report revision 10 | second host defect is resolved in installed bytes; third restarted observation remains open |
| Third repo-less Copilot observation | `reveals` | QA Report revision 11 | target and concise-output behavior pass; German conversation still renders in English |
| Task Plan Review revision 11 | `tests` | TP revision 4 | revise; 16/19 fully done and explicit locale host evidence remains open |
| Clean Implementation Review revision 10 | `reviews` | CD+Tests revision 7 | pass; existing conversation evidence drives the canonical locale path without a runtime shim |
| Code Review revision 10 | `reviews` | CD+Tests revision 7 | pass; no open code finding after literal German locale and same-language question correction |
| QA Report revision 12 | `revises` | QA Report revision 11 | third host locale defect is resolved in installed bytes; fourth restarted observation remains open |
| Loaded `qa-gate` language observation | `reveals` | QA Report revision 13 | the earlier locale precision was `gate-check`-specific; `qa-gate` still selected English and later model translation altered the canonical card |
| Task Plan Review revision 15 | `tests` | TP revision 4 | revise; complete language implementation and selected-run localization are verified, while fresh loaded-host proof remains open |
| Clean Implementation Review revision 14 | `reviews` | current correction | pass; one semantic function parameter and the existing locale resolver own normalization and bounded English fallback without a host-specific shim |
| Code Review revision 14 | `reviews` | current correction | pass; common binding, ten skill projections, language propagation and selected-run localization are locked by focused and aggregate tests |
| QA Report revision 16 | `revises` | QA Report revision 15 | source, generated, installed and selected-run language evidence pass; restarted Copilot proof remains open |
| QA Report revision 2 | `approved_by` | `Approval: QA` | exact approval accepted on 2026-08-30 after same-run, same-gate and revision revalidation |
| Task Plan Review revision 3 | `tests` | TP revision 3 | pass; 13/13 tasks fully done |
| Clean Implementation Review revision 3 | `reviews` | CD+Tests revision 3 | pass; one generated profile and bounded compatibility migration |
| Code Review revision 3 | `reviews` | CD+Tests revision 3 | pass; no open findings after host-discovered defects were resolved |
| QA Report revision 3 | `tests` | TP revision 3 | technical decision `pass` |
| QA Report revision 3 | `approved_by` | `Approval: QA` | exact approval accepted on 2026-09-01 after same-run, same-gate and revision revalidation |
| QA Report revision 4 | `revises` | QA Report revision 3 | negative macOS UAT reopens launcher-unavailable fallback behavior for correction and renewed evidence |
| QA Report revision 5 | `revises` | QA Report revision 4 | implementation correction and focused reviews pass; real-host and aggregate evidence remain open |
| QA Report revision 6 | `revises` | QA Report revision 5 | corrected real installation and installed-root validation pass; aggregate evidence remains open |
| Task Plan Review revision 6 | `tests` | TP revision 3 | pass; 13/13 tasks fully done and aggregate evidence gap resolved |
| Clean Implementation Review revision 5 | `reviews` | CD+Tests 2026-09-03 revision | pass; one locale owner, one renderer and one event-cwd hook path |
| Code Review revision 5 | `reviews` | CD+Tests 2026-09-03 revision | pass; no open finding |
| QA Report revision 7 | `revises` | QA Report revision 6 | locale and SessionStart findings resolved; complete smoke and installed 0.14.5 evidence pass |
| QA Report revision 7 | `approved_by` | `Approval: QA` | exact approval accepted on 2026-09-03 after same-run, same-gate and revision revalidation |
| QA Report revision 8 | `revises` | QA Report revision 7 | adds complete QA-to-UAT operational localization, final payload baseline and refreshed installed-root evidence |
| QA Report revision 8 | `approved_by` | `Approval: QA` | exact approval accepted on 2026-09-03 after same-run, same-gate and revision revalidation |
| UX Intent Definition | `informs` | PRD | ready structured input incorporated into PRD |
| PRD revision 1 | `derived_from` | UR revision 1 | historical and superseded for future work |
| SD revision 1 | `derived_from` | PRD revision 1 | historical and superseded for future work |
| TP revision 1 | `derived_from` | SD revision 1 | historical and superseded for future work |
| Brownfield Analysis | `prepares` | TP | passed reuse and impact analysis before implementation |
| QA_REPORT | `tests` | TP | revision 8 decides pass and exact QA approval is recorded |

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
| Brownfield Analysis revision 4 | `.agdf/control/artefacts/agdf-copilot-plugin-integration/BROWNFIELD_ANALYSIS.md` | Target resolver, validator dispatch, skill routing, SessionStart classification, regressions and stop conditions | `direct` |
| Copilot host evidence | `.agdf/control/artefacts/agdf-copilot-plugin-integration/HOST_EVIDENCE.md` | Official npm CLI install, exact version, ten installed skills and persistent Copilot plugin state | `direct` |
| Full deterministic suite | `npm --prefix create-agdf run smoke-test` | Release build, lifecycle, integrity, interaction, routing, 66 skill evals and regressions | `direct` |
| Negative Copilot install UAT | real `npm run install:copilot` on macOS, 2026-09-02 | present non-functional launcher is misclassified as verification failure and bypasses the npm fallback | `direct` |
| Isolated pinned fallback probe | `npm exec --yes --package=@github/copilot@1.0.80 -- copilot --version` with isolated cache, 2026-09-02 | official pinned fallback remains executable and reports version 1.0.80 | `direct` |
| Copilot locale and SessionStart UAT | Copilot feedback, 2026-09-03 | German mixed-value defect, stale/mismatched SessionStart config context, aggregate 37-finding boundary and selected-run 0-finding result | `direct` |
| Complete corrected smoke | `npm --prefix create-agdf run smoke-test`, 2026-09-03 | release, package, lifecycle, Runtime Integrity, 67/67 skill evals and Copilot routing | `direct` |
| Refreshed installed 0.14.5 | `npm run install:copilot` plus installed validator and digest checks, 2026-09-03 | verified version, matched provenance, localized installed status card and exact generated/installed SessionStart bytes | `direct` |
| Repo-less Copilot GeneralChat UAT | Copilot session `4ef44ec1-0225-4756-98d4-12813789457b`, 2026-09-03 | command discovery passed, repository detection was absent, internal chat cwd was misclassified and an unrelated UR was invented | `direct` |
| Fresh unresolved early-return UAT | User-provided restarted Copilot GeneralChat, 2026-09-03 | `target_unresolved` classification passed; a conditional prior-UR, `BLOCKED` and `Approval: UR` branch incorrectly followed | `direct` |
| Final context-only target build | complete smoke, 70/70 evals and refreshed installed 0.14.5 profile, 2026-09-03 | no-target invocation, literal German conversation locale and same-language concise follow-up are implemented; profile contains 82 files and 604901 bytes; fourth loaded-session behavior remains unverified | `direct` |
| Cross-skill language correction | user screenshot, function/binding/projection and selected-run presentation tests, 83/83 evals, package and installed-root verification, 2026-09-07 | `presentation_language` now means current conversation language across all ten skills; installed `qa-gate --language de` renders the complete German target card and installed gate-check renders the complete German selected-run status without diagnostics | direct loaded-host negative plus deterministic and installed-root positive evidence; refreshed loaded-host result pending |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Final German context-only repo-less and repository-bound Copilot evidence | `warn` | Restart Copilot, verify the complete German `qa-gate` `no_reliable_target` card immediately, then run the repository-bound path separately. |
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
| A host working directory is mistaken for task-target or governance authority. | `warn` | Require the code-owned target preflight before doctor, run selection or gate evaluation and expose `instruction_only` honestly. |
| A host infers presentation language from English skill, runtime or UI text instead of the current conversation. | `warn` | Keep current-conversation meaning in the semantic function description and binding grammar, project it into every executable skill and require fresh loaded-host evidence. |

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-PUBLIC-PLUGIN-DISTRIBUTION`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: `CG-PUBLIC-PLUGIN-DISTRIBUTION` records the isolated profile, inventory, migration, installed 0.14.5 evidence and evidence-plane boundaries.

## Knowledge Persistence Decision

- memory_target: `context_graph`
- memory_reason: The host-specific payload, semantic inventory and isolated Marketplace are reusable distribution invariants.
- memory_refs: `.agdf/control/CONTEXT_GRAPH.md#CG-PUBLIC-PLUGIN-DISTRIBUTION`

## Closeout

- delivered: Previous Copilot-only payload and lifecycle implementation remains historical evidence; SD revision 4 and TP revision 4 are approved for the target-binding correction.
- not_delivered: Refreshed loaded German `qa-gate` and repository-bound Copilot evidence, QA pass/approval, UAT approval, public Marketplace publication, cross-platform parity, VCS and release.
- verification_performed: User-provided loaded-host negative evidence, function/binding/projection and selected-run presentation tests, 83/83 deterministic skill evals, package/runtime/installer suites, exact generated-staged-installed `qa-gate` and locale identity, German installed target/status output and refreshed Copilot 0.14.5 installation.
- unverified: Corrected loaded German `qa-gate` behavior after full restart, repository-bound Copilot behavior and native Linux/Windows parity.
- next_allowed_action: Fully restart Copilot, start a new repo-less German GeneralChat and invoke `agdf-qa-gate`; capture the repository-bound path separately afterward.
- quality_outlook: Prove that the loaded host derives language from the current conversation and transmits the canonical card verbatim.

## 2026-09-05 Installer Correction Closeout

The final normal installation is successful. See [OR](../../artefacts/agdf-copilot-plugin-integration/OR.md) and the dated HOST_EVIDENCE addendum. Canonical Git source replaces the temporary recovery registration; installation and fresh SDK discovery are verified. Current QA is Revision 15 revise. Previous QA approvals remain historical. The next action is a full Desktop restart and fresh-session skill visibility observation.
