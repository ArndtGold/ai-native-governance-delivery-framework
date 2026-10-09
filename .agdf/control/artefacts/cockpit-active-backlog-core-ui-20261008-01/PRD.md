# PRD: Readable active-backlog selection through shared Core reading

Status: draft
Gate: PRD
Gate approval: open
Based on: approved UR.md; BROWNFIELD_REVIEW.md; ready UX_INTENT_DEFINITION.md
Date: 2026-10-08
Owner: Arndt Gold
Drafted by: Codex
Run: cockpit-active-backlog-core-ui-20261008-01
Traceability contract: criteria-chain-v1

## 1. Product Scope

Deliver one bounded improvement to the existing read-only cockpit: a readable active-work entry point and consistent list behavior in the compact MCP card and the expanded/browser overview.

The compact overview initially displays only the Master Backlog's Active Backlog section, in reverse stored table order. It previews up to five matches and provides a counted route to the full overview. Search applies to the complete readable selected section before that presentation limit. Planned and Archive remain available in the expanded overview.

Both surfaces use one Core-owned list-reading policy for membership, order, identity/selectability, title provenance, search and completeness. The UI handles controls and presentation. Exact functions, DTOs and module boundaries belong to SD; a second backlog store or independent UI list policy is excluded.

The stable primary list title is the stored backlog work-item title. A recognized leading framework-maintenance/external-delivery scope marker may be omitted for display; the original remains inspectable. Search uses the original stored work-item title, key and stored status. It does not search document contents or opportunistically loaded UR headings. Any observed UR heading remains supplementary source information rather than silently replacing the title/search corpus. This deliberate draft choice prevents scroll-dependent search and avoids reading every linked document for a list query.

“Active” means section membership. A stored Completed status in Active Backlog remains visible there. List data is stored pointer information; current control state comes only from the explicitly selected run's existing read/evaluation path. Selecting, expanding or searching never approves a gate or starts work.

## 2. UX Intent And Success

- ui_ux_impact: medium
- ux_intent_definition: ready, UX_INTENT_DEFINITION.md; subordinate input to this draft
- primary_user_intent: Find a current undertaking, recognize its stored state and deliberately open its actual run with little searching and decoding.
- success_signal: Initial active membership and reverse table order are clear; search is stable and explicitly scoped; long titles stay readable; the chosen identity opens exactly or produces an explicit failure.
- primary_decision_or_action: Open a named undertaking for inspection, or expand to see all matches and other backlog areas. Human gate decisions remain in the existing conversation flow.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Compact overview | Observed active section, temporary query and first five ordered matches | loading, complete, partial, empty, no-match, subset, unavailable | Master Backlog for stored data; existing Core read for observation/completeness | Compact cockpit list and its area/search/count feedback |
| Expanded/browser overview | Explicit area, temporary query and all readable ordered matches | complete, partial, empty, no-match, unavailable | Same source and shared Core policy | Expanded overview with area controls and sources |
| Selected-run inspection | Exactly requested run and its confirmed control/resource observation | loading, current, invalid/missing, blocked | Canonical run state, registered artefacts and existing Core evaluation | Existing run/document views |
| Read recovery | Current state unconfirmed; prior observation is prior data only | stale, refresh failed, expired session, retry loading | Existing source/snapshot/session validation | Existing read feedback on the affected surface |

Presentation ownership in this table describes who communicates state, not a new technical or authorization owner. The selected area/query and disclosure state remain temporary; no browser persistence or URL-based draft state is introduced.

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Opening the overall cockpit starts at the compact active overview; opening an explicitly named run retains direct-run behavior. A title action opens its exact run. The full-overview action retains the current active query. Changing expanded areas clears the previous area's query, as today. Closing/reopening uses existing session behavior.
- blockers_and_visible_next_actions: Invalid/duplicate identities are disabled with an explanation. An unreadable area offers diagnostics and deliberate reload, not a zero count. Stale/failed-refresh data remains visibly previous and cannot validate selection. Missing runs identify the requested run and offer return/reload; no replacement is auto-selected. Expired sessions explain reopening. Unsupported expansion exposes a limitation and the existing fallback.
- recovery_paths: Clear/change search, choose a readable area, inspect source details, retry transient failures, deliberately reload changed sources, return from a missing run or reopen an expired session. Retry is visible when the existing read path identifies a recoverable failure. Prior data is never relabeled current during retry.
- relevant_state_transitions:
  - Open -> loading -> observed active list or explicit retryable failure; first row remains unselected.
  - Type/clear query -> filtered/unfiltered results in unchanged reverse order; count and coverage update without reading documents to redefine the corpus.
  - Expand -> same active query and all matches; change area -> new area with empty query.
  - Open row -> exact run loading -> current detail or requested-run failure; return -> prior area/query and focus if the source row remains.
  - Source change -> stale previous data -> deliberate reload -> new observation; removed rows are not replaced by a nearby identity.
  - Failed refresh -> previous data plus retry -> successful fresh observation or continued explicit failure.

