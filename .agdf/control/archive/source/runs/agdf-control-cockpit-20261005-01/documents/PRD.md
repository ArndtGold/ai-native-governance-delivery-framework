# PRD: Local read-only AGDF control cockpit

Status: draft
Gate: PRD
Gate approval: open
Based on: approved UR; completed Brownfield Review; ready UX Intent Definition
Date: 2026-10-05
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Deliver a locally running React cockpit for one explicitly selected local AGDF repository. Its connected reading journey is run overview, selected-run detail and registered artefact inspection. Users can find a run, understand the current canonical evaluation and compare it with supporting source documents. The intended benefit is less searching, associating and comparing; no measured time-saving claim is made.

The overview includes active and completed runs and visibly identifies invalid or unavailable entries. It shows run ID, available objective/title, lifecycle and Core-supplied gate/decision/blocker/approval information; absent information remains unavailable rather than inferred. The detail is the primary presentation of evaluated status, recorded approvals, missing evidence and the next permitted action. Persisted assertions are visibly distinguished when they disagree with evaluation. A next permitted action is informational and does not execute anything.

Initial document coverage is registered UTF-8 Markdown, JSON and plain text within the permitted control resources. Markdown is a readable inert preview, JSON and plain text retain readable source content. Registered references may be followed only when they satisfy the same allowed read boundary. Unsupported binary documents show identity, source reference and an explanation; inline PDF, office, image and video previews are deferred. The cockpit is not a general repository file browser.

Repository selection occurs deliberately for the local session. No automatic target selection, remote access, cockpit write operations, browser approval submission or second persistent store is included. The interface is German; document content retains its original language.

## 2. UX Intent And Success

- ui_ux_impact: medium
- ux_intent_definition: ready analytical input in UX_INTENT_DEFINITION.md; this PRD incorporates its observable semantics and becomes product authority only after deliberate approval.
- primary_user_intent: Find and understand the selected run and its evidence with less separate file navigation, retaining source and human decision authority.
- success_signal: A user completes overview to run detail to registered document and back, identifies the same target/run/data version throughout and understands availability, blockers and safe next actions.
- primary_decision_or_action: Select a run, inspect it, open an allowed document and reload when needed. Human gate decisions remain in the existing AGDF workflow outside the cockpit.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Repository inspection | Inventory and its completeness for the explicitly selected target | loading, available, truly empty, partial, unavailable, invalid | Canonical control files and existing Core readers/evaluators | Run overview with target and inventory quality |
| Selected-run inspection | Evaluation and separate persisted assertions for one identified run/data version | loading, available, invalid, blocked, changed/stale, removed, read error | Existing Core evaluation of canonical files; persisted prose is supporting evidence | Selected-run detail with state, blockers, approvals, source and next action |
| Registered-document inspection | Allowed document content/availability associated with that run/data version | loading, content, missing, unsupported, blocked, changed/stale, read error | Registered source content within the control-read boundary; no new approval authority | Document view with source, run and version context |

Lifecycle completion, QA, UAT, gate approval and availability are separate dimensions. A malformed/partial inventory is never reported as a successfully empty repository. Old content may remain readable only with a conspicuous stale/previous-data label and no current-evaluation claim.

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Start the local cockpit for an explicitly selected repository and open the local interface. Select a run to enter detail, then a registered document to enter its reading view. Return to detail/overview without losing valid context. Stopping the service ends local access; no reading action activates execution.
- blockers_and_visible_next_actions: Missing or unreadable control shows the target and an explanation. Invalid runs remain identifiable and direct the user to the existing source-repair workflow outside the cockpit. Missing documents say which source is absent; unsupported formats explain the preview limit; blocked reads explain the denied operation without exposing unrelated content. No repair or approval button is offered.
- recovery_paths: Provide visible retry for recoverable read/service failure. Reload on changed data refreshes the current run/document context before a current-state claim. Retain the selection if it still exists; otherwise return to the inventory with a removed-run explanation. Failed refresh leaves clearly marked previous content or an unavailable view, never an unlabeled success. Persistent source errors instruct repair outside the cockpit followed by retry.
- relevant_state_transitions: Startup to loading to available/empty/error inventory; run selection to loading to detail/invalid/removed; document selection to content/missing/unsupported/blocked; observed source mutation to changed-state notice to explicit reload to refreshed data; transient failure to retry to new result or persistent error; document return to same detail; detail return to overview. Each transition carries target/run/data provenance and prevents silent cross-run mixing.

## 5. Acceptance Criteria

### Inventory

