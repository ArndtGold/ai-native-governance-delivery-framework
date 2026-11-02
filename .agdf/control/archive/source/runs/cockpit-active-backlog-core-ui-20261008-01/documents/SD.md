# SD: Shared Core list projection and readable cockpit rows

Status: draft
Gate: SD
Gate approval: open
Based on: approved PRD.md; BROWNFIELD_REVIEW.md; ready UX_INTENT_DEFINITION.md
Date: 2026-10-08
Owner: Codex
Run: cockpit-active-backlog-core-ui-20261008-01
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

Extend the existing Core cockpit read boundary with a small pure module, `packages/core/lib/control-inspect/cockpit-list.js`, plus its TypeScript declaration. Both React list surfaces import this same browser-safe Core implementation. It derives a list view from the already validated backlog observation and temporary area/query input, with no filesystem, network, React, cache, storage or gate dependency. Core owns the rules even when this pure read projection executes inside the browser bundle.

Keep the existing server-side backlog parser, snapshot/session lifecycle and raw wire entries in their original order. `cockpit-backlog.js` uses the shared section definitions; it continues to own contained source reads and malformed/duplicate detection. The new pure projection owns section selection, reverse source order, title presentation/provenance, deterministic search, area-specific completeness and source-bound presentation identity. This avoids changing the MCP/HTTP operation schema to search data already present in the bounded observation.

`Overview.tsx` and `mcp/CompactCockpit.tsx` render the derived result. A focused shared row component owns only markup, source disclosures and accessible actions. Compact rendering applies the approved five-row presentation limit after the Core projection has returned all matches. `App.tsx` remains the sole owner of temporary backlog view/navigation state and the existing reducer remains the read-state owner. No second UI orchestration system or persistent list index is introduced.

Source flow: Master Backlog -> existing contained Core parser/capture -> unchanged HTTP or MCP observation -> existing DTO validation -> shared pure Core list projection -> compact/expanded presentation. Run selection leaves this flow through the existing explicit run reader and evaluation. A list identity never becomes an approval or opaque resource selector.

## 2. Ownership And Source Of Truth

| Responsibility | Owner and location | Boundary |
|---|---|---|
| Stored section/order/row facts | `.agdf/control/MASTER_BACKLOG.md` | Source table data, not evaluated lifecycle |
| Contained reading, parsing, selectability diagnostics | `packages/core/lib/control-inspect/cockpit-backlog.js` | No writers or inferred run state |
| Shared list rules and section definitions | New `cockpit-list.js` beside the existing projector | Pure Core implementation, independent of transport and rendering |
| Read capture and actual run validation | Existing `cockpit.js`, Core snapshot/session owners | Opaque selectors and current run evaluation remain authoritative |
| Wire transport and validation | Existing browser service/pool, `mcp/transport.ts`, `api.ts` | Existing request/response schemas and limits remain unchanged |
| Temporary area/query/navigation/focus | Existing `App.tsx` and reading reducer | Ephemeral view state only |
| Rows, controls, disclosures and responsive layout | Existing Overview/CompactCockpit plus focused shared row component and styles | No independent filter/order/search/completeness policy |
| Supplementary observed UR headings | Existing bounded title reader/hook/cache | Source details only; never primary title or search membership |
| Product criteria and human decisions | Approved PRD and existing governed gate flow | This SD cannot change their meaning or grant implementation |

## 3. Architecture Decisions

