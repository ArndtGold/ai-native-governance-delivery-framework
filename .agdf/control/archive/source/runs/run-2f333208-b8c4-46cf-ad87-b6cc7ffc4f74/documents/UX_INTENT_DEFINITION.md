# UX Intent Definition: Independent planned URs and explicit Run handoff

Status: ready
- decision: ready
Based on: approved UR and post-UR routing evidence
Date: 2026-10-31
Owner: Codex, analytical preparation for Arndt Gold

This is non-authorizing analytical input, not a user gate. Proposed criteria acquire product authority only through the approved PRD.

## 1. Routing Evidence

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: Users distinguish an editable planned need from a real Run, deliberately choose a source version to start, and recover interrupted handoff or ambiguous legacy input across existing views.
- ux_intent_definition_required: yes

## 2. Intent And Success

- primary_user_intent: Capture and refine a future undertaking without starting delivery, then deliberately start one traceable Run when the selected need is sufficiently clear.
- success_signal: The user can locate the understandable undertaking title, identify draft versus Run and its source, change one planned need independently, and find the resulting Run or an actionable failure without reconciling a shared table.
- primary_decision_or_action: Either refine/prioritize a planned UR or explicitly start a Run from the displayed current source version. Selection, priority and apparent completeness alone never start a Run.

## 3. Working Modes And State

- working_modes: Optional Codex planning dialogue; Core-only planning inspection and explicit handoff; combined overview/detail; active Run delivery; legacy reconciliation/recovery.
- effective_state_by_mode: Planning is an unapproved, possibly incomplete UR draft. A handoff is pending, completed or failed/uncertain for a concrete source version and operation. Completed handoff leaves a reference to the resulting Run and its historical planning origin; active changes belong to Core. Core-only use preserves those meanings without the planning plugin. Legacy unresolved entries remain inspectable and cannot masquerade as approved or empty work.
- visible_state_types: Planned draft; incomplete/invalid planned input; handoff pending or requiring inspection; handed-off reference with Run link; active Run with actual gate/blocker; ended Run; incomplete/unavailable inventory; legacy ambiguity. An empty successful read is different from a failed read.
- effective_state_authority_by_mode: The selected planned UR and its minimal metadata determine draft content/priority. Verified handoff evidence determines transfer outcome and origin. The canonical Run and registered artefacts determine delivery/gate state. Preserved original backlog material determines unresolved migration facts. Agent wording, list selection and a planning extension cannot override those sources.
- primary_state_presentation_owner_by_mode: The planning dialogue explains draft edits and outstanding clarification; existing Core/CLI/MCP/Cockpit views present the shared overview and detail semantics; Core's existing Run/gate presentation remains the approval owner. The optional extension presents Core results rather than maintaining an independent status.

## 4. Activation, Blockers, Recovery And Transitions

- activation_paths: User deliberately requests planning/capture/refinement or opens an existing planned entry. Installing or discovering the extension never activates planning or delivery by itself. Core-only users can inspect entries and explicitly start from a selected version. The initial optional package targets Codex; the Core contract remains hostneutral. Direct new-Run creation remains available without planned input.
- blockers: Missing/invalid identity or UR content, duplicate identity, stale source selection, unavailable/unsafe input, an unresolved earlier handoff, unsupported version, incompatible pending legacy recovery or ambiguous migration association. Show the actual reason, affected item/source and one permitted next action; do not turn every planning defect into a project-wide delivery stop.
- recovery_paths: Incomplete UR stays editable through the shared UR owner. Stale selection requires refresh and deliberate selection of the current version. Uncertain handoff first inspects the original operation; confirmed retry reuses that operation and selected version rather than creating a second Run. Unsafe sources require correction of the actual source. Ambiguous legacy rows retain their original content/references for explicit reconciliation. Read failure exposes retry and last-known information as stale, never as current or empty.
- relevant_state_transitions: Need -> unapproved planned UR -> clarified/reprioritized draft -> explicit source-bound handoff request -> one resulting Core Run awaiting normal UR review/approval. An interrupted operation -> inspect -> complete/recover/retry the same operation. Changed source before commitment -> conflict without silent substitution. Completed handoff -> read-only historical planning reference and live Run navigation; later product changes use Core's existing revision rules. Legacy row -> accounted-for planned entry, associated Run/history or visible unresolved item. No planned transition infers a gate approval.

