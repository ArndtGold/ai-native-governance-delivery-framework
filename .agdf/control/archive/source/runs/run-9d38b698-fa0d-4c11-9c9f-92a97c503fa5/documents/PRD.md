# PRD: Parallel delivery without central backlog conflicts

Status: draft
Gate: PRD
Gate approval: open
Based on: approved UR; completed Brownfield Review and ready UX Intent Definition
Date: 2026-10-31
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Deliver one coherent replacement of mandatory central-backlog coordination: the existing compact and expanded Cockpit read Run membership and stored orientation from the canonical Run inventory; ordinary Run operations cease required MASTER_BACKLOG.md writes and locks. Existing per-Run state, artefacts, approvals and current selected-Run evaluation retain their authority. The same delivery defines where newly chosen AGDF worktrees belong: .agdf/worktrees/INITIATIVE/ under the owning project's primary checkout, ignored by that checkout. It does not create a worktree-management feature.

Reuse the existing inventory meaning: active Runs and invalid diagnostic entries, history for completed/superseded/abandoned Runs, attention classes, receipt/approval-based activity, objective-derived titles and explicit Run-ID fallback. A list observation is stored state, not an integrity audit or current gate permission. The existing selected-Run path supplies current evaluation after deliberate opening. No automatic scan of every worktree or every registered artefact is required to render the list.

Preserve old planning/history information as a separate, optional read-only legacy view of the existing backlog when it exists. Label it as legacy source information; keep its original sections, rows, links and provenance inspectable within current read bounds. Do not mix legacy row counts/statuses with canonical Run inventory, manufacture Runs or approvals, or create a new mandatory shared planning store. Missing or malformed legacy input cannot block Run-only work. The legacy file remains in place; no silent migration, deletion or cleanup occurs.

Structured Delivery is required because writer/recovery and persisted-file contracts change, not because of file counts. The isolated CI-fix worktree, its branch/index, workflows, compatibility evidence, baselines and ongoing processes are outside this Run. Integration later accounts for the finished CI fix instead of overwriting it.

## 2. UX Intent And Success

- ui_ux_impact: medium
- ux_intent_definition: ready analysis at .agdf/control/artefacts/run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5/UX_INTENT_DEFINITION.md, digest sha256:fe98e89e54b9664f6d115ecada733ea32921a7a636f423d89be165e74938527b
- primary_user_intent: Find an undertaking in the explicitly bound project, understand its stored orientation and deliberately open its actual Run for current evaluation and evidence.
- success_signal: A new Run is findable without a backlog row; compact and expanded views agree for the same observation and query; independent Run changes do not require changes to a shared backlog. Users can distinguish stored, checked, stale, incomplete and legacy information.
- primary_decision_or_action: Select and open the exact intended Run. Filtering, viewing and refresh never approve or continue delivery.

The UX analysis used written illustrative scenarios, not an implemented mockup or user-observed UI. No preview was requested or created. These scenarios become test obligations through the criteria below; they are not delivered behavior or host qualification.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| active overview | Stored Run inventory for the selected checkout; active lifecycle and invalid diagnostic entries | available, empty, no matches, incomplete, unavailable, loading, stale, refresh failed, session expired | Existing Run inventory and exact observed Run records | Compact and expanded Run overview |
| history | Stored completed, superseded and abandoned lifecycle, explicitly not a current integrity claim | available, empty, incomplete, stale, unreadable | Canonical Run records and preserved closure information | Both overview surfaces, with history deliberately reachable |
| selected Run/documents | Current Core evaluation and its limits for the exact selected Run | checked, blocked, unconfirmed, missing, changed, stale, expired | Existing gate/evidence/integrity rules and registered sources | Selected-Run/detail/document view |
| legacy reading | Retained old backlog sections and original pointers, separate from Run membership | legacy, absent, partial, unavailable, stale | Original legacy file only for its historical/planning facts | Optional distinct legacy reading mode |
| worktree preparation | Explicitly assigned checkout or deliberate new isolated checkout under its owning project | assigned/reuse, new placement, ownership clarification, explicit exception | Human scope/target instruction and existing repository binding rules | Existing agent guidance and handbook; no management UI |

