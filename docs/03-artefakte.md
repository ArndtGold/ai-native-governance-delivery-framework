# 03 — Artefakte

Dieses Dokument beschreibt die Artefakte des Frameworks.

`01-framework-ueberblick.md` erklärt den Ablauf. `02-gates.md` erklärt, wann ein Schritt weitergehen darf, überarbeitet werden muss oder blockiert. Dieses Dokument beschreibt deshalb nicht noch einmal die Gate-Entscheidungen, sondern die Frage:

> Welche Artefakte müssen entstehen, damit Entscheidungen, Umsetzung und Nachweise nachvollziehbar bleiben?

Ein Artefakt ist dabei nicht einfach ein Dokument. Es ist ein belastbares Zwischenergebnis im Delivery-Fluss. Es hält fest, was verstanden, entschieden, geplant, umgesetzt oder nachgewiesen wurde.

## Abgrenzung zu `02-gates.md`

`02-gates.md` bewertet Reife und Entscheidungsfähigkeit. Dort stehen Statuslogik, Gate-Checks, Blocker und die Frage, ob das Vorhaben in die nächste Phase wechseln darf.

`03-artefakte.md` beschreibt die Gegenstände, auf die sich diese Entscheidungen stützen.

Kurz gesagt:

```text
Gates entscheiden.
Artefakte belegen.
```

Dieses Dokument vermeidet daher bewusst, die `pass`-, `revise`- und `block`-Logik pro Gate zu wiederholen. Entscheidend ist hier, welche Rolle ein Artefakt im roten Faden spielt, welche Mindestinhalte es braucht und welche typischen Fehler seine Nachvollziehbarkeit schwächen.

## Grundidee

Ein Artefakt beantwortet immer eine konkrete Frage:

- Was ist das Anliegen?
- Was ist verbindlich vereinbart?
- Welche Lösungsidee wurde gewählt?
- Welche Arbeit ist geplant?
- Was sagt der Bestand?
- Was wurde umgesetzt?
- Was wurde geprüft?
- Was hat sich geändert?

Artefakte sind damit keine Bürokratie. Sie verhindern, dass ein Team oder Agent auf Basis stiller Annahmen weiterarbeitet.

Ein gutes Artefakt muss drei Dinge leisten:

1. Es muss verständlich sein.
2. Es muss prüfbar sein.
3. Es muss auf seine Grundlage zurückführen.

## Artefakte sind keine Implementierung

In den frühen Phasen geht es nicht darum, möglichst schnell Code oder technische Details zu erzeugen.

User Requirement, `PRD`, Solution Design und Task & Test Plan sollen Orientierung, Entscheidung und Nachvollziehbarkeit schaffen. Sie dürfen nicht zu versteckten Implementierungsanleitungen werden.

Das bedeutet:

- Anforderungen beschreiben, was gelten soll.
- Design beschreibt die Lösung auf konzeptioneller Ebene.
- Der Task & Test Plan beschreibt steuerbare Arbeit und Prüfbarkeit.
- Implementierungsdetails gehören erst in die Implementierungsphase.

Diagramme, Artefakt-Templates und grobe Strukturbeschreibungen sind erlaubt, wenn sie der Verständlichkeit und Governance dienen. Sie dürfen aber keine Hintertür für vollständige Runtime-Contracts, Datenbankschemata, Migrationspläne oder ausführbare Implementierungsschritte sein.

## Minimale Artefaktstruktur

Die Systeminstruktion beschreibt ein Artefakt als strukturiertes Dokument mit drei Kernbereichen:

```text
meta
content
approval
```

`approval` ist optional. Nicht jedes Artefakt braucht eine formale Freigabe. Manche Artefakte enthalten stattdessen eine Review- oder Gate-Entscheidung.

Referenzen gehören in der strukturierten Form typischerweise in `meta.refs`. In einer lesbaren Markdown-Ansicht können sie auch als eigener Abschnitt erscheinen.

### meta

`meta` beschreibt Identität, Version und Audit-Informationen des Artefakts.

Typische Felder:

- stabile ID
- Version
- Status
- Erstellungs- und Änderungszeitpunkt
- Hash über den fachlichen Inhalt
- Referenzen auf vorherige Artefakte
- optionaler Verweis auf die Vorgängerversion

### content

`content` enthält den eigentlichen fachlichen Inhalt.

Der Inhalt hängt vom Artefakttyp ab. Ein `Product Requirements Doc` enthält andere Informationen als ein Task Plan, eine Brownfield Analysis oder ein QA-Nachweis.

Wichtig ist: Semantische Änderungen am Inhalt müssen sichtbar werden. Sie dürfen nicht stillschweigend in einer neuen Version verschwinden.

### approval oder decision

Nicht jedes Artefakt braucht die gleiche Art von Freigabe.

Der `PRD` braucht eine explizite Freigabe, weil er als verbindlicher Produktvertrag dient. Andere Artefakte können eine Review-Entscheidung, Gate-Entscheidung oder Statusbewertung enthalten.

Entscheidend ist, dass klar bleibt:

- Wer oder was hat entschieden?
- Was wurde entschieden?
- Auf welcher Grundlage wurde entschieden?
- Welche Einschränkungen bleiben bestehen?

### refs

Referenzen verbinden Artefakte miteinander.

Ein Artefakt sollte erkennbar machen, worauf es basiert. Ein Solution Design verweist auf das `Product Requirements Doc`. Ein Task & Test Plan verweist auf `Product Requirements Doc` und Solution Design. Code Deliverables verweisen auf den Task & Test Plan. QA verweist auf Umsetzung, Tests und Review-Ergebnisse.

Ohne diese Referenzen entsteht schnell der Eindruck von Ordnung, obwohl der rote Faden fehlt.

## Fokus dieses Dokuments

Dieses Dokument konzentriert sich zunächst bewusst auf die Artefakte, die den steuernden Kern des Frameworks bilden:

```text
User Requirement
Product Requirements Doc
Solution Design
Task & Test Plan
```

Diese vier Artefakte entscheiden darüber, ob aus einem Anliegen ein belastbarer, steuerbarer und prüfbarer Delivery-Fluss entstehen kann.

Andere Artefakte wie Brownfield Review, Brownfield Analysis, Code Deliverables, Task Plan Review, QA Evidence oder Change Artefacts bleiben wichtig. Sie werden aber nicht in diesem Dokument vertieft, solange die Freigabelogik für UR, PRD, SD und TP noch nicht sauber steht.

## Freigabelogik für Kernartefakte

Die aktuelle Systeminstruktion normiert die explizite Freigabe bisher vor allem für das `Product Requirements Doc`. Für das Framework reicht das nicht aus.

Mindestens diese vier Artefakte brauchen eine klare Freigabelogik:

| Artefakt                   | Freigabe bedeutet                                                             | Wirkung                                       |
|----------------------------|-------------------------------------------------------------------------------|-----------------------------------------------|
| `User Requirement`         | Anliegen, Ziel, Kontext und offene Fragen sind ausreichend verstanden         | Grundlage für das `Product Requirements Doc`  |
| `Product Requirements Doc` | Scope, Akzeptanzkriterien, Non-Goals und Constraints sind verbindlich         | fachliche Single Source of Truth              |
| `Solution Design`          | Das Lösungskonzept ist als Ableitung aus dem Produktvertrag tragfähig         | Grundlage für den Task & Test Plan            |
| `Task & Test Plan`         | Aufgaben, Abhängigkeiten, Akzeptanzbezug und Nachweise sind steuerbar geplant | Grundlage für Umsetzung und spätere Prüfung   |

Diese Freigaben sind keine dekorativen Statuslabels. Sie markieren, dass ein Artefakt als Grundlage für den nächsten Schritt verwendet werden darf.

Wichtig ist: Die Freigaben haben unterschiedliche Bedeutung.

