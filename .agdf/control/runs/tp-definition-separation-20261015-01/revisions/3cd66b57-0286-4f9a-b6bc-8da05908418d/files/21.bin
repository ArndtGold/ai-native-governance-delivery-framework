# PRD: Dedicated Task Plan definition

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-15
Owner: AGDF maintainer
Traceability contract: criteria-chain-v1

## 1. Product Scope

Provide the canonical tp-definition skill for semantic drafting, clarification and permitted revision of an unapproved Task/Test Plan. Eligible continuation and direct invocation must lead to one bound authoring owner, analogous to the existing UR, PRD and SD definition flow. gate-check retains prerequisites, readiness and approval presentation; Core retains recording, source relationships, history and approval integrity; task-plan-review retains fulfilment review after implementation.

The plan derives concrete tasks, dependencies, scenarios, expected results and evidence obligations from approved PRD and SD. It resolves execution decisions explicitly deferred to TP, without creating product scope or hiding architecture choices. Existing supported host projections and package outputs must expose the same canonical role through their current generation mechanisms.

Source derivation: approved UR sections 2-5 establish definition ownership, executable planning and preserved controls. Brownfield Review identifies the existing TP preparation and remediation owners, shared recording, source inspection assumptions and host generation. No feature beyond that approved outcome is introduced.

## 2. UX Intent And Success

- ui_ux_impact: low
- ux_intent_definition: Directly defined low-impact semantics below, as routed by the completed Brownfield Review; no separate analysis required.
- primary_user_intent: Obtain an executable, traceable plan and decide on its current exact contents before implementation.
- success_signal: The agent prepares through one TP author, exposes unresolved planning questions, and presents a ready recorded plan for the existing deliberate Approval: TP.
- primary_decision_or_action: The coding agent drafts or revises the eligible unapproved plan; the human decides the exact presented TP. Entry-point discovery or dispatch never constitutes approval.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| TP preparation | Bound unapproved plan is being authored or clarified after approved PRD/SD and required analyses | current plan, material planning question, blocker and permitted next step | Current canonical control and exact approved sources; tp-definition owns draft content only | Agent using tp-definition for content/questions and gate-check for canonical state |
| TP decision | Ready recorded plan awaits a deliberate decision on its exact presented version | existing TP approval presentation and reviewable document | Existing Core readiness, presentation and approval owners | Existing gate-check approval presentation |
| Explicit unapproved revision | Human editing intent permits a current bound draft change; changed content requires fresh recording/presentation | revised plan or concrete revision blocker, then renewed decision request | Existing draft-revision/control owners and current human intent | tp-definition for clarification; gate-check for new presentation |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Existing request activation rules apply. A delivery request that reaches TP or an explicit TP drafting/revision request may select the definition owner only after target/run/stage validation. Loading, discovery, cwd or ambient run selection cannot supply editing intent.
- blockers_and_visible_next_actions: Missing approved sources, stale/foreign bindings, unsupported stage, integrity failures or unsafe/missing installed templates stop dependent drafting and expose their existing recovery. Missing planning facts remain visibly open with a focused question. Product or architectural conflicts go to the earliest existing source owner.
- recovery_paths: Use current canonical refresh/revision/transaction recovery. An unready draft may receive a condition-specific authoring correction through its existing checked writer when eligible. A recoverable transient failure permits a visible retry after state refresh; unchanged failure stops. No bypass, hand-authored receipt or automatic replacement of protected content.
- relevant_state_transitions: Approved SD with valid prerequisites -> bound TP preparation -> recorded unapproved draft -> fresh gate-check evaluation -> exact TP presentation -> new human response. A ready draft without new editing intent remains a decision candidate. Explicit permitted revision returns to authoring and requires a new presentation. TP approval permits the existing pre-implementation Brownfield Analysis, never immediate automatic implementation.

## 5. Acceptance Criteria

- criterion_id: AC-001
  - observable_success: tp-definition is the single semantic TP drafting/clarification/revision owner. Eligible ordinary continuation and explicit invocation reach that owner, including diagnosed incomplete unapproved TP content and TP correction routing; gate-check continues controlling readiness and presentation, and task-plan-review remains post-implementation fulfilment review.

- criterion_id: AC-002
  - observable_success: In TP preparation, a valid approved-source state and drafting action yield a bound unapproved plan or a visible focused planning question. A ready draft without fresh editing intent yields its existing decision presentation. An explicit eligible revision yields changed content and a new decision presentation; stale, foreign, wrong-stage or protected bindings yield a concrete blocker and existing recovery/refresh next action without protected writes. Observable success is the exact target/run/current-version flow, with no approval inferred from invocation. Evidence includes positive and negative production dispatch cases and the actual resulting planning/decision output.

