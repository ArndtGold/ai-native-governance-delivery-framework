# PRD: Recognizable MCP failures and safe corrective guidance

Status: draft
Gate: PRD
Gate approval: open
Based on: approved UR; completed Brownfield Review; ready UX Intent Definition
Date: 2026-10-19
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Deliver Phase 1 of the MCP ergonomics follow-up: actual failures of the seven existing AGDF MCP tools, Cockpit tools and their worker/runtime execution must be unmistakable tool errors and explain the specific permitted correction. Preserve existing successful results, governance authority, effect evidence and supported protocol behavior. The approved UR is the primary requirement source; the Brownfield Review and UX analysis are subordinate inputs. This PRD defines intended observable behavior, not delivered implementation.

The classification follows the requested operation rather than a word such as blocked inside its data:

| Requested operation and result | Required product interpretation | Feedback and next action |
|---|---|---|
| Dispatch cannot resolve the required target, rejects semantic input, or encounters an evaluator/runtime failure | Actual tool failure | Error flag, specific known cause and supported correction or recovery. |
| Dispatch successfully routes to an internal skill/intake, presents a decision or reports a governance blocker | Successful routing/report | Preserve its existing response and human-decision boundary; no error flag merely because approval or work is blocked. |
| Inspect successfully delivers doctor/readiness/status information that describes missing prerequisites or not-ready material | Successful report | Preserve the observed condition and next prerequisite; no false execution failure. |
| Inspect cannot resolve the required target, load the requested exact document or fulfil another required read | Actual tool failure | Error flag and the correction or concrete limit of access. Do not substitute another target/document. |
| Command is rejected, needs recovery, or has uncertain effects | Actual tool failure | Preserve Core's distinct outcome, reason and effect/receipt evidence; explain the next supported action. |
| Command succeeds or the original exact operation is already applied | Successful command result | Preserve the existing result and receipt, including historical-effect distinctions; do not execute again to improve presentation. |
| Cockpit cannot open/read the requested view, snapshot, document or context due to an execution/capability/access/lifetime limit | Actual tool failure | Error flag and operation-specific limit/correction without bypassing permissions. |
| Cockpit successfully reads a view whose run, item or document availability describes a governance block | Successful report | Preserve the view's state; an embedded blocked item alone cannot fail the whole call. |

The transport representation and cause catalogue are SD concerns. This table does not introduce a second evaluator of approval, command eligibility or effect truth.

## 2. UX Intent And Success

- ui_ux_impact: medium
- ux_intent_definition: ready; .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/UX_INTENT_DEFINITION.md, recorded through operation 5e532386-9d8b-447f-9a7d-606f245eda52.
- primary_user_intent: Understand failure, known effects and the next safe correction without consulting internal code or guessing required bindings.
- success_signal: The tool result itself distinguishes a failed operation from a successful blocked-state report and gives a usable cause, prerequisite and next action; human decisions remain explicit.
- primary_decision_or_action: Correct input, obtain a missing prerequisite, observe the original operation, retry when eligible, or stop for a deliberate human decision.

The UX analysis walked through blocked-state reporting, missing target, stale revision, lost write response, denied Cockpit access and pre-dispatch input failure. This PRD adopts their state and recovery distinctions in the criteria below. That walkthrough was analytical source review by the agent. No prototype, user trial, implementation behavior or native-host improvement has been observed. No UI preview is required.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Existing read/report usage | Observed project/run/resource state, with no mutation | Successful data; successful blocked/pending report; failed requested read | Existing Core readers, target/resource guards and current state | Existing MCP result text and supported host/Cockpit view |
| Existing prepare/command usage | Existing command outcome and known effect evidence | Accepted/already-applied; rejected; recovery-required; effect-unknown | Existing Core command and receipt owners; trusted runtime evidence only for known dispatch facts | Existing MCP result and host; human gate decision remains in the existing decision flow |
| Existing original-operation recovery | Original identity, payload and observed status/receipt | Confirmed recorded effect; known non-dispatch; pending/unknown recovery | Existing operation-status/recovery service and exact receipt/binding checks | Existing MCP result and supported recovery explanation |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: A deliberate call to an existing tool triggers its existing execution path. No automatic approval, extra mode, alternate run selection or new automatic recovery is introduced. Invocation ends with an honest result; further calls remain separate authorized actions.
- blockers_and_visible_next_actions: Identify the invalid field or confirmed missing binding; stale revision/presentation; permission/capability restriction; missing human decision; unavailable original receipt; or actual runtime fault. Tell the caller what must be corrected or obtained, not merely that something failed.
- recovery_paths: Offer a visible retry instruction for recoverable transient failures only with its actual prerequisite and known effect constraints. Correctable semantic input requests the specific correction. Stale data requests fresh observation and, where applicable, a fresh deliberate presentation/approval. Unknown write effects require inspecting the original operation status and preserving UUID and exact payload before any existing supported replay. Missing authority or target choice requires the corresponding human decision, never inferred consent. Unknown causes use a truthful bounded stop/diagnostic path, without unsupported reinstall advice or unbounded retries.
- relevant_state_transitions: Invalid input -> corrected request -> eligible execution; valid blocked-state report -> supplied prerequisite -> fresh report; stale state -> fresh binding/presentation -> eligible action; unknown effect -> original status/receipt observation -> confirmed effect or existing recovery. A failed observation leaves uncertainty visible and forbids blind replay. Error formatting changes none of the underlying state transitions or rollback rules.

