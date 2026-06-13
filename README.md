![Intro : AI-native Governance & Delivery Framework](assets/intro.png)

Ein Deutsch-first Framework für agentisches Software Engineering, kontrollierbare KI-gestützte Delivery und die
nachvollziehbare
Weiterentwicklung bestehender Softwarelandschaften.

> Von schnellen KI-Ergebnissen zu belastbarer, gate-basierter Software Delivery.

## In einem Satz

Dieses Framework ist kein Ersatz für erfahrene Entwickler. Es ist ein Exoskelett für agentische Software Delivery: Es
verstärkt Entwicklung mit KI-Agenten, ohne Kontrolle, Nachvollziehbarkeit und Verantwortung aufzugeben.

Bildlich gesprochen: Nicht Autopilot, sondern Iron-Man-Anzug. Der Entwickler bleibt Pilot; das Framework liefert HUD,
Schutzmechanismen, Gate-Checks und Nachweise.

**Arbeitsname: A.E.G.I.S. — Artifacts Enable Governed Intelligent Software Delivery.**

A.E.G.I.S. beschreibt die Steuerungsschicht um das Modell herum: Artefakte machen Arbeitsstände sichtbar, Gates prüfen
ihre Tragfähigkeit, und der Mensch bleibt verantwortlich.

## Status

Dieses Repository ist ein öffentlicher Diskussionsentwurf.

Es geht hier nicht darum, sofort ein fertiges Tool oder einen neuen Pflichtprozess vorzugeben. Der erste Schritt ist
einfacher:
Wir wollen gemeinsam herausarbeiten, welche Struktur Softwareteams brauchen, wenn KI-Agenten nicht mehr nur assistieren,
sondern  aktiv an Analyse, Planung, Umsetzung und Qualitätssicherung beteiligt sind.

## Warum dieses Projekt existiert

Agentisches Software Engineering verändert, wie Software geplant, entworfen, getestet und umgesetzt wird.

Viele Diskussionen drehen sich dabei um Coding Agents, Produktivität und Automatisierung. Das ist verständlich: Wer
sieht, wie schnell KI heute lauffähigen Code erzeugen kann, landet schnell bei der Frage, wie viel schneller Entwicklung
dadurch wird.

Dieses Projekt setzt an einer anderen Stelle an:

> Wie sorgen wir dafür, dass KI-Agenten nicht nur schnell liefern, sondern im richtigen fachlichen Rahmen arbeiten?

Eine einfache Analogie ist ein Haus-Party-Protokoll:

Nur weil jemand Gäste einladen kann, heißt das noch nicht, dass die Party kontrolliert abläuft. Es braucht Regeln:
besonders dann, wenn nicht vollständig transparent ist, mit welchen Systemanweisungen, Voreinstellungen oder internen
Prioritäten ein LLM tatsächlich arbeitet.

Ähnlich ist es bei KI-Agenten in der Softwareentwicklung. Ein Coding Agent kann schnell Änderungen vorschlagen oder
erzeugen. Ohne klare Artefakte, Gates und Verantwortlichkeiten bleibt aber unklar, ob diese Änderungen fachlich erlaubt,
technisch tragfähig und ausreichend geprüft sind.

In vielen Teams versucht man, den roten Faden über Jira, Azure DevOps, GitHub Issues oder ähnliche Ticket- und
Planungssysteme zu halten. Diese Werkzeuge sind wichtig. Sie zeigen, woran gearbeitet wird, wer beteiligt ist und wie
weit ein Vorgang fortgeschritten ist.

Sie beantworten aber nicht automatisch die Governance-Frage.

Ein Board zeigt, woran gearbeitet wird.
Dieses Framework erklärt, warum daran gearbeitet werden darf.

Wenn KI-Agenten Anforderungen interpretieren, Solution Designs ableiten, Tasks vorschlagen, Tests planen oder
Implementierungsvorschläge erzeugen, braucht es klare Regeln für Scope, Freigabe, Traceability, Qualitätsnachweise,
Rollen, Verantwortung, Change Control und die Grenze zwischen Design und Code.

Kurz gesagt:

Coding Agents liefern Ausführungskraft.
Dieses Framework beschreibt die Hausregeln für verantwortbare KI-gestützte Delivery.

## Abgrenzung zu Coding-Agent-Tools