- criterion_id: AC-003
  - observable_success: Each prepared plan preserves criteria-chain-v1 and stable task/scenario identities, maps every approved PRD criterion and associated SD decision to executable tasks, observable expected results and specific evidence, and includes applicable dependencies, boundary/failure cases, risks and explicit non-goals without copying or renaming acceptance authority.

- criterion_id: AC-004
  - observable_success: For each applicable acceptance/evidence obligation, the plan identifies a concrete test route, environment, prerequisites/access or permissions, responsible owner, required evidence and the action when a prerequisite is unavailable. An unavailable environment or absent permission remains an explicit planning/evidence gap, never a promised pass or implicit authorization to obtain access.

- criterion_id: AC-005
  - observable_success: Execution/test/evidence decisions explicitly deferred from SD to TP are resolved or remain visibly blocking before TP approval when material. Product or architecture conflicts return to their existing upstream revision owner; the TP author neither changes approved sources nor hides binding product/design choices as planning detail.

- criterion_id: AC-006
  - observable_success: Initial recording and explicitly permitted unapproved replacement reuse existing Core template, typed writer, source-binding, history and transaction mechanisms. A changed TP requires fresh recording, readiness, presentation and a new deliberate Approval: TP; old presentations/replies cannot approve changed material. Approved plans and unrelated runs remain protected.

- criterion_id: AC-007
  - observable_success: Canonical skill registration, focused contract, request-activation projections and existing generated Codex, Claude Code, Copilot and OpenCode/package assets consistently expose tp-definition with the current role and dispatch semantics through their existing source owners. Existing compatibility and payload/footprint guards remain effective; no parallel registry, writer, template store or host policy is introduced.

- criterion_id: AC-008
  - observable_success: Targeted regressions exercise the real eligible TP path, direct/unbound invocation, ordinary ready-draft presentation, incomplete-draft clarification, explicit revision, wrong/stale/approved source boundaries and preserved review/approval roles. Generated asset/package checks pass. Evidence explicitly separates source/automated local checks from actual loaded/native-host observations and retains missing qualification as a named gap.

## 6. Non-Goals

No additional gate, new approval formula or automatic approval; no alternate persistence/control authority; no approved-source or unrelated-run edits; no expanded supported-host claim; no QA/UAT/release redesign, installation, publication or deployment as part of this change. Existing TP contents are not migrated automatically.

## 7. Users And Roles

- Coding agent: consumes bound continuation and prepares/clarifies the unapproved plan through tp-definition.
- AGDF maintainer: owns these product requirements and deliberate gate decisions.
- tp-definition: semantic author; cannot approve or implement.
- gate-check and existing Core services: prerequisites, readiness, routing, protected recording and presentation/approval integrity.
- task-plan-review and qa-gate: downstream evidence assessment and sole final technical QA decision under existing contracts.

## 8. Constraints

Preserve the existing gate sequence, approved-source authority, exact human decision semantics and compatibility of existing approved plans. Use installed version-matched canonical templates. Extend existing registry and generation paths rather than adding a second truth. Preserve request applicability and explicit editing intent. Payload/footprint failures require proportionate canonical changes or visible scope reconsideration, never an unexplained guard increase. Native-host support claims need corresponding actual evidence.

## 9. Evidence Requirements

Retain the approved UR, this PRD and Brownfield Review as derivation sources. SD must map every criterion to realization and source owner; TP must map it to observable scenarios. Require focused runtime/CLI/MCP positive and negative routing checks, checked recording/revision/presentation evidence, and canonical host/package projection validation. Semantic authoring review must inspect a concrete generated plan, including missing-access handling and deferred SD decisions; schema/table completeness alone cannot establish useful planning. Test commands, environments, access needs and owners belong in the later TP. Actual loaded-host observations and unverified lanes must be labeled separately.

## 10. Risks And Open Questions

