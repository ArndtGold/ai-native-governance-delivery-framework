# PRD: Fewer intermediate status cards with unchanged control

Status: draft
Gate: PRD
Gate approval: open
Based on: approved UR and completed Brownfield Review
Date: 2026-10-02
Owner: Arndt Gold
Run: agdf-intermediate-status-card-reduction-20261002-01
Traceability contract: criteria-chain-v1

## 1. Product Scope

Within the same selected and already permitted work step, internal inspection, validation, evidence maintenance and unchanged repeated evaluation should require no individual status card unless a meaningful event occurs. Brief useful progress remains possible; internal findings may be consolidated at the next significant result.

A meaningful event is required user input, a new blocker, relevant uncertainty/risk, a change in target/run/scope or permitted actions, or a significant reviewable result. Surface it promptly; consolidation must not delay it. Required bound gate presentations and expressly requested status retain their complete current canonical view. Routine progress cannot convey permission or substitute for either.

The product change controls AGDF cards and narration. Host-owned tool-call blocks are outside framework visibility control. Existing terminal dispatcher results retain their verbatim transmission and stop semantics.

## 2. UX Intent And Success

- ui_ux_impact: medium
- ux_intent_definition: ready — UX_INTENT_DEFINITION.md in this artefact directory, decision ready, based on approved UR and Brownfield Review
- primary_user_intent: Recognize progress, important changes and the next real decision with less repeated process reading.
- success_signal: A fixed workflow with evidenced redundant cards shows fewer intermediate cards and less card text, while protected events and complete control/evidence are retained.
- primary_decision_or_action: Review a meaningful result or deliberately respond to the current required decision.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| permitted_internal_work | Work stays within the selected already permitted step | Useful brief progress; consolidated internal findings | Current canonical target/run/gate/revision and approvals | Agent progress narration; existing AGDF interaction surface for significant events |
| decision_or_significant_result | A result can be reviewed; a required approval still waits | Significant result or full bound decision presentation | Canonical control plus deliberate human response | Existing canonical AGDF interaction surface |
| blocked_or_material_change | Continuation is limited by a blocker or changed binding/permission | Prompt canonical blocker, changed orientation and permitted next action | Existing evaluated control and target authority | Existing canonical AGDF interaction surface |
| explicit_status | Read-only current state is requested | Complete fresh canonical status | Current evaluated run state | Existing canonical AGDF interaction surface |
| interrupted_or_resumed_work | Binding/state is revalidated before work resumes | Material changes visible; unchanged internal cards need not repeat | Fresh canonical evaluation and current approvals | Existing interaction surface for changes; progress narration otherwise |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Preserve existing request activation and selected-run continuation. Card suppression introduces no consent, activation setting or authority; a target/run change ends the old presentation binding.
- blockers_and_visible_next_actions: Unresolved target/run, missing or stale permission/approval, failed required presentation and decision-relevant risk remain promptly visible with the existing permitted action. Never continue prohibited work merely because a card was omitted.
- recovery_paths: Existing clarification, run reselection, revision and actionable retry remain visible. A recoverable transient failure shows its retry action; a retry re-evaluates current state and cannot silently transfer an old approval.
- relevant_state_transitions: Unchanged internal work continues with useful progress; meaningful result/decision invokes its appropriate presentation; blocker/material change interrupts consolidation; explicit status produces fresh status; interruption/resumption revalidates binding and displays relevant differences.

## 5. Acceptance Criteria

All criteria below retain their UR identifiers. The common failure rule is: never hide a blocker or use absent/stale authority; show the permitted recovery/next action. Evidence identifies exact version, run, state, language, scenario and observation lane.

### AC-001

- criterion_id: AC-001
- working_mode: permitted_internal_work
- source_state: One selected permitted step with several internal checking/evidence operations and no meaningful event.
- trigger_action: Execute the same fixed inputs and operations before and after the change.
- expected_effective_state: Same allowed work and completion outcome; complete checks and evidence.
- visible_feedback: Fewer individual intermediate cards and less intermediate-card text; useful brief progress and consolidated result remain possible.
- blocker_failure_behavior: A meaningful event immediately leaves this no-event case; its required presentation cannot be counted as removable noise.
- recovery_next_action: Present any meaningful event, otherwise continue the already permitted work.
- observable_success: At least one evidenced baseline case has a positive intermediate-card count and a strict reduction in count and rendered character length. A zero-card baseline cannot prove improvement. Record total framework text too, so verbosity is not merely moved into narration.
- required_evidence: Fixed reproducible before/after transcript or rendered sequence with card/event classification, counts, text lengths and matched effective outcomes.

