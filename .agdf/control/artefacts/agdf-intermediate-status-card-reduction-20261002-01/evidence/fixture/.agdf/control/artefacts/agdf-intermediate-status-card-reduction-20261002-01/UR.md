# UR: Fewer intermediate status cards with unchanged control

Status: draft
Gate: UR
Gate approval: open
Revision: 2
Date: 2026-10-02
Owner: Arndt Gold
Run: agdf-intermediate-status-card-reduction-20261002-01
Target: /Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework

## 1. Problem

The user wants to reduce AGDF interaction overhead by omitting unnecessary intermediate status cards. A visible card demands attention even when an internal check requires no decision and communicates neither a meaningful new result nor a change in permitted actions. Several such cards can obscure progress and the next required decision.

The need is directly evidenced by this conversation: “Vielleicht könnte man sich die eine oder andere zwischenstatuskarte sparen” and “Machen wir doch daraus ein ur”. These requests do not establish a measured number of redundant cards or a defect on every host. The affected workflows must be examined before implementation.

## 2. Goal

As an AGDF user, I want cards for decisions, relevant changes and reviewable results. Within an already permitted work step, I want to follow progress through brief updates without reading a separate card for every internal control operation.

The visible interaction becomes shorter. Control checks, persisted run state, evidence, human approvals and accountable ownership remain complete.

## 3. Scope

- Assess intermediate cards by their concrete information and decision value. Preserve a visible card when user input is required, a blocker appears, a relevant uncertainty or risk emerges, target/run/scope or permitted actions change, or a significant result becomes ready for review.
- Present internal source inspection, validation and evidence maintenance within the same selected and already permitted work step without an individual status card when none of those triggers applies. Brief progress updates remain possible during longer work.
- Consolidate internal intermediate results at a meaningful result point without delaying required decisions or blockers.
- Avoid repeated cards without relevant new information. Make target/run changes visible; a previously shown state must not imply current status or approval for another scope.
- Continue to provide an explicitly requested status view and the complete, current, bound decision presentation required for approval.
- Evaluate the benefit using fixed comparable workflows before and after the change: visible intermediate-card count, presentation length, visible decisions and blockers, and completeness of persisted control and evidence.

## 4. Non-Goals

- Removing gates, checks, reviews, evidence or exact approvals.
- Automatic consent or approval inferred from silence or a progress message.
- Changing run selection, Request Activation or implementation authority.
- Blanket suppression of errors, unresolved targets or recovery guidance.
- A separate presentation owner, additional approval process or parallel control state.
- General card-field redesign or repair of the separate quick-task closeout, installation, commit-verification or MCP-runtime concerns.
- Commit, push, release or another host installation as part of this UR.

## 5. Acceptance Signals

- AC-001: A fixed workflow with several internal checking/evidence steps and no new decision, blocker or relevant state change displays fewer intermediate cards than its recorded baseline. The concrete before/after comparison is available.
- AC-002: Every required user decision, new blocker and relevant change in target, run, scope or permitted actions remains timely and unambiguous.
- AC-003: Repeating the same internal state without new actionable information produces no additional individual card. An explicit status request still returns the current canonical status view.
- AC-004: Approval remains bound to the previously presented current run, gate and revision. Missing, stale and foreign approvals still permit no continuation.
- AC-005: Fewer visible cards cause no loss of control checks, persisted evidence or required run updates. Comparison cases demonstrate this separately.
- AC-006: Affected presentations remain consistent in all registered languages. Repository/rendering evidence and actually observed installed-host behavior are reported separately.
- AC-007: The change uses existing control, interaction and rendering owners and introduces no second gate or presentation contract.

## 6. Existing Source Of Truth

