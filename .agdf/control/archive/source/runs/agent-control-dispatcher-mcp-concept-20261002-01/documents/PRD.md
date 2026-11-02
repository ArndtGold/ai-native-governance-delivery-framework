# PRD: Joint Coding-Agent Control Concept for Dispatcher and MCP

Status: draft
Gate: PRD
Gate approval: open
Based on: approved UR and completed Brownfield Review
Date: 2026-10-02
Owner: Arndt Gold
Run: agent-control-dispatcher-mcp-concept-20261002-01
Language: en
Traceability contract: criteria-chain-v1

## 1. Product Scope

Deliver one integrated, reviewable control concept explaining how coding-agent actions and results are governed through existing AGDF owners, Dispatcher, MCP and host/tool boundaries. The concept must make current guarantees, proposed guarantees, limitations and evidence visible. It must cover the whole lifecycle before deriving implementation slices.

The final concept deliverable will contain an evidenced current-state map, a proposed target responsibility/flow model, a control and assurance matrix, common interface and presentation requirements, failure/recovery scenarios, and a dependency-aware validation and implementation roadmap. A concept index must identify where each requirement is satisfied; existing documents may be referenced, but a reader must not have to assemble contradictory partial proposals independently.

The SD and TP govern production and review of this concept. Approval of those artefacts does not authorize implementing its proposed runtime, MCP or host changes. Such changes require separate scopes and approvals. The target model must classify feasible controls without inventing guaranteed capabilities to fill gaps.

## 2. UX Intent And Success

- ui_ux_impact: high for the proposed control experience; no live UI changes in this run
- ux_intent_definition: UX_INTENT_DEFINITION.md, decision ready
- primary_user_intent: Control the coding agent's permitted actions and assess its actual work with explicit evidence and limitations.
- success_signal: A reader can follow representative normal and failure journeys and identify the permitted action, deciding actor, verified result and next safe step.
- primary_decision_or_action: Review an exactly bound subject and approve, revise or decline; intervene when evidence or required control is missing.

## 3. Working Modes And Effective State

These are user-journey categories for the concept, not additional gates or runtime states.

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Intake/clarification | Target and scope unresolved until bound | Missing input, scope choices, no execution authority | Existing target/run binding owners and explicit human scope | Common semantic presentation rendered by host |
| Bounded work | Only evaluated actions within approved scope may proceed | Allowed action, agent progress, enforcement class | Canonical control evaluation plus separate host tool permission | Common semantic presentation rendered by host |
| Human decision | Current prepared subject awaits a new deliberate response | Decision subject, revision, consequences, approve/revise/decline/cancel | Human decision validated by canonical approval owner | Common semantic presentation rendered by host |
| Evidence review | Claimed completion requires checking | Claims, actual changes, tests, review findings, missing proof | Existing review/QA owners; human gates remain human | Common semantic presentation rendered by host |
| Blocked/interrupted | Invalid, incomplete or unavailable prerequisites prevent dependent continuation | Blocker, stale state, unsupported guarantee, retry/repair action | Canonical evaluation and applicable host constraints | Common semantic presentation rendered by host |
| Closeout | Only validated persisted result supports completion | Accepted outcome, residual limits, handoff | Existing closeout and human acceptance owners | Common semantic presentation rendered by host |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Describe explicit request, target/run/scope selection and bound continuation. Opt-out, dismissal, cancellation and scope replacement must not inherit pending decisions. Events and tool discovery are not authorizing triggers.
- blockers_and_visible_next_actions: Each journey must show the actual blocker and permitted remedy. Missing capability blocks the guarantee depending on it; it must not be hidden by a successful transport call or visual control.
- recovery_paths: Revalidate before retry; prepare a fresh presentation and obtain a new deliberate response after invalidation; repair missing evidence; explicitly classify unsupported assurance. Include visible retry for recoverable transport failure without duplicate execution.
- relevant_state_transitions: For each normal and failure transition, record trigger, source and target condition, effective authority, visible feedback, next actor/action and failure handling. No new parallel state machine is required.

## 5. Acceptance Criteria

### AC-001 — Complete current and target control map

- criterion_id: AC-001
- Requirement: The concept traces intake, scope binding, gate decisions, execution, evidence/review and closeout with named existing owners and trust boundaries. It separately identifies current behavior and proposed changes, direct file/shell/other-tool bypass routes, and the actor able to stop each route. All UR acceptance signals have a coverage reference.
- Observable success and evidence: A reviewer can trace one ordinary coding request and one bypass attempt without an unexplained owner or authority transfer; source references identify the observed current behavior.