Presentation ownership communicates state; it does not decide effective truth. SD owns technical components, persistence, transport representation and computation.

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: General Cockpit opens active Runs for the bound project; history and available legacy information are deliberate reading choices in compact and expanded views. An explicitly established specific Run still opens directly. Leaving a view stops its incidental reads under existing session rules. Assigned worktree continuation reuses that checkout; a new isolation choice follows the location rule without automatic creation.
- blockers_and_visible_next_actions: Invalid identity cannot select a different Run. Invalid/unreadable records remain accounted diagnostics, with an inspection action when identity is safe. Unknown or partial inventory is not an empty complete result. An unreadable legacy source affects its own mode only. Current gate blockers are explained by selected-Run evaluation. Ambiguous project ownership requires clarification before creating a new worktree, without moving existing ones.
- recovery_paths: Recoverable loading/refresh failure visibly offers retry; retain and label the previous observation when available. Source changes invalidate old observation selectors; refresh deliberately obtains new ones. A missing/invalid selected Run retains its identity and offers return to overview, never substitutes an adjacent Run. Expired sessions offer reconnect; expired selectors are not retried as current. Legacy errors identify their source and leave Run reading available.
- relevant_state_transitions: New Run plus refresh produces a new row; active to completed/superseded/abandoned moves it into history by lifecycle. Opening a Run moves from stored orientation to current evaluation. Return preserves area, query and safe focus; removed entries are not replaced silently. Refresh failure preserves labeled old content, then successful retry replaces it with a coherent new observation. Opening legacy information changes no Run or count. Continuing an assigned worktree reuses it; newly selected isolation uses the project-local rule.

## Acceptance Criteria

- criterion_id: AC-001
- requirement: Both Cockpit overview surfaces derive membership from canonical Runs and work without MASTER_BACKLOG.md. Active and history are deliberately reachable in both surfaces. Invalid entries remain accounted diagnostics; no legacy-only row supplies a canonical Run.
- working_mode: active overview and history
- source_state: A project with active, completed, superseded, abandoned and malformed Run entries, including a newly created Run absent from any backlog
- trigger: Open or refresh either overview and change active/history area
- expected_effective_state: One coherent stored Run observation with the same membership and meaning in both surfaces
- visible_feedback: Readable titles, lifecycle/attention, stored next action, source/revision basis and area counts; invalid entries have diagnostics
- blocker_failure_behavior: Unavailable/incomplete inventory is not claimed complete or shown as a complete zero count
- recovery_next_action: Retry reading or deliberately open a safely identified Run for current checks
- observable_success: With the legacy file removed, the new Run is findable and each valid Run opens by its own identity; both surfaces account for the same observed entries
- required_evidence: Core inventory/read tests, actual HTTP/MCP adapter observations and rendered compact/expanded scenarios with mixed valid/invalid Runs

- criterion_id: AC-002
- requirement: Reuse the inventory's existing attention ordering, then descending known activity and deterministic Run-ID tie-break. Search the selected canonical area over its displayed inventory title, Run ID and localized stored attention/status label. Title fallback and unknown activity remain explicit. Incidental UR-heading loading must not change a completed search result.
- working_mode: active overview and history search
- source_state: One unchanged observation with tied/unknown activity, long titles, objective placeholders, different attention classes and matching/nonmatching Runs
- trigger: Search, clear search, scroll or compare compact with expanded reading
- expected_effective_state: Deterministic same ordered matches for the same area, query, locale and observation
- visible_feedback: Area count and match count remain distinct; search coverage and title provenance are inspectable
- blocker_failure_behavior: Partial/unavailable reading does not promise exhaustive no matches
- recovery_next_action: Refresh to obtain another observation or clear the query; neither selects another Run implicitly
- observable_success: Order/search results do not change merely because of scrolling or title enrichment; keyboard focus and long text remain usable in supported narrow/wide views
- required_evidence: Shared policy tests, source-change/search negatives and rendered keyboard/narrow/wide checks

