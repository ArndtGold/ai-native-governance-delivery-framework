# AI-native Governance & Delivery Framework

Ein Deutsch-first Framework für agentisches Software Engineering, kontrollierbare KI-gestützte Delivery und auditierbare Weiterentwicklung bestehender Softwarelandschaften.

> Von Prompt-getriebener Umsetzung zu nachvollziehbarer, gate-basierter Software Delivery.

## Status

Dieses Repository ist ein öffentlicher Diskussionsentwurf.

Ziel ist nicht, sofort ein fertiges Tool oder einen starren Prozess zu liefern. Ziel ist, gemeinsam ein Framework zu schärfen, das KI-gestützte und agentische Softwarearbeit nachvollziehbarer, prüfbarer und verantwortbarer macht.

## Warum dieses Projekt existiert

Agentisches Software Engineering verändert, wie Software geplant, entworfen, getestet und umgesetzt wird.

Viele Debatten konzentrieren sich auf Coding Agents, Produktivitätsgewinne und Automatisierung. Dieses Projekt setzt früher an:

**Wie stellen wir sicher, dass KI-Agenten nicht nur schnell Code erzeugen, sondern innerhalb eines überprüfbaren Delivery-Rahmens arbeiten?**

Wenn KI-Agenten Anforderungen interpretieren, Solution Designs ableiten, Tests planen oder Implementierungsvorschläge erzeugen, braucht es klare Regeln für:

- Scope
- Freigabe
- Traceability
- Qualitätsnachweise
- Rollen und Verantwortung
- Change Control
- Grenzen zwischen Design und Code

## Kernidee

Das Framework schlägt eine gate-basierte Governance- und Delivery-Struktur für agentisches Software Engineering vor.

Der zentrale Gedanke:

> Keine Implementierung ohne freigegebenen Produktvertrag.

Ein stabiler Produktvertrag, zum Beispiel ein `PRD.contract`, dient als verbindliche Quelle für Scope, Akzeptanzkriterien, Non-Goals, Constraints und Erfolgsmessung. Nachgelagerte Artefakte wie Solution Design, Test Plan und Implementierung dürfen diesen Vertrag nicht stillschweigend uminterpretieren.

## Deutsch-first

Dieses Projekt ist bewusst Deutsch-first.

Governance, Verantwortung, Freigabe, Nachweisführung, Akzeptanzkriterien, Nicht-Ziele, Änderungssteuerung und Auditierbarkeit sind keine rein technischen Begriffe. Sie berühren Organisation, Haftung, Zusammenarbeit, Regulierung und Entscheidungsverantwortung.

Gerade im deutschsprachigen Raum — in Unternehmen, Mittelstand, öffentlicher Verwaltung, regulierten Branchen und europäischen Governance-Kontexten — müssen diese Fragen präzise und anschlussfähig diskutiert werden können.

Englische Fachbegriffe wie `AI-native`, `Delivery`, `Gate`, `Traceability`, `PRD.contract` oder `Agentic Software Engineering` werden dort verwendet, wo sie als etablierte Fachanker hilfreich sind.

## Brownfield als Hauptanwendungsfall

Dieses Framework betrachtet Brownfield-Projekte nicht als Sonderfall, sondern als zentrale Realität agentischer Software Delivery.

Viele relevante KI-gestützte Softwarevorhaben entstehen nicht auf der grünen Wiese. Sie finden in bestehenden Systemlandschaften statt:

- gewachsene Codebasen
- historische Architekturentscheidungen
- unvollständige Dokumentation
- bestehende Schnittstellen
- regulatorische Anforderungen
- technische Schulden
- laufender Betrieb
- fehlende oder lückenhafte Tests

Gerade dort reicht schnelle Code-Erzeugung nicht aus. Agentische Softwarearbeit muss kontrolliert, nachvollziehbar und reversibel bleiben.

## Grundprinzipien

### 1. Fail closed