- SDD-001: Add one pure Core list projection and shared section definitions, consumed by both views while keeping raw wire entries in original order; rationale: one implementation removes competing list policy without a new service or protocol; consequence: the browser-safe module must remain free of Node/runtime imports and have a matching declaration checked by the UI build.
- SDD-002: Use stored backlog work-item titles for primary display and original title/key/status for deterministic per-field substring search, keeping observed UR headings supplementary; rationale: this directly realizes the approved stable search promise without a document index or unbounded reads; consequence: a query matching only a UR heading remains outside the declared corpus and documentation/tests must state that limit.
- SDD-003: Derive area completeness, nullable unavailable counts and scoped diagnostics inside the Core list projection; rationale: counts and no-match claims must reflect the selected source area rather than global envelope severity or a numeric zero from an unreadable table; consequence: renderers display a semantic completeness result and never recreate the diagnostic classification.
- SDD-004: Bind presentation identity to backlog digest, original entry position, section and key, preserving actual opaque read selectors and explicit run-key validation; rationale: filtering, reverse order and title observation must not reassign a row while capture IDs rotate; consequence: source changes replace presentation identities and return focus must distinguish a removed row from a row outside the current compact preview.
- SDD-005: Reuse App-owned temporary backlog view state and a shared passive row renderer, applying five rows only in compact presentation; rationale: query/selection survive expansion and return without duplicate search state or copied row markup; consequence: compact/expanded transitions require explicit view/focus coordination and tests while keeping host display-mode confirmation with EmbeddedEntry.
- SDD-006: Reuse the existing reducer/feedback, mark overview source changes stale until deliberate reload, and retain the guarded title-read/navigation path; rationale: the approved recovery behavior must not silently replace the overview or send retired selectors during a title-read race; consequence: overview freshness handling changes locally, while run/document/context and session authority remain unchanged and require regression evidence.

## 4. Integration Points

### Pure Core projection contract

`projectCockpitList(inventory, { section, query })` accepts a validated current or explicitly previous backlog DTO. It returns a newly derived, nonmutating view with:

- selected section and normalized query;
- `coverage`: complete, partial or unavailable, plus selected-area diagnostics;
- section count and match count, with unavailable represented by null rather than zero; partial counts describe parsed/readable observations, not an exhaustive source total;
- all matching rows in reverse original sequence;
- each row's original entry reference/index, source-bound presentation identity, stable display title and title provenance describing the stored backlog source/path/digest;
- existing row selectability, never expanded by the helper.

The same module exports the canonical section definitions and a source-bound row-key helper. It contains no localized UI wording. Its adjacent declaration describes its structural input/output and preserves the concrete caller entry type, without importing React/UI types into Core. UI types consume the declaration rather than copy the policy. Reuse the Core section definitions in the parser and presentation controls; translated labels remain presentation data.

Search trims the query and uses deterministic Unicode lowercase matching over each of the three approved stored fields separately. Matching may not span a concatenation boundary between fields. Empty query returns the selected area's rows. Scope-prefix removal affects only the display title; it recognizes the existing framework-maintenance/external-delivery forms, leaves unknown prefixes unchanged and never discards the original. A missing usable title remains explicitly diagnosed/nonselectable according to the source parser; a presentation fallback must not create selectability.

Completeness starts from the selected section's actual parse evidence. Missing/unsupported layout diagnostics make that area unavailable even if raw counts are zero. Diagnostics scoped to another section do not contaminate a confirmed area. Unscoped diagnostics conservatively affect all relevant areas. Malformed/duplicate/nonselectable rows in the selected area prevent a claim of fully usable completeness, including a duplicate whose emitted diagnostic happens to name the other occurrence's section. The existing disabled rows remain inspectable. A contradictory count/entry contract is rejected as invalid read data, not repaired by guessing.

Presentation identity uses the backlog digest and original position before filtering/reversing plus section/key. It is stable across metadata-only capture replacement for unchanged backlog bytes, distinct for duplicate rows, and replaced when the source digest changes. The raw entries array is never reordered, because `cockpit.js` and the bounded title loader associate opaque row selectors with original positions. Neither identity nor cached heading is used as authority to choose a run.

### UI integration

Both views call the shared projection on the same validated inventory. They delete their local section filtering, reverse ordering, title-prefix stripping, search normalization/filtering and completeness inference. Shared rendering receives prepared rows and callbacks. It displays the primary title as a native button, the explicitly stored status second, and a details element containing original identity, title/source provenance, priority/scope, source links and the full stored next step. Supplementary UR observations, when available through the existing bounded hook, appear only in those details.

The expanded list shows all Core matches. The compact list takes the first five and renders section/match/display counts, an always-available search field for a readable list, and the existing full-overview action. Empty/no-match/partial/unavailable wording uses the Core result. List actions are disabled while the observation is loading, stale, failed or expired; local search may still inspect explicitly labeled previous content but cannot make it current.

`App.tsx` passes controlled area/query props to CompactCockpit as well as Overview. The compact view is always active-area selection. Expanding that view preserves its active query because the same App/session survives the confirmed display-mode change. Expanded area changes keep the existing query-clear behavior. If the host returns from another area to compact mode, reset to Active Backlog with an empty query and focus the compact heading; do not mislabel a Planned/Archive query as active. This is temporary mode navigation, not source mutation.

