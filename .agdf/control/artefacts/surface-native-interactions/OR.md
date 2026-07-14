# Orchestration Report: Surface-Native AGDF Interactions

- gate: OR
- report_mode: OR-full
- artefact: `.agdf/control/artefacts/surface-native-interactions/OR.md`
- status: pass

## Delivered

- Canonical Native Interaction Contract for `clarification`, `tool_permission` and `gate_approval`.
- Surface mappings for Codex `request_user_input`, Claude Code `AskUserQuestion`, OpenCode `question` and exact-text fallback.
- Gate-readiness, deliberate-input, no-auto-resolution and same-run/same-gate revalidation rules.
- Generated-surface propagation, OpenCode `permission.question` preservation and deterministic regression coverage.
- Context Graph invariant `CG-NATIVE-INTERACTION-AUTHORITY`.

## Intentionally Not Delivered

- No custom host UI, approval service, MCP server or persisted interaction store.
- No authenticated Claude native-question probe and no safely automated Codex/OpenCode button-rendering probe; these remain disclosed supporting-evidence gaps under SNI-14.
- No commit, push, pull request or release.

## Evidence

- TP Review: 14 tasks fully done; SNI-14 partial only for supporting UI observations.
- Clean Implementation Review: pass.
- Code Review: pass with no findings.
- QA: pass; `Approval: QA` recorded on 2026-07-14.
- UAT: accepted; `Approval: UAT` recorded on 2026-07-14.
- Selected-run `gate-check --run surface-native-interactions --json`: `open`, `current_gate: OR`, `doctor_status: pass`, zero findings.

## Missing Evidence And Risks

- Native host rendering is host-owned and was not captured in authenticated live probes. Correctness remains covered by deterministic contract, fallback and control-state tests.
- Host API/schema drift remains a supporting follow-up risk; unknown or unsafe native availability must use exact textual approval.

## Retained Fallbacks

- Exact textual approvals remain universal and authoritative.
- Native controls never write AGDF state directly; existing control-state validation remains the sole approval authority.

## Context Graph

- context_graph_reconciliation: resolved
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_gate_effect: none

## Required Next Step

Offer delivery closeout. Commit, push, pull request and release require separate explicit user instruction.

## Quality Outlook

The interaction contract is structurally complete; the remaining quality follow-up is optional authenticated live UI observation across host surfaces.