![Agentic Coding Tools vs Governance Framework](assets/coding-agent-tools-vs-framework.png)

Tools wie Claude Code, Cursor, GitHub Copilot oder ähnliche agentische Entwicklungsumgebungen helfen dabei, Code zu
verstehen, Änderungen vorzuschlagen, Dateien zu bearbeiten, Tests auszuführen oder Git-Workflows zu unterstützen.

Dieses Framework ist kein Ersatz für solche Werkzeuge.

Es beantwortet eine andere Frage:

> Nicht: Welcher Agent kann Code erzeugen?
> Sondern: Unter welchen Voraussetzungen darf ein Agent Anforderungen interpretieren, Designs ableiten, Tasks planen,
> Code ändern oder Ergebnisse als fertig darstellen?

Coding-Agent-Tools liefern Ausführungskraft. Dieses Framework liefert den Governance- und Delivery-Rahmen dafür.

Der Unterschied ist wichtig:

| Coding-Agent-Tool                           | Dieses Framework                                  |
|---------------------------------------------|---------------------------------------------------|
| arbeitet in Codebase, IDE, Terminal oder PR | definiert Gates, Freigaben und Entscheidungslogik |
| kann Code ändern oder Tests ausführen       | klärt, wann Codeänderung überhaupt erlaubt ist    |
| optimiert Entwicklungsfluss                 | schützt Scope, Traceability und Verantwortung     |
| unterstützt Umsetzung                       | erzwingt Produktvertrag, Nachweise und QA         |
| kann sehr schnell liefern                   | sorgt dafür, dass Lieferung prüfbar bleibt        |

Kurz gesagt:

> Claude Code ist ein leistungsfähiges Werkzeug im Maschinenraum.  
> Dieses Framework beschreibt Cockpit, Checklisten, Freigaben und Not-Aus.

## Ursprung

Dieses Framework ist aus praktischen Experimenten und einem Vortrag zu **„KI als Junior-Dev-Teammitglied“** entstanden.
Zu einer Zeit, in der in vielen Teams noch die Frage im Vordergrund stand: „KI, was haben wir konkret davon?"

Sam Altman schrieb Anfang 2025 in seinem Blogpost **„Reflections“**:

> “We believe that, in 2025, we may see the first AI agents ‘join the workforce’ …”

Der ursprüngliche Impuls war pragmatisch: Was passiert, wenn diese Einschätzung zutrifft? Was passiert, wenn KI nicht
nur Texte erklärt oder Code vervollständigt, sondern als agentisches Teammitglied an realen Delivery-Schritten beteiligt
wird?

*Frühes Experiment aus der Phase „KI als Junior-Dev-Teammitglied“: schnelle MVP-Erzeugung machte sichtbar,
dass Geschwindigkeit allein nicht reicht. Entscheidend wird, ob Scope, Entscheidungen, Tests und Freigaben
nachvollziehbar
bleiben.*

![Frühes Experiment: agentische MVP-Erzeugung mit KI](assets/experiment-specforge-ai.png)

Die spannendere Frage zeigte sich aber erst danach:

> Was passiert, wenn jeder erfahrene Entwickler zum Produzenten wird, mit KI als Entwicklungsteam?

In dieser Perspektive schreibt ein erfahrener Entwickler nicht mehr nur Code. Er formuliert Ziele, stabilisiert
Scope, trifft Architekturentscheidungen, zerlegt Arbeit, bewertet Vorschläge, prüft Qualität, priorisiert Risiken und
entscheidet über Freigaben.

KI-Agenten können sehr schnell lauffähige Ergebnisse erzeugen. Entscheidend wird aber, ob Anforderungen, Scope,
Architekturentscheidungen, Arbeitspakete, Tests, Freigaben und Änderungen nachvollziehbar bleiben.

Das vorliegende Framework ist der Versuch, diese Beobachtung zu formalisieren:

> Wenn erfahrene Entwickler mit KI-Agenten wie mit einem Entwicklungsteam arbeiten, brauchen sie nicht nur Prompts
> und Tools, sondern einen nachvollziehbaren Governance- und Delivery-Rahmen.

## Leitthese

KI-Agenten machen erfahrene Entwickler nicht überflüssig. Sie verändern ihre Rolle.

Der erfahrene Entwickler wird stärker zum Produzenten. Er setzt Ziele, gibt Kontext, hält Scope stabil, trifft
Architekturentscheidungen, bewertet Vorschläge, prüft Qualität und entscheidet, wann etwas weitergehen darf.