- criterion_id: AC-003
- requirement: Communicate stored list state separately from current selected-Run evaluation and integrity. Preserve exact Run selection, source-change/session boundaries and actionable recovery. No stored completed label or valid seal alone may imply current quality or permission.
- working_mode: overview, selected Run/documents, return and refresh
- source_state: A stored observation, subsequently changed/missing/invalid Run, transient read failure or expired session
- trigger: Open a row, return, detect a change, refresh, retry or reconnect
- expected_effective_state: Current checks refer to the intended Run and observed source revision; old content is explicitly stale or unavailable
- visible_feedback: Stored versus checked basis, source limits, visible retry/reconnect/return and a retained-old-state notice when applicable
- blocker_failure_behavior: Refuse stale/foreign selectors; retain requested identity; never open a neighboring Run or silently overwrite valid visible content after a failed refresh
- recovery_next_action: Deliberate refresh/retry/reconnect or return to the Run overview
- observable_success: Transient failure followed by retry restores a coherent observation; stale, missing and invalid cases cannot select or authorize another Run
- required_evidence: Scoped Core/session/adapter tests, unchanged-byte assertions and visible failure/retry/return scenarios

- criterion_id: AC-004
- requirement: Retain existing backlog-only ideas/history as optional separate read-only legacy information, with original section/row/link/provenance access within existing limits. Canonical Run data wins for current membership; old priorities and plan notes remain legacy facts. No automatic data conversion, deletion, fabricated Run or approval, or new mandatory shared planning file.
- working_mode: legacy reading and return to canonical overview
- source_state: Present mixed legacy sections, backlog-only keys, duplicate keys and missing/malformed/oversized legacy content
- trigger: Deliberately open legacy information or return to Runs
- expected_effective_state: Original legacy facts remain separate from canonical Run counts/statuses; unavailable portions are explicit
- visible_feedback: A clear legacy label, source attribution and readable original information or a source-specific diagnostic
- blocker_failure_behavior: A legacy error never blocks valid Run operations or replaces canonical Run facts; a row without an actual Run is not a Run continuation action
- recovery_next_action: Read the identified original source or return to Runs; any future conversion needs explicit scope/authority
- observable_success: Existing planning/history information remains traceable without recurring writes; an absent legacy file leaves normal Run reading fully usable
- required_evidence: Legacy/fresh-project fixtures, malformed/absent/limit cases, immutable-source assertions and visible legacy/source distinction

- criterion_id: AC-005
- requirement: Normal creation, UR/artefact/evidence recording, gate approval, update, internal continuation and closeout operate without creating, changing or synchronizing MASTER_BACKLOG.md and without acquiring a backlog-specific lock merely for a new ordinary Run operation. Required-file, linkage and initialization checks no longer require a live backlog as a condition of valid Run work. Optional legacy diagnostics cannot veto unrelated valid operations.
- observable_success: Representative flows succeed in fresh and existing projects with absent/stale/conflicted legacy backlog, and two independent Run changes require no edits to the common file. Run state, artefacts and approvals remain recorded by existing owners.
- required_evidence: Production writer/initialization/evaluation path tests, tracked changed-path assertions, absent/corrupt legacy cases and concurrent independent-Run scenarios; no weakened approval or integrity assertions

- criterion_id: AC-006
- requirement: Preserve per-Run revision/lock, exact approval/source bindings, operation replay, atomic material publication, historical receipts/archives and supported recovery semantics. A pending pre-upgrade transaction may finish its already-recorded backlog responsibility through explicit supported recovery; it must not silently create fresh backlog maintenance. Preserve completed/ended Run history without resealing or rewriting approved sources.
- observable_success: Recovery completes or refuses from exact old/committed states with identifiable provenance, preserves foreign bytes and produces no duplicate approvals. New operations remain independent of the legacy backlog. Current immutable historical evidence remains verifiable.
- required_evidence: Fault/replay/stale-revision/contention and legacy-journal regression scenarios at the affected existing owners, with original evidence retained; no production recovery or cleanup performed merely for testing

