# PR #51: eigene CI-Reparatur des Run-Modells

Stand vor dem ergänzenden Commit, 2026-11-02. Direkte, ausdrücklich beauftragte
Reparatur ohne AGDF-Aktivierung, neuen Run, Installation oder zusätzliche Freigaben.

## Problem und Quellgrenze

PR #51 stand auf `aab3424bc793b86c8b3fecb9cb877ee9ae29aa4f`; sein Guardrails-Lauf
[#667](https://github.com/ArndtGold/ai-native-governance-delivery-framework/actions/runs/41340884613)
scheiterte bereits bei der Generierung: `packages/cli/lib/control-state` wurde weiter
kopiert, obwohl dieser Owner in den Core umgezogen war. Weitere alte Test-/Integrations-
annahmen wurden später während der Reparatur des darauf aufbauenden PR #52 sichtbar.

55 allgemeine Reparaturdateien wurden aus dessen vollständig grünem Head
`a52ee72320f6249f4cf3ff3c47bc024f7b8045d3` übernommen. Für jede Datei wurde vorher
geprüft, dass ihr Ausgangsinhalt zwischen #51 und dem ursprünglichen Archiv-Commit
identisch war. Die übertragenen Bytes entsprechen exakt dem geprüften Quellcommit.
Archiv-Importer, Archiv-Ansichten/-APIs, Archiv-Tests und deren Anleitung sind nicht
enthalten. UI, Core-Inspect/Read, INSTALL und CLI-Testinventar bleiben gegenüber #51
unverändert. Der echte Kontrollbestand und fremde Dateien werden nicht bearbeitet.

## Umsetzung

- Veraltete Runtime-Kopierreferenz entfernt; aktuelle Core-Projektion bleibt Owner.
- Unveränderte Gate-Policy als reine gemeinsame Policy komponiert. Die produktive
  Komposition behält den validierten Receipt-Leser; der Claude-Begleiter ist passiv.
- Lokalisierte Revisionsausgabe samt exaktem Bestätigungsselektor wiederhergestellt;
  gebundenes Vorschlags-Restaging bei bestätigtem Source-Revision-Journal ermöglicht.
- Neue Sprachkonfigurationen tragen die aktuelle Layout-Kennung. Alte Layouts bleiben
  abgewiesen und werden nicht automatisch umgeschrieben.
- Aktuelle typed-Command-, Pfad-, Katalog-, Quellen- und Fixture-Erwartungen hergestellt.
  Geschützte historische Benchmark-/Native-Originaldateien bleiben unverändert.
- Vollständiger Zehn-Zyklen-Test mit Prozesskonkurrenz läuft exklusiv pro Plattform;
  synthetische Erneuerung benutzt öffentliche Core-Kommandos des gebauten Kandidaten.
  Keine Verringerung der Testfälle oder Zeitgrenzenerhöhung.

## Eigenständige lokale Nachweise

Frischer Git-Worktree auf dem Branch von #51, Abhängigkeiten aus unveränderten Lockfiles:

- `npm run build:prepare`: UI-/Decision-Build, Runtime-/Host-Generierung, npm-Assembly,
  elf Profilhistorien, transaktionaler Release-Bump, 49 Versionsoberflächen sowie
  Public-/Portable-Profile bestanden. Dies ist keine Installation oder Veröffentlichung.
- Build-Verträge und alle 113 deterministischen Skill-Evaluationen bestanden.
- Alle 14 Planner-Tests, Community-Health mit 29 Negativverträgen und
  Konfigurationsdefaults bestanden.
- Quell-/generierte Claude-Begleiterparität, 39 Request-Activation-Fälle,
  tatsächliche STDIO-MCP-Continuation und 22 deterministische Ergonomie-Tests bestanden.
- Die eigene Source-Bindung war zunächst erwartungsgemäß `source_snapshot_changed`.
  Mit dem regulären Fixture-Recorder neu aufgezeichnet: 56/56; anschließender Check
  bestanden. Fingerprint `37ebf5ae1c42a305476c29356f5d3cd305f7d108f4c4c9101e2c61b8c254e149`.
  Nur abgeleitete Fakten, Snapshot, Bericht und eine neue unveränderliche Beobachtung
  wurden ergänzt. Drei vorhandene native/öffentliche Originalquellen sind bytegleich.

Die vorhandene kanonische Planung ergibt 168 Matrixjobs plus Planungsjob. Der neue
Remote-Lauf muss dem folgenden tatsächlichen Commit-SHA zugeordnet und vollständig
geprüft werden. #52s grüner Lauf #672 ersetzt diesen Nachweis nicht.

Kein lokaler Volltest/Nightly, keine neue native Codex-/Claude-/weitere Host-Qualifikation
und keine menschliche QA/UAT werden behauptet. Frühere installierte Beobachtungen auf
aab3424b bleiben ausschließlich an diesen früheren Kandidaten gebunden. Keine erneute
Installation, keine Migration des Originalbestands, kein Merge und kein Release.

## Herkunft und Entscheidung

Kanonisch sind die übertragenen Core-/CLI-Module, Claude-Host-Templates sowie bestehenden
Build-, Test- und Eval-Owner. Generierte Payloads und Kompatibilitätsausgaben stammen
von den vorhandenen Ownern. Codex unterstützte Analyse, Übertragung, Tests und technische
Selbstprüfung wesentlich. Der Maintainer autorisierte die direkte Reparatur; unabhängige
menschliche Codeprüfung oder neue Abnahme sind nicht dokumentiert.

Es gelten CONTRIBUTING.md und GOVERNANCE.md. Kein CLA oder DCO erforderlich; ein PR
begründet keine Merge-, Release- oder Roadmap-Zusage. Die proportionale Arbeitsgrenze
öffnet den abgeschlossenen früheren Run nicht erneut und erbt keine Gate-Freigaben.
