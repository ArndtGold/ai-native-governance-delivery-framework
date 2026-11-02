# PRD: Request-Intent Activation Boundary

Status: approved
Gate: PRD
Gate approval: `Approval: PRD` accepted on 2026-09-04 after same-target, same-run, same-gate and same-revision revalidation of run revision `79CF00F1-B52B-4BA6-814A-8F6B90FC2BD2`
Based on: approved UR Revision 1, completed Brownfield Review and UX Intent Definition `ready`
Date: 2026-09-04
Owner: Arndt Gold
Revision: 4

## 1. Product Scope

AGDF must decide whether it applies to the current request before it resolves an AGDF task target,
activates repository governance, selects an AGDF run, dispatches a skill or evaluates control state.
That decision is request-scoped and based on the effect the user asks the agent to produce.

The governing product principle is:

> Ambiguity blocks mutation, but does not automatically activate AGDF.

### 1.1 Request applicability classes

| Class | Product meaning | AGDF result |
|---|---|---|
| `ordinary_read_only` | The user asks for assessment, explanation, comparison, recommendation, review, diagnosis or hypothetical/advisory implementation discussion and does not request an AGDF-governed software/project delivery effect, a formal delivery artefact or use of an AGDF operation. Merely discussing, explaining or assessing AGDF as a subject is included. | Abstain silently. Fulfil the request as ordinary assistant work. |
| `delivery_intent` | The user asks the agent to build, change, fix, remove, refactor, execute or otherwise deliver an effect on a software/project work target supported by AGDF, or asks for a formal AGDF delivery artefact as the intended output. | Activate AGDF before mutation or formal artefact creation. Existing mode and gate rules then choose the lightest permitted path. |
| `explicit_agdf_operation` | The user explicitly asks to use AGDF governance, invokes an AGDF skill, or requests a supported named AGDF run/gate/status, suitability, approval, audit, closeout or global plugin lifecycle operation. Merely naming AGDF, a run or a gate as the subject of an ordinary question is not enough. | Activate only the requested AGDF operation, including when it is read-only. Global installation/uninstall retains its existing surface/scope authority and does not invent a repository target. |
| `explicit_control_lifecycle` | The user explicitly asks to initialize or validate durable `.agdf/control`, inspect its lifecycle/validity, or perform an existing repository activation/disable action whose current contract retains control state. | Activate the target-bound control lifecycle path. Missing control is expected input for initialization and status, not a synthetic delivery UR. |
| `active_run_continuation` | The current request expresses intent to perform the immediately pending action for a run, supplies an exact pending approval, or is an unambiguous direct action response to that pending step. Merely naming or asking about a run/gate is not continuation. | Treat continuation intent as positive applicability, then resolve target and revalidate the run/gate before continuing. Existing gate authority remains unchanged. |
| `ambiguous_effect` | The requested effect cannot be determined reliably and no explicit mutation or formal delivery output is established. | Do not activate automatically and do not mutate. Answer within a read-only boundary or ask one neutral clarification. |

These classes decide AGDF applicability, not delivery depth. Quick Task, Compact Delivery, Verified
Change, Structured Slice and Structured Delivery remain downstream modes after legitimate activation.
Ordinary questions and reviews do not enter Quick Task merely because that mode can handle an
explicitly governed question or review.

For classification, `explicit_control_lifecycle` is the prioritized subtype when the requested
object is target-bound control initialization, control/config validity or repository
activation/disablement. `explicit_agdf_operation` owns skills, governed run/gate/delivery status and
global plugin installation/uninstall. A generic request for `AGDF status` remains one read-only
explicit operation and may compose existing lifecycle and run-status views; it never becomes delivery
intake merely because control is absent. Global lifecycle operations retain their existing
surface/scope authority and resolve an AGDF task target only when their named contract requires one.

A formal AGDF delivery artefact is an intended gate-relevant UR, PRD, SD, TP, QA/UAT record, OR or a
binding implementation plan meant to govern delivery. Asking how such an artefact could look, or
requesting an ordinary assessment report, remains read-only.

### 1.2 Precedence and mixed intent

1. An explicit user request to use an AGDF or control-lifecycle operation activates that named
   operation. AGDF as a discussion subject does not.
2. An explicit requested mutation or formal delivery outcome activates delivery even when the same
   request also asks for assessment, explanation or recommendations.
3. Explicit constraints such as `do not implement` or `nur bewerten` keep the constrained work
   read-only unless another requested delivery effect remains.
4. Delivery words inside quotations, examples, code, error messages, negations or hypothetical advice
   do not establish delivery intent by themselves.
