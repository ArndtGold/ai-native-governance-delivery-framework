# PRD: Compact documented approvals with truthful version links

Status: draft
Gate: PRD
Gate approval: open
Owner: Arndt Gold
Date: 2026-10-10
Run: cockpit-documented-approvals-20261009-01
Language: en
Traceability contract: criteria-chain-v1

## Product Scope

Replace tall stored-approval blocks and inline expanding approval entries with a compact document overview. There are two semantic columns: document with icon and short state text, and one truthfully named document-reading action. Draft and approved documents are visible together where actually registered for the selected undertaking. There is no separate Freigabe ansehen destination. The document opens in the existing large reading view, where applicable findings and original stored approval information explain its state.

Canonical Core approval/source proof and authoring checks determine the meaning; the App consumes bounded descriptive results. The current reader needs the smallest compatible addition to explicitly confirm whether the actual readable version matches its documented approval. It must not infer this from an approval flag, a registered path, partial prose digest or headings. This capability describes existing authority and never changes approval policy, authoring rules or permission to work.

Derivation: approved revised UR sha256:db2ce267f9330751e0eb6c27027fba09b0be3e19889dff206423025b7e1a6495; completed renewed Brownfield Review selects structured_delivery for externally consumed descriptive contract compatibility; renewed ready UX Intent Definition. These analyses are subordinate inputs. Earlier inline design, approvals and tests are historical and retained for reassessment, not this product authority.

## UX Intent And Success

- primary_user_intent: Understand each undertaking document's evidenced state and read it with one action.
- success_signal: Two comparable columns, visible icon plus short text, truthful draft/approved/current-version action and understandable findings in the large reading view.
- primary_decision_or_action: Open a document; deliberately request the existing current draft check when supported. Neither action approves a gate.
- human_authority: Deliberate gate decisions remain in the existing control flow; passed authoring checks never mean human approval or QA pass.
- ui_ux_impact: medium; document-state presentation and navigation change within existing surfaces.

## Working Modes And Effective State

| Working mode | Effective state authority | Visible presentation owner |
|---|---|---|
| Wide document overview | Current bounded Core document registration, source/approval correspondence and applicable check facts. | Two comparable document/state and reading-action columns. |
| Narrow document overview | Same facts and actions, same authority. | Equivalent readable document rows with usable targets. |
| Document reading | Exact selected registered readable resource in the current bounded snapshot; matching descriptive state and findings. | Existing large reading view, contextual state and original document. |
| Deliberate current draft checking | Existing supported current-gate authoring check, bound to exact target/Run/source/revision. | Existing check action/progress/retry area and the matching document row/context. |
| Unavailable, stale or unconfirmed state | Existing source/freshness/session/check owners; absence never means a positive result or defect. | Existing read feedback plus a specific row limitation and supported next action. |

## State And Action Semantics

| Evidenced condition | Row feedback | Reading action |
|---|---|---|
| Exact readable current version positively confirmed by canonical approval/source proof | Check icon plus Freigegeben | Freigegebenes Dokument ansehen, contextualized by existing readable document type, e.g. Freigegebenes Lösungskonzept ansehen or Freigegebenen Taskplan ansehen. |
| Unapproved current document with no applicable completed check | Neutral icon plus Entwurf; unknown or invalidated previous check is not passed | Entwurf ansehen. |
| Unapproved current draft and an applicable passed authoring check | Check icon plus Entwurf geprüft; approval still pending | Entwurf ansehen. |
| Unapproved current draft with concrete applicable authoring defects | Warning icon plus Überarbeitung nötig | Entwurf ansehen; concrete matching findings appear in reading context. |
| Current draft whose check is unsupported, inconclusive or technically unavailable | Question/neutral icon plus Prüfung nicht verfügbar; retain known draft identity | Entwurf ansehen if still safely readable; explicit retry/check/reopen recovery only where existing owner supports it. |
| Earlier documented approval but current version correspondence unconfirmed, invalid or changed | Uncertainty icon plus Freigabe dieser Fassung nicht bestätigt; earlier recorded approval remains identifiable | Aktuelle Fassung ansehen if safely readable. |
| Source/session is missing, blocked, expired or stale | Explicit unavailable/previous-observation feedback; no current confirmed/defective claim | Disable unavailable actions; preserve existing reload/reopen feedback. |

