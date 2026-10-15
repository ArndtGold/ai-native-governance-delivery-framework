# UX Intent Definition: Reliable MCP runtime and coherent Codex host setup

Status: ready
Decision: ready
Based on: Approved UR and registered post-UR Brownfield Review
Date: 2026-10-14
Owner: Coding agent acting as ux-intent-definition

This is non-authorizing analytical PRD input. It grants no implementation permission and carries no gate approval. Approved PRD will be the sole product acceptance authority.

## 1. Routing Evidence

- delivery_context: brownfield
- ui_ux_impact: high
- ui_ux_impact_reason: Product and temporary diagnostic modes change visible activation, origin/scope, lifecycle, discovery/App and failure/cleanup semantics across the observed Codex integration.
- ux_intent_definition_required: yes

## 2. Intent And Success

- primary_user_intent: Use AGDF as a coherent installed product, understand the effective host setup and recover safely from actual startup/execution failure.
- success_signal: The user/agent can identify the product entry and retained Cockpit capability, see which state is directly observed versus merely configured, and take one permissible next step without duplicate writes, hidden diagnostics or foreign-state loss.
- primary_decision_or_action: Use the configured product, deliberately activate a bounded diagnostic session when needed, or perform the existing owned setup/update/removal action against the exact intended scope.

## 3. Working Modes And State

- working_modes: regular product; optional justified Cockpit; explicit temporary diagnostics; disabled/removed; partial failure or stale session.
- effective_state_by_mode: Regular product reflects its actual declared/effective origin, runtime and current connection. Optional Cockpit preserves its project target and read-only role. Diagnostics show test identity/owner/intended lifetime. Disabled is not removed. Removed registration is not proof of terminated shared sessions or erased App data. Partial/stale state preserves the known last observation and missing current proof.
- visible_state_types: configured/enabled; started; tools discovered; App rendered; unavailable/unsupported; stale session; failed phase; uncertain operation effect; owned cleanup complete or retained with reason.
- effective_state_authority_by_mode: Codex owns effective config, trust, permissions, native client/discovery/rendering and shared App data. Existing AGDF lifecycle owners establish exact owned mutations/runtime identity; Core receipt owner establishes committed operation state. No mode converts host tool permission or UI visibility into a human AGDF approval.
- primary_state_presentation_owner_by_mode: Existing AGDF setup/status/diagnostic outputs explain their evidence; Codex settings and native App container present actual host connection and rendering state. This assigns presentation responsibility, not a new technical store or authority.

| Mode/state | What the user must understand | Primary permissible action |
|---|---|---|
| Regular product ready | AGDF role, scope and actually available capability; each claimed state has its own observation | Use the existing bound tool |
| Optional Cockpit ready | Separate entry exists for a justified reason, retains project target and read-only role | Open the existing Cockpit |
| Temporary diagnostics | This is a deliberately activated test, with named owner and bounded intended use | Complete or abort and run owned cleanup |
| Configured but not started/discovered | Config exists; startup/discovery proof is missing | Resolve the actual failed phase or supported session refresh |
| Tools available but App unsupported/unobserved | Server success does not mean a displayed/working App | Use the existing text/document path or separately observe native UI |
| Uncertain command effect | Timeout is not rollback; original identity remains essential | Inspect original operation/receipt before exact replay |
| Stale running session after update | Current config and current client can refer to different generations | Report the supported refresh action; never automatic restart |
| Unproven/foreign cleanup target | Ownership is insufficient for removal | Retain and report the missing exact proof |
| Disabled/removed | Disablement, registration removal, session end and shared data are distinct effects | Report achieved state and bounded remaining step |

## 4. Activation, Blockers, Recovery And Transitions

- activation_paths: Existing plugin/setup paths and authorized project/user scope; optional Cockpit only when justified; diagnostics only after deliberate activation with explicit test role. Host permissions and exact gate approvals remain independent.
- blockers: Missing/invalid ownership, collision, precedence/policy conflict, incomplete runtime provenance, failed startup, unavailable capability, stale client identity or absent native App proof prevent a stronger claim or affected mutation.
- recovery_paths: Show a concrete safe phase/reason and one existing next action. Recoverable transient failures offer a bounded retry without changing mutating UUID. If effects are unknown, first inspect original receipt/status. Unknown ownership is retained. Text/document fallback keeps original decision binding. Update/cleanup partial failure reports exact preserved and changed state.
- relevant_state_transitions: configured to started to discovered to rendered are separately observed transitions; any stage may fail without implying later success. Product updates can produce new config with old sessions. Deliberate test activation leads to completion/abort cleanup. Disabled, removed, session-ended and App-data-cleared are never conflated.

## 5. Proposed PRD Acceptance Criteria

- proposed_prd_acceptance_criteria: Carry UR AC-001 through AC-014 into one stable PRD criteria chain; observable product roles, source/scope and staged state must be legible in supported returned outputs. False success after mere configuration or returned HTML must be refused. Diagnostic activation/abort/repeat cleanup must preserve product/shared/foreign state. Current uncertain effects retain original UUID. Translation/rendering and explicit unsupported/stale paths need evidence; technical components, naming migration mechanics and storage remain SD.

## 6. Decision Evidence

- decision: ready
- blocking_reason: none for intent drafting.
- open_product_questions: none preventing PRD drafting. PRD must explicitly resolve conditional product entry policy, preserved capabilities, bounded assurance and cleanup authority in its Approval Decisions. Investigation mechanisms, effective-host readback and exact workload/measurement remain named SD/TP obligations, not hidden product choices.
- affected_outputs: Existing product/setup/status/error/cleanup and returned decision/App/text outputs; host-owned settings remain host-owned.
- evidence: Exact approved UR digest sha256:6f0c8a1ac4e7c83fd39369c4f9478624f513dcbf0736c42f247d27615fb9f630; registered BROWNFIELD_REVIEW.md digest sha256:6dd02c8a3a24c2211539472789cc62e89466c28eda2a9950ae54055c5d4d66ab; prior read-only configuration/process observations; current tool catalog; existing Codex adapter and server/App owners.
- missing_evidence: Actual causes, corrected candidate and fresh integrated/native qualification belong to downstream investigation and acceptance; no implementation or current native rendering proof is claimed by this analysis.
- required_next_step: Draft full-depth PRD from approved UR and this analytical input, resolving its product decisions before presentation.