Das `Product Requirements Doc` ist die zentrale fachliche Freigabe. Er legt verbindlich fest, was gelten soll.

UR, SD und TP brauchen ebenfalls Freigaben, aber sie ändern nicht die fachliche Verbindlichkeit des Produktvertrags. Sie bestätigen jeweils, dass das betreffende Artefakt für seine Rolle im Ablauf reif genug ist.

## Normierte Freigaben

Für die Kernartefakte braucht es eine eindeutige Form der Freigabe.

Diese Freigabe muss erkennbar machen:

- welches Artefakt freigegeben wurde
- welche Version gemeint ist
- wer oder welche Rolle die Freigabe erteilt hat
- wann die Freigabe erfolgt ist
- ob Einschränkungen oder offene Punkte bestehen

Eine Freigabe darf sich nicht auf ein loses Gespräch, eine implizite Zustimmung oder eine unklare Dokumentversion beziehen. Sie muss nachvollziehbar einem Artefaktstand zugeordnet werden können.

Für das `Product Requirements Doc` gilt zusätzlich: Freigegeben wird der verbindliche Vertragsteil. Eine Arbeitsfassung, ein Appendix oder lose Notizen werden dadurch nicht automatisch verbindlich.

## Übergangsregeln

Aus den Freigaben ergeben sich einfache Übergangsregeln:

| Nächster Schritt                     | Benötigte Freigabe                                           |
|--------------------------------------|--------------------------------------------------------------|
| Product Requirements Doc ausarbeiten | `UR` freigegeben oder bewusst mit Einschränkungen akzeptiert |
| Solution Design erstellen            | `PRD` freigegeben                                            |
| Task & Test Plan erstellen           | `SD` freigegeben                                             |
| Implementierung starten              | `PRD`, `SD` und `TP` freigegeben                             |

Diese Regeln verhindern, dass ein Agent aus einem ungeklärten Anliegen direkt ein Design, einen Task Plan oder Code ableitet.

## Freigabe ist nicht gleich Freigabe

Die vier Freigaben haben unterschiedliche Verantwortung:

### UR-Freigabe

Die UR-Freigabe bestätigt nicht, dass bereits Anforderungen vollständig entschieden sind.

Sie bestätigt nur:

- Das Anliegen wurde verstanden.
- Ziel und Kontext sind ausreichend beschrieben.
- offene Fragen und Annahmen sind sichtbar.
- bekannte Brownfield-Hinweise sind nicht verloren gegangen.
- es ist verantwortbar, daraus einen `Product Requirements Doc` zu erarbeiten.

### Product Requirements Doc-Freigabe

Die `Product Requirements Doc`-Freigabe ist die stärkste fachliche Freigabe im Framework.

Sie bestätigt:

- Scope ist verbindlich.
- Out-of-Scope ist sichtbar.
- Akzeptanzkriterien sind prüfbar.
- Non-Goals sind festgehalten.
- Constraints und Risiken sind bekannt.
- spätere Artefakte dürfen darauf aufbauen.

Ohne diese Freigabe darf kein Solution Design als verbindliche Ableitung entstehen.

### SD-Freigabe

Die SD-Freigabe bestätigt, dass das Solution Design als konzeptionelle Lösung tragfähig ist.

Sie bestätigt nicht, dass Implementierungsdetails bereits feststehen.

Sie bestätigt:

- Das Design führt auf den `Product Requirements Doc` zurück.
- Verantwortlichkeiten sind verständlich.
- wichtige Schnittstellen und Datenflüsse sind konzeptionell beschrieben.
- relevante Risiken und Trade-offs sind sichtbar.
- das Design verändert den Produktvertrag nicht stillschweigend.

### TP-Freigabe

Die TP-Freigabe bestätigt, dass Umsetzung und Prüfung ausreichend geplant sind.

Sie bestätigt:

- Tasks sind aus Vertrag und Design ableitbar.
- jede relevante Aufgabe hat einen Zweck.
- Akzeptanzkriterien sind abgedeckt.
- Tests oder Nachweise sind benannt.
- Abhängigkeiten und Risiken sind sichtbar.
- die spätere Umsetzung kann gegen diesen Plan geprüft werden.

Ohne TP-Freigabe darf keine Implementierung als planbasierte Delivery starten.

## Lesbare Ansicht und strukturierte Form

Die Systeminstruktion enthält JSON-nahe Templates. Diese Templates sind nützlich für Speicherung, Vergleich, Audit und spätere Automatisierung.

Für die Arbeit im Team sollte aber zuerst die lesbare Ansicht verständlich sein.

Ein Artefakt sollte daher in zwei Formen denkbar sein:

```text
Lesbare Ansicht
  für Menschen, Reviews, Diskussionen und Gate-Entscheidungen

Strukturierte Form
  für Speicherung, Traceability, Hashing, Tooling und Automatisierung
```

Die lesbare Ansicht ist der Standard. Die strukturierte Form sollte daraus ableitbar sein.

Wichtig ist: Struktur darf nicht mit Implementierung verwechselt werden. Ein JSON-Template für ein Artefakt beschreibt Governance-Daten. Es ist keine Runtime-API, kein Datenbankschema und kein Implementierungsvertrag.

## Artefaktfluss

Der typische Artefaktfluss sieht so aus:

```text
User Requirement
  ↓
Brownfield Review, falls Bestand betroffen
  ↓
Product Requirements Doc
  ↓
Solution Design
  ↓
Task & Test Plan
  ↓
Brownfield Analysis, falls Bestand betroffen
  ↓
Code / Implementation
  ↓
Task Plan Review
  ↓
QA Evidence
  ↓
Release / Outcome Decision
```

Der Fluss ist nicht deshalb wichtig, weil jedes Dokument formal abgearbeitet werden soll. Er ist wichtig, weil spätere Artefakte frühere Artefakte nicht stillschweigend ersetzen dürfen.

## Artefaktkatalog

### User Requirement

Der User Requirement hält das ursprüngliche Anliegen fest.

Er ist noch kein Produktvertrag und noch kein Design. Er dient dazu, Problem, Ziel, betroffene Nutzer, bekannte Constraints, Risiken und offene Fragen sichtbar zu machen.

Mindestinhalt:

- Problem oder Anlass
- gewünschtes Ziel
- betroffene Nutzer oder Rollen
- bekannte Constraints
- offene Fragen
- Annahmen
- erste Risiken
- Hinweise auf Brownfield-Kontext

Wert im Framework: Der User Requirement macht sichtbar, ob spätere Artefakte das ursprüngliche Anliegen noch treffen oder bereits in eine andere Richtung laufen.


### Brownfield Review

Der Brownfield Review gehört früh in den Prozess, wenn bestehende Systeme betroffen sein könnten.

Er ist noch keine tiefe Codeanalyse. Er soll verhindern, dass ein Brownfield-Problem wie ein Greenfield-Problem behandelt wird.

Mindestinhalt:

- möglicherweise betroffene bestehende Systeme
- bekannte Produktlogik
- relevante Schnittstellen, Datenmodelle oder Betriebsabhängigkeiten
- bekannte technische Schulden
- fachliche oder technische Ownership
- Bestandsthemen, die in den `Product Requirements Doc` übernommen werden müssen

Wert im Framework: Der Brownfield Review bringt Bestandsthemen früh genug in die Produktklärung.

### Product Requirements Doc

Der `Product Requirements Doc` ist der verbindliche Produktvertrag.

Er beschreibt nicht alle Details des späteren Systems. Er legt den stabilen fachlichen Kern fest: Scope, Akzeptanzkriterien, Non-Goals, Constraints und Erfolgskriterien.

Mindestinhalt:

- Problem und Ziel
- Zielgruppe oder betroffene Rollen
- Scope
- Out-of-Scope
- Akzeptanzkriterien
- Non-Goals
- Erfolgskriterien oder KPIs
- Constraints
- Annahmen und Risiken
- relevante Brownfield-Erkenntnisse

