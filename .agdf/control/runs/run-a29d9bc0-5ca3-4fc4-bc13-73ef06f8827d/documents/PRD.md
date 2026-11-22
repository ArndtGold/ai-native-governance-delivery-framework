# PRD: Browser-only click tests for the Codex Companion

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-11-22
Owner: AGDF maintainers
Traceability contract: criteria-chain-v1

## 1. Product Scope

Exercise the built Companion in a real browser with a local test host and explicitly designated disposable Runs. A maintainer can activate “Run fortsetzen”, observe competing requests and inspect the original handoff after reopening. A simulated recipient may read the selected fixture's status and return its case marker. The result identifies what the browser, fixture service and simulated recipient each observed. [Approved user need](UR.md)

## 2. UX Intent And Success

- ui_ux_impact: medium
- ux_intent_definition: Ready analysis in [UX Intent Definition](UX_INTENT_DEFINITION.md).
- primary_user_intent: Determine whether the action visible for the selected fixture produces a single bound request and how the Companion explains an outstanding or completed handoff.
- success_signal: The operator can identify the fixture, tell whether another start is permitted, inspect the original attempt and locate the evidence for its disposition.
- primary_decision_or_action: Activate the ready control with mouse or keyboard or check the status of an existing attempt.

The AGDF maintainer's brand source in .agdf/control/BRAND.md, SHA-256 960aeb2f12e3e17fea2fb8309045c76fb7b4c6d037f6cd62d59ecbbcf204d6f9, supports the adopted intent. Decision clarity and Permitted next action apply to the ready, pending and stale states. Calm information hierarchy prioritizes the selected Run and action. Source visibility and Visible uncertainty apply to the case report and incomplete observations.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Ready or ineligible fixture | Only a current designated disposable Run can initiate its test action. | Test context, selected Run, permitted action or reason for ineligibility. | Fixture designation and current canonical Run evaluation. | Browser test context and Companion. |
| Outstanding handoff or competing request | One original attempt is reserved or published; a competitor cannot receive a second work grant. | Current pending or running state and status check. | Shared admission for the fixture Run. | Companion in each browser view. |
| Claimed or settled fixture task | The simulated recipient has claimed the attempt or supplied matching terminal evidence. | Known disposition and appropriate next action. | Original claim and correlated fixture observations. | Companion and source-labelled case record. |
| Stale, interrupted or uncertain | State needs a fresh evaluation or evidence for the original attempt. | Specific blocker and recovery or explicit missing observation. | Current Run and candidate binding and the existing attempt. | Companion and case record. |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Select the isolated case and current eligible fixture. An explicit pointer or keyboard action initiates the request. Changing selection or ending the case removes its test eligibility.
- blockers_and_visible_next_actions: An ineligible or stale selection requires a fresh valid selection or reload. A pending or claimed attempt offers inspection of the original handoff.
- recovery_paths: Reopening or polling preserves the original request. A deliberate retry can be offered after a proven non-start and a fresh ready evaluation. A missing or contradictory event keeps the uncertain outcome visible.
- relevant_state_transitions: Ready becomes pending on publication. A matching simulated claim establishes work. Matching completion or interruption can settle it subject to current eligibility. A candidate change requires a new evaluation and preserves an unresolved predecessor.

## 5. Acceptance Criteria

- criterion_id: AC-001
  - working_mode: Fixture selection.
  - source_state: A current disposable Run, an unrelated Run or a stale selection is presented to the test.
  - trigger_action: Open the selected case in the browser and inspect or attempt its available action.
  - expected_effective_state: Only the current designated fixture is eligible for test work.
  - visible_feedback: The operator can identify the test context, selected Run and permitted next action.
  - blocker_failure_behavior: An unrelated or stale binding grants zero test starts.
  - recovery_next_action: Select a designated fixture or refresh the stale view.
  - observable_success: The displayed Run matches the bound fixture, and denial is observable in the ineligible case.
  - required_evidence: Candidate, fixture identity, rendered state and observed grant count for the selection cases.

