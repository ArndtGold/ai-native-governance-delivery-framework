# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: installer-output-parity
- lifecycle: active
- revision: 33
- revision_id: 3e517e4a-53d5-4e17-bf29-585d5cf6e00d
- mode: structured_slice
- current_gate: OR
- owner: agent

## Objective

Make AGDF installation, activation, verification, first use and opt-out one coherent journey while
keeping technical health distinct from delivery gate state.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The current installer verifies versions reliably, but success output, technical health, repository delivery state, first-run orientation, CLI discovery, opt-out and `codex-repo` completion are fragmented. The loaded Codex question tool decorates its recommended option while the canonical plugin definition declares exact-value transport, so safe fallback behavior and the advertised native-button capability diverge. OpenCode already provides the richest status baseline. Claude installation also catches every failure as a possible missing Claude CLI even when the upstream marketplace error identifies Git as missing or unsafe. |
| What is approved? | Revision-2 UR, multi-surface PRD, solution design, revision-4 task plan, passing revision-4 QA report and UAT are approved exactly. |
| What is missing? | Real host restart/activation evidence remains unverified; no VCS handoff has been requested. |
| What is the next allowed action? | Retain the UAT limitation in any handoff; perform separately authorized live-host UAT only if that proof is required. |
| What is explicitly forbidden right now? | Automatic release, push, PR or commit; real host activation must not be claimed without evidence. |

## Source And Scope State

- normative_instruction_source: `.agdf/control/artefacts/installer-output-parity/UR.md`; AGDF Runtime Contract
- multi_scope_state: clear
- active_scope_evidence: User-prioritized P0/P1/P2 installation UX outcomes; loaded Codex question-tool contract; canonical adapter metadata; current public docs and CLI behavior; native Windows Claude failure; installer smoke tests
- competing_scope_lines: `agdf-human-decision-surface` owns approval transport, native attempt evidence and fallback policy and remains at UAT revise; this run may consume/link but not reimplement it. `agdf-state-orientation` owns status/narration projection and requires section-level revalidation for the read-only branch.
- branch_workspace_evidence: Existing unrelated working-tree changes remain outside this run; this run owns its UR, Brownfield Review, PRD, SD, TP, run state and backlog pointer.
- branch_workspace_scope_effect: Any later implementation must isolate installer code and focused tests from unrelated changes.

## Run Status Card

