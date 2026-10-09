# PRD: Clear backlog status and reliable update flow

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-09
Owner: Arndt Gold
Run: backlog-status-flow-clarity-20261009-01
Language: en
Traceability contract: criteria-chain-v1

## 1. Product Scope

Deliver one understandable saved backlog summary, maintained by existing canonical Core operations and conveyed consistently in Markdown, Core reading and compact/expanded Cockpit lists. Each current supported summary answers: work phase; recorded outcome and concrete open obligation; next permitted action; supporting source and synchronization observation. It remains orientation, not authorization.

The concrete motivating case is a recorded QA revise with QF-001 for current expanded-Cockpit readability. A reader should see QA evidence open and the observation action, rather than interpreting In Progress as implementation or QA pass. This Run does not decide or resolve that other Run's finding.

The product distinction uses the following vocabulary. These are meanings and presentation labels, not a prescribed new schema, component or independent policy. Canonical artefact/control values and exact approval formulas retain their current meaning.

| Canonical observation | English summary meaning | German user-facing meaning |
|---|---|---|
| Current allowed work is a draft/review/implementation internal step | Named current phase plus its open work | Benannte Phase und offene Arbeit, beispielsweise PRD – Entwurf offen |
| Applicable QA phase without a recorded valid report | QA – report pending | QA – Bericht offen |
| QA revise with valid evidence-only obligations | QA – evidence open | QA – Nachweis offen |
| QA revise with implementation correction | QA – correction open | QA – Korrektur offen |
| QA revise requiring an upstream source decision | QA – source decision required | QA – vorgelagerte Entscheidung offen |
| Current QA block or blocking source limitation | QA – blocked; or source cannot substantiate status | QA – blockiert; oder Stand nicht belegbar |
| QA pass, exact QA approval not yet recorded | QA passed – approval pending | QA bestanden – Freigabe offen |
| Exact QA approval recorded, further permitted work remains | Actual next phase/action; QA approval remains inspectable | Tatsächliche Folgephase und nächster Schritt; QA-Freigabe in Quellenangaben |
| UAT or closeout is current and incomplete | UAT – approval pending; or closeout pending | UAT – Freigabe offen; oder Abschluss offen |
| Explicit supported canonical completed closeout | Completed and recorded outcome | Abgeschlossen mit gespeichertem Ergebnis |

Several open obligations must not be collapsed into a falsely singular resolved state. Show the decisive permitted action and disclose other open obligations/count or source detail. Mixed/invalid normalized findings follow the existing most restrictive authoritative route, with their source limitation disclosed. A specific action is taken only from registered, validated authoritative evidence or a legitimate current Run-specific action; it must remain compatible with the effective control policy. Unstructured report prose alone cannot promote readiness.

Keep existing section identity, row identity, links, order and bounded stored-field search behavior. Compact rows show a concise phase/open-work summary and the next action without requiring expansion; expanded rows show the same meaning at readable length. Supporting technical identity, original stored fields and source observations stay inspectable. Titles and incidental document loading cannot change status or section membership.

Older compact and thirteen-column layouts remain readable. Existing rows with no verified synchronization correspondence remain explicitly saved/unverified, with their original values preserved. No bulk migration, reclassification or Run/report scan happens when opening the list. A separately authorized canonical operation or explicit scoped pointer synchronization updates the addressed row. Unsupported or ambiguous layouts/sources produce existing reason-bearing limitations rather than a guessed current state. SD decides compatible representation within these promises.

## 2. UX Intent And Success

