# Cockpit-Archivübernahme – Umsetzungsnachweis, 2026-11-01

Altbestände sollen einmalig erhalten und im Cockpit nachgelesen werden. Der Maintainer hat
die ursprüngliche Bezeichnung „Historie“ zu „Archiv“ präzisiert. Der Diff trennt deshalb
beendete aktuelle Runs, archivierte Altbestände und den Änderungsverlauf innerhalb eines Runs.

Arbeitsgrenze: direktes Offline-Wartungswerkzeug und lesende Cockpit-Erweiterung auf
`agdf/cockpit-archive-import`, Basis `aab3424bc793b86c8b3fecb9cb877ee9ae29aa4f`.
Kein neuer AGDF-Run, keine Gate-Freigabe, keine Installation und keine Umstellung des echten
Kontrollbestands gehören zu dieser Arbeit. Der Maintainer beauftragte anschließend Commit,
Veröffentlichung des Branches und CI-Überwachung. Der separate PR baut auf dem noch offenen
PR #51 (`agdf/run-model-clean-cut`) auf; CI wird im PR an den tatsächlichen Head gebunden.

## Verhalten und Quellen

- Vier unabhängige Bereiche: **Aktiv**, **Geplant**, **Beendet**, **Archiv**. „Beendet“ bleibt
  aktuellen Runs vorbehalten. Auch ein im alten Zustand noch aktiver Run ist nach Übernahme
  ausschließlich ein Archiveintrag. `history/` bezeichnet weiterhin den Verlauf eines aktuellen Runs.
- `scripts/import-cockpit-archive.mjs` exportiert `importCockpitArchive(directory, options)`.
  Der Standard ist eine schreibfreie Vorschau. Die Übernahme verlangt den exakten Quelldigest.
- `.agdf/control/archive/INDEX.json`, Schema `cockpit-archive/1`, enthält `entries` mit
  `entry_kind` (`run`, `artefacts`, `project`), `recorded_lifecycle`, `recorded_gate`,
  `recorded_approvals`, `source_control_version` und Dokumentreferenzen. `archived_at`
  bezeichnet den Archivierungszeitpunkt. Aufgezeichnete Freigaben haben keine heutige Gültigkeit.
- Originalbytes einschließlich unbekannter und binärer Dateien, leerer Verzeichnisse,
  alter Konfiguration und alter Siegel bleiben unter `archive/source/` erhalten.
  `.agdf/backups/control-<digest>` ist die vollständige technische Originalsicherung.
  Das Archiv dient dem Nachlesen; die Sicherung dient der Wiederherstellung.
- Vor Veröffentlichung werden Stage-Dateien gegen Quellen, Index und kanonische Vorlagen geprüft.
  Dateien und Verzeichnisse werden synchronisiert. Ein Journal bindet den Wiederanlauf an
  Projekt, Sicherung und Stage. Veränderte Quellen, offene Operationen, Symlinks und manipulierte
  Sicherungen werden abgewiesen. Wiederholung liefert `already_archived`.
- Core liest ausschließlich den aktuellen Run-Vertrag und das neue Archivformat. Alte Zustände
  werden nur im Offline-Werkzeug ausgewertet. Kein Masterbacklog wird zur aktuellen Steuerung
  reaktiviert; gegebenenfalls bleibt er als altes Projektdokument lesbar.
- Die eigene Archivansicht zeigt Bestandsart, aufgezeichneten Status und Gate, alte Freigaben
  sowie Dokumente als Text. Sie bietet keine Freigabe- oder Fortsetzungsaktion. Dokumente sind
  an Eintrag, registrierte Ressource, Snapshot, SHA-256 und Größe gebunden.
- MCP-Operation `archive` und HTTP `/api/archive/<row-id>` verwenden denselben Leser.
  Die vor Veröffentlichung verworfene Benennung `history` erhält keine Kompatibilitätsroute.