Wert im Framework: Der `Product Requirements Doc` ist die wichtigste Single Source of Truth. Spätere Artefakte dürfen ihn nicht stillschweigend uminterpretieren.

### Solution Design

Das Solution Design beschreibt, wie der `Product Requirements Doc` konzeptionell erfüllt werden soll.

Es erklärt Architektur, Komponenten, Verantwortlichkeiten, grobe Schnittstellen, Datenflüsse und wichtige Trade-offs.

Mindestinhalt:

- Bezug zum `Product Requirements Doc`
- betroffene Komponenten
- Verantwortlichkeiten
- grobe Schnittstellen
- relevante Datenflüsse
- Sicherheits-, Datenschutz- und Betriebsaspekte
- wichtige Alternativen und Trade-offs
- Brownfield-Auswirkungen, falls relevant

Wert im Framework: Das Solution Design macht sichtbar, warum eine Lösung tragfähig ist, ohne bereits die Implementierung vorwegzunehmen.

### Task & Test Plan

Der Task & Test Plan übersetzt Produktvertrag und Design in steuerbare Arbeit.

Er verbindet Aufgaben mit Akzeptanzkriterien, Risiken und Nachweisen.

Mindestinhalt:

- Tasks mit stabiler ID
- Zweck je Task
- Bezug zu Akzeptanzkriterien oder Designentscheidungen
- Abhängigkeiten
- relevante Risiken
- Test- oder Nachweisidee je Task
- Priorität oder Reihenfolge
- klare Definition, wann ein Task erledigt ist

Wert im Framework: Der Task & Test Plan verhindert, dass agentische Umsetzung produktiv wirkt, aber am freigegebenen Ziel vorbeiläuft.

### Brownfield Analysis

Die Brownfield Analysis liegt vor der Implementierung, wenn bestehender Code oder bestehende Systemlogik betroffen ist.

Sie ist konkreter als der frühe Brownfield Review. Sie prüft den genehmigten Task & Test Plan gegen den realen Bestand.

Mindestinhalt pro relevante Aufgabe:

- betroffene bestehende Artefakte
- aktuelle Abdeckung im Bestand
- vorhandene Logik, die wiederverwendet werden kann
- empfohlene Reuse-Strategie
- erwarteter Change Impact
- Risiko neuer Parallelstrukturen
- offene Drift-Fragen
- Empfehlung für den minimal-invasiven Umsetzungspfad

Wert im Framework: Die Brownfield Analysis verhindert, dass neue Funktionen neben vorhandenen Verantwortlichkeiten entstehen, obwohl der Bestand eigentlich erweitert oder bereinigt werden müsste.

### Code Deliverable

Code Deliverables entstehen erst, wenn die Voraussetzungen für Umsetzung erfüllt sind.

Sie umfassen nicht nur Code. Sie können auch Tests, Konfigurationen, Migrationen, Dokumentationsänderungen oder technische Nachweise enthalten.

Mindestinhalt:

- geänderte Dateien oder Bereiche
- Bezug zu Tasks
- ergänzte oder angepasste Tests
- ausgeführte Checks
- nicht ausgeführte Checks
- verbleibende Risiken oder Einschränkungen
- Out-of-Scope-Änderungen, falls vorhanden

Wert im Framework: Code wird nicht isoliert betrachtet, sondern gegen Plan, Vertrag und Nachweise eingeordnet.

### Task Plan Review

Der Task Plan Review prüft nach der Umsetzung, ob der genehmigte Task & Test Plan erfüllt wurde.

Er bewertet jede relevante Aufgabe einzeln.

Mindestinhalt:

- `task_id`
- Status pro Task
- Bewertung der Akzeptanzkriterien
- Evidenz
- nicht verifizierte Punkte
- Abweichungen vom Plan
- Out-of-Scope-Änderungen
- finale Einschätzung für das nächste Gate

Wert im Framework: Der Task Plan Review trennt plausible Umsetzung von belegter Planerfüllung.

### QA Evidence

QA Evidence bewertet, ob die Lieferung verantwortbar freigegeben werden kann.

Sie stützt sich auf Tests, Checks, Task Plan Review, bekannte Defects, Risiken und nicht verifizierte Punkte.

Mindestinhalt:

- Zusammenfassung der Prüfergebnisse
- Bezug zu Akzeptanzkriterien
- ausgeführte Tests und Checks
- nicht ausgeführte Prüfungen
- Defects
- Restrisiken
- Empfehlung oder Ergebnis

Wert im Framework: QA Evidence verhindert, dass Qualität behauptet wird, ohne dass die Nachweise sichtbar sind.

### Change Artefacts

Änderungen an freigegebenen Inhalten brauchen eigene Nachvollziehbarkeit.

Das gilt besonders, wenn sich Scope, Akzeptanzkriterien, Non-Goals, Sicherheitsanforderungen, Datenschutzfragen oder grundlegende Designentscheidungen ändern.

Typische Change Artefacts:

- Change Note
- PRD Delta
- Change Request
- Decision Record
- Diff Summary

Mindestinhalt:

- Was ändert sich?
- Warum ändert es sich?
- Welche Artefakte sind betroffen?
- Welche Risiken entstehen?
- Welche Entscheidung wurde getroffen?
- Muss ein früheres Gate erneut geprüft werden?

Wert im Framework: Change Artefacts schützen davor, dass ein Projekt formal geordnet aussieht, während sich der eigentliche Vertrag still verändert.


## Artefakte und Jira

Ein User Requirement darf zunächst in Jira entstehen oder dort organisiert werden.

Das ist sinnvoll, weil frühe Anliegen oft noch unscharf sind und erst einmal gesammelt, priorisiert oder zur Klärung eingeplant werden müssen.

Ein Jira-Issue kann also markieren:

> Dieses Anliegen soll mit Unterstützung eines LLMs geklärt und in belastbare Artefakte überführt werden.

Das bedeutet aber noch nicht, dass Umsetzung freigegeben ist.

Für UR gilt:

```text
Jira darf Intake und Planung organisieren.
Das UR-Artefakt hält den geklärten Kontext fest.
Die UR-Freigabe erlaubt den Übergang zur PRD-Ausarbeitung.
```

Wenn ein LLM oder Agent technisch aber nur noch einen Klick von der Code-Änderung entfernt ist, sollte die Implementierung
nicht durch ein loses Jira-Signal ausgelöst werden.

![Jira und Implementierungsstar LLM](../assets/Jira-und-Implementierungsstart-LLM.png)

Entscheidend ist nicht die Frage:

```text
Steht das Jira-Issue auf In Arbeit?
```

Entscheidend ist die Frage:

```text
Ist diese Arbeit durch freigegebene Artefakte gedeckt?
```

Jira kann sichtbar machen, dass Arbeit operativ eingeplant oder gestartet wurde. Es ist aber nicht die fachliche Freigabequelle.


### Was Jira nicht tun sollte

Jira darf Arbeit organisieren, aber nicht stillschweigend den Produktvertrag verändern.

Wenn ein Jira-Issue mehr verlangt als der PRD erlaubt, ist das kein normales Ticket-Update. Es ist ein Change.

Typische Warnsignale sind:

- ein Ticket erweitert Scope ohne PRD-Änderung
- ein Ticket verändert Akzeptanzkriterien ohne Freigabe
- ein Ticket erzeugt neue Designentscheidungen ohne SD-Bezug
- ein Task passt nicht zum Task & Test Plan
- Umsetzung startet nur wegen Ticketstatus, nicht wegen Artefaktfreigabe
- wichtige Annahmen stehen nur im Ticket und nicht im passenden Artefakt

Der rote Faden bleibt in den Artefakten. Jira macht ihn operativ sichtbar.