- criterion_id: AC-007
- requirement: Canonical guidance places newly chosen AGDF delivery worktrees at .agdf/worktrees/INITIATIVE/ under the owning project's primary checkout and requires the parent to ignore the container. Continue an already assigned worktree rather than nesting another one. Existing locations remain supported; an explicitly instructed alternative is a documented exception. One assigned writer continues a Run; path/branch names confer no authority. This rule does not mandate worktrees for every task or add automatic creation/switching/cleanup.
- working_mode: documented worktree preparation and continuation
- source_state: A confirmed project with or without an assigned worktree, an old externally placed worktree, or an explicit alternate-path instruction
- trigger: An agent/maintainer chooses new isolation or continues the assigned work
- expected_effective_state: The assigned checkout is reused, or the proposed new checkout is under the owning project with its container ignored; explicit exceptions remain attributable
- visible_feedback: Guidance names the actual project/checkout, intended location and reason for any exception without claiming technical cross-checkout locking
- blocker_failure_behavior: Unresolved owning project or a path collision requires clarification before creation; no existing worktree or foreign ignore content is moved/deleted/overwritten
- recovery_next_action: Resolve ownership/collision or follow the explicit alternative, then continue within existing target/Run binding rules
- observable_success: Guidance is consistent across canonical instructions and supported projections; disposable Git checks confirm ignored worktree contents, assigned reuse and legacy-location compatibility
- required_evidence: Canonical/projection documentation checks, disposable Git ignore/repository-binding cases and no live relocation/cleanup

- criterion_id: AC-008
- requirement: Propagate the replacement semantics through existing Core rules, transports, supported generated runtime/profile assets, project setup/templates and canonical handbook/architecture documentation. Readers and writers use existing rule/inventory owners; there is no parallel gate/status evaluator or control store. Explain that old runtimes still requiring backlog maintenance must not be mixed as concurrent writers during transition; version compatibility and recovery/rollback mechanics are defined before implementation.
- observable_success: Fresh and upgraded fixtures use the new default coherently; missing backlog does not recreate initialization/control failures; supported consumers agree about source ownership and operational compatibility. Existing history remains readable.
- required_evidence: Exact-candidate Core/adapter/package and propagation checks; documented compatibility/rollback decisions in SD; required shared graph/SoT reconciliation before clean OR

- criterion_id: AC-009
- requirement: Execute and validate this delivery in its assigned isolated worktree without changing the concurrent CI-repair worktree, index, branch, baselines, workflows or processes. Distinguish targeted Run checks, mandatory integration/merge checks and optional broad regression. Reconcile with the finished CI fix before integration. Preserve qualification limits: automated, protocol, browser and native-host evidence are separate.
- observable_success: Only intended source/derived and this Run's records change; no unrelated baseline is regenerated to hide a failure; focused and required checks have traceable candidate/environment evidence. Native-host observations are claimed only when actually performed, and host changes are not silently made to satisfy them.
- required_evidence: Scoped diff and validation records, changed-path review, exact integration baseline assessment, rendered UX evidence and explicit native-host limits; no unrelated full suite during planning

## 6. Non-Goals

No change to user gates or approval authority, automatic approval/continuation or historical approval transfer. No new status/rule service, shared symlinked control store, separate governance repository, cross-worktree dashboard scan, dashboard redesign or new host integration. No automatic migration of legacy ideas, worktree orchestration or removal/relocation of existing worktrees. No promise that all Git conflicts disappear. No modification of the concurrent CI fix. No commit, push, merge, public release or host reinstallation authorized by this PRD.

## 7. Users And Roles

Arndt Gold is the PRD owner and human gate decision-maker. Maintainers/agents prepare and execute only allowed work against the bound Run/checkout. Cockpit users read and deliberately navigate; UI actions grant no approval. Existing Core owners define effective inventory and control truth; HTTP/MCP mediate it and UI surfaces explain it. SD/TP owners design and plan the approved criteria; QA and required reviews assess actual implementation/evidence under existing responsibilities.

## 8. Constraints

Run state and registered artefacts remain canonical. Preserve safe-path/symlink checks, source/revision/session binding and existing read/time/response budgets; do not relax them merely to scan more data. A partial inventory must disclose coverage. An unchanged old observation is not current proof. Worktree execution targets remain checkout-local even when Git storage is shared. Tracked and untracked evidence require explicit preservation on handoff; seals are not backups.

The baseline for this feature remains its assigned main-derived checkout; the limited authoring-runtime repair was separately authorized and verified. That repair does not satisfy any feature acceptance criterion. This feature's code remains gated by SD/TP approvals and required implementation preparation. No additional user preview obligation is introduced.

## 9. Evidence Requirements

