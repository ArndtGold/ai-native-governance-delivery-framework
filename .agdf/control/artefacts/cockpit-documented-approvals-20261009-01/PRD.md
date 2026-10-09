# PRD: Compact documented approvals with truthful version links

Status: draft
Gate: PRD
Gate approval: open
Owner: Arndt Gold
Date: 2026-10-09
Run: cockpit-documented-approvals-20261009-01
Language: en
Traceability contract: criteria-chain-v1

## Product Scope

Replace the tall stored-approval blocks within the existing selected undertaking's Cockpit with a compact, comparable documented-approval overview. The user sees document, recorded evidence and available document version as distinct information. Broad views use the proposed short columns; narrow views retain equivalent readable per-document rows. The actual recorded count includes supported later approvals, rather than assuming four documents. Original evidence is disclosed deliberately.

The current readers open registered present-day resources and do not certify an exact approved historical version. This slice uses the approved UR's truthful current-version alternative and explains the absent version proof. It adds no historical archive or new version-certification capability. A label claiming a released/approved version is permitted only when the existing canonical evidence/read service demonstrably supports that exact version; the current DTO does not. No later implementation may infer certification from a path, approval status or partial prose digest.

Sources: approved UR; completed BROWNFIELD_REVIEW.md selecting structured_slice; ready UX_INTENT_DEFINITION.md. These analyses inform the PRD without becoming competing product authority.

## UX Intent And Success

- primary_user_intent: Scan documented approvals, inspect evidence and know which version a document action opens.
- success_signal: One comparable row per recorded approval; details remain closed until requested, and today's file cannot be mistaken for the approved historical version.
- primary_decision_or_action: Open documented evidence or read the available document; neither action is an approval.
- ui_ux_impact: medium, bounded to the approval evidence/version presentation.
- human_authority: The user retains deliberate gate decisions through the existing control flow; this view only reads.

## Working Modes And Effective State

| Working mode | Effective state and authority | Visible presentation owner |
|---|---|---|
| Wide overview | Selected Run's documented Core approval facts and registered-source availability; current evaluation is separate. | Existing undertaking approval overview, comparable columns. |
| Narrow overview | Same facts and actions, unchanged authority. | Same overview, readable per-document arrangement. |
| Evidence disclosure | Original stored evidence plus explicitly available or unavailable provenance; no control change. | Deliberately opened evidence detail within its row. |
| Document reading | Current selected registered readable source under existing snapshot/freshness guards. | Existing document reading view with return to initiating action. |
| Missing, blocked or stale reading | Existing availability/selection/freshness owners determine readable actions, without creating evidence. | Existing reading feedback and clearly unavailable document action. |

## Activation, Blockers, Recovery And Transitions

The user opens Dokumentierte Freigaben, activates Dokumentiert to disclose evidence and activates a truthfully named version action to read the registered document. Closing evidence returns to the compact row; closing a document restores focus to its initiating action. Width changes affect arrangement only. Existing reload/retry handles recoverable transient failures; disabled/stale handling prevents use of an invalid source. Missing approved-version proof is explained in the overview/detail, rather than presented as a permission or recovered version. Missing current resources cannot yield working document actions. No documented approvals has an explicit empty state and count zero.

One shared explanatory note says that documented evidence concerns the recorded approval and that the current control evaluation determines today's control status. Repeating this warning for every row is unnecessary. Preserve readable long names/evidence and accessible contextual action names even where the visible repeated action label is short.

## Acceptance Criteria

### Compact comparable overview
- criterion_id: AC-001
- working_mode: wide and narrow overview
- source_state: Zero, four or another supported number of documented approvals, including later supported gates.
- action: Open the documented-approval overview.
- expected_effective_state: Exactly one comparable row per recorded approved gate; the displayed count reflects those facts without inventing missing approvals.
- visible_feedback: Dokumentierte Freigaben with actual count; document, Freigabenachweis and document-version action remain distinct; wide columns and readable narrow rows follow the supplied Soll hierarchy. Four ordinary rows remain a compact scan rather than repeating three vertically separated blocks per document.
- blocker_failure_and_recovery: Zero facts yields an explicit empty state; long names remain readable without horizontal overflow or compressed actions. Existing reload refreshes data, not approval.
- observable_success_and_evidence: Visible wide/narrow cases with zero, four, additional gates and long names verify equivalent information, actual count and compact hierarchy.

