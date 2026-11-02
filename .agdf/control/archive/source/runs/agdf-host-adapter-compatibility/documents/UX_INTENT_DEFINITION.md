# UX Intent Definition: Evidence-based Host Compatibility

Status: ready
Decision: ready
Based on: approved UR Revision 1 and BROWNFIELD_REVIEW.md post-UR routing
Date: 2026-09-05
Owner: Codex

This is non-authorizing analytical input. The approved PRD will own product requirements. No
component, persistence format, endpoint, permission mechanism or approval decision is prescribed here.

## 1. Routing Evidence

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: Readers need comparable support evidence and a clear next action when it is incomplete, failed or no longer applicable. Existing installer/status meanings must remain distinguishable from that comparison.
- ux_intent_definition_required: yes

## 2. Intent and Success

- primary_user_intent: Determine which AGDF capabilities have actually been demonstrated for the intended host environment and what must be checked before relying on a stronger claim.
- success_signal: A reader can identify the environment and evidence date, distinguish the five lifecycle outcomes and four capability dimensions, and find one permitted next action without mistaking installation or historical evidence for current enforcement.
- primary_decision_or_action: Choose an evidenced environment or follow the stated verification/recovery action for a missing or failed capability.

## 3. Working Modes and State

| working_mode | effective_state_by_mode | visible_state_types | effective_state_authority_by_mode | primary_state_presentation_owner_by_mode |
|---|---|---|---|---|
| Compare published/repository evidence | Recorded observations support only their exact environment, payload and execution path | demonstrated, failed, unverified, stale/mismatched, unsupported with evidence; each of the five outcomes remains separate | The referenced observation and its evaluated applicability; the report cannot activate a host | Existing compatibility reference in AGDF documentation, with the full comparison report as evidence |
| Inspect own installation | Actual current installation, activation and check state is determined by existing local probes and host observations | Existing installation/status/check states, including pending restart or permission | Current host state and canonical local status/consent owners | Existing local lifecycle/status output; the compatibility reference explains the boundary and does not pretend to inspect the reader's machine |
| Verify or recover | A requested retry/repair has not succeeded until fresh matching evidence shows its result | pending verification, verified result, failed or partial recovery, explicit unavailable path | Actual operation result, preserved host permissions and current payload identity | Existing operation output for action progress; updated comparison only after evidence evaluation |

- working_modes: compare evidence; inspect own installation; verify or recover
- effective_state_by_mode: defined in the table; report state is distinct from physical installation state
- visible_state_types: per-outcome evidence status plus skill availability, automatic checks, observed governance and mechanism-specific enforcement; no global percentage or universal green host badge
- effective_state_authority_by_mode: defined in the table; AGDF gate authority remains in canonical control state
- primary_state_presentation_owner_by_mode: defined in the table; a documentation summary links to the full evidence and does not maintain an independent support truth

## 4. Activation, Blockers, Recovery and Transitions

- activation_paths: Reading the compatibility reference is passive. Local status uses the existing explicit host/target selection. Install, update, consent, restart and verification retain their existing activation paths and require the authorization appropriate to those actions.
- blockers: absent evidence, wrong payload/version, unknown OS or host variant, malformed/conflicting observation, denied permission, missing fresh session and failed/partial recovery. Each explains which claim is unavailable and one next action.
- recovery_paths: Re-run the same bounded check after a transient failure when its execution is authorized. Follow the existing host repair/permission workflow when needed, then obtain fresh evidence. A denied permission remains a valid decision, with manual operation where already supported. Unsupported capability names the limitation without inventing a repair.
- relevant_state_transitions:
  - New matching direct observation: unverified to demonstrated for the particular outcome only, with date and evidence link.
  - Payload/host/OS/path/permission assumption changes: earlier demonstrated claim becomes stale or inapplicable for the new environment; historical evidence remains readable.
  - Transient check failure: show failure and retry action; the report does not silently reuse an older pass as current proof.
  - Repair partially succeeds: preserve distinct recovered and unresolved facts; request the next bounded repair or verification, not a global success.
  - Runtime checks are declined or revoked: retain usable existing manual mode and show automatic checks as unavailable/manual, without changing skill or gate authority claims.
  - Update finishes but the host has not restarted: update command completion stays distinct from proof that the intended bytes are callable in a fresh session.

## 5. Proposed PRD Acceptance Criteria

- Keep the five outcomes individually visible and bind them to the full environment and payload.
- A successful install/plugin list must never imply discovery, invocation, fresh update or recovery proof.
- Separate skill availability, automatic checks, observed governance and technical enforcement, including the covered execution path and model when model behavior is claimed.
- Preserve negative, missing, stale and unsupported evidence without upgrading it from fixtures or unrelated observations.
- Show a direct evidence link, date, limitation and next action for every claim or gap.
- Preserve existing local status/permission semantics; the comparative view does not invoke host mutations or grant authority.
- Test visible failure/retry and update/restart transitions as well as successful evidence presentation.

## 6. Decision Evidence

- blocking_reason: none
- open_product_questions: none blocking PRD drafting; the bounded first scope and proposed evidence states are explicit reviewable PRD decisions
- affected_outputs: common comparison report and its explanation/links in existing compatibility documentation; existing lifecycle output serves as the unchanged local-state reference
- evidence: approved UR Revision 1; BROWNFIELD_REVIEW.md; `lifecycle/result.js`; `lifecycle/status.js`; `runtime-check-consent/adapters.js`; `INSTALL.md`; historical HOST_CONFORMANCE_REPORT.md
- missing_evidence: final implementation and fresh-host observations are future validation obligations; no current support result is inferred by this analysis
- required_next_step: Incorporate these semantics into PRD Revision 1 for deliberate user review.
