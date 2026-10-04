# PRD: Dedicated PRD authoring responsibility

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-04
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Deliver the canonical skill prd-definition for semantic PRD drafting and clarification. It derives one run-local PRD from the approved UR, completed Brownfield Review and applicable existing UX Intent Definition. Gate-check retains prerequisite and readiness evaluation, the dispatcher assigns the work, existing operations record the result, and the user alone approves it.

The result includes scope, non-goals, affected roles, individually identified observable acceptance criteria, constraints, evidence needs, risks and explicit product decisions. Technical design and executable task planning remain downstream responsibilities. This PRD specifies the ownership change; it does not perform that change.

Sources: UR.md and BROWNFIELD_REVIEW.md in this run. Brownfield selects structured_delivery because the public skill identity and responsible continuation affect the shared consumer contract. That depth does not expand product scope.

## 2. UX Intent And Success

- ui_ux_impact: low
- ux_intent_definition: not_applicable for this slice; the approved need and Brownfield Review define unambiguous existing drafting, clarification, revision and approval semantics directly. Applicable UX analysis remains mandatory input when authoring a PRD for another run whose impact requires it.
- primary_user_intent: Turn the approved need into a clear product specification while seeing who authors it, which product answers remain open and when a deliberate decision is possible.
- success_signal: A permitted authoring assignment produces a traceable canonical draft or a useful draft with a focused material clarification; completed authoring returns to fresh readiness evaluation rather than granting approval.
- primary_decision_or_action: Answer a necessary product clarification or inspect the recorded PRD and deliberately respond Approval: PRD when the canonical evaluator permits presentation.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| New PRD drafting | Approved UR and analysis inputs exist; PRD is unapproved | Named authoring responsibility and canonical draft reference | Existing bound run and approved sources | Existing dispatcher continuation and authoring result |
| Product clarification | Material product decision remains open; PRD cannot be presented for approval | Focused question, preserved draft, concrete blocker and next answer needed | Recorded draft and canonical readiness evaluation | Authoring question and existing control presentation |
| Explicit draft revision | Current unapproved PRD may change only within approved intent | Updated draft reference; previous presentation cannot approve changed content | Canonical revision and recording operations | Authoring result followed by fresh control presentation |
| Ready for human decision | Current recorded draft satisfies prerequisites and readiness; approval remains missing | Existing revision-bound PRD summary, artifact link and Approval: PRD request | Existing gate evaluator and presentation writer | Existing interaction presentation |
| Invalid or approved binding | No authoring write is permitted; current control determines recovery | Existing concrete blocker or allowed next step | Canonical target, run, revision and approval integrity | Existing control presentation |

These modes describe an existing interaction, not a new user interface or control state store. A skill selection, completed draft or passing check never means human approval.

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Invoke prd-definition only for an explicit PRD drafting/revision request or a permitted authoring continuation. Direct invocation must resolve canonical target/run prerequisites before drafting. Read-only advice does not activate authoring.
- blockers_and_visible_next_actions: Missing approved source, required blocked UX input, wrong or stale binding, approved destination or material unresolved product question withholds authoring or approval presentation as appropriate. Report the actual missing input and its next permissible action.
- recovery_paths: Refresh canonical routing after stale state; return material approved-UR conflicts to the existing UR revision route. An interrupted or transiently failed recording is resolved through existing canonical recovery, with a visible retry when supported. Never create a substitute run or writer as a workaround.
- relevant_state_transitions: Bound request leads to authoring; a material gap leads to clarification; a sufficient recorded draft leads to fresh gate-check; a changed draft requires a new presentation and deliberate reply; valid Approval: PRD permits the existing SD stage only. Technical retry mechanics remain SD-owned.

## 5. Acceptance Criteria

### Explicit semantic ownership