## 5. Acceptance Criteria

### AC-001: Actual tool failures are recognizable

- criterion_id: AC-001
- derives_from: UR ERR-01 and ERR-03.
- working_mode: Read/report and prepare/command.
- source_state: A request reaches an existing tool and cannot fulfil its requested operation according to the product classification above.
- action: Invoke that tool with a domain failure, rejected command, unavailable required read, or runtime failure.
- expected_effective_state: The existing domain result/effect remains authoritative; the outer tool result has isError true and useful model-visible content. A stable machine-readable cause is retained whenever the existing owner supplies it.
- visible_feedback: A concise explanation of failure and its specific known cause, distinct from a successful result.
- blocker_failure_behavior: Unknown causes do not become success; no synthetic approval or effect result is manufactured.
- recovery_next_action: The actual supported correction, prerequisite or bounded diagnostic/stop path.
- observable_success: Each classified failure is identifiable as an error by an MCP client without parsing natural-language keywords; text remains useful without hidden fields.
- required_evidence: Actual SDK/stdio failure cases for all existing tool families and Cockpit paths, plus unknown-cause coverage.

### AC-002: Useful cause and correction are visible

- criterion_id: AC-002
- derives_from: UR ERR-02.
- working_mode: All existing tool usage.
- source_state: A known failure has a correctable argument, missing prerequisite or supported recovery action.
- action: Read the tool failure content.
- expected_effective_state: The result preserves the domain meaning and exposes a specific cause, relevant field/prerequisite, known effect limit and next supported action. It states when no immediate retry is possible.
- visible_feedback: Concrete guidance such as correcting the named input or observing the original operation, not only an opaque code, stack trace or generic runtime-repair instruction. Examples use only verified context and cannot fabricate identities or approvals.
- blocker_failure_behavior: Permission and human-decision requirements remain explicit. Unknown failures receive a bounded diagnostic/stop explanation, not speculative repair steps.
- recovery_next_action: Correct/read/obtain the stated prerequisite, or stop as instructed; no silent background retry.
- observable_success: Scenario-specific content assertions show that a caller can identify what to change or do next and why.
- required_evidence: Representative text assertions and correction scenarios; review of fallback guidance and sensitive/internal-detail exposure.

### AC-003: Correct input and runtime classification

- criterion_id: AC-003
- derives_from: UR ERR-03 and ERR-05.
- working_mode: Read/report and prepare/command.
- source_state: Semantic input, parser, provenance/runtime or worker execution failure, with a known or unknown dispatch boundary.
- action: Invoke a scenario in each class, including a valid-envelope semantic failure before dispatch.
- expected_effective_state: Preserve the known underlying cause and execution boundary. A known pre-dispatch rejection remains known not executed; a genuinely unknown effect remains unknown. Semantic input mistakes do not claim runtime corruption.
- visible_feedback: Input correction for input errors; runtime repair only for a demonstrated runtime condition; uncertainty explicitly stated where applicable.
- blocker_failure_behavior: Do not collapse supported distinguishable failures into dispatch_worker_failed or claim non-execution from a timeout/worker exit alone.
- recovery_next_action: Use the correction or existing effect-aware recovery appropriate to that class.
- observable_success: Distinct input/runtime/worker cases retain their expected cause and boundary through the actual MCP path.
- required_evidence: Worker, parent-owned and generation-facade scenarios; local pinned-SDK validation behavior; no new unbounded retry.