Genau deshalb braucht agentisches Software Engineering nicht nur bessere Coding Agents. Es braucht eine Governance-
und Delivery-Schicht, die diese neue Arbeitsweise kontrollierbar macht.

## Kernidee

Das Framework schlägt eine gate-basierte Governance- und Delivery-Struktur für agentisches Software Engineering vor.

Der zentrale Gedanke ist bewusst einfach:

> Keine Implementierung ohne freigegebenen Produktvertrag.

Ein stabiler Produktvertrag, zum Beispiel ein `Product Requirements Doc`, beschreibt verbindlich, was gelten soll:
Scope,
Akzeptanzkriterien, Non-Goals, Constraints und Erfolgsmessung.

Nachgelagerte Artefakte wie Solution Design, Task & Test Plan und Implementierung dürfen diesen Vertrag nicht
stillschweigend uminterpretieren.

## Deutsch-first

Dieses Projekt ist bewusst Deutsch-first.

Governance, Verantwortung, Freigabe, Nachweisführung, Akzeptanzkriterien, Nicht-Ziele, Änderungssteuerung und
Auditierbarkeit sind keine rein technischen Begriffe. Sie berühren Organisation, Haftung, Zusammenarbeit, Regulierung
und Entscheidungsverantwortung.

Gerade im deutschsprachigen Raum (in Unternehmen, Mittelstand, öffentlicher Verwaltung, regulierten Branchen und
europäischen Governance-Kontexten) müssen diese Fragen präzise und anschlussfähig diskutiert werden können.

Englische Fachbegriffe wie `AI-native`, `Delivery`, `Gate`, `Traceability`, `Product Requirements Doc` oder
`Agentic Software Engineering`
werden dort verwendet, wo sie als Fachanker hilfreich sind.

## Brownfield als Hauptanwendungsfall

Dieses Framework betrachtet Brownfield-Projekte nicht als Sonderfall, sondern als zentrale Realität agentischer Software
Delivery.

Viele relevante KI-gestützte Softwarevorhaben entstehen nicht auf der grünen Wiese. Sie finden in bestehenden
Systemlandschaften statt: gewachsene Codebasen, historische Architekturentscheidungen, unvollständige Dokumentation,
bestehende Schnittstellen, regulatorische Anforderungen, technische Schulden, laufender Betrieb und oft auch lückenhafte
Tests.

Gerade dort reicht schnelle Code-Erzeugung nicht aus. Agentische Softwarearbeit muss kontrolliert, nachvollziehbar und
reversibel bleiben.

Brownfield-Delivery bedeutet deshalb nicht nur, neuen Code schneller zu erzeugen. Es bedeutet, bestehendes Verhalten
zu verstehen, Risiken sichtbar zu machen, Änderungen sauber zu begründen, Tests gezielt nachzuziehen und Rückbau oder
Rollback mitzudenken.

## Grundprinzipien

### 1. Fail closed

Wenn eine notwendige Voraussetzung fehlt, wird nicht einfach weitergemacht. Fehlende Freigaben, unklare Anforderungen
oder fehlende Qualitätsnachweise führen zu Klärung, Revision oder Blockade.

### 2. Single Source of Truth

Der Produktvertrag ist die verbindliche Quelle für Scope, Akzeptanzkriterien und Non-Goals.

### 3. Design ist nicht Code

Solution Design beschreibt Architektur, Verantwortlichkeiten, Schnittstellen und Abläufe. Code beschreibt ausführbares
Verhalten, vollständige Payloads, Schemas, Migrationen und Implementierungslogik.

### 4. Traceability statt Bauchgefühl

Wichtige Entscheidungen sollen auf Anforderungen, Artefakte, Freigaben oder Qualitätsnachweise zurückführbar sein.

### 5. Qualität braucht Nachweise

Build-, Test-, Review- und Risikoaussagen müssen sichtbar gemacht werden. Was nicht verifiziert wurde, sollte auch
nicht so dargestellt werden, als sei es verifiziert.

### 6. Änderungen müssen explizit sein

Scope-Änderungen, geänderte Akzeptanzkriterien, Non-Goal-Anpassungen sowie sicherheits-, compliance- oder
datenschutzrelevante Änderungen brauchen dokumentierte Change Control.