- criterion_id: AC-001
- working_mode: repository inspection
- source_state: Explicitly selected repository with available, absent, invalid or partially readable run store.
- trigger_action: Open or reload the overview.
- expected_effective_state: Inventory includes active and completed runs with exact IDs and available objectives, lifecycle and Core-supplied status; incomplete entries remain identifiable.
- visible_feedback: Selected target, inventory quality, run identities and separate lifecycle/gate/decision/blocker/approval information; explicit unavailable values where needed.
- blocker_failure_behavior: Missing control, unreadable data or invalid entries cannot silently become an empty successful list or a permissive state.
- recovery_next_action: Retry recoverable reads or repair the named source outside the cockpit and reload.
- observable_success: Known active/completed/invalid fixture runs are represented correctly; a genuinely empty inventory is distinguishable from failure.
- required_evidence: Core inventory/parity fixtures and real-repository browser observation.

### Evaluated detail

- criterion_id: AC-002
- working_mode: selected-run inspection
- source_state: A selected inventory entry with a known run/data version.
- trigger_action: Open its detail.
- expected_effective_state: Gate, decision, recorded approvals, missing evidence, blockers and next permitted action agree with canonical Core evaluation of that same data version.
- visible_feedback: Run identity, source references, revision/data context and explicit separation of persisted assertions from evaluation, including visible disagreement.
- blocker_failure_behavior: Invalid or changed source yields an invalid/stale state; absent fields are not invented; QA/UAT are not presented as lifecycle completion.
- recovery_next_action: Reload changed data or repair source outside the cockpit and retry.
- observable_success: Comparison with the corresponding Core report agrees for available fields; deliberately contradictory prose remains visibly subordinate.
- required_evidence: Deterministic evaluator parity and a browser scenario with contradictory persisted prose.

### Navigation

- criterion_id: AC-003
- working_mode: all three reading contexts
- source_state: A valid target and optional selected run/document.
- trigger_action: Navigate overview to detail to document and return, using pointer or keyboard.
- expected_effective_state: Target/run selection remains consistent across the journey; return preserves valid context; keyboard access and readable labels/headings are available.
- visible_feedback: Current view and selected run/document are apparent; focus follows navigation coherently; loading feedback prevents confusing old content with a newly selected item.
- blocker_failure_behavior: Removed selections or failed navigation cannot display another run under the previous identity.
- recovery_next_action: Return to the still-valid run or inventory with an explanation and choose again.
- observable_success: The entire journey can be completed by keyboard and pointer with matching identities and meaningful focus.
- required_evidence: Browser observations covering both navigation methods and removed-selection recovery.

### Registered documents

- criterion_id: AC-004
- working_mode: registered-document inspection
- source_state: A selected run and its registered permitted control documents/references.
- trigger_action: Open a document.
- expected_effective_state: Supported UTF-8 Markdown, JSON and text are readable; source identity and relation to the selected run/data version remain explicit. Document content is inert and does not execute active content.
- visible_feedback: Document title/type, control source/path, run identity and revision/data-version context; clear missing/unsupported/blocked states instead of an empty preview.
- blocker_failure_behavior: Unregistered/disallowed paths are denied, missing files are reported, unsupported binary formats are explained and document errors do not discard the run selection.
- recovery_next_action: Return to the run, select another registered resource, or reload after source repair.
- observable_success: Supported registered documents open with correct content/provenance; unsupported, missing and unsafe content receive truthful bounded treatment.
- required_evidence: Document format/content fixtures, active-content safety checks and real registered-document browser observation.

### Truthful failure states

- criterion_id: AC-005
- working_mode: all three reading contexts
- source_state: Loading, truly empty, partial, missing, invalid, blocked or failed reads.
- trigger_action: Perform the affected read.
- expected_effective_state: Each state remains distinct and reflects the affected scope; failure never implies success, approval or absence of all runs.
- visible_feedback: Plain German explanation, affected target/run/document and one appropriate next action.
- blocker_failure_behavior: A partial or failed read must not clear known entries and label the repository successfully empty; invalid control cannot imply permission.
- recovery_next_action: Retry a recoverable failure or repair the named source outside the cockpit.
- observable_success: Injected cases produce distinguishable states and useful next actions.
- required_evidence: Failure fixtures and browser observations of representative cases.

### Freshness