### AC-002 — Honest enforcement and assurance matrix

- criterion_id: AC-002
- Requirement: Every proposed control identifies action/risk, target/run/scope/revision binding, responsible owner, mechanism, enforcement class, blocking or detection point, residual limit, evidence status and failure scenario. Distinguish tool enforcement, validator enforcement, host-limited enforcement, instruction-only control, detection after execution and unavailable enforcement. Cover agent self-classification, conditional checks, direct tools and control-state tampering. Successful dispatch alone cannot prove controlled execution.
- Observable success and evidence: Matrix rows make prevention versus detection explicit; unsupported/unknown guarantees remain visible and have an owner and dependent action. No universal prevention or adversarial trust claim lacks evidence.

### AC-003 — Deliberate and exactly bound human decisions

- criterion_id: AC-003
- Requirement: Specify decision preparation, display, response provenance, validation and persistence for exact target/run/gate/revision/artefact and presentation bindings. Separate display label, decision value and operational status. Distinguish cooperative forwarded input from independently verified human input; transport accept, model text, defaults, timeout and event receipt cannot independently authorize a gate.
- working_mode: Human decision
- source_state: A valid prepared subject awaits a decision.
- trigger/action: Human approves, revises, declines or dismisses; or the subject becomes stale.
- expected_effective_state: Only a validated new deliberate approval advances the bound gate; all other outcomes preserve the appropriate authority boundary.
- visible_feedback: Subject, effect, assurance limit and next safe action are visible.
- blocker/failure_behavior: Wrong/stale/unproven response cannot be relabelled as valid approval.
- recovery/next_action: Fresh presentation and new response after invalidation; revise/decline/cancel behavior explicitly documented.
- observable_success: Normal, wrong-run, stale-revision and dismissed-decision journeys identify the deciding actor and outcome.
- required_evidence: Scenario walkthroughs and references to the existing approval/presentation owners; no claim of real host attestation without proof.

### AC-004 — Verification of actual work

- criterion_id: AC-004
- Requirement: Define how approved scope is compared with actual changes, affected paths, tests, review findings and result evidence. Classify agent claims separately from verified results, missing or contradictory proof, and independently produced evidence. Define when independent review is required, what independence means and where the current process cannot prove it. The concept must address falsely reported completion and correct tests applied to an incomplete or wrong scope.
- Observable success and evidence: Worked scenarios connect requirement to changes and evidence, identify the verification owner, and show a defined non-success outcome for insufficient or contradictory proof.

### AC-005 — Coherent MCP capability contract

- criterion_id: AC-005
- Requirement: Derive all required inspection, routing, transition, presentation, decision and evidence operations from the joint control model. For each operation state canonical service owner, read/write effect, inputs/binding, results, authorization, errors and recovery. Evaluate tools, resources, prompts, elicitation, UI and events with a justified inclusion, exclusion or unresolved decision. Preserve one rules/state/approval authority; MCP remains an adapter. Address compatibility/versioning, authentication/provenance, idempotency and audit at applicable boundaries.
- Observable success and evidence: A lifecycle-to-capability mapping is complete; no interface addition is justified solely by primitive availability; proposed write operations delegate to the canonical owner and never imply approval from transport success.

### AC-006 — Common user meaning across hosts

- criterion_id: AC-006
- Requirement: Define one semantic decision/status model and capability-based rendering for Codex and Claude, plus relevant existing supported hosts. A capability matrix distinguishes protocol documentation, installed exposure, actual observed behavior and unknown/unsupported support. Define portable fallback or explicit blocking for every dependent interaction; forms, panels, React or events are not mandatory by default.
- working_mode: Human decision and blocked/interrupted
- source_state: The same bound decision or blocker is presented on different hosts.
- trigger/action: A host selects its supported rendering or lacks the required capability.
- expected_effective_state: Rendering preserves decision value, binding, consequences and authority; reduced presentation does not silently reduce required assurance.
- visible_feedback: The user sees the subject, state, capability/assurance limits and next action.
- blocker/failure_behavior: Unsupported controls do not masquerade as working controls.
- recovery/next_action: Use a semantically equivalent supported fallback; otherwise block the dependent action and state what evidence/capability is missing.
- observable_success: Cross-host scenario comparison shows identical decision meaning and explicit capability differences.
- required_evidence: Dated primary documentation/source references; installed/live claims require matching evidence or an explicit unverified classification.