### AC-002

- criterion_id: AC-002
- working_mode: decision_or_significant_result; blocked_or_material_change; interrupted_or_resumed_work
- source_state: An internal step or resumed selected run before a meaningful event.
- trigger_action: Required input, new blocker/risk/uncertainty, changed target/run/scope/permitted actions, or significant reviewable result appears.
- expected_effective_state: Existing permission and stop rules apply; altered binding is revalidated before work.
- visible_feedback: Each event remains timely, unambiguous and accompanied by its permitted next action; required bound approval sequence stays complete.
- blocker_failure_behavior: No event may wait behind a routine consolidation point; ambiguous binding fails closed.
- recovery_next_action: Resolve the current blocker/decision or use current permitted continuation.
- observable_success: Protected-event examples display the event before dependent work proceeds, including changed state after resumption.
- required_evidence: Event-by-event before/after cases, matching control results and rendered decision/blocker/changed-binding output.

### AC-003

- criterion_id: AC-003
- working_mode: permitted_internal_work; explicit_status; interrupted_or_resumed_work
- source_state: Unchanged selected internal state already communicated, including an unchanged resumed state.
- trigger_action: Repeat internal evaluation without new actionable information, or explicitly request status.
- expected_effective_state: Re-evaluate where required; explicit status remains read-only and current.
- visible_feedback: Repeated internal evaluation adds no individual unchanged card; explicit status always returns the complete fresh canonical view.
- blocker_failure_behavior: A detected material change uses AC-002; no cached view may masquerade as current status.
- recovery_next_action: Show the detected change or requested current status, otherwise continue permitted work.
- observable_success: Repeated/no-change cases omit duplicates, while explicit-status cases retain status regardless of prior visibility.
- required_evidence: Repeated-state, unchanged-resumption, explicit-status and changed-state examples with current revision identity.

### AC-004

- criterion_id: AC-004
- working_mode: decision_or_significant_result; blocked_or_material_change
- source_state: A current presented decision or an absent/stale/foreign presentation.
- trigger_action: Deliberate approval response or attempted continuation.
- expected_effective_state: Only the existing exact current target/run/gate/revision/presentation binding can accept approval.
- visible_feedback: Complete canonical decision request or concrete current rejection/recovery; progress and omitted cards imply no consent.
- blocker_failure_behavior: Missing, stale and foreign approval cannot advance control or implementation authority.
- recovery_next_action: Present the current valid decision and obtain a fresh deliberate reply when required.
- observable_success: Existing approval acceptance and negative cases retain outcomes and terminal semantics.
- required_evidence: Bound acceptance and missing/stale/foreign approval checks plus unchanged decision rendering.

### AC-005

- criterion_id: AC-005
- expected_behavior: The matched workflows retain every required control check, evidence entry, review and durable run update. Visible-card reduction changes neither machine/audit projection completeness nor required state transitions.
- observable_success: Before/after control/evidence inventories match in obligation and outcome; identity/timestamp differences are explained. No required check disappears to make the transcript shorter.
- required_evidence: Execution trace, durable artefact/run references and machine results for the comparison and protected negative cases.

### AC-006

- criterion_id: AC-006
- working_mode: all affected visible modes
- source_state: Every registered locale and applicable case/state.
- trigger_action: Render affected output; execute actual host observation where available.
- expected_effective_state: Language changes no control or visibility obligation.
- visible_feedback: Correct localized canonical presentations; no model-built replacement or misleading successful-host claim.
- blocker_failure_behavior: Existing presentation failure remains visible; missing host evidence cannot be reported as observed success.
- recovery_next_action: Use existing presentation recovery and retain any unverified evidence lane.
- observable_success: Affected rendered case/state matrix passes for every registered locale. At least one actual Codex workflow demonstrates the intended reduction; if unavailable, the visible-behavior claim remains unverified and cannot support QA pass for this criterion. Other hosts are explicitly qualified by their own evidence.
- required_evidence: Rendered-language matrix and separate source/generated, installed-byte and actual host/session/version observations. Host blocks are counted separately from AGDF cards.

### AC-007