## 5. Acceptance Criteria

### Initial active membership and ordering

- criterion_id: AC-001; The compact overview starts with Active Backlog only, in reverse stored table order.
- working_mode: compact and expanded overview
- source_state: a readable backlog containing active, planned and archived rows, including a Completed row under Active Backlog
- trigger_action: Open the overview; choose each area in the expanded view.
- expected_effective_state: Membership follows the chosen source section; last table row leads; priority, timestamps and stored status do not change this order or move rows.
- visible_feedback: The compact surface names the active area and its section total; expanded controls name each area and its total. The Completed row retains an explicitly stored status.
- blocker_failure_behavior: An unreadable section cannot be represented as empty or fully counted.
- recovery_next_action: Inspect diagnostics or reload; other readable areas remain usable.
- observable_success: Fixture identities/counts and order match the source sections, with no planned/archive row in the initial compact preview.
- required_evidence: Core section/order fixtures and rendered compact/expanded assertions.

### Shared list-reading authority

- criterion_id: AC-002; Both surfaces consume one Core-owned list policy and agree before applying the compact display limit.
- working_mode: compact and expanded/browser overview
- source_state: identical source observation, area and query
- trigger_action: Request/render the list on either surface.
- expected_effective_state: Membership, ordered matches, identity/selectability, title source, counts and completeness agree. UI interaction does not independently redefine these rules.
- visible_feedback: Corresponding rows and query totals agree; the compact subset is explicitly distinguished from all matches.
- blocker_failure_behavior: Invalid/missing shared read data produces the existing explicit read failure rather than local speculative reconstruction.
- recovery_next_action: Retry/reload through the existing read path.
- observable_success: Core and adapter parity checks establish the same ordered identities and metadata; review finds no competing renderer policy.
- required_evidence: Core behavior tests, browser/MCP adapter checks and structural review of actual consumers.

### Stable titles and deterministic search

- criterion_id: AC-003; Search is complete for the declared readable backlog fields and independent of incidental UR-title loading.
- working_mode: compact and expanded/browser overview
- source_state: unchanged source observation with differing stored titles and linked UR headings
- trigger_action: Enter a query, scroll, load supplementary metadata, open/return, or repeat the same query.
- expected_effective_state: Search is a case-insensitive substring match over original stored work-item title, key and stored status within the selected area, with surrounding query whitespace ignored. Empty/whitespace query returns the area. The stable displayed title uses the stored work item with only the recognized scope prefix omitted. UR headings/document bodies do not enter this search or replace the primary list title.
- visible_feedback: Search scope is explained as backlog title, key and stored status; supplementary observed headings are identified as source details. Filtering preserves reverse source order.
- blocker_failure_behavior: Partial source coverage never claims an exhaustive no-match. A missing linked UR does not make stored-field search incomplete or trigger unbounded reads.
- recovery_next_action: Change/clear the query or reload an incomplete source; inspect/open a source separately when needed.
- observable_success: Identical queries on unchanged bytes yield identical identities before and after scroll/title observation/navigation; a query matching only a UR heading remains outside the declared corpus.
- required_evidence: Core search fixtures, component regression and rendered before/after title-load scenario.

### Compact preview and complete overview

- criterion_id: AC-004; The compact list shows at most five ordered matches with a clear route to all matches.
- working_mode: compact and expanded overview
- source_state: more than five active entries or query matches
- trigger_action: Open, search and expand the overview.
- expected_effective_state: Filtering covers the entire readable active area before taking five. Expanded overview retains that active query and exposes all matching rows. Planned/Archive are available there. Search remains available for a readable list even when only a few matches remain.
- visible_feedback: Area total, match total and displayed subset are distinguished, such as five shown of twelve matches. The full-overview action remains visible when the preview is truncated and is also available for other areas.
- blocker_failure_behavior: Lack of host expansion is stated; no unsupported transition is presented as completed.
- recovery_next_action: Use the existing supported browser/overview fallback, or refine the compact query to reach the intended row.
- observable_success: A match outside the first five unfiltered rows becomes reachable by search; expansion preserves query/order and exposes all matches.
- required_evidence: Rendered six-plus-row fixture, expansion state/focus tests and actual compact Codex observation.

