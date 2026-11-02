# UR: Clear backlog status and reliable update flow

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-09
Owner: Arndt Gold
Run: backlog-status-flow-clarity-20261009-01
Language: en

## 1. Problem

The user found the last stored Active Backlog entry, `gate-internal-continuation-recovery-20261008-01`, labelled `In Progress` although its QA report already exists. The inspected QA report actually says `revise`: five findings are resolved and QF-001, a current displayed-Cockpit readability observation, remains open. The run is active at QA, without QA or UAT approval. Keeping it active is justified, but the broad label does not explain whether implementation, evidence collection, a QA reassessment or a human decision is pending.

The stored next step asks generally to resolve QA findings, refresh tests/reviews and rerun QA. The report names a more specific remaining action: observe and assess the freshly issued expanded Cockpit. A reader must open several sources and interpret their relationship to understand the actual open work. Merely having a report cannot establish a successful quality decision, a human approval or completion.

The Cockpit intentionally displays saved backlog fields. The existing `cockpit-active-backlog-core-ui-20261008-01` UR preserves stored statuses and section membership; it does not make the list a live gate evaluator. Improving only the UI wording or teaching each consumer to infer status from report prose would leave the backlog unclear and introduce competing interpretations.

Current repository sources already contain Core policy-based backlog status mapping, dependent Run/Backlog writers, locks and transaction handling. Their presence is source evidence, not proof that every control transition updates a precise, understandable summary. The end-to-end architecture, update coverage and failure behaviour need examination before solution design or implementation.

## 2. Goal

A user or agent can read a backlog entry and understand the undertaking's current work phase, what specifically remains open, the next permitted action and the sources supporting that summary, without reconstructing the meaning from several documents.

The backlog becomes a clear, reliably maintained saved summary of canonical control state. Existing Core owners determine its meaning and maintain it through controlled operations. Core read projections and the compact and expanded Cockpit convey that same meaning. Lifecycle, QA outcome, missing evidence and human approval remain distinguishable.

## Affected Users

- The repository owner inspecting work and deciding what to review or approve next.
- Agents using the backlog to orient themselves before following the canonical bound control route.
- Users inspecting the existing compact MCP Cockpit and expanded/browser overview in this repository.

## 3. Scope

- **Backlog clarity first.** Define an understandable, consistent summary answering: where is the undertaking, what is concretely open, what is the next permitted action, and which Run/report supports those statements? Technical Run identity and source references remain inspectable. Exact vocabulary, columns and field representation are subsequent product/design decisions.
- **Separate meanings.** Distinguish work phase, report availability, QA result, outstanding evidence or corrections, approval readiness/recording and lifecycle. A QA report with `revise` cannot appear as QA passed; a `pass` without the required approval cannot appear approved or completed. Active Backlog membership is not itself proof of an active, valid Run or implementation work.
- **Architecture and flow review before implementation.** Use the existing Brownfield and review routes to trace the actual chain: controlled operation; canonical Run state, evaluation and registered reports; backlog summary update; Core reading; HTTP/MCP mediation; Cockpit presentation. Identify the owner and source of truth at each boundary, all relevant update triggers, source/revision binding, duplicated interpretation, coupling and reuse opportunities. Record observed behaviour, gaps, decisions, mitigations and verification criteria; do not introduce a new gate or parallel architecture authority.
- **Reliable updates through existing owners.** Determine and cover the operations that can change relevant summary facts, including report recording/reassessment, internal step recording, approvals and closeout. Update the saved summary through canonical writers with the existing revision, lock, seal and transaction boundaries. Repeat or equivalent operations must not create contradictory summaries. Preserve deliberate handling of legitimate Run-specific next actions and approved intent.
- **Concrete open work.** When canonical registered evidence identifies a specific remaining obligation, make it understandable in the backlog instead of replacing it with an unrelated previous-gate step or only an uninformative generic instruction. Define its authority and freshness through the existing owners; do not let React or a separate prose parser decide gate readiness.
- **Consistent consumers.** The Markdown backlog, Core read results and both existing Cockpit surfaces must convey the same summary meaning. Any genuinely fresh evaluated detail and saved observation must remain identifiable with its source and freshness; an unverified saved entry is not represented as a current evaluated result. Preserve bounded reading, existing list/search semantics, deliberate selection and accessibility.
- **Explicit disagreement and incomplete data.** Define how missing, malformed, ambiguous, outdated or unsupported sources and skipped/failed updates are detected and exposed. A successful control operation must not silently imply that a skipped backlog update succeeded. Readers must not invent a status or silently repair canonical state.
- **Compatibility and evidence.** Establish a bounded compatibility/update strategy for existing backlog layouts and older entries. Test meaningful transitions, source disagreement, retries/interruption and concurrent updates through the existing owner boundaries. Verify the actual compact and expanded presentation with evidence appropriate to the claimed host path, keeping automated/source/protocol/browser/native observations distinct.