- criterion_id: AC-007
- expected_behavior: Reuse existing control, interaction, rendering, locale and projection owners. No second visibility-state authority, gate, approval contract or host-specific normative policy is introduced.
- observable_success: Review maps each change to its current owner; generated consumers agree with canonical source; terminal dispatcher contracts remain intact.
- required_evidence: Ownership/diff review, projection coherence and relevant dispatcher/rendering integrity checks.

## 6. Non-Goals

No gate/check/review removal, consent inference, run-selection/activation change, blanket error suppression, second presentation owner, general decision-card redesign, unrelated Quick Task closeout/install/commit/MCP repair, automatic commit/push/release or host installation. Required approval-point cards remain in scope only as preserved behavior.

## 7. Users And Roles

AGDF users consume progress and decisions. Arndt Gold owns PRD product acceptance and deliberate user approvals. Codex prepares analysis/design/planning and evidence; existing control and QA owners retain their authority. Host adapters present framework output without owning product or approval policy.

## 8. Constraints

Preserve existing exact approval, seal/revision, target and terminal-stop contracts. Change normative interaction policy through its existing owner and coherent projections. Keep adjacent active scopes and installation-repair changes separate. No unstated release or cross-host success claim.

## 9. Evidence Requirements

Record a real redundant baseline before implementation; compare the same workflow and inputs. Cover no-event work, repeated state, explicit status, protected events, changed/unchanged resumption and approval negatives. Compare control/evidence separately from card count/text. Render affected cases for all registered languages. Actual Codex behavior is required for the visible reduction claim; identify other unverified hosts without transferring evidence. Preserve full reports in files, with concise reviewable results in chat.

## 10. Risks And Open Questions

The current dispatcher already supports silent nonterminal continuation, so some workflows may have no redundant cards. Such cases protect existing behavior but do not prove reduction. Host tool blocks may dominate perceived overhead and remain outside scope. Suppression can hide state changes if event classification is wrong; explicit status, blocker and resumption cases protect against this. SD decides minimal consumer changes; TP records concrete comparison cases and observation procedure.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Product scope and protected visibility | before_prd | resolved | Approved UR defines omission within a permitted step and preserves meaningful events, complete status and bound decision cards; criteria above make that observable | Arndt Gold |
| Acceptance and evidence boundary | before_prd | resolved | Strict evidenced reduction in a positive-card baseline, unchanged control/evidence, every registered rendered language and actual Codex visible workflow; no all-host claim without evidence | Arndt Gold |
| Delivery/release scope | before_prd | resolved | Repository changes and review evidence only; no automatic VCS, release or host installation | Arndt Gold |
| Minimal implementation and propagation | later_sd | open | Resolve within existing canonical owners after PRD approval | Codex, SD owner |
| Exact baseline fixtures and host observation procedure | later_tp | open | Fix inputs, counts and evidence capture before implementation; do not substitute a zero-card baseline | Codex, TP owner |

## 11. Next Step

Review and deliberately approve with `Approval: PRD`, revise or decline. Approval permits Solution Design only; implementation still requires later approvals and prerequisites.

## AGDF Approval Summary (de; source=en)