## 5. Proposed PRD Acceptance Criteria

- proposed_prd_acceptance_criteria: Users distinguish a draft, active Run, ended Run and uncertain/invalid/unavailable state in all affected views; find a readable undertaking title and source reference; receive feedback after independent UR/priority edits; explicitly choose the source version for handoff; receive one Run link on replay; recover interruption through the original operation; use Core without the optional plugin; retain and reconcile legacy content without guessed authority. Every visible criterion should state mode/state, primary action, feedback, failure, recovery, success and evidence expectations in PRD. Product behavior only is proposed here; persistence/locking/protocol design belongs to SD.

## 6. Decision Evidence

- blocking_reason: none for PRD drafting. No required preview obligation exists.
- open_product_questions: none blocking this analytical step. On 2026-10-31 the user accepted the recommendation by "Leg los": deliver a complete optional Codex planning package first, using the shared UR planning mode and hostneutral Core contract; other hosts follow only with their own evidence. Exact metadata encoding, package wiring and recovery protocol are SD decisions, subject to the PRD's observable promises.
- affected_outputs: PRD acceptance and decision table; existing overview/detail behavior; planning dialogue; explicit handoff and migration feedback; later SD/TP source and scenario mappings.
- evidence: Approved UR digest sha256:647cd7a6f3a9f224a592a46742a2aa71be469ca9ef164ba8da1429e4123c9415 and recorded Brownfield Review digest sha256:2cb1ab6a3506977e549f0002716d3af0875e98347c0a069a5ef0f058301ea (see exact source manifest below). Current authoring-inputs manifest sha256:9d69e3172006b91d3dc643b8479de382afb979bf2898b2dd953f79502fac2d47 binds template and both sources at revision 046244dc-aec0-4431-87d1-eba063057af8. Exact Brownfield digest in that manifest: sha256:2cb1ab6a3506977e549f0002716d3af0875e98321347c0a069a5ef0f058301ea. Agent-only written scenario analysis follows; no user observation, interactive preview or new product implementation was exercised.
- missing_evidence: Implemented behavior, installed Codex planning-package invocation, actual handoff/migration/concurrency and visible Cockpit behavior remain future TP/QA obligations. Analytical readiness proves none of these.
- required_next_step: Draft PRD with the confirmed Codex-first optional-extension scope, explicit decisions and observable criteria; present it through the existing owner for a new deliberate Approval: PRD.

### Agent-only scenario walkthrough

1. Capture: a maintainer describes a need in Codex planning mode. The proposed result is one visibly unapproved planned UR with its title and outstanding questions; no Run/gate exists. Refining it affects that entry only.
2. Core-only navigation: without the optional plugin, a user reads the same planned entry alongside existing Runs. Opening a draft shows draft content; opening a Run shows its actual state. An unavailable directory produces an unavailable/partial result, not "nothing planned".
3. Start and stale source: a user explicitly starts from the displayed source. If it changed, explain the conflict and offer refresh/reselection. If unchanged, the result is one Run awaiting its ordinary UR presentation, linked to the source used.
4. Interrupted start: the response is lost. The proposed interface offers inspection/retry of the original operation; successful replay links to the same Run. It never encourages a second unbound start to escape uncertainty.
5. Legacy ambiguity: an old row has no unique Run/UR association. Keep its original text, priority and links visible as unresolved. Explicit reconciliation determines its disposition; unrelated valid Runs remain usable.
6. Handoff complete: the overview links a historical planning reference to its Run. Further active scope editing goes through Core; the historical draft is not silently synchronized with the approved UR.

These are source-derived proposed scenarios, not observations of a running feature or human acceptance.
