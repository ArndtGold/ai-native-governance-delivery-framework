# UX Intent Definition: Request-Intent Activation Boundary

Status: ready
Decision: ready
Based on: approved UR Revision 1 and completed post-UR Brownfield Review
Date: 2026-09-04
Owner: Arndt Gold
Revision: 4

This is non-authorizing analytical input. It is not a user-gate artefact, carries no approval and
grants no implementation permission. After PRD approval, the PRD is the sole product authority.

## 1. Routing Evidence

- delivery_context: brownfield
- ui_ux_impact: high
- ui_ux_impact_reason: The product changes when AGDF is silent, when it presents governance state,
  how ambiguous and mixed requests behave, how active-run continuity is bounded and how missing
  control recovers across four host surfaces.
- ux_intent_definition_required: yes

## 2. Intent And Success

- primary_user_intent: Ask ordinary questions, assessments, explanations, comparisons, reviews and
  diagnoses without entering AGDF ceremony, while receiving governance automatically when asking the
  agent to deliver a change or explicitly operate AGDF.
- success_signal: The same requested effect yields the same activation result across supported
  surfaces. Ordinary read-only work has no AGDF-visible or request-caused AGDF-control side effect;
  an independently consented passive SessionStart health check may already have run. Legitimate
  delivery and explicit AGDF operations retain target, gate, approval and recovery behavior.
- primary_decision_or_action: Infer only whether this request is outside AGDF, explicitly activates
  AGDF, continues a specific active run, or is too ambiguous to mutate. Do not expose a new routine
  classification choice to the user.

## 3. Working Modes And State

- working_modes:
  1. `ordinary_read_only`: project assessment, explanation, comparison, recommendation, review,
     diagnosis, AGDF-as-a-topic discussion or advisory implementation discussion with no requested
     AGDF-supported software/project delivery effect and no formal AGDF artefact request.
  2. `delivery_intake`: the user asks the agent to build, change, fix, remove, refactor, execute or
     otherwise deliver an effect on a supported software/project target, or requests a formal AGDF
     delivery artefact as the intended output.
  3. `explicit_agdf_operation`: the user explicitly asks to use AGDF, invokes an AGDF skill, or asks
     to operate AGDF run/gate/status, suitability, approval, audit, closeout or global plugin
     lifecycle behavior. Merely naming AGDF, a run or a gate as the subject of discussion is not
     invocation.
  4. `explicit_control_lifecycle`: the user explicitly requests initialization, lifecycle/validity
     inspection or an existing target-bound repository activation/disable operation that retains
     durable control state.
  5. `active_run_continuation`: the current request expresses intent to perform the immediately pending
     run action, provides the exact pending approval or directly answers that action prompt. A question
     about a run/gate is not continuation. Informal continuation never substitutes for exact approval.
  6. `ambiguous_effect`: the requested effect cannot be determined reliably and no explicit delivery
     effect has precedence.
  `explicit_control_lifecycle` is the prioritized subtype only when the requested object is control
  initialization/validity or repository activation/disablement. Skills, governed run/gate status and
  global plugin install/uninstall remain `explicit_agdf_operation`; global operations retain their
  existing surface/scope authority. Generic AGDF status is one read-only explicit operation and may
  compose both existing views without becoming delivery intake. Mixed intent is a precedence case,
  not a separate mode: requested delivery resolves to `delivery_intake`; otherwise the request resolves
  to `ordinary_read_only` or `ambiguous_effect`.
- effective_state_by_mode:
  - `ordinary_read_only`: outside AGDF for this request; ordinary assistant handling is effective.
  - `delivery_intake`: AGDF applicability is effective before task-target, repository activation,
    run selection and gate evaluation.
  - `explicit_agdf_operation`: the expressly requested AGDF operation is effective, including read-only
    operations; discussion of AGDF remains ordinary.
  - `explicit_control_lifecycle`: the named lifecycle operation is effective and is not converted
    into an unrelated synthetic delivery requirement.
  - `active_run_continuation`: continuation intent is positive before control access; only after target
    and run revalidation can the specifically evidenced run action become effective.
  - `ambiguous_effect`: only read-only handling or one neutral clarification is effective; mixed intent
    has already resolved to delivery or ordinary read-only through precedence.
- visible_state_types:
  - no AGDF-visible state for ordinary read-only handling or internal false-positive abstention;
  - existing AGDF status, target orientation, gate transition and approval presentation after
    legitimate activation;
  - concise lifecycle result for explicit control operations, including not-initialized state;
  - one neutral clarification when the requested effect is materially ambiguous;
  - concise existing technical recovery when a legitimately activated operation cannot continue.