## 4. Non-Goals

- No second control store, independent status policy, UI-side gate evaluator, new generic subsystem, new approval gate or separate architecture decision registry.
- No change to gate order, QA `pass | revise | block` authority, exact human approval semantics, seals or permitted delivery actions merely to obtain a clearer label.
- No automatic QA/UAT approval, delivery continuation, release, archival or reclassification of unrelated Runs. A backlog summary is orientation, not delivery authorization.
- No closure or approval of QF-001 or any other finding in `gate-internal-continuation-recovery-20261008-01` through this UR. That Run is a concrete inspection/regression example, not this Run's work assignment.
- No broad dashboard redesign, prioritization/analytics, new host integration, publication, deployment or Git commit/push in this scope.
- The earlier wording/scroll fixes made in this chat without AGDF are existing working-tree context, not governed implementation evidence for this new UR.

## 5. Acceptance Signals

1. For a QA `revise` with a named outstanding evidence obligation, the saved backlog summary identifies QA and the concrete open obligation and next action. For the inspected example, a reader can understand that current expanded-Cockpit readability needs observation and QA reassessment; it does not suggest that QA is passed or the Run is complete.
2. Representative cases distinguish report missing, QA `revise`, QA `block`, QA `pass` awaiting exact approval, recorded QA approval with further work open, UAT/closeout pending and completed delivery. Applicable compact routes without formal QA/UAT remain truthful rather than acquiring fictional requirements. The exact vocabulary is defined once by the existing canonical owner.
3. A documented architecture/flow review identifies actual owners, sources and update paths across operation, Run/evidence, backlog, Core reading, mediation and presentation. Each relevant gap has a specific mitigation/decision and verification criterion before implementation; the resulting design reuses existing owners and introduces no parallel authority.
4. After each applicable successful canonical transition, the saved summary corresponds to its bound Run revision and registered evidence. Concrete next actions retain their canonical meaning. Repetition, recovery or concurrent work cannot silently lose another Run's update, transfer approvals or claim an update that was skipped; meaningful tests demonstrate the chosen consistency contract.
5. Saved, evaluated and unavailable/stale information is distinguishable. Missing/invalid reports, an unresolvable Run, ambiguous pointers and unsupported layouts produce explicit limitations or diagnostics rather than invented readiness. Existing rows keep their identity, links and intended section placement unless a separately permitted canonical operation changes them.
6. Reading the Markdown backlog, Core projection, compact Cockpit and expanded view produces the same understandable summary for the same bound observation. Scrolling or incidental document/title loading does not change a completed query or reclassify a Run; UI inspection writes no control state.
7. Regression evidence covers the state/transition/failure scenarios above, the supported compatibility strategy and readable narrow/wide presentation. Documentation states the final meanings, ownership, update triggers, freshness and limitations. QA distinguishes the evidence actually observed from unverified host/platform claims.

## 6. Existing Source Of Truth