## Beispiel Artefakte zu Canvas Agent Builder (OpenAI-like).

### Beispiel: User Requirement

```md
# UR — Canvas Agent Builder (OpenAI-like)

## 1. Ziel / Problem
Teams wollen Agenten/Workflows wie im OpenAI Agent Builder **visuell** modellieren, testen und iterieren – ohne Setup-Hürden. Heute sind viele Ansätze entweder zu technisch (Code-first) oder zu abstrakt (keine echte Ausführbarkeit/Traceability).

## 2. Produktziel (User Outcome)
**User Outcome:** Ein Nutzer kann in wenigen Minuten einen Agenten-Workflow auf einer Canvas erstellen, ausführen (Preview), debuggen (Trace), versionieren (Publish) und als JSON exportieren – sodass aus dem visuellen Modell eine **reproduzierbare Systeminstruktion + Workflow-Definition** entsteht.

## 3. Zielgruppe (Personas)
1. **Product / Ops**: will Prozesse/Automationen als Agent-Flows bauen, ohne zu programmieren.
2. **Developer / ML Engineer**: will Agent-Flows prototypen, versionieren und später in Code/Runtime überführen.
3. **Solution Engineer / PreSales**: will Demos im Browser zeigen ("works instantly").

## 4. Scope (MVP)
### In-Scope
- **Visuelle Canvas** (Nodes/Edges) mit Drag/Drop, Selektion, Delete.
- **Node Library** (Start, Agent, If/Else, While, Approval, Transform, Set State, Tools (mock), Guardrails (mock), Connector (mock), End).
- **Inspector** zum Bearbeiten von Node-Konfigurationen.
- **Edge Mapping** (z. B. `state.result`, `state.last`, `input.*`) + Routing-Metadaten (`branch`, `role`).
- **Preview Run** (in-browser) mit:
    - deterministischem Execution-Loop
    - Node Runtime Status (running/ok/error/paused)
    - **Run Trace** (Inputs/Outputs pro Step)
    - **Human Approval** Pause/Resume (MVP: rerun mit gespeicherter Entscheidung)
- **Versionierung**: Publish erzeugt immutable Snapshot (v1, v2, …)
- **Export/Import**: JSON Export (Draft + Version) und Import per Paste
- **Embed Demo**: Chat-UI, die die **latest published version** ausführt
- **Persistenz**: LocalStorage

### Out-of-Scope (MVP)
- Multi-User / Collaboration / Sharing Links
- Server-side Execution / Durable Checkpoints / Queue
- Rechtemanagement, SSO
- Echtzeit-Observability (Metrics/Logs)
- Plugin/Marketplace System

## 5. Kern-User-Stories
1. **Canvas erstellen:** Als Nutzer kann ich Nodes hinzufügen und verbinden, um einen Flow zu modellieren.
2. **Konfigurieren:** Als Nutzer kann ich Konfiguration je Node im Inspector ändern.
3. **Ausführen:** Als Nutzer kann ich einen Flow mit JSON-Input ausführen und das Ergebnis sehen.
4. **Debuggen:** Als Nutzer sehe ich eine Step-by-Step Trace inkl. Errors.
5. **Pause/Resume:** Als Nutzer kann ich an einem Approval-Node stoppen und per Approve/Reject fortfahren.
6. **Versionieren:** Als Nutzer kann ich einen Stand publishen und später wieder laden.
7. **Exportieren:** Als Nutzer kann ich einen Draft oder eine Version exportieren und importieren.
8. **Demo/Embed:** Als Nutzer kann ich eine published Version über eine Chat-UI testen.

## 6. Funktionale Anforderungen
### 6.1 Canvas & Editing
- FR-1: Node Library listet alle Node Types.
- FR-2: Klick auf Node Type erzeugt Node auf Canvas.
- FR-3: Edges können via Handles verbunden werden.
- FR-4: Selektieren von Node/Edge öffnet Inspector.
- FR-5: Delete entfernt selektierte Node/Edge inkl. abhängiger Edges.
- FR-6: Undo/Redo (min. 20 Schritte, MVP: 60).

### 6.2 Node-Konfiguration
- FR-7: Jede Node hat `config` Objekt (typ-spezifisch).
- FR-8: Config im Inspector editierbar (Textarea/Input/Select/Checkbox).
- FR-9: Default Config wird beim Hinzufügen gesetzt.

### 6.3 Execution Engine (Preview)
- FR-10: Start Node seedet State via JSON.
- FR-11: Agent Node erzeugt Text-Output (MVP: mock).
- FR-12: If Node evaluiert Condition und routet über Edge-`branch`.
- FR-13: While Node evaluiert Condition, bounded via `maxIterations`, routet über Edge-`role`.
- FR-14: Approval Node pausiert Run und wartet auf Entscheidung.
- FR-15: Transform/Set State/Tools/Guardrails/Connector verändern State/Outputs.
- FR-16: End Node liefert Result anhand `state[resultPath]`.
- FR-17: Run Trace speichert pro Step: nodeId, type, input snapshot, output, status, timestamps.
- FR-18: UI zeigt Node Runtime Status.

### 6.4 Versionierung & Export
- FR-19: Publish erzeugt immutable Snapshot inkl. nodes/edges und Metadaten (versionNumber, createdAt).
- FR-20: Load Version setzt Canvas auf Snapshot.
- FR-21: Export Draft/Version lädt JSON herunter.
- FR-22: Import per Paste ersetzt aktuellen Graph.

### 6.5 Embed Demo
- FR-23: Embed Chat verwendet latest published version.
- FR-24: Chat sendet text input und zeigt assistant output.

## 7. Nicht-funktionale Anforderungen
- NFR-1: **Browser-only** (Demo), sofort im Browser ausführbar.
- NFR-2: Keine Backend-Abhängigkeit im MVP.
- NFR-3: Performant bei ~100 Nodes/200 Edges.
- NFR-4: Stabil: Execution Guard gegen Endlosschleifen.
- NFR-5: Verständliche Fehlermeldungen bei JSON/Expression errors.

## 8. Sicherheits-/Compliance-Hinweise (MVP)
- Keys/Secrets sollen **nicht** erforderlich sein (default: mock).
- **Kein LLM-Provider in Release-1** (browser-only): kein API-Key im Browser, keine externen Provider-Requests.
- **Vorgesehen (später, nicht Release-1):** Server-Komponente als **LLM-Proxy** (Provider-Aufruf serverseitig; Secrets nicht im Browser).

## 9. Akzeptanzkriterien (MVP)
- AC-1: Nutzer kann Start → Agent → End verbinden und erfolgreich ausführen.
- AC-2: Trace zeigt mindestens 3 Steps (Start/Agent/End) mit Input/Output.
- AC-3: If/While Routing funktioniert über Edge-Metadaten.
- AC-4: Approval pausiert Run und lässt per Approve/Reject fortfahren.
- AC-5: Publish erzeugt neue Version; Load setzt Canvas korrekt zurück.
- AC-6: Export/Import reproduziert den Graph deterministisch.
- AC-7: Embed Demo führt latest published version aus.

## 10. Messgrößen (Product Metrics)
- Time-to-first-run (TTFR): < 3 Minuten
- % Runs succeeded vs failed
- % Flows published
- Avg. nodes per flow

## 11. Risiken / Trade-offs
- Expression eval ist im MVP unsicher → später Sandbox/CEL.
- Browser-only Persistenz (LocalStorage) ist fragil → später Backend.
- Pause/Resume rerun statt echter Checkpoints → später durable execution.

## 12. Offene Punkte
1. Soll „Systeminstruktion generieren“ ein eigener Node sein oder ein Export-Format (Compiler Step)?
2. Welche Node-Typen sind für v1 wirklich notwendig (Minimum Node Set)?
3. Welche Output-Formate sollen beim Export standardisiert werden (z. B. `system_instructions`, `workflow`, `tools`)?
4. Export-JSON: **Provider-Feld wird bereits in Release-1 vorgesehen** (Forward-Compatibility für späteren „server“-Provider/LLM-Proxy).

## 13. Freigabe
- **Freigabe: UR**
- approved_at: 2026-01-11T17:29:39Z
```