- criterion_id: AC-006
- working_mode: all three reading contexts
- source_state: Displayed data while an external process changes the selected control sources.
- trigger_action: Read related detail/document, observe a change, or request refresh.
- expected_effective_state: Related displayed inventory/detail/document data is associated with a coherent identified version. Conflicting data versions are rejected or explicitly marked stale; changed data is reloaded before a current-authority claim.
- visible_feedback: Data/revision context, changed-state notice and reload action; retained prior content clearly labeled stale.
- blocker_failure_behavior: No silent mixture of new evaluation, old documents and another run; failed refresh cannot erase freshness warnings.
- recovery_next_action: Explicit reload retains valid selection and refreshes its related context; removed run returns to inventory with explanation.
- observable_success: Mutation during reading never produces an unlabeled coherent/current claim over inconsistent sources.
- required_evidence: Deterministic concurrent-change scenarios and visible refresh/removal browser evidence.

### Recoverable reads

- criterion_id: AC-007
- working_mode: all three reading contexts
- source_state: Transient local read or service failure.
- trigger_action: Activate visible retry after the error.
- expected_effective_state: The affected context is read again without control writes or loss of still-valid run selection.
- visible_feedback: Error, retry affordance, progress and resulting available or still-failed state.
- blocker_failure_behavior: Persistent failure remains explicit; repeated attempts cannot turn old content into an unlabeled current result.
- recovery_next_action: Retry after service/source recovery or return to the inventory.
- observable_success: A transient failure followed by recovery completes the same user journey through visible retry.
- required_evidence: Deterministic read-failure/recovery fixture and browser retry observation.

### Read-only authority

- criterion_id: AC-008
- working_mode: all three reading contexts
- source_state: Selected repository and existing control, approval and presentation records.
- trigger_action: Browse, open documents, navigate, refresh and retry.
- expected_effective_state: Every control file remains byte-identical; the cockpit cannot create runs, edit artefacts, submit approvals, advance gates, execute agents or trigger Git operations. No second durable state source is created.
- visible_feedback: Read-only mode is apparent; next permitted actions are information, with human gate decisions retained in the existing workflow.
- blocker_failure_behavior: Attempted write/execution operations are unavailable or denied; document content cannot trigger hidden operations.
- recovery_next_action: Use the existing deliberate AGDF workflow outside the cockpit for changes/decisions.
- observable_success: Before/after file comparison for all reading journeys is unchanged and boundary tests reject write/execution attempts.
- required_evidence: Full control-tree byte comparison, denied-operation checks and visible read-only UI evidence.

### Allowed local access

- criterion_id: AC-009
- working_mode: all three reading contexts
- source_state: Local session explicitly bound to one selected repository.
- trigger_action: Request inventory, run detail or a registered document, including malformed/foreign requests.
- expected_effective_state: Only the allowed control resources for the selected target are accessible. Arbitrary files, traversal, symlink escape, unsolicited foreign-browser origins and automatic target substitution are prevented.
- visible_feedback: Allowed reads show selected-target provenance; denied reads provide a bounded explanation without unrelated source contents.
- blocker_failure_behavior: Invalid or foreign requests fail closed; unknown boundaries never fall back to broad filesystem access.
- recovery_next_action: Return to a permitted registered resource or restart deliberately for the intended local target.
- observable_success: Negative boundary scenarios disclose no out-of-scope content; valid same-target reading still works.
- required_evidence: Security boundary tests including origin, target, path and symlink cases, plus allowed-reading browser proof.

### Reproducible local use

- criterion_id: AC-010
- working_mode: repository inspection and complete journey
- source_state: Supported local developer environment and an explicitly selected repository.
- trigger_action: Follow documented startup, verification and shutdown steps.
- expected_effective_state: The local cockpit can be started and stopped reproducibly without host installation, cloud deployment or modification of selected control files.
- visible_feedback: Clear local startup address, selected target and readable startup/failure information.
- blocker_failure_behavior: Unsupported prerequisites, unavailable service or startup failures are explicit, with no silent public-network/alternate-target fallback.
- recovery_next_action: Resolve the documented local prerequisite or conflict and retry startup.
- observable_success: A repeatable documented run completes overview, detail and document reading with real repository data; measured time savings remain unclaimed.
- required_evidence: Reproduction record, real-data browser journey evidence and before/after byte comparison.

### Language and source fidelity

- criterion_id: AC-011
- working_mode: all three reading contexts
- source_state: German interface and documents in configured/original source languages.
- trigger_action: Inspect status, a blocker or a document.
- expected_effective_state: User-facing interface/next-action language is German; original document content and identifiers retain their source wording. Translation does not become a new governance authority.
- visible_feedback: Understandable German status and recovery language; source language/content remains identifiable.
- blocker_failure_behavior: Unavailable evaluation/document data is reported rather than translated into an invented permissive result.
- recovery_next_action: Retry/repair the source through the stated read-only paths.
- observable_success: Representative normal/error views are German and viewed source text matches its file bytes/content.
- required_evidence: Language/content fidelity checks and representative browser observations.