5. Active-run continuation applicability comes only from current-turn continuation intent or an
   immediately bound action response. Durable run state is inspected only after that positive signal.
   A question about a run/gate is a read-only named operation, not continuation, and unrelated later
   questions never inherit AGDF activation.
6. If none of the positive activation conditions is reliable, the result is ordinary read-only or
   ambiguous effect, never automatic AGDF activation.

### 1.3 Required authority order

The observable product order is:

1. request applicability;
2. AGDF task-target resolution when applicability is positive and the named operation is target-bound;
3. requested lifecycle/skill operation or downstream mode and gate selection;
4. repository activation, run and control evaluation where required;
5. existing status, blocker, approval and recovery presentation.

Task-target, repository, run, gate, approval, locale and presentation owners remain authoritative
after applicability is established. The new boundary may decide only `abstain`, `activate the named
operation`, `activate delivery intake`, `activate continuation intent for downstream revalidation` or
`clarify without mutation`. It may not select a durable run, approve a gate or authorize
implementation.

### 1.4 Silent abstention and false-positive discovery

Silent abstention means all of the following for the current ordinary request:

- no AGDF mention, runtime hint, status card or approval request;
- no AGDF skill dispatch, task-target resolution, repository activation, run selection or control
  inspection;
- no durable AGDF state or classification record;
- normal repository inspection remains allowed when it is needed to answer the user's read-only
  project question, but `.agdf/control` is not consulted as an AGDF workflow side effect.

A previously consented SessionStart may already have loaded passive runtime or capability context
before the request. That passive, silent setup is not request activation. It must not classify the
request, select a run, inspect control because of the request or produce visible AGDF output.

An explicit user invocation is proven by current-turn user text that asks to use AGDF or a supported
operation, or by a trusted ephemeral host event bound to the current user action. Host metadata is
supporting invocation evidence, never approval or durable policy authority. When such provenance is
unavailable, the current user text and requested effect decide; host/model skill selection alone is
not positive evidence. If automatic discovery was a false positive, the applicability boundary must
return silently to the original ordinary request before dispatcher v1, task-target or control
execution.

The semantic applicability decision is not an operational repository or tool callback. If SD proves
that instruction-level enforcement is insufficient, it may propose one separately versioned,
non-authorizing applicability preflight executed only after AGDF skill selection. That preflight may
validate a bounded transient decision but may not receive or persist raw prompt text, classify intent
itself, call dispatcher v1, resolve target or inspect control when abstaining.

### 1.5 Missing-control behavior

| Request class | Required behavior when `.agdf/control` is absent |
|---|---|
| `ordinary_read_only` | No AGDF control probe and no AGDF response. |
| `delivery_intent` | Continue through the existing lightest-safe mode/gate intake. When a durable UR is required, first present a concrete draft revision. Before requesting approval, bind that revision to an existing conforming durable run/SoT record, or request one explicit control-setup instruction, initialize and persist the UR plus minimum run/revision state. Only then render the canonical approval presentation and request `Approval: UR` once. Setup refusal or failure leaves delivery gated without an approval request. |
| `explicit_agdf_operation`: control-independent help or suitability | Fulfil the named read-only operation and state absence of active control/run only when relevant. Do not invent a UR approval. |
| `explicit_agdf_operation`: current run/gate/status inspection | Report that durable control and a selected run are unavailable, with the existing setup or target recovery action. Do not convert inspection into delivery intake. |
| `explicit_agdf_operation`: gate-dependent review, QA, audit or closeout | Block because the required run/control evidence is unavailable. Ask only for restore/select/initialize or an explicit new governed delivery start, whichever the named operation requires; do not synthesize a new UR. |
| `explicit_agdf_operation`: explicit governed delivery start | Use the same lightest-safe delivery intake as `delivery_intent`, including the durable-UR transition above when required. |
| `explicit_control_lifecycle` | Use existing target-bound initialization, lifecycle status/validation and repository disable-with-retention behavior after target resolution and normal safety checks. Absence is not an error for explicit initialization/status. Deletion of durable control is outside this PRD. |
| `active_run_continuation` | Applicability uses only continuation intent. Subsequent run revalidation fails closed because durable evidence is unavailable and requests the bounded recovery needed to restore or resolve that run; it does not reinterpret the request as a new UR. |
| `ambiguous_effect` | No control probe, no mutation and no AGDF card. |

### 1.6 Superseded and retained behavior

This PRD supersedes the completed `installer-output-parity` requirement for a visible generic
no-run/no-approval orientation only when the request is `ordinary_read_only` and does not explicitly
invoke AGDF. It retains existing visible behavior for explicit AGDF suitability checks, status,
lifecycle, target recovery, gates, approvals, audit and closeout.