- ui_ux_impact: medium
- ux_intent_definition: .agdf/control/artefacts/backlog-status-flow-clarity-20261009-01/UX_INTENT_DEFINITION.md; decision ready
- primary_user_intent: Identify which undertaking needs attention, the concrete obligation and its permitted next action without interpreting several reports.
- success_signal: The same bound observation gives the same understandable answer in saved Markdown/Core and both Cockpit surfaces; saved versus evaluated/unverified information is distinguishable.
- primary_decision_or_action: Select a relevant undertaking and inspect its current bound Run before governed action. Approval/implementation authority remains in the existing flow.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Saved Markdown backlog | Summary at recorded synchronization; unverified rows retain saved values | phase, outcome/open work, next action, source correspondence/limitation | Existing canonical Run/evidence owners produce the summary; backlog is a saved pointer | Addressed Markdown row and its references |
| Compact Cockpit overview | Same saved meaning for visible subset/query | concise phase/open work and next action, inspectable sources | Same Core-owned saved observation | Compact undertaking row |
| Expanded Cockpit list | Same saved meaning for current section/query | readable summary and next action, source detail | Same Core-owned saved observation | Expanded undertaking row |
| Selected Run | Current bound evaluated control state | gate, current permitted work, evidence/approval missing, saved disagreement | Existing Core evaluation, sole qa-gate decision and exact human approval | Existing selected Run detail/card |
| Partial/unavailable/stale read | Explicit limitation, never fabricated current readiness | reason, preserved safe saved data when available, recovery action | Existing bounded read/diagnostic owners | Affected row and read feedback |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Existing Cockpit open, section/query selection and explicit Run selection; return/close ends viewing only. A new observation invalidates old selectors, never changes lifecycle. Reading Markdown or UI is read-only.
- blockers_and_visible_next_actions: Missing/unsafe/invalid sources, report disagreement, duplicate identity, unsupported layout, stale observation and skipped/failed synchronization are named with the existing repair/evidence owner and next action. QA revise can mean useful permitted evidence work; it is not automatically an unavailable list or a code-remediation assignment.
- recovery_paths: Visible retry/reload for transient read failures and stale observations; explicit scoped writer repair/synchronization for pointer problems. Preserve legitimate control success when the existing contract allows backlog skip, disclose the skip reason, and do not label the pointer synchronized. Existing transaction recovery remains required before dependent writes/claims. UI read/retry never mutates control or approves.
- relevant_state_transitions: Draft/report/internal-step recording, exact approvals, applicable closeout and explicit pointer synchronization refresh only their addressed saved summary. QA missing → revise → pass → exact approval retain distinct outcome/approval states. Actual next phase follows current canonical route, including compact routes without formal QA. Repetition/equivalence is idempotent; interruption/concurrency preserves foreign rows or explicitly stops for recovery. Source disagreement does not invent completion. Scrolling/title loads preserve the query and interpretation until deliberate refresh.

## 5. Acceptance Criteria

### Saved summary answers the user's question

- criterion_id: AC-001
- working_mode: Markdown, compact overview, expanded list
- source_state: Supported addressed row synchronized from its canonical Run and valid registered evidence.
- action: Record an applicable canonical transition and read the resulting row.
- expected_effective_state: One saved summary identifies current phase, outcome/open obligation, permitted next action and supporting observation. The specific QA-readability example conveys evidence work and observation/reassessment.
- visible_feedback: Phase/open-work label and concrete next action appear in both row presentations; identity and sources are inspectable.
- blocker_failure_behavior: Missing/invalid authority cannot create a concrete readiness or resolved-obligation claim.
- recovery_next_action: Inspect the named source/owner, collect or correct the required input and use existing explicit recording/synchronization.
- observable_success: A reader can answer where/what/next/source consistently without independently interpreting report prose.
- required_evidence: Bound transition fixtures and Markdown/Core assertions; compact/expanded visible narrow/wide observations for the motivating case and multiple obligations.

### QA outcome, approval and lifecycle remain distinct

- criterion_id: AC-002
- working_mode: All saved summary surfaces and selected Run detail
- source_state: Representative report missing, revise evidence/correction/upstream, block, pass before approval, recorded QA approval, UAT/closeout pending and completed cases; applicable compact routes.
- action: Read each corresponding saved/evaluated observation.
- expected_effective_state: Labels have the Product Scope meanings; report presence is not pass, pass is not human approval, and approval is not completion. Compact routes acquire no fictional QA/UAT requirement.
- visible_feedback: Correct phase/open work and next action; exact recorded approvals/outcomes remain inspectable.
- blocker_failure_behavior: Contradictory or invalid findings/report decisions disclose inability to substantiate the requested summary and the most restrictive existing route.
- recovery_next_action: Follow the canonical evidence/source decision or exact human gate; no automatic approval/archive.
- observable_success: No tested case misstates quality, approval readiness/recording, lifecycle or allowed work.
- required_evidence: Product state matrix through actual Core transition owners, registered report/finding negative cases and visible representative rows.

