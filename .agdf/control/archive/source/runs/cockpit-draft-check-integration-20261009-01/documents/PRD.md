# PRD: Draft checks in the Cockpit

Status: draft
Gate: PRD
Gate approval: open
Owner: Arndt Gold
Date: 2026-10-09
Run: cockpit-draft-check-integration-20261009-01
Language: en
Traceability contract: criteria-chain-v1

## Product Scope

Add a deliberate Entwurf prüfen action to the selected undertaking's current draft context in the existing Cockpit. The action uses the already existing Core authoring checks through a bounded MCP App read interface. The user sees what was checked, the real outcome, concrete corrections and the appropriate next action without needing an agent to search for validator functions.

Supported draft gates are UR, PRD, SD and TP, only when the existing Core supports that selected active Run and current gate. A canonical current draft can be checked before registration if the Core supports it; the App must not require a registration or approval solely to access this read action. It cannot check arbitrary paths or adopt another Run/revision to make a check succeed.

The action belongs in the draft context, separate from historical documented-approval rows. The independently approved cockpit-documented-approvals-20261009-01 scope provides the related compact overview and truthful document-link semantics. This supplementary PRD neither rewrites nor transfers its approvals and can be accepted using the existing undertaking detail before that separate presentation change is delivered.

## UX Intent And Success

- primary_user_intent: Understand whether the selected current draft passes existing authoring checks and what needs correction.
- success_signal: A deliberate check returns the actual Core result for an inspectable current source binding; actionable corrections are visible and stale results cannot appear as current success.
- primary_decision_or_action: Entwurf prüfen; where needed correct the draft through its existing authoring workflow and deliberately recheck.
- experience_boundary: Short result explanation in the selected undertaking; original diagnostics and technical source details remain deliberately inspectable without overwhelming the primary view.
- authority_boundary: Entwurfsprüfung bestanden means authoring checks passed. It does not establish semantic derivation, registration, presentation readiness, approval, implementation permission or final QA.

## Working Modes And Effective State

| Working mode | Source/effective state | Visible state | Effective-state authority | Primary presentation owner |
|---|---|---|---|---|
| Current supported draft selected | No check for this exact currently observed binding | Noch nicht geprüft; Entwurf prüfen | Existing Core checkability and verified selected reading context | Draft-check area in selected undertaking |
| Deliberate check in progress | Result pending for that binding | Prüfung läuft; clear pending feedback, no premature success | Existing Core request and selected context | Same draft-check area |
| Successful result | Core authoring checks pass for the inspected source at the stated observation | Entwurfsprüfung bestanden; concise scope explanation and next step | Core authoring validators | Same draft-check area; control and approval areas retain their own roles |
| Authors must correct draft | Actual authoring findings, including reported missing fields/decisions or mappings | Korrekturen erforderlich; concrete available findings and next action | Existing Core report including available nested readiness findings | Same draft-check area; original diagnostic detail on demand |
| Unsupported/unavailable source or context | No safe supported current check; missing/approved source, blocked gate, unsafe/out-of-scope source or invalid session | Prüfung nicht verfügbar with reason and supported next action | Core boundaries and selected session | Same draft-check area; do not present unreadable information as a clean result |
| Selection/revision/source changed | The previous result is outside the current binding or no longer fresh | Previous success removed or explicitly veraltet; never current success | Existing source observation/revalidation and selected context | Current draft area and existing reload feedback |
| Recovery/recheck | New observation and deliberate check | Noch nicht geprüft after reload, then Prüfung läuft and actual new outcome | Existing Core and reading context | Same area, with stable surrounding reading/navigation |

Summary/details mode, expansion and narrow/wide display do not change these meanings. Historical approvals remain documented decisions and current control prerequisites retain their existing Core owner. No UI display mode grants authority.

## Activation, Blockers, Recovery And Transitions

The check starts only through an explicit pointer or keyboard action on the currently supported selected draft. Selecting a Run, opening a source/approval disclosure, expanding the view or reloading does not automatically check it. During loading the action cannot create competing duplicate requests; completion is announced accessibly while focus and reading position remain stable.

Use the actual Core outcome and distinguish correctable authoring findings from an unavailable or stale inspection. A false ready value caused by a blocked gate must not be reduced to a generic list of authoring errors; preserve available readiness_details, diagnostics and the Core next action. Likewise, a missing/empty diagnostic list cannot establish substantive completeness or permission. If no useful detail is supplied, explain the limitation rather than inventing a cause or remediation.

An expired session, denied/unsafe source, unsupported gate, approved draft, missing draft or inconsistent Run has a bounded unavailable state. Transient busy/timeout/read failures offer a visible retry when the current context remains valid; source/revision changes require existing reload then a deliberate recheck; session expiry uses the established reopen path. A forbidden gate stays forbidden. Draft corrections happen through the existing authoring owner, never by this action.