### AC-007 — Failure, concurrency and recovery coverage

- criterion_id: AC-007
- Requirement: Include stale/duplicate/replayed responses, concurrent artefact/state changes, wrong target/run, revise/decline/cancel, interrupted execution, retry, restart, connection loss, missing capability and invalid evidence. Each scenario identifies detection/blocking owner, current authority, persisted or unchanged state, safe next action and evidence needed. A retry must not transfer approval or silently duplicate an irreversible operation.
- working_mode: Blocked/interrupted
- source_state: Work or a decision encounters an invalidating or transient event.
- trigger/action: Failure, concurrent change or retry request.
- expected_effective_state: Dependent work pauses or safely recovers under revalidated authority.
- visible_feedback: Concrete reason, current subject and next actor/action, including retry when applicable.
- blocker/failure_behavior: No silent advancement, scope substitution or inherited response.
- recovery/next_action: Revalidate, repair, clarify or obtain a new decision as appropriate.
- observable_success: Scenario table explains both success and failure outcome for each required case.
- required_evidence: Concept walkthroughs and a later verification plan distinguishing validator tests from host/execution proof.

### AC-008 — Reuse and dependency-aware implementation roadmap

- criterion_id: AC-008
- Requirement: Reconcile the current Dispatcher, MCP discussion/inspect, harness and maturity scopes against source and their own bounded state. Identify reusable owners, unfinished dependencies, contradictions and decisions. Derive separately governable implementation slices only after presenting the complete concept; each slice names outcome, prerequisites, affected contracts/hosts, validation, compatibility and rollback obligations. No existing approval transfers and no runtime changes occur in this run.
- Observable success and evidence: Roadmap entries refer back to the complete concept and explicitly separate concept acceptance from future implementation authority. Dependencies are not asserted complete solely because code or a related artefact exists.

### AC-009 — Reviewable concept and bounded validation

- criterion_id: AC-009
- Requirement: Deliver a canonical concept index with criterion coverage, evidence register, dated source/protocol/host status, proposed decisions and open limitations. The validation plan states what can be checked now through document/source review and what needs later implementation or live-host tests. Any unsettled target guarantee has a named owner and dependency; it cannot be described as delivered functionality.
- Observable success and evidence: Review and QA can find every criterion, test the scenario explanations and distinguish verified baseline, proposed architecture and missing operational proof. Material gaps prevent concept acceptance until resolved or explicitly incorporated as supported limitations consistent with these requirements.

## 6. Non-Goals

No runtime/MCP schema or policy change, host adapter implementation, installation, new service, publication or VCS action. No predetermined React/panel/webhook solution, replacement workflow engine, parallel control store or new user approval gate. No claim that the proposed architecture already enforces agent behavior. Unrelated runs remain untouched.

## 7. Users And Roles

The human requester owns product scope and deliberate acceptance. Maintainers own the proposed architecture and future delivery decisions. Existing control services own current operational authority; Dispatcher routes; MCP adapts; hosts provide actual tool permissions and rendering. The coding agent produces the concept and evidence, but its claims are not independent assurance. Review/QA evaluates the concept's completeness without granting future implementation scope.

## 8. Constraints

Reuse canonical rule, state, presentation and approval owners. Preserve current contracts until separately approved changes. Maintain exact target/run/revision binding. Keep source, generated package, installed runtime and live behavior distinct. All future implementation choices remain constrained by human authority, evidence and compatibility. Artefacts follow configured English language with complete German approval summaries.

## 9. Evidence Requirements

Criterion coverage and UR-signal mapping; code/contract references for baseline observations; dated primary protocol/host documentation for external support claims; explicit unsupported/unknown statuses when no live evidence exists; scenario tables for both success and failure; decision/dependency register; final diff review showing concept-only output and no modification of unrelated runs or runtime. Document validation is sufficient for concept acceptance only when operational claims remain bounded to their evidence.

## 10. Risks And Open Questions