It also supersedes the universal target-first ordering only for automatic skill discovery before
positive request applicability exists. After explicit user invocation or positive delivery,
lifecycle or continuation applicability, the existing task-target contract remains fully
authoritative and still runs before repository activation, run selection and control evaluation.

For control-less delivery, it supersedes the fresh-request order that asks for `Approval: UR` before
a durable run and artefact revision exist. The new order is draft UR, obtain explicit setup authority
when no conforming durable record exists, persist run and revision, render canonical approval
presentation, then request the exact approval once. All approval validation rules remain unchanged.

The product must have one canonical request-activation authority. Existing SessionStart, skill
descriptions, dispatcher bindings and generated host profiles are consumers. No new SessionStart,
per-prompt, pre-tool or host-specific hook is delivered by this run, even as a thin consumer.
Existing hooks may supply passive capability context only: no request classification, activation
decision, applicability state, run selection or host-specific semantics. A future non-classifying
pre-mutation backstop requires a separate scope and is outside this PRD.

## 2. UX Intent And Success

- ui_ux_impact: high
- ux_intent_definition: `.agdf/control/artefacts/agdf-request-activation-boundary/UX_INTENT_DEFINITION.md`; decision `ready`
- primary_user_intent: Receive normal help for ordinary read-only work without AGDF ceremony, while
  receiving automatic governance when asking the agent to deliver a change or explicitly operate
  AGDF.
- success_signal: The same requested effect produces the same activation result across supported
  surfaces. Ordinary read-only work is completely AGDF-silent. Legitimately activated work retains
  target, gate, approval, locale, blocker and recovery behavior.
- primary_decision_or_action: Determine applicability without adding a routine user-facing choice;
  either fulfil ordinary work, activate the requested AGDF path, continue an evidenced run, or stay
  read-only and clarify an ambiguous effect before any mutation.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| `ordinary_read_only` | Outside AGDF for this request; ordinary assistant handling is active. | Requested answer only; no AGDF state. | Current user's requested read-only effect. | Normal assistant response. |
| `delivery_intent` | AGDF applicability is established; downstream mode/gate policy determines what is allowed. | Existing AGDF target, status, gate, approval or compact-path presentation only when applicable. | Current user's explicit requested delivery effect, then existing AGDF authorities. | Existing AGDF interaction presentation after activation. |
| `explicit_agdf_operation` | Only the expressly requested AGDF operation is active; discussing AGDF is not operation. | Existing operation-specific result, status, blocker or approval view. | Current-turn user text or trusted ephemeral user-invocation event plus the named skill/operation contract. | Existing AGDF skill and interaction presentation. |
| `explicit_control_lifecycle` | The named existing control lifecycle action is active; control deletion is not implied. | Concise initialized, not-initialized, valid, invalid, disabled-with-retention or recovery result. | Explicit user lifecycle request plus resolved target and existing lifecycle safety/retention rules. | Existing lifecycle/status presentation. |
| `active_run_continuation` | Continuation intent is positive; the selected-run action becomes effective only after downstream target/run/gate revalidation. | Existing current-gate, blocker, approval or internal-step result. | Current-turn action intent, then durable run state; exact approval still requires same-target/run/gate/revision validation. | Existing AGDF interaction presentation after revalidation. |
| `ambiguous_effect` | Mutation and formal delivery are inactive; read-only assistance remains available. | Ordinary answer or one neutral clarification; no AGDF card. | Current request and explicit constraints; inherited context cannot supply missing mutation intent. | Normal assistant response. |

`false_positive_discovery` is an internal transition condition, not a seventh applicability class or
working mode. Its only product outcome is silent return to `ordinary_read_only`.

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation:
  - Applicability is evaluated for each request and is not a repository-wide conversational mode.
  - Express use of AGDF, an explicit existing lifecycle action, an explicit supported delivery effect
    or current-turn continuation intent activates the bounded path described above. Mentioning AGDF,
    a run or a gate as a discussion subject does not.
  - Ordinary read-only and unresolved ambiguous effect do not activate AGDF.
  - A continuation binding is considered only after current-turn action intent. It ends for a new
    explicit target, an unrelated/read-only question, conflicting scope, a completed or superseded
    run, or any request that no longer asks to perform the pending run action.
  - A false-positive automatic selection deactivates before target, dispatch and control and resumes
    the original request without visible AGDF output.