### Readable and accessible rows

- criterion_id: AC-005; Titles are primary, stored statuses secondary, and original identity/source data remain inspectable without an overflowing native dropdown.
- working_mode: compact and expanded/browser overview
- source_state: long stored titles, long keys, multiple statuses and source links
- trigger_action: Read the list, navigate by keyboard and disclose source data.
- expected_effective_state: Titles wrap within the surface without horizontal list overflow or title truncation; no selection popup escapes the card. Technical keys, scope/priority, original title, stored next step and available provenance are accessible through deliberate disclosure. A next step shown in a summary has its complete text available without hidden decision-critical suffixes.
- visible_feedback: The title action, explicit stored-status wording and disclosure labels are understandable; interactive targets have at least the existing 44px target height and visible focus.
- blocker_failure_behavior: A nonselectable row is explained and remains inspectable; layout constraints do not conceal why an action is unavailable.
- recovery_next_action: Inspect details or use the expanded view; keyboard users can return to the originating control.
- observable_success: Long-title/key fixtures remain readable at existing browser checks of 320, 560, 800 and 1280px widths in light/dark, plus the actual compact host width observed during verification.
- required_evidence: Rendered captures, overflow/target/focus assertions and fresh compact-host inspection. The browser widths are test conditions, not a claim that the native host has fixed dimensions.

### Truthful counts and read states

- criterion_id: AC-006; Empty, no-match, partial, unavailable, stale, failed-refresh and expired states remain distinct.
- working_mode: both overview surfaces and read recovery
- source_state: readable empty section, query no-match, malformed rows/sections, changed sources, transient read failure or expired session
- trigger_action: Open/search, detect change, reload, retry or reopen.
- expected_effective_state: Complete observations may state an exact total/no-match. Partial observations state readable counts/results with limited coverage; unavailable areas have no numeric zero substitute. Previous data is labeled previous, and expired selectors are not reused.
- visible_feedback: A concise state explanation, scoped count/coverage and one relevant next action appear; prior readable content may remain visibly unconfirmed.
- blocker_failure_behavior: Stale or failed-refresh views do not allow new selection based on unconfirmed state. An unrelated section diagnostic does not incorrectly disable a confirmed readable area.
- recovery_next_action: Clear query, inspect diagnostics, retry/reload or reopen as appropriate.
- observable_success: Every fixture state has distinct feedback; successful recovery restores current selection without silently changing the target.
- required_evidence: Core diagnostic fixtures, component/service failure tests and rendered stale/retry/expiry journeys.

### Exact deliberate selection and return

- criterion_id: AC-007; Filtering, sorting, title observation and concurrent reads cannot open a different run or infer an approval.
- working_mode: both overviews and selected-run inspection
- source_state: valid rows, duplicate/invalid keys, missing run, changed source, or a title read in flight
- trigger_action: Activate a row, navigate back, refresh or expand.
- expected_effective_state: Only deliberate activation of an unambiguous row requests its own run identity. Current run validation remains authoritative. Explicitly named initial runs still open directly. Return preserves the applicable area/query and restores focus to the row when it still exists; otherwise use the list heading with a removal explanation.
- visible_feedback: Loading and exact selected/requested identity are clear; missing/invalid run is explicit. Backlog status is not substituted for evaluated current state.
- blocker_failure_behavior: Invalid/duplicate keys are disabled; source/session/race failures do not select a neighbor or silently reuse a retired selector.
- recovery_next_action: Return to the list, reload changed data or inspect diagnostics, then deliberately choose again.
- observable_success: Exact requested IDs and focus/state are retained across filtering, title-read navigation, missing-run and removal scenarios; no first-row auto-selection occurs.
- required_evidence: Core/session tests, pending-title navigation regression, rendered keyboard/return tests and adapter-request evidence.

### Read-only scope and evidence boundary