| Run status | Value |
|---|---|
| Status | open |
| Current gate | OR |
| Allowed now | Prepare a delivery handoff only when separately requested; retain the UAT limitation |
| Blocked by | none |
| Missing approval | none |
| Next gate after approval | none |
| Allowed after approval | none |
| Next step | Await an explicit delivery-handoff request or separately authorized live-host UAT |
| Quality outlook | Prove one English card contract across all passed coding-agent surfaces while preserving stable machine values and truthful activation/delivery separation |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Revision 2 received exact `Approval: UR` on 2026-07-17 after same-run, same-gate and revision-20 revalidation. |
| PRD | approved | Revision 2 received exact `Approval: PRD` on 2026-07-17 after same-run, same-gate and revision-24 revalidation. |
| SD | approved | Revision 2 received exact `Approval: SD` on 2026-07-17 after same-run, same-gate and revision-25 revalidation. |
| TP | approved | Revision 4 received exact `Approval: TP` on 2026-07-17 after same-run, same-gate and revision-28 revalidation. |
| QA | approved | TP Revision 4 QA report passed and received exact `Approval: QA` on 2026-07-17 after same-run, same-gate and revision-30 revalidation. |
| UAT | approved | Exact `Approval: UAT` received on 2026-07-17 after same-run, same-gate and revision-31 revalidation. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/installer-output-parity/UR.md` | approved | Revision 2 adds the English-default CLI and improved Success Card delta; exact approval recorded on 2026-07-17 |
| Brownfield Review | `.agdf/control/artefacts/installer-output-parity/BROWNFIELD_REVIEW.md` | done | Revision-2 delta selects a bounded Structured Slice and existing-owner reuse |
| PRD | `.agdf/control/artefacts/installer-output-parity/PRD.md` | approved | Revision-2 English multi-surface CLI and Success Card contract approved exactly on 2026-07-17 |
| SD | `.agdf/control/artefacts/installer-output-parity/SD.md` | approved | Revision-2 shared surface/result/renderer and verbose-output design approved exactly on 2026-07-17 |
| TP | `.agdf/control/artefacts/installer-output-parity/TP.md` | approved | Revision-4 corrected focused CLI verification command approved exactly on 2026-07-17 |
| Brownfield Analysis | `.agdf/control/artefacts/installer-output-parity/BROWNFIELD_ANALYSIS.md` | done | Revision-4 analysis passes; existing-owner implementation path is clear |
| CD+Tests | `.agdf/control/artefacts/installer-output-parity/CD_TESTS.md` | done | TP Revision 4 MSC-01 through MSC-08 implemented; focused, aggregate, bootstrap and package smoke evidence passes |
| TP Review | `.agdf/control/artefacts/installer-output-parity/TP_REVIEW.md` | done | TP Revision 4: 8/8 MSC tasks fully done; host activation remains UAT evidence |
| Clean Implementation Review | `.agdf/control/artefacts/installer-output-parity/CLEAN_IMPLEMENTATION_REVIEW.md` | done | TP Revision 4 pass; existing owners reused without a second SoT |
| CR | `.agdf/control/artefacts/installer-output-parity/CODE_REVIEW.md` | done | TP Revision 4 pass; no meaningful finding remains in reviewed scope |
| QA | `.agdf/control/artefacts/installer-output-parity/QA_REPORT.md` | pass | TP Revision 4 qa-gate pass; exact approval recorded on 2026-07-17 |
| UAT | `.agdf/control/artefacts/installer-output-parity/UAT_REPORT.md` | revise | non-mutating scenarios pass after one remediation; real activation and restart remain unverified |
| OR | `.agdf/control/artefacts/installer-output-parity/OR.md` | revise | all gates approved; retain the UAT host-evidence limitation before any delivery handoff |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Prioritized installation UX outcomes | User requests on 2026-07-16 and 2026-07-17 | Success Card, English CLI default, installation/activation/delivery split, read-only orientation, README/CLI simplification, lifecycle commands and `codex-repo` automation | direct |
| Codex native approval transport gap | Current Codex `request_user_input` schema; `plugin/meta/agdf-plugin.definition.json`; `plugin/meta/contracts/interaction.md` | Host decorates the recommended label while canonical metadata declares exact-value transport; exact text remains the safe authority path | direct |
| Native Windows Claude failure | User-provided PowerShell output on 2026-07-16 | Marketplace refresh rejects Git as missing or unsafe while `git` itself is callable | direct |
| Current installer and status owners | `create-agdf/lib/installers/`; `create-agdf/lib/cli/`; `create-agdf/lib/control-evaluation/` | Existing install, command and status behavior | direct |
| Public onboarding owners | `README.md`; `INSTALL.md`; `create-agdf/README.md` | Current product positioning and command hierarchy | direct |
| Installer smoke tests | `create-agdf/scripts/smoke-test.js`; `create-agdf/scripts/release-bootstrap-smoke-test.js` | Existing deterministic success and version checks | direct |
| Brownfield Review | `.agdf/control/artefacts/installer-output-parity/BROWNFIELD_REVIEW.md` | Existing coverage, owners, reuse strategy, risks and Structured Delivery decision | direct |
| Solution Design | `.agdf/control/artefacts/installer-output-parity/SD.md` | Lifecycle result model, status composition, safe mutation adapters, approval capability truth and verification design | direct |
| Task Plan | `.agdf/control/artefacts/installer-output-parity/TP.md` | Task-level implementation, acceptance traceability, dependency order, regression checks and UAT boundary | direct |
| Pre-implementation Brownfield Analysis | `.agdf/control/artefacts/installer-output-parity/BROWNFIELD_ANALYSIS.md` | Existing owners, reuse path, overlap, drift, destructive-operation risk and required TP revision | direct |
| Competing interaction owner | `.agdf/control/runs/agdf-human-decision-surface/RUN_STATE.md`; its `TP.md` and `UAT_REPORT.md` | Canonical approval transport and fallback are already owned; live UAT remains revise | direct |
| Implementation and tests | `.agdf/control/artefacts/installer-output-parity/CD_TESTS.md` | Delivered lifecycle, status, mutation, onboarding and interaction-integration scope with deterministic regression evidence | direct |
| Mandatory reviews | `TP_REVIEW.md`; `CLEAN_IMPLEMENTATION_REVIEW.md`; `CODE_REVIEW.md` | TP coverage, solution integrity and actual-diff review before QA | direct |
| QA decision | `.agdf/control/artefacts/installer-output-parity/QA_REPORT.md` | `qa-gate` pass with deferred live UAT kept explicit | direct |
| Non-mutating UAT | `.agdf/control/artefacts/installer-output-parity/UAT_REPORT.md` | Exact-text fallback, isolated setup/status/disable/preview evidence and remaining host gaps | direct |

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: Revision 2 is bounded to the existing lifecycle result/presentation boundary, CLI
  call sites, scaffold completion and focused tests. It changes public semantics but does not reopen
  destructive lifecycle operations or approval authority.
- evidence: `.agdf/control/artefacts/installer-output-parity/BROWNFIELD_REVIEW.md` revision 2;
  `create-agdf/lib/lifecycle/`; `create-agdf/lib/cli/application.js`;
  `create-agdf/scripts/lifecycle-test.js`; release-bootstrap smoke.
- transparency_note: Existing Structured Delivery artefacts remain historical baseline evidence;
  only concise PRD, SD, TP, implementation and QA deltas are reopened.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Revision-2 exact user approval recorded on 2026-07-17 after revision-20 revalidation. |
| Brownfield Review | sizes | `structured_delivery` | `.agdf/control/artefacts/installer-output-parity/BROWNFIELD_REVIEW.md` |
| PRD | derived_from | UR | `.agdf/control/artefacts/installer-output-parity/PRD.md` |
| PRD | approved_by | `Approval: PRD` | Revision-2 exact user approval recorded on 2026-07-17 after revision-24 revalidation. |
| SD | derived_from | PRD | `.agdf/control/artefacts/installer-output-parity/SD.md` |
| SD | approved_by | `Approval: SD` | Revision-2 exact user approval recorded on 2026-07-17 after revision-25 revalidation. |
| TP | derived_from | SD | `.agdf/control/artefacts/installer-output-parity/TP.md` |
| TP revision 3 | approved_by | `Approval: TP` | Exact user approval recorded on 2026-07-17 after revision-26 revalidation. |
| TP revision 1 | approved_by | `Approval: TP` | Exact user approval recorded on 2026-07-16; superseded by Brownfield ownership finding. |
| Brownfield Analysis | verifies | TP revision 1 | Decision `revise`; `.agdf/control/artefacts/installer-output-parity/BROWNFIELD_ANALYSIS.md` |
| TP revision 2 | derived_from | Brownfield Analysis | Removes parallel interaction ownership and preserves linked UAT dependency. |
| TP revision 2 | approved_by | `Approval: TP` | Exact user approval recorded on 2026-07-16 after revalidation. |
| Brownfield Analysis revision 2 | verifies | TP revision 2 | Decision `pass`; clean reuse path confirmed before CD+Tests. |
| CD+Tests | implements | TP revision 2 | IOP-01 through IOP-12 delivered with focused and aggregate test evidence. |
| TP Review | verifies | CD+Tests | 12/13 fully done; IOP-13 remains explicitly post-QA. |
| Clean Implementation Review | verifies | CD+Tests | Pass; no avoidable fallback or parallel owner remains. |
| Code Review | verifies | implementation diff | Pass; no meaningful correctness, safety, compatibility or maintainability finding remains. |
| QA_REPORT | tests | TP | `.agdf/control/artefacts/installer-output-parity/QA_REPORT.md`; pass decision with IOP-13 deferred to UAT. |
| QA_REPORT | approved_by | `Approval: QA` | Exact approval provided on 2026-07-16 after same-run, same-gate, revision 16 and QA-report revalidation. |
| UAT | validates | QA-approved implementation | Revise: non-mutating path exposed one status-action defect, which was remediated; host activation/restart remain unverified. |
| QA_REPORT delta | tests | TP and UAT remediation | Pass: focused and aggregate evidence plus renewed mandatory reviews cover the post-QA code delta. |
| QA_REPORT delta | approved_by | `Approval: QA` | Renewed exact approval provided on 2026-07-17 after same-run, same-gate, revision 18 and delta-report revalidation. |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-CREATE-AGDF-CLI-COMPOSITION`; `CG-RUN-STATUS-CARD`
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Existing nodes were updated for lifecycle status, CLI composition and the linked interaction-owner boundary; `CD_TESTS.md` and aggregate regression evidence verify the final implementation.

## Closeout

- next_allowed_action: Await an explicit delivery-handoff request or separately authorized live-host UAT; do not perform VCS actions automatically.
- quality_outlook: Keep one English lifecycle card across Codex, Claude Code, OpenCode and GitHub Copilot without coupling activation state to delivery authority or changing project chat/artefact localization.
