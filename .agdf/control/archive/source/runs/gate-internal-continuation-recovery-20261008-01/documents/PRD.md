# PRD: Reliable internal gate continuation and actionable recovery

Status: draft
Gate: PRD
Gate approval: open
Date: 2026-10-08
Owner: Arndt Gold
Run: gate-internal-continuation-recovery-20261008-01
Language: en
Traceability contract: criteria-chain-v1
Decision contract: prd-decisions-v1

## Product Scope

Provide one bounded improvement to existing AGDF delivery: eligible internal prerequisites and same-scope corrective/evidence work continue through their existing owners without additional user restart prompts. Actual decision, authority and external-host boundaries remain visible and enforced. Diagnostics distinguish the failed condition and actual next actor; required host qualification is prepared as one version-bound handoff.

The approved UR is the primary product input. The completed Brownfield Review selects structured_slice; ready UX Intent Definition provides analytical working-mode and recovery input. Both analyses are subordinate to this PRD once approved. This draft authorizes no implementation.

Included behavior:

- Prepare an eligible missing internal source before dependent authoring. Distinguish absence from malformed readiness and a genuinely unresolved user requirement.
- Support already permitted QA-revise correction, review/evidence work or explicit external-observation handoff, respecting the canonical normalized gap owner. Upstream requirement/design/plan gaps remain with their existing source owner and approval/revision process.
- Make the failure and allowed correction concrete. Validate the agent's supported invocation and own unapproved content before dependent work. Do not retry an unchanged failed condition blindly.
- Align actual continuation/stopping with canonical user-facing actor/action presentation.
- Before a necessary host reconnection, prepare one exact candidate and bounded observation sequence; retain applicable prior evidence and name fresh obligations caused by a changed candidate.
- Verify fixed multi-turn chains, protected negative cases, changed localized presentations and installed-host evidence separately.

The existing six dispatcher result variants, declared input fields/skill eligibility, canonical writers and public approval values remain the integration boundary. This slice requires no new public field, outcome, CLI flag, gate, persistent schema, installer behavior or host capability. Any newly discovered need to change those boundaries returns to the existing depth/scope assessment before dependent work.

## UX Intent And Success

- primary_user_intent: Decide genuine scope/approval questions while the agent completes already permitted internal preparation and recovery without repeated restart prompts.
- success_signal: Fixed permitted pre-PRD and QA-revise chains reach the next real human decision or exact external blocker with zero extra continuation prompts and complete control/evidence. Necessary approvals and external actions are counted separately.
- primary_decision_or_action: Review the current bound artefact or answer a genuinely missing requirement; perform a prepared external host action only when needed.
- user_visible_value: Less coordination of internal framework work; clear reason and actor whenever work actually stops.

## Working Modes And Effective State

| Working mode | Effective state and visible feedback | Effective-state authority | Primary state-presentation owner |
|---|---|---|---|
| Active preparation | Named eligible internal input is being prepared; no restart response required | Current Core evaluation and approved sources | Agent progress under the existing interaction contract |
| Active correction/evidence | Named same-scope action is permitted; validation and reevaluation determine further work | Current evaluation and existing normalized review-gap owner | Existing canonical presentation plus brief actual progress |
| Explicit status inspection | Fresh current observation; inspection ends without starting delivery | Existing read-only evaluation | Canonical status presentation |
| Awaiting human decision | Exact current target/run/gate/revision/artefact and required deliberate response | Existing presentation and approval process | Canonical approval or focused clarification presentation |
| Awaiting external observation | Exact candidate/action sequence ready; observation remains unproven | Recorded obligation and actually observed identity/evidence | Existing qualification/evidence owner |
| Technical/integrity block | Actual failed condition, responsible actor and allowed next action; no false success | Existing validation/evaluation/error source | Canonical recovery/status presentation |
| Interrupted/resumed | Fresh binding/evaluation before further work; meaningful changed prerequisite visible | Current canonical state, not an old progress message | Existing current-state presentation and agent progress |

Visible states include working, missing internal prerequisite, malformed unapproved input, corrected/validated input, ready decision, external action required, unchanged failure, authority/integrity block and stale prior observation. Source state and presentation are distinct; neither analysis nor a visible label grants authority.

## Activation, Blockers, Recovery And Transitions

The existing Request Activation contract remains authoritative. Explicit action intent, an exact pending approval or unambiguous active-run continuation can activate work. An ordinary status, explanation or comparison remains read-only. Existing binding must be freshly checked after interruption.