### Meaning and action have one authoritative owner

- criterion_id: AC-003
- working_mode: Canonical operation and subsequent saved/selected reading
- source_state: Plain policy action, legitimate Run-specific action and valid normalized QA evidence can carry different detail.
- action: Produce the saved summary for the same bound Run/evidence.
- expected_effective_state: Existing Core owns validated meaning and next-action precedence; specific permitted evidence work is retained without authorizing an incompatible action. The saved summary and current evaluation do not introduce conflicting routes.
- visible_feedback: Decisive concrete action plus source/other-open-work disclosure; disagreement is explicit.
- blocker_failure_behavior: Missing, malformed, stale, foreign or conflicting authority cannot silently override policy or be inferred from free-form prose.
- recovery_next_action: Existing source/evidence owner resolves the diagnostic, then records and reevaluates.
- observable_success: Markdown, Core, HTTP/MCP and UI present the same summary; no consumer independently evaluates gates or accepts approvals.
- required_evidence: Architecture trace and design mappings; common-owner and boundary tests, Run-specific/action precedence and malformed/foreign/changed-source scenarios.

### Canonical updates are truthful and recoverable

- criterion_id: AC-004
- working_mode: Existing writers, explicit synchronization and operation feedback
- source_state: Applicable report/artefact/internal-step/approval/closeout transitions; equivalent repeats; concurrent Runs; pending or interrupted transactions.
- action: Execute a supported operation, repeat it or recover interruption through the existing canonical path.
- expected_effective_state: Addressed saved summary corresponds to its bound committed Run/evidence observation. Foreign updates are preserved; repetitions do not fabricate revisions or approvals; commit and dependent recovery are distinguished.
- visible_feedback: Updated/unchanged/skipped/recovery/rejected outcome with the reason needed to know whether the pointer synchronized.
- blocker_failure_behavior: Existing skippable pointer limitations preserve justified control success while explicitly leaving synchronization unfulfilled; strict errors/pending foreign transactions stop dependent work.
- recovery_next_action: Existing exact Run/revision recovery or scoped synchronization/repair, with no unbound batch modification.
- observable_success: No silent lost foreign row, transferred approval, false synchronized result or inconsistent post-recovery summary.
- required_evidence: Writer transition coverage, idempotence, fault injection around actual commit stages, concurrency/foreign-conflict tests and skip/recovery response checks.

### Provenance and freshness claims remain bounded

- criterion_id: AC-005
- working_mode: Saved file/list, source details and selected current Run
- source_state: Current synchronized summary, older/unlinked unverified row, changed source, missing/unsafe report or Run, unsupported/ambiguous pointer/layout and stale capture.
- action: Read saved data, deliberately select a Run or reload after failure.
- expected_effective_state: Synchronization/source correspondence is inspectable; saved observation is distinct from newly evaluated current state. Opening a list requires no report scan and never claims older rows are verified current.
- visible_feedback: Recorded observation/source identity or saved/unverified limitation; current selected mismatch is named. Partial/unavailable feedback is accessible.
- blocker_failure_behavior: Contradictory or unavailable sources yield explicit limited/unavailable status, never invented freshness or automatic repair.
- recovery_next_action: Visible reload/retry for recoverable read failures and existing owner-specific repair for durable problems.
- observable_success: A user can identify what was observed and what remains unverified; one snapshot does not mix stale and current identities.
- required_evidence: Bound snapshot/digest/source-disagreement tests, unsafe/missing/ambiguous cases and visible retry/reload/limitation observations.

### Older entries keep compatible meaning and identity

- criterion_id: AC-006
- working_mode: Existing compact and thirteen-column Markdown/Core/list reads and explicit updates
- source_state: Existing supported layouts, arbitrary saved legacy status, unlinked/planned/archived rows and neighboring Runs.
- action: Open/filter the list or update a uniquely addressed active row through an applicable canonical writer.
- expected_effective_state: Original saved fields remain inspectable; old values remain unverified until explicit canonical synchronization. Supported reads and per-layout link/title behavior remain compatible. Existing section placement changes only through a permitted closeout operation.
- visible_feedback: Clear saved/limited meaning rather than silently relabelled historical values; existing counts/search operate on stored fields.
- blocker_failure_behavior: Unsupported/duplicate identity is diagnosed; no unrelated row rewrite or automatic migration/archive.
- recovery_next_action: Existing explicit scoped repair/update, with the unsupported layout explained.
- observable_success: Supported old/new observations render truthfully and unrelated identity, order, links, title and section are preserved.
- required_evidence: Compact/legacy compatibility fixtures; exact protected-row preservation; stored search/section and source-limit tests; visible older-row case.