Transient explicit checking may show Prüfung läuft through the existing check owner; it is not a new approval state. An evidenced approved version does not need an authoring check to remain approved; an unsupported check must not override valid approval proof. Only the exact supported draft gets passed/defective check status. For a changed source, a previous result loses applicability. An unapproved readable source can return to Entwurf with an explicit no-current-check note; source uncertainty itself remains Prüfung nicht verfügbar rather than a guessed defect. Original document metadata is shown as original and never overrides the canonical descriptive state.

## Activation, Blockers, Recovery And Transitions

Select an undertaking and scan its document rows. Activate the contextual reading action to open that selected document in the existing large view; compact activation uses existing supported expansion. Close/back returns to the initiating document action, or existing fallback if removed. Width changes affect arrangement only, without expanding individual entries, losing focus or changing state meaning.

The document area is labelled Dokumente with its actual displayed entry count, not a count of approvals. Scope includes supported registered user-gate documents, principally UR/PRD/SD/TP and later gate documents when actually registered. Run State, binding proofs and analytical reports remain available through their existing source owners but are not invented as gate-document rows. Each distinct registered document reference has one contextual entry; multiple same-type registrations remain distinguishable. Missing/blocked registered references have explicit feedback and are counted as entries, not working readable documents. Unregistered drafts cannot acquire a document link from filesystem discovery; absent registrations do not become fabricated rows.

Within the large document view the user sees the evidenced document state, relevant concrete current authoring findings and available original stored approval information. Plain explanations precede technical provenance. Missing time/person/exact version/basis is explicitly unavailable; a name/date-like substring is not independently verified identity. No separate approval-reading route, archive or reconstructed historical source is introduced. Existing source/provenance/original-document disclosures may remain inside document reading; the no-expansion requirement concerns the overview entries.

Existing deliberate Entwurf prüfen stays the check action. Opening/rendering/reloading the overview does not silently run checks for every document, write control or approve gates. Busy/timeout/read failure has supported explicit retry; changed source requires reload then deliberate applicable recheck; expired session uses existing reopen path. Unsupported gates/invalid proof/foreign source/missing structured fact remain unavailable or uncertain with no guessed green state. Current document/check state loses applicability on source/revision/selection invalidation even if a previous result exists.

## Acceptance Criteria

### Two-column actual-document overview
- criterion_id: AC-001
- working_mode: wide and narrow document overview
- source_state: Zero, four or another number of supported registered selected-Run gate documents; draft, approved, missing/blocked and long-name entries.
- action: Open and scan the document section.
- expected_effective_state: Exactly one entry per actual distinct registered document reference; no invented missing approvals/documents or duplicate count from evidence rows.
- visible_feedback: Dokumente with actual entry count; document name with readable icon/state text in the first column, one contextual action or explicit unavailable reading feedback in the second. No expanding overview entries and no separate Freigabe ansehen action. Multiple same-type documents are distinguishable.
- blocker_failure_and_recovery: Zero entries has explicit empty feedback; missing/blocked references have no working action. Long names/actions wrap without horizontal overflow. Existing reload refreshes the selected observation.
- observable_success_and_evidence: Built visible narrow/wide zero/four/additional/missing/multiple/long cases demonstrate compact hierarchy, exact count and the same actions.

### Evidenced document and draft-check states
- criterion_id: AC-002
- working_mode: document overview, deliberate draft checking and unavailable/stale observation
- source_state: Canonically confirmed approval, unchecked current draft, applicable passed check, concrete applicable authoring findings, unsupported/inconclusive/technical failure, invalidated result or unconfirmed earlier approval.
- action: Observe the row and deliberately run/repeat the existing supported current check where available.
- expected_effective_state: Row state follows Core facts and applicability; authoring pass is not approval/QA, and technical absence/failure is not a document defect.
- visible_feedback: State/icon/text agrees with the State And Action Semantics table. Overarbeitung is labelled Überarbeitung nötig only for concrete applicable authoring findings; the uncertainty of current approval is explicit without discarding earlier recorded approval. Prüfung läuft can reflect a deliberate pending request.
- blocker_failure_and_recovery: Invalid/foreign/changed target/Run/revision/source results cannot install a checked or defective badge. Missing support/old-server absence gives uncertainty. Busy uses explicit retry; changed source uses existing reload and deliberate recheck.
- observable_success_and_evidence: Core projection/authoring cases and visible consumer cases verify every state, concrete failure versus busy/unavailable, no automatic bulk check and invalidation on source changes at unchanged revision.