Kanonisch sind Offline-Werkzeug, Core-Archivleser und -Projektion, der gemeinsame MCP-Vertrag,
HTTP-Adapter sowie UI-Typen, Validatoren und Leseansicht. Generierte Host-/npm-Payloads werden
über die bestehenden Build-Owner hergestellt; installierte Caches wurden nicht gepatcht.
Der Import-Test ist über `packages/cli/package.json` in das bestehende CI-Inventar eingebunden.

## Prüfungen

| Prüfung | Ergebnis |
| --- | --- |
| Import, Sicherung, Wiederanlauf, MCP-/HTTP-Zugriff | 14/14 bestanden; einschließlich aufgezeichnetem aktiven Altzustand ohne aktuelle Steuerungswirkung und unabhängiger Zähler für beendete Runs und Archiv |
| UI-Suite | 284/284 bestanden; anschließend 33/33 gezielte Fälle für kompakte Ansicht, Archivlesen und MCP-Transport einschließlich des neuen Kompakt-Regressionsfalls |
| Lokaler HTTP-Regressionssatz | 8/8 bestanden |
| Core-Cockpit-Regression | 44/44 bestanden |
| Chromium gegen produktiven lokalen Server | bestanden: Archiv öffnen, Status und UR lesen, keine Freigabeaktion, Index unverändert |
| MCP-Cockpit-Capability-Gating | beide Protokollvarianten 2025-11-25 und 2026-07-28 bestanden |
| Typecheck, normaler UI-Build, Codex-Payloadvorbereitung, npm-Assembly | bestanden |
| Kanonische CI-Testregistrierung | Import-Testgruppe im CLI-Maintenance-Script und CI-Inventar nachgewiesen |

Eine vollständige Kopie des realen Altbestands wurde isoliert übernommen:

- **13.535 Dateien, 700.846.855 Bytes**, **190 Archiveinträge**. Darin liegen 158 alte
  Run-Zustände, zusätzliche Artefaktbestände ohne Run-Zustand und gemeinsame Projektdateien.
- Quelldigest vor der Übernahme und beim abschließenden Lesen des echten Originals:
  `sha256:c1aff08b89137fc24d8ec0708b26d8c51f8a3e70a79fca424a7f92f2c5007246`.
- Veröffentlichung und Originalsicherung erfolgreich; Cockpit-Zähler `active: 0`, `planned: 0`,
  `completed: 0`, `archive: 190`. Die aktuelle Run-Inventur bleibt leer.
- Ursprünglich geschlossener Beispiel-Run: aufgezeichneter Status `completed`, sechs alte
  Freigaben erhalten, archivierte UR gelesen, `authorizes: false`.
- Übersicht erfasst **5.200.433 Bytes**; das vollständige 701-MB-Archiv wird nicht erfasst.
  Bestehende Capture-, Antwort- und Vorschaugrenzen bleiben unverändert.
- Keine Änderung unter dem echten `.agdf/control`; die drei vorbestehenden fremden
  Kompatibilitätsdateien behalten ihre ursprünglichen SHA-256-Werte. Die tatsächlich
  schreibenden Übernahmen liefen ausschließlich in isolierten Testprojekten.

Die kompakte MCP-Ansicht erhielt denselben Archivleser wie die große Browseransicht.
Ihr zusätzlicher Regressionstest öffnet einen alten, damals aktiven Eintrag, ohne einen
aktuellen Run zu laden. Dies ist ein Komponententest des MCP-Ansichtspfads, keine native
Host-Abnahme.

