# UX Intent Definition: OpenCode Surface Hardening and Evaluator Parity

Status: ready
Decision: ready
Revision: 2
Date: 2026-07-23

- blocking_reason: none
- primary_user_intent: Understand the effective OpenCode governance and evaluator capability before relying on it, with an actionable and non-misleading recovery path when stronger capabilities are unavailable.
- success_signal: Installation either verifies an exact host/SDK match or visibly retains the
  unresolved divergence with one recovery action; status and Delivery Path Search distinguish
  declared, observed, degraded and uninspectable capability evidence; no output claims
  `tool_enforced` without current technical proof.
- primary_decision_or_action: Install or refresh the OpenCode surface without manually repairing a
  resolvable SDK drift, then inspect effective capability and either use the executable evaluator
  when preflight proves enforcement or consciously continue through the disclosed instruction-only
  planning workflow.
- working_modes: OpenCode installation with SDK alignment; read-only OpenCode status inspection;
  active plugin guidance; executable Delivery Path Search with successful preflight; degraded
  Delivery Path Search after failed or unavailable preflight.
- effective_state_by_mode: Installation derives the host version, targets only the exact matching SDK
  version and verifies the observed final state; status derives evidence without mutation from
  installed host, SDK, AGDF package and repository activation; plugin guidance is active only for
  valid durable repository activation; executable evaluator state is derived from the current
  invocation's capability and permission preflight; degraded state never inherits a previous
  successful classification.
- visible_state_types: already matching; aligned and verified; alignment unavailable; alignment
  failed; healthy; declared supported; degraded; uninspectable; version divergence; executable
  evaluator available; instruction-only recovery available; blocked by authentication,
  configuration, malformed output, timeout or mutation detection.
- effective_state_authority_by_mode: Installed artifacts and deterministic probes for status; durable repository control for governance activation; current evaluator preflight and shared mutation guard for enforcement; canonical gate-check for delivery authority.
- primary_state_presentation_owner_by_mode: The OpenCode install lifecycle result owns alignment
  outcome and final observed versions; `opencode-status` owns read-only hook declaration and version
  evidence; OpenCode plugin log/guidance owns active-session context; Delivery Path Search CLI output
  owns evaluator enforcement, failure and recovery; canonical gate-check owns allowed next delivery
  action.
- activation_paths: Global AGDF OpenCode installation probes and aligns the SDK before final
  verification; valid repository control activates governance; an explicit Delivery Path Search
  request with a successful current preflight activates the executable evaluator.
- blockers: Uninspectable host version; unavailable exact SDK version; failed SDK installation or
  verification; missing or uninspectable SDK declarations; unavailable OpenCode binary or flags;
  missing evaluator agent; ineffective deny permissions; missing model authentication; timeout;
  malformed contract output; repository mutation.
- recovery_paths: When exact alignment is unavailable or fails, retain and report the observed SDK
  state and one explicit manual repair/retry action without changing the host; use read-only status
  to inspect the final state; reinstall or repair owned AGDF/OpenCode artifacts when inspection is
  impossible; fix authentication/configuration and retry; when preflight fails, stop the executable
  run and point to the existing instruction-only workflow; stop and report mutation as a hard
  failure.
- relevant_state_transitions: divergent to aligned-and-verified; divergent to retained-with-warning
  when alignment is unavailable or fails; already matching to unchanged; unknown to inspected;
  declared supported to degraded; instruction-only to executable after successful current preflight;
  executable to stopped-with-instruction-only-recovery after preflight failure; any evaluator state
  to blocked on mutation detection.
- proposed_prd_acceptance_criteria: Install targets only an exactly matching SDK version and verifies
  the final state; unavailable or failed alignment never claims success and does not update the host;
  status remains read-only and presents host, SDK and AGDF versions separately; deterministic
  evidence levels never conflate SDK declaration with live execution; every degraded state has one
  visible next action; `tool_enforced` appears only for the current successfully preflighted
  invocation; stale success is never reused; canonical gate authority remains unchanged.
- open_product_questions: none
- affected_outputs: `opencode-status` JSON and human output; OpenCode plugin guidance/logging; Delivery Path Search JSON and human output; capability matrix; install/status documentation and Pages compatibility copy.
- evidence: Approved UR revision 2; Brownfield Review revision 2; existing OpenCode install npm
  owner and `evaluateOpenCodeStatus`; exact registry availability for SDK 1.18.3; current global
  instruction generator; OpenCode plugin hooks; shared evaluator contract, mutation guard and static
  capability matrix; local matching OpenCode host and SDK 1.18.3 observation after manual repair.
- missing_evidence: Runtime and visible-behavior proof remain later implementation and QA obligations.
- required_next_step: Incorporate these criteria into the PRD and request exact PRD approval.