Use the existing shared `showOverview` return path in compact and expanded run views, rather than compact's current anonymous overview callback. Preserve the prior applicable query and return-focus reference. Restore focus to the exact matching visible row when available. If it was removed, explain removal and focus the list heading. If a host mode change places it outside the five-row preview or in another area, explain the changed view and offer expansion/search rather than falsely report removal or select a neighboring row.

The row component shares disclosure markup but contains no transport, cache, gate or list policy. Retain the bounded title hook/cache in the expanded overview and use Core-provided original source identity/index when joining observations. Remove cached headings from membership and primary-title calculation. No need to load supplementary titles in compact merely to search. Preserve the existing twelve-row read limit, cache bounds, hidden-view behavior and navigation cancellation safeguards.

### Read recovery and presentation

For overview source_changed results from freshness or title reads, invalidate applicable ephemeral context and dispatch the existing stale action. Do not automatically replace the overview observation; the existing RefreshControl supplies deliberate reload. Late responses are still ignored by generation/cancellation guards. Title-read replacement during deliberate run navigation keeps the existing named-capture safeguard in App; it may not send a selector from the replaced scope. Run/document/context refresh behavior outside the overview remains unchanged.

Styles reuse existing tokens and row classes, remove the obsolete compact native-select layout, and use width-constrained wrapping with min-width zero. Preserve visible focus and 44px minimum action/disclosure height. Keep primary titles unclamped. Move the full next-step text into disclosure or leave it fully visible; any retained short summary must provide that complete disclosure. Do not change branding, document layout or unrelated run-detail styling.

### Build and documentation

The pure Core module is bundled by the existing Vite builds, without pulling the filesystem projector or Core root entry into the browser. Node-side Core uses the shared section definitions directly. Existing Core projection copies canonical bytes; maintain the private-cockpit exclusion in `scripts/core-projection.mjs`, including the new module/declaration, so the regular Copilot payload does not gain a private cockpit dependency. This preserves existing host packaging and adds no host capability.

Update the UI README and cockpit architecture page for source-field search, stable title provenance, compact five-match preview, shared Core ownership and deliberate overview reload. Existing request schemas, server authentication, session limits, resource URI and UI manifest format remain unchanged. Use the existing local preparation/manifest checks for eventual native verification; no public publication or versioned external API is introduced.

## 5. Constraints And Compatibility

No canonical control writer, gate evaluator change, new MCP/HTTP operation, new persistent cache/index, browser storage, URL state, public export promise or data migration. The new helper is an internal private Core seam and the existing raw DTO remains compatible. Render all source text through existing passive React rendering; source content is data, not instructions or trusted HTML.

Preserve run/session/snapshot validation, resource containment and bounded reads. Compatibility failures are explicit through existing read feedback. Source reversibility is a local code/build rollback using the existing owned preparation path; it needs no data rollback. A necessary public-contract change or independently coordinated host rollout would invalidate this bounded design and require depth reassessment before execution.

## 6. Test And Evidence Strategy

Core tests exercise mixed sections, source order, duplicate/malformed rows, partial/unavailable area isolation, stored Completed status, case/whitespace/per-field search, title provenance, source identity and input immutability. Use identical fixture observations for compact/expanded parity before the five-row limit.

UI tests cover controlled query/expansion, row identity, search outside the first five, metadata-only observations, full next-step disclosure, keyboard selection/return, disabled invalid/stale rows and overview deliberate-reload behavior. Keep existing title-read bounds and committed-title navigation race tests. Preserve HTTP/MCP request/response validation and existing session/document/context regressions. Change old opportunistic-title search and primary-title expectations explicitly rather than weaken unrelated assertions.