- Nutzerziel: Fortschritt, wichtige Änderungen und die nächste echte Entscheidung mit weniger wiederholtem Lesen von Prozessstatus erkennen.
- Umfang: Innerhalb desselben ausgewählten, bereits erlaubten Arbeitsschritts entfallen einzelne Karten für interne Prüfung, Validierung, Nachweispflege und unveränderten Wiederholungsstatus. Kurze nützliche Fortschrittshinweise und gebündelte Ergebnisse bleiben möglich.
- Sichtbar bleibt: Erforderliche Nutzereingabe, neue Blocker, relevante Unsicherheit/Risiken, Änderungen von Ziel, Run, Scope oder Handlungsspielraum sowie wesentliche prüfbare Ergebnisse werden unverzüglich mit dem erlaubten nächsten Schritt angezeigt. Gebundene Freigabepräsentationen und ausdrücklich verlangte aktuelle Statusansichten bleiben vollständig.
- UX und Zustände: Die interne UX-Analyse ist ready; UI/UX-Auswirkung medium. Laufende interne Arbeit, Entscheidung/Ergebnis, Blocker/Änderung, explizite Statusanfrage und Wiederaufnahme verwenden weiterhin den aktuellen kanonischen Zustand als Autorität. Fortschritt und weggelassene Karten erteilen keine Berechtigung.
- Wiederaufnahme und Reparatur: Nach Unterbrechung wird die aktuelle Bindung geprüft. Relevante Änderungen und bestehende Reparatur-/Retry-Aktionen bleiben sichtbar; alte Freigaben werden nicht übertragen. Unveränderter interner Status muss nicht erneut als Karte erscheinen.
- AC-001: Derselbe feste Ablauf mit nachgewiesenen Zwischenkarten zeigt nachher strikt weniger Karten und weniger Kartenzeichen. Ein Ausgangsablauf mit null Karten beweist keine Verbesserung. Auch der gesamte Framework-Text wird verglichen, damit die Länge nicht nur in Fortschrittsprosa verschoben wird.
- AC-002: Alle Entscheidungen, Blocker, relevanten Risiken/Unsicherheiten, Bindungs-/Berechtigungswechsel und wesentlichen Ergebnisse bleiben rechtzeitig sichtbar, bevor davon abhängige Arbeit weitergeht; einschließlich geänderter Zustände nach Wiederaufnahme. Die vollständige Freigabefolge bleibt erhalten.
- AC-003: Wiederholte interne Auswertung und unveränderte Wiederaufnahme erzeugen keine weitere unveränderte Einzelkarte. Eine explizite Statusanfrage liefert unabhängig von früherer Anzeige immer die vollständige frisch ausgewertete kanonische Ansicht mit aktueller Revision.
- AC-004: Freigaben bleiben exakt an aktuelle Ziel-/Run-/Gate-/Revisions-/Präsentationsbindung gekoppelt. Fehlende, veraltete und fremde Freigaben erlauben keine Fortsetzung. Bestehende Annahme-, Ablehnungs- und terminale Stoppregeln bleiben erhalten.
- AC-005: Sämtliche erforderlichen Kontrollprüfungen, Reviews, Nachweise und Run-Aktualisierungen bleiben vollständig. Vorher/Nachher werden Kontroll- und Nachweispflichten getrennt von der sichtbaren Kartenanzahl verglichen; Identitäts-/Zeitunterschiede werden erklärt.
- AC-006: Alle betroffenen Fälle und Zustände werden in jeder registrierten Sprache gerendert geprüft. Mindestens ein tatsächlich beobachteter Codex-Ablauf muss die sichtbare Reduktion belegen; ohne ihn bleibt diese Aussage unverifiziert und trägt keinen QA-Pass. Quell-/Projektionsprüfung, installierte Bytes und tatsächliche Host-/Session-/Versionsbeobachtung bleiben getrennt; weitere Hosts erhalten nur ihre eigene belegte Aussage.
- AC-007: Bestehende Kontroll-, Interaktions-, Renderer-, Locale- und Projektions-Owner werden genutzt. Keine zweite Zustandsautorität, kein neues Gate/Freigabevertrag und keine hosteigene normative Politik. Review, Projektionskohärenz und passende Integritätsprüfungen belegen dies.
- Abgrenzung: Keine Entfernung von Gates/Prüfungen/Reviews, keine Zustimmung aus Schweigen, keine Änderung von Run-Auswahl/Aktivierung, keine pauschale Fehlerunterdrückung, kein allgemeines Freigabekartenredesign. Separate Quick-Task-Abschluss-, Installations-, Commit- und MCP-Themen bleiben separat. Kein automatischer Commit, Push, Release oder Hostinstallation.
- Zuständigkeit und Grenzen: Arndt Gold verantwortet Produktabnahme und bewusste Freigaben; Codex erstellt Analyse, Design, Planung und Evidenz. Bestehende Kontroll- und QA-Owner bleiben maßgeblich. Hosteigene Tool-Blöcke liegen außerhalb der Kartensteuerung; terminale Dispatcher-Ausgaben behalten wortgetreue Übertragung und Stoppwirkung.
- Entscheidungen: Produktumfang, geschützte Anzeigen, messbare Abnahme und Release-Abgrenzung sind für diese PRD konkret festgehalten. Minimale technische Änderungen/Projektion entscheidet Codex im SD; genaue Vergleichsfälle und Hostbeobachtung im TP. Der bereits vorhandene stille Continuation-Pfad kann null Zwischenkarten zeigen und dient dann nur der Regression, nicht dem Verbesserungsnachweis.
- Nächster Schritt: `Approval: PRD` erlaubt ausschließlich Solution Design. Implementierung benötigt weiterhin spätere Freigaben und Voraussetzungen. Eine Revision oder Ablehnung bleibt möglich.