Derive test outcomes from this PRD, retain stable criterion IDs through SD/TP and QA, and reuse valid retrievable evidence with exact applicability rather than duplicate collection. For changed legacy behavior, show the intended regression on the prior implementation where safe, then its correction. Test critical negative cases, source immutability, counts/coverage, exact navigation, absent/conflicted backlog, new independent writes, historical transaction recovery, new/existing worktree placement and projection compatibility.

Visible criteria require actual rendered compact/expanded evidence at supported narrow/wide sizes and keyboard/focus scenarios, including failure/retry and legacy distinction. A written UX scenario is analytical input only. Native host rendering/interaction requires separate actual observation; source or browser tests cannot substitute. Scope mandatory integration checks to the exact reconciled baseline after the independent CI fix; optional full/nightly checks remain separate and do not run automatically during planning.

## 10. Risks And Open Questions

Primary risks are hidden legacy writers/required-file consumers, recovery compatibility, accidentally unbounded inventory evaluation and confusing legacy/stored/current claims. The Brownfield inventory and the criteria require explicit existing-owner treatment. No deliberate technical-debt waiver is accepted. SD must specify inventory capture/change detection, transport compatibility, old journal handling, rollback and supported runtime cutover. TP must map fault, package, visible and environment evidence without touching live foreign worktrees. These are assigned design/planning questions; product behavior is resolved below.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Canonical overview source and freshness promise | before_prd | resolved | Reuse stored Run inventory; current evaluation belongs to deliberately opened Run. Active/history are reachable in both views. | Arndt Gold, PRD owner |
| Ordering, search and titles | before_prd | resolved | Adopt existing inventory attention/activity/Run-ID order, displayed inventory title/ID/status search and explicit fallback/coverage; no incidental UR-title search changes. | Arndt Gold, PRD owner |
| Legacy-only planning and historical information | before_prd | resolved | Preserve the existing file and offer separate optional read-only legacy access; no automatic conversion/deletion or mandatory replacement planning store. | Arndt Gold, PRD owner |
| Shared-backlog writes and pending legacy recovery | before_prd | resolved | New ordinary Run operations cease mandatory writes/locks; explicit supported recovery may complete an already recorded old responsibility without rewriting history. | Arndt Gold, PRD owner |
| Worktree convention and exceptions | before_prd | resolved | New chosen isolation belongs under owning primary checkout .agdf/worktrees/INITIATIVE/ and is ignored there. Reuse assigned worktrees; old locations and explicit alternatives remain supported. No orchestration feature. | Arndt Gold, PRD owner |
| Acceptance and release scope | before_prd | resolved | One Run covers both outcomes and preserves the concurrent CI fix. Required visible tests and exact-candidate integration evidence apply; publication, reinstall and VCS actions remain separately authorized. | Arndt Gold, PRD owner |
| Inventory/persistence/recovery and consumer cutover mechanics | later_sd | deferred | SD must define bounded reads, API compatibility, old journal responsibility, version cutover and rollback before design approval; no hidden product choice is deferred. | SD author under Arndt Gold's design approval |
| Exact scenario, environment and check mapping | later_tp | deferred | TP maps every criterion/design decision to tasks, expected results and evidence, separating focused, mandatory integration and optional broad checks. | TP author under Arndt Gold's plan approval |

Resolved rows state the concrete proposal embodied by this draft and presented for PRD approval. They do not assert a prior separate human approval of this document or of implementation.

## 11. Next Step

Present this exact PRD for deliberate Approval: PRD, revision or rejection. Approval adopts its behavior, scope and criteria and permits only the existing SD stage. It grants no implementation, QA, VCS or release permission.

## AGDF Approval Summary (de; source=en)