- effective_state_authority_by_mode:
  - the current user's requested effect is the activation authority for ordinary, delivery, explicit
    operation and lifecycle modes;
  - current-turn action intent activates run-continuation revalidation; durable selected-run state is
    consulted only afterward and decides whether continuation is valid;
  - exact approval text plus same-target, same-run, same-gate and same-revision validation remains the
    sole authority for gate transitions;
  - explicit invocation is evidenced by current-turn user text or a trusted ephemeral host event bound
    to the deliberate user action; automatic selection, host hooks, repository presence, current
    directory and prior unrelated turns are never activation or approval authority by themselves.
- primary_state_presentation_owner_by_mode:
  - normal assistant response for `ordinary_read_only` and neutral ambiguity clarification;
  - existing AGDF interaction presentation for activated target, status and gate states;
  - existing lifecycle/status response for explicit control operations;
  - no presentation owner for silent internal abstention because no AGDF state is exposed.

## 4. Activation, Blockers, Recovery And Transitions

- activation_paths:
  - Activate for an explicit requested AGDF-supported software/project delivery effect, not for
    isolated verbs inside quotations, examples, negations or advice questions.
  - Activate when the user asks to use AGDF or a named operation, even when the operation is read-only;
    do not activate merely because AGDF is the subject being explained or assessed.
  - Activate continuation revalidation only from current-turn intent to perform the pending action;
    durable run lookup and exact approval validation follow activation.
  - Do not activate for ordinary read-only requests. A model-selected false-positive AGDF skill must
    abstain before target resolution, repository activation, control access or status presentation.
  - Mixed requests activate when they include a requested delivery effect. Explicit constraints such
    as `do not implement` keep the request read-only unless another delivery effect remains.
  - A consented passive SessionStart check is request-independent setup, not an activation path. This
    run adds no new per-prompt, pre-tool or SessionStart hook.
- blockers:
  - Ambiguous requested effect blocks mutation, not explanation. Answer read-only where safe or ask
    one neutral question about the desired effect without mentioning AGDF.
  - After legitimate activation, unresolved target, missing approval, conflicting scope or invalid
    control state uses the existing AGDF blocker and visible next action.
  - Missing control is not one universal blocker: ordinary read-only never reaches it; lifecycle,
    control-independent help/suitability, run/gate status, gate-dependent review/QA/closeout,
    delivery intake and continuation each receive the product-specific outcome in the PRD.
  - A host capability gap may limit enforcement evidence but may not change the product classification
    or invent approval authority.
- recovery_paths:
  - False-positive discovery returns silently to the original ordinary request.
  - Ambiguity recovers through a read-only answer or one neutral effect clarification; if the user then
    requests delivery, activation starts from that new explicit request.
  - Explicit control initialization with a resolved target uses the existing lifecycle setup path;
    absence of control is expected input, not a synthetic UR loop.
  - Explicit AGDF status with no control reports the not-initialized lifecycle state and the available
    setup action without claiming an active run or requesting gate approval.
  - Gate-dependent review, QA, audit or closeout with no control reports unavailable required evidence
    and one restore/select/setup action without synthesizing a UR.
  - For control-less delivery that requires a durable UR, show the draft first. Bind it to an existing
    conforming durable record or obtain one explicit setup instruction, initialize and persist the
    run/UR revision before rendering the canonical approval presentation. Request exact approval once
    only after the durable identity exists and can be revalidated.
  - Legitimately activated transient technical failure presents one bounded retry or repair action;
    ordinary handling must not leak internal AGDF diagnostics.
- relevant_state_transitions:
  - `ordinary_read_only -> ordinary_response`: read-only effect recognized; no AGDF state is created or
    presented.
  - `false_positive_skill_discovery -> ordinary_response`: semantic applicability or one approved
    versioned non-classifying preflight abstains before dispatcher v1, target/control; original user
    request continues normally.
  - `ordinary_or_ambiguous -> delivery_intake`: the user explicitly requests implementation or a formal
    delivery outcome; AGDF starts before mutation.
  - `delivery_intake -> target_or_gate_state`: applicability established; existing target and gate
    authorities take over.
  - `explicit_agdf_operation -> requested_agdf_result`: named read-only or governed operation runs;
    existing authority decides its output.
  - `explicit_control_lifecycle -> lifecycle_result`: existing target-bound init/status/validation and
    repository-disable-with-retention semantics run without synthetic delivery approval. Global
    install/uninstall uses its existing surface/scope lifecycle outside this target-bound transition.
  - `run_continuation_intent -> selected_run_action`: target/run/gate is resolved and revalidated only
    after positive intent; a read-only question, new explicit target, completed/superseded run or
    conflicting scope ends the continuation binding.

