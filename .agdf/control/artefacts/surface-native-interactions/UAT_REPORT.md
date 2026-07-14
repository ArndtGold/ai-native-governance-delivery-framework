# UAT Report: Surface-Native AGDF Interactions

Status: approved
Gate: UAT
Based on: approved `QA_REPORT.md`
Date: 2026-07-14
Owner: AGDF

## UAT Scope

Validate the user-facing delivery outcome:

- AGDF can prefer native structured decision controls on Codex, Claude Code and OpenCode when the host can safely wait for deliberate input.
- Exact textual approvals remain the universal fallback and continue to work unchanged.
- Native questions, command/edit/network permissions, Claude plan approval and OpenCode permission/auto-mode outcomes remain distinct authority domains.
- Only a deliberate response that passes selected-run, current-gate and durable-artefact revalidation may be persisted as AGDF approval.
- OpenCode enables native `question` by default but preserves explicit user `allow` or `deny` decisions.

## Acceptance Evidence

- QA decision: pass; `Approval: QA` recorded on 2026-07-14.
- AC-01 through AC-18 have strong deterministic contract, generation, configuration, control-state, integrity, documentation and build evidence.
- TP Review: 14 tasks fully done; SNI-14 partial only for supporting interactive UI observations.
- Clean Implementation Review: pass.
- Code Review: pass with no findings.
- Runtime integrity, controlled negative integrity, control-state, routing, aggregate package smoke, Pages check/build and diff checks pass.
- Exact-text fallback was used successfully in this Codex run.

## Disclosed Limitation

Authenticated interactive Claude native-question behavior and safely automated interactive Codex/OpenCode question rendering were not captured. The approved SD/TP classify these as supporting observations; deterministic release-critical evidence is complete.

## UAT Decision

- status: approved
- decision: accepted
- approval: `Approval: UAT` provided on 2026-07-14
- missing_approval: none
- forbidden: commit, push, pull request, release or automatic delivery action
- required_next_step: Produce the Orchestration Report and offer delivery closeout; VCS and release actions still require explicit instruction.

## Context Graph

- context_graph_impact: `new_node_required`
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: `resolved`
- context_graph_gate_effect: `none`
- context_graph_required_action: `none`