- blockers_and_visible_next_actions:
  - Ambiguous effect blocks mutation only. Provide a useful read-only answer where possible; otherwise
    ask one neutral question about whether the user wants advice or an actual change.
  - After legitimate activation, preserve existing target-unresolved, scope-conflict, missing-approval,
    invalid-control and quality blockers with their existing bounded next actions.
  - Missing control is classified by the request table in section 1.5 and must not automatically
    produce an unrelated UR approval.
  - Host capability limits may reduce technical enforcement or evidence but never change activation
    semantics or create gate authority.
- recovery_paths:
  - False-positive discovery: silently resume the ordinary request.
  - Ambiguous effect: answer read-only or obtain one explicit effect clarification; reevaluate the new
    request without carrying a hidden prior classification.
  - Explicit run/gate status without control: report not initialized/no selected run and offer the
    existing setup or target action without an approval prompt.
  - Explicit gate-dependent review, QA, audit or closeout without control: report unavailable required
    evidence and the bounded restore/select/setup action; do not start a synthetic UR.
  - Explicit initialization without control: use existing target and lifecycle safeguards, then report
    the actual lifecycle result.
  - Control-less delivery that requires a durable UR: show the draft, then use an existing conforming
    durable record or obtain one explicit setup instruction before initialization. Persist the run and
    UR revision first, render its canonical approval presentation second, and request approval once.
    Setup refusal or failure remains a visible pre-approval blocker.
  - Activated target/gate failure: use existing localized target, status and recovery presentation.
  - Recoverable technical failure after legitimate activation: show one bounded retry or repair action.
    Internal applicability diagnostics remain invisible during ordinary handling.
- relevant_state_transitions:
  - `ordinary_read_only -> ordinary_response`: requested read-only effect recognized; no AGDF side effect.
  - `automatic_skill_selection -> applicability_abstention -> ordinary_response`: false positive
    detected semantically or by an approved versioned applicability preflight before dispatcher v1,
    target and control.
  - `ordinary_or_ambiguous -> delivery_intent`: user explicitly requests an actual change or formal
    delivery artefact; AGDF activates before that effect.
  - `delivery_intent -> downstream_mode_or_gate`: applicability is positive; existing proportionality
    and authority rules take over.
  - `explicit_agdf_operation -> operation_result`: named operation executes within its existing authority.
  - `explicit_control_lifecycle -> lifecycle_result`: existing lifecycle path handles present or absent
    control without a synthetic delivery gate.
  - `run_continuation_intent -> selected_run_action`: the intent activates bounded revalidation;
    target/run/gate/revision is resolved only afterward and before any authorizing transition.
  - `active_run_continuation -> ordinary_or_new_scope`: unrelated request, new explicit target or closed
    run ends the inherited binding and applicability is reevaluated.

## 5. Acceptance Criteria

