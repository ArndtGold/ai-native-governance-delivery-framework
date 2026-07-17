# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: installer-output-parity
- lifecycle: active
- revision: 19
- revision_id: bc72be4a-52a3-43a8-adff-bb3a109e3873
- mode: structured_delivery
- current_gate: UAT
- owner: agent

## Objective

Make AGDF installation, activation, verification, first use and opt-out one coherent journey while
keeping technical health distinct from delivery gate state.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The current installer verifies versions reliably, but success output, technical health, repository delivery state, first-run orientation, CLI discovery, opt-out and `codex-repo` completion are fragmented. The loaded Codex question tool decorates its recommended option while the canonical plugin definition declares exact-value transport, so safe fallback behavior and the advertised native-button capability diverge. OpenCode already provides the richest status baseline. Claude installation also catches every failure as a possible missing Claude CLI even when the upstream marketplace error identifies Git as missing or unsafe. |
| What is approved? | UR, PRD, SD, TP revision 2 and the post-UAT QA delta are approved by exact user approvals. |
| What is missing? | Real Codex activation/restart evidence and exact `Approval: UAT`; the current UAT report remains revise. |
| What is the next allowed action? | Choose whether to authorize bounded real-host UAT or retain the activation/restart gaps as unaccepted. |
| What is explicitly forbidden right now? | Claim UAT pass, release, mutate real host plugin state without explicit authorization or perform automatic VCS delivery. |

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
| Current gate | UAT |
| Allowed now | Prepare explicitly authorized bounded host UAT or keep the current revise decision |
| Blocked by | missing real activation/restart evidence and user acceptance |
| Missing approval | `Approval: UAT` |
| Next gate after approval | OR |
| Allowed after approval | Prepare the auditable delivery report; release and VCS actions remain separately gated |
| Next step | Decide whether real-host UAT may change Codex plugin configuration and require restart |
| Quality outlook | Delta QA is approved; exact-text and non-mutating lifecycle paths pass, but host activation/restart remain unverified |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` received from the user on 2026-07-16. |
| PRD | approved | Exact `Approval: PRD` received from the user on 2026-07-16. |
| SD | approved | Exact `Approval: SD` received from the user on 2026-07-16. |
| TP | approved | Revision 2 received exact `Approval: TP` on 2026-07-16. |
| QA | approved | Renewed exact `Approval: QA` received on 2026-07-17 after same-run, same-gate, revision 18 and delta QA-report revalidation. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/installer-output-parity/UR.md` | approved | Exact `Approval: UR` recorded on 2026-07-16 |
| Brownfield Review | `.agdf/control/artefacts/installer-output-parity/BROWNFIELD_REVIEW.md` | done | Structured Delivery selected from existing-owner and safety evidence |
| PRD | `.agdf/control/artefacts/installer-output-parity/PRD.md` | approved | Exact `Approval: PRD` recorded on 2026-07-16 |
| SD | `.agdf/control/artefacts/installer-output-parity/SD.md` | approved | Exact `Approval: SD` recorded on 2026-07-16 |
| TP | `.agdf/control/artefacts/installer-output-parity/TP.md` | approved | Revision 2 approved exactly on 2026-07-16 |
| Brownfield Analysis | `.agdf/control/artefacts/installer-output-parity/BROWNFIELD_ANALYSIS.md` | done | Revision 2 passes after TP removed overlapping interaction ownership |
| CD+Tests | `.agdf/control/artefacts/installer-output-parity/CD_TESTS.md` | done | IOP-01 through IOP-12 implemented; focused and aggregate verification pass |
| TP Review | `.agdf/control/artefacts/installer-output-parity/TP_REVIEW.md` | done | 12/13 fully done; IOP-13 is explicitly post-QA |
| Clean Implementation Review | `.agdf/control/artefacts/installer-output-parity/CLEAN_IMPLEMENTATION_REVIEW.md` | done | pass; existing owners reused without a second SoT |
| CR | `.agdf/control/artefacts/installer-output-parity/CODE_REVIEW.md` | done | pass; no meaningful finding remains in reviewed scope |
| QA | `.agdf/control/artefacts/installer-output-parity/QA_REPORT.md` | pass | original and renewed delta QA approvals recorded; latest exact approval received on 2026-07-17 |
| UAT | `.agdf/control/artefacts/installer-output-parity/UAT_REPORT.md` | revise | non-mutating scenarios pass after one remediation; real activation and restart remain unverified |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Prioritized installation UX outcomes | User request on 2026-07-16 | Success Card, health/delivery split, read-only orientation, README/CLI simplification, lifecycle commands and `codex-repo` automation | direct |
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

- decision: `structured_delivery`
- required_next_gate: `TP`
- scope_reason: Public CLI commands and JSON, installer presentation and failure classification,
  destructive lifecycle operations, repository-local bootstrap, runtime interaction semantics and
  three documentation owners change together. The scope is not safe as Quick Task, Verified Change
  or one Structured Slice.
- evidence: `.agdf/control/artefacts/installer-output-parity/BROWNFIELD_REVIEW.md`;
  `create-agdf/lib/cli/`; `create-agdf/lib/installers/`; `create-agdf/lib/scaffold/`;
  `plugin/meta/contracts/interaction.md`; `README.md`; `INSTALL.md`; `create-agdf/README.md`.
- transparency_note: Brownfield Analysis found that TP revision 1 duplicated an active interaction
  owner's scope. Revision 2 keeps the lifecycle implementation here and converts approval capability
  work into an explicit dependency. Implementation remains forbidden until revision 2 is approved
  and the Brownfield recheck passes.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exact user approval recorded on 2026-07-16. |
| Brownfield Review | sizes | `structured_delivery` | `.agdf/control/artefacts/installer-output-parity/BROWNFIELD_REVIEW.md` |
| PRD | derived_from | UR | `.agdf/control/artefacts/installer-output-parity/PRD.md` |
| PRD | approved_by | `Approval: PRD` | Exact user approval recorded on 2026-07-16. |
| SD | derived_from | PRD | `.agdf/control/artefacts/installer-output-parity/SD.md` |
| SD | approved_by | `Approval: SD` | Exact user approval recorded on 2026-07-16. |
| TP | derived_from | SD | `.agdf/control/artefacts/installer-output-parity/TP.md` |
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

- next_allowed_action: Decide whether bounded real-host UAT may change Codex plugin configuration and require restart.
- quality_outlook: Delta QA is approved; UAT remains revise because real activation and restart are unverified.
