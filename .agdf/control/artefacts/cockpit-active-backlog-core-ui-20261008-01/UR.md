# UR: Shared Core reading and readable active-backlog selection

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-08
Owner: Arndt Gold
Run: cockpit-active-backlog-core-ui-20261008-01
Language: en

## 1. Problem

The compact AGDF cockpit puts all three Master Backlog sections into one native dropdown. The user's screenshot shows 146 concatenated options containing scope prefixes, long titles, stored statuses and technical keys; the open dropdown extends far beyond the card. This makes finding and comparing the current work difficult. The expanded overview already selects a section and reverses its table order, but the compact card uses the entire original sequence. Selection and search behavior therefore depend on the presentation surface.

Both views implement list policy in React. In the expanded overview, search also includes only UR titles already loaded through visible rows: the same query can yield no match before a title is loaded and a match afterwards. Users cannot rely on that as a complete search of the displayed titles. The current Core projection provides source entries and diagnostics, but does not yet own the complete shared list-reading behavior.

## 2. Goal

The user can quickly find and deliberately open a current undertaking from the compact cockpit. It initially shows only the Active Backlog section, with its last table entry first. Compact and expanded views consume one Core-owned read contract for list membership, order, identity, title provenance and search semantics. The UI remains a readable inspection surface; AI work continues through the existing controlled operations and human gate approvals remain explicit.

## Affected Users

The user inspecting AGDF work through the compact MCP cockpit and the expanded/browser overview in this repository. The screenshot supplies direct evidence for the compact Codex surface. Other host support is limited to existing evidenced capabilities; this requirement adds no new host integration.

## 3. Scope

- Extend the existing Core cockpit read owners with shared list-reading functions and a defined contract used by both presentation surfaces. Core owns backlog section membership, reverse source-table order, counts and completeness, row identity/selectability, title fallback and provenance, and search scope/results. React owns input, navigation, wrapping, focus and accessible presentation. Preserve the existing read, resource and snapshot boundaries.
- Initially show only entries from `Active Backlog` in the compact list. Reverse their stored table sequence so the last entry in that section comes first. Do not infer recency from timestamps or priority. Keep Planned / Parking Lot and Completed / Superseded Pointers reachable through the expanded overview, with the same shared section and ordering semantics.
- Treat “active” as backlog section membership. Preserve stored statuses as source information, including a Completed status in Active Backlog. A list entry is a stored pointer, not proof of a valid active run. Opening an entry continues to obtain and validate the actual run through the existing read owner; unavailable or ambiguous entries remain explicit.
- Replace the overflowing compact dropdown with a readable, searchable list presentation. Make the undertaking title the primary information and the stored status secondary. Long titles must wrap within the host surface. Keep technical identity, original data and title provenance inspectable without concatenating them into every selection label. Improve the expanded list where necessary for a consistent, scannable reading experience.
- Define deterministic search over the selected backlog area, including the documented title/key/stored-status fields. Merely scrolling, loading a visible UR title or opening a row must not silently change a completed query's meaning. Declare which title sources are searched and expose incomplete or unavailable coverage rather than claiming an exhaustive no-result. Maintain bounded reading; PRD/SD determine the precise title-search and loading strategy.
- Show counts for the actual displayed/searchable area and distinguish empty, no match, partial, unavailable and stale data. Filtering, ordering and title enrichment must not change the identity of the entry selected by the user. Preserve deliberate selection and existing source-change/session handling.
- Update the cockpit documentation and verify the shared behavior through Core/adapter checks and rendered UI evidence, including the actual compact host surface. Keep automated, protocol and live-host evidence distinguishable.

## 4. Non-Goals

- No new Core subsystem, duplicate backlog store, independent status policy or second source of control truth. Reuse and extend the existing read projection.
- No automatic cleanup, relocation or status correction of backlog rows, and no new definition of run lifecycle or gate state.
- No UI control writers, run creation, gate approval by selection/click, automatic delivery continuation, approval transfer or changed authorization semantics.
- No new host integration, remote service, public distribution, release or Git commit/push in this scope.
- No comprehensive dashboard redesign or new prioritization, analytics or graph features. Exact row density, result limits and visual controls belong to subsequent product/design preparation.