| criterion_id | working_mode | source_state | trigger/action | expected effective state | visible feedback | blocker/failure behavior | recovery/next action | observable success | required evidence |
|---|---|---|---|---|---|---|---|---|---|
| `RAB-01` | `ordinary_read_only` | New or unrelated conversation; repository may or may not contain control state; passive SessionStart context may already exist. | Ask in German or English to assess, explain, compare, recommend, review or diagnose a project without requesting a change. | Request stays outside AGDF. | Requested answer only. | No request-caused dispatcher v1, target, repository-activation, run, control, renderer, status or approval action is permitted. | None; continue ordinary conversation. | Zero AGDF-visible text and zero prohibited request-caused callbacks; passive silent SessionStart setup is unchanged. | Versioned expected-outcome fixtures, callback-delta tests and separate fresh-session observations on every supported host. |
| `RAB-02` | `ordinary_read_only` / `delivery_intent` | Same target and topic. | Compare `Wie würdest du X implementieren?` with `Implementiere X`. | Advisory form remains read-only; imperative delivery form activates before mutation. | Advice for the first; existing AGDF intake for the second. | First may not mutate; second may not mutate before the downstream path permits it. | User can convert advice to delivery with a new explicit request. | Paired prompts produce distinct expected activation outcomes. | German/English paired semantic evals and no-mutation evidence. |
| `RAB-03` | `delivery_intent` | Request combines analysis and delivery. | Ask `Bewerte das Projekt und behebe die Probleme` or an English equivalent. | Entire requested delivery outcome is AGDF-applicable. | Existing AGDF intake, not a completed assessment followed by ungated mutation. | Existing target/gate blockers apply. | Follow the next permitted AGDF step. | AGDF activates before any fix. | Mixed-intent eval and ordered callback/test trace. |
| `RAB-04` | `ordinary_read_only` / `delivery_intent` | Prompt includes delivery vocabulary in context. | Quote, negate or discuss implementation text without requesting it, then compare with an actual delivery request. | Quoted, example, error-message, negated and hypothetical text does not activate by keyword alone; requested delivery does. | Ordinary response or normal AGDF intake respectively. | Ambiguity blocks mutation but does not emit an AGDF card. | Neutral effect clarification only when needed. | Adversarial cases follow requested effect rather than token matches. | German/English quote, negation, code-block and hypothetical corpus. |
| `RAB-05` | `explicit_agdf_operation` | Current-turn user text asks to use AGDF/a supported operation, or a trusted ephemeral host event proves deliberate user invocation. | Compare `Erkläre AGDF` or `Bewerte das AGDF-Projekt` with `Bewerte dieses Projekt mit AGDF` or a deliberate skill invocation. | Discussion stays ordinary; deliberate use activates only the named operation. | Ordinary answer or existing localized operation/status presentation respectively. | Automatic host/model selection or mere AGDF/run/gate mention is insufficient. Existing target, control and gate blockers remain authoritative after activation. | Ask to use the named operation explicitly when host provenance and text are both insufficient. | Explicit operations remain functional without reintroducing topic-based overactivation. | Paired topic/use fixtures, direct-skill regression and per-host invocation-provenance observation. |
| `RAB-06` | internal `false_positive_discovery` transition | Host/model automatically selects an AGDF skill for an ordinary request; user did not invoke AGDF. | Canonical semantic applicability, or a separately approved versioned applicability preflight, evaluates the selection. | Silent abstention occurs before dispatcher v1, target, repository activation and control. | No AGDF output; original request is answered. | Any dispatcher v1, target, repository, run, control or renderer callback, AGDF banner, raw-prompt transfer or persisted classification is a failure. Passive prior SessionStart setup and a compliant dedicated applicability preflight are not dispatcher/workflow callbacks. | Resume original ordinary handling without asking the user to repair AGDF. | False selection produces no AGDF workflow side effect. | Callback-spy test, expected-outcome routing corpus, versioned-preflight test when applicable and fresh-host negative observation. |
| `RAB-07` | `delivery_intent` | No conforming durable control/run or linked authoritative UR exists. | Request a change that requires a durable UR. Review its draft, explicitly authorize setup when no conforming durable record exists, then review the canonical approval presentation and approve that persisted revision. | No automatic initialization occurs. Setup/link and UR/run persistence precede the only approval request; exact approval is accepted only after same-target/run/gate/revision revalidation and then opens Brownfield Review. | Draft UR, one setup request/result when needed, then one canonical approval request and normal post-approval transition. | Setup refusal/failure blocks before approval. Missing durable identity, stale revision or failed revalidation prevents approval acceptance. | Authorize/repair setup, then approve the persisted revision once; revise the UR when needed. | A control-less delivery reaches Brownfield readiness without post-hoc approval persistence, repeated approval or silent auto-init. | End-to-end test covering draft, setup consent/refusal/failure, initialization/link, persisted identity, canonical approval, revalidation and Brownfield readiness. |
| `RAB-08` | `explicit_control_lifecycle` | No durable control exists; target is resolved. | Explicitly request `Lege .agdf/control an` or equivalent initialization. | Existing control initialization lifecycle is selected. | Actual setup result and next lifecycle action. | Target ambiguity or lifecycle safety failure blocks with bounded recovery; no synthetic UR loop. | Resolve target or retry the existing lifecycle action. | Initialization can start from absent control without requesting unrelated `Approval: UR`. | Lifecycle integration test plus clean-repository host/CLI evidence. |
| `RAB-09` | `explicit_agdf_operation` | No durable control exists. | Explicitly request current AGDF run/gate status. | Read-only run-status inspection is active; no run or gate is invented. | Not-initialized/no-selected-run status and available setup or target action. | No `Approval: UR` solely due to absence. | User may explicitly request initialization or a new governed delivery start. | Status accurately distinguishes unavailable control from pending UR. | Run-status integration test and host observation. |
| `RAB-10` | `ambiguous_effect` | No reliable requested mutation or formal delivery effect. | Submit a materially ambiguous request. | Mutation and formal artefact creation remain inactive. | Useful read-only answer or one neutral effect clarification; no AGDF card. | Silent guessing toward mutation or AGDF activation is a failure. | Reevaluate only after a new explicit user answer. | Ambiguity is safe without governance ceremony. | Ambiguous German/English expected-outcome cases and no prohibited request-caused callback assertion. |
| `RAB-11` | `active_run_continuation` | The immediate conversation contains one pending AGDF action; no run/control lookup has yet occurred for this request. | Express intent to perform that action, provide its exact pending approval or answer its concrete action prompt. Merely ask about/name the run or gate as a subject in a read-only question. | Action intent activates downstream revalidation; a question activates only read-only named inspection. Only a successfully revalidated run may continue. | Existing action/status, approval or bounded recovery result. | Mismatch, stale revision, competing run, unavailable run or unclear action reference fails closed. | Existing run/target clarification, restore action or renewed approval. | Continuation is action-based and does not require pre-applicability run inspection. | Multi-turn action-vs-question, competing-run, missing-run and stale-revision tests. |
| `RAB-12` | `active_run_continuation` / `ordinary_read_only` | Prior AGDF work exists. | Ask an unrelated/read-only question, name a new explicit target or request action after run completion/supersession. | Prior activation binding ends; current request is classified independently. | Ordinary response or new target/applicability flow. | Prior run may not silently govern the unrelated request. | Explicitly ask to perform an action on the prior run when it is still valid; naming it only as a discussion subject is not continuation. | Unrelated follow-up has no inherited AGDF output. | Multi-turn deactivation eval and fresh-session/resumed-thread evidence. |
| `RAB-13` | all activated modes | Legitimate activation is established. | Attempt an approval or other authorizing transition. | Existing exact-value and same-target/run/gate/revision authority remains unchanged. | Existing approval/status presentation. | Informal consent, host permission, hook output or stale state does not authorize. | Supply exact current approval after revalidation. | No activation path weakens a gate. | Existing approval regression suite plus focused new cases. |
| `RAB-14` | all modes | Canonical source is projected to supported surfaces. | Generate/package Codex, Claude Code, GitHub Copilot and OpenCode profiles. | Every projection expresses the same applicability classes, precedence, silence and retained explicit-operation behavior. Existing hooks remain passive capability consumers, and no new per-prompt/pre-tool hook is introduced. | Surface-native output may differ only in presentation capability. | Independent host policy, generated-file ownership, hook-owned classification/state or semantic drift fails validation. | Correct the canonical owner and regenerate. | Source and generated semantics are equivalent with one activation owner. | Runtime Integrity, deterministic generation/digest checks, hook inventory and semantic projection tests. |
| `RAB-15` | all modes | Implementation and package tests pass. | Load a fresh supported host session and run negative, positive, mixed, lifecycle and continuation probes. | Observed host behavior matches the PRD for the exact loaded version. | Per-host transcript/evidence with no inferred parity. | Repository or package evidence alone cannot claim host pass. | Fix/reinstall/restart and rerun only the affected host evidence. | Every supported host is separately classified. | Version-bound fresh-session evidence for Codex, Claude Code, Copilot and OpenCode. |
| `RAB-16` | `ordinary_read_only` / activated modes | Applicability logic handles user text. | Classify and route representative prompts. | No remote classifier is called and raw prompt text or derived classification is not persisted as new durable state. | No additional routine user disclosure or classification UI. | Unexpected network access or prompt persistence blocks QA. | Remove the dependency/state and rerun privacy checks. | Routing remains local to existing model/host context and request-scoped. | Dependency inspection, network/persistence test and code review. |
| `RAB-17` | activated failure recovery | AGDF is legitimately active and a recoverable runtime operation fails. | Encounter a supported transient or repairable failure. | Existing authority remains unchanged and one bounded recovery is available. | One concise retry or repair action. | Repeated retries, silent authorization or ordinary-mode diagnostic leakage fail. | Retry once or perform the named repair. | Recovery is visible only after legitimate activation. | Failure-injection tests and representative host observation. |
| `RAB-18` | formal artefact boundary | User discusses or requests a delivery artefact. | Compare `Wie könnte ein PRD aussehen?` or `Welche Schritte würdest du empfehlen?` with `Erstelle das verbindliche PRD` or `Erstelle den verbindlichen Umsetzungsplan für diese Änderung`. | Example/advice stays read-only; intended gate-relevant artefact activates the applicable path. | Example content or AGDF intake respectively. | A formal artefact may not be created outside its required gate. | User can explicitly request the governed artefact. | Advisory and authoritative artefact requests are distinguished by requested effect. | German/English paired evals and artefact-creation guard test. |
| `RAB-19` | `explicit_agdf_operation` | No durable repository control exists. | Invoke control-independent AGDF help/suitability, inspect run/gate status, request a gate-dependent review/QA/audit/closeout operation, or request global plugin install/uninstall. | Help/suitability runs without invented state; status reports no control/run; gate-dependent operations block on unavailable evidence; global lifecycle uses existing surface/scope authority without inventing a task target. None synthesizes a new UR unless the user explicitly starts governed delivery. | Operation-specific result with one relevant setup/restore/start or global lifecycle action. | Generic missing-control `Approval: UR` for inspection/later-gate work, or a fabricated repository target for global lifecycle, is a failure. | Initialize/restore/select existing state, explicitly start new governed delivery, or follow the existing global lifecycle action as appropriate. | Every explicit operation family has a distinct no-control outcome and authority. | Complete operation-family missing-control/authority matrix and regression tests. |
| `RAB-20` | `explicit_agdf_operation` | Host surfaces provide different skill-selection metadata. | Invoke a skill deliberately through user text or native UI, then compare automatic selection and missing-provenance cases. | Current-turn user text or trusted ephemeral user-action provenance can activate; automatic selection alone cannot. When provenance is unavailable, requested effect in user text decides. | Named operation result for proven invocation; otherwise ordinary response or neutral clarification. | Host metadata never approves a gate or becomes durable authority. | Ask explicitly to use AGDF only when deliberate invocation cannot otherwise be established. | Explicit-vs-automatic behavior is evidenced per host without relying on a universal metadata field. | Version-bound provenance matrix and fresh-host observations. |

