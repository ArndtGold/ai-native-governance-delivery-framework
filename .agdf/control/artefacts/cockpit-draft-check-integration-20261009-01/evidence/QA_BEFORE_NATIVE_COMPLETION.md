# QA Report: bound Cockpit draft-check integration

## Quality Readiness (derived; non-authorizing)

| Dimension | Evidence owner | Outcome |
|---|---|---|
| Plan coverage | task-plan-review | revise — T-006 fresh native proof absent; AC-006/007 partial |
| Solution integrity | clean-implementation-review | pass — shared Core/read/session/App owners retained |
| Code quality | code-review | pass — actual incremental diff reviewed |
| QA decision | qa-gate — sole decision owner | revise — NATIVE-001 remains open |

## Decision

- decision: revise
- Run: cockpit-draft-check-integration-20261009-01
- Evaluated revision: 603b6c2f-931f-4fe4-bf49-b2502cc39fd0
- Approved TP: .agdf/control/artefacts/cockpit-draft-check-integration-20261009-01/TP.md
- Approved TP digest: sha256:541fef03c6192ee7a567ce2b9067a7a1feeb540f7b83cfe74069988adae9a44b
- evidence: BROWNFIELD_ANALYSIS.md; CD_TESTS.md; CODE_REVIEW.md; TASK_PLAN_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md; evidence/VERIFICATION.md; baseline/scoped-delta/protected-byte/runtime-build identities; actual command logs and inspected built-browser images.
- missing_evidence: Fresh Codex native MCP-App capability/initialization, actual loaded runtime/UI identity, deliberate draft action and original result, recovery and native keyboard/scroll/resize sequence, then close/teardown. NATIVE_OBSERVATION.json is only prepared_not_observed; no host/session is recorded.
- risks: Browser and stdio success cannot prove native host behavior. Old screenshots or the earlier Alles stabil geprüft confirmation apply to older builds. No actual code defect is established by the absent evidence, but the approved visible acceptance obligation is not fulfilled.
- required_next_step: Collect the fresh identity-bound native sequence through the prepared separate local connection, then refresh affected review evidence and rerun qa-gate.
- impact_codes: PRD AC-006, AC-007; TP T-006 SCN-018, SCN-021

## Evidence assessment

The approved target/Run and all source relationships remain exact. Brownfield preparation preceded code. Shared authoring validators and bounded capture remain the sole owners. Source changes at unchanged revision, guarded old selectors, capture/replay/publication races, session/worker/pool/resource transitions, publication cleanup quarantine, HTTP guards, no writes, original report flags and central current-scope commit are concretely tested and reviewed. The ephemeral controller has a finite deadline even for an unresponsive transport and rejects a late completion.

Five focused Core cases, 142 existing/current UI regression cases plus six final focused draft cases, nine actual authenticated HTTP cases, 24 built browser cases, generic MCP contract/safety/protocol and final packaged scoped MCP under both supported protocols passed in the recorded environments. Typecheck and browser/MCP/public builds passed. The two-case native filesystem notification suite passed outside sandbox after a repeat sandbox notification failure; initial loopback EPERM is also retained. No production guard, assertion or observer was weakened to obtain a pass.

The actual source delta is 26 files against the captured dirty baseline. The exact measured Copilot payload update has no speculative headroom and includes no private UI or new dependency. The official isolated runtime retained the exact verified SDK digest; its UI manifest is sha256:859039c09e4c0ebc02cecc02b4954936538afb6749e42981b053a4ca0f687828. It is prepared, not installed into the running host. Fifteen approved/protected historical files remain byte-identical. Documentation describes authority, ownership, error recovery and proof boundaries.

Task Plan Review individually evaluates the seven tasks and all seven applicable UX criteria. AC-006 and AC-007 remain partial due to the explicitly required native proof. The open evidence gap is consumed without reclassification and prevents QA pass. Code and Clean Reviews remain subordinate evidence; this report alone owns the final revise decision. No user QA approval is requested from a revise report. UAT, OR/release and automatic VCS actions remain unavailable.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| NATIVE-001 | evidence_gap | evidence_obligation | open | PRD AC-006/007; TP T-006 SCN-018/021; TASK_PLAN_REVIEW.md; evidence/NATIVE_OBSERVATION.json is prepared_not_observed | Collect fresh initialization, actual action/result/recovery and teardown with the prepared exact-build native connection |

## Context Graph

- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Run-local implementation/evidence artifacts; no general graph/source authority change claimed
- memory_target: scope_artifact
- memory_reason: Exact Run qualification and open native observation obligation stay with this scope.
- memory_refs: evidence/VERIFICATION.md; evidence/NATIVE_OBSERVATION.json