Lokale Nachweise: `/private/tmp/agdf-archive-refine-import3.log`,
`/private/tmp/agdf-archive-refine-dom3.log`, `/private/tmp/agdf-archive-refine-service.log`,
`/private/tmp/agdf-archive-refine-core2.log`, `/private/tmp/agdf-archive-browser-final.log`,
`/private/tmp/agdf-archive-refine-compact.log`,
`/private/tmp/agdf-archive-mcp-final.log`, Build-/Assembly-Protokolle mit demselben Präfix,
Chromium-Screenshot `/private/tmp/agdf-cockpit-archive.png` und das isolierte Übernahmeprotokoll
`/private/tmp/agdf-archive-scale.log` sowie
`/private/tmp/agdf-archive-scale-ran6le5k/result.json`. Diese lokalen Nachweise werden nicht mit Rohbeständen
oder vollständigen Originalgesprächen in den Implementierungsdiff aufgenommen.

## Grenzen und Verantwortung

Geprüft auf macOS mit Node.js 22. Keine neue native Codex-Desktop-/Cockpit-, Windows- oder
weitere Host-Qualifikation. Repository-, Browser- und MCP-Tests ersetzen keine menschliche
Abnahme. Die folgenden Nachweise sind lokale Prüfungen vor dem Commit; der nachfolgende
CI-Status wird im PR mit dem geprüften Head geführt. Kein lokaler Volltest oder Nightly-Lauf. Der normale UI-Build meldet weiterhin einen
Bundle-Chunk über 500 kB; Limits wurden nicht angehoben. Die Übernahme setzt ruhende alte
Schreiber voraus und ist keine Online-Migration. Große und binäre Dokumente bleiben erhalten;
die Vorschau bleibt auf 2 MiB begrenzt.

Bei der Umbenennung deckten Tests eine ausgelassene HTTP-Routenanpassung und veraltete
UI-Fixtures/Erwartungen auf. Die abschließende Sichtprüfung identifizierte außerdem die
noch fehlende Verbindung zum Archivleser in der kompakten MCP-Ansicht. Diese wurden korrigiert und die betroffenen Gruppen erneut ausgeführt;
die ursprünglichen Fehlprotokolle bleiben lokal erhalten.

Wesentliche KI-Unterstützung: Codex führte Analyse, Implementierung und technische Selbstprüfung
aus. Eine unabhängige menschliche Codeprüfung oder neue QA/UAT-Abnahme ist nicht dokumentiert.
Diese Dokumentation erteilt keine Release- oder Merge-Freigabe.

## Direkte CI-Reparatur, 2026-11-02

Auftrag: ohne AGDF reparieren und CI bis grün überwachen. CI #668 auf `736abf48` endete
mit 166 fehlgeschlagenen Jobs: die untersuchten Gruppen brachen schon bei der Generierung
ab, weil `sync-plugin-runtime.js` einen entfernten CLI-Ordner `lib/control-state` kopierte.
Ein leerer lokaler Restordner hatte diesen Fehler verdeckt. Die Runtime verwendet weiterhin
die vollständige kanonische Core-Projektion; nur der obsolete Kopiereintrag wurde entfernt.

Der Archiv-Test verwendet auf Windows einen dort gültigen Dateinamen mit Prozentzeichen und
Unicode; der POSIX-Fall mit Doppelpunkt bleibt erhalten. Byte-Erhalt und Pfadkodierung werden
weiterhin geprüft. Keine Prüfung oder Produktgrenze wurde abgeschwächt.

Nachweise im isolierten Quellcheckout mit Lockfile-Abhängigkeiten:

- Unveränderter Generator: identisches `ENOENT` reproduziert. Mit Fix: vollständige Generierung,
  Build-Verträge, alle 113 deterministischen Skill-Evaluationen und npm-Assembly bestanden.
- Archiv-Integration: 14/14 bestanden, einschließlich tatsächlicher MCP-Session und HTTP-Route.
- Source-bound Kompatibilitätsprüfung meldete erwartungsgemäß `source_snapshot_changed`.
  Nach regulärem Fixture-Recorder: 56/56 Szenarien und anschließende Prüfung bestanden.
  Die versionierten nativen Quellen und öffentlichen nativen Nachweise sind unverändert;
  daraus folgt keine neue native Host-Abnahme.