- criterion_id: AC-001
- requirement: The canonical catalog names prd-definition as the PRD semantic author. PRD preparation routes to that responsibility; gate-check has no competing PRD drafting procedure. Control evaluation, routing, registration and human approval remain separately identifiable.
- observable_success: Source contracts and actual bound dispatch agree on the responsible author. The author returns to control after recording.
- required_evidence: Catalog/contract consistency, bound dispatch observations and review of duplicate ownership paths.

### Derivation and a useful product draft

- criterion_id: AC-002
- requirement: For a permitted new draft with sufficient context, prd-definition derives one canonical PRD from the exact approved UR and available required analyses. It preserves intent and non-goals, uses stable unique criterion IDs and records product decisions without inventing scope, users or acceptance promises.
- working_mode: New PRD drafting
- source_state: Approved UR and completed review; no approved PRD.
- trigger_action: Permitted bound authoring request.
- expected_effective_state: Recorded unapproved PRD linked to the approved source.
- visible_feedback: Draft artifact reference and return to fresh readiness evaluation.
- blocker_failure_behavior: Missing or contradictory prerequisite prevents an unsupported draft or approval claim.
- recovery_next_action: Resolve the named source or product conflict through its existing owner.
- observable_success: Cooperative semantic review can trace every proposed product requirement to the approved need or an explicit supported clarification.
- required_evidence: Concrete authored draft, input context, canonical source proof and semantic review; structural checks alone are insufficient.

### Focused clarification

- criterion_id: AC-003
- requirement: A material missing product answer produces one focused bundled clarification and a useful preserved draft with the decision open. The author distinguishes product decisions from later design/planning questions, retains answered context and asks no technical Run ID question as product clarification. Open material product decisions prevent PRD approval presentation.
- working_mode: Product clarification
- source_state: Permitted authoring with material incomplete product information.
- trigger_action: Encounter an unresolved product, acceptance or accountable-owner decision.
- expected_effective_state: Draft remains unapproved and not ready for presentation.
- visible_feedback: Actual question, missing decision and next answer needed.
- blocker_failure_behavior: No completed/ready claim or manufactured answer.
- recovery_next_action: Record the user's material answer; reroute changed approved intent to UR revision.
- observable_success: Complete inputs draft without redundant questions; an incomplete input withholds presentation until the material answer is resolved.
- required_evidence: Actual complete/incomplete authoring observations and canonical readiness results; no inferred model behavior from templates.

### Draft revision and presentation freshness

- criterion_id: AC-004
- requirement: An explicitly requested revision changes only the bound unapproved draft within approved UR intent, using existing recording and revision controls. A changed draft cannot reuse its earlier presentation or reply. Approved PRDs cannot be edited through this authoring assignment.
- working_mode: Explicit draft revision
- source_state: Current unapproved registered PRD and deliberate revision request.
- trigger_action: Revise the draft.
- expected_effective_state: New canonical draft revision awaiting fresh readiness and presentation.
- visible_feedback: Updated artifact and a fresh bound decision request only when ready.
- blocker_failure_behavior: Approved destination or stale revision produces no authoring write.
- recovery_next_action: Existing canonical routing or approved-intent revision path.
- observable_success: Negative tests reject stale replies and approved-destination writes; a valid revision reaches a fresh presentation.
- required_evidence: Real recording/presentation flow, revision and approval-integrity checks.

### Binding and non-authorizing behavior

- criterion_id: AC-005
- requirement: Authoring uses the canonical confirmed target, selected run, current revision, contained PRD path and exact approved source. Missing, invalid, ambiguous, foreign or stale bindings cannot authorize a write. Direct invocation resolves prerequisites first. The skill cannot approve a gate, create later artifacts or start implementation.
- observable_success: Negative cases preserve protected bytes and control state; valid authoring remains constrained to the selected unapproved PRD.
- required_evidence: Existing target/run/containment controls exercised through the actual new route, including direct invocation and approved-source conflicts.

### Existing readiness and human authority