- The user requests in this conversation: first make the backlog clearer so display and interpretation improve; explicitly check architecture and flow; create the UR using AGDF.
- `.agdf/control/MASTER_BACKLOG.md`: stored summaries, sections, links and the inspected entry. Each Run's `RUN_STATE.md` under `.agdf/control/runs/` and its registered reports/approval evidence remain authoritative for its control state.
- `.agdf/control/artefacts/gate-internal-continuation-recovery-20261008-01/QA_REPORT.md`: the concrete `revise` and remaining QF-001; its `RUN_STATE.md` records QA, active lifecycle and missing QA/UAT approvals. These observations are bounded to the inspected files, not a new QA decision.
- `packages/core/lib/control-state/run-backlog.js`: existing policy-based saved status mapping and backlog update planning; `run-backlog-writer.js`, `run-steps.js`, `run-recording.js` and `run-step-transaction.js`: current writers, dependent updates, revision/lock/transaction responsibilities.
- `packages/core/lib/control-evaluation/gate-policy.js`, `run-step-policy.js` and `delivery-map.js`: existing gate/transition evaluation and next-action ownership; exact dependencies and diagnostic coverage are to be established in Brownfield Review.
- `packages/core/lib/control-inspect/cockpit-backlog.js`, `cockpit-list.js`, `cockpit.js` and the existing `control-read` owners: saved backlog/list projection and bound reading. Existing HTTP and MCP services mediate those reads; React presentation lives in `packages/control-ui/src/Overview.tsx`, `BacklogRows.tsx` and `mcp/CompactCockpit.tsx`.
- `.agdf/control/artefacts/cockpit-active-backlog-core-ui-20261008-01/UR.md`: adjacent list-selection/search/provenance scope that preserves stored status. `.agdf/control/artefacts/status-card-stale-next-action-20261008-01/UR.md`: adjacent evaluated next-action/continuation repair. Reuse their owners and avoid duplicate fixes; their approvals do not authorize this scope.
- `docs/architecture/06-agdf-cockpit.md` and the normative contracts under `plugins/agdf/meta/contracts/`: existing architecture and control boundaries. The architecture review must compare actual code and behaviour with these documents rather than treating documentation as operational proof.

## 7. Risks And Unknowns

- **Compatibility and vocabulary.** Existing statuses/layouts and consumers may rely on present values. PRD/SD must decide precise representation and localization after reviewing those dependencies; the examples are intent, not prescribed new enum values.
- **Source precedence.** Run-specific next actions, QA findings and general policy results can express different levels of detail. Their valid relationship must be established through the current authoritative owners, not by assuming report text always overrides policy.
- **Atomicity and recovery.** Some existing operations may permit a valid control write while backlog synchronization is skipped with a reason. The design must preserve justified behaviour and expose it clearly rather than silently claiming cross-file atomicity that does not exist.
- **Freshness and scale.** Existing entries can lack linked Runs or reliable current evidence. Avoid unbounded scans or full report reads merely to render a list; identify partial coverage and the bound observation used.
- **Existing working tree and related Runs.** UI fixes and adjacent governed work already exist. Brownfield Review must establish their actual current scope/evidence and separate this increment without rewriting approved artefacts or retroactively authorizing earlier changes.
- **Deferred design choices.** Exact columns, display phrases, mapping representation, update coverage and bounded handling of older entries belong to PRD/SD after the required architecture/flow examination. The requested outcome and authority boundaries are complete; these are solution choices, not missing user intent.

## 8. Next Step

Review this unapproved UR. Approve only with a new deliberate `Approval: UR` tied to its current presentation, request revision or decline. After approval, perform the existing Brownfield Review with architecture/flow examination and Mode/Slice selection before subsequent product/design preparation. Creating this UR does not authorize implementation, QA approval, archival or release.

## AGDF Approval Summary (de; source=en)