Transitions: unchecked → checking → passed/corrections/unavailable. Selection, snapshot/session replacement, observed revision/source change, draft approval or removal invalidates the current result and any in-flight result for the old binding. A late response from selection A must not update selection B. Reload obtains a new context and leaves it unchecked; retry/recheck must use that current binding. Results describe an observed source at a time, never a timeless guarantee. Existing change observation/revalidation must cover the checked draft, including changed draft bytes at an unchanged Run revision; before publication a changed/unsafe source cannot be presented as fresh success.

## Acceptance Criteria

These stable IDs are the product acceptance source for downstream design/plan mappings. Evidence describes required future verification, not a completed implementation.

- criterion_id: AC-001
  - working mode and source state: Selected active undertaking with a current supported unapproved UR/PRD/SD/TP draft
  - action and expected effective state: Deliberately activate Entwurf prüfen using pointer or keyboard; check the current draft without requiring artificial registration/approval
  - visible feedback: Action is in draft context; unchecked and checking states are distinguishable in narrow/wide reading; no historical approval row is added and disclosure/reload/selection alone never invokes the check
  - blocker/failure and recovery/next action: Unsupported, approved, missing or safely inaccessible draft gives an explained bounded state; use the existing authoring/reopen/reload action as appropriate
  - required evidence: Supported-gate and pre-registration integration scenarios; approved/missing/unsupported controls; rendered action placement and keyboard activation

- criterion_id: AC-002
  - working mode and source state: Pending check reaches an actual Core authoring result or a bounded unavailable result
  - action and expected effective state: Consume the original Core report, including available readiness details and next action; show the real result rather than re-evaluating content
  - visible feedback: Passed, corrections-required and unavailable/stale are distinguishable; complete, incomplete, unresolved-decision and missing-mapping cases show concrete actual findings; inspectable original diagnostics retain their meaning
  - blocker/failure and recovery/next action: No fabricated finding, translation or success from missing data; unavailable inspection is distinct from correctable authoring content; users receive available correction/next step or an honest limitation
  - required evidence: Actual complete/incomplete/open-decision/mapping reports across applicable validators; unavailable/partial response and long-diagnostic rendering; report-to-display comparisons

- criterion_id: AC-003
  - working mode and source state: Selected observed target/Run/gate/revision/source with current or in-flight result
  - action and expected effective state: Publish only an exact-bound revalidated result; invalidate on selection/snapshot/session/revision or observed source change, including unchanged revision with changed draft bytes
  - visible feedback: Gate is visible; revision, available source identity and observation are inspectable. An old success is removed or labeled veraltet; late A response cannot update B; reload leaves the new binding unchecked
  - blocker/failure and recovery/next action: Invalid/foreign/stale bindings fail closed without adopting another target or revision; existing reload then deliberate recheck recovers; checked draft participates in existing source-change observation
  - required evidence: Session/snapshot/source integration tests; unchanged-revision source-edit test; A→B delayed response, reload/session replacement, changed/removed/approved draft scenarios; rendered stale-state evidence

- criterion_id: AC-004
  - working mode and source state: Transient read failure, stale context, unavailable draft or expired session
  - action and expected effective state: Use visible retry on a still-valid transient context; otherwise existing reload/reopen or the actual authoring next action, then a deliberate check
  - visible feedback: Failure/recovery text explains what can happen next; retry shows pending and the real new result; no silent retry loop or automatic check on reload
  - blocker/failure and recovery/next action: Busy/timeout/read failure never leaves indefinite checking or false success; session expiry disables old selectors; forbidden gates and unsafe/missing sources are not bypassed
  - required evidence: Bounded failure/timeout/busy/expiry and retry integration scenarios; visible retry/reload/reopen feedback, focus and pending-state completion

- criterion_id: AC-005
  - working mode and source state: Passed, corrections-required or unavailable result alongside control state and documented approvals
  - action and expected effective state: Read/check only through the existing Core owner and bounded selected App context
  - visible feedback: Entwurfsprüfung bestanden visibly means existing authoring checks only; semantic review, registration, fresh presentation, deliberate approval and QA remain separate; current control state and historical approvals preserve their meanings
  - blocker/failure and recovery/next action: No file, approval, Run, registration, lifecycle or gate mutation; no arbitrary path/tool bridge, target switch or client-selected permission; passed result cannot enable forbidden delivery
  - required evidence: Exact before/after durable-byte checks on success and failure; malicious/foreign/path/approved-state guard scenarios; visible separation from documented approval/current permission/QA