- `release:prepare` bestanden: elf historische Profile, transaktionale Versionsanpassung,
  Versionskohärenz von 49 Oberflächen, öffentlicher Plugin-Build und portable Profile.
  Normale Payloads wurden im frischen Checkout über die vorhandenen Build-Owner erzeugt.
  Historische Git-Tags und versionierte Referenzdokumente gehören zu den Voraussetzungen
  der Release- und Kompatibilitätsprüfungen; fehlende Inputs wurden im isolierten Checkout
  bereitgestellt, ohne die Testanforderungen zu lockern.

Frühere lokale Versuche warteten auf fremde, dataless Duplikatdateien in ignorierten
Build-/Dependency-Ordnern. Sie wurden beendet und durch den frischen Checkout ersetzt;
Originaldateien bleiben erhalten. Ein zusätzlicher Source-Copy-Selbsttest war wegen fehlender
Repository-Governance-Fixtures nicht qualifiziert und wird nicht als bestanden gezählt.
Diese Beobachtung änderte weder dessen Testanforderungen noch den kanonischen CI-Plan.

Lokale Logs: `/private/tmp/agdf-archive-ci-fresh-before.log`,
`/private/tmp/agdf-archive-ci-fresh-after.log`, `/private/tmp/agdf-archive-ci-import-clean.log`,
`/private/tmp/agdf-archive-ci-build-contracts.log`, `/private/tmp/agdf-archive-ci-evals.log`,
`/private/tmp/agdf-archive-ci-compat-record3.log`, `/private/tmp/agdf-archive-ci-compat-final.log`.
Vollständige CI-Ergebnisse werden im PR mit dem tatsächlichen Head und Run-Link dokumentiert.
Kein Merge und keine globale Installation gehören zu diesem Auftrag.

## Direkte CI-Reparatur der Clean-Cut-Integration (2026-11-02)

Auf `99929b662f0589221ca8102b59808c87fba5d827` beendete Guardrails #669
(`41405347643`) alle 167 Jobs: 131 erfolgreich, 36 fehlgeschlagen. Die erfolgreiche
Generierung machte weitere alte Integrationsannahmen sichtbar. Diese Reparatur erfolgt
auf ausdrücklichen Wunsch direkt ohne AGDF-Aktivierung, neuen Run oder Gate-Freigaben.

- Der Claude-Begleiter liest die aktuellen typisierten Run-Fakten. Seine passive
  Gate-Anzeige verwendet dieselbe reine Policy wie der Core; deren Algorithmus ist
  bei der Auslagerung unverändert geblieben. Die produktive Core-Komposition behält
  den validierten Receipt-Leser. Quell- und generierter Begleiter werden auf Parität
  geprüft; dies ist kein Nachweis nativer Claude-Hook-Ausführung.
- `run-revise` rendert ohne `--json` wieder die lokalisierte Vorschau einschließlich
  des exakten Bestätigungsselektors. JSON bleibt die strukturierte Command-Antwort.
  Auch ein vor dem Dispatch abgewiesener Materialtransfer erhält die lesbare Ausgabe.
- Nach einem unterbrochenen Source-Revision-Schreibvorgang darf der bestehende
  Material-Owner den Vorschlag erneut laden. Die Eingabeauflösung lässt nur diesen
  flüchtigen Transport an einem bestätigten aktuellen Source-Revision-Journal vorbei;
  Target-, Revisions-, Lifecycle- und Seal-Prüfung bleiben beim Material-Owner.
  Die eigentliche Wiederherstellung benötigt weiterhin ursprüngliche UUID,
  Vorschlag, aktuelle Revision und exakten Pending-Digest.
- Schema-, Lokalisierungs-, Inventur-, Wartungs- und Handbuchprüfungen verwenden die
  aktuelle Struktur. Alte Run-Versionen und nachträglich eingefügte abgeleitete
  Tabellen bleiben ausdrücklich unzulässig. Windows-Prozesse erhalten native
  Dateipfade aus `fileURLToPath`.
