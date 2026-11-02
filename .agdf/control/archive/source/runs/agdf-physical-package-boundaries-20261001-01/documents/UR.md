# UR: Physische Core-/CLI-/MCP-Paketstruktur

Status: draft
Gate: UR
Gate approval: open
Date: 2026-10-01
Owner: Arndt Gold
Run: agdf-physical-package-boundaries-20261001-01
Language: de

## 1. Problem

Der gewünschte Repository-Zielbaum ist nach der bisherigen Plugin-Migration noch
nicht erreicht. `plugins/agdf/` enthält jetzt die kanonischen Plugin-Inhalte,
Kontrollkern und CLI sind jedoch weiterhin in `create-agdf/` vermischt. Die dünne
CLI-Fassade liegt in `agdf/`, der MCP-Server in `agdf-mcp-server/`; Build- und
Release-Verantwortlichkeiten sind auf Root- und Paket-Skripte verteilt.

Die bisherige Solution Design begrenzte den Umfang auf portables Plugin-Format,
Quellpfadmigration und dokumentierte logische Grenzen. Der Nutzer fordert jetzt
ausdrücklich die noch fehlende physische Gesamtstruktur als nächsten Schritt.
Dieser Folge-Run hat eigene Freigaben; die früheren Freigaben werden nicht übernommen.

## 2. Goal

Das Repository soll die vom Nutzer gewünschte Trennung auch auf dem Dateisystem
und in den tatsächlichen Abhängigkeiten zeigen: Plugin-Inhalte unter
`plugins/agdf/`, ausführbare Software unter `packages/core/`, `packages/cli/`
und `packages/mcp-server/`, übergreifende Build-/Release-Orchestrierung unter
`scripts/`, Dokumentation unter `docs/` und Evaluationen unter `evals/`.

Maintainer sollen eine Regel, einen Validator, einen Installationsbefehl oder einen
MCP-Adapter ohne Suche über mehrere alte Quellordner einem eindeutigen Owner
zuordnen können. Die Softwaregrenzen müssen technisch prüfbar sein; eine reine
Umbenennung des heutigen Mischpakets erfüllt das Ziel nicht.

## 3. Scope

Der folgende Baum ist der verbindliche organisatorische Zielrahmen dieses Runs,
nicht nur ein optionaler Kandidat für spätere Arbeit:

```text
repository/
├── plugins/
│   └── agdf/
│       ├── plugin.json
│       ├── skills/
│       ├── mcp.json             # soweit im ausgewählten Profil unterstützt
│       ├── hooks/               # soweit im ausgewählten Profil aktiviert
│       ├── assets/
│       ├── meta/contracts/
│       └── control/templates/
├── packages/
│   ├── core/
│   ├── cli/
│   └── mcp-server/
├── docs/
├── evals/
└── scripts/
```

- Kontrollzustand, Regeln, Freigabe-/Run-/Revisionsvalidierung und deren technische
  Persistenzgrenzen physisch im Core bündeln. Core erhält keine Abhängigkeit von
  Hostinstallation, CLI-Interaktion oder MCP-SDK. Es darf keine zweite Regel- oder
  Freigabeimplementierung neben diesem Owner entstehen.
- Befehle, Installation, Setup und Host-Komposition physisch in der CLI bündeln.
  Bestehende CLI- und MCP-Verbraucher sollen den gemeinsamen Core über erklärte,
  überprüfbare Schnittstellen verwenden. Die genaue öffentliche/private Paket- und
  Exportgestaltung ist eine explizite Designentscheidung.
- Den MCP-Adapter physisch unter `packages/mcp-server/` organisieren; Protokoll-
  und Transportcode bleiben von fachlicher Kontrollautorität getrennt. Eine spätere
  UI-Anbindung erhält eine klare Anschlussgrenze.
- Repository-weite Build-/Release-Orchestrierung, Profilgenerierung und gemeinsame
  Prüfwerkzeuge konsistent unter `scripts/` organisieren. Notwendige paketlokale
  Einstiegspunkte dürfen delegieren; sie dürfen keine zweite Build-Logik enthalten.
- Eine kanonische Pluginquelle beibehalten. Quellbaum, erzeugtes installierbares
  Profil, npm-Archiv und tatsächliche Installation werden ausdrücklich zugeordnet.
  Die MCP-/Hook-Dateien des Zielbaums müssen je Profil nachvollziehbar realisiert
  oder als technisch begründete, sichtbar akzeptierte Abweichung behandelt werden.
  Keine stille Reduzierung des Zielbaums auf die schon vorhandene Struktur.
- Bestehende npm-Namen `create-agdf`, `@agdf/cli` und `@agdf/mcp-server`, unterstützte
  Befehle, öffentliche Exports, Daten-/Installationspfade und Versionsbindungen
  kompatibel halten. Zusätzliche interne Paketgrenzen sind nicht automatisch
  zusätzliche Veröffentlichungen; nötige Veröffentlichungsänderungen müssen vor
  Umsetzung ausdrücklich entschieden werden.
- Builder, Installer, Update/Recovery, CI, Release, Tests, Evaluationen und aktuelle
  Dokumentation auf die neuen Owner/Pfade migrieren. Historische Artefakte behalten
  ihre damalige Aussage; aktive alte Quellbäume dürfen keine gepflegten Spiegel sein.
- Die wirksame Struktur einschließlich installierbarer Profile und verbleibender
  Abweichungen im Abschlussbericht gegen den Zielbaum nachweisen.