- criterion_id: AC-006
- requirement: After canonical recording, fresh gate-check determines whether the current PRD can be presented. Existing source relationships, product-decision readiness, criteria checks, applicable UX readiness and deliberate Approval: PRD remain effective. Authoring completion alone cannot advance the gate.
- working_mode: Ready for human decision
- source_state: Recorded current draft.
- trigger_action: Return to control.
- expected_effective_state: Either a concrete blocker or a prepared current PRD presentation awaiting the human.
- visible_feedback: Existing canonical summary, artifact link and exact decision formula.
- blocker_failure_behavior: No approval request from incomplete product decisions or invalid source/UX evidence.
- recovery_next_action: Resolve the actual blocker, then obtain fresh evaluation and presentation.
- observable_success: Valid preparation permits the existing approval flow; no simulated or automatically supplied approval is accepted as human evidence.
- required_evidence: Built CLI/MCP recording, readiness and presentation checks with genuine deliberate replies kept separate from automated tests.

### Shared consumers and budgets

- criterion_id: AC-007
- requirement: Shared CLI/MCP contracts and generated Codex, Claude Code, OpenCode and Copilot projections resolve the same canonical responsibility and limits. Catalog, help, packaged contracts and runtime integrity stay complete. Regenerated instruction/payload costs are measured; no unused headroom or weakened instruction/performance threshold is introduced.
- observable_success: Canonical-catalog equality and built/package consumer checks pass with an exact documented payload delta.
- required_evidence: Existing generators, conformance/integrity, shared function schema, package/protocol checks and budget inventory. Source projection parity does not claim native-host qualification.

### Preserve downstream behavior and existing state

- criterion_id: AC-008
- requirement: UR authoring, SD/TP preparation, gate order, review/QA authority, UAT, audit closeout and existing run approvals retain their current semantics. No new gate, persistence schema, artifact writer or automatic Git/install/release action is introduced. Unrelated runs and repository changes are preserved.
- observable_success: Existing guarded cases keep their meaning and protected artifacts remain unchanged.
- required_evidence: Focused regression coverage, unchanged-guard comparison and scope/preservation review; no claim that this slice solves the deferred ownership changes.

## 6. Non-Goals

UR reimplementation; SD/TP authoring separation; task-zero or review-gate restructuring; execution/UAT/closeout redesign; new approval formulas, MCP write endpoints, persistence or second source of truth; existing-run migration; automatic installation, release, commit, push or PR. A new native host qualification campaign is not a deliverable of this scope.

## 7. Users And Roles

Arndt Gold is the accountable product owner and gate decision maker. Coding agents draft and clarify within the bound assignment. Maintainers implement and verify shared contracts and projections. Gate-check and canonical operations retain their existing technical/control responsibilities; qa-gate remains the sole final quality decision owner. Cooperative drafting/review is identified as such.

## 8. Constraints

- Reuse the existing source relationship, recording, revision, containment and deliberate approval controls; one PRD per bound run.
- Applicable UX Intent Definition is subordinate analytical input, not a competing product source or approval.
- Preserve criteria-chain-v1 and the Approval Decisions table; unresolved before_prd decisions withhold presentation.
- Preserve existing negative guards and supported host/profile boundaries. Measure generated costs before adjusting an exact observed baseline; never increase safety or performance limits to make checks pass.
- Existing repository changes and the separately bound UR-authoring run remain protected. No prior approval transfers.
- English source artifacts and a complete German approval summary follow the current repository language configuration.

## 9. Evidence Requirements

TP must map all eight criteria to concrete tasks, scenarios, expected results and evidence paths. Require both actual runtime binding observations and concrete semantic drafting/clarification observations with identified author/reviewer, original inputs, outputs, questions, uncertainty and current contract identity.

Cover a sufficient new request, material missing product input, unapproved draft revision, approved-intent conflict, invalid bindings and the return to readiness. Include the actual canonical recording/source-proof path, build/package and shared CLI/MCP consumers, host projections, localization, integrity and exact budget inventory. Exercise the existing performance guard when affected; retain failed attempts and superseding corrections explicitly.