- `plugins/agdf/meta/contracts/interaction.md`: status and decision presentation, visible ownership, approval binding and existing output discipline.
- `packages/core/lib/interaction-presentation.js`: canonical presentation ownership.
- `packages/core/lib/control-evaluation/gate-check.js` and `packages/core/lib/skill-dispatch/service.js`: control state and continuation.
- `plugins/agdf/meta/agdf-interaction-locales.json`: registered languages and copy.
- `plugins/agdf/skills/gate-check/SKILL.md` and `scripts/sync-package-assets.js`: orchestration and generated host projections.
- Existing work `agdf-chat-noise-suppression` and `agdf-interaction-ownership-quick-path-ux`: output discipline and consolidated routing.
- Active scopes `pre-decision-status-card-visibility`, `agdf-actionable-card-ux-20260928-01` and `quick-task-closeout-status-20261002-01`: decision context, understandable next actions and truthful closeout retain their respective owners. Their approvals do not transfer to this scope.
- `agdf-product-maturity-roadmap`: related goal of less visible ceremony; this UR addresses the new request for fewer intermediate cards in a separate run.

## 7. Risks And Unknowns

Brownfield Review must establish which current cards are redundant, which presentations are contractually required and where the agent, dispatcher or host controls visible transitions. This conversation establishes the user requirement, not a particular host defect rate.

Consolidation must not hide changed authority, a required decision or new uncertainty. Progress updates must not become a second status authority or silently convey permission. Presentation and persisted control must remain consistent across interruption, resumption and target/run changes.

The affected comparison workflows, validation scope and smallest suitable delivery path are determined only after UR approval. This UR does not prescribe a technical solution.

## 8. Next Step

Review this UR and respond with `Approval: UR`, request revision or decline. Approval permits Brownfield Review and Mode/Slice Decision next; it does not permit implementation or replace approval of a later gate.

## AGDF Approval Summary (de; source=en)