Current source controls do not demonstrate universal execution interception. Host interfaces may expose less than protocol capabilities; cooperative provenance is weaker than independent human proof. Review independence and agent-selected depth must not be concealed. SD must assess the target prevention/detection mechanisms and unsupported guarantees. These are required design outcomes, not permission to defer an incomplete overall concept into ad hoc implementation.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| D-01: Deliverable boundary | before_prd | resolved | Complete concept with validation/implementation roadmap; runtime implementation requires separate scopes, as approved in UR | Arndt Gold |
| D-02: Meaning of acceptance | before_prd | resolved | Accept completeness, traceability and evidenced/explicitly limited proposals; no unevidenced runtime prevention or host support claim | Arndt Gold |
| D-03: Required target prevention and independent assurance mechanisms | later_sd | open | SD must decide mechanisms per control/host, including unsupported/unknown outcomes and dependent blocking; no single assurance level is promised by this concept PRD | SD owner: AGDF maintainer, Arndt Gold accountable |
| D-04: MCP and presentation technology | later_sd | open | Derive necessary capabilities and portable fallback from control outcomes; preserve common authority and separate label/value/status | SD owner: AGDF maintainer, Arndt Gold accountable |
| D-05: Concept production and verification tasks | later_tp | open | TP maps every criterion and SD decision to document tasks, walkthrough scenarios and evidence; no runtime implementation tasks | TP owner: Coding agent, Arndt Gold accountable |

## 11. Next Step

Review this persisted PRD and approve only with `Approval: PRD`. That approval permits Solution Design for producing the concept; it does not authorize runtime implementation or approval of the target concept's future implementation roadmap.

## AGDF Approval Summary (de; source=en)

- Nutzerziel: Den Coding-Agenten und seine tatsächliche Arbeit anhand klarer Zuständigkeiten, Freigaben, Nachweise und offener Durchsetzungsgrenzen kontrollieren können.
- Umfang: Ein vollständiges Gesamtkonzept mit Ist-/Zielmodell, Kontrollmatrix, MCP-/Host-Anforderungen, Fehlerabläufen und Prüf-/Umsetzungsplan. Dieser Run setzt keine vorgeschlagenen Laufzeitänderungen um.
- AC-001: Vollständiger Ablauf von Auftrag bis Abschluss mit bestehenden Ownern, Vertrauensgrenzen und Umgehungswegen; Ist und Vorschlag bleiben getrennt.
- AC-002: Jede Kontrolle benennt Mechanismus, Durchsetzungsart, Grenzen, Owner und Prüfszenario. Verhindern, nachträgliches Erkennen und bloße Anweisung bleiben sichtbar verschieden.
- AC-003: Menschliche Entscheidungen sind an Ziel, Run, Gate, Revision, Artefakt und Präsentation gebunden. Text, Wert und Status bleiben getrennt; veraltete oder nur transportseitig bestätigte Antworten geben nichts frei.
- AC-004: Auftrag, tatsächliche Änderungen, Tests und Reviews werden verbunden. Fehlende oder widersprüchliche Nachweise sowie Grenzen unabhängiger Prüfung erhalten ein definiertes Ergebnis.
- AC-005: Alle nötigen MCP-Operationen werden aus dem Kontrollmodell abgeleitet, mit Owner, Wirkung, Bindung, Autorisierung, Fehlern, Wiederholung und Audit. MCP erhält keine eigene Kontrollautorität.
- AC-006: Codex, Claude und relevante weitere Hosts erhalten dieselbe Entscheidungsbedeutung. Protokoll, installierte Fähigkeit und beobachtetes Verhalten bleiben getrennt; Ersatzdarstellung oder Sperre wird ausdrücklich beschrieben.
- AC-007: Veraltete, doppelte oder wiederholte Antworten, parallele Änderungen, Abbruch, Wiederaufnahme, Verbindungsfehler und fehlende Fähigkeiten haben sichere Abläufe mit sichtbarer Ursache und nächstem Schritt.
- AC-008: Bestehende Dispatcher-, MCP-, Harness- und Reifegradarbeiten werden eingeordnet. Umsetzungsslices werden erst aus dem vollständigen Konzept abgeleitet; fremde Freigaben werden nicht übernommen.
- AC-009: Ein kanonischer Konzeptindex verbindet Kriterien, Quellen, Entscheidungen, Grenzen und Prüfszenarien. Konzeptprüfung und erst später mögliche Laufzeit-/Host-Nachweise bleiben getrennt.
- Entscheidungen: Der Umfang bleibt Konzept plus Roadmap. Abgenommen werden Vollständigkeit und belegte beziehungsweise ausdrücklich begrenzte Vorschläge. SD entscheidet Kontrollmechanismen und MCP-/Darstellungstechnik; TP plant die Konzeptarbeit und ihre Prüfung. React, Panels und Webhooks sind nicht vorgegeben.
- Nächster Schritt: Die PRD-Freigabe erlaubt das Solution Design für das Konzept. Sie erlaubt keine Umsetzung der vorgeschlagenen Laufzeit-, MCP- oder Host-Änderungen.
