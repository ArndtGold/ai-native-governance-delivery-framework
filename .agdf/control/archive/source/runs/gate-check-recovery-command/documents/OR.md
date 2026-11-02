# Orchestration Report: Consistent Gate Recovery and Approval Eligibility

Status: pass
Report mode: OR-full
Date: 2026-07-16
Run: `gate-check-recovery-command`

## OR

- gate: OR after exact UAT approval
- report_mode: OR-full
- artefact: `.agdf/control/artefacts/gate-check-recovery-command/OR.md`
- status: pass
- delivered: Target-aware ambiguous-run recovery; concise illegal-option errors; approval-ready UR projection; one shared ready-user-gate predicate; explicit decorated-only adapter prohibition; Runtime Integrity enforcement; synchronized generated assets; six-gate and aggregate regression coverage.
- intentionally_not_delivered: No new CLI flag, schema, adapter, approval semantic, native retry, commit, push, pull request, publication or release. The separate `installer-output-parity` run remains gated at UR.
- evidence: TP Review 8/8 `fully_done`; Brownfield Analysis pass; Clean Implementation Review pass; Code Review pass; QA pass and exact approval; live exact-text Codex UAT and exact user approval; full package smoke; Runtime Integrity; selected doctor; whitespace check.
- missing_evidence: Fresh execution from an installed post-delivery plugin remains useful before release because the current installed cache is version 0.8.6.
- risks: Host interaction schemas may change; fail-closed capability metadata and exact-text authority contain that risk. The dirty worktree includes unrelated active-run changes that must remain excluded from any scoped commit.
- retained_fallbacks: Exact textual approval is the canonical universal path, not a temporary workaround; no technical fallback or shim was added.
- required_next_step: Offer a scoped commit for this run without including unrelated worktree changes.
- quality_outlook: Monitoring/runtime verification after installing the delivered plugin version is useful before publication; no further implementation change is currently required.

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: existing multi-run resolver and native interaction authority nodes
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Brownfield, QA and UAT evidence confirm the implementation preserves existing ownership and introduces no duplicate node.

## Delivery Handoff

- delivery_status: uat_approved_with_code
- commit_ready: yes, subject to path-scoped staging that excludes unrelated dirty changes
- commit_title: `fix: keep AGDF gate approvals exact and recovery valid`
- commit_body: `Keep approval-ready gates open, prevent decorated-only native approval attempts, make gate-check recovery command-aware, and cover the behavior with integrity and regression tests.`
- migration_rollout_note: No schema migration. Refresh/install the delivered AGDF plugin version before final live release verification.