### AC-004: Recovery preserves operation and approval authority

- criterion_id: AC-004
- derives_from: UR ERR-04.
- working_mode: Prepare/command and original-operation recovery.
- source_state: A stale revision/presentation, denied access, pending original operation or uncertain write effect.
- action: Read the rejection and follow the supported next observation/correction.
- expected_effective_state: Preserve exact target/run/revision/UUID, payload and receipt constraints. No failure guidance executes or authorizes a write, bypasses a guard, transfers an old approval or substitutes another run/target.
- visible_feedback: The limiting condition and permitted observation/human step are explicit. An uncertain write first points to original-operation status/receipt verification, never blind replay or a new operation identity.
- blocker_failure_behavior: Unresolved effects or missing human authority stay unresolved; no success or rollback is inferred.
- recovery_next_action: Existing recovery/replay only after its current eligibility checks and the original operation's status permit it. Recoverable transient non-dispatch offers a visible retry instruction after the stated prerequisite clears.
- observable_success: Fixture state, receipts and operation identities show no unauthorized/duplicate write; stale approvals stay rejected.
- required_evidence: Stale revision/presentation, payload conflict, timeout/unknown receipt, known non-dispatch and denied-access scenarios with state/receipt assertions.

### AC-005: Successful reports and commands remain successful

- criterion_id: AC-005
- derives_from: UR ERR-01 and ERR-06.
- working_mode: Read/report and prepare/command.
- source_state: A valid read reports blocked/not-ready governance or a command succeeds/is already applied.
- action: Invoke the valid operation.
- expected_effective_state: Preserve the observed result and existing receipt/authority meaning. The result is not marked as an error solely because nested content says blocked, rejected, missing approval, or not ready. A successful idempotent replay remains successful with its historical-effect context.
- visible_feedback: Accurate state and next prerequisite; no generic error recovery replaces successful report content or exact decision presentations.
- blocker_failure_behavior: A separate actual failure to fulfil the requested read still follows the failure rules above; do not hide it inside a success wrapper.
- recovery_next_action: Continue the existing permissible read/decision flow; do not mutate a run merely to clear a reported blocker.
- observable_success: Positive and near-neighbor negative cases distinguish operation success from the state being reported, with unchanged protected bytes on reads.
- required_evidence: Doctor/readiness/dispatch-blocker, Cockpit nested-blocker, ordinary success and already-applied regression cases.

### AC-006: Source and protocol compatibility are explicit

- criterion_id: AC-006
- derives_from: UR ERR-05.
- working_mode: Existing supported MCP client interactions.
- source_state: Supported legacy/modern protocol calls and pinned SDK validation before a handler.
- action: Execute valid, schema-invalid, semantic-invalid and malformed/unknown-tool requests through the existing boundary.
- expected_effective_state: Preserve the distinction between host-facing protocol failure and model-visible tool execution failure according to the actual supported SDK behavior. Retain existing bindings/domain data and supported consumers; no SDK upgrade, generic schema redesign or new protocol feature is required.
- visible_feedback: Recoverable tool errors remain visible to the model in content; SDK-owned validation and protocol errors are truthfully identified by evidence.
- blocker_failure_behavior: Unsupported requests are not routed as authorized commands. Error results must not silently evade the intended domain invariants because SDK output validation skips isError results.
- recovery_next_action: Supported correction at the appropriate boundary; no alternate bypass path.
- observable_success: Both currently supported protocol eras and affected result consumers pass focused contract checks, including error-path domain-shape assertions.
- required_evidence: A source-to-requirement comparison distinguishing normative MCP, official SDK behavior and advisory Anthropic guidance; exact-version protocol/consumer tests and package/integrity checks selected in TP.

### AC-007: Existing ownership, data and information boundaries hold

- criterion_id: AC-007
- derives_from: UR scope, ERR-04 and non-goals.
- working_mode: All existing tool usage.
- source_state: Any success or failure, including diagnostics containing uncontrolled internal exception text.
- action: Produce and consume the MCP result.
- expected_effective_state: Core retains governance/effect authority; existing runtime/transport owners deliver it. No second approval, retry-policy store, persistent error registry or authority is introduced. Existing permission, provenance, effect and resource bounds remain enforced.
- visible_feedback: Expose useful bounded cause/correction without leaking credentials or unnecessary raw internal traces. Preserve existing presentation-language behavior; select exact localization and serialization in SD.
- blocker_failure_behavior: Unknown/untrusted details cannot override trusted binding, current state or guard results.
- recovery_next_action: Existing supported diagnostics and recovery owners only.
- observable_success: Scope and boundary review plus failure-path tests show no added authority, unsafe disclosure, persistent migration or weakened checks.
- required_evidence: Core/CLI/MCP ownership review; existing safety/integrity and targeted content tests; derived-package checks where affected.

