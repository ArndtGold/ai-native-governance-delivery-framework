# PRD: Embedded AGDF Cockpit for Codex

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-05
Owner: Arndt Gold
Run: agdf-cockpit-mcp-app-20261005-01
Traceability contract: criteria-chain-v1

## 1. Product Scope

Extend the existing local AGDF cockpit and MCP integration so the user can open an embedded application in Codex, select a run, inspect a registered artefact and explicitly related Context Graph entries, and deliberately use that checked selection for a contextual question. Reuse canonical reads and existing React views; retain the existing browser workflow and dispatch/inspection semantics.

The compact entry is an introduction and launch point with at most two primary actions. Detailed exploration belongs in a supported larger host surface. Exact display modes are capability-dependent; no fixed Codex chat width or ChatGPT-only extension is assumed. The interface remains German and documents retain their configured source language, consistent with the existing cockpit.

Scope is this local Codex project workflow. Local setup and its cleanup must be bounded and documented. Successful protocol or browser tests do not substitute for observed embedded operation in Codex. Public distribution, release and Git actions remain excluded.

## 2. UX Intent And Success

- ui_ux_impact: high
- ux_intent_definition: ready; .agdf/control/artefacts/agdf-cockpit-mcp-app-20261005-01/UX_INTENT_DEFINITION.md
- primary_user_intent: Understand a delivery run from identifiable maintained sources and ask Codex a question without manual source copying and assignment.
- success_signal: One actual Codex journey completes open, select, inspect and contextual question, showing matching run/source provenance and honest freshness and capability limits.
- primary_decision_or_action: Deliberately use the inspected selection in the existing Codex conversation. Selection, source transfer and message delivery are separate from approval and delivery authority.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Compact entry | Explicitly opened project cockpit; no implicit delivery run | loading, ready, unsupported, failed | Canonical project identity and actual host capabilities | Compact app entry and clear launch/limitation text |
| Run exploration | Selected run plus observed canonical revision/evaluation | available, partial, invalid, missing, stale | Canonical run and Core evaluators | Cockpit run view |
| Source inspection | Selected registered artefact and explicit maintained graph references | available, empty references, unresolved, unsupported, missing, stale | Canonical registrations, run context_graph_refs and Context Graph | Cockpit document/context view |
| Contextual question | Explicit selection checked again for chat use | preparing, ready, delivered, rejected, uncertain | Canonical sources for content/freshness; host acknowledgement for transport only | Cockpit handoff feedback and Codex conversation |
| Browser fallback | Existing local read session; embedded journey unavailable | available fallback, embedded limitation | Existing Core/browser read contract | Existing browser cockpit |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Explicitly open this project's cockpit, choose a run and sources, then request contextual use. No automatic delivery-run assignment from selection, cwd or recency. Closing the app ends its temporary view session; reopening does not silently restore a prior run from durable browser state.
- blockers_and_visible_next_actions: Missing/invalid control requires external correction and reload. Empty graph references are an honest empty state; unresolved references remain identified. Changed/unreadable sources prohibit unvalidated transfer. Oversized selection requires a smaller selection. Unsupported host capability exposes the precise unavailable step and the existing browser path.
- recovery_paths: Deliberate reload/retry preserves orientation and compatible selection but revalidates all content. A removed run returns to overview with an explanation. Retry a safely failed context preparation step; uncertain question delivery requires an explicit user decision and never automatic duplicate submission. The fallback is useful for reading and is not embedded completion.
- relevant_state_transitions: Open/loading/current; selection/loading/new current view; source change/current/stale; deliberate question/preparing/checked/acknowledged or rejected; run/source switch/pending/cancelled or discarded/new selection; capability unavailable/limitation/fallback. Retained old content is labelled previous. Historical chat messages cannot be erased by the app and must not be represented as current validated context.

## 5. Acceptance Criteria

### Embedded entry and usable exploration

- criterion_id: AC-001
- working_mode: Compact entry and run exploration
- source_state: App not opened; explicit local project is available.
- action: Open the cockpit and choose its exploration action.
- expected_effective_state: Embedded application loads in a supported Codex surface with project identity and temporary view state.
- visible_feedback: Compact entry has at most two primary actions; detailed views have readable content, keyboard focus/back navigation and usable supported sizes.
- blocker_failure_behavior: Unsupported presentation or failed load is explicitly named; no fixed-width assumption or successful empty dashboard conceals failure.
- recovery_next_action: Visible retry when recoverable, or documented existing browser fallback.
- observable_success: User enters the embedded run exploration without manual copy/paste; responsive and keyboard navigation remain usable.
- required_evidence: Actual Codex entry/exploration observation plus supported-size and focus evidence; browser evidence separately labelled.