## 6. Non-Goals

- No general-purpose classifier for every assistant intent beyond AGDF applicability.
- No keyword-only activation list and no remote classification service.
- No raw prompt or activation-class persistence as a new source of truth.
- No new SessionStart, per-prompt, pre-tool or host-specific hook in this run. Existing hooks remain
  passive capability/context consumers and may not classify requests or own activation state.
- No pre-mutation hook in this run; it may be assessed later only as non-classifying defense in depth
  under a separate scope.
- No automatic implementation or formal artefact creation when requested effect is ambiguous.
- No automatic `.agdf/control` initialization for ordinary delivery intake.
- No deletion of `.agdf/control` or change to existing disable/uninstall retention semantics.
- No weakening or replacement of task-target, repository-activation, run, gate, exact approval, locale,
  status, presentation, quality or release authority.
- No in-place change to dispatcher contract v1 as a presumed solution. If SD proves an executable
  backstop necessary, it must be explicitly versioned and compatibility-tested.
- No modification of the independent `cross-surface-executable-skill-dispatcher` QA evidence or
  `opencode-native-dispatch-tool` permission scope.
- No claim that source, generated package or repository tests prove installed or freshly loaded host
  behavior.

## 7. Users And Roles

- Requesting user: states the desired effect and may explicitly invoke AGDF or a control lifecycle
  operation. The user is not required to learn an activation taxonomy.