### Product Requirements Doc

```md
# PRD
## Canvas Agent Builder (OpenAI-like) — Browser-only Demo (Canvas Preview)

### Meta
- id: PRD-1
- version: 2
- parent: sha256:45556be03a44d0c7e693ef98b733e63b4891a9f5d67c1f474b18f1cfe24a9dd7
- created_at: 2026-01-11T15:29:39Z
- author_role: PM (MainAgent)

## 1. Zusammenfassung
Ein browserbasierter, visuell orientierter **Agent/Workflow Builder** (ähnlich OpenAI) ermöglicht es Nutzern, agentische Workflows als Graph (Nodes/Edges) zu erstellen, zu konfigurieren, lokal zu testen (Preview Run), zu versionieren (Publish) und als JSON zu exportieren/importieren. Release-1 ist **browser-only** und nutzt im Preview-Run ausschließlich **mock**; ein späterer **Server LLM-Proxy** wird als Erweiterung vorgesehen (nicht Teil von Release-1).

## 2. Problem & Opportunity
### Problem
- Agentische Workflows sind schwer nachvollziehbar, wenn sie nur als Code/Prompt-Sammlung existieren.
- Nutzer brauchen schnelle Iteration: **visuell bauen → testen → nachvollziehen → exportieren**.

### Opportunity
- Ein Canvas-Editor senkt Einstiegshürden, erhöht Transparenz (Trace), fördert Wiederverwendung (Versionen) und erleichtert Kommunikation (JSON-Spec teilbar).

## 3. Product Goal (User Outcome)
**User können einen agentischen Workflow visuell entwerfen, konfigurieren, lokal ausführen (Preview), als Version veröffentlichen und als JSON exportieren/importieren.**

## 4. Zielgruppe & Personas
1) **Builder (Product/Automation)**
- Will schnell ein agentisches Flow-Konzept prototypen und intern teilen.

2) **Developer (Integration/Prototype)**
- Will ein strukturiertes JSON-Spec exportieren und später in echte Systeme überführen.

3) **Operator (Debug/Quality)**
- Will sehen, warum der Flow welche Entscheidung trifft (Trace + State).

## 5. Use Cases
- „Support-Agent“-Flow: Start → Agent → If → Tool → Approval → End
- „Onboarding“-Flow mit Guardrails und Connector-Mock
- Demo einer „Embed Chat“-Experience über eine veröffentlichte Version

## 6. Scope
### In Scope (MVP)
- Visual Canvas (Nodes/Edges)
- Inspector (rechts) für Node-Config und Edge-Mapping
- Preview Run (lokaler Executor) mit Trace + State
- Human Approval (Pause/Resume)
- Publish/Versions (Snapshots)
- Export/Import (JSON)
- Agent Provider: **mock** (offline)
- Export-JSON enthält bereits ein **Provider-Feld** für spätere Server-Integration (Forward-Compatibility)
- Local Persistence (localStorage)

### Out of Scope
- Backend/Server-Komponenten (inkl. LLM-Proxy), Accounts, Collaboration, Sharing Links
- Auth/Secrets Management (wird mit Server-Proxy relevant, aber nicht Release-1)
- Multi-run Scheduling / Background Jobs
- Vollständiges Sandbox-System für Expressions
- Echte Tool-Integrationen (MCP/Connectors nur Mock)

## 7. UX Requirements
### Layout
- **Left Sidebar**: Workflow Metadaten, Node Library, Versions, (optional) Provider/Settings (mock-only in Release-1)
- **Center Canvas**: Graph Editor + Preview Panels
- **Right Inspector**: Config für ausgewähltes Element

### Interaktionen
- Node hinzufügen per Klick (Library)
- Edge erstellen per Drag von Node-Handle
- Node/Edge auswählen durch Klick; Auswahl spiegelt sich im Inspector
- Deletion: über Button (Delete) für Selection

### Import/Export
- Export öffnet Modal mit JSON-Text als Fallback, plus Copy/Download/Open
- Import öffnet Modal (kein prompt), unterstützt Paste und File Upload

## 8. Functional Requirements

### FR1 — Canvas Graph Editor
- Nutzer können Nodes hinzufügen, verschieben, verbinden
- Nodes/Edges werden in Draft gespeichert
- Undo/Redo für graph-bezogene Änderungen

**Acceptance Criteria**
- Node hinzufügen erscheint sofort auf Canvas
- Edge verbinden erzeugt Verbindung und default `mapTo: state.last`
- Undo/Redo stellt Node/Edge-Änderungen wieder her

### FR2 — Node Library
- Vordefinierte Node-Typen inkl. Default Config:
    - start, agent, if, while, approval, transform, set_state, tool_file_search (mock), guardrails (mock), connector (mock), end

**Acceptance Criteria**
- Jeder Node-Typ ist in der Library sichtbar und anlegbar
- Default Config erscheint im Inspector

### FR3 — Inspector: Node Config
- Pro Node-Typ: passende Eingabefelder
- Agent Node: Provider Dropdown **mock** (Release-1); „server“ optional als disabled/coming-soon
- If/While: Expression-Eingabe
- Approval: Prompt

**Acceptance Criteria**
- Klick auf Node → Inspector zeigt „Config“ inklusive Provider Dropdown (Agent)
- Config-Änderungen wirken sich auf Preview Run aus

### FR4 — Inspector: Edge Config
- `mapTo` editierbar (Default: `state.last`)
- Optional:
    - If: `branch` (then/else)
    - While: `role` (body/exit)

**Acceptance Criteria**
- Klick auf Edge → Inspector zeigt MapTo-Input
- Branch/Role Selectors sind vorhanden

### FR5 — Preview Run (Executor)
- Startet beim Start-Node
- Führt Nodes sequenziell aus
- Edge mapping schreibt Output nach `mapTo`
- Trace wird pro Node-Step aufgezeichnet
- Abbruch (Cancel)

**Acceptance Criteria**
- Preview Run zeigt Trace Steps + State
- Cancel beendet Run und UI bleibt nutzbar
- If/While Routing folgt Edge-Metadaten

### FR6 — Human Approval
- Approval Node kann Run pausieren
- UI zeigt Approval Panel mit Approve/Reject
- Entscheidung setzt Approval State und setzt Run fort

**Acceptance Criteria**
- Run pausiert auf Approval ohne Entscheidung
- Approve/Reject führt Run weiter

### FR7 — Publish / Versions
- Publish erzeugt immutable Snapshot (VersionNumber++)
- Versions-Liste zeigt Versionen, Load/Export je Version

**Acceptance Criteria**
- Publish erstellt neue Version
- Load ersetzt Draft Graph durch Snapshot Graph

### FR8 — Export
- Export Draft und Export Version
- Download wird getriggert, aber immer Fallback via Modal (Copy/Open)

**Acceptance Criteria**
- Export öffnet Modal mit JSON
- Copy kopiert JSON in Clipboard (Fallback ok)
- Download/Open funktionieren soweit Browser-Policy es erlaubt

### FR9 — Import
- Import Modal: Paste oder File Upload
- Akzeptiert JSON-Formate:
    - `{ graph: { nodes, edges } }`
    - `{ nodes, edges }`
    - optional: `{ draft: { graph: { nodes, edges } } }`
- Normalization: IDs, Default Config Merge

**Acceptance Criteria**
- Import ersetzt aktuellen Draft Graph
- Import zeigt verständliche Fehlermeldungen bei invalid JSON

### FR10 — Provider-Feld (Forward-Compatibility)
- Export-JSON enthält ein Provider-Feld, das Release-1 mit `mock` befüllt.
- Import akzeptiert Provider-Werte, die noch nicht unterstützt sind (z. B. `server`) und behandelt sie verständlich (z. B. Warnhinweis + Fallback auf `mock` oder Block mit Klartext-Fehler, je nach Produktentscheidung).

**Acceptance Criteria**
- Export enthält Provider-Info; Roundtrip Draft → Export → Import bleibt deterministisch.
- Import von Provider≠mock führt zu einer klaren UI-Rückmeldung und bricht den Builder nicht.

## 9. Non-Functional Requirements
### NFR1 — Browser-only
- Keine Server-Komponenten
- Alles läuft in Canvas Preview / Browser

### NFR2 — Performance
- Preview Run für typische Flows (<50 Nodes) reagiert innerhalb weniger Sekunden (mock)

### NFR3 — Robustheit
- Import/Export bricht UI nicht
- Normalize verhindert harte Crashes bei leicht abweichendem JSON

### NFR4 — Sicherheit (MVP-Transparenz)
- Keine Secrets/Keys in Release-1 erforderlich (mock-only).
- Expressions sind nicht sicher gesandboxed (nur minimaler Block)

### NFR5 — Testbarkeit
- In-App Self-Tests (Smoke)

## 10. Metrics (Success)
- **Time-to-first-run**: Nutzer kann innerhalb von 3 Minuten einen Flow erstellen und Preview Run ausführen
- **Debuggability**: Trace zeigt mindestens NodeName, Status, Input/Output Snapshot
- **Portability**: Export/Import Roundtrip funktioniert (Draft → Export → Import)

## 11. Risiken & Mitigation
- **Provider-Feld Drift** (Forward-Compatibility, spätere Server-Integration) → Schema-Versionierung + Normalize/Validate + klare Warnungen bei unbekannten Providern
- **Expression Injection** → Blocklist + Hinweis „nicht produktionshärtend“
- **Import kaputt** durch Format-Drift → Normalize + klare Fehlermeldungen

## 12. Milestones (MVP)
1) Canvas + Node Library + Inspector
2) Preview Executor + Trace
3) Approval + Routing (If/While)
4) Publish/Versions
5) Export/Import + Fallback Modals
6) Provider-Feld (Forward-Compatibility) + robuste Import-Warnungen

## 13. Open Questions
1) Export-Format: Soll zusätzlich eine „System Instruction“ generiert werden (Prompt/Spec), oder bleibt es bei Workflow-JSON?
2) Import Verhalten: Soll Import optional „merge“ statt „replace“ unterstützen?
3) Edge `mapTo` Standard: immer `state.last` oder abhängig vom Node-Typ?
```