### Exact version and truthful reading action
- criterion_id: AC-003
- working_mode: overview and document reading
- source_state: Confirmed approval/source correspondence, unapproved draft, changed/moved current document, absent/partial/malformed/foreign proof or missing/blocked registered source.
- action: Inspect and activate the contextual document action.
- expected_effective_state: Opened registered resource identity/content and label agree. Approval wording requires explicit canonical confirmation for those readable bytes; uncertainty uses current-version wording and preserves documented earlier approval.
- visible_feedback: Entwurf ansehen, contextually named approved-document action or Aktuelle Fassung ansehen with Freigabe dieser Fassung nicht bestätigt, according to evidenced state. Registration and prose/partial digest alone never certify a version.
- blocker_failure_and_recovery: Missing/blocked source disables reading; malformed/unknown proof yields uncertainty instead of approval. Moving/changing a file cannot inherit a certified label without existing canonical proof. Explicit reload/retry uses current registered source.
- observable_success_and_evidence: Real current-document byte comparison and exact proof/moved/changed/missing/foreign/malformed cases through shared Core and MCP/HTTP readers; visible action wording matches the opened document.

### Understandable large reading view and return
- criterion_id: AC-004
- working_mode: document reading from compact or expanded overview
- source_state: Readable selected document with applicable authoring findings, documented original approval or missing provenance.
- action: Open document, inspect its state/findings/approval context, then close/back using keyboard.
- expected_effective_state: Existing large reader opens the document as the only destination; matching findings and supported approval information are visible without invented provenance or separate approval navigation.
- visible_feedback: Plain state explanation, concrete current findings and available original recorded approval text; absent exact version/time/person/basis explicitly unavailable. Existing source/original disclosures inside reading remain possible.
- blocker_failure_and_recovery: Long text safe/readable, incomplete evidence honestly limited, source reading failures follow existing retry. Stale current permission is not asserted. Return restores initiating action focus or an existing sensible fallback after removal.
- observable_success_and_evidence: Built compact/expanded navigation, actual source read, narrow/wide keyboard/close/back/focus, scroll/reload, long/passive text and absent-provenance observations.

### Canonical owner, compatible reads and no mutation
- criterion_id: AC-005
- working_mode: Core/MCP/HTTP descriptive reads, document/check lifecycle and uncertain old-server mode
- source_state: Valid current facts, stale/expired/foreign/malformed response, prior compatible consumer and reader without added descriptive fields.
- action: Read list/document, explicitly check, navigate/reload/retry.
- expected_effective_state: Existing canonical approval/source/authoring owners remain sole semantic authority; descriptive read result is tied to target/Run/resource/digest/revision and validated by consumers. No App-side approval evaluator, new writer or parallel validator.
- visible_feedback: Same state meaning in compact/expanded/MCP/browser views. Missing new facts keep reading compatible where safely possible but cannot produce approval/checked/defect claims. Prior registered/blocked resource semantics remain unchanged.
- blocker_failure_and_recovery: Strict identity and freshness prevent cross-Run/resource adoption, stale check resurrection or later response overwrites. Supported existing retries/session expiry remain unchanged; unsupported results use uncertainty.
- observable_success_and_evidence: Core/transport/schema negative and compatibility cases, shared MCP/HTTP meaningful checks and byte-equal control windows verify no approval/control mutation, implicit bulk checks or unrelated selection changes. Adjacent draft-check/reading/context cleanup regressions remain intact.

### Qualified evidence and protected scope
- criterion_id: AC-006
- working_mode: preparation, implementation qualification and review
- source_state: Revised approved sources, retained old-design implementation/tests, protected other-Run/control/history files and new qualified builds.
- action: Capture scoped baseline, implement only renewed approved TP, execute mapped checks and review actual increment.
- expected_effective_state: Relevant UI/Core/descriptive-contract work is fully mapped and tested; retained work is reassessed, archived approvals are historical and foreign sources remain unchanged.
- visible_feedback: Evidence identifies exact approved sources/builds, scenario results and limits; browser/source/protocol observations are distinguished from fresh native-host proof. No transfer of another Run's QA or observations.
- blocker_failure_and_recovery: Missing mandatory mapped test/compatibility/visible evidence prevents fulfilled criteria/QA. Native observation is reported if actually supported; its absence is explicit and does not authorize installation/config changes or imply native proof. Old inline tests cannot substitute for new-state checks.
- observable_success_and_evidence: Source/protected hashes, scoped actual incremental diff, approved TP mappings, qualified production builds, passing required automated/protocol/built browser checks and mandatory plan/clean/code review. Browser verification is the mandatory visible baseline; a fresh native-host observation is separately identified when available.