### Deliberate truthful evidence disclosure
- criterion_id: AC-002
- working_mode: overview and evidence disclosure
- source_state: Complete, partial or absent stored evidence/provenance for a documented approval.
- action: Activate Dokumentiert, then close its detail.
- expected_effective_state: Original evidence and only actually supported provenance become visible; disclosure changes no approval or current control state.
- visible_feedback: The original record remains inspectable. Version, time, approval, scope/source and identity are shown when evidenced; absent structured facts are explicitly unavailable. Stored prose is not an independently verified identity or signature. A shared note distinguishes documented approval from current control evaluation.
- blocker_failure_and_recovery: Incomplete evidence has explicit limitations; no guessed fields or invented approval. Closing disclosure restores the comparable row.
- observable_success_and_evidence: Keyboard and visible evidence cases inspect original text and absent fields, and confirm that details remain closed until activated.

### Truthful document-version action
- criterion_id: AC-003
- working_mode: overview, evidence disclosure and document reading
- source_state: Current registered document with no certified approved-version relation, changed/moved document, missing/blocked source, or an exact readable source supported by existing canonical proof.
- action: Inspect and activate the available document-version action.
- expected_effective_state: The opened resource and its wording agree. The currently supported resource uses Aktuelle Fassung ansehen and explains that the exact approved version is unavailable or unconfirmed. Freigegebene Fassung ansehen is allowed only for an existing demonstrably matching readable approval-bound version; no new certification/archive capability is required or authorized.
- visible_feedback: A current source never silently inherits the approved-version label from its path, stored status or partial digest. Missing/blocked sources have an explicit unavailable state and no working document action.
- blocker_failure_and_recovery: Existing selected-source and stale guards remain decisive; use existing reload/retry for recoverable reading errors. Absent historical proof stays an honest limitation.
- observable_success_and_evidence: Meaningful unchanged/changed/missing/blocked/unsupported-proof cases verify action wording and actual opened source; tests must not fabricate certification as current production capability.

### Responsive keyboard and focus behaviour
- criterion_id: AC-004
- working_mode: wide/narrow overview, evidence disclosure and document reading
- source_state: Existing Cockpit data with readable long document names and evidence.
- action: Change reading width, navigate with Tab, activate disclosure and document actions with Enter, then close document/detail.
- expected_effective_state: Same facts and usable actions at every tested width; focus returns to the initiating action and reading does not select another Run.
- visible_feedback: Readable labels, clear column/row relationships, contextual accessible names, usable targets and no horizontal overflow, flicker or list/scroll jump caused by this increment.
- blocker_failure_and_recovery: Disabled/stale actions remain disabled; ordinary width changes or closed details do not discard selection. Existing close/reload pathways remain usable.
- observable_success_and_evidence: Actual rendered browser and keyboard checks at narrow/wide widths, including long content, open/close, focus return, scroll and reload.

### Preserve read-only scope and recovery
- criterion_id: AC-005
- working_mode: All approval reading modes and existing surrounding Cockpit areas.
- source_state: Bound selected target/Run/resource/snapshot, including expired or changed source.
- action: Read/disclose/open/close, then exercise existing freshness and retry behaviour.
- expected_effective_state: No control mutation, gate advancement, unrelated Run switch, independent evaluator or persistent archive. Existing freshness, disabled controls, navigation and recoverable-error handling retain their behaviour.
- visible_feedback: Existing current-control and source feedback remains visible and consistent; a documented approval is never permission to proceed now.
- blocker_failure_and_recovery: The existing owners reject stale or unrelated sources and expose their supported next action; new rows do not bypass them.
- observable_success_and_evidence: Relevant existing reader/selection/freshness regressions pass, with scoped state/source checks demonstrating reading adds no writes.

### Bounded verification and protection
- criterion_id: AC-006
- working_mode: Acceptance review of this scoped increment.
- source_state: Meaningful source/version and rendered scenarios plus a checkout containing earlier protected work.
- action: Review the scoped change and its validation evidence.
- expected_effective_state: Every applicable criterion is traced to verification; previous approved sources, the preceding backlog QA and unrelated findings/approvals remain protected.
- visible_feedback: Evidence identifies actual source/component/browser results and separately identifies any fresh native-host observation with its build identity and limits. Missing native observation is explicit and is not substituted by source tests.
- blocker_failure_and_recovery: A failed required check or unsafe scope expansion prevents a clean completion claim and routes to the existing owner. No publication, Git action or global plugin/config change is implicit.
- observable_success_and_evidence: Relevant type/build, behavioural/version and visible/browser regression results, scoped diff/protected-source checks and review evidence. No universal host/platform claim.

## Non-Goals

No gate writer, click approval, signature/independent identity proof, archive, new public read protocol/DTO, persistent store, bulk migration, broad dashboard/backlog redesign, foreign finding closure or edits to approved sources. No plugin installation, global configuration change, commit, push, PR, publication or deployment is authorized by this product slice.

## Users And Roles

