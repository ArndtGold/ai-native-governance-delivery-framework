# UX Intent Definition: Recognize an MCP failure and choose a safe correction

Status: ready
Based on: approved UR and post-UR routing evidence
Date: 2026-10-19
Owner: Codex; Arndt Gold accountable for product approval

This is analytical PRD input only. It grants no approval or implementation permission and prescribes no component, endpoint or storage design.

## 1. Routing Evidence

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: The primary error feedback and recovery action change, while existing authority and working modes are preserved.
- ux_intent_definition_required: yes

## 2. Intent And Success

- primary_user_intent: Understand whether the requested operation succeeded, why it could not complete, what it may already have changed and which correction is permitted next.
- success_signal: From the tool result alone, the agent can identify failure, the supported cause, known effect limits and the next supported action. A human can review the same explanation without mistaking it for authorization.
- primary_decision_or_action: Correct a request, obtain a prerequisite, observe the original operation, or stop for a real human decision; retry only when the existing recovery preconditions permit it.

## 3. Working Modes And State

- working_modes: Read/report; prepare or mutate through existing commands; recover an uncertain original operation. These are existing usage contexts, not new product modes.
- effective_state_by_mode: Read/report returns the observed state without changing it, even when that state is blocked. A command returns its existing Core outcome and effect evidence. Recovery observes the original operation and preserves its identity and payload before any supported replay.
- visible_state_types: Success; successful report of blocked/pending governance; failed requested operation with a correction; failed operation awaiting a human prerequisite; uncertain effect requiring observation; a genuine runtime failure requiring supported repair. Protocol failures remain a separate host-facing class.
- effective_state_authority_by_mode: Existing Core evaluation/receipts determine governance and effects; trusted worker/runtime evidence determines only what it actually knows about dispatch; a human supplies required approval or scope choices.
- primary_state_presentation_owner_by_mode: Existing MCP result content provides the agent's failure and recovery explanation; the existing host and Cockpit display their supported views. Chat can explain the result but cannot change its authority.

## 4. Activation, Blockers, Recovery And Transitions

- activation_paths: The caller deliberately invokes an existing tool with the confirmed binding. Reading this explanation or correcting an input grants no additional authorization. No new mode switch or approval action is introduced.
- blockers: Invalid semantic input, unavailable/ambiguous target, stale revision/presentation, denied resource/capability, missing approval, pending original operation and genuine runtime faults must name the specific limiting condition when known. A successful report of a missing approval remains a valid read result.
- recovery_paths: Correct the named parameter and resubmit an eligible read; obtain an explicitly missing user choice rather than inventing it; refresh state/presentation before an eligible command; inspect the original UUID/receipt before uncertain-write recovery; use supported runtime repair only for actual runtime faults. A transient failure known not to have executed can offer retry when its prerequisite clears. The feedback never performs the retry itself.
- relevant_state_transitions: Invalid request -> corrected eligible request; stale binding -> fresh observation -> eligible original action or new deliberate decision; denied access -> authorized/capable context or truthful stop; unknown effect -> original-operation observation -> confirmed receipt or existing recovery; successful blocked-state report -> human prerequisite -> newly observed state. No transition implies a gate approval.

## 5. Proposed PRD Acceptance Criteria

- proposed_prd_acceptance_criteria: ERR-01 distinguishes actual failures from successful blocked-state reports; ERR-02 makes cause/correction visible in content; ERR-03 preserves known input/runtime cause and execution boundaries; ERR-04 protects state/UUID/approval-safe recovery; ERR-05 retains source/SDK rationale and validation boundaries; ERR-06 compares baseline and regression evidence without unsupported host claims. These are proposals derived from the approved UR, not a parallel acceptance register.

## 6. Decision Evidence

- decision: ready
- blocking_reason: none
- open_product_questions: none requiring new user intent. PRD must settle the operational classification, safe fallback and evidence obligations; exact representation and implementation remain SD decisions.
- affected_outputs: The bound PRD's acceptance, state, feedback and recovery sections; later SD/TP consumer and scenario mappings.
- evidence: Approved UR sha256:ff970aa070047b04a0d2174a2759bed996dd62336d1dec51c31848042ecea9af; BROWNFIELD_REVIEW.md; source inspection of server.js, worker-entry.js, worker.js, mcp-dispatch-runtime.js, run-command-service.js, cockpit.js, cockpit-session.js and protocol.test.js. Official MCP specification, TypeScript SDK and Anthropic guidance were checked for UR and remain linked there. The scenario walkthrough below is an agent-authored interpretation of that evidence, not a user trial or running implementation.
- missing_evidence: Implementation behavior, visible host feedback and native recovery after the change are not yet observed. They are later verification obligations, not evidence required to formulate this intent. No preview was requested or created; no rendering or user interaction is claimed.
- required_next_step: Record this ready analysis through the existing canonical writer, then derive the PRD and request its deliberate approval.

### Analytical Scenario Walkthrough

| Scenario and user task | Starting state and action | Expected visible result | Permitted next action and observation limit |
|---|---|---|---|
| Read why work is blocked | A valid status read finds a missing approval | The read succeeds and reports the missing prerequisite; it does not masquerade as an execution error | Review the existing decision material; actual approval remains deliberate. Source-based scenario only. |
| Correct a missing target | A valid tool request cannot resolve its target | An execution error identifies the missing/ambiguous binding and asks for the specific correction | Supply a confirmed target; do not infer it from discovery or substitute another run. No live recovery measured. |
| Recover from a stale revision | A bound command names a superseded revision | An execution error preserves the rejection cause and known effect evidence, with a fresh-state/presentation path | Observe the current binding; obtain a fresh deliberate approval when required. Never transfer the old reply. |
| Handle lost write response | A timeout leaves command effects unknown | An error states that non-execution is unproven and identifies the original operation observation path | Inspect its receipt/status and retain the original UUID/payload; no blind retry or invented replacement operation. |
| Handle denied Cockpit access | The requested read lacks capability/access | An execution error explains the known restriction and supported authorized/capable path or stop | Do not bypass access, open another project or claim UI visibility. |
| Handle a pre-dispatch input failure | Argument parsing fails before any operation executes | An execution error names the correctable cause and known non-dispatch boundary | Correct input; runtime reinstall and unknown-write warnings are inappropriate without evidence. |

The user's approved UR establishes the desired outcome; no additional observed user feedback is asserted. All examples are intended behavior awaiting PRD approval and implementation evidence.