Product outcomes for the observed families:

| Condition under current control | Next actor / existing owner | Required observable behavior |
|---|---|---|
| Eligible missing UX or another already required internal input | Existing prerequisite owner | Prepare, validate, record, reevaluate same run; no restart prompt before dependent authoring |
| Malformed readiness in the agent's own unapproved source | Existing authoring owner | Name exact source/field/expected/observed condition; permitted correction and validation; no approved-source edit |
| Invalid dispatcher argument or skill option | Calling agent using the declared contract | Reject invalid input; correct before a subsequent permitted call; do not make unsupported input valid |
| QA implementation finding within approved scope and current permission | Existing CD+Tests owner | Perform bounded correction and refresh required evidence/reviews; do not infer QA approval |
| QA evidence obligation obtainable internally | Existing evidence/review owner | Collect the exact missing proof, retain applicable evidence, then reassess QA when obligations are fulfilled |
| QA evidence obligation needing actual host action | Existing evidence owner and named external actor | Prepare candidate and full bounded sequence before external action; remain explicitly unqualified until observed |
| Upstream requirement/design/plan gap or changed approved intent | Existing normalized source owner | Expose required source/revision/decision route; do not rewrite approved artefacts or treat QA-revise as implementation authority |
| Missing material user choice | User, requested by responsible owner | One focused bundled clarification; preserve useful unready draft; no approval presentation before readiness |
| Invalid integrity/runtime, ambiguous binding or unchanged failed correction | Existing blocker/recovery owner | One precise stop, allowed next action and actual responsible actor; no bypass, silent reinstall or alternate run |
| Explicit status request | Existing inspection owner | Current read-only report; no delivery work or continuation promise |

Recovery sequence: identify current bound condition -> act only through an already permitted owner -> validate/record where applicable -> reevaluate current control -> continue or present the genuine decision/blocker. Corrective work must change the failed input or complete missing evidence before another dependent attempt. The same unchanged failure ends the sequence; a retry is not approval and cannot widen scope. Independent known issues should be prepared together where the current owner can safely do so.

Host sequence: finish applicable source checks -> prepare exact candidate identity and required observation plan -> request only the necessary external connection/reopen action -> observe the actually loaded candidate -> attach version-specific evidence -> reassess outstanding obligations. Real candidate changes or host defects can require another cycle. No observation from an older resource proves the replacement.

## Acceptance Criteria

- criterion_id: AC-001
  - working_mode: active preparation
  - source_state: approved upstream sources and a current bound authoring route with an eligible missing internal UX prerequisite
  - action: continue the explicit delivery request
  - expected_effective_state: the existing prerequisite owner prepares, validates and records the input before dependent PRD authoring; current control is reevaluated
  - visible_feedback: brief real progress, then next genuine decision or exact blocker; no additional restart question
  - blocker_failure_behavior: missing material user intent or authority is identified and prevents dependent work
  - recovery_next_action: named existing owner completes the input or requests the actual missing decision
  - observable_success: the eligible fixed chain reaches bound PRD readiness with zero extra continuation prompts; the genuine-gap countercase remains unready
  - required_evidence: chained before/after trace with sources, revisions, actions, prompts and decision boundary

- criterion_id: AC-002
  - working_mode: active preparation and bounded correction
  - source_state: missing UX file, malformed exact readiness field, or the agent's incomplete unapproved input
  - action: inspect and correct through the permitted owner
  - expected_effective_state: distinct diagnoses identify source/field, expected and available observed condition; corrected input is validated before reevaluation
  - visible_feedback: concrete condition, owner and permitted correction; no broad repeated checklist in place of the known cause
  - blocker_failure_behavior: approved or foreign inputs remain protected; an unchanged failed condition stops without blind repeated attempts
  - recovery_next_action: repair only the permitted unapproved input or expose the precise blocked source/owner
  - observable_success: missing-file and wrong-field cases are distinguishable; an eligible correction continues without user restart, while unchanged/forbidden cases remain stopped
  - required_evidence: source-readiness and correction-chain cases including protected approved-source countercase