Distinguish source, deterministic replay, built protocol/package, cooperative model observation, fresh installed-host behavior and deliberate human acceptance. No fresh installation, independent review or native four-host qualification is promised. QA must judge whether the evidence supports this specified scope and identify limitations rather than relabel weaker evidence.

## 10. Risks And Open Questions

Semantic sufficiency cannot be proven by heading or readiness-token checks alone. Concrete cooperative observations and semantic review are required, with their limits stated. Draft revision must not bypass exact source proofs or approved intent. Catalog growth can cause hidden payload drift; exact inventory and unchanged limits are required. Shared recording instructions must not disappear when PRD semantic instructions move. These risks are design/test obligations, not unresolved product choices.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Product scope | before_prd | resolved | Separate only PRD semantic authoring and clarification; preserve existing control authority and later behavior, as approved in UR | Arndt Gold |
| Canonical responsibility | before_prd | resolved | Name the dedicated authoring skill prd-definition, consistent with ur-definition; gate-check remains the readiness/control responsibility | Arndt Gold |
| Clarification and approval semantics | before_prd | resolved | Material product questions remain open and withhold presentation; completed authoring does not approve; changed intent uses existing revision routes | Arndt Gold |
| Delivery and evidence boundary | before_prd | resolved | Source, generated package/protocol and explicitly identified cooperative behavior evidence; installation, release and independent native-host qualification excluded | Arndt Gold |
| Exact handoff and revision design | later_sd | deferred | SD must choose minimal reusable dispatch/recording seams and failure behavior that satisfy AC-001 through AC-008 | Solution Design author, accountable to Arndt Gold |
| Test mapping and observation procedure | later_tp | deferred | TP must map every criterion and design decision to executable checks and identified evidence lanes without expanding product scope | Task Plan author, accountable to Arndt Gold |

Resolved rows state the proposed product specification derived from the approved UR and clarified scope. They do not claim Approval: PRD; that deliberate decision remains open.

## AGDF Approval Summary (de; source=en)