- criterion_id: AC-002
  - working_mode: Single start.
  - source_state: The designated fixture is ready and has no outstanding attempt.
  - trigger_action: In separate browser cases, click “Run fortsetzen” or focus it and press Enter.
  - expected_effective_state: Each activation sends exactly one bound request. In a receiving case only the winning fixture task reads status and replies with its case marker.
  - visible_feedback: Pending is visible after publication; the case record identifies the eventual fixture disposition.
  - blocker_failure_behavior: An unobserved claim or readback leaves that part of the case incomplete.
  - recovery_next_action: Check the original attempt and locate its matching receiver evidence.
  - observable_success: Gesture, send and attempt can be matched for each input method; a simulated work grant and marker reply can be independently matched in the receiving case.
  - required_evidence: Browser input, bound request count and identity, fixture claim count, bounded readback and marker where observed.

- criterion_id: AC-003
  - working_mode: Contention.
  - source_state: Two views address the same ready fixture. The fixture may also expose the ordinary continuation path.
  - trigger_action: Activate the action from both browser views. Where the fixture supports the ordinary path, also compete against that path under the same admission state.
  - expected_effective_state: Exactly one attempt wins. The losing route adds zero work grants. Two competing cards publish at most one request.
  - visible_feedback: Both views can observe the disposition of the winning or still-pending attempt.
  - blocker_failure_behavior: Another send from a competing card or a second admitted work item fails its case. Missing visibility into a path is recorded as a gap.
  - recovery_next_action: Inspect the first attempt and the competing route's outcome.
  - observable_success: Counts show one winner and identify what each competing route actually did.
  - required_evidence: Two real browser view observations, shared Run and attempt identity, send and grant counts by source, and the ordinary fixture route outcome or its specific limitation.

- criterion_id: AC-004
  - working_mode: Reopen, status check and retry.
  - source_state: A request is published with its receiver response withheld, or a separate case has a confirmed non-start.
  - trigger_action: Reopen, inspect status, refresh a stale selection and exercise retry when offered.
  - expected_effective_state: Reopen and inspection preserve the original attempt. Retry requires a confirmed non-start and current readiness.
  - visible_feedback: Pending offers “Übergabe prüfen”. The stale selection offers recovery. The operator can distinguish status inspection from starting work.
  - blocker_failure_behavior: A lost response or conflicting event cannot enable a duplicate start.
  - recovery_next_action: Inspect the same attempt, reload stale state or deliberately retry after a confirmed non-start.
  - observable_success: Reopen and status checks add zero sends; the permitted recovery matches the fixture evidence.
  - required_evidence: Before and after browser state, original attempt, count deltas and disposition of the simulated response.

- criterion_id: AC-005
  - working_mode: Interruption and candidate change.
  - source_state: The fixture has an outstanding or claimed attempt and receives a matching, foreign or missing terminal event, or the candidate changes.
  - trigger_action: Simulate the relevant event or candidate change and observe the Companion in the browser.
  - expected_effective_state: Only matching evidence can settle the original attempt. A new start requires a current eligible binding and an established predecessor disposition.
  - visible_feedback: The operator can identify the known, stale or unresolved state and the available next action.
  - blocker_failure_behavior: An uncorrelated terminal event, missing predecessor evidence or mismatched candidate grants zero additional starts from that state.
  - recovery_next_action: Re-evaluate the current selection and inspect the original disposition.
  - observable_success: The browser state and count changes agree with the labelled fixture events; unsupported observations remain explicit.
  - required_evidence: Candidate identity before and after, source-labelled simulated events, matching attempt, rendered outcome and send or grant counts.

- criterion_id: AC-006
  - working_mode: Reviewing browser evidence.
  - source_state: One or more browser cases have finished or contain an unobserved outcome.
  - trigger_action: Review the case record for the linked continuation Run.
  - expected_effective_state: Each claim is scoped to the observed candidate, case, fixture and applicable original attempt.
  - visible_feedback: The reviewer can distinguish real browser gestures, outgoing requests, fixture admission and simulated host events.
  - blocker_failure_behavior: A missing observation remains unknown. A different candidate or Run cannot satisfy the case.
  - recovery_next_action: Identify the precise missing observation or retain the documented limit.
  - observable_success: A reviewer can reconstruct the counts, their sources and any gaps without treating a simulated event as a native Codex turn.
  - required_evidence: Attributed case record with relevant identifiers, observed counts, disposition and limits.

