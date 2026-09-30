# UR: MCP-Zielarchitektur als Diskussionsdokument

Status: draft
Gate: UR
Gate approval: open
Date: 2026-09-29
Owner: User

## 1. Problem

Die aktuelle Architektur beschreibt die vorhandenen MCP-Einstiegspunkte `agdf_dispatch` und
`agdf_inspect`. Für die Weiterentwicklung fehlt ein klar abgegrenztes Zielbild, welche fachlichen
Fähigkeiten AGDF perspektivisch über MCP anbieten sollte und welche Verantwortlichkeiten beim Host,
bei Skills, CLI und den kanonischen AGDF-Diensten bleiben.

## 2. Goal

Ein eigenständiges, ausdrücklich nicht normatives Diskussionsdokument beschreibt die fachliche
MCP-Zielarchitektur, ihre Verantwortungsgrenzen, mögliche Fähigkeitenfamilien, offene Entscheidungen
und einen möglichen Entwicklungspfad. Leser können Ist-Zustand, Zielbild und bereits beschlossene
Entscheidungen auseinanderhalten.

## 3. Scope

- Eine neue Zielarchitektur-Dokumentation unter `docs/architecture/`, verlinkt aus der bestehenden
  Architekturübersicht.
- Einordnung von Auftrag und Zielbindung, Kontrollabfrage, Entscheidungsvorbereitung sowie möglichen
  Zustandsänderungen.
- Beschreibung der Zuständigkeiten für Policy, Run-Zustand, Freigabe, Evidenz und MCP-Adapter.
- Kennzeichnung möglicher Schnittstellen und Toolnamen als Vorschläge, nicht als beschlossene API.
- Dokumentation offener Fragen, Risiken und möglicher Migrationsschritte vom heutigen Angebot.

## 4. Non-Goals

- Änderung oder Einführung von MCP-Tools, Schemas, Laufzeitverhalten oder Gate-Policy.
- Implementierungsfreigabe oder Festlegung der endgültigen Toolnamen.
- Festlegung einer nicht ausreichend geklärten technischen Freigabe- oder Autorisierungslösung.
- Änderung des kanonischen Kontrollzustandsmodells.
- Test-, Build-, Release- oder Host-UAT-Arbeiten.

## 5. Acceptance Signals

- Das Dokument ist klar als Zielbild/Diskussionsstand gekennzeichnet und von der Beschreibung des
  implementierten Zustands getrennt.
- Es beschreibt fachliche Fähigkeiten statt AGDF-interne Modul- oder CLI-Strukturen als API-Vorgabe.
- Es weist menschliche Entscheidungen und kanonischen Zustand den zuständigen Eigentümern zu und
  beschreibt MCP als Adapter.
- Jede vorgeschlagene Fähigkeit nennt Zweck, Bindungen, Ergebnis, Nebenwirkungen und Fehlerfälle in
  angemessener Tiefe.
- Beschlüsse, Vorschläge und offene Fragen sind visuell unterscheidbar; bestehende Verträge und
  Implementierung bleiben die maßgeblichen Quellen für den aktuellen Zustand.
- Die bestehende Architekturübersicht verweist auf das neue Dokument, ohne dessen Vorschläge als
  geltende Verträge darzustellen.

## 6. Existing Source Of Truth

- `docs/architecture/README.md` für die aktuelle Architekturübersicht und ihre Geltungsbereichsangaben.
- `create-agdf/lib/skill-dispatch/contract.js` für den vorhandenen `agdf_dispatch`-Vertrag.
- `create-agdf/lib/control-inspect/contract.js` und `selection.js` für den vorhandenen lesenden
  `agdf_inspect`-Vertrag.
- `plugin/meta/contracts/` für normative Aktivierungs-, Zielbindungs-, Kontroll- und
  Interaktionsverträge.
- `create-agdf/lib/control-state/` und `control-evaluation/` für Implementierung und Eigentum am
  kanonischen Run- und Gate-Zustand.

## 7. Risks And Unknowns

- Welche Fähigkeitenfamilien benötigen Agenten tatsächlich, und welche können beim Skill-/CLI-Weg
  bleiben?
- Soll MCP nur lesende und vorbereitende Funktionen anbieten oder später auch gebundene
  Zustandsänderungen ausführen?
- Wie lässt sich eine menschliche Freigabe über MCP belastbar an Run, Gate, Revision und Digest
  binden?
- Welche Ergebnisse gehören als Tools, Resources oder Prompts in die Host-Oberfläche?
- Der aktuelle Architekturtext ist datiert; der Geltungsbereich des Ist-Zustands muss beim Schreiben
  gegenüber Quellstand und Release-Status präzise benannt werden.

## 8. Next Step

UR prüfen und nur mit folgender Form freigeben:

`Approval: UR`