## Vorgeschlagene Gate-Struktur

Das Framework arbeitet mit klaren Gates:

| Gate                       | Zweck                                                                        |
|----------------------------|------------------------------------------------------------------------------|
| G-00 User Request          | Problemverständnis, Scope-Rahmen, Risiken, Entscheidungsvorlage              |
| G-01 Product Requirements  | Anforderungen und stabiler Produktvertrag                                    |
| G-02 Solution Design       | Lösungskonzept, Architektur, Schnittstellen, Datenflüsse                     |
| G-03 Task & Test Plan      | Ableitung umsetzbarer Arbeitspakete und Validierung gegen Akzeptanzkriterien |
| G-04 Code / Implementation | Implementierung, Tests, Qualitätsnachweise                                   |

Die detaillierte Gate-Matrix wird in den Framework-Dokumenten ausgearbeitet.

## Repository-Struktur

```text
/
├─ README.md
├─ docs/
│  ├─ 00-manifest.md
│  ├─ 01-framework-ueberblick.md
│  ├─ 02-gates.md
│  ├─ 03-artefakte.md
│  ├─ 04-governance-regeln.md
│  └─ 05-offene-fragen.md
├─ templates/
│  ├─ user-requirement.md
│  ├─ prd-contract.md
│  ├─ solution-design.md
│  ├─ task-test-plan.md
│  └─ qa-report.md
├─ examples/
│  └─ sample-delivery-flow.md
└─ .github/
   ├─ ISSUE_TEMPLATE/
   └─ DISCUSSION_TEMPLATE/
```

## Einstieg

Empfohlene Reihenfolge:

1. [`docs/00-manifest.md`](docs/00-manifest.md) lesen
2. [`docs/01-framework-ueberblick.md`](docs/01-framework-ueberblick.md) lesen
3. [`docs/02-gates.md`](docs/02-gates.md) lesen
4. [`docs/03-artefakte.md`](docs/03-artefakte.md) lesen
5. [`docs/04-wissen-nutzbar-halten.md`](docs/04-wissen-nutzbar-halten.md) lesen
6. Offene Fragen in den GitHub Discussions kommentieren
7. Issues zu Begriffen, Gates, Artefakten oder Brownfield-Anwendungsfällen anlegen
8. Verbesserungsvorschläge als Pull Request einreichen

## Aktueller Arbeitsstand

Die erste öffentliche Version konzentriert sich auf Manifest und Positionierung, Ursprung und praktische Motivation,
Begriffsklärung, Gate-Modell, Artefaktmodell, Product Requirements Doc als Produktvertrag, Task & Test Plan als Brücke
zur Umsetzung,
Brownfield-Relevanz und offene Diskussionsfragen.

Noch nicht im Fokus stehen fertiges Tooling, Agent Runtime, IDE-Integration, vollständige Automatisierung oder
organisationsspezifische Compliance-Profile.

## Diskussion erwünscht

Dieses Projekt lebt von Kritik und Gegenbeispielen.

Besonders interessant sind Fragen wie:

* Wie verändert sich die Rolle erfahrener Entwickler, wenn KI-Agenten Teile eines Entwicklungsteams übernehmen?
* Wie viel Governance ist hilfreich, bevor sie zu schwergewichtig wird?
* Ist ein Produktvertrag der richtige Anker für agentische Delivery?
* Wo endet Design und wo beginnt Implementierung?
* Wie lassen sich Tickets, Boards und PRs mit fachlicher Traceability verbinden?
* Welche Qualitätsnachweise sind für Vertrauen notwendig?
* Wie lässt sich das Framework in Brownfield-Projekten anwenden?
* Welche Teile sollten durch Tooling unterstützt werden?
* Was muss menschliches Review und menschliche Verantwortung bleiben?

## Mitwirken

Beiträge sind willkommen: Diskussionen, Issues, Verbesserungsvorschläge, Gegenargumente, Beispiele aus realen
Brownfield-Projekten oder Pull Requests für Dokumentation, Templates und Beispiele.

Bitte beachte: Dieses Repository ist zunächst ein Framework- und Diskussionsprojekt. Implementierungsdetails und
Tooling werden erst später ergänzt.

## Lizenz

Die Lizenz ist noch festzulegen.

Bis zur Entscheidung sollte das Repository als Diskussionsentwurf behandelt werden.
