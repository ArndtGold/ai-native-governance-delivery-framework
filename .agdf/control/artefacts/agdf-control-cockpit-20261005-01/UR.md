# UR: Local read-only AGDF control cockpit

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-05
Owner: Arndt Gold

## 1. Problem

Understanding a delivery run currently requires navigating `.agdf/control`, opening separate run and artefact documents, and consulting control evaluations. The user requested a React application for this folder and agreed to start with the proposed local, read-only cockpit. The intended benefit is to reduce time spent searching, associating and comparing run information while retaining visible evidence and human decision authority.

## 2. Goal

Provide a locally running React cockpit through which a user can find a run, understand its current evaluated control state, and inspect its associated artefacts and evidence. `.agdf/control` remains the canonical persisted source; existing AGDF Core services remain responsible for control interpretation and rules.

## Affected Users

The repository maintainer and people reviewing AGDF delivery runs who need an overview of progress, blockers, evidence and pending decisions. The first supported context is one explicitly selected local AGDF repository.

## 3. Scope

- A run overview showing the run identity and objective, lifecycle, current gate, decision, blockers and pending approvals where supplied by canonical evaluation.
- A run detail showing evaluated control information: what is approved, what evidence is missing, and the next permitted action. Distinguish persisted document statements from evaluated current state when they differ.
- An artefact view for registered run documents, including UR, PRD, SD, TP, reviews and referenced evidence supported by the first slice. Show source references and revision context so the user can associate content with the correct run.
- A local read-only access boundary connecting React to existing Core readers and evaluators. Determine the minimal additional typed reading capabilities during Brownfield Review and design; preserve existing owners rather than duplicate governance parsing or rules in React.
- Clear loading, empty, unavailable, invalid and changed-state handling. A failed or incomplete read must not appear as an empty successful inventory or a verified permissive state.
- Local startup instructions and focused verification of real repository data, read-only behaviour and the three user journeys.

## 4. Non-Goals

- Editing artefacts, creating runs, submitting approvals, changing gates, executing agent work or triggering VCS operations through the cockpit.
- A second database, copied governance rules, a new approval authority or a parallel workflow source of truth.
- Cloud hosting, shared multi-user operation, remote repository access, deployment, publication or release.
- MCP App embedding and new host-specific installations in this initial slice. Reuse of existing Core services is required; transport and future embedding remain later design decisions.

## 5. Acceptance Signals

- From the overview, a user can select a run, inspect its detail, and open its registered artefacts with their source and revision context.
- Presented gate status, blockers and next permitted actions agree with the canonical evaluation of the same selected repository/run snapshot; contradictory persisted prose is not silently presented as current authority.
- Active and completed runs can be distinguished without implying that QA, UAT and lifecycle completion are interchangeable.
- Empty inventories, missing artefacts, invalid control and read failures are visibly distinguishable; stale or changed data is identified or refreshed before being presented as current.
- Using the cockpit leaves the selected repository's `.agdf/control` files unchanged, including approval and presentation records.
- Reading is bounded to the selected repository's allowed control resources; arbitrary filesystem access is not exposed through the browser interface.
- Local startup and verification instructions are reproducible. Browser observations cover the three intended journeys using real repository data. Time savings remain an intended benefit until measured, not a claimed result.

## 6. Existing Source Of Truth

- `.agdf/control/runs/`: canonical persisted run records, with one `RUN_STATE.md` per run directory.
- `.agdf/control/artefacts/`: registered delivery artefacts and evidence, grouped by run directory.
- `packages/core/lib/index.js` and `packages/core/lib/control-inspect/service.js`: existing Core service and inspection ownership.
- `packages/core/lib/control-state/`: existing control reading and evaluation ownership.
- `packages/core/lib/control-read-boundary.js`: existing bounded control-read validation to assess for reuse.
- `packages/mcp-server/src/server.js` and `packages/mcp-server/README.md`: existing adapter and read-only inspection capabilities; the MCP server is currently documented as an unreleased development component.
- `plugins/agdf/control/templates/artefacts/UR.md`: canonical UR template used because the returned repository-local template path is absent. No template migration is part of this scope.

## 7. Risks And Unknowns

- Brownfield Review must establish which existing readers expose run inventories, artefact relationships and evaluated status, and identify the owner of any missing read capability.
- Persisted narrative and evaluated control state may disagree; the cockpit must expose provenance and avoid creating misleading status summaries.
- Design must define a consistent snapshot/reload strategy for concurrent agent updates and safe rendering of local document content.
- The local service must prevent path traversal, symlink escapes and unsolicited browser-origin access. Exact mechanisms and test coverage belong to SD/TP.
- Packaging, startup command, package placement (proposed `packages/control-ui`), supported document previews, UI language and transport are downstream design choices. The initial assumption is a German-facing local interface based on this conversation; artifact language remains English.
- Broad changes to active runs or existing packaging are not implied by this cockpit requirement.