## 6. Non-Goals

No editing, run creation, approval submission, gate transitions, agent execution or VCS actions through the cockpit. No second database, duplicated governance rules or parallel workflow authority. No cloud hosting, remote repositories, shared multi-user operation, deployment, publication or release. No MCP App embedding, host-specific installation or inline binary document preview in the first version. No blanket migration/repair of existing runs. No claim of measured time savings before measurement.

## 7. Users And Roles

Arndt Gold is the product owner and deliberate gate approver. Repository maintainers and delivery reviewers are the initial readers. Existing AGDF Core owns control interpretation; the cockpit communicates its results and supporting documents. UX analysis is subordinate input, not product authority after PRD approval. Detailed module/component responsibilities belong to SD.

## 8. Constraints

One explicitly selected local repository per session. Preserve canonical file formats, control semantics, exact approval boundaries and registered source relationships. Bound reads and safe rendering are mandatory product behavior; SD chooses their mechanisms and resource limits. Keep the local UI separate from public documentation/site and host installation lifecycles. The existing independently authorized language/config fix is not included in this cockpit scope. Preserve its unrelated workspace changes.

## 9. Evidence Requirements

QA needs criterion-linked deterministic tests, Core evaluation parity, security/failure/concurrent-change proof and real browser observations of the three journeys. Show keyboard navigation, missing/invalid/unsupported states, visible retry and stale-to-refresh behavior. Capture selected target/run/version with each observation and compare the control tree before/after. Source/fixture checks alone do not prove the browser experience; passing QA/UAT does not itself prove lifecycle completion or measured benefit.

## 10. Risks And Open Questions

Snapshot integrity, repeated-read cost, resource limits, safe Markdown rendering and browser-origin mediation require explicit SD decisions. Test isolation and failure injection require TP decisions. Those choices may not weaken the behavior above. Existing invalid/historical runs may yield degraded inventory entries; the cockpit exposes them rather than repairing or hiding them. Reassess the earliest source if later feasibility requires changed product behavior. Time-saving measurement is future evidence and not a release prerequisite or acceptance claim in this local scope.

## Approval Decisions

All resolved product rows below express concrete choices in this draft for the current PRD decision; they do not claim prior separate user approval. The existing UR supports these bounded choices. No unanswered material product question is hidden as a technical deferral.

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Product and authority scope | before_prd | resolved | One selected local repository; overview, detail and document reading; purely read-only; human approval stays outside the cockpit, as the approved UR requires | Arndt Gold |
| Initial document coverage | before_prd | resolved | Draft choice: registered UTF-8 Markdown, JSON and text; unsupported binary resources show provenance and unsupported state; binary embedding remains outside this first version | Arndt Gold |
| Language and interface access | before_prd | resolved | Draft choice: German interface with original source-language documents; pointer and keyboard complete all three journeys | Arndt Gold |
| Acceptance and operational scope | before_prd | resolved | Local reproducible startup and real-data browser evidence; no hosting, release, host install or measured time-saving claim | Arndt Gold |
| Security and freshness mechanisms | later_sd | deferred | Design bounded target/origin/resource access, coherent data versions, safe rendering and explicit resource limits satisfying this PRD | Solution Design owner: Codex preparing for Arndt Gold |
| Test and evidence mapping | later_tp | deferred | Map every criterion and SD decision to tasks, scenarios and actual evidence including denied access, mutations and real browser journeys | Task Plan owner: Codex preparing for Arndt Gold |

## 11. Next Step

Review this draft and decide deliberately with `Approval: PRD`, request revision or decline. Only a valid recorded PRD approval allows Solution Design drafting. SD/TP/implementation, QA and release remain unavailable at this step.

## AGDF Approval Summary (de; source=en)