- criterion_id: AC-006
  - working mode and source state: Narrow and wide undertaking reading with pending/results, long findings, binding details, documents and approval disclosures
  - action and expected effective state: Operate action/retry/source inspection/navigation with Tab/Enter and pointer; scroll and resize throughout applicable states
  - visible feedback: Readable wrapped content without horizontal loss; stable focus and reading/scroll position; status change is accessible; surrounding compact overview, document links and disclosures remain usable without flicker or jumps
  - blocker/failure and recovery/next action: Pending/disabled/stale controls communicate why and offer the allowed recovery; no focus trap or unexpected move after response, reload or return from source
  - required evidence: Responsive rendered scenarios with actual long reports; keyboard/focus/scroll/resize/reload/document/disclosure sequences; fresh native-host observation bound to the delivered build

- criterion_id: AC-007
  - working mode and source state: Scoped addition across existing Core/MCP/App readers and protected approvals
  - action and expected effective state: Integrate the same Core check through an additive, validated bounded read contract using existing snapshot/session/freshness owners
  - visible feedback: Existing operations remain compatible; no second readiness validator or competing source of truth; acceptance covers the action independently of the separate overview Run
  - blocker/failure and recovery/next action: Exact-build failure/unsupported-host limitations are visible and bounded; protected approved sources and unrelated Run history remain unchanged
  - required evidence: Core/MCP schema/session/reader/consumer integration and regression evidence; build/source/runtime identities; protected-source and scoped-diff comparison; distinguish source, stdio, browser and fresh native proof

## Non-Goals

No new content validator, approval/gate writer, click approval, canonical registration, semantic-review substitute, QA decision or automatic gate advancement. No identity/signature proof, historical archive, generic file/shell/tool bridge or cross-target check. No automatic continuous checking/polling requirement, global installation change, broad dashboard redesign, unrelated backlog repair, Git/publication/deployment action or approval transfer from another Run.

## Users And Roles

- Existing repository owner and agents inspecting the selected undertaking; no new persona or host population.
- Product accountability and explicit gate approval: Arndt Gold.
- Existing Core: authoring outcome, safe source/read boundaries and canonical control meaning.
- Existing Cockpit: presentation and deliberate action within its selected reading context; it grants no delivery authority.
- Existing authoring/review/registration/approval/QA owners: correct and review the draft, bind/register it, approve exact presented sources and decide quality through their existing workflow.

## Constraints

Reuse packages/core/lib/control-inspect/artifact-readiness.js and its existing gate validators. Existing Cockpit session, scoped snapshot, read worker, envelope validation and selected-state freshness remain authoritative; no separate readiness policy in UI or MCP. The approved supplemental UR is the derivation source, Brownfield Review and ready UX Intent Definition are subordinate analytical input.

The new operation/result extends a compatibility-sensitive MCP App interface: preserve existing operations, deny foreign/stale/unsafe selectors and retain bounded response, timeout and resource behavior. Source containment and current-gate guards apply before any success, even when the client suggests a different gate. Exact interface and technical composition belong to SD.

Keep product explanations in the established Cockpit presentation language and preserve original diagnostic meaning with clearly separated localized explanation. Required localized gate summaries stay part of these artefacts. Keep existing approvals and independently approved overview sources intact despite the shared dirty checkout. No automatic installation or release scope is added.

## Evidence Requirements

1. Core and MCP evidence must exercise actual existing authoring checks, scoped selection, invalid input, no-write effects, approved/unsupported sources and unchanged-revision draft edits; do not replace validators with fixtures that mirror a new UI policy.
2. Consumer/browser evidence must verify bindings, obsolete responses, unavailable/partial/long results, recovery and responsive keyboard/focus/scroll behavior in the actual built App. Existing documents, approval disclosures and reload remain regression touchpoints.
3. Fresh native-host evidence must identify the tested source/build/runtime and the observed action, result and recovery sequence. Existing earlier user confirmation of stable scrolling concerns an earlier build and does not qualify this unimplemented action.
4. Compare protected Run/approved-source bytes and scope the actual diff. Record limitations separately; passing source, stdio or synthetic browser tests do not establish fresh native behavior, semantic completeness, QA or approval.

## Risks And Open Questions

Primary risks are a stale success after changed draft bytes, a late result replacing the new selection, incorrect classification of unavailable reads as content corrections, a duplicate validator/authority, and disturbance of existing focus/scroll handling. AC-002 through AC-007 require corresponding prevention and evidence. The compact overview and this draft action share presentation owners but retain separate scope/approval authority.