- Product or delivery owner: approves UR, PRD, SD, TP, QA and UAT with existing exact gate values.
- Agent/host model: interprets requested effect against the canonical product contract and either
  abstains, activates the bounded AGDF path or asks one neutral clarification.
- AGDF target, dispatcher, gate and presentation owners: remain authoritative only after legitimate
  applicability and within their existing boundaries.
- Maintainer/release owner: validates canonical projection, compatibility, rollout and separately
  observed host behavior.

## 8. Constraints

- Classification is semantic, effect-based and limited to AGDF-supported software/project delivery.
  Isolated words, repository presence, current working directory, installed plugin state and prior
  unrelated chat are insufficient activation evidence. Unrelated external actions do not activate
  AGDF unless the user explicitly requests AGDF governance for them and a supported operation exists.
- The applicability decision must precede all AGDF task-target, repository, run, control and
  presentation work. Normal read-only project inspection is not prohibited.
- The result is request-scoped and non-authorizing. It cannot approve gates, grant mutation authority
  or override a blocker.
- Explicit user AGDF invocation must remain distinguishable from automatic model/host skill discovery.
  Current-turn user text is sufficient when it expressly requests AGDF use. A trusted ephemeral host
  event bound to the user's deliberate action may also prove invocation; when neither exists, host
  selection alone is insufficient and requested effect in user text decides.
- Existing dispatcher v1 is compatibility-sensitive and remains a post-activation orchestrator by
  default. The semantic applicability decision is not an operational tool/repository action, so v1
  remains the first existing dispatcher call after positive direct-skill activation unless approved
  SD explicitly introduces a separately versioned preflight.
- Existing `init`, status, doctor, gate-check and lifecycle safety behavior must be reused rather than
  duplicated as request-specific implementations.
- Canonical sources own semantics; generated profiles and host adapters may only project them.
- A consented SessionStart health/runtime check may inspect configuration or control independently
  before a user request under its existing consent contract. It is not request activation and must
  remain silent/passive for ordinary work; request-level evidence is measured from the post-SessionStart
  baseline.