### AC-008: Improvement is measured without overstating evidence

- criterion_id: AC-008
- derives_from: UR ERR-06 and the requested source comparison.
- working_mode: Evaluation and QA of existing tool usage.
- source_state: The preserved baseline and implementation candidate.
- action: Re-run existing protocol evaluation/comparison and relevant correction/regression scenarios.
- expected_effective_state: Classified actual failures acquire the error signal and correct guidance while successful results retain their authority and semantic outcomes. Preserve historical baseline; report intended differences, non-comparable metrics and remaining gaps separately.
- visible_feedback: QA reports exact source/runtime, client/host, protocol, scenarios and results. Claims of native agent recovery require actual native observation; protocol/fixture results alone make no such claim.
- blocker_failure_behavior: Evaluation-predicate changes cannot manufacture improvement; a requested scenario not executed is not a passed recovery test.
- recovery_next_action: Diagnose failing/unsupported coverage and route it through existing quality owners; no removed assertion, budget or guard to obtain a pass.
- observable_success: A reproducible comparison and exact scenario evidence support the claimed improvement; latency, token and broad host claims remain outside scope.
- required_evidence: Existing evaluation report/compare, protocol and recovery fixtures; bounded native observation only for native claims, with host/cost constraints resolved during planning.

## 6. Non-Goals

No new intake/run-create tool, general input-schema or annotation redesign, worker-performance redesign, response-budget project, CI threshold policy, broad host certification, new approval value or bypass. No installation, release, publication or VCS action is authorized. No UI preview or redesign is required.

## 7. Users And Roles

Agents consume the machine and text error channels; humans retain product/gate/target decisions. Arndt Gold owns this PRD and acceptance. Core owns effective governance/effects, the existing runtime and MCP owners provide cause and delivery, and existing review/QA owners assess implementation and evidence. Analytical reports remain subordinate to this PRD once approved.

## 8. Constraints

Preserve existing exact target/run/revision/UUID and receipt semantics, access controls, resource limits and installed-runtime provenance. Preserve success data and compatibility-sensitive result consumers. A failed call can already have effects: error signalling is not proof of rollback. Reuse existing code/contract owners and evaluation tooling, retaining historical evidence. Keep source-specification requirements distinct from advisory recommendations and AGDF-specific safe-recovery policy. Technical field names, deterministic classification placement, serialization and localization belong in SD.

## 9. Evidence Requirements

Retain approved UR and exact analytical inputs with this PRD's derivation review. The source comparison in UR was checked on 2026-10-19 against MCP 2026-07-28 Error Handling, official TypeScript SDK v2 Errors, and Anthropic's Writing effective tools for agents. Brownfield source inspection additionally verified local SDK server 2.0.0 and the existing tests for both protocol eras; no new SDK behavior is assumed from current website prose alone.

TP must map every criterion to executable scenarios and evidence. Require actual MCP/SDK results for the affected tool families, positive/negative status classification, correction, worker/runtime failures, denied access, stale identities and uncertain effects. Retain result/receipt/state assertions and the existing comparison output. Do not overwrite the historical baseline to hide intended differences. If a gap in the baseline matrix needs extra scenarios, label the supplementary coverage separately and retain original comparisons.

The UX walkthrough is a proposed experience derived from source, with no observed user trial. QA must distinguish source, unit/fixture, wire-level and actual native evidence. Native agent recovery and other hosts remain unverified until measured; no claim of general native reliability is part of protocol-only acceptance. A missing required TP scenario remains a quality gap.

## 10. Risks And Open Questions