- Installations-/Protokollfixtures erzeugen eigene aktuelle Git-Projekte und Runs;
  sie lesen keine echten Altbestände als heutige Steuerung. Revisionstests nutzen
  den produktiven Command-Owner statt die alte direkte Mutationsschnittstelle.
  Der HTTP-Archivtest stellt eine minimale eigene statische UI bereit, damit die
  API-Prüfung nicht vom normalen Browser-Build abhängt.

Keine bestehenden Produktlimits, CI-Anforderungen oder Assertionen wurden gelockert.
Historische Übersetzungs-Source-Digests wurden auf ihre unveränderten aktuellen
Quellen gebunden; eine neue menschliche Übersetzungsprüfung wird nicht behauptet.
Der echte Kontrollbestand und vorbestehende fremde Dateien bleiben unberührt.

Auch die eigenständige Sprachkonfiguration hatte noch eine Clean-Cut-Lücke: eine neu
angelegte Datei enthielt keine Layout-Kennung und wurde beim nächsten Aufruf abgewiesen.
Neue Sprachkonfigurationen erhalten jetzt explizit `run-folders-v1`; vorhandene Werte
werden bewahrt, alte Layouts bleiben abgewiesen. Der vollständige CLI-Smoke prüft die
zweimalige Konfigurationsänderung sowie Initialisierung, lokale Installation und Sprachen.

Lokale Nachweise dieses Reparaturstands im isolierten Checkout:

- Zwölf Core-Modell-/Journey-/Flow-Fälle, die Command-Service-/Revision-Integration
  einschließlich echter Fault-Checkpoints und fünf Material-/Default-Eingabefälle bestanden.
- Begleiterlogik einschließlich Parität des erzeugten Moduls, aktuelle Inventur,
  Instruktions-Footprint und 22 deterministische Ergonomie-Prädikate bestanden.
- Tatsächliche MCP-Continuations und CLI/Core/MCP-Revisionsparität einschließlich
  unterbrochenem Schreibvorgang und expliziter Wiederherstellung bestanden.
- Codex-Plugin-MCP, lokaler Marketplace einschließlich isolierter Legacy-Settlement-
  und Rollback-Fälle sowie vollständiger CLI-Smoke bestanden. Keine globale Installation.
- Konfigurationsdefaults, PRD-Readiness, 28 Initialisierungsfälle und Community-Health
  mit 29 negativen Verträgen bestanden. Windows-native Prüfung bleibt Aufgabe der CI.
- Archiv-API-Integration: 14/14 bestanden. Der erste Versuch dieses letzten Durchgangs
  scheiterte ausschließlich an der Sandbox-Sperre für `127.0.0.1`; mit erlaubtem
  temporärem Loopback-Server bestanden dieselben unveränderten Tests vollständig.
- Reguläre Generierung und npm-Assembly bestanden. Neuer Fixture-Recorder: 56/56;
  Source-Bindung auch in der ursprünglichen Arbeitskopie bestätigt, Fingerprint
  `41f627288207d40ee8337d245ebf71f837bb4b982c7d894bd5be9ac603127456`.
  Native Quellen und veröffentlichte native Originalnachweise sind bytegleich geblieben.

Auch zehn Revisionszyklen mit anschließendem echten Prozesswettbewerb und 48
lokalisierte CLI-Ausgabe-/Recovery-Fälle bestanden. Falsche Pending-Digests und
falsche Revisionen bleiben ohne Änderung der dauerhaften Dateien abgewiesen.
Der Fault-Worker hinterlässt absichtlich einen verwaisten Prozesslock; die Fixture
löst ihn vor Byte-Vergleichen über den validierten Lock-Owner, ohne Journal oder
Snapshots zu entfernen. Vollständige CI bleibt an den anschließend gepushten SHA gebunden. Kein lokaler Gesamtlauf,
keine neue native Host-Abnahme oder menschliche QA/UAT wird aus diesen Tests abgeleitet.