Main risks are split preparation/remediation ownership, reuse of source inspection with different source assumptions, unnoticed ready-draft rewrites, and generated package drift. Existing bound definition phases, shared recording and focused negative regressions supply the reuse strategy. No material product decision remains open. Exact assignment predicates, revision transport and verification commands are design/planning decisions below; none permits a product or authority change.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Canonical authoring owner and scope | before_prd | resolved | Introduce tp-definition for unapproved TP content; preserve gate-check control, Core persistence/approvals and task-plan-review fulfilment review, as approved in UR. | AGDF maintainer |
| Compatibility and delivery acceptance | before_prd | resolved | Include all current generated host/package surfaces through existing owners, without new host support claims or live installation/publication. Keep existing approved plan bytes and authority protected. | AGDF maintainer |
| Assignment, correction and explicit revision transport | later_sd | deferred | Specify exact eligible predicates and integration with source inspection, readiness and existing writer; no duplicate validator or transaction authority. | sd-definition |
| Execution and host evidence routes | later_tp | deferred | Name test environments, access, responsible owners and evidence for each scenario; retain unverified native-host lanes explicitly. | gate-check as current TP author until this change is delivered |

## 11. Next Step

Review this PRD and approve only with:

`Approval: PRD`

After approval, draft SD. Implementation remains forbidden until TP approval and required pre-implementation preparation.

## AGDF Approval Summary (de; source=en)

- Ziel: tp-definition übernimmt die fachliche Erstellung, Klärung und erlaubte Überarbeitung unfreigegebener Task/Test Plans. Der Agent plant; der Mensch entscheidet weiterhin die konkrete Fassung vor Umsetzung.
- Umfang: Eigener Skill und Vertrag mit kanonischem Dispatcher-, Korrektur- und Revisionsrouting sowie konsistenten bestehenden Host-/Paketprojektionen. gate-check behält Steuerung und Freigabereife, Core die Speicherung und Freigaben, task-plan-review die spätere Erfüllungsprüfung.
- AC-001: Genau ein fachlicher TP-Autor für Fortsetzung, direkten Aufruf und zulässige Korrekturen; bestehende Kontroll- und Reviewrollen bleiben erhalten.
- AC-002: Gültige gebundene Erstellung liefert einen Plan oder eine gezielte Frage. Fertige Entwürfe werden vorgelegt; explizite Revision braucht eine neue Vorlage. Ungültige Bindungen liefern einen konkreten Blocker und den bestehenden nächsten Schritt ohne geschützte Änderungen.
- AC-003: Aufgaben, Szenarien, erwartete Ergebnisse und Nachweise decken jedes PRD-Kriterium und seine SD-Entscheidungen ab, einschließlich Abhängigkeiten, relevanter Fehlerfälle und Risiken.
- AC-004: Anwendbare Test- und Nachweispflichten nennen Testweg, Umgebung, Voraussetzungen, Berechtigungen, Verantwortliche und den Umgang mit fehlendem Zugang. Fehlende Voraussetzungen bleiben sichtbar offen.
- AC-005: Zum TP verschobene Ausführungsentscheidungen werden geklärt; wesentliche offene Punkte blockieren die Freigabe. Produkt- und Architekturkonflikte gehen an den bestehenden Quellverantwortlichen zurück.
- AC-006: Bestehende Vorlagen, geprüfte Registrierung, Quellenbindung und Historie werden wiederverwendet. Geänderte Pläne brauchen eine neue bewusste TP-Freigabe; alte Antworten und geschützte Pläne bleiben abgegrenzt.
- AC-007: Registrierung, Verträge und bestehende Codex-, Claude-Code-, Copilot-, OpenCode- und Paketprojektionen sind konsistent. Größen- und Kompatibilitätsprüfungen bleiben wirksam; keine parallelen Wahrheiten.
- AC-008: Gezielte Prüfungen belegen reale Routing-, Klärungs-, Revisions- und Schutzfälle sowie generierte Pakete. Lokale Prüfungen und tatsächliche native Hostbeobachtungen werden getrennt ausgewiesen; Lücken bleiben benannt.
- Entscheidungen: Fachlicher Umfang, Rollen und Kompatibilitätsgrenzen sind festgelegt. SD entscheidet die genauen Bindungs- und Revisionsdetails; der spätere TP benennt konkrete Testwege und Nachweise. Keine neue Freigabeautorität, Hostzusage oder Veröffentlichung.
- Risiken: Übersehene Korrekturrouten, ungeeignete Wiederverwendung der Quellenprüfung, unbeabsichtigtes Überschreiben fertiger Entwürfe und veraltete Paketprojektionen. Brownfield Review benennt die betroffenen Eigentümer; tatsächliche Laufzeit- und Hostnachweise stehen noch aus.
- Nächster Schritt: PRD freigeben, danach SD erstellen. Umsetzung bleibt bis TP-Freigabe und vorbereitender Analyse gesperrt.