## 5. Acceptance Signals

1. Given mixed active/planned/archive rows, the initial compact list contains exactly the readable Active Backlog membership in reverse table order; its count describes that section. Planned and archived entries remain reachable in the expanded overview.
2. Core tests establish section, order, identity, title/provenance, search and completeness semantics. Both UI surfaces consume that contract and return the same ordered matches for the same area, query and source observation; they do not maintain competing domain rules.
3. A query has declared coverage. Scrolling or incidental title loading cannot silently turn a completed no-match into a match for unchanged source data. Missing titles, bounded-read limits, malformed sections and unavailable sources produce explicit fallback/completeness information.
4. Long titles and technical keys, a mixed backlog comparable to the screenshot, narrow supported surfaces and an expanded view remain usable without a selection popup overflowing the card. Titles are readable, statuses are secondary, identity/provenance is inspectable, and keyboard/focus interaction supports deliberate selection. Exact supported sizes are established from the existing host and responsive boundaries.
5. A Completed row stored under Active Backlog remains represented as stored. Duplicate/invalid keys, a missing run or a changed source never open a different run silently. List selection remains bound to the intended entry despite filtering, order or title changes.
6. Empty, no-match, partial, unavailable and stale states and their counts are distinguishable. Current gate/next-action information continues to come from the selected run's canonical evaluation rather than the backlog label.
7. UI inspection writes no canonical control state. Existing browser cockpit, MCP/session boundaries and controlled AI/approval paths retain their behavior. Rendered checks and a fresh actual Codex compact-host observation support the claimed UX result; no other host is claimed without corresponding evidence.

## 6. Existing Source Of Truth

- The user's screenshot and requests in this conversation: readable selection, only Active Backlog initially, its last stored row first, shared central Core functions, and beginning with a UR covering Core + UI.
- `.agdf/control/MASTER_BACKLOG.md` owns stored sections, table order and row data. The selected run's `RUN_STATE.md` under `.agdf/control/runs/` and its registered artefacts own canonical run state and evidence; the backlog is not a substitute for their evaluation.
- `packages/core/lib/control-inspect/cockpit-backlog.js` owns backlog projection and bounded UR-title extraction. `cockpit.js` owns read-scope composition and title reads; `cockpit-contract.js` and existing Core read/session owners define the service boundaries.
- `packages/control-ui/src/Overview.tsx`, `src/mcp/CompactCockpit.tsx`, `src/useBacklogTitles.ts` and related types/styles own the current presentation and its differing behavior. Existing browser/MCP adapters must consume the shared contract.
- `docs/architecture/06-agdf-cockpit.md` and `packages/control-ui/README.md` document cockpit responsibilities. `plugins/agdf/meta/contracts/` remains normative for governance authority.
- The embedded-Codex and Claude-host URs describe integration scopes. Their implementation is reuse input; their approvals do not authorize this increment. No implementation or approval is inferred from this review.

## 7. Risks And Unknowns

Brownfield Review must establish the smallest extension of the existing projection, contract and adapter owners. PRD must resolve list density/navigation and the exact search promise, including the relationship between stored backlog titles and observed UR headings. SD must choose bounded loading/search mechanics, source-bound identity and refresh behavior without adding persistent duplicate state or exceeding existing resource limits. Active-section/status inconsistencies are source observations, not permission to repair the backlog. Actual compact-host sizing and accessibility require rendered/live checks; browser-only verification cannot establish native-host success. Independently governed cockpit changes may require rechecking the reused baseline.

## 8. Next Step

Review this UR and approve only with `Approval: UR`. After approval, continue through the existing Brownfield Review and Mode/Slice Decision and the required planning gates. This draft does not authorize implementation.

## AGDF Approval Summary (de; source=en)