- Nutzerziel: Runs und ihre Evidenz mit weniger Suchen, Zuordnen und Vergleichen verstehen. Die gewünschte Zeitersparnis ist noch nicht gemessen.
- Umfang: Lokales React-Cockpit für ein bewusst ausgewähltes Repository mit Übersicht, Run-Detail und registrierten Dokumenten. Deutsche Oberfläche, Originalsprache der Quellen; Vorschau zunächst für UTF-8-Markdown, JSON und Text. Binärdateien zeigen Herkunft und eine Erklärung zur fehlenden Vorschau.
- AC-001: Aktive, abgeschlossene und ungültige Runs mit Identität, verfügbarem Ziel und kanonischen Statusfeldern anzeigen. Fehlende oder unvollständige Daten bleiben von einer tatsächlich leeren Liste unterscheidbar.
- AC-002: Run-Detail stimmt mit der Core-Auswertung desselben Datenstands überein. Freigaben, Blocker, fehlende Evidenz und nächste erlaubte Aktion sind nachvollziehbar; widersprüchlicher gespeicherter Text bleibt sichtbar getrennt. QA, UAT und Abschluss werden nicht gleichgesetzt.
- AC-003: Übersicht, Detail und Dokument lassen sich per Maus und Tastatur öffnen und verlassen. Ziel, Run-Auswahl und Fokus bleiben nachvollziehbar; entfernte Auswahlen führen mit Erklärung zur Übersicht zurück.
- AC-004: Registrierte erlaubte Markdown-, JSON- und Textdokumente sicher lesbar öffnen, ohne aktiven Inhalt auszuführen. Herkunft, Run und Datenversion sichtbar halten; fehlende, gesperrte und nicht unterstützte Dokumente eindeutig erklären.
- AC-005: Laden, echte Leere, Teilbestand, ungültige Daten, gesperrter Zugriff und Lesefehler unterscheiden. Jede betroffene Ansicht erklärt den Zustand auf Deutsch und nennt einen passenden nächsten Schritt; Fehler behaupten keinen Erfolg oder eine Freigabe.
- AC-006: Zusammengehörige Ansichten tragen einen konsistenten Datenstand. Änderungen und veraltete Inhalte sichtbar kennzeichnen; vor einer aktuellen Aussage neu laden. Fehlgeschlagenes Aktualisieren entfernt keine Warnung und mischt keine Runs oder Datenversionen.
- AC-007: Bei vorübergehenden Lese- oder Dienstfehlern sichtbares Wiederholen anbieten. Gültige Auswahl bleibt erhalten; danach erscheint ein frisches Ergebnis oder ein weiterhin erklärter Fehler, ohne Kontrollschreibzugriff.
- AC-008: Browsen, Dokumente öffnen, Zurückgehen, Aktualisieren und Wiederholen verändern keine Kontroll-, Freigabe- oder Präsentationsdatei. Keine Run-Erstellung, Bearbeitung, Freigabe, Gate-Wechsel, Agenten- oder Git-Aktion; keine zweite dauerhafte Datenquelle.
- AC-009: Zugriff auf die erlaubten Kontrollressourcen des ausgewählten Ziels begrenzen. Beliebige Dateien, Pfadtraversal, Symlink-Ausbruch, unerwünschte fremde Browser-Ursprünge und stiller Zielwechsel werden verhindert; Ablehnungen geben keine fremden Inhalte preis.
- AC-010: Lokalen Start, Prüfung und Stop reproduzierbar dokumentieren. Alle drei Nutzerwege mit echten Repository-Daten im Browser nachweisen und unveränderte Kontrolldateien belegen. Kein Cloud-Betrieb, keine Host-Installation und keine unbewiesene Zeitersparnis.
- AC-011: Status, Fehler und nächste Schritte auf Deutsch darstellen; Dokumente und Identitäten bleiben quellentreu. Fehlende Informationen werden nicht in erfundene erlaubende Aussagen übersetzt.
- Entscheidungen: Produktverantwortlicher ist Arndt Gold. Der Entwurf konkretisiert den freigegebenen rein lesenden Umfang, erste Dokumentformate, deutsche Oberfläche, Tastaturbedienung und lokale Abnahme. Technische Verfahren für Sicherheit, Datenkonsistenz und Ressourcenlimits gehören mit benannten Verantwortlichen ins SD; Aufgaben und Evidenzzuordnung ins TP.
- Abgrenzung und Risiken: Keine Bearbeitung, Freigaben, Cloud-Veröffentlichung, Remote-Repositories, Mehrnutzerbetrieb, MCP-App-Einbettung oder Binärvorschau. Historische/ungültige Runs werden sichtbar gemacht und nicht repariert. Die separate Sprachkorrektur gehört nicht zu diesem Cockpit-Run.
- Nächster Schritt: Diese PRD prüfen und gezielt entscheiden. Eine neue PRD-Freigabe erlaubt Solution Design; die Implementierung benötigt weiterhin SD-/TP-Freigaben und die vorgeschriebene Vorbereitung.