###  Solution Design

```md
# SYSTEM_DESIGN
## Canvas Agent Builder (OpenAI-like) — Browser-only Demo, produktionsnah

### Meta
- id: SD-1
- version: 2
- parent: sha256:161bfaebb1d5786e8ca3a3d00d0256001beb7ac55866fb3da86523693fbf7748
- created_at: 2026-01-11T17:31:58Z
- author_role: Arch (MainAgent)

## 1. Kontext und Ziel
Der **Canvas Agent Builder** ist ein **rein im Browser ausführbarer** (kein Backend) Demo-Prototyp, der sich im Bedienkonzept an OpenAI-orientierten Agent/Workflow-Buildern orientiert:
- Visuelle Canvas mit Nodes/Edges
- Inspector (rechts) zum Konfigurieren von Nodes/Edges
- Preview-Run (lokaler Executor) inkl. Trace
- Human Approval (Pause/Resume)
- Versions (Publish) + Export/Import
- Release-1: Provider **mock-only** (keine externen LLM-Requests)
- Später (nicht Release-1): **Server LLM-Proxy** als produktionsnahe Erweiterung

### Product Goal (User Outcome)
**User können einen agentischen Workflow visuell entwerfen, testen (Preview), versionieren und als JSON exportieren/importieren.**

## 2. Non-Goals (bewusst nicht)
- Kein Server, kein Multi-User, keine Rechteverwaltung
- Kein Secrets-Handling in Release-1 (keine API-Keys im Browser erforderlich)
- Kein robustes Sandboxing für Expressions (nur minimaler Schutz)
- Keine garantierte Kompatibilität mit OpenAI internen Formaten (nur "ähnlich")

## 3. High-Level Architektur

### 3.1 Frontend Module
1) **Canvas Editor**
- React + ReactFlow
- Node Library (links)
- Drag/Connect über Handles

2) **Inspector**
- Node Inspector: Provider, Prompt, Expression, etc.
- Edge Inspector: Mapping (`mapTo`), Routing-Metadaten (`branch`, `role`)

3) **Runtime / Executor**
- Deterministische Abarbeitung des Graphen
- Trace Recording pro Node
- Pause/Resume via Human Approval

4) **Versioning**
- Publish erstellt Snapshot (immutable)
- Load Version ersetzt aktuellen Draft-Graph

5) **Import/Export**
- Export: JSON Download + Fallback im Modal (Copy/Open)
- Import: Modal (Paste/File) → Parse → Normalize → Apply

6) **Persistence**
- localStorage: Draft, Versions, (Provider-/UI-Settings ohne Secrets), Input JSON

### 3.2 Datenfluss (vereinfacht)
- UI (Nodes/Edges) → Draft Graph
- Preview Input JSON → Executor
- Executor → Trace + State + Last
- Publish → Versions[]
- Export/Import ↔ JSON

## 4. Data Model

### 4.1 Node
Ein Node ist ein ReactFlow Node mit:
- `id: string`
- `type: "card"` (Renderer)
- `position: {x, y}`
- `data: { nodeType, config, runtimeStatus?, smallHint? }`

`nodeType` (logische Typen):
- `start`, `agent`, `if`, `while`, `approval`, `transform`, `set_state`, `tool_file_search`, `guardrails`, `connector`, `end`

### 4.2 Edge
Ein Edge ist ReactFlow Edge mit:
- `id, source, target`
- `data: {
  mapTo?: string,   // Default: state.last
  label?: string,
  branch?: "then"|"else", // If routing
  role?: "body"|"exit"     // While routing
}`

### 4.3 Draft / Version
- **Draft**: mutierbar
    - `workflowId, name, nodes, edges, updatedAt`
- **Version**: immutable Snapshot
    - `workflowId, name, versionNumber, createdAt, graph: {nodes, edges}`

### 4.4 Provider (Forward-Compatibility)
- Export/Import führt ein Provider-Feld bereits in Release-1, obwohl Release-1 nur `mock` ausführt.
- Ziel: JSON bleibt kompatibel, wenn später ein `server`-Provider (LLM-Proxy) hinzukommt.

## 5. UI/UX Design

### 5.1 Linke Sidebar
- Workflow Metadaten (Name, IDs)
- Undo/Redo
- Publish / Export Draft / Import
- (Optional) Provider-Anzeige: `mock` (und ggf. `server` als coming-soon), ohne Key-Felder
- Node Library
- Versions-Liste

### 5.2 Mitte (Canvas)
- ReactFlow Canvas
- Connect durch Drag von Source-Handle → Target-Handle
- Auswahl steuert Inspector
- Preview Panel zeigt Input/Trace/State

### 5.3 Rechte Sidebar (Inspector)
#### Node
- Konfigurationsfelder je Node-Typ
- Provider Dropdown bei **Agent**:
    - `mock` (offline)
    - `server` (coming soon; nicht ausführbar in Release-1)

#### Edge
- `mapTo` (state/input Pfad)
- optional: `branch` (If), `role` (While)

## 6. Execution Engine (Preview-Run)

### 6.1 Grundprinzip
- Start bei `start` Node
- Jeder Node erzeugt `output`
- Die **ausgehende Edge** bestimmt, wohin `output` gemappt wird (`mapTo`)
- Routing:
    - `if`: wählt Edge nach `branch`
    - `while`: wählt Edge nach `role` abhängig von condition

### 6.2 Runtime Context
- `input`: initiale Eingabe (JSON)
- `state`: veränderlicher State (inkl. messages)
- `last`: letzter Node-Output

### 6.3 Trace
Pro Step:
- `nodeId, type, name`
- `startedAt, finishedAt`
- `status: ok|error|paused|running`
- `input snapshot`, `output snapshot`, `error`

### 6.4 Pause/Resume (Approval)
- Approval Node liefert bei fehlender Entscheidung `paused`
- UI zeigt Approval Panel
- Approve/Reject setzt Decision und triggert Re-Run

### 6.5 Safety Guards
- Execution Guard (max steps)
- While: maxIterations
- Expressions: minimaler Token-Block (kein echtes Sandbox)

## 7. Provider Layer (Agent Node)

### 7.1 Provider = mock
- Deterministisches lokales Verhalten
- Keine Network Requests

### 7.2 Provider = server (LLM-Proxy, nicht Release-1)
- Server-Komponente übernimmt LLM-Requests serverseitig (Keys/Secrets liegen nicht im Browser).
- Der Browser sendet nur die notwendigen Request-Daten; Server liefert eine normalisierte Response zurück.
- Out-of-scope für Release-1, aber das Export-JSON wird so gestaltet, dass dieser Provider später ergänzbar ist.

**Risiken/Limitierungen (später):**
- AuthN/AuthZ & Rate-Limits müssen sauber gelöst werden
- Prompt-/Data-Handling braucht Privacy-/Logging-Regeln (keine Secrets in Logs)

## 8. Import/Export Design

### 8.1 Export
- Erzeugt JSON Payload (Draft oder Version)
- Enthält Provider-Feld (Release-1: `mock`)
- Trigger Download via Blob URL
- Modal zeigt JSON immer (Copy/Open/Download)
- Blob URL wird beim Schließen/Neu-Export revoked

### 8.2 Import
- Modal statt `prompt()` (Preview-sicher)
- Quellen:
    - Paste JSON
    - File Upload (`application/json`)
- Parser akzeptiert Formen:
    - `{ graph: { nodes, edges } }`
    - `{ nodes, edges }`
    - optional: `{ draft: { graph: { nodes, edges } } }`
- Normalize:
    - fehlende IDs, Defaults, Config Merge aus Node Library
    - Provider-Feld: unbekannte Werte führen zu klarer UI-Rückmeldung (Warnung/Block) ohne Crash

## 9. Persistence
- localStorage Key: (z.B.) `lpai.canvasAgentBuilder.*`
- gespeichert:
    - Draft (nodes/edges)
    - Versions
    - Provider-/UI-Settings (ohne Secrets)
    - Preview Input
    - Undo/Redo History (optional)

## 10. Security & Privacy
- **Kein Backend** → kein Server-Risiko, aber:
    - Expressions sind nicht sicher gesandboxed
    - Import JSON kann bösartige Daten enthalten (nur Struktur verwenden)

Mitigation (MVP):
- klare Warnhinweise im UI
- Expression-Blocklist für kritische Tokens
- Normalize/Validate beim Import

## 11. Extensibility
- Node Library ist zentrale Quelle:
    - `defaultConfig`
    - `io schema`
    - `label/description`
- Neue Node Types:
    - UI: Form im Inspector
    - Runtime: Handler im Executor

## 12. Testing
- In-App Self-Tests (smoke):
    - path set/get
    - template rendering
    - expression blocking
    - extract output text
    - import detection
    - normalize defaults
    - minimal runWorkflow

## 13. Offene Punkte / Next Steps
- Robustes Schema-Validation (z.B. zod) für Import
- Echte Sandbox für Expressions (oder Umstieg auf CEL)
- Streaming-Responses, Tool calling, structured outputs
- Knoten-spezifische Port-Typen (Typed Edges)
- Better DX: Export als "System Instruction" oder "Workflow Spec" optional
```