### Canonical run understanding

- criterion_id: AC-002
- working_mode: Run exploration
- source_state: Current or partial canonical inventory.
- action: Select a listed run.
- expected_effective_state: Selected project/run/revision, objective, evaluated status, next allowed action and registered evidence are coherent with Core reads.
- visible_feedback: Source identity and observation time are visible; persisted statements, lifecycle and recorded approvals remain distinct from evaluation and UI selection.
- blocker_failure_behavior: Invalid, removed or unavailable run is explicit; a partial inventory cannot appear complete.
- recovery_next_action: Reload/retry or select another available run; removal returns to overview.
- observable_success: Displayed fields match the selected canonical sources; selecting does not authorize work or choose a delivery run for an agent action.
- required_evidence: Canonical parity fixtures and actual selected-run observation, including invalid/removal cases.

### Registered artefact reading

- criterion_id: AC-003
- working_mode: Source inspection
- source_state: Selected current run with registered resources.
- action: Open a registered artefact.
- expected_effective_state: Content belongs to that run and observed source version and retains its source language.
- visible_feedback: Registration, source location, content identity and availability are clear; document rendering is passive and readable.
- blocker_failure_behavior: Missing, outside-boundary, unsupported, invalid-text and oversized previews retain identifiable unavailable states; no arbitrary file browsing.
- recovery_next_action: Return to the run, choose an available source or reload after correction outside the app.
- observable_success: User reads the intended source and navigates back without silently displaying another run's document.
- required_evidence: Document parity, passive rendering and denied/missing/oversized cases plus visible journey.

### Maintained Context Graph relevance

- criterion_id: AC-004
- working_mode: Source inspection
- source_state: Selected run with empty or explicit context_graph_refs.
- action: Examine its related context and choose an available entry.
- expected_effective_state: Only explicitly referenced maintained graph entries are related; source/node identity and associated maintained text are accessible within the existing read boundary.
- visible_feedback: Show the reference and maintained source, or clearly state no references/unresolved reference; no completeness claim or inferred relevance.
- blocker_failure_behavior: Missing node/file, malformed or denied reference is explicit and never replaced with invented context.
- recovery_next_action: Continue with available artefact evidence, disclose excluded unresolved references or refresh after external correction.
- observable_success: User can distinguish maintained related knowledge, absent references and unavailable evidence.
- required_evidence: Real maintained-node example, empty/missing/malformed/denied reference fixtures and visible inspection.

### Checked and bounded context selection

- criterion_id: AC-005
- working_mode: Contextual question
- source_state: Run with a currently inspected available source and optional explicit graph entries.
- action: Deliberately prepare the visible selection for Codex.
- expected_effective_state: Sources are checked again against the project/run/revision and content identities before handoff; selected content is bounded and its inclusion is disclosed.
- visible_feedback: User sees included source identities and excluded/unavailable references; preparation is visibly pending until checked.
- blocker_failure_behavior: Changed, missing, denied or oversized content cannot silently pass as complete/current; no silent truncation.
- recovery_next_action: Refresh/reselect, exclude an identified unavailable reference deliberately, or choose a smaller selection.
- observable_success: The prepared selection matches visible checked evidence and has sufficient provenance for later revalidation.
- required_evidence: Source mutation between reading and preparation, capacity boundaries and inspected-to-prepared parity.

### Deliberate question in the existing conversation

- criterion_id: AC-006
- working_mode: Contextual question
- source_state: Checked selection and supported host context/question capabilities.
- action: Use the selection for a contextual question in Codex.
- expected_effective_state: The conversation receives that selection with project/run/revision, source locations/content identities and observation provenance, followed by the deliberate question when supported.
- visible_feedback: Distinguish context prepared, transport acknowledged and question delivered; the conversation identifies its sources and any limitations. Custom questions use the existing Codex composer; no duplicate general chat composer is required inside the cockpit.
- blocker_failure_behavior: Context or question failure/unsupported capability is explicit; context transfer alone is not reported as a delivered question or approval.
- recovery_next_action: Retry a safely failed preparation step; for uncertain question delivery require a deliberate resend decision.
- observable_success: An actual Codex contextual question uses the selected evidence without manual copying and does not silently include unrelated sources.
- required_evidence: Host acknowledgement/visible question and identifiable model-facing content in an actual Codex session; mocks separately labelled.

