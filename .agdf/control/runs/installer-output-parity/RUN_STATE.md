# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: installer-output-parity
- lifecycle: active
- revision: 1
- revision_id: 725b042a-dab2-48c2-ad0c-d9551df2733d
- mode: undecided
- current_gate: UR
- owner: agent

## Objective

Make Codex, Claude Code and OpenCode installation results consistent while classifying the observed
Claude-on-Windows Git failure accurately and actionably.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | OpenCode already emits structured install/status output; Codex and Claude finish with surface-specific single-line messages. Claude installation catches every failure as a possible missing Claude CLI even when the upstream marketplace error identifies Git as missing or unsafe. |
| What is approved? | Nothing yet. |
| What is missing? | Exact `Approval: UR`. |
| What is the next allowed action? | Review the persisted UR and decide whether to approve it. |
| What is explicitly forbidden right now? | Brownfield Review, PRD, SD, TP, implementation, QA, release and environment mutation before exact UR approval. |

## Source And Scope State

- normative_instruction_source: `.agdf/control/artefacts/installer-output-parity/UR.md`; AGDF Runtime Contract
- multi_scope_state: clear
- active_scope_evidence: User-reported native Windows Claude failure; `create-agdf/bin/create-agdf.js`; installer smoke tests
- competing_scope_lines: Existing active runs own gate interaction and state orientation; none owns cross-surface installer result parity or Claude bootstrap error classification.
- branch_workspace_evidence: Existing unrelated working-tree changes remain outside this run; this run currently owns only its UR, run state and backlog pointer.
- branch_workspace_scope_effect: Any later implementation must isolate installer code and focused tests from unrelated changes.

## Run Status Card

| Run status | Value |
|---|---|
| Status | blocked |
| Current gate | UR |
| Allowed now | Review and refine the UR; request exact approval |
| Blocked by | Missing approved UR |
| Missing approval | `Approval: UR` |
| Next gate after approval | Brownfield Review |
| Allowed after approval | Inspect existing installer owners and select the smallest justified path; implementation remains forbidden |
| Next step | Request exact `Approval: UR` |
| Quality outlook | Preserve truthful host limitations while making success and recovery output comparable |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | missing | |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/installer-output-parity/UR.md` | draft | Ready for review |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Native Windows Claude failure | User-provided PowerShell output on 2026-07-16 | Marketplace refresh rejects Git as missing or unsafe while `git` itself is callable | direct |
| Claude installer catch | `create-agdf/bin/create-agdf.js` | Every non-version error becomes a possible missing-Claude-CLI message | direct |
| OpenCode status renderer | `create-agdf/bin/create-agdf.js` | Existing structured status, version transition and next-step baseline | direct |
| Installer smoke tests | `create-agdf/scripts/smoke-test.js`; `create-agdf/scripts/release-bootstrap-smoke-test.js` | Existing deterministic success and version checks | direct |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | missing |

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Scope is not approved and no reusable invariant has been established.

## Closeout

- next_allowed_action: Request exact `Approval: UR`.
- quality_outlook: Keep success output consistent without hiding surface-specific verification limits or upstream failure detail.