### Task & Test Plan

```md
# TASK_PLAN
## Canvas Agent Builder (OpenAI-like) — Browser-only MVP (mock-only)

### Meta
- id: TP-1
- version: 1
- parent: null
- created_at: 2026-01-11T17:33:00Z
- author_role: PMgr (MainAgent)
- provenance: UR=`ur_canvas_agent_builder_open_ai_like.md`, PRD=`prd_canvas_agent_builder_open_ai_like_browser_only_demo.md`, SD=`system_design_canvas_agent_builder_browser_only_mvp.md`

## Ziel
Planung der MVP-Implementierung als browser-only Demo: Canvas/Inspector, Preview-Executor mit Trace, Approval (Pause/Resume), Versioning/Publish, Import/Export, Embed-Chat, Persistenz (localStorage). Release-1 führt **nur `mock`** aus; Export/Import enthält ein **Provider-Feld** (Forward-Compatibility für späteren `server` LLM-Proxy, nicht Release-1).

## Taskliste

### T1 — Projekt-Skelett + App-Shell
- **Ziel:** Minimaler App-Rahmen (Layout: Sidebar/Canvas/Inspector + Preview Panels), State-Store-Grundlage.
- **Akzeptanz:** App lädt ohne Errors; Basislayout sichtbar; zentraler State für Draft/Selection/Runtime existiert.
- **Depends on:** —
- **PRD Trace:** FR1 (Basis), UX Layout

### T2 — Graph-Datenmodell (Draft/Version) + Normalisierung
- **Ziel:** Einheitliches Modell für Nodes/Edges, Draft + Version-Snapshot, Schema-Version/Metadata.
- **Akzeptanz:** Draft/Version lassen sich serialisieren/deserialisieren; Normalize verarbeitet leicht abweichende Import-Formen robust.
- **Depends on:** T1
- **PRD Trace:** FR7, FR9, NFR3

### T3 — Node Library (Node Types + Default Config)
- **Ziel:** Node-Typen definieren (start/agent/if/while/approval/transform/set_state/tool_mock/guardrails_mock/connector_mock/end) inkl. Default Config + Labels.
- **Akzeptanz:** Jeder Typ ist anlegbar; Default Config erscheint im Inspector.
- **Depends on:** T2
- **PRD Trace:** FR2, FR3

### T4 — Canvas Editor (ReactFlow): Add/Move/Connect/Select/Delete
- **Ziel:** Graph-Editing UX (Add Node, Drag, Connect, Select Node/Edge, Delete Selection).
- **Akzeptanz:** Nodes/Edges verhalten sich gemäß PRD; Delete entfernt abhängige Edges; Selection synchronisiert mit Inspector.
- **Depends on:** T1, T2, T3
- **PRD Trace:** FR1, UX Interaktionen

### T5 — Undo/Redo (Graph-Changes)
- **Ziel:** Undo/Redo für Graph-Änderungen (min. 20 Schritte).
- **Akzeptanz:** Node/Edge Add/Move/Delete/Connect sind undo-/redo-fähig; History persistiert optional im Session-State.
- **Depends on:** T4
- **PRD Trace:** FR1 AC, UR FR-6

### T6 — Inspector: Node Config UI (typ-spezifisch)
- **Ziel:** Rechte Sidebar für Node-Konfigurationsfelder (Agent mock, Expressions, Approval Prompt, etc.).
- **Akzeptanz:** Änderungen an Config wirken sich im Preview-Run aus; Validierungsfehler werden verständlich angezeigt.
- **Depends on:** T3, T4
- **PRD Trace:** FR3, NFR5

### T7 — Inspector: Edge Config UI (mapTo + branch/role)
- **Ziel:** Edge-Config (mapTo Default `state.last`, If branch then/else, While role body/exit).
- **Akzeptanz:** Edge-Details editierbar; Routing-Metadaten in Export/Import enthalten; UI verhindert ungültige Werte.
- **Depends on:** T4
- **PRD Trace:** FR4

### T8 — Path-Mapping (mapTo) + State Utilities
- **Ziel:** Mapping-Logik für `mapTo` (state/input Pfade) + sichere Defaults.
- **Akzeptanz:** Outputs werden deterministisch gemappt; invalid mapTo liefert klare Fehlermeldung (ohne App-Crash).
- **Depends on:** T2, T7
- **PRD Trace:** FR5, NFR3

### T9 — Preview Executor (deterministisch) + Trace + Guards
- **Ziel:** Lokaler Executor: Start→…→End, Step-Trace (input/output/status/timestamps), maxSteps, while maxIterations.
- **Akzeptanz:** AC-1/2/3 erfüllt; Cancel beendet Run sauber; Errors erscheinen im Trace + Node-Status.
- **Depends on:** T2, T3, T8
- **PRD Trace:** FR5, NFR3, NFR2

### T10 — Human Approval (Pause/Resume)
- **Ziel:** Approval Node pausiert Run; UI erlaubt Approve/Reject; Resume via Re-Run mit gespeicherter Entscheidung.
- **Akzeptanz:** AC-4 erfüllt; Pause/Resume zuverlässig und nachvollziehbar im Trace.
- **Depends on:** T9
- **PRD Trace:** FR6

### T11 — Versioning: Publish + Versions-Liste + Load
- **Ziel:** Publish erstellt immutable Snapshot (VersionNumber++), Versions-Liste, Load ersetzt Draft.
- **Akzeptanz:** AC-5 erfüllt; Versionen bleiben unverändert; Load setzt Canvas/Inspector konsistent.
- **Depends on:** T2, T4
- **PRD Trace:** FR7

### T12 — Export/Import (inkl. Provider-Feld Forward-Compatibility)
- **Ziel:** Export Draft/Version (Modal + Copy/Download), Import (Paste/File), Normalize; Provider-Feld im JSON (Release-1: `mock`).
- **Akzeptanz:** AC-6 erfüllt; Import unbekannter Provider (z. B. `server`) wird klar kommuniziert (Warnung/Block) und crasht nicht.
- **Depends on:** T2, T11, T7
- **PRD Trace:** FR8, FR9, FR10 (Provider-Feld), NFR3

### T13 — Persistenz (localStorage)
- **Ziel:** Draft, Versions, Provider/UI-Settings (ohne Secrets), Preview Input/Trace optional.
- **Akzeptanz:** Reload stellt Draft & Versions wieder her; „Reset/Clear“ Funktion vorhanden.
- **Depends on:** T2, T11, T12
- **PRD Trace:** Scope Persistenz, NFR1

### T14 — Embed Chat (latest published version)
- **Ziel:** Chat-UI führt latest published version aus (mock-only) und zeigt Assistant Output.
- **Akzeptanz:** AC-7 erfüllt; wenn keine Version existiert, klare UX („Publish first“).
- **Depends on:** T9, T11
- **PRD Trace:** FR? (Embed), UR Story 8

### T15 — In-App Self-Tests (Smoke) + QA-Checkliste
- **Ziel:** UI-interne Smoke-Checks (Import detection, normalize defaults, minimal runWorkflow, path set/get).
- **Akzeptanz:** Ein „Self-Test“-Panel zeigt pass/fail; Failures blockieren nicht die Nutzung, sind aber sichtbar.
- **Depends on:** T8, T9, T12
- **PRD Trace:** NFR5

## Abhängigkeiten (kurz)
- Editing/Inspector → Executor/Trace → Approval → Versioning → Import/Export → Persistenz → Embed Chat → Self-Tests.

## Nächste Freigabe
- Für Implementierung: `Freigabe: CD+Tests`
```

