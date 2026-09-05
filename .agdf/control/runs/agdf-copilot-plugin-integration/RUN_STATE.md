# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-copilot-plugin-integration
- lifecycle: active
- revision: 37
- revision_id: 80043768-ee06-46c1-a2b4-ddbbf4e9df68
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
| What is known? | The permanent normal installer now succeeds using canonical Git transport. Generated, staged and installed 0.14.5 match; all ten skills are found globally and in a fresh SDK session. |
| What is approved? | UR revision 2, PRD revision 3, SD revision 4 and TP revision 4 are approved. Earlier QA approvals are historical only. |
| What is missing? | Visual discovery after fully restarting Desktop, followed by the existing German repo-less and repository-bound model observations. |
| What is the next allowed action? | Fully quit and reopen GitHub Copilot, start a fresh session and verify the ten AGDF skills. |
| What is explicitly forbidden right now? | QA pass or approval request, UAT approval, publication, release and automatic VCS actions. |

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
| Status | Permanent installer correction is installed; ten skills pass native discovery; visual Desktop verification remains open |
| Current gate | QA |
| Allowed now | Fully restart Copilot and verify skill visibility in a fresh session; continue the existing German task-target observations afterward. |
| Blocked by | Host-evidence obligations CPI-TPR12-02 and CPI-TPR11-01. |
| Missing approval | none |
| Next step | Fully restart Copilot and verify skill visibility in a fresh session; then continue the German target-routing retest. |
| Quality outlook | Prove both repo-less suppression and repository-bound gate selection in the installed Copilot host. |

## Approvals

Valid approval format for new runs: `Approval: <GateName>`.

| Gate | Status | Evidence |
|---|---|---|
| UR | `approved` | Exact `Approval: UR` accepted for durable revision 2 on 2026-08-28 after revalidation. |
| PRD | `approved` | Exact `Approval: PRD` accepted for revision 3 on 2026-08-30 after same-run, same-gate and revision revalidation. |
| SD | `approved` | Exact `Approval: SD` accepted for revision 4 on 2026-09-03 after same-target, same-run, same-gate and revision revalidation. |
| TP | `approved` | Exact `Approval: TP` accepted for revision 4 on 2026-09-03 after same-target, same-run, same-gate and revision revalidation. |
| QA | `revise` | Revision 13 consumes the permanent installer correction and open desktop/target-routing host evidence; no approval is requested. |
| UAT | `revise` | Target and concise-output behavior pass, but the third session remains English; final locale-corrected installed behavior is not yet observed. |

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
| CD+Tests | `.agdf/control/artefacts/agdf-copilot-plugin-integration/HOST_EVIDENCE.md` | `done` | Final smoke, installed 0.14.5, target matrix and byte identity are recorded; fresh-session evidence remains separate. |
| TP Review | `.agdf/control/artefacts/agdf-copilot-plugin-integration/TASK_PLAN_REVIEW.md` | `revise` | Revision 12 records final installer correction coverage and current 15/19 overall coverage with visible host obligations. |
| Clean Review | `.agdf/control/artefacts/agdf-copilot-plugin-integration/CLEAN_IMPLEMENTATION_REVIEW.md` | `done` | Revision 11 passes for the canonical transport and discovery correction. |
| CR | `.agdf/control/artefacts/agdf-copilot-plugin-integration/CODE_REVIEW.md` | `done` | Revision 11 passes after transactional recovery and discovery review. |
| QA | `.agdf/control/artefacts/agdf-copilot-plugin-integration/QA_REPORT.md` | `revise` | Revision 13 retains desktop discovery and existing German task-target evidence obligations. |
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

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Final German context-only repo-less and repository-bound Copilot evidence | `warn` | Restart Copilot, verify one `no_reliable_target` card and one short question, then run the repository-bound path separately. |
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
- not_delivered: Second fresh repo-less and repository-bound Copilot evidence, QA pass/approval, UAT approval, public Marketplace publication, cross-platform parity, VCS and release.
- verification_performed: Final complete smoke, 70/70 deterministic skill evals, focused target and SessionStart matrices, two fresh repo-less Copilot observations, exact German no-target validator output and refreshed installed 0.14.5 profile.
- unverified: Final loaded German context-only repo-less behavior, repository-bound Copilot behavior and native Linux/Windows parity.
- next_allowed_action: Fully restart Copilot, start a new repo-less GeneralChat and invoke `/agdf-gate-check`; capture the repository-bound path separately afterward.
- quality_outlook: Prove that the refreshed installed skill terminates unresolved responses before prior-UR, gate and approval branches.

## 2026-09-05 Installer Correction Closeout

The final normal installation is successful. See [OR](../../artefacts/agdf-copilot-plugin-integration/OR.md) and the dated HOST_EVIDENCE addendum. Canonical Git source replaces the temporary recovery registration; installation and fresh SDK discovery are verified. Current QA is Revision 13 revise. Previous QA approvals remain historical. The next action is a full Desktop restart and fresh-session skill visibility observation.
