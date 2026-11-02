# CD+Tests: completed decision-card session retirement
- decision: pass

Run: core-mcp-flow-coherence-20261010-01
Scope: correction of CARD30-RETIRE under approved T-009, without changing approved sources or the external undecided-host-close obligation.

## Implementation
After a matched saved approval, fresh exact Core route, successful internal context update and acknowledged SDK message, DecisionEntry invalidates only that card's live binding and awaits its existing idempotent Core close. A per-view promise coalesces handoff completion, replacement, pagehide, SDK teardown and unmount. The saved receipt remains visible beyond the retired session expiry. Reading the approved document uses existing stateless presentation-document Inspect with exact target/Run/gate/revision/presentation/digest and complete cursor traversal. Unknown approval or handoff does not trigger this retirement or business replay. Failed close is separately visible after successful handoff; it does not turn saved approval into an uncertain effect. A late old close cannot retire or overwrite a new view. No shared MCP server is shut down and no new tool, write channel or persistent control store exists.

## Validation
226 component tests, 8 UI-service tests, typecheck, interaction catalog and build:prepare pass. Fourteen built SDK browser cases cover English/German rendering, keyboard, queued handoff beyond the tool deadline, successful retirement after acknowledgment, no retirement on failed/stale handoff, saved receipt after expiry and exact post-retirement document reading. Two actual assembled-Core/SDK browser integrations pass: undecided synthetic teardown, and acknowledged approval followed by automatic closed:true, session_expired on the old reader, another view available, exactly one decision and immutable historical document access without restoring the old session. These are synthetic hosts, not native qualification.

Exact source hashes, preserved logs and actual assembled-Core exchange are in post-approval-retirement-30/VERIFICATION.json. Existing final19 and readable-continuation-24 evidence remains scoped to unchanged owners. The public/portable package preparation passes with the same 232-file Copilot payload and exactly 624 additional bytes for the localized close warning/catalog; no size headroom was added.

## Limits and next step
This is engineering validation only. The updated authorized test entry is registered but this connection still runs the prior H3C1K2 candidate. Fresh native post-approval retirement, undecided native host teardown, all required native gates/locales, actual host permission denial, iPad complete-material and matched baseline/current corpus remain unqualified. Renew Code Review and applicable quality evidence; do not claim QA pass or update productive runtime from these synthetic results.

- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Existing session, presentation reader and SDK owners reused.