- criterion_id: AC-003
  - working_mode: QA-revise correction and evidence maintenance
  - source_state: current valid bound QA-revise run with existing normalized implementation, evidence or upstream gap
  - action: continue the explicitly requested same-scope follow-up
  - expected_effective_state: the existing gap owner receives only the action currently allowed; implementation/evidence work, upstream source decision and external host observation remain distinguishable
  - visible_feedback: actual next actor/action and decisive outstanding obligation; no ready QA approval while the report remains revise
  - blocker_failure_behavior: missing/conflicting gap classification, changed scope or absent authority prevents corrective implementation and identifies the necessary owner
  - recovery_next_action: refresh affected CD+Tests/reviews/QA only when their obligations are satisfied; use existing upstream revision/approval route for source gaps
  - observable_success: fixed implementation, internal-evidence, external-evidence and upstream-gap traces each follow the proper route with no redundant restart for permitted internal work
  - required_evidence: normalized finding inputs, evaluated permission, selected action and updated evidence/review traces; negative scope/authority cases

- criterion_id: AC-004
  - working_mode: host invocation and execution/stop presentation
  - source_state: declared skill/input contract and actual dispatch outcome, including malformed language field or incompatible continuation option
  - action: invoke the existing operation and communicate its result
  - expected_effective_state: supported invocations use declared fields/options; invalid inputs remain rejected with concrete correction; visible actor and continuation/stop promise match actual execution
  - visible_feedback: real internal progress, exact pending decision, named external action or concrete terminal reason as appropriate
  - blocker_failure_behavior: a terminal result cannot promise immediate autonomous work that does not occur; incompatible inputs do not gain authority
  - recovery_next_action: calling agent corrects its permitted invocation from the existing contract before another attempt, or exposes the unchanged blocker
  - observable_success: valid MCP/CLI invocation cases continue correctly; invalid-option/language cases remain rejected; actor/result combinations contain no false work promise
  - required_evidence: input-contract checks, actual result/host-action traces and rendered affected presentations in every registered locale

- criterion_id: AC-005
  - working_mode: external host qualification
  - source_state: required fresh host evidence and a prepared candidate, or a replacement resource invalidating specific observations
  - action: request the necessary connection/reopen action and execute the bounded observation sequence
  - expected_effective_state: candidate identity and complete sequence are ready before the request; actual loaded identity is established; evidence applicability is stated per affected obligation
  - visible_feedback: exact candidate, required external action, what remains unobserved and resulting observation/gap
  - blocker_failure_behavior: wrong/stale candidate or inaccessible host does not qualify the new resource; source/package checks do not imply native success
  - recovery_next_action: correct the explicit connection/observation gap through the existing owner; preserve applicable evidence and name fresh obligations
  - observable_success: one stable successful candidate is qualified in one prepared observation session without piecemeal restart requests; real changes/failures create explicit further work
  - required_evidence: candidate/served/observed identity, prepared sequence timestamp, actual installed-host observation trace and evidence-applicability record

- criterion_id: AC-006
  - working_mode: comparison and interrupted/resumed delivery
  - source_state: fixed comparable pre-PRD and QA-revise scenarios with recorded initial state and allowed work
  - action: execute baseline/corrected chains and resume after a deliberate interruption
  - expected_effective_state: fresh binding determines resumption; prompt/stop/correction counts distinguish unnecessary restarts from legitimate decisions and external actions
  - visible_feedback: meaningful changed prerequisites and real next decision remain visible without duplicate restart demands for unchanged permitted work
  - blocker_failure_behavior: changed revision/authority is rechecked; it is never silently adopted from earlier observations
  - recovery_next_action: continue the freshly confirmed bound action or expose the changed condition and owner
  - observable_success: corrected permitted cases need zero extra continuation prompts; all required approvals, canonical updates and evidence remain present
  - required_evidence: before/after ledger per phase, full action/decision chain and interruption/resumption countercases; counts are not simulated as actual user timing

- criterion_id: AC-007
  - working_mode: protected stop and read-only inspection
  - source_state: missing/stale/foreign approval, ambiguous target/run, changed approved intent, invalid seal/runtime or a status-only request
  - action: request continuation or inspection as applicable
  - expected_effective_state: existing activation, binding, integrity and approval boundaries retain their behavior; inspection remains read-only
  - visible_feedback: actual blocker with its actor and permitted action, or current status without delivery promise
  - blocker_failure_behavior: no alternate run, scope expansion, approval transfer, silent reinstall or integrity bypass
  - recovery_next_action: existing source/approval/control/host owner resolves the exact condition; no invented recovery authority
  - observable_success: negative cases cannot start forbidden work or mutate unrelated control; status inspection starts no delivery
  - required_evidence: negative transition/approval/integrity cases and control-path/byte observation for read-only activity