### Selection races, stale data and supersession

- criterion_id: AC-007
- working_mode: Run exploration, source inspection and contextual question
- source_state: Current or retained previous view, including a pending read/transfer.
- action: Change run/source, reload, close the app or observe a concurrent source change.
- expected_effective_state: Obsolete responses cannot replace current selection; published selection is superseded/invalidated before a new handoff, and currentness is explicit.
- visible_feedback: Stale/previous content is labelled; a failed invalidation is an explicit limitation that blocks a misleading new handoff. Historical chat remains historical, not erased.
- blocker_failure_behavior: Late cross-run results and stale unvalidated transfers are rejected/discarded; no automatic reuse of previous context as current evidence.
- recovery_next_action: Deliberate refresh and reselection; later agent actions independently revalidate target/run/revision and source identity.
- observable_success: Switching A to B during pending work cannot make A current or silently bind B's question to A.
- required_evidence: Delayed-response, run/source switch, mutation, refresh and deactivation scenarios plus visible stale feedback.

### Honest capability and failure recovery

- criterion_id: AC-008
- working_mode: All modes and browser fallback
- source_state: Supported, partially supported, disconnected or failed host/read session.
- action: Attempt the affected journey step and its permitted recovery.
- expected_effective_state: Only actually supported operations are offered; fallback preserves reading while embedded completion remains unverified/unavailable.
- visible_feedback: Specific limitation and safe next action are visible, with retry for recoverable failures; previous data is labelled when retained.
- blocker_failure_behavior: Missing context/message/presentation capability, timeout, removal and interrupted sessions cannot be disguised as success or cause invisible question retries.
- recovery_next_action: Retry, refresh/reselect, or use the documented existing browser path as appropriate.
- observable_success: User can recover or understand precisely why the first journey cannot complete.
- required_evidence: Capability-negative and connection/read failure scenarios, plus observed Codex capability record.

### Preserved read and human-authority boundaries

- criterion_id: AC-009
- working_mode: All app modes
- source_state: Canonical project content and deliberate app selections.
- action: Read, inspect, prepare context or submit a contextual question, including hostile source text and manipulated selectors.
- expected_effective_state: Canonical control remains unchanged; sources are data, and approval/implementation authority remains with existing validators and deliberate bound workflow.
- visible_feedback: Read-only role is clear; selection, transport outcome, stored approval and authorization are distinct.
- blocker_failure_behavior: Out-of-bound references/selectors are denied; no approval writer, dispatch mutation, arbitrary file/network execution or source-as-instruction capability is introduced by the app.
- recovery_next_action: Correct selection/read input or use existing independent delivery routing for an actual later action.
- observable_success: Before/after control observations show no app mutation; later delivery requests require fresh existing binding/approval checks.
- required_evidence: No-write observation window, selector/containment/hostile-text cases and existing approval-binding regression evidence; no universal agent-enforcement claim.

### Local integration, compatibility and evidence qualification

- criterion_id: AC-010
- working_mode: Local setup, embedded operation and existing browser/tool workflows
- source_state: Existing React/Core/MCP implementation with version-matched runtime and local setup.
- action: Prepare the scoped local integration, exercise the journey and restore/clean up that integration.
- expected_effective_state: Existing MCP dispatch/inspection and browser behavior remain compatible; bounded local activation and rollback are documented without public distribution or broad runtime repair.
- visible_feedback: Setup/capability prerequisites and verification class are explicit; actual-host gaps remain open evidence obligations.
- blocker_failure_behavior: Provenance/build/registration mismatch or unavailable host proof prevents a complete embedded acceptance claim.
- recovery_next_action: Fix the scoped integration through its owner or report the precise limitation; do not widen installation or claim browser success as host proof.
- observable_success: The first journey has real Codex evidence and required regressions pass; the integration is locally reproducible and removable.
- required_evidence: Build/protocol/bridge/contained-read tests, affected existing regressions, exact local host tuple and clean setup/cleanup record. No commit, publication or release is performed.

## 6. Non-Goals