Run typecheck and both builds to validate the pure Core browser closure/declaration and bounded MCP artifact. Render long-title/key fixtures at the approved browser widths/themes, inspect wrapping/overflow/focus/targets, and observe the fresh actual compact Codex surface with matching built/served identity. Measure canonical file bytes only during the app inspection window; governed artefact bookkeeping stays outside that window. Test planning assigns commands/scenarios/evidence paths; no new implementation has been tested yet.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Shared Core section definitions and nonmutating reverse-area projection; render section totals independently of preview | Master Backlog; existing Core parser and new internal list module | SDD-001, SDD-003 | Keep raw wire order and stored statuses; unavailable areas use null count |
| AC-002 | One pure Core implementation imported by both surfaces; remove competing renderer rules | Core list module; existing raw read DTO and validated adapters | SDD-001, SDD-003 | Browser-safe closure/declaration and private package exclusion require build checks |
| AC-003 | Stable stored display title, per-field normalized search, supplementary heading disclosure only | Master Backlog fields; Core list module; existing bounded title reader | SDD-002, SDD-004 | Deliberately replace old cache-driven expectations without changing opaque selector order |
| AC-004 | App-controlled active query, five-row rendering limit after full projection, existing confirmed host expansion | Approved PRD; App view state; EmbeddedEntry display-mode result | SDD-005 | Unsupported expansion retains existing explicit limitation/fallback |
| AC-005 | Shared passive row renderer, wrapped title, explicit status and complete source/next-step disclosure | Approved PRD; existing UI tokens/styles and source provenance | SDD-002, SDD-005 | Keep document/branding layout separate; inspect narrow widths and keyboard targets |
| AC-006 | Core area completeness plus existing reducer/feedback; overview changes await deliberate reload | Core diagnostics and source/session validation; App/reducer recovery | SDD-003, SDD-006 | Avoid falsely zero counts, unrelated-area disabling or prior data becoming current during retry |
| AC-007 | Digest/original-position identity, explicit run key and existing named-capture race safeguard; shared return/focus path | Core capture/run read authority; App navigation and current source observation | SDD-004, SDD-005, SDD-006 | Distinguish removed entries from mode/preview-hidden entries; never reuse retired opaque selectors |
| AC-008 | Preserve transport/read-only security boundaries; bounded builds, scoped regressions and exact native no-write observation | Existing Core/session/HTTP/MCP contracts; approved PRD evidence boundary | SDD-001, SDD-006 | Browser/source proof does not establish native or additional-host acceptance; no release claim |

## 8. Risks And Open Questions

No unresolved material architecture choice remains. A pure Core module executing in the UI must not acquire filesystem/runtime imports; builds and structural review enforce that boundary. Diagnostic completeness can be subtle across duplicate rows and malformed sections; Core tests cover both occurrence sections. Opaque title selectors rotate on capture replacement while presentation identity remains source-bound; preserve original array order and race handling. The approved stable stored-title choice can display longer text than UR headings; wrapping/disclosure and actual-host checks establish usability.

The five-row limit bounds row count rather than pixel height; no fixed native viewport height is assumed. Existing host expansion remains capability-confirmed. Overview deliberate reload must be scoped so it does not regress current run/document/context refresh. Exact executable scenario grouping and evidence capture mechanics remain TP concerns. Any newly discovered boundary effect returns to the existing Brownfield/earliest affected owner instead of being silently accepted as debt.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Shared Core seam | before_sd | resolved | Pure internal cockpit-list module/declaration, used directly by UI and for section definitions by Core parser; raw transport entries unchanged. | Codex |
| Search/title implementation | before_sd | resolved | Per-field lowercase substring matching after query trim; stored title primary, known prefix omitted only for display; UR observations remain supplementary. | Codex |
| Completeness and identity | before_sd | resolved | Core classifies selected-area diagnostics/counts; source digest plus original entry position/section/key identifies presentation; opaque selectors retain existing validation. | Codex |
| UI state and reuse | before_sd | resolved | App-controlled area/query and existing navigation/reducer; focused shared passive row markup; compact five-row presentation only. | Codex |
| Overview recovery | before_sd | resolved | Mark overview source changes stale until deliberate reload; preserve named-capture cancellation race safeguard and run/document/context behavior. | Codex |
| Compatibility and propagation | before_sd | resolved | Existing DTO/request/resource/manifest formats and limits remain; bundle only pure Core closure and preserve private-cockpit package exclusion. | Codex |
| Test execution and evidence capture | later_tp | deferred | Assign scenario IDs, commands and native evidence paths for the strategy above; no product/design decision is deferred. | TP owner: Codex |

## 9. Next Step