- criterion_id: AC-008
  - working_mode: review, localization and evidence assessment
  - source_state: current implementation candidate and run-local proof obligations
  - action: inspect owners, rendered changed states and qualification evidence
  - expected_effective_state: existing evaluation, normalized gap and presentation owners remain singular; source/package/protocol/native evidence and remaining gaps are distinguishable
  - visible_feedback: concrete supported result and limits without generic success or unobserved-host claims
  - blocker_failure_behavior: missing applicable evidence prevents its readiness claim; a parallel authority or inconsistent translated state remains an open finding
  - recovery_next_action: correct through the existing responsible owner and supply the exact missing proof
  - observable_success: complete run/revision/relationship chain, no parallel policy/renderer/store, all changed registered-language states rendered and checked, installed claims individually evidenced
  - required_evidence: source/structure review, canonical chain validation, all-locale rendered results and separately identified installed-host trace

## Non-Goals

No gate removal/combination, automatic approvals, implicit consent, changed approval syntax or release authority. No new scheduler, persistent recovery store, public schema/outcome/input/CLI flag, installation or host capability. No global card redesign or blanket card suppression. Existing intake-after-UR, intermediate-card, actionable-card and stale-next-step runs retain their independent scopes. No approved-source edits or approval transfer; no automatic host restart, reinstall, inventory exclusion, seal repair, publication or Git action.

## Users And Roles

- User: decides actual scope/approval questions and supplies genuinely missing intent; performs necessary external host action.
- Agent: executes only currently permitted preparation/correction, uses declared invocation contracts and records/reevaluates through existing owners.
- Core and existing skill owners: retain control evaluation, exact approval, authoring, normalized gap, evidence, review and QA responsibility; this is no new role or authority.
- Reviewer: assesses implementation and evidence dimensions; qa-gate remains the sole final quality decision owner.

## Constraints

Keep exact target/run/revision/artefact/presentation binding, containment, integrity, locks, canonical source relationships and supported runtime provenance. Status inspection remains read-only; progress and diagnostics are non-authorizing. No recovery hides a new requirement or converts an upstream source gap into code permission. Reuse current typed result members and canonical renderers; SD specifies compatible mechanics. Preserve unrelated working-tree and control work. Native observations qualify only the actually tested candidate/host path.

## Evidence Requirements

Record the reference symptom chain and candidate identity before correction, then compare the same initial cases. Count extra continuation prompts, internal terminal stops and unchanged correction attempts separately from required gate decisions and external actions. Include pre-PRD missing/malformed inputs, QA implementation/internal-evidence/external-evidence/upstream gaps, invalid invocation, unchanged failure, interruption/resumption and protected negative cases. Retain evaluated permissions and canonical recording/source relationships.

Use source/contract tests and rendered all-locale checks for their own claims. Packaged/served identity and actual fresh installed-host multi-turn qualification are separate obligations. The first native claim requires a fresh observed supported path (the existing Codex route supplies the reference); broader host claims need their own evidence. A missing accessible host remains an explicit evidence gap. No source test is claimed as a live model/host result. Test/task/command details belong to TP, not this PRD.

## Risks And Open Questions

- Source and invocation mistakes can mimic framework routing defects; evidence must distinguish them.
- Repeated autonomous recovery could create loops or cross approval boundaries. Unchanged conditions stop and source gaps retain their proper owners.
- Progress/terminal wording must reflect actual host-action semantics without weakening terminal safety or creating a second state authority.
- Shared active scopes require baseline reassessment before implementation. Package coherence/installer fixes remain independently governed.
- Exact diagnostic representation and bounded correction bookkeeping are SD decisions. Concrete scenario/command mapping and native qualification sequence are TP decisions; no material product question remains open.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| D-001 Continuation versus decision boundary | before_prd | resolved | Execute only currently permitted internal prerequisites/correction; stop at genuine decision, source-authority gap or concrete external blocker | PRD owner |
| D-002 QA-revise scope | before_prd | resolved | Reuse existing normalized gap ownership; distinguish internal correction/evidence, external observation and upstream revision; revise never grants blanket authority | PRD owner |
| D-003 Recovery bound and diagnostic need | before_prd | resolved | Identify failed condition/owner, validate a permitted changed input, stop on unchanged failure; invalid inputs remain rejected | PRD owner |
| D-004 Host and release acceptance | before_prd | resolved | Prepare version-bound qualification before handoff; prove each installed claim separately; no new host, publication, installer or release action | PRD owner |
| D-005 Benefit measurement and protected controls | before_prd | resolved | Fixed permitted cases need zero extra restart prompts; count actual decisions/external actions separately and retain full checks/evidence | PRD owner |
| D-006 Existing-contract implementation mechanics | later_sd | open | Map source diagnostics, prerequisite/QA handoffs and truthful host-action presentation into existing compatible owners/result members; no new public schema | SD owner |
| D-007 Executable scenario and observation mapping | later_tp | open | Map every criterion/design decision to tasks, expected outcomes, commands and exact native qualification/evidence sequence | TP owner |