- criterion_id: AC-008; List inspection preserves existing control/session boundaries and is qualified in the actual compact Codex surface.
- working_mode: all modes
- source_state: existing bound local project and current build
- trigger_action: Search, disclose, select, expand, read and recover through the scoped journey.
- expected_effective_state: No canonical control bytes are written and no model question, gate approval or AI work is triggered by these list actions. Existing browser/MCP reads, document/context behavior and limits remain effective. Support claims stay within observed hosts.
- visible_feedback: Read-only role and human decision authority remain clear; unavailable capabilities are explicit.
- blocker_failure_behavior: A failed native observation remains an open evidence obligation, never replaced by browser-only success.
- recovery_next_action: Fix the bounded defect or record the exact remaining host limitation and complete the required observation before claiming acceptance.
- observable_success: Relevant regression checks pass; a fresh native compact Codex journey demonstrates the intended selection; measured app-only control files remain byte-identical.
- required_evidence: Source/adapter checks, rendered browser/component evidence, actual native observation with build identity, and control-byte comparison. This is evidence for this increment, not a new release or cross-host claim.

## 6. Non-Goals

No second Core subsystem/store, status reclassification, backlog cleanup, run creation, UI writer, approval by click, automatic continuation or transfer of approvals. No full-text/document/UR-heading search in this slice. No new host integration, remote service, public protocol, release, publication, Git commit/push, broad dashboard redesign, analytics or graph features.

## 7. Users And Roles

Arndt Gold is the product owner and deliberate gate decision maker. Codex drafts and, after the required later approvals, executes the scoped AI work. The cockpit user reads and chooses sources; neither UI selection nor an analytical skill becomes a second product or governance authority.

## 8. Constraints

Preserve the approved UR, read-only project boundary, canonical source ownership, existing operation schemas, snapshot/session checks and bounded resource limits. Extend existing Core read owners; coordinate private UI consumers locally. No persistent data migration or independent consumer rollout is planned. If design reveals a public-contract, authority or rollout change, return to Brownfield/Mode-Slice reassessment rather than silently broadening this slice. Preserve unrelated concurrent work.

## 9. Evidence Requirements

SD maps each criterion once to design/source owner and decisions. TP maps every criterion and SD decision to executable scenarios and expected results. Relevant Core, HTTP/MCP, UI and pending-title-navigation regressions remain protected. Changed old cache-dependent search expectations must be identified as deliberate product changes. QA distinguishes automated/source/protocol, rendered browser and fresh actual native evidence; no new implementation evidence exists at PRD drafting time. Documentation states the final supported search corpus, preview limit, provenance and evidence boundaries.

## 10. Risks And Open Questions

Stored backlog titles can be longer and differ from UR headings; the deliberate stable title/search choice trades richer opportunistic labels for predictable selection. Wrapping and disclosure must keep those titles usable. Partial source diagnostics need area-specific treatment. Existing opaque selectors are observation-bound and must not be treated as durable identity. Exact Core function/DTO structure, browser-safe reuse, cancellation/refresh coordination and supplementary title-read retention belong to SD. Test fixtures and native observation mechanics belong to TP. These technical/planning questions do not defer product scope or acceptance.

## Approval Decisions

All resolved rows below are concrete draft product choices for this PRD decision; they are not claims that a human has already approved this PRD.

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Initial area and order | before_prd | resolved | Active Backlog only, reverse stored table order; Planned/Archive in expanded overview; as requested and approved in UR. | Arndt Gold |
| Stable title and search corpus | before_prd | resolved | Draft choice: stored backlog work-item title is primary; search original work-item title, key and stored status; supplementary UR headings do not alter either. | Arndt Gold |
| Compact result bound and expansion | before_prd | resolved | Draft choice: first five matches after filtering the entire active section; explicitly count subset and retain active query when expanding to all matches. | Arndt Gold |
| Acceptance and delivery boundary | before_prd | resolved | Native compact Codex evidence plus scoped automated/rendered/no-write evidence; no new host support or release/Git action. | Arndt Gold |
| Core representation and adapter integration | later_sd | deferred | Preserve existing request schemas/limits and decide the smallest Core-owned projection/reuse path and observation identity in SD. | SD owner: Codex |
| Executable scenarios and host evidence capture | later_tp | deferred | Map each criterion/SD decision to scenarios, expected results and concrete evidence paths. | TP owner: Codex |

## 11. Next Step

Review the exact draft, especially the stable stored-title/search choice and five-match preview. Approve only with `Approval: PRD`; request revision if those choices should differ. Approval permits focused Solution Design, not implementation.

## AGDF Approval Summary (de; source=en)

Nutzerziel: Aktive Vorhaben schnell finden und bewusst ihren tatsächlichen Run öffnen.