Die kompakte Cockpit-Karte zeigt derzeit alle Backlog-Bereiche in einem überbreiten Dropdown. Der Screenshot mit 146 verketteten Einträgen macht Titel, Status und technische Schlüssel schwer vergleichbar. Die große Übersicht filtert und sortiert anders; ihre Suche hängt zudem von bereits geladenen UR-Titeln ab. Ziel ist eine schnell erfassbare Auswahl aktueller Vorhaben mit gemeinsamen Core-Lesefunktionen für kompakte Karte und große Übersicht. Betroffen ist der Anwender dieser Cockpit-Ansichten; neue Host-Integrationen gehören nicht zum Umfang.

Die kompakte Liste zeigt zunächst ausschließlich „Active Backlog“, den letzten Tabelleneintrag zuerst. Geplant und Archiv bleiben über die große Übersicht erreichbar. „Aktiv“ meint den Backlog-Abschnitt: Ein dort gespeicherter Status „Completed“ wird weder versteckt noch umgeschrieben. Erst das Öffnen liest und prüft den tatsächlichen Run.

Core übernimmt Bereichsauswahl, umgekehrte Tabellenreihenfolge, Zähler und Vollständigkeit, Eintragsidentität, Titelherkunft und Suchsemantik. Die UI übernimmt Eingabe, Navigation, Fokus und Darstellung. Das Dropdown wird durch eine lesbare, durchsuchbare Liste ersetzt: Titel vorn, gespeicherter Status nachgeordnet, lange Titel umbrechend, technische Angaben und Quellen bei Bedarf einsehbar. Beide Ansichten nutzen denselben Lesevertrag. Die Suche erklärt ihren Bereich und ihre Titelquellen; zufälliges Nachladen darf ein abgeschlossenes Suchergebnis nicht still verändern. Fehlende oder begrenzt lesbare Quellen werden ausdrücklich behandelt.

Abnahmezeichen sind die exakte aktive Abschnittsmenge in umgekehrter Reihenfolge, übereinstimmende Core-basierte Ergebnisse beider Ansichten, verlässliche Suchabdeckung, verständliche Zähler sowie unterscheidbare Leer-, Kein-Treffer-, Teil-, Fehler- und veraltete Zustände. Lange Titel müssen innerhalb der unterstützten Flächen lesbar und per Tastatur auswählbar bleiben. Filter, Sortierung und Titelanreicherung dürfen keinen anderen Run auswählen. Doppelte Schlüssel, fehlende Runs und Quellenänderungen bleiben sichtbar. Bestehende Browser-, MCP-, Sitzungs- und Freigabewege bleiben wirksam; UI-Lesen schreibt keinen Kontrollzustand. Automatische Prüfungen und eine frische Beobachtung der echten kompakten Codex-Fläche belegen den Umfang getrennt.

Maßgeblich sind das Masterbacklog für gespeicherte Einträge, kanonische Run-Zustände und Artefakte für die Kontrolle, die vorhandenen Core-Cockpit-Lesedienste sowie die React-Ansichten und Cockpit-Dokumentation. Die Codex- und Claude-Integrationsruns liefern nur wiederverwendbare Grundlagen. Nicht enthalten sind eine zweite Datenhaltung, neue Statusregeln, Backlog-Bereinigung, UI-Schreibaktionen, Freigaben durch Klick, automatische Fortsetzung, weitere Hosts, Veröffentlichung, Release oder Git-Aktionen.

Brownfield Review klärt die kleinste Wiederverwendung; PRD präzisiert Listendichte und Suchversprechen; SD bestimmt begrenztes Laden, Identität und Aktualisierung. Host-Größen und Barrierefreiheit müssen praktisch geprüft werden. Parallele Cockpit-Änderungen können erneute Prüfungen erfordern. Nächster Schritt nach der bewussten Antwort `Approval: UR` ist Brownfield Review mit Mode/Slice Decision und anschließend die erforderliche Planung. Der Entwurf erteilt keine Implementierungsfreigabe.
