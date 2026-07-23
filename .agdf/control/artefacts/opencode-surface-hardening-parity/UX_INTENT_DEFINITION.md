# UX Intent Definition: OpenCode Surface Hardening and Evaluator Parity

Status: ready
Decision: ready
Date: 2026-07-23

- blocking_reason: none
- primary_user_intent: Understand the effective OpenCode governance and evaluator capability before relying on it, with an actionable and non-misleading recovery path when stronger capabilities are unavailable.
- success_signal: Status and Delivery Path Search visibly distinguish declared, observed, degraded and uninspectable capability evidence; no output claims `tool_enforced` without current technical proof; every degraded state names one safe recovery action.
- primary_decision_or_action: Inspect effective capability and either use the executable evaluator when preflight proves enforcement or consciously continue through the disclosed instruction-only planning workflow.
- working_modes: OpenCode status inspection; active plugin guidance; executable Delivery Path Search with successful preflight; degraded Delivery Path Search after failed or unavailable preflight.
- effective_state_by_mode: Status is derived from installed host, SDK, AGDF package and repository activation evidence; plugin guidance is active only for valid durable repository activation; executable evaluator state is derived from the current invocation's capability and permission preflight; degraded state never inherits a previous successful classification.
- visible_state_types: healthy; declared supported; degraded; uninspectable; version divergence; executable evaluator available; instruction-only recovery available; blocked by authentication, configuration, malformed output, timeout or mutation detection.
- effective_state_authority_by_mode: Installed artifacts and deterministic probes for status; durable repository control for governance activation; current evaluator preflight and shared mutation guard for enforcement; canonical gate-check for delivery authority.
- primary_state_presentation_owner_by_mode: `opencode-status` for installation, hook declaration and version evidence; OpenCode plugin log/guidance for active-session context; Delivery Path Search CLI output for evaluator enforcement, failure and recovery; canonical gate-check for allowed next delivery action.
- activation_paths: Global AGDF OpenCode installation plus valid repository control activates governance; an explicit Delivery Path Search request with a successful current preflight activates the executable evaluator.
- blockers: Missing or uninspectable SDK declarations; unresolved host/SDK divergence policy; unavailable OpenCode binary or flags; missing evaluator agent; ineffective deny permissions; missing model authentication; timeout; malformed contract output; repository mutation.
- recovery_paths: Reinstall or repair owned AGDF/OpenCode artifacts when inspection is impossible; show host, SDK and AGDF versions separately and warn without automatic alignment; fix authentication/configuration and retry; when preflight fails, stop the executable run and point to the existing instruction-only workflow; stop and report mutation as a hard failure.
- relevant_state_transitions: unknown to inspected; declared supported to degraded; healthy to version divergence warning; instruction-only to executable after successful current preflight; executable to stopped-with-instruction-only-recovery after preflight failure; any evaluator state to blocked on mutation detection.
- proposed_prd_acceptance_criteria: Deterministic evidence levels never conflate SDK declaration with live execution; status presents host, SDK and AGDF versions separately; every degraded state has one visible next action; `tool_enforced` appears only for the current successfully preflighted invocation; stale success is never reused; canonical gate authority remains unchanged.
- open_product_questions: none
- affected_outputs: `opencode-status` JSON and human output; OpenCode plugin guidance/logging; Delivery Path Search JSON and human output; capability matrix; install/status documentation and Pages compatibility copy.
- evidence: Approved UR revision 1; Brownfield Review; existing `evaluateOpenCodeStatus`; current global instruction generator; OpenCode plugin hooks; shared evaluator contract, mutation guard and static capability matrix; local OpenCode 1.18.3 and SDK 1.17.11 observation.
- missing_evidence: Runtime and visible-behavior proof remain later implementation and QA obligations.
- required_next_step: Incorporate these criteria into the PRD and request exact PRD approval.