## Status und Versionierung

Artefakte sollten einen klaren Status haben.

Typische Statuswerte sind:

- draft
- in_review
- contract
- approved
- deprecated

Nicht jeder Status passt zu jedem Artefakt. Wichtig ist, dass der Status nicht nur Dekoration ist.

Ein Artefakt mit Status `approved` oder `contract` hat eine andere Wirkung als ein Entwurf. Ein späteres Artefakt darf sich nicht auf einen Entwurf stützen, als wäre er freigegeben.

Versionierung sollte semantische Änderungen sichtbar machen.

Eine kleine Klarstellung ist etwas anderes als eine neue Anforderung, ein geändertes Akzeptanzkriterium oder ein veränderter Non-Goal.

## Traceability

Traceability bedeutet nicht, dass jedes Dokument viele Links enthält.

Traceability bedeutet, dass eine Entscheidung zurückverfolgt werden kann.

Beispiele:

- Ein Task verweist auf ein Akzeptanzkriterium.
- Ein Test verweist auf einen Task oder ein Akzeptanzkriterium.
- Eine Implementierung verweist auf Tasks.
- QA verweist auf Tests, Checks und Review-Ergebnisse.
- Eine Änderung verweist auf den betroffenen Vertragsteil.

Ohne Traceability kann ein Agent zwar Artefakte erzeugen, aber niemand kann sicher sagen, ob sie noch zusammengehören.

## Hashes und Audit

Für auditierbare Artefakte kann ein Hash genutzt werden.

Wichtig ist: Der Hash sollte sich auf den fachlichen Inhalt beziehen, nicht auf sich selbst. Sonst entsteht ein Paradox.

Praktisch bedeutet das:

- Der Inhalt wird stabil dargestellt.
- Der Hash wird über diesen Inhalt gebildet.
- Meta-Informationen wie Zeitstempel dürfen den fachlichen Hash nicht unnötig verändern.
- Jede semantische Inhaltsänderung muss sichtbar werden.

Hashes sind kein Selbstzweck. Sie helfen, später zu prüfen, ob ein Artefakt noch genau der Stand ist, auf den sich andere Artefakte beziehen.

## Typische Fehler

Häufige Fehler im Umgang mit Artefakten sind:

- ein PRD ist lang, aber nicht verbindlich
- Akzeptanzkriterien sind formuliert, aber nicht testbar
- Design enthält bereits Implementierung
- Tasks sind technische To-dos ohne Bezug zu Anforderungen
- Tests prüfen nicht die vereinbarten Akzeptanzkriterien
- Brownfield-Kontext wird erst während der Implementierung entdeckt
- Code wird als Nachweis verwechselt
- QA behauptet Prüfung, ohne Evidenz zu haben
- Änderungen am Scope passieren ohne Change Artefact
- Artefakte liegen nebeneinander, aber verweisen nicht aufeinander

## Minimale Artefakt-Checkliste

Für jedes Artefakt sollte kurz geprüft werden:

- Welche Frage beantwortet dieses Artefakt?
- Auf welcher Grundlage basiert es?
- Welche Entscheidung oder welches Gate unterstützt es?
- Welche Annahmen enthält es?
- Welche Risiken bleiben offen?
- Welche Nachweise enthält es?
- Worauf verweist es?
- Was darf daraus als Nächstes passieren?

Wenn diese Fragen nicht beantwortet werden können, ist das Artefakt wahrscheinlich noch nicht gate-fähig.

## Verhältnis zu Gates

Gates und Artefakte gehören zusammen, aber sie erfüllen unterschiedliche Aufgaben.

Das Artefakt liefert den Inhalt. Das Gate entscheidet, ob dieser Inhalt ausreicht, um verantwortbar weiterzugehen.

Genau darin liegt der Unterschied zwischen schneller KI-Ausgabe und gesteuerter Delivery:

Nicht jedes erzeugte Dokument ist automatisch ein belastbares Artefakt. Und nicht jedes plausible Ergebnis darf automatisch die nächste Phase auslösen.