### Presentation is readable and stable

- criterion_id: AC-007
- working_mode: Compact and expanded list at narrow and wide widths, keyboard/screen-reader feedback, failed/stale read
- source_state: Current readable rows, long action/source values, delayed supplementary title loading and partial data.
- action: Inspect, filter, scroll, select and retry/reload a recoverable read.
- expected_effective_state: Summary and next action remain readable without opening details; detail adds provenance. Incidental loading does not alter completed query, membership or status, shift list controls or reset scrolling/focus.
- visible_feedback: Accessible status/limitation and explicit recoverable retry; stable row identity and selection; no clipping of decision-relevant content.
- blocker_failure_behavior: Partial/unavailable content is named and safe saved fields remain usable where supported.
- recovery_next_action: Visible existing retry/reload or inspectable source repair action.
- observable_success: Both views communicate the same observed meaning at representative sizes with stable scroll/query/focus and read-only behavior.
- required_evidence: Meaningful component/browser interaction regressions and rendered narrow/wide observations; actual installed/native evidence for any claim about that path, independently labelled.

### Architecture, compatibility and evidence are reviewable

- criterion_id: AC-008
- working_mode: Architecture/design/plan/review documentation and resulting control path
- source_state: Reviewed current owners and BF-01–06; approved product requirements before implementation.
- action: Map requirements through SD/TP and verify delivered scenarios.
- expected_effective_state: Actual operation → Run/evidence → saved summary → Core read → HTTP/MCP → UI ownership, update triggers, compatibility, freshness, concurrency and failure/recovery are decided before implementation. Reuse existing owners without a parallel store, evaluator or gate.
- visible_feedback: Documentation explains final status meanings and user-visible limitations; review/QA distinguishes source/automated/protocol/browser/native and host qualification evidence.
- blocker_failure_behavior: Missing product/design/plan mapping or unproven host claims route to their existing authoritative owner; never imply a pass from incomplete evidence.
- recovery_next_action: Revise the affected existing artefact or collect its exact evidence obligation.
- observable_success: Every criterion and material design decision has traceable executable validation; docs and verified behavior agree within explicitly stated limits.
- required_evidence: Completed review and SD/TP mappings; operation/test/evidence inventory; updated architecture/user documentation; normalized review findings and scoped QA assessment.

## 6. Non-Goals

No second control store/evaluator, independent UI status policy, new approval gate, changed gate order or exact approval semantics. No automatic delivery continuation, QA/UAT approval, release, archive, VCS, bulk backlog migration, list-wide Run/report scanning or broad dashboard redesign. No other Run's QA-finding closure or changed approved sources. Earlier opt-out UI changes remain baseline and require separation from this increment's proof.

## 7. Users And Roles

Repository owner and agents use saved orientation; Cockpit users inspect existing compact/expanded views. Arndt Gold owns product intent and deliberate gate approval. Existing Core evaluation/write/read owners own control-derived meaning and persistence. qa-gate alone decides final quality. Presentation and this PRD draft grant no authorization.

## 8. Constraints

Preserve exact target/Run/revision/report binding, seals, locks, transaction recovery and legitimate control/pointer independence. Reuse bounded read capture, safe registered resources and existing operation result/diagnostic paths. Preserve old layout reading, intentional section placement and stored-field search, and do not weaken accessibility or query/scroll stability. Canonical artefacts are English with complete German approval summary; product labels convey the meanings above consistently in the supported presentation languages. Do not represent local tests/browser evidence as current native/remote/multi-host qualification.

## 9. Evidence Requirements

TP must name observable scenarios and evidence for every criterion, including negative source/decision cases and actual canonical write/recovery boundaries. Mandatory reviews/QA assess those observations against the sole PRD criteria. Existing tests are reusable foundations, not proof of this new behavior. Current native observations are necessary whenever claiming installed native readability; absence is explicit and routes to evidence collection. No release/host rollout is added merely to satisfy local source scope.

