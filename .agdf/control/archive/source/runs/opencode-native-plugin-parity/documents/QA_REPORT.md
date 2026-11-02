# QA Report: OpenCode Native Plugin Parity

## Status

- decision: `pass`
- gate: `QA`
- created_at: `2026-07-13`
- gate_approval: `Approval: QA` provided on `2026-07-13`

## QA Gate

- decision: `pass`
- evidence: approved TP coverage is complete for OC-01 through OC-10; Brownfield Analysis passed; Task Plan Review reports 10/10 tasks `fully_done`; Clean Implementation Review passed; final Code Review passed with no open findings; all required package, runtime, documentation and diff checks pass.
- missing_evidence: none required for the approved scope.
- risks: installed-runtime evidence is bounded to OpenCode `1.17.13`; native skill packaging and discovery do not provide model-independent AGDF gate enforcement, so OpenCode correctly remains `instruction_only`; the native `opencode plugin` installer remains an intentionally non-adopted path until it can preserve the existing deterministic loadability/status contract; the deprecated schema-version-1 `gate_check_agent` status alias remains until a future explicitly versioned schema change; the TP defines no task priorities, so none are inferred here.
- required_next_step: UAT approval is recorded; proceed to delivery closeout and do not commit, push, open a PR or release without the corresponding explicit delivery instruction.
- impact_codes: none; `AGDF_STATUS_CARD_PARALLEL_RULE_MODEL` does not apply because this implementation introduces no independent gate or transition model.

## Validation Evidence

| Check | Result |
|---|---|
| `npm --prefix create-agdf run smoke-test` | pass; aggregate control-state, delivery-path, generator, OpenCode and routing coverage completed with exit 0 |
| `npm --prefix agdf run smoke-test` | pass |
| `npm --prefix pages run check` | pass; 0 errors, 0 warnings, 0 hints |
| `node plugin/scripts/check-runtime-integrity.mjs` | pass; 9 skills and 14 control files checked |
| native OpenCode skill discovery probe | pass; all 9 AGDF skills discovered on OpenCode `1.17.13` |
| native OpenCode agent discovery probe | pass; 0 generated AGDF agents |
| local OpenCode plugin hook probe | pass; native surface detection, structured status, environment signal and compaction reminder verified |
| `opencode-status` schema-v1 compatibility regression | pass; deprecated and current fields resolve to the same native skill path |
| `node create-agdf/bin/create-agdf.js doctor --json` | pass; 0 findings |
| `git diff --check` | pass |

## TP Coverage Summary

- fully_done: OC-01, OC-02, OC-03, OC-04, OC-05, OC-06, OC-07, OC-08, OC-09, OC-10
- partially_done: none
- not_done: none
- out_of_scope_changes: none identified

## Brownfield and Solution Integrity

- existing generator, plugin, status, permission, integrity, test and documentation owners were extended in place;
- canonical AGDF policy remains under `plugin/**`, generated OpenCode files remain adapters, and `.agdf/control/` remains the durable repository source of truth;
- the former generated AGDF subagent surface is replaced, not duplicated, and migration removes only fingerprinted AGDF-owned legacy files;
- the resolved Code Review P1 is permanently covered by a schema-version-1 compatibility regression test;
- bounded compatibility shims do not route execution or decide product policy.

## Context Graph Reconciliation

- context_graph_impact: `link_only`
- context_graph_refs: existing Delivery Path Search surface capability invariant
- context_graph_reconciliation: `resolved`
- context_graph_gate_effect: `none`
- context_graph_required_action: `none`
- rationale: the final capability classification remains `instruction_only`; no reusable model-independent enforcement knowledge was established and therefore no new context-graph node is warranted.

## QA Decision Rationale

QA passes because the approved implementation is completely covered by task-linked evidence, preserves Brownfield ownership boundaries, has one clean primary solution, closes the only Code Review finding, and passes the full post-fix validation suite. The remaining limitations are explicit product and compatibility boundaries rather than missing implementation evidence. QA approval is now recorded; UAT remains the next user gate, and commit, push, PR or release activity remains unauthorized.