Existing repository owner and agents read the selected undertaking. Arndt Gold owns the PRD's product decision. Existing Core control/approval/read services retain effective-state authority; the Cockpit retains descriptive presentation and registered-document navigation. No new user population or host is introduced.

## Constraints

Use existing read-only owners, supported source facts and document names. Retain current selection/resource/freshness/disabled/focus behaviour. Dirty preceding-scope files require a scoped baseline and review, not reset or transferred authority. Technical layout structure, internal organization and test mappings belong to SD/TP. Any unexpected new authority, protocol or persistence requirement requires renewed routing before implementation.

## Evidence Requirements

Use observable source/version scenarios and real rendered wide/narrow keyboard behaviour with original evidence, count and contextual actions. Verify selected source, read-only and protected-source boundaries. Record exact build identity for any native claim; existing historical installation or another Run's stable reading report is not evidence for this future increment.

## Risks And Open Questions

No open product decision blocks this draft. The accepted limitation is that current readers do not expose certified historical versions; retain the current-version fallback. Technical implementation and test detail remain downstream owner decisions. Dense layout and a dirty shared checkout require focused responsive/focus and scope verification.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Compact evidence/version information hierarchy | before_prd | resolved | Approved UR and supplied Soll require comparable document/evidence/version rows with deliberate details. | Arndt Gold |
| Historical proof absent in current reading contract | before_prd | resolved | Use the UR-approved current-version action and explicit limitation; add no archive or new certification contract. | Arndt Gold |
| Scope and release acceptance | before_prd | resolved | Bounded existing Cockpit reading change; verify actual evidence and protect prior work. No publication, installation or Git action. | Arndt Gold |
| Technical row/disclosure arrangement | later_sd | deferred | Existing SD owner chooses the smallest structure preserving the product criteria, readers and focus. | Codex, SD owner |
| Executable scenario and protected-source mapping | later_tp | deferred | Existing TP owner maps every approved criterion to tasks, expected results and concrete evidence. | Codex, TP owner |

## Next Step

Present this exact draft for a new deliberate Approval: PRD. Approval permits the bounded Solution Design, not implementation. No preceding Run response supplies this approval.

## AGDF Approval Summary (de; source=en)

- Ziel: Dokumentierte Freigaben schnell vergleichen, ihre Nachweise prüfen und die tatsächlich geöffnete Dokumentfassung erkennen.
- Umfang: Kompakte Übersicht im bestehenden Cockpit mit Dokument, Freigabenachweis und Fassungsaktion; breite Spalten und gleichwertige schmale Zeilen. Der aktuelle Lesedienst belegt keine exakte historische Fassung: deshalb Aktuelle Fassung ansehen mit ausdrücklichem Hinweis. Kein Archiv, neuer Lesevertrag, Freigabeschreiber oder Eingriff in die frühere Backlog-QA.
- AC-001: Tatsächliche Anzahl und eine kompakte vergleichbare Zeile pro dokumentierter Freigabe; leere und längere Listen bleiben verständlich.
- AC-002: Dokumentiert öffnet vorhandene Originalnachweise bewusst; belegte Angaben bleiben sichtbar, fehlende Angaben ausdrücklich erkennbar. Ein gemeinsamer Hinweis trennt dokumentierte Freigabe und heutige Kontrollauswertung.
- AC-003: Linktext und geöffnete Quelle stimmen überein. Aktuelle Fassung ansehen bei fehlender historischer Bestätigung; Freigegebene Fassung ansehen nur bei bestehendem nachgewiesenem Versionsbezug. Geänderte, fehlende oder gesperrte Quellen erzeugen keine falsche Zusage.
- AC-004: Schmale und breite Anzeige mit langen Namen, Tab/Enter, Öffnen/Schließen und Fokusrückkehr bleiben lesbar und stabil; keine neuen Scrollsprünge oder Flackern.
- AC-005: Lesen und Aufklappen ändern keinen Kontrollzustand. Ziel-, Vorhaben-, Quellen-, Frische-, Sperr- und Wiederherstellungsregeln bleiben wirksam.
- AC-006: Kriterien werden mit passenden Quellen-, Verhaltens- und sichtbaren Browsernachweisen geprüft; native Hostnachweise werden mit tatsächlicher Identität separat benannt. Frühere freigegebene Quellen, Backlog-QA und fremde Befunde bleiben geschützt.
- Entscheidungen: Produktumfang und aktuelle-Fassung-Alternative sind aus der freigegebenen UR geklärt. Technische Anordnung folgt im SD, Aufgaben und Szenarien im TP. Keine Veröffentlichung, Installation oder Git-Aktion. Nach PRD-Freigabe entsteht zunächst das Lösungskonzept.