Umfang: Die kompakte Karte und die große Übersicht nutzen eine gemeinsame Core-Leselogik für Auswahl, Reihenfolge, Titel, Suche und Zähler. Dieses PRD konkretisiert den freigegebenen UR; es ist selbst noch nicht freigegeben.

- AC-001: Kompakt erscheint nur „Active Backlog“, letzter Tabelleneintrag zuerst. Geplant und Archiv bleiben in der großen Übersicht erreichbar. Ein dort gespeichertes „Completed“ wird sichtbar erhalten.
- AC-002: Bereich, Reihenfolge, Identität, Titelherkunft, Suche, Zähler und Vollständigkeit kommen aus einem Core-Vertrag. Beide Ansichten liefern vor der kompakten Begrenzung dieselben Ergebnisse.
- AC-003: Bewusster Entwurfsvorschlag: Primärer Listentitel ist der gespeicherte Backlog-Titel, ohne bekannten Scope-Präfix in der Darstellung. Die Suche umfasst Originaltitel, Schlüssel und gespeicherten Status im gewählten Bereich, unabhängig von Großschreibung und äußeren Leerzeichen. Nachgeladene UR-Überschriften bleiben ergänzende Quellenangaben und ändern weder Listentitel noch Treffer. Dokumentvolltext ist nicht Teil dieser Suche.
- AC-004: Kompakt werden höchstens fünf Treffer angezeigt. Gesucht wird vorher im gesamten lesbaren aktiven Abschnitt. Abschnittsmenge, Treffermenge und angezeigter Ausschnitt sind unterscheidbar; die große Übersicht übernimmt die aktive Suche und zeigt alle Treffer.
- AC-005: Titel umbrechen lesbar innerhalb der Fläche; Status ist nachgeordnet. Schlüssel, Originalangaben, Quellen und vollständiger nächster Schritt bleiben aufklappbar. Tastatur, sichtbarer Fokus und die vorhandene Mindestzielhöhe von 44px werden geprüft, ebenso schmale/breite Browserflächen in Hell/Dunkel und die tatsächlich beobachtete Host-Breite.
- AC-006: Leer, kein Treffer, teilweise lesbar, nicht verfügbar, veraltet, fehlgeschlagene Aktualisierung und abgelaufene Sitzung bleiben unterscheidbar. Unvollständige Daten ergeben keinen vollständigen Nulltreffer; nicht verfügbare Zähler werden nicht als null ausgegeben. Wiederholen, Neuladen oder Neuöffnen sind sichtbar, soweit passend.
- AC-007: Nur bewusste Auswahl öffnet genau den gemeinten Run. Doppelte Schlüssel, fehlende Runs, Quellenänderungen und laufende Titelladungen dürfen keinen anderen Run auswählen. Rückkehr erhält Bereich/Suche und stellt den passenden Fokus wieder her. Aktueller Kontrollstand kommt aus der Run-Prüfung.
- AC-008: Listenaktionen schreiben keinen Kontrollzustand, senden keine Frage und erteilen keine Freigabe. Bestehende Browser-/MCP-/Sitzungsgrenzen bleiben wirksam. Automatische und gerenderte Prüfungen sowie eine frische echte kompakte Codex-Beobachtung mit Build-Identität und unveränderten Kontrolldateien belegen die spätere Umsetzung getrennt.

Entscheidungen: Die beiden konkreten Produktvorschläge sind stabile gespeicherte Titel/Suchfelder statt scrollabhängiger UR-Titel sowie fünf kompakte Treffer mit Zugang zu allen. Arndt Gold bleibt Produkt- und Freigabe-Owner; Codex erstellt anschließend das Design. Technische Repräsentation, Adapter und Aktualisierungskoordination entscheidet SD, ausführbare Szenarien und Host-Nachweise TP. Diese offenen technischen Punkte verschieben keine Produktentscheidung.

Nicht enthalten sind neue Datenhaltung oder Statusregeln, Backlog-Bereinigung, UI-Schreiber, Freigaben per Klick, automatische Arbeit, weitere Hosts, Veröffentlichung, Release oder Git-Aktionen. Risiken sind lange gespeicherte Titel, Unterschiede zu UR-Überschriften, Teilbestände und beobachtungsgebundene Identitäten. Die vorhandenen Core-Lesedienste, Adapter und UI-Flächen werden erweitert. Nach `Approval: PRD` folgt das fokussierte Solution Design; Implementierung bleibt bis zu den erforderlichen weiteren Freigaben gesperrt.