**Problem.** Der letzte gespeicherte aktive Backlog-Eintrag zeigt „In Progress“, obwohl ein QA-Bericht vorliegt. Dessen Ergebnis ist `revise`: Fünf Feststellungen sind behoben, QF-001 zur aktuellen sichtbaren Cockpit-Lesbarkeit bleibt offen. Der Run steht aktiv bei QA; QA- und UAT-Freigaben fehlen. Der allgemeine Status ist deshalb nicht falsch, erklärt aber die offene Arbeit nicht. Der nächste Schritt im Backlog bleibt allgemeiner als die konkrete Restaufgabe im Bericht. Anwender und Agenten müssen mehrere Quellen suchen und selbst zusammenführen.

**Ziel und Betroffene.** Repository-Owner, Agenten sowie Nutzer der kompakten und großen Cockpit-Ansicht erkennen direkt: Wo steht das Vorhaben, was ist konkret offen, was ist der nächste erlaubte Schritt und welche Quelle trägt diese Aussage? Das Backlog wird eine verständliche und zuverlässig gepflegte Zusammenfassung des kanonischen Run-Zustands.

**Umfang.** Zuerst werden Bedeutung und Aktualisierung des Backlogs verbessert. Arbeitsphase, Bericht vorhanden, QA-Ergebnis, Nacharbeit/Nachweis, Freigabe und Lebenszyklus bleiben getrennt. Konkrete offene Verpflichtungen erscheinen verständlich statt nur als pauschaler Arbeitsauftrag. Genaue Begriffe, Spalten und technische Repräsentation entscheiden die folgenden Produkt- und Designschritte.

**Architektur und Ablauf.** Vor der Umsetzung prüft der bestehende Brownfield-/Review-Ablauf die tatsächliche Kette: Kontrolloperation; Run-Zustand, Auswertung und registrierte Berichte; Backlog-Aktualisierung; Core-Leseprojektion; HTTP/MCP; Cockpit. Für jede Grenze werden Verantwortlichkeit, maßgebliche Quelle, Aktualisierungsereignisse, Bindung an Quellen/Revisionen, Wiederverwendung, doppelte Interpretation und Fehlerfälle geprüft. Befunde erhalten konkrete Entscheidungen, Maßnahmen und Prüfkriterien; es entsteht kein neues Gate.

**Verlässliche Pflege und Anzeige.** Die vorhandenen kanonischen Schreiber pflegen die Zusammenfassung unter den bestehenden Revisions-, Lock-, Siegel- und Transaktionsregeln. Relevante Berichtserfassung/Neubewertung, interne Schritte, Freigaben und Abschluss werden berücksichtigt. Wiederholung, Unterbrechung und parallele Arbeit dürfen Aktualisierungen nicht unbemerkt verlieren. Gespeicherte, frisch ausgewertete und veraltete/unverfügbare Angaben bleiben erkennbar. Markdown-Backlog, Core und beide Cockpit-Ansichten vermitteln denselben belegten Sinn; React führt keine eigenen Gate-Regeln ein.

**Nicht enthalten.** Keine zweite Kontrollablage oder Statushoheit, keine neuen Freigabegates, keine veränderte Gate-Reihenfolge, kein automatisches QA/UAT, kein Archivieren fremder Runs und keine automatische Fortsetzung oder Veröffentlichung. QF-001 des betrachteten Runs wird durch diese UR nicht geschlossen oder freigegeben. Keine umfassende Dashboard-Neugestaltung, weitere Hostintegration oder Git-Aktion. Die zuvor ohne AGDF vorgenommenen UI-Korrekturen sind vorhandener Arbeitsstand, keine Umsetzungsevidenz dieses neuen Runs.

**Abnahme.** Sieben Bedingungen gelten:

1. Bei QA `revise` mit einer benannten offenen Nachweispflicht erklärt das Backlog QA, die konkrete Restaufgabe und den nächsten Schritt. Im Beispiel: aktuelle große Cockpit-Darstellung beobachten, Lesbarkeit bewerten und QA erneut beurteilen; keine behauptete QA-Freigabe oder Fertigstellung.
2. Bericht fehlt, QA `revise`/`block`, QA `pass` vor Freigabe, erteilte QA-Freigabe bei weiterer offener Arbeit, UAT/Abschluss offen und abgeschlossen sind unterscheidbar. Kompakte Routen erhalten keine erfundenen QA/UAT-Pflichten. Die Semantik hat einen bestehenden kanonischen Owner.
3. Eine dokumentierte Architektur-/Ablaufprüfung benennt tatsächliche Owner, Quellen und Aktualisierungswege. Relevante Lücken bekommen Maßnahmen und Prüfkriterien vor Umsetzung; vorhandene Verantwortlichkeiten werden wiederverwendet.
4. Nach relevanten erfolgreichen Kontrollübergängen passt die gespeicherte Zusammenfassung zur gebundenen Revision und Evidenz. Wiederholung, Recovery und parallele Updates verlieren keine fremden Änderungen, übertragen keine Freigaben und behaupten keine übersprungenen Aktualisierungen. Sinnvolle Tests belegen den gewählten Konsistenzvertrag.
5. Gespeicherte, ausgewertete, fehlende und veraltete Daten sind erkennbar. Fehlende/ungültige Quellen, mehrdeutige Zuordnungen und nicht unterstützte Tabellen werden ausdrücklich begrenzt oder diagnostiziert. Identität, Links und beabsichtigter Bereich bleiben erhalten, solange keine erlaubte Kontrolloperation sie ändert.
6. Backlog, Core und beide Ansichten vermitteln für denselben Prüfstand denselben verständlichen Inhalt. Scrollen und beiläufiges Nachladen ändern weder abgeschlossene Suche noch Run-Einstufung. Lesen schreibt keinen Kontrollzustand.
7. Nachweise prüfen Übergänge, Fehler, Kompatibilität und lesbare schmale/breite Darstellung. Dokumentation erklärt Begriffe, Owner, Aktualisierung und Aktualität. QA trennt automatisierte, Quellen-, Protokoll-, Browser- und tatsächlich beobachtete Hostevidenz.

**Quellen und Zuständigkeit.** Dein Auftrag begründet die UR. `MASTER_BACKLOG.md` enthält gespeicherte Einträge; `RUN_STATE.md`, registrierte Berichte und Freigabeevidenz bestimmen den Run-Zustand. Vorhandene Owner sind `run-backlog.js`, `run-backlog-writer.js`, `run-steps.js`, `run-recording.js`, `run-step-transaction.js`, Gate-/Transition-Auswertung und Core-Lesedienste. HTTP/MCP vermittelt, React stellt dar. Die bestehenden URs zu Backlog-Listenauswahl und veraltetem nächsten Schritt sind Wiederverwendungs- und Abgrenzungsquellen, keine übertragene Freigabe.

**Risiken und offene Designfragen.** Zu prüfen sind Abhängigkeiten von Statuswerten/Tabellen, berechtigte run-spezifische Aktionen gegenüber allgemeinen Policy-Texten und QA-Aufgaben, Grenzen der Transaktions-/Recovery-Pfade sowie sichtbare übersprungene Aktualisierungen. Alte/unverknüpfte Einträge und große Bestände dürfen keine unbeschränkten Scans erzwingen. Vorhandene UI-Änderungen und benachbarte Runs sind sauber abzugrenzen. Präzise Begriffe, Felder, Update-Abdeckung und Kompatibilitätsstrategie sind nach der Architekturprüfung in PRD/SD zu entscheiden; die Nutzeranforderung ist geklärt.

**Nächster Schritt.** Diese UR prüfen und neu bewusst mit `Approval: UR` freigeben, Überarbeitung verlangen oder ablehnen. Danach folgt der bestehende Brownfield Review mit Architektur-/Ablaufprüfung und Mode/Slice-Entscheidung. Die UR-Erstellung erlaubt noch keine Umsetzung oder spätere Gate-Freigabe.