## Non-Goals

No human approval by click, changed gate/policy, new QA authority, automatic bulk authoring checks, independent signer proof, new archive/storage, recovered historical versions or parallel source/status evaluator. No global backlog/dashboard redesign, mass control migration, unrelated finding closure, new host, deployment/publication, global plugin/config change or Git write. Earlier completed Runs remain protected. Existing gate/check lifecycle and resource registration keep their meanings.

## Users And Roles

Repository owner/agents inspect documents; the user alone makes deliberate gate decisions. Core existing approval/source and authoring owners supply facts; Cockpit descriptive read owner exposes them; App/reader presents them. PRD owner: Arndt Gold. Design and plan owners decide technical implementation and executable evidence without changing this product promise.

## Constraints

Use the existing selected target/Run/snapshot and opaque registered resources. No arbitrary path inspection, source discovery registration or App policy duplicate. Returned descriptive version/state facts require additive compatibility for existing model/App MCP and HTTP consumers; absent new fields remain safely uncertain. Concrete content defects require current applicable canonical diagnostics; strict current-gate authoring eligibility stays intact. No changed approval-policy or persistent schema. Restrict transport/UI work to the smallest existing read and navigation paths.

## Evidence Requirements

Carry every stable criterion through SD/TP. Include exact approved source correspondence and raw readable content, changed/moved/foreign/missing proof, zero/four/additional documents, unsupported gate/check, concrete authoring diagnostics versus busy/blocked/inconclusive, stale same-revision source and delayed response, old-result compatibility, no mutation, responsive keyboard/focus/scroll and neighboring current-check/retry/navigation. Qualify immutable built assets before browser checks. Preserve the source-revision archive and protected completed Runs. Native proof remains a distinct observed asset/session/interaction boundary, not a result inferred from protocol or browser.

## Risks And Open Questions

No material product question remains open. Core proof currently evaluates approved artefacts through existing canonical receipts/presentations/bindings; SD must expose applicable per-resource facts without adopting a weaker check or making unrelated resource failure silently certify a document. Draft authoring can fail early at gate readiness with readiness_details, so SD must preserve original diagnostics and distinguish actual authoring findings from prerequisite/technical failures. Only the supported current draft is explicitly checked; other entries remain truthfully unchecked/unavailable. Exact descriptive wire shape, finite bounds, consumer validation and ephemeral result association are SD concerns. Required state semantics, absent-fact limits and no-bulk-checking are resolved here.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Two-column list and one reading destination | before_prd | resolved | Document plus icon/text state and one action; no expandable overview entry or separate approval link; existing large document reader. | Arndt Gold / PRD owner |
| Entries, counts and absence | before_prd | resolved | Actual distinct registered supported gate-document references including drafts; later documents only if registered; count entries, no invented registrations; explicit missing/blocked feedback. | Arndt Gold / PRD owner |
| Checked, defective, approved and uncertain states | before_prd | resolved | State table and applicability rules; pass is authoring only, defects require concrete current findings, missing/technical failure is uncertainty and earlier approval remains distinguished. | Arndt Gold / PRD owner |
| Truthful version action | before_prd | resolved | Confirmed exact version permits approved wording; evidenced draft permits draft wording; uncertain earlier approval uses current version and explicit limit. | Arndt Gold / PRD owner |
| Read/check authority and compatibility | before_prd | resolved | Existing Core proof/authoring authority, smallest descriptive MCP/HTTP result, no App evaluator or bulk check; absent old-server facts cannot certify state. | Arndt Gold / PRD owner |
| Qualification scope and operational limit | before_prd | resolved | Mandatory meaningful automated/protocol/built browser and protected-source evidence; native observation separately reported if available; no implicit install/config/Git action. | Arndt Gold / PRD owner |
| Descriptive shape, source proof association and diagnostic treatment | later_sd | open | Define through existing Core/read owners, retaining all PRD state, authority, bounds and compatibility constraints. | SD owner |
| Executable scenario and evidence mapping | later_tp | open | Map every criterion/SD decision to actual commands, test data and qualified visible evidence, including negative/compatibility cases. | TP owner |

## Next Step