No new approval writer, approval by click/selection, automatic delivery continuation, modified gate policy or execution-control system. No graph editor, inferred graph, separate knowledge/control store or comprehensive automated requirements-versus-code verdict. No remote/multi-user service, public package/plugin distribution, publication, release, Git commit or push. Related run approvals do not transfer. Other hosts are unqualified unless separately evidenced.

## 7. Users And Roles

Arndt Gold is the product owner and deliberate human gate decision-maker for the local Codex workflow. Codex assists with source-grounded questions and scoped work only through existing checks. Core/canonical control owns effective delivery state; UI presentation and host transport acknowledgements never become product or approval authority.

## 8. Constraints

Preserve `.agdf/control/` as the canonical source, the existing bounded passive read boundary, version/provenance qualification and existing Core ownership. Views and selections remain temporary; no durable browser copy of control state. Explicit maintained graph relationships are authoritative for relevance. Every later delivery action requires its own current canonical evaluation; a context packet is evidence, not permission. Preserve German cockpit copy/source-language documents and accessibility. SD chooses concrete APIs, resource format, source capacity, session lifetime and build/integration structure.

## 9. Evidence Requirements

Maintain criteria-chain-v1 mappings downstream. Separate source/build, protocol/bridge fixture, browser and actual Codex host lanes. TP must put host feasibility early so unsupported capabilities are discovered before extensive UI work. Required proof includes source/context parity, graph edge cases, boundaries, stale/race cases, safe retry, no-write observations and affected regressions. QA cannot pass the embedded journey using only a simulated bridge. A time-saving benefit is a product aim; no numeric speedup is promised without measurement.

## 10. Risks And Open Questions

Live host behavior may differ from shared protocol guidance; capabilities and display modes can vary. Context acknowledgements and message delivery are distinct and can fail independently. Historical chat context cannot be erased. Source checks establish an observation, not a lock against future changes. Source content can contain adversarial instructions; retain the data/authority distinction without claiming universal model compliance. Exact resource/bridge, bounded capacities, packaging and activation decisions remain SD-owned. Existing graph reconciliation is still an implementation/closeout obligation, not already completed knowledge.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| First product journey and audience | before_prd | resolved | Existing cockpit embedded in the local Codex workflow; open/select/inspect/question with explicit maintained graph relevance, derived from approved UR | Arndt Gold, PRD Owner |
| Contextual interaction | before_prd | resolved | Deliberate checked-selection action; supported contextual question uses existing Codex conversation/composer; visible preparation and delivery outcomes, no duplicate general chat composer | Arndt Gold, PRD Owner |
| Missing/oversized context and changing selection | before_prd | resolved | Explain excluded/unavailable content, reject silent truncation/stale transfer, require refresh/smaller selection; supersede old current context and preserve historical chat as historical | Arndt Gold, PRD Owner |
| Acceptance and distribution boundary | before_prd | resolved | Real Codex journey required; browser fallback is useful but not embedded completion; local bounded setup only, no publication, release or Git action | Arndt Gold, PRD Owner |
| Resource/bridge, source bounds and ephemeral lifetime | later_sd | open | Choose compatible contracts and capacity limits preserving approved behavior and existing read/runtime boundaries | SD author through sd-definition |
| Bundling, local registration and cleanup | later_sd | open | Select explicit version-matched, reversible local integration; no installation widening | SD author through sd-definition |
| Host feasibility sequence and concrete scenarios | later_tp | open | Put host capability proof early and map all criteria/SD decisions to executable evidence | TP author through gate-check |

Resolved rows express the proposed product decisions derived from approved scope; this draft has not been approved. No extra human confirmation is inferred.

## 11. Next Step

Review the current PRD and approve only with `Approval: PRD`. Valid approval permits Solution Design authoring; implementation still requires its applicable later prerequisites.

## AGDF Approval Summary (de; source=en)