## 4. Non-Goals

- Keine Personal- oder Teamreorganisation.
- Keine Änderung der verbindlichen Governance-Regeln, menschlichen
  Freigabeautorität, Consent-/Trust-Grenzen oder Offline-Validierung.
- Keine neue UI, kein Panel, kein Remote-Service und keine neue öffentliche
  MCP-/Hook-Fähigkeit allein durch die Ordnerorganisation.
- Keine Veröffentlichung, aktive Nutzerinstallation oder VCS-Aktion allein aus
  dieser UR. Solche Aktionen benötigen den jeweiligen Auftrag und Gate-Kontext.
- Keine Wiederholung der bereits erledigten Plugin-Migration oder Reparatur
  unabhängiger Workspace-Änderungen als verdeckte Voraussetzung dieser Arbeit.

## 5. Acceptance Signals

1. Die drei Softwarekomponenten liegen tatsächlich unter
   `packages/{core,cli,mcp-server}/`; sie tragen jeweils ihre benannte Verantwortung.
   Eine Dokumentation über unveränderte alte Ordner reicht nicht aus.
2. Core, CLI und MCP haben eine erklärte, testbare Abhängigkeitsrichtung und genau
   einen Owner für Kontrollregeln und Zustandsänderungen. Kein zyklischer Import
   und kein Rückgriff des Core auf Host-/CLI-/MCP-Implementierung bleibt unentschieden.
3. Übergreifende Build-/Release-Verantwortlichkeiten haben eine kanonische
   Organisation unter `scripts/`. Paket-Einstiege und CI verwenden diese Owner.
4. Bestehende Verbraucher funktionieren aus tatsächlichen Paketen und erzeugten
   Installationsprofilen; die öffentliche Kompatibilität bleibt durch konkrete
   Prüfungen und paketbezogene Nachweise belegt.
5. Der Zielbaum ist für Quelle und installierbare Artefakte eindeutig erklärt.
   Jede verbleibende Abweichung ist benannt, technisch begründet und vor Abnahme
   sichtbar; ein Zwischenstand darf nicht als vollständiger Zielbaum gelten.
6. Die Migration hat überprüfbare Zwischenstufen und einen begrenzten Rückweg.
   Fremde Änderungen, alte Freigaben und aktive Installationen werden dabei
   nicht überschrieben oder als neue Zustimmung übernommen.

Diese Signale werden im PRD in prüfbare Produktkriterien überführt; SD und TP
konkretisieren Schnittstellen, Paketzuordnung, Migrationsschritte und Nachweise.

## 6. Existing Source Of Truth

- Nutzer-Zielbaum und Auftrag „erledigen wir das als nächstes“ in diesem Chat.
- `docs/architecture/package-structure.md`: verifizierter aktueller Zwischenstand.
- Run `agdf-portable-plugin-package-structure-20261001-01`: bisherige Umsetzung,
  QA Report Revision 4 und lokale Codex-Installationskorrektur als Baseline,
  ohne Freigabeübernahme oder nachträgliche Umschreibung seines Scope.
- `plugins/agdf/meta/agdf-plugin.definition.json`, Verträge und Profildefinitionen:
  kanonische Plugin-/Governance- und Discovery-Owner.
- Aktuelle Paketmanifeste und öffentliche Exports in `create-agdf/`, `agdf/` und
  `agdf-mcp-server/`; aktuelle Build-/Release-/Installer-/Runtime-Provenance-Owner.
- `.agdf/control/SOT_REGISTRY.md`, `CONTEXT_GRAPH.md`, aktuelle CI/Release-Workflows
  und Compatibility-Nachweise.

## 7. Risks And Unknowns

- Brownfield Review muss die tatsächlichen Core-/CLI-/MCP-Verflechtungen und
  gemeinsam genutzten Persistenz-, Metadaten- und Runtime-Owner klären.
- PRD/SD müssen den Erhalt alter npm-/Exportverträge bei neuer physischer
  Paketzuordnung entscheiden, einschließlich privater oder veröffentlichter
  Core-Grenze, Versionskopplung und begrenzter Kompatibilitätsfassaden.
- Source-/Build-/Installationsgrenzen und optionale MCP-/Hook-Pfade dürfen keine
  Fähigkeiten unbeabsichtigt aktivieren. Host-Lifecycle und Transportanforderungen
  müssen vor jeder behaupteten Portabilität geprüft sein.
- Pfadwechsel können CLI, Paketinhalt, Offline-Bundle, Installer, Windows,
  Provenance, Release-History, CI und Evaluationen beeinflussen. Umfang und
  Nachweiswege gehören in SD/TP, nicht in stillschweigende Implementierungsannahmen.
- Der aktuelle Workspace enthält Änderungen und staged Zwischenschritte anderer
  Arbeit. Nach UR-Freigabe werden betroffene Owner und aktuelle Revisionen geprüft;
  keine pauschale Bereinigung, kein Überschreiben und keine übernommene Freigabe.

## 8. Next Step

Diese persistierte UR prüfen und nur mit `Approval: UR` freigeben.
Die Freigabe erlaubt zunächst Brownfield Review und Mode/Slice Decision dieses
neuen Runs; sie erlaubt noch keine Implementierung. Weitere Gates werden anhand
der tatsächlichen Auswirkungen und dieser verbindlichen Zielstruktur vorbereitet.