The main risks are blanket error classification of valid blocked reports, lost cause or false effect knowledge at worker boundaries, unsafe retry instructions, SDK validation occurring before handlers, and changed consumers of content or structuredContent. These are implementation/design risks with acceptance already defined above. Unknown causes need a safe bounded fallback. Native measurements may require a separate host and cost authorization; make no unsupported native improvement claim if unavailable. The accepted historical baseline does not certify the current checkout or running plugin.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Actual failures versus successful blocked-state reports | before_prd | resolved | Use requested-operation semantics in Product Scope; report success and underlying blocked governance are separate. This is the proposed behavior for this PRD approval. | Arndt Gold |
| Correction and retry authority | before_prd | resolved | Explanations recommend only eligible corrections/observations; unknown writes require original-operation verification and existing recovery, never blind replay or inferred approval. | Arndt Gold |
| Evidence and release scope | before_prd | resolved | Preserve baseline and require protocol/fixture evidence; native claims require actual native observation. No installation, publication or broad host certification is included. | Arndt Gold |
| Exact compatible representation and one classification/guidance placement | later_sd | deferred | SD must decide the additive/preserved fields, code mapping, safe fallback, localization, consumer handling and package propagation within AC-001 through AC-007. | Codex, accountable Arndt Gold |
| Executable matrix and native observation feasibility | later_tp | deferred | TP must map all criteria to existing suites plus any supplemental scenarios, and state exact host/cost and evidence limits before execution. | Codex, accountable Arndt Gold |

## 11. Next Step

Review this PRD and approve only with:

`Approval: PRD`

The approval adopts the proposed observable behavior and acceptance and permits Solution Design. It does not approve implementation, native host support or delivery. No before_prd decision is missing; the product proposals above are presented for this deliberate approval.

## AGDF Approval Summary (de; source=en)

- Ziel: Tatsächliche MCP-Fehler eindeutig erkennen und mit konkreten, sicheren Korrekturhinweisen beantworten.
- Umfang: Phase 1 umfasst die sieben AGDF-Tools, Cockpit-Toolfehler und Worker-/Runtime-Fehler. Die Einstufung folgt der angefragten Operation: Eine erfolgreiche Statusabfrage darf einen blockierten Run melden, ohne selbst als Fehler zu gelten. Fehlerhinweise ändern weder Core-Entscheidungen noch Freigaben oder bereits entstandene Wirkungen.
- AC-001: Echte Toolfehler erhalten isError true, sichtbare Ursachen und ihre vorhandene fachliche Bedeutung; keine falschen Erfolgsantworten.
- AC-002: Der Text nennt den konkreten Fehler, das betroffene Argument oder die Voraussetzung und den nächsten erlaubten Korrektur- oder Diagnoseschritt.
- AC-003: Eingabe-, Runtime- und Workerfehler behalten bekannte Ursache und Ausführungsgrenze; vorab abgelehnte Eingaben werden nicht als Runtime-Schaden oder unklare Schreibwirkung ausgegeben.
- AC-004: Wiederaufnahme wahrt Ziel, Run, Revision, UUID, Payload, Belege und Freigaben. Bei unklarer Schreibwirkung wird zuerst die ursprüngliche Operation geprüft; keine blinde Wiederholung.
- AC-005: Erfolgreiche Status-/Readiness-Berichte, normale Erfolge und bereits angewandte Operationen bleiben erfolgreiche Antworten mit unveränderter Semantik.
- AC-006: Quellenabgleich und Tests belegen die Trennung von Protokoll- und Toolfehlern, das Verhalten des vorhandenen SDK und die Kompatibilität beider unterstützter Protokollstände.
- AC-007: Core, Runtime und MCP behalten ihre Zuständigkeiten; keine zusätzliche Autorität, aufgeweichten Prüfungen, unnötigen internen Details oder neue persistente Fehlerverwaltung.
- AC-008: Der Vergleich nutzt die erhaltene Baseline und konkrete Korrektur-/Regressionsszenarien. Native Verbesserungen werden nur mit tatsächlicher nativer Beobachtung behauptet.
- Entscheidungen: Die vorgeschlagene Fehler-/Status-Trennung, sichere Wiederaufnahme und begrenzte Evidenz-/Release-Reichweite sind zur PRD-Freigabe geklärt. Technisches Format, Lokalisierung und Zuordnung entscheiden SD; ausführbare Szenarien und Host-/Kostenbedingungen TP. Produktverantwortlicher ist Arndt Gold.
- Risiken: Falsche Klassifikation, verlorene Ursachen, unsichere Wiederholungen und betroffene Ergebnisnutzer erfordern gezielte Prüfungen. UX ist analytisch geklärt, aber weder implementiert noch im Host erprobt. Keine neuen Intake-Funktionen, Performance-Arbeiten, Installation oder Veröffentlichung.
- Nächster Schritt: Nach Approval: PRD folgt Solution Design. Implementierung bleibt bis zu den weiteren erforderlichen Freigaben gesperrt.