- Nutzerziel: Einen Run anhand nachvollziehbarer Quellen verstehen und mit geprüftem Kontext eine Frage an Codex stellen, ohne Dokumente manuell zu suchen und zu kopieren.
- Umfang: Vorhandenes React-Cockpit, Core-Lesedienste und MCP-Server für den lokalen Codex-Workflow erweitern. Kompakter Einstieg, größere unterstützte Ansicht, Run/Artefakt/ausdrückliche Context-Graph-Verweise und bewusste Kontextübergabe. Deutsche Oberfläche; Dokumente behalten ihre Quellsprache.
- AC-001: Eingebetteter Einstieg in einer tatsächlichen Codex-Sitzung; höchstens zwei Hauptaktionen im kompakten Einstieg, lesbare größere Ansichten und funktionierende Tastatur-/Zurück-Navigation. Ladefehler und fehlende Darstellungsfähigkeit zeigen Wiederholen oder Browser-Fallback.
- AC-002: Run, Revision, Ziel, ausgewerteter Status und nächste erlaubte Aktion stimmen mit Core überein. Persistierte Aussagen und Freigaben bleiben erkennbar getrennt; ungültige, entfernte oder teilweise verfügbare Runs werden erklärt.
- AC-003: Registrierte Artefakte sind passiv lesbar, mit Quelle und Inhaltsidentität. Fehlende, verbotene, ungeeignete oder zu große Dokumente erhalten einen nachvollziehbaren Nicht-verfügbar-Zustand und einen nächsten Schritt.
- AC-004: Nur ausdrücklich gepflegte Context-Graph-Verweise gelten als zugeordnet. Einträge und Quellen sind einsehbar; leere oder defekte Verweise werden benannt und niemals durch erfundene Beziehungen ergänzt.
- AC-005: Vor der Übergabe werden Run/Revision und ausgewählte Quellen erneut geprüft. Enthaltene und ausgeschlossene Quellen sind sichtbar; veralteter, fehlender oder zu großer Inhalt wird nicht still als vollständig übertragen. Wiederherstellung durch Aktualisieren oder kleinere Auswahl.
- AC-006: Die bewusste Frage erreicht bei unterstützten Host-Fähigkeiten den vorhandenen Codex-Chat mit nachvollziehbarem Kontext. Vorbereitung, Transportbestätigung und zugestellte Frage bleiben getrennt. Eigene Fragen verwenden den vorhandenen Composer; bei unklarer Zustellung keine automatische doppelte Frage.
- AC-007: Run-/Quellenwechsel, parallele Änderungen, Neuladen und Schließen verhindern, dass verspätete Ergebnisse wieder aktuell werden. Alter Kontext wird erkennbar ersetzt oder ungültig; frühere Chatnachrichten bleiben historisch. Spätere Aktionen benötigen eigene frische Prüfung.
- AC-008: Fehlende Host-Fähigkeiten und Lese-/Verbindungsfehler zeigen die konkrete Grenze sowie sicheren nächsten Schritt. Wiederholen und Browser-Fallback helfen, gelten aber nicht als erfolgreiche eingebettete Abnahme.
- AC-009: Lesen, Kontextauswahl und Fragen verändern keine Kontrolldateien und geben nichts frei. Quellen bleiben Daten; manipulierte Verweise werden abgewiesen. Vorher-/Nachher-Beobachtung und vorhandene Freigabeprüfungen belegen die Grenze.
- AC-010: Lokale Einrichtung und Rücknahme sind begrenzt und nachvollziehbar. Bestehende MCP- und Browser-Funktionen bestehen ihre betroffenen Regressionen. Build-, Protokoll-, Browser- und echte Codex-Nachweise bleiben getrennt; fehlender Host-Nachweis verhindert vollständige Abnahme.
- Entscheidungen: Der erste Weg, die lokale Zielgruppe, bewusste Kontextnutzung, Behandlung fehlender/veralteter Quellen und echte Codex-Abnahme sind im Entwurf festgelegt. SD entscheidet konkrete Bridge, Ressourcen, Grenzen und Einrichtung; TP plant die frühe Host-Prüfung und Szenarien. Diese offenen Punkte haben benannte Owner und ersetzen keine Produktentscheidung.
- Nicht enthalten: Neue Freigabeschreiber, Freigabe durch Klick, automatische Umsetzung, Graph-Editor, automatische umfassende Soll-Ist-Bewertung, öffentliche Verteilung, Release oder Git-Aktionen. Zuständigkeiten und frühere Freigaben werden nicht verändert oder übertragen.
- Risiken und nächster Schritt: Tatsächliche Host-Fähigkeiten und Kontext-/Nachrichtentransport müssen live geprüft werden; Browser-Erfolg reicht nicht. Die UX-Eingabe ist nun bereit und registriert. Nach `Approval: PRD` folgt Solution Design, anschließend die erforderliche Planung vor Umsetzung.