## 8. Next Step

Review and approve this UR, then perform the existing Brownfield Review and Mode/Slice decision before PRD, design and implementation.

`Approval: UR`

## AGDF Approval Summary (de; source=en)

- Problem und Ziel: Ein lokal laufendes React-Cockpit soll den Aufwand für das Suchen, Zuordnen und Vergleichen von AGDF-Runs, Dokumenten und Evidenz reduzieren. Zeitersparnis ist ein angestrebter Nutzen und muss erst gemessen werden.
- Nutzer: Repository-Verantwortliche und Personen, die Delivery-Runs prüfen. Der erste Umfang umfasst ein ausdrücklich ausgewähltes lokales AGDF-Repository.
- Run-Übersicht: Identität, Ziel, Lebenszyklus, aktuelles Gate, Entscheidung, Blocker und offene Freigaben anzeigen, soweit die kanonische Auswertung sie liefert.
- Run-Detail: Genehmigungen, fehlende Evidenz und nächste erlaubte Schritte nachvollziehbar darstellen. Widersprüche zwischen gespeichertem Beschreibungstext und aktueller Auswertung sichtbar machen.
- Artefakte: Registrierte UR, PRD, SD, TP, Reviews und unterstützte Evidenz mit Quellenverweisen und Revisionskontext lesbar öffnen.
- Verantwortlichkeiten: `.agdf/control` bleibt der kanonische Datenbestand; bestehende Core-Dienste lesen und bewerten den Kontrollzustand. Fehlende Lesefunktionen erhalten einen eindeutigen Besitzer; React dupliziert keine Governance-Regeln.
- Abgrenzung: In dieser ersten Version sind keine Änderungen, Freigaben, Run-Erstellung, Gate-Wechsel, Agentenaktionen oder Git-Operationen über die Oberfläche vorgesehen. Keine zweite Datenbank oder parallele Workflow-Autorität.
- Weitere Abgrenzung: Cloud-Betrieb, mehrere gemeinsame Nutzer, Remote-Repositories, Deployment, Veröffentlichung, Release, MCP-App-Einbettung und neue Host-Installationen gehören nicht zum ersten Umfang.
- Erfolgskriterien: Übersicht, Run-Auswahl, Detail und Artefaktanzeige funktionieren mit echten Repository-Daten. Status und nächste Schritte stimmen mit der Core-Auswertung desselben Datenstands überein. Aktive und abgeschlossene Runs bleiben unterscheidbar; QA, UAT und Abschluss werden getrennt dargestellt.
- Datenqualität: Ladezustand, leere Listen, fehlende Artefakte, ungültiger Kontrollzustand und Lesefehler sind unterscheidbar. Veraltete oder veränderte Daten werden kenntlich gemacht oder vor einer aktuellen Darstellung neu geladen.
- Lesegrenze: Die Nutzung verändert keine Kontroll-, Freigabe- oder Präsentationsdateien. Die Oberfläche erlaubt ausschließlich begrenzte Lesezugriffe auf die erlaubten Kontrollressourcen des ausgewählten Repositories.
- Nachweise: Lokaler Start und Prüfung sind reproduzierbar dokumentiert; Browser-Beobachtungen prüfen die drei Nutzerwege mit echten Daten sowie die rein lesende Nutzung.
- Offene technische Fragen: Brownfield Review klärt vorhandene Reader, Inventar, Beziehungen und Auswertungen. Design und Task Plan klären konsistente Datenstände, sicheres Dokumentrendering, Pfad- und Symlink-Grenzen sowie den Schutz vor unerwünschten Browserzugriffen.
- Annahmen: Eine deutsche Oberfläche und `packages/control-ui` sind Vorschläge für die spätere Ausarbeitung. Paketierung, Startkommando, Dokumentvorschau und Transport bleiben Designentscheidungen; bestehende Runs werden dadurch nicht allgemein geändert.
- Quellen: Kanonische Run- und Artefaktverzeichnisse sowie bestehende Core- und MCP-Komponenten. Die UR verwendet die kanonische Plugin-Vorlage, weil die lokale Vorlagendatei fehlt; eine Vorlagenmigration gehört nicht zum Umfang. Der MCP-Server ist derzeit als unveröffentlichte Entwicklungskomponente dokumentiert.
- Nächster Schritt: Diese UR prüfen und gezielt freigeben. Danach folgen Brownfield Review und Mode-/Slice-Entscheidung vor PRD, Design und Implementierung. Die UR-Freigabe allein erlaubt noch keine Implementierung.