- Problem: Der Nutzer möchte einzelne Zwischenstatuskarten einsparen. Karten ohne erforderliche Entscheidung, relevantes neues Ergebnis oder Änderung des Handlungsspielraums binden Aufmerksamkeit und können Fortschritt und nächste Entscheidung verdecken. Der Wunsch ist durch diesen Chat belegt; die Zahl redundanter Karten und ein Fehler auf allen Hosts sind noch nicht nachgewiesen.
- Ziel: Karten für Entscheidungen, relevante Änderungen und prüfbare Ergebnisse zeigen. Innerhalb eines bereits erlaubten Arbeitsschritts reichen kurze Fortschrittshinweise. Die sichtbare Interaktion wird kürzer; Kontrollprüfungen, gespeicherter Run-Zustand, Nachweise, menschliche Freigaben und Zuständigkeiten bleiben vollständig.
- Umfang: Zwischenstatuskarten auf Informations- und Entscheidungswert prüfen. Karten bleiben bei erforderlicher Nutzereingabe, neuen Blockern, relevanten Risiken oder Unsicherheiten, Änderungen von Ziel, Run, Scope oder Handlungsspielraum sowie wesentlichen Ergebnissen zur Prüfung sichtbar.
- Umfang: Interne Quellenprüfung, Validierung und Nachweispflege innerhalb desselben ausgewählten und bereits erlaubten Schritts ohne eigene Karte darstellen, wenn keiner dieser Auslöser vorliegt. Bei längerer Arbeit bleiben kurze Fortschrittshinweise möglich. Interne Ergebnisse können gebündelt werden, ohne Entscheidungen oder Blocker zu verzögern.
- Umfang: Wiederholte Karten ohne neue relevante Information vermeiden und Ziel-/Run-Wechsel sichtbar machen. Frühere Zustände dürfen weder als aktuell noch als Freigabe eines anderen Umfangs gelten. Explizite Statusanfragen und aktuelle gebundene Freigabepräsentationen bleiben vollständig verfügbar.
- Vergleich: Feste Ablaufbeispiele vor und nach der Änderung anhand der Zahl sichtbarer Zwischenstatuskarten, des Darstellungsumfangs, sichtbarer Entscheidungen und Blocker sowie vollständiger gespeicherter Kontroll- und Nachweisevidenz vergleichen.
- Abgrenzung: Gates, Prüfungen, Reviews, Evidenz und exakte Freigaben bleiben bestehen. Keine Zustimmung aus Schweigen oder Fortschrittsmeldungen, keine Änderung von Run-Auswahl, Request Activation oder Implementierungsberechtigung. Fehler, unklare Ziele und Reparaturhinweise werden nicht pauschal unterdrückt.
- Abgrenzung: Kein zweiter Presentation-Owner, zusätzlicher Freigabeprozess oder paralleler Kontrollzustand. Kein allgemeines Kartenredesign und keine Reparatur der separaten Quick-Task-Abschluss-, Installations-, Commit-Prüfungs- oder MCP-Laufzeit-Themen. Commit, Push, Release und erneute Hostinstallation gehören nicht zu dieser UR.
- AC-001: Ein fester Ablauf mit mehreren internen Prüf-/Nachweisschritten ohne neue Entscheidung, Blocker oder relevante Zustandsänderung zeigt weniger Zwischenstatuskarten als die aufgezeichnete Ausgangsfassung; ein konkreter Vorher-/Nachher-Vergleich liegt vor.
- AC-002: Jede erforderliche Nutzerentscheidung, jeder neue Blocker und jede relevante Änderung von Ziel, Run, Scope oder Handlungsspielraum bleibt rechtzeitig und eindeutig sichtbar.
- AC-003: Derselbe interne Zustand ohne neue handlungsrelevante Information erzeugt keine weitere eigenständige Karte. Eine ausdrücklich verlangte Statusansicht liefert weiterhin den aktuellen kanonischen Zustand.
- AC-004: Freigaben bleiben an den zuvor präsentierten aktuellen Run, das Gate und die Revision gebunden. Fehlende, veraltete und fremde Freigaben erlauben weiterhin keine Fortsetzung.
- AC-005: Weniger sichtbare Karten führen zu keinem Verlust von Kontrollprüfungen, gespeicherten Nachweisen oder erforderlichen Run-Aktualisierungen. Vergleichsfälle weisen dies getrennt nach.
- AC-006: Die betroffenen Darstellungen bleiben in allen registrierten Sprachen konsistent. Repository-/Rendering-Nachweise und tatsächlich beobachtetes installiertes Hostverhalten werden getrennt ausgewiesen.
- AC-007: Bestehende Kontroll-, Interaktions- und Rendering-Owner werden genutzt. Es entsteht kein zweiter Gate- oder Presentation-Vertrag.
- Zuständigkeit: Bestehende Runtime-Verträge, Renderer, Gate-Auswertung, Dispatcher, Locale-Registry und Hostprojektionen bleiben maßgeblich. Frühere Arbeiten zur Ausgabedisziplin und Routenwahl sowie aktive Karten- und Abschluss-Runs werden berücksichtigt; fremde Freigaben werden nicht übertragen. Der neue Run konkretisiert den verwandten Roadmap-Wunsch nach weniger sichtbarer Zeremonie.
- Offen: Brownfield Review muss redundante Karten, verpflichtende Darstellungen und die Verantwortlichkeit von Agent, Dispatcher und Host klären. Zusammenfassung darf weder geänderte Autorität, erforderliche Entscheidungen noch neue Unsicherheit verbergen. Fortschrittshinweise bleiben ohne eigene Statusautorität; Unterbrechung, Wiederaufnahme und Ziel-/Run-Wechsel müssen konsistent bleiben.
- Nächster Schritt: Nach UR-Freigabe folgen Brownfield Review und Mode/Slice Decision. Vergleichsabläufe, Prüfungsumfang und kleinster Delivery-Pfad werden erst dann festgelegt. Die UR schreibt keine technische Lösung vor; ihre Freigabe erlaubt noch keine Implementierung und ersetzt keine Freigabe eines späteren Gates.