Review this exact design and approve only with `Approval: SD`. Approval permits the Task/Test Plan; implementation remains blocked until its approval and implementation-preparation Brownfield Analysis.

## AGDF Approval Summary (de; source=en)

Die Lösung erweitert die vorhandene Core-Cockpit-Grenze um ein kleines reines Listenmodul. Kompakte Karte und große Übersicht verwenden denselben Code für Bereiche, Reihenfolge, Titel, Suche, Identität und Vollständigkeit. Das Modul kann mit bereits geprüften Lesedaten im Browser arbeiten, ohne Dateisystem-, Netzwerk-, React- oder Freigabeabhängigkeit. Neue MCP-/HTTP-Operationen und eine zweite Datenhaltung sind nicht erforderlich.

Core liest das Masterbacklog weiterhin über den vorhandenen Parser. Die Rohdaten bleiben in ursprünglicher Reihenfolge, damit beobachtungsgebundene Titel-Selektoren weiter stimmen. Erst die gemeinsame Listenprojektion wählt den Bereich und kehrt dessen Reihenfolge um. Gespeicherte Statuswerte bleiben erhalten; die tatsächliche Run-Prüfung behält ihre Autorität.

Die sechs Designentscheidungen sind konkret: SDD-001 legt die reine Core-Grenze und gemeinsame Bereiche fest. SDD-002 realisiert die freigegebene Suche getrennt über gespeicherten Titel, Schlüssel und Status; nachgeladene UR-Überschriften sind ergänzende Quellenangaben. SDD-003 macht Zähler und Vollständigkeit bereichsspezifisch, mit „nicht verfügbar“ statt einer falschen Null. SDD-004 bindet die Darstellungsidentität an Backlog-Digest und ursprünglichen Eintrag, ohne sie mit Run-Freigaben oder technischen Lese-Selektoren zu verwechseln.

SDD-005 hält Bereich/Suche im vorhandenen App-Zustand und verwendet gemeinsame passive Zeilendarstellung. Nur kompakt werden nach der vollständigen Suche fünf Treffer angezeigt. Vergrößern erhält die aktive Suche; Bereichswechsel löscht sie wie bisher. Eine Rückkehr aus Geplant/Archiv in den kompakten Modus zeigt wieder Aktiv mit leerer Suche. Titel umbrechen, Status steht nachgeordnet, Originalangaben und vollständiger nächster Schritt bleiben aufklappbar. Rückkehrfokus unterscheidet entfernte Einträge von solchen außerhalb des aktuellen Ausschnitts.

SDD-006 verwendet vorhandene Zustands- und Fehleranzeigen: Quellenänderungen in der Übersicht markieren den alten Stand als veraltet, bis bewusst neu geladen wird. Die bereits vorhandene Absicherung bei laufender Titelladung und Run-Wechsel bleibt bestehen. Run-, Dokument-, Kontext- und Sitzungsautorität werden nicht ersetzt. Die UI entscheidet weder über Freigaben noch über Weiterarbeit.

Jedes der acht PRD-Kriterien ist genau einmal auf Design, Quelle, Entscheidungen und Risiken abgebildet. Core- und Adapterprüfungen belegen später Gleichheit und Grenzen; UI-Prüfungen belegen Suche, Fünfer-Vorschau, Fokus, Teilbestände und Wiederholung. Beide Builds prüfen, dass nur der reine Core-Code in den Browser gelangt. Die private Cockpit-Ausschlussregel der Paketprojektion bleibt erhalten. Eine frische echte kompakte Codex-Beobachtung mit passender Build-Identität und unveränderten Kontrolldateien bleibt erforderlich; Browsernachweise ersetzen sie nicht.

Materiale Designentscheidungen sind aufgelöst. TP legt nur noch ausführbare Szenarien, Befehle und Nachweispfade fest. Risiken sind bereichsübergreifende Duplikate, wechselnde technische Selektoren, lange Titel und die begrenzte Änderung am Aktualisierungsverhalten der Übersicht. Dafür sind gezielte Regressionen vorgesehen. Es gibt keine Datenmigration, neue öffentliche Schnittstelle, zusätzliche Host-Unterstützung, Veröffentlichung oder Git-Aktion. Nach `Approval: SD` folgt der Aufgaben- und Testplan; Code wird erst nach den erforderlichen weiteren Voraussetzungen umgesetzt.