No material product, acceptance, owner or release-scope decision remains unanswered for this PRD. Technical selection/DTO/source-monitoring composition and exact scenario plan are deliberately owner-bound later decisions below. New material product discoveries must return to the earliest affected source; they cannot be silently converted to implementation detail.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Supported action and selection scope | before_prd | resolved | Deliberate check of current supported unapproved UR/PRD/SD/TP in the selected undertaking; allow supported canonical pre-registration drafts, no arbitrary target/path | Arndt Gold — PRD owner |
| Outcome and approval meaning | before_prd | resolved | Core authoring outcome and real corrections; success is explicitly distinct from semantic review, registration, approval, permission and QA | Arndt Gold — PRD owner |
| Freshness and recovery acceptance | before_prd | resolved | Invalidate old selection/revision/source/snapshot/session results and late responses; include same-revision changed bytes; explicit retry/reload/reopen, no automatic checking requirement | Arndt Gold — PRD owner |
| Accountable owners and compact overview relationship | before_prd | resolved | Existing Core/read/session/presentation owners remain; separate approved overview sources and approvals are protected; this action is independently acceptable | Arndt Gold — PRD owner |
| Delivery and release acceptance boundary | before_prd | resolved | Existing Core/MCP/App plus identity-bound visible/native evidence; no new hosts, installation, publication or deployment work | Arndt Gold — PRD owner |
| Additive selector/result and snapshot/source dependency composition | later_sd | open | sd-definition must choose technical composition under existing reader/session owners, validator reuse and freshness obligations without changing approved meaning | sd-definition — design owner |
| Exact tasks, limit/failure/race scenarios and build/native observation sequence | later_tp | open | Task/Test Plan owner must cover every criterion and SD decision with executable scenarios and evidence; no product acceptance may be omitted | Task/Test Plan owner |

## Next Step

Review and canonically record PRD derived_from this exact approved UR, validate authoring readiness, prepare a fresh bound PRD presentation and obtain a new deliberate Approval: PRD for this supplemental Run. That approval allows SD drafting only; TP approval and required preparation still precede implementation.

## AGDF Approval Summary (de; source=en)

- Ziel: Den aktuellen Entwurf im Cockpit bewusst prüfen und echte fehlende Angaben oder Entscheidungen mit dem nächsten Schritt verstehen.
- Umfang: Entwurf prüfen beim ausgewählten aktuellen, nicht freigegebenen UR/PRD/SD/TP, auch vor Registrierung soweit Core dies unterstützt. Dieselbe Core-Prüfung über den begrenzten MCP-App-Lesezugriff; keine zweite Prüfregel. Die separat freigegebene kompakte Übersicht bleibt geschützt.
- AC-001: Bewusste Tastatur-/Zeigeraktion im Entwurfskontext; ungeprüft und laufend erkennbar. Nicht unterstützte, fehlende oder freigegebene Entwürfe erklären die Grenze. Auswahl, Quellenklappe und Neuladen lösen keine Prüfung aus.
- AC-002: Echte Core-Ergebnisse und vorhandene Detailbefunde zeigen bestanden, Korrekturen oder nicht verfügbar/veraltet. Konkrete Befunde und nächste Aktion bleiben nachvollziehbar; fehlende Informationen werden nicht erfunden.
- AC-003: Ergebnis an Ziel, Vorhaben, Gate, Revision, Quelle und Beobachtung binden. Auswahl-/Sitzungs-/Quellenwechsel, geänderte Entwurfsbytes bei gleicher Revision und verspätete Antworten entwerten alten Erfolg. Neuladen und bewusst erneut prüfen.
- AC-004: Sichtbar wiederholen bei vorübergehendem Lesefehler; bei veraltetem Bezug neu laden, bei Sitzungsende bestehende Wiederöffnung. Kein endloses Laden, stiller Wiederholungszyklus oder Umgehen gesperrter Quellen/Gates.
- AC-005: Entwurfsprüfung bestanden bedeutet nur Autorenprüfungen. Fachliche Prüfung, Registrierung, Freigabe, aktuelle Voraussetzungen und QA bleiben getrennt; keine Dokument-, Kontroll- oder Freigabeänderung und kein beliebiger Dateizugriff.
- AC-006: Schmale/breite Anzeige, lange Befunde, Quellen, Tastatur, Fokus, Scrollen, Größenwechsel und Neuladen bleiben lesbar und stabil. Passende Sperr-/Wiederherstellungshinweise; frischer nativer Nachweis zum gelieferten Build.
- AC-007: Bestehende Core-/MCP-/App-Verantwortliche und validierte Schnittstelle erweitern; alte Aufrufe bleiben kompatibel. Geschützte Quellen und andere Runs bleiben unverändert. Quell-, Protokoll-, Browser- und native Nachweise getrennt belegen.
- Entscheidungen: Produktumfang, Bedeutung, Frische, Wiederherstellung, Verantwortliche und Abnahmegrenzen sind geklärt; PRD-Verantwortlicher Arndt Gold. Genaue Schnittstelle/Quellenüberwachung entscheidet SD, konkrete Aufgaben/Szenarien TP. Keine Archiv-, Installations-, Veröffentlichungs- oder Git-Arbeit. Diese ergänzende Freigabe gilt nur für diesen Run und erlaubt danach SD, noch keine Implementierung.