## Next Step

Review this exact PRD and respond with `Approval: PRD`, request revision or decline. Valid PRD approval permits existing SD preparation only. SD, TP, implementation, QA and release are not approved here.

## AGDF Approval Summary (de; source=en)

- Nutzerziel: Bereits erlaubte Vorbereitung und Nacharbeit sollen bis zur nächsten echten Entscheidung weiterlaufen, ohne dass der Nutzer interne Schritte wiederholt anschiebt.
- Umfang: Fehlende interne Voraussetzungen, genaue Fehlerdiagnosen, QA-Revise-Weiterleitung, passende Akteurs-/Stoppdarstellung und vorbereitete versionsgebundene Host-Prüfung innerhalb bestehender Eigentümer und Kontrollregeln.
- AC-001: Eine erlaubte fehlende UX-Voraussetzung wird vor dem PRD vorbereitet, geprüft und erfasst. Echte fehlende Nutzerinformation oder Berechtigung bleibt ein konkreter Blocker.
- AC-002: Fehlende Datei und falsches Bereitschaftsfeld werden gezielt unterschieden. Eigene unfreigegebene Eingaben dürfen im erlaubten Rahmen korrigiert werden; unveränderte Fehler stoppen, freigegebene Quellen bleiben geschützt.
- AC-003: QA-Revise unterscheidet Implementierung, interne/externe Nachweise und vorgelagerte Quelllücken. Nur aktuell erlaubte Arbeit geht an den vorhandenen Eigentümer; keine QA-Freigabe aus Revise.
- AC-004: Aufrufe verwenden gültige Felder und skillabhängige Optionen. Ungültige Eingaben bleiben abgewiesen. Sichtbarer Akteur und Fortsetzungsversprechen entsprechen dem tatsächlichen Ablauf.
- AC-005: Vor nötiger Neuverbindung stehen Kandidat und Prüffolge bereit. Beobachtet wird die tatsächlich geladene Fassung; neue Pakete erhalten gezielt frische Nachweise, weiter gültige Evidenz bleibt erhalten.
- AC-006: Feste Vorher-/Nachher-Abläufe einschließlich Wiederaufnahme benötigen bei erlaubter interner Arbeit keinen zusätzlichen Weiterarbeits-Prompt. Echte Freigaben, externe Aktionen und alle Nachweise bleiben getrennt sichtbar.
- AC-007: Freigabe-, Ziel-, Run-, Revisions-, Integritäts- und Laufzeitgrenzen bleiben wirksam. Statuslesen startet keine Arbeit; keine fremden Runs, stillen Installationen oder Kontrollumgehungen.
- AC-008: Bestehende Kontroll-, Gap- und Darstellungs-Eigentümer bleiben eindeutig. Geänderte Zustände werden in allen registrierten Sprachen gerendert geprüft; Quellen-, Paket- und echte Host-Nachweise bleiben getrennt.
- Entscheidungen: Fortsetzungsgrenze, QA-Revise-Umfang, begrenzte Korrektur, Host-Abnahme und Erfolgsmessung sind für dieses PRD festgelegt. Die technische Abbildung bleibt beim SD-Eigentümer, konkrete Aufgaben und Prüffolgen beim TP-Eigentümer.
- Abgrenzung und Belege: Keine entfallenden Gates, automatischen Freigaben, neuen öffentlichen Schemas, dauerhafte Recovery-Datenhaltung, Host-Erweiterungen, Installer-/Release- oder Git-Aktionen. Vorhandene verwandte Runs behalten ihren Umfang. Die freigegebene UR, Brownfield Review, UX-Eingabe und bestehende Core-Verträge bleiben maßgeblich; die Lösung und ihre Tests sind noch nicht umgesetzt.
- Risiken und nächster Schritt: Agentfehler und Frameworkfehler müssen getrennt belegt werden; Wiederholungsschleifen und verdeckte Berechtigungserweiterung bleiben ausgeschlossen. Installierte Mehrturn-Beobachtung steht noch aus. `Approval: PRD` erlaubt anschließend das Lösungsdesign, noch keine Implementierung.