## 5. Proposed PRD Acceptance Criteria

- proposed_prd_acceptance_criteria:
  - `RAB-UX-01`: In ordinary read-only mode, German and English assessment, explanation, comparison,
    recommendation, review and diagnosis prompts produce the requested answer with no AGDF mention,
    request-caused dispatch/control/status/approval action or card. Passive consented SessionStart
    setup is measured as a separate pre-request baseline.
  - `RAB-UX-02`: Advisory questions such as `Wie würdest du X implementieren?` remain read-only, while
    an explicit request to implement X activates AGDF before mutation.
  - `RAB-UX-03`: A mixed request that asks for assessment and repair activates AGDF; quoted, negated or
    hypothetical delivery wording alone does not.
  - `RAB-UX-04`: Explicit user request to use an AGDF skill or status operation activates the requested
    path and retains existing target, locale, status and approval presentation, while `Erkläre AGDF`
    and `Bewerte das AGDF-Projekt` remain ordinary topic discussion.
  - `RAB-UX-05`: Explicit control initialization with a resolved target uses the lifecycle path without
    a synthetic `Approval: UR` loop solely because control is missing.
  - `RAB-UX-06`: Explicit AGDF status with missing control reports not initialized and a setup action,
    without inventing a selected run or gate approval.
  - `RAB-UX-07`: A false-positive model-selected skill can abstain silently before target resolution,
    repository activation, control access and dispatcher v1 execution, then fulfil the original
    ordinary request. Any dedicated executable preflight is separately versioned, non-classifying and
    receives no raw prompt.
  - `RAB-UX-08`: Material ambiguity permits read-only handling or one neutral clarification, forbids
    mutation and emits no automatic AGDF status card.
  - `RAB-UX-09`: Active-run continuation starts only from current-turn action intent and succeeds only
    after revalidation; a read-only question about the run, new target, unrelated request or
    completed/superseded run ends inherited activation.
  - `RAB-UX-10`: Informal consent never advances a gate; exact approval and same-target/run/gate/revision
    revalidation remain required after activation.
  - `RAB-UX-11`: Canonical and generated Codex, Claude Code, Copilot and OpenCode surfaces carry the same
    semantics, while loaded-host observations remain separate evidence.
  - `RAB-UX-12`: A recoverable failure after legitimate activation shows one bounded retry/repair action;
    internal activation diagnostics are not exposed during ordinary handling.
  - `RAB-UX-13`: With missing control, help/suitability, run/gate status, gate-dependent later work,
    explicit initialization, delivery intake and continuation have distinct outcomes and only a new
    governed delivery start may create a new UR path.
  - `RAB-UX-14`: Current-turn user text or trusted ephemeral user-action provenance distinguishes
    deliberate skill invocation from automatic discovery; missing host provenance falls back to
    requested effect and never grants approval.
  - `RAB-UX-15`: A control-less delivery UR is drafted first, then linked or initialized only with
    explicit setup authority, persisted with stable run/revision identity, and only afterward presented
    for one exact approval. Brownfield opens after revalidation without post-hoc approval transfer.

## 6. Decision Evidence

- blocking_reason: none
- open_product_questions: none that prevents PRD drafting. The PRD must make the six request classes,
  precedence, prior-behavior supersession and criteria above authoritative. Technical ownership,
  versioning and projection remain SD questions.
- affected_outputs: canonical router and activation contract; skill discovery; SessionStart guidance;
  generated host profiles; false-positive applicability boundary; lifecycle/status routing; semantic
  routing and host-evidence matrices; user documentation describing when AGDF activates.
- evidence: approved UR Revision 1; completed Brownfield Review; canonical router, modes, target,
  interaction, dispatcher, lifecycle and generation sources; completed `installer-output-parity`
  behavior; active dispatcher v1 scope; independent router, dispatcher and hook audits.
- missing_evidence: No evidence is missing for UX definition. Technical design, implementation tests,
  generated-profile validation and fresh-session host observations are intentionally later-gate
  evidence.
- required_next_step: Incorporate this intent into the PRD and request exact `Approval: PRD` before
  Solution Design.