## 10. Risks And Open Questions

The distinction between valid Run-specific detail and policy permission must not be lost; QA evidence source parsing must stay with its current bounded owner. Persisted meaning and observation correspondence require explicit compatibility treatment. Existing skip outcomes cannot become silent freshness promises. Dirty baseline UI paths and adjacent governed Runs require exact change/evidence attribution. No material product choice is outstanding; representation, writer-safe derivation, compatibility encoding and test execution are named later owner decisions below.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Summary meaning and compact visible action | before_prd | resolved | Product Scope vocabulary distinguishes phase, recorded outcome/open work, exact approval and completion; both views show concrete next action. Source detail is inspectable and never authorizes. | Arndt Gold; PRD owner |
| Compatibility and update promise | before_prd | resolved | Keep supported compact/legacy reads and original stored values; older/unlinked rows are saved/unverified until explicit scoped canonical update. No bulk migration, automatic classification or reader writes. | Arndt Gold; PRD owner |
| Acceptance and authority | before_prd | resolved | Eight stable criteria; canonical existing owners and sole qa-gate/human approval semantics; QF-001 in the example Run remains outside this Run's closure authority. | Arndt Gold; PRD owner |
| Delivery/release acceptance | before_prd | resolved | Local source/protocol/browser and actual host evidence are labelled separately; required current native readability is not inferred. No release, installation rollout, VCS or multi-host qualification in this product scope. | Arndt Gold; PRD owner |
| Summary representation, source correspondence and precedence | later_sd | deferred | Select compatible representation in existing owners; specify bounded registered evidence reuse, action precedence and revision/digest synchronization without a second store/evaluator. | sd-definition; existing Core evaluation/write/read owners |
| Operation coverage, strict/skip and recovery design | later_sd | deferred | Enumerate applicable report/internal-step/approval/closeout/sync paths and commit/recovery contract; preserve justified skip with explicit diagnostic. | sd-definition; existing Core writer/transaction owners |
| Executable scenarios and evidence attribution | later_tp | deferred | Map every criterion/design decision to tasks, expected results and concrete evidence, separating baseline UI deltas and native proof. | Existing Task/Test Plan owner |

Resolved product rows are proposed product choices grounded in approved intent for review in this draft; they do not assert that Arndt Gold has already approved PRD.

## 11. Next Step

Canonically record this draft derived_from the exact approved UR. After fresh readiness and presentation, obtain a new deliberate Approval: PRD, request revision or decline. Valid PRD approval permits only SD drafting; implementation still requires later approved SD/TP and preparation.

## AGDF Approval Summary (de; source=en)

