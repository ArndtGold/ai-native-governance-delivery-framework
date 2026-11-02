# UR: Plugin-Deaktivierung je Oberfläche klar und sicher machen

Status: approved
Gate: UR
Gate approval: approved
Revision: 2
Date: 2026-09-01
Owner: Arndt Gold

## 1. Problem

AGDF dokumentiert Installation und Status für Codex, Claude Code, GitHub Copilot und OpenCode, aber
Deaktivierung und Entfernung sind nicht als vollständige, aktuelle Support-Matrix beschrieben. Bei
GitHub Copilot fehlt der inzwischen verfügbare repository-lokale Plugin-Opt-out. Außerdem ist nicht
sichtbar, dass repository-eigene Instruktionsdateien wie `AGENTS.md` unabhängig vom Plugin geladen
werden können.

## 2. Goal

Nutzende können für jede unterstützte Oberfläche eindeutig erkennen, ob AGDF nur in einem Projekt
deaktiviert oder global entfernt werden kann, welche Dateien oder Host-Einstellungen betroffen sind
und welche Instruktionen danach weiterhin wirksam bleiben. GitHub Copilot erhält zwei sichere,
verifizierbare Projekt-Opt-outs: persönlich-lokal als Standard und repository-weit nur nach einer
expliziten gemeinsamen Auswahl.

## 3. Scope

- Eine kanonische Support-Matrix für Status, repository-lokale Deaktivierung und globale Entfernung
  für Codex, Claude Code, GitHub Copilot und OpenCode.
- Persönlich-lokales Copilot-Deaktivieren als sicherer Standard über
  `.github/copilot/settings.local.json` mit `enabledPlugins["agdf@agdf"] = false`; die Datei bleibt
  ungecommitttet und wird über `.gitignore` geschützt.
- Repository-weites Copilot-Deaktivieren nur über eine explizite gemeinsame Auswahl; dieser Pfad
  schreibt `.github/copilot/settings.json` und macht seine Wirkung für alle Mitarbeitenden sowie den
  Copilot Cloud Agent sichtbar.
- Sicheres Zusammenführen mit vorhandenen, lesbaren und eindeutig besitzbaren Einstellungen sowie
  fail-closed Verhalten bei ungültigen oder mehrdeutigen Pfaden und Inhalten.
- Erhalt aller nicht von AGDF betroffenen Copilot-Einstellungen und aller `.agdf/control`-Daten.
- Klare Trennung zwischen deaktiviertem Plugin und weiterhin unabhängig geladenen Dateien wie
  `AGENTS.md`, `.github/copilot-instructions.md` und pfadspezifischen Instruktionen.
- Dokumentation und Regressionstests für unterstützte und bewusst nicht unterstützte Kombinationen.

## 4. Non-Goals

- Keine erfundene repository-lokale Deaktivierung für Oberflächen ohne verifizierten sicheren
  Host-Mechanismus.
- Kein automatisches Löschen oder Umschreiben vorhandener `AGENTS.md`- oder anderer
  nutzerverwalteter Instruktionsdateien.
- Keine Änderung der AGDF-Gates, Freigabeautorität oder dauerhaften Run-Daten.
- Keine Aussage, dass Repository-, Fixture- oder CLI-Nachweise bereits das Verhalten einer frisch
  gestarteten Host-Sitzung beweisen.
- Keine globale Deinstallation, Plugin-Aktualisierung oder Host-Mutation als Teil dieser UR-Freigabe.

## 5. Acceptance Signals

- Die öffentliche Dokumentation zeigt für alle vier Oberflächen eine widerspruchsfreie Support-Matrix
  mit exakten Befehlen, Wirkungsbereich, erhaltenen Daten und Neustart- beziehungsweise Prüfschritten.
- `disable --surface copilot --scope repository` setzt standardmäßig ausschließlich den AGDF-Eintrag
  in einer vorhandenen oder neuen `.github/copilot/settings.local.json` auf `false`, ohne andere
  Werte zu verlieren, und stellt sicher, dass die lokale Datei nicht eingecheckt wird.
- Eine explizite gemeinsame Auswahl setzt denselben AGDF-Eintrag in
  `.github/copilot/settings.json` und weist vor der Änderung auf die Team- und Cloud-Agent-Wirkung hin.
- Ungültige, symbolische oder mehrdeutige Copilot-Konfiguration wird ohne Änderung abgelehnt.
- Automatisierte Tests belegen Erstellung, Zusammenführung, Idempotenz, Erhalt fremder Einstellungen,
  Fehlerfälle und die unveränderte Codex-Deaktivierung.
- Die Dokumentation erklärt ausdrücklich, dass Plugin-Deaktivierung repository-eigene Instruktionen
  nicht deaktiviert, und nennt `/instructions` sowie `/plugin list` als getrennte Prüfflächen.
- Globales Entfernen ist für jede tatsächlich unterstützte Oberfläche vollständig dokumentiert;
  nicht unterstützte lokale Opt-outs werden klar benannt.

## 6. Existing Source Of Truth

- `create-agdf/lib/lifecycle/operations.js` für Lifecycle-Pläne und Besitzgrenzen.
- `create-agdf/lib/cli/application.js` und `create-agdf/lib/cli/command-registry.js` für den
  öffentlichen CLI-Vertrag.
- `create-agdf/lib/installers/copilot-settings.js` für sicheres Lesen und atomisches Schreiben von
  Copilot-Einstellungen.
- `INSTALL.md`, `README.md` und `create-agdf/README.md` für die öffentliche Nutzungserklärung.
- Offizielle GitHub-Copilot-Konfiguration für repository-lokale `enabledPlugins` und unabhängige
  Custom Instructions.

## 7. Risks And Unknowns

- Brownfield Review muss klären, wie der vorhandene Copilot-Settings-Owner für lokale und gemeinsame
  Repository-Dateien wiederverwendet wird, ohne eine zweite JSON-Mutationslogik zu schaffen.
- Die exakte Schlüsselidentität `agdf@agdf` und ihre Priorität gegenüber Nutzer- oder verwalteten
  Einstellungen müssen gegen den aktuellen Host-Vertrag und deterministische Fixtures geprüft werden.
- Organisation- oder MDM-Richtlinien können repository-lokale Werte überstimmen; dieser Zustand darf
  nicht als erfolgreich deaktiviert ausgegeben werden, wenn er nicht verifiziert ist.
- OpenCode-Aktivierung über `.agdf/control/config.json` ist semantisch nicht dasselbe wie ein
  deaktiviertes globales Plugin und muss entsprechend bezeichnet werden.

## 8. Next Step

Complete Brownfield Review and draft the bounded PRD for the approved two-mode Copilot opt-out and
the cross-surface support matrix.
