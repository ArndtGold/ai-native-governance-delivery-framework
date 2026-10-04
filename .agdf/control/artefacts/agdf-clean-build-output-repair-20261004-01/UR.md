# UR: Reproduzierbare Builds und gültige Kompatibilitätsnachweise

Status: draft
Gate: UR
Gate approval: pending
Date: 2026-10-04
Owner: Arndt Gold
Run: agdf-clean-build-output-repair-20261004-01
Language: de

## 1. Problem

GitHub Actions Run 37139130437 für Commit a83d0f3 scheitert im Ubuntu-Job
111249728766 bei `check:community-health` mit
`HOST_COMPATIBILITY_INVALID: source_snapshot_changed`. Windows und Ubuntu mit
Node 24 bestehen, führen diesen Repository-Check jedoch nicht aus.

Die Diagnose am isolierten Commit zeigt: Alle erfassten Quelldateien stimmen
mit dem gespeicherten Nachweis überein, die neu erzeugten Runtime-Prüfsummen
jedoch nicht. Ein zusätzlicher Ordner `runtime/core/lib 2` im erzeugten
Runtime-Baum reproduziert exakt die gespeicherten Paketprüfsummen. Ein sauberer
Build desselben Commit erzeugt andere Prüfsummen. Lokale Build-Reste dürfen
den ausgelieferten Inhalt und seine Nachweise nicht beeinflussen.

## 2. Goal

Aus derselben kanonischen Quelle sollen saubere und wiederholte Builds dieselben
benötigten Paketdateien und Prüfsummen erzeugen. Kompatibilitätsnachweise sollen
den reproduzierbaren Build beschreiben und im vorgesehenen CI-Check bestehen.

## 3. Scope

- Die bestehende Core-Projektion und Runtime-Generierung so korrigieren, dass
  fremde oder zurückgebliebene Dateien innerhalb ihrer eigenen erzeugten
  Ausgabeverzeichnisse nicht in den Paketinhalt gelangen.
- Den reproduzierten Fehler mit einem passenden Regressionstest absichern:
  zusätzliche Dateien und Verzeichnisse in erzeugten Ausgaben, erneuter Build,
  Vergleich mit dem sauberen Build und Erhalt erforderlicher Runtime-Dateien.
- Kompatibilitätsnachweise durch den bestehenden Recorder aus einem sauberen
  Build erneuern; historische Aufzeichnungen beibehalten.
- Betroffene Build-, Paket-, Kompatibilitäts- und Community-Health-Prüfungen
  ausführen und ihre tatsächliche Aussage dokumentieren.

## 4. Non-Goals

- Keine Abschwächung der Prüfsummen-, Integritäts- oder CI-Prüfungen.
- Keine pauschale Bereinigung fremder Workspace-Dateien.
- Keine Änderung der Governance-Regeln oder Freigabeautorität.
- Kein Umbau der Core-/CLI-/MCP-Paketarchitektur und keine React-Oberfläche.
- Keine aktive Plugininstallation, Veröffentlichung, Release-, Commit-, Push-
  oder Merge-Aktion ohne gesonderten Auftrag.
- Lokale Prüfungen ersetzen keinen neuen GitHub-CI-Lauf oder native Host-UAT.

## 5. Acceptance Signals

1. Ein sauberer und ein zuvor mit zusätzlichen Ausgabedateien verunreinigter
   Build erzeugen denselben erforderlichen Paketinhalt und dieselben Prüfsummen.
2. Die Bereinigung bleibt auf vollständig build-eigene Ausgaben begrenzt;
   kanonische Quellen und unabhängige Änderungen bleiben erhalten.
3. Bestehende benötigte Core-Dateien, Bindungen und Hostprofile bleiben vollständig.
4. Die erneuerten Nachweise bestehen `compatibility:check` und
   `check:community-health`; Testbefunde werden nicht unterdrückt.
5. Der Regressionstest scheitert am bisherigen Verhalten und besteht nach
   der Korrektur. GitHub-CI-Status wird nur aus einem tatsächlich ausgeführten
   Lauf berichtet.

## 6. Existing Source Of Truth

- Nutzerhinweise auf GitHub Actions Run 37139130437 und die Diagnose in diesem Chat.
- https://github.com/ArndtGold/ai-native-governance-delivery-framework/actions/runs/37139130437
- `scripts/core-projection.mjs`, `scripts/sync-plugin-runtime.js` und
  `scripts/sync-package-assets.js`: bestehende Build- und Projektionsowner.
- `scripts/host-compatibility/run.mjs`, `docs/compatibility/evidence/snapshot.json`
  und `scripts/check-community-health.mjs`: Nachweiserfassung und Validierung.
- `.github/workflows/agdf-guardrails.yml`: tatsächlich ausgeführte CI-Prüfungen.

## 7. Risks And Unknowns

- Brownfield Review muss bestätigen, welche Ausgabeverzeichnisse vollständig
  build-eigen sind und welche Dateien zur unterstützten Runtime gehören.
- Der Workspace enthält unabhängige Änderungen und Dateiduplikate. Ein
  Nachweis darf nicht versehentlich den Umfang anderer Arbeit übernehmen.
- Nach der Korrektur können bislang übersprungene CI-Stufen weitere Befunde
  zeigen; ein grüner Gesamtbuild ist vor deren Ausführung nicht belegt.

## 8. Next Step

Diese UR mit `Approval: UR` freigeben. Danach Brownfield Review und Mode/Slice
Decision für die begrenzte Build-Reparatur durchführen.