- Ziel: Direkt erkennen, in welcher Phase ein Vorhaben steht, was konkret offen ist, welcher Schritt erlaubt ist und welche Quelle die gespeicherte Aussage trägt. Die UR ist freigegeben; Architektur-/Ablaufprüfung und erforderliche UX-Analyse sind dokumentiert.
- Umfang: Zuerst wird das Backlog durch seine bestehenden Core-Owner klar und verlässlich gepflegt. Markdown, Core und kompakte/große Cockpit-Ansicht vermitteln denselben gespeicherten Sinn. Beide Karten zeigen Phase, offene Aufgabe und nächsten Schritt direkt; Quellen bleiben aufklappbar. „QA – Nachweis offen“ unterscheidet sich von „QA – Korrektur offen“, „QA – blockiert“ und „QA bestanden – Freigabe offen“. Freigabe und Abschluss bleiben getrennt.
- AC-001: Die gespeicherte Zusammenfassung beantwortet Phase, offene Aufgabe, nächsten erlaubten Schritt und Quellenstand. Im Beispiel erklärt sie die noch erforderliche Cockpit-Lesbarkeitsbeobachtung und QA-Neubewertung, ohne das fremde Finding zu schließen. Mehrere offene Verpflichtungen bleiben erkennbar.
- AC-002: Fehlender Bericht, QA-Nachweis/Korrektur/vorgelagerte Entscheidung, blockiert, bestanden vor Freigabe, erteilte Freigabe mit Folgearbeit, UAT/Abschluss und abgeschlossen sind unterscheidbar. Kompakte Routen erhalten keine erfundenen QA/UAT-Pflichten; widersprüchliche Quellen erzeugen keine behauptete Bereitschaft.
- AC-003: Bedeutung und konkrete Aktionen haben einen bestehenden kanonischen Core-Owner. Gültige Run-spezifische Details und registrierte QA-Aufgaben bleiben mit der erlaubten Route vereinbar. HTTP/MCP und React stellen dar; freie Berichtstexte oder UI-Regeln entscheiden keine Gates.
- AC-004: Relevante Berichte, Artefakte, interne Schritte, Freigaben, Abschluss und ausdrückliche Zeigerkorrektur aktualisieren den zugeordneten Eintrag mit gebundenem Prüfstand. Wiederholung, Unterbrechung und parallele Arbeit verlieren keine fremden Updates oder Freigaben. Übersprungene Aktualisierung und Recovery sind ausdrücklich erkennbar; bestehende Kontroll-/Zeiger-Unabhängigkeit bleibt begründet erhalten.
- AC-005: Gespeichert, neu ausgewertet, unbestätigt, veraltet oder nicht verfügbar sind unterscheidbar. Quellenbindung ist prüfbar; die Liste scannt keine Runs/Berichte. Fehlende, unsichere, widersprüchliche oder mehrdeutige Quellen behaupten keine Aktualität. Wiederholbare Lesefehler bieten sichtbares Neuladen/Retry; Lesen repariert nichts.
- AC-006: Kompakte und ältere 13-spaltige Tabellen bleiben lesbar. Alte Werte bleiben gespeichert/unbestätigt bis zur ausdrücklichen kanonischen Aktualisierung. Identität, Links, Titel, Reihenfolge, gespeicherte Suche und beabsichtigter Bereich bleiben erhalten; keine automatische Migration oder Archivierung.
- AC-007: Beide Ansichten sind schmal/breit lesbar und zugänglich, einschließlich langer Schritte, Quellen und Fehlerhinweisen. Scrollen oder Titel-Nachladen verändert weder Suche, Status, Bereich noch Scroll-/Fokusposition. Aktuelle native Darstellungsbehauptungen brauchen tatsächlich beobachtete Hostevidenz.
- AC-008: Architektur und Flow werden vor Umsetzung bis zu Ownern, Quellen, Triggern, Kompatibilität, Aktualität, Parallelität und Recovery entschieden und über SD/TP nachvollziehbar geprüft. Dokumentation und QA trennen Quellen-, automatisierte, Protokoll-, Browser- und native Evidenz; es entsteht keine zweite Statushoheit oder Ablage.
- Entscheidungen: Die Produktwahl ist im Entwurf aufgelöst: obige Zustandsbedeutung, direkt sichtbare nächste Aktion, kompatible Altwerte und ausdrücklich begrenzte Aktualitätsaussagen; acht Abnahmekriterien, bestehende Zuständigkeiten und keine Veröffentlichung. Arndt Gold bleibt PRD-Owner; diese Wahl wird erst durch neue PRD-Freigabe verbindlich. SD entscheidet Repräsentation, Quellenbindung/Aktionsvorrang und Schreib-/Recovery-Abdeckung; TP entscheidet ausführbare Szenarien und Evidenz. Die Analyse führt wegen gespeicherter Bedeutungs-/Dateivertragsänderung über structured_delivery, ohne neues Gate.
- Grenzen und Risiken: Keine neue Kontrollablage/Policy, geänderte Freigabesemantik, automatische Fortsetzung, QA/UAT, fremde Finding-Schließung, Massenmigration, Archivierung, Veröffentlichung oder Git-Aktion. Vorhandene UI-Korrekturen bleiben getrennter Ausgangsstand. Quellen-/Aktionsvorrang, Kompatibilität und sichtbare übersprungene Updates benötigen das konkrete SD; lokale Tests ersetzen keine aktuelle native Beobachtung.
- Nächster Schritt: Dieses PRD prüfen, neu bewusst mit Approval: PRD freigeben, Überarbeitung verlangen oder ablehnen. Danach ist SD-Erstellung erlaubt; Umsetzung erfordert weiterhin SD-/TP-Freigabe und Vorbereitung.