- Codex, Claude Code, GitHub Copilot and OpenCode have different hook and presentation capabilities,
  but those differences may not change the product result.
- OpenCode subagent hook limitations and any other host enforcement gaps must be disclosed and tested;
  they may not be represented as product parity.
- Artefacts remain English and user-facing chat follows the configured/current conversation language.
- No remote network dependency, raw prompt persistence or second approval/state store is permitted.
- Context Graph reconciliation follows approved SD and must represent exactly one request-activation
  authority before existing target, dispatch and interaction authorities. Whether that requires a new
  node or an existing-node update, including identifiers and relationships, is an SD decision.

## 9. Evidence Requirements

- A versioned German/English expected-outcome contract corpus covering every request class, positive
  and negative examples, mixed intent, formal-artefact pairs, quotations, negations, code blocks,
  ambiguity and active-run continuation/deactivation. Deterministic fixture validation and behavioral
  model/host evaluation must be reported separately.
- Tests that observe call order and prove silent abstention invokes no dispatcher v1, target resolver,
  repository activation, run selector, control evaluator or AGDF renderer.
- Regression evidence that valid explicit skills, status, lifecycle, target recovery, exact approvals,
  locale and gate presentation retain their existing behavior after activation.
- A missing-control matrix proving distinct ordinary, delivery, control-independent operation,
  run/gate status, gate-dependent operation, explicit initialization and continuation outcomes,
  including explicit setup and durable run/UR persistence before the one approval request.
- Deterministic source-to-profile generation, semantic projection and Runtime Integrity evidence for
  Codex, Claude Code, GitHub Copilot and OpenCode without hand-edited generated policy.
- Dispatcher v1 compatibility evidence when unchanged. If an executable backstop is approved in SD,
  versioned schema, migration, failure, downgrade and rollback evidence is required.
- Per-host evidence for deliberate user invocation, automatic discovery and unavailable invocation
  provenance. Host metadata is evidence only and may not become approval or durable policy authority.
- A post-SessionStart callback baseline proving that ordinary requests cause no dispatcher v1, target,
  repository-activation, run, control or renderer work even when an independently consented passive
  health check already ran at session start.
- Tests or inspection proving no remote classifier, raw-prompt persistence or new approval/state store.
- Separate version-bound, fresh-session observations for each supported loaded host. Source, generated
  package, installed bytes and host behavior must be reported as different evidence planes.
- A clean implementation review must reject duplicate classifiers, host policy forks, keyword lists,
  hidden fallbacks and a second hook acting as the activation owner.

## 10. Risks And Open Questions

### Product risks resolved by this PRD

- Advisory discussion versus actual delivery is resolved by requested effect, including the paired
  criteria `RAB-02` and `RAB-18`.
- Ordinary read-only visibility is resolved as silent; explicit AGDF and lifecycle operations remain
  visible.
- Mixed intent, quotations, negations and ambiguity are resolved through the precedence rules in
  section 1.2.
- Active-run continuity starts from current-turn action intent rather than pre-applicability run
  inspection, and ends on unrelated work, a new target, conflict or closed run; exact gate approvals
  remain unchanged.
- Missing control is resolved through the request-class matrix in section 1.5.
- Consented SessionStart health/config inspection is an explicitly request-independent, non-activating
  exception. It stays passive and ordinary-request evidence begins after that setup baseline.

### SD questions that do not change product intent

- Which canonical source file owns the applicability contract and how all router, skill, SessionStart
  and adapter consumers reference it without copying policy.
- How an automatically selected skill performs the applicability backstop before the existing direct
  task-target preflight and dispatcher v1 while an explicit user skill invocation remains positive.
- Whether instruction and evaluation enforcement is sufficient or a separate versioned executable
  preflight is required. Dispatcher v1 must not be changed in place.
- How existing `init`, status, doctor and gate-check entry points implement the missing-control matrix
  and the approved-UR persistence transition without duplicating lifecycle or gate logic.
- How each host transports current-turn deliberate invocation provenance when available, and how the
  user-text fallback works when it is not.
- How generated profiles are upgraded, rolled back and bound to version-specific fresh-session
  evidence.
- Whether Context Graph reconciliation uses a new request-activation node or an existing-node update,
  and how the resulting authority relationships are represented after design approval.

If SD cannot satisfy silent false-positive abstention before target/control without changing the
approved product boundary, the issue routes back to PRD revision rather than adding a hidden hook or
parallel classifier.

## 11. Next Step

Draft the Solution Design. Implementation remains forbidden until later gates and required internal
steps are satisfied.