Wenn eine notwendige Voraussetzung fehlt, wird nicht einfach weitergemacht. Fehlende Freigaben, unklare Anforderungen oder fehlende Qualitätsnachweise führen zu Klärung, Revision oder Blockade.

### 2. Single Source of Truth

Der Produktvertrag ist die verbindliche Quelle für Scope, Akzeptanzkriterien und Non-Goals.

### 3. Design ist nicht Code

Solution Design beschreibt Architektur, Verantwortlichkeiten, Schnittstellen und Abläufe. Code beschreibt ausführbares Verhalten, vollständige Payloads, Schemas, Migrationen und Implementierungslogik.

### 4. Traceability statt Bauchgefühl

Jede relevante Entscheidung soll auf Anforderungen, Artefakte, Freigaben oder Qualitätsnachweise zurückführbar sein.

### 5. Qualität braucht Nachweise

Build-, Test-, Review- und Risikoaussagen müssen sichtbar gemacht werden. Nicht verifizierte Aussagen werden als solche markiert.

### 6. Änderungen müssen explizit sein

Scope-Änderungen, geänderte Akzeptanzkriterien, Non-Goal-Anpassungen sowie sicherheits-, compliance- oder datenschutzrelevante Änderungen brauchen dokumentierte Change Control.

## Vorgeschlagene Gate-Struktur

Das Framework arbeitet mit klaren Gates:

| Gate                       | Zweck                                                           |
|----------------------------|-----------------------------------------------------------------|
| G-00 User Request          | Problemverständnis, Scope-Rahmen, Risiken, Entscheidungsvorlage |
| G-01 Product Requirements  | Anforderungen und stabiler Produktvertrag                       |
| G-02 Solution Design       | Lösungskonzept, Architektur, Schnittstellen, Datenflüsse        |
| G-03 Test Plan             | Teststrategie, Abdeckung der Akzeptanzkriterien                 |
| G-04 Code / Implementation | Implementierung, Tests, Qualitätsnachweise                      |

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
│  ├─ test-plan.md
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
2. Offene Fragen in den GitHub Discussions kommentieren
3. Issues zu Begriffen, Gates, Artefakten oder Brownfield-Anwendungsfällen anlegen
4. Verbesserungsvorschläge als Pull Request einreichen

## Aktueller Arbeitsstand

Die erste öffentliche Version konzentriert sich auf:

- Manifest und Positionierung
- Begriffsklärung
- Gate-Modell
- Artefaktmodell
- PRD.contract als Produktvertrag
- Brownfield-Relevanz
- offene Diskussionsfragen

Noch nicht im Fokus:

- fertiges Tooling
- Agent Runtime
- IDE-Integration
- vollständige Automatisierung
- organisationsspezifische Compliance-Profile

## Diskussion erwünscht

Dieses Projekt lebt von Kritik und Gegenbeispielen.

Besonders interessant sind Fragen wie:

- Wie viel Governance ist hilfreich, bevor sie zu schwergewichtig wird?
- Ist ein Produktvertrag der richtige Anker für agentische Delivery?
- Wo endet Design und wo beginnt Implementierung?
- Welche Qualitätsnachweise sind für Vertrauen notwendig?
- Wie lässt sich das Framework in Brownfield-Projekten anwenden?
- Welche Teile sollten durch Tooling unterstützt werden?
- Was muss menschliches Review und menschliche Verantwortung bleiben?

## Mitwirken

Beiträge sind willkommen in Form von:

- Diskussionen
- Issues
- Verbesserungsvorschlägen
- Gegenargumenten
- Beispielen aus realen Brownfield-Projekten
- Pull Requests für Dokumentation, Templates oder Beispiele

Bitte beachte: Dieses Repository ist zunächst ein Framework- und Diskussionsprojekt. Implementierungsdetails und Tooling werden erst später ergänzt.

## Lizenz

Die Lizenz ist noch festzulegen.

Bis zur Entscheidung sollte das Repository als Diskussionsentwurf behandelt werden.