## 6. Non-Goals

Native Desktop click tests, a real receiving Codex turn, qualification for ordinary use, public release and actions on live delivery Runs fall outside this Run.

## 7. Users And Roles

AGDF maintainers run the browser cases. Reviewers assess the candidate-specific evidence. The linked continuation Run owns any separate decision about native qualification.

## 8. Constraints

All click acceptance uses the built Companion in a real browser and disposable local data. Fixture work is limited to the status read and case marker. Test activity carries no gate approval or production activation.

## 9. Evidence Requirements

The 360-pixel Chromium baseline at aa73dfba demonstrated pointer and keyboard sends, retention of a pending handoff on reopen, and one outgoing request from two concurrent views. These results support only the observations actually made. In particular, a send count cannot establish a receiving grant. Reuse applicable results for the same candidate and conditions; retain or renew evidence when conditions change. Name missing or unsupported observations and identify simulated receivers in the handoff.

## 10. Risks And Open Questions

Loss of a response can look like a failed start; counting browser events alone can hide an extra fixture claim. The design must identify which source owns each count. The test plan must specify how to observe contention and recovery on a live fixture. No material product choice remains for this approval.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Acceptance surface and qualification boundary | before_prd | resolved | Use browser-only click acceptance with isolated disposable fixtures and explicit simulated receiver events. The linked Run owns native qualification. | AGDF maintainers |
| Duplicate start and evidence meaning | before_prd | resolved | Count actual sends and fixture work grants separately, preserve the original attempt and identify missing evidence explicitly. | AGDF maintainers |
| Source of each observation and fixture wiring | later_sd | open | Define how existing browser and fixture evidence is correlated, including a competing ordinary fixture dispatch where supported. | AGDF test integration |
| Reproducible scenario execution | later_tp | open | Select fixture controls, execution order, candidate identification and reusable evidence for each acceptance case. | AGDF QA |

## 11. Next Step

Review these browser-only requirements. PRD approval permits drafting the corresponding solution design.

## AGDF Approval Summary (de; source=en)

- Ziel: Im Browser prüfen wir, ob „Run fortsetzen“ genau einen Auftrag für den ausgewählten Test-Run anstößt.
- Umfang: Die Tests verwenden den gebauten Begleiter und lokale Wegwerf-Runs. Der Empfänger wird simuliert.
- Entscheidungen: Der Bericht zählt gesendete Anfragen und übernommene Testaufträge getrennt. Über die native Freischaltung entscheidet weiterhin der verknüpfte Run.
- AC-001: Der Tester erkennt den ausgewählten Wegwerf-Run. Eine fremde oder veraltete Auswahl darf keinen Testauftrag starten.
- AC-002: Mausklick und Eingabetaste senden jeweils genau eine Anfrage. Übernimmt der simulierte Empfänger den Auftrag, meldet er die Kennung des Testfalls zurück.
- AC-003: Bei zwei konkurrierenden Ansichten gewinnt ein Versuch. Soweit die Testumgebung es unterstützt, prüfen wir auch die Konkurrenz mit einer simulierten Fortsetzung aus dem Chat.
- AC-004: Nach erneutem Öffnen bleibt dieselbe Übergabe sichtbar. „Übergabe prüfen“ sendet keine weitere Anfrage. Ein neuer Versuch setzt einen bestätigten Nichtstart voraus.
- AC-005: Bei Abbruch oder Wechsel der geprüften Fassung darf eine ungeklärte frühere Übergabe keinen zweiten Start zulassen.
- AC-006: Für jeden Fall zeigt der Bericht, was der Browser tatsächlich getan hat, was simuliert wurde und welche Beobachtung fehlt.