Review the revised PRD and give a new deliberate Approval: PRD. Then the existing SD owner defines proof/read/check association and compatibility; renew TP approval and implementation preparation before changing product code. Earlier source approvals are historical only.

## AGDF Approval Summary (de; source=en)

- Ziel: Dokumente im Cockpit schnell überblicken, ihren belegten Freigabe-/Prüfstand verstehen und mit einer Aktion in der großen Leseansicht öffnen.
- Umfang: Zwei Spalten: Dokument mit Icon und Statustext sowie ein passender Leselink. Entwürfe und freigegebene Dokumente gehören zur tatsächlichen registrierten Auswahl. Keine aufklappbaren Listeneinträge und kein eigener Link Freigabe ansehen. Originale Freigabeangaben und passende Prüfbefunde stehen in der Dokumentansicht. Core und vorhandene MCP-/Browser-Leser liefern den Zustand; die App bewertet Freigaben nicht selbst.
- AC-001: Kompakte vergleichbare Dokumentzeilen mit tatsächlicher Anzahl, null/vier/weiteren Einträgen, langen Namen und schmaler/breiter Ansicht. Fehlende oder gesperrte registrierte Quellen erhalten keine funktionierenden Links; mehrere Dokumente desselben Typs bleiben unterscheidbar.
- AC-002: Icon plus Text unterscheiden Freigegeben, Entwurf, Entwurf geprüft, Überarbeitung nötig und Prüfung nicht verfügbar. Bestanden ist eine Entwurfsprüfung, keine Freigabe oder QA. Überarbeitung nötig setzt konkrete passende Mängel voraus. Technische Fehler, fehlende Prüfung und veraltete Ergebnisse erzeugen keine erfundenen Mängel oder positiven Zustände.
- AC-003: Freigegebenes Dokument ansehen ist nur erlaubt, wenn der Core die tatsächlich geöffneten Dokumentbytes der Freigabe zuordnet. Entwürfe heißen Entwurf ansehen. Bei unbestätigter heutiger Fassung heißt es Aktuelle Fassung ansehen mit dem Hinweis Freigabe dieser Fassung nicht bestätigt; eine frühere Freigabe bleibt als solche erkennbar.
- AC-004: Ein Leselink öffnet die bestehende große Dokumentansicht mit verständlichem Zustand, konkreten passenden Prüfbefunden und vorhandenen ursprünglichen Freigabeangaben. Fehlende Fassung, Zeit oder Identität werden benannt. Tastatur, Rückkehr zum auslösenden Link, schmale/breite Ansicht und lange Texte bleiben bedienbar.
- AC-005: Die bestehenden Core-Prüfer und Quellen-/Sitzungsgrenzen bleiben zuständig. Neue beschreibende Angaben sind mit bisherigen MCP-/Browser-Lesern kompatibel; fehlen sie, entsteht keine Freigabe- oder Prüfbehauptung. Lesen schreibt keinen Kontrollzustand, startet keine Sammelprüfung und übernimmt keine fremden oder verspäteten Ergebnisse.
- AC-006: Erneuerte Quellen und TP bestimmen die Umsetzung. Verbindlich sind passende automatische/Protokoll- und sichtbare Prüfungen am qualifizierten Browser-Build, Reviews und geschützte fremde Nachweise. Native Host-Beobachtung wird nur bei tatsächlichem Nachweis berichtet; fehlende native Prüfung erlaubt keine Installation und wird nicht als bestanden ausgegeben. Alte Inline-Tests gelten nicht als Erfüllung der neuen Bedienung.
- Entscheidungen: Bedienung, Dokumentauswahl, Zustandsbedeutung, Versionslinks, Core-Zuständigkeit und Abnahmegrenzen sind vor PRD geklärt. Die konkrete beschreibende Leseprojektion, Befundzuordnung und Kompatibilität gehören dem SD-Owner; ausführbare Test-/Nachweismappings dem TP-Owner. Keine neue Freigabehoheit, Archivablage, Massenmigration, Veröffentlichung oder Git-Aktion.
- Nächster Schritt: Neue Approval: PRD für diese Fassung; danach SD und TP erneuern. Der Skill [prd-definition](/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.14.5+codex.local-f073a31fcaa1/skills/prd-definition/SKILL.md) verlangt „use its fresh presentation and wait“; die bisherige PRD-Freigabe gehört zur archivierten älteren Bedienung und gilt nicht für dieses geänderte PRD.