- Ziel: Unabhängige Runs sollen ohne verpflichtende gemeinsame Backlog-Pflege bearbeitbar und im Cockpit direkt auffindbar sein. Dazu kommt die einheitliche Regel für neu gewählte Arbeits-Worktrees unter .agdf/worktrees/ des zugehörigen Haupt-Checkouts.
- Umfang: Beide Cockpit-Ansichten verwenden das bestehende Run-Inventar mit Aktiv/Historie, Statusklassen, Aktivität und Titeln. Die Liste zeigt gespeicherte Orientierung; erst das gezielte Öffnen prüft einen Run aktuell. Normale Run-Operationen schreiben und sperren das Masterbacklog nicht mehr verpflichtend. Alte Planungs-/Historienangaben bleiben getrennt und nur lesend zugänglich. Vorhandene Worktrees bleiben erhalten; Automatisierung ihrer Verwaltung gehört nicht dazu.
- AC-001: Kompakte und große Übersicht zeigen denselben Run-Bestand auch ohne Masterbacklog; neue Runs sind direkt auffindbar, fehlerhafte Einträge bleiben als Diagnose berücksichtigt.
- AC-002: Sortierung folgt den bestehenden Aufmerksamkeitsklassen, danach Aktivität und Run-ID. Suche über angezeigten Inventartitel, ID und Status bleibt stabil; Teilabdeckung, Titelrückfall und Zähler sind erkennbar.
- AC-003: Gespeicherter Listenstand, aktuelle Einzelprüfung und Integrität bleiben getrennt. Veraltete Auswahl, fehlender Run, Sitzungsablauf und Ladefehler haben sichere Rückkehr sowie sichtbare Wiederholung oder Neuverbindung.
- AC-004: Das vorhandene Backlog bleibt als optionaler Altbestand mit ursprünglichen Angaben und Quellen lesbar. Seine Fehler blockieren weder Runs noch deren Übersicht; es entstehen keine erfundenen Runs, Freigaben oder automatischen Migrationen.
- AC-005: Erstellung, Erfassung, Freigaben, Updates, interne Fortsetzung und Abschluss funktionieren ohne verpflichtende gemeinsame Backlog-Schreibzugriffe oder dafür erforderliche Sperren. Zwei unabhängige Runs brauchen keine Änderungen an dieser Sammeldatei.
- AC-006: Revisionen, Run-Sperren, exakte Freigaben, Quellbindungen, Wiederholung und historische Nachweise bleiben geschützt. Eine bereits gespeicherte alte Transaktion darf ihre Backlog-Pflicht nur über die vorhandene ausdrückliche Recovery beenden.
- AC-007: Neu gewählte AGDF-Arbeits-Worktrees liegen im ignorierten Ordner .agdf/worktrees/VORHABEN/ des zuständigen Haupt-Checkouts. Zugeordnete Worktrees werden wiederverwendet; alte Orte und ausdrücklich gewünschte Ausnahmen bleiben möglich. Keine automatische Verwaltung und keine behauptete Sperre zwischen Checkouts.
- AC-008: Regeln, Einrichtung, Vorlagen, Core, Transporte, betroffene Paketprojektionen und Dokumentation werden konsistent umgestellt. Gemeinsame bestehende Owner bleiben maßgeblich; Kompatibilität, Versionsübergang und Rückweg müssen vor Umsetzung im SD entschieden sein.
- AC-009: Der parallele CI-Fix mit Branch, Index, Dateien, Baselines, Workflows und Prozessen bleibt unangetastet. Gezielte Prüfungen, verpflichtende Integrationschecks und optionale Volltests bleiben getrennt; vor Integration wird dessen fertiger Stand berücksichtigt. Sichtbare und native Nachweise werden nicht aus Quelltests abgeleitet.
- Entscheidungen: Diese PRD schlägt Aktiv/Historie aus gespeicherten Runs, die bestehende Inventarsortierung, getrennten optionalen Altbestand und die Worktree-Regel einschließlich Bestandsschutz/Ausnahmen vor. Das Produktverhalten ist in dieser Fassung festgelegt; deine PRD-Freigabe nimmt es an. Technische Lese-, Transaktions-, Recovery-, Versions- und Rückwegdetails gehören ins SD, die konkrete Prüfmatrix ins TP. PRD-Owner ist Arndt Gold. Veröffentlichung, Neuinstallation und Git-Aktionen bleiben separat; Umsetzung folgt erst nach den erforderlichen SD-/TP-Freigaben.
- Risiken: Versteckte Backlog-Abhängigkeiten, alte Recovery-Journale und zu breite Listenprüfungen müssen gezielt behandelt werden. Die spätere Abnahme verlangt tatsächliche lesbare schmale/breite Darstellung und klare Fehler-/Wiederholungsszenarien. Der fertiggestellte Vorlagenfix ist Voraussetzung der Planung, keine Umsetzungsevidenz dieser neuen Funktion.