- Nutzerziel: Aus dem freigegebenen Bedarf eine klare Produktspezifikation erhalten und erkennen, wer sie erstellt, welche Produktfragen offen sind und wann eine bewusste Freigabe möglich ist.
- Umfang: Der eigene Skill prd-definition erstellt und klärt genau ein kanonisches PRD aus der freigegebenen UR, abgeschlossener Brownfield Review und gegebenenfalls erforderlicher UX Intent Definition. Er formuliert Umfang, Nicht-Ziele, Rollen, stabile beobachtbare Akzeptanzkriterien, Einschränkungen, Nachweise, Risiken und Produktentscheidungen. gate-check prüft Voraussetzungen und Freigabereife; der Dispatcher routet, bestehende Operationen registrieren, der Mensch entscheidet.
- AC-001: Der kanonische Katalog benennt prd-definition als fachlichen PRD-Ersteller. Gebundene Vorbereitung und tatsächlicher Dispatch weisen dieselbe Zuständigkeit aus. gate-check enthält keinen konkurrierenden PRD-Formulierungsweg. Erstellung, Kontrolle, Routing, Registrierung und Freigabe bleiben getrennt; nach Erfassung führt der Weg zur Kontrolle zurück.
- AC-002: Ein zulässiger neuer Auftrag mit ausreichendem Kontext ergibt einen unfreigegebenen Entwurf aus exakt freigegebener UR und erforderlichen Analysen. Bedarf und Nicht-Ziele bleiben erhalten; Kriterien erhalten eindeutige stabile IDs, Produktentscheidungen werden erfasst. Umfang, Nutzer und Zusagen werden nicht erfunden. Sichtbar sind Entwurf und erneute Bereitschaftsprüfung; fehlende oder widersprüchliche Quellen führen zum zuständigen Klärungsweg. Konkreter Entwurf, Eingabekontext, Quellenbindung und semantische Prüfung belegen die Ableitung.
- AC-003: Wesentliche fehlende Produktinformationen führen zu einer gezielten gebündelten Frage und einem erhaltenen Entwurf mit offener Entscheidung. Produktfragen werden von späteren Design-/Planungsfragen getrennt; beantworteter Kontext bleibt erhalten, technische Run-IDs sind keine Produktfrage. Die Freigabepräsentation bleibt gesperrt. Nach der Antwort wird geprüft; geänderter freigegebener Bedarf führt zur UR-Revision. Tatsächliche vollständige und unvollständige Fälle sowie Bereitschaftsergebnisse müssen dieses Verhalten zeigen.
- AC-004: Nur eine ausdrücklich angeforderte Überarbeitung des gebundenen unfreigegebenen PRD innerhalb des freigegebenen Bedarfs ist zulässig. Bestehende Registrierung und Revisionskontrolle erzeugen die neue Entwurfsrevision. Alte Präsentationen und Antworten können geänderte Inhalte nicht freigeben. Freigegebene PRDs und veraltete Revisionen erlauben keinen Schreibzugriff. Eine zulässige Überarbeitung erreicht eine frische Präsentation; tatsächliche Erfassung und negative Revisions-/Freigabeprüfungen belegen dies.
- AC-005: Erstellung verwendet das bestätigte kanonische Ziel, den gewählten Run, die aktuelle Revision, den enthaltenen PRD-Pfad und exakt freigegebene Quellen. Fehlende, ungültige, mehrdeutige, fremde oder veraltete Bindungen erlauben keinen Schreibzugriff. Direkter Aufruf klärt zuerst die Voraussetzungen. Der Skill darf keine Gates freigeben, späteren Artefakte erstellen oder Implementierung starten. Tatsächliche Routenprüfungen einschließlich direktem Aufruf und Quellenkonflikten zeigen den Erhalt geschützter Inhalte.
- AC-006: Nach kanonischer Registrierung bestimmt frisches gate-check entweder den konkreten Blocker oder eine aktuelle vorbereitete PRD-Präsentation mit Zusammenfassung, Artefaktlink und exakter menschlicher Entscheidung. Quellenbeziehungen, Produktentscheidungen, Kriterien und erforderliche UX-Bereitschaft bleiben wirksam. Offene Entscheidungen oder ungültige Quellen-/UX-Evidenz erlauben keine Freigabeanfrage. Fertige Erstellung allein schaltet kein Gate weiter; simulierte Zustimmung ist kein menschlicher Nachweis. Gebaute CLI-/MCP-Erfassungs-, Bereitschafts- und Präsentationsprüfungen belegen den Ablauf.
- AC-007: Gemeinsame CLI-/MCP-Verträge und generierte Codex-, Claude-Code-, OpenCode- und Copilot-Projektionen verwenden dieselbe kanonische Zuständigkeit und Grenzen. Katalog, Hilfe, Paketverträge und Laufzeitintegrität bleiben vollständig. Generierte Anweisungs- und Payloadkosten werden exakt gemessen; keine ungenutzten Budgetpolster oder abgeschwächten Anweisungs-/Laufzeitgrenzen. Kataloggleichheit, tatsächliche Paketkonsumenten, Schema-/Protokollprüfungen und Budgetinventar belegen dies. Projektionsgleichheit behauptet keine native Hostqualifikation.
- AC-008: UR-Erstellung, SD-/TP-Vorbereitung, Gate-Reihenfolge, Review-/QA-Autorität, UAT, Auditabschluss und bestehende Freigaben behalten ihre Semantik. Keine neuen Gates, Persistenzschemata, Writer oder automatischen Git-/Installations-/Release-Aktionen. Andere Runs und Repository-Änderungen bleiben erhalten. Gezielte Regressionen, Vergleich unveränderter Schutzprüfungen und Umfangs-/Erhaltungsreview belegen dies; spätere Zuständigkeitsumbauten bleiben separat.
- Entscheidungen: Produktumfang vor PRD geklärt: ausschließlich PRD-Erstellung und Klärung trennen, bestehende Kontrolle und späteres Verhalten erhalten. Kanonische Zuständigkeit vor PRD geklärt: prd-definition entsprechend ur-definition. Klärungs-/Freigabesemantik vor PRD geklärt: wesentliche Produktfragen sperren Präsentation, fertige Erstellung erteilt keine Freigabe, geänderter Bedarf nutzt bestehende Revisionen. Liefer-/Nachweisgrenze vor PRD geklärt: Quell-, Paket-/Protokoll- und ausdrücklich kooperative Verhaltensevidenz; Installation, Release und unabhängige native Hostqualifikation ausgeschlossen. Verantwortlicher Produktowner aller vier Entscheidungen ist Arndt Gold; diese vorgeschlagenen Festlegungen ersetzen Approval: PRD nicht.
- Spätere Entscheidungen: Exakte Übergabe und Revisionsmechanik sind für SD zurückgestellt; der Solution-Design-Ersteller, verantwortlich gegenüber Arndt Gold, entscheidet über minimale wiederverwendbare Dispatch-/Registrierungswege und Fehlerverhalten für alle Kriterien. Testzuordnung und Beobachtungsverfahren sind für TP zurückgestellt; der Taskplan-Ersteller, verantwortlich gegenüber Arndt Gold, ordnet jedem Kriterium und jeder Designentscheidung ausführbare Prüfungen und benannte Evidenzarten zu, ohne den Produktumfang zu erweitern.
- Nachweise und Risiken: TP muss alle acht Kriterien mit Aufgaben, Szenarien, erwarteten Ergebnissen und konkreten Nachweisen verbinden. Tatsächliche kanonische Registrierung, Quellenbindung, konkrete Entwurfs-/Klärungsbeobachtungen und negative Bindungsfälle sind erforderlich. Autor, Reviewer, Eingaben, Ausgaben, Fragen, Unsicherheit und aktuelle Vertragsidentität werden benannt. Strukturprüfungen allein beweisen keine fachliche Qualität. Fehlversuche und spätere Korrekturen bleiben sichtbar; betroffene bestehende Laufzeitprüfungen werden ausgeführt. Quellprüfung, Replay, gebautes Protokoll/Paket, kooperative Beobachtung, frischer Host und bewusste menschliche Abnahme bleiben unterscheidbar. Keine unabhängige Review-Instanz oder frische Vier-Host-Qualifikation wird versprochen.
- Lieferweg und Grenzen: Brownfield Review wählt structured_delivery wegen des öffentlichen Skill-/Dispatch-Vertrags; der fachliche Umfang bleibt begrenzt. UR, SD-/TP-Erstellung, Task 0, Reviews, Umsetzung, QA, UAT, Abschluss und Release werden nicht neu geordnet. Keine zusätzlichen Gates, Writer, Kontrollspeicher, Run-Migrationen oder automatischen Installations-, Git- und Veröffentlichungsaktionen. Die gemeinsame Registrierung, Kriterienkette, UX-Eingaben, Budgets und fremden Zustände bleiben erhalten. Semantische Qualität, Revisionssicherheit, Projektionskosten und Erhalt der gemeinsamen Registrierung sind Design-/Testpflichten.
- Freigabeentscheidung: Approval: PRD bestätigt diese Produktspezifikation und erlaubt anschließend Solution Design. Implementierung bleibt bis zur bestehenden TP-Freigabe und ihren Voraussetzungen gesperrt. Der deutsche Abschnitt ist redaktionelle Freigabehilfe; die englische Produktspezifikation bleibt die kanonische Quelle.
