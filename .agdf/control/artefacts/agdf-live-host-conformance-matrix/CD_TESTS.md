# CD+Tests: AGDF Live Host Conformance Matrix

Status: done
Date: 2026-07-28
Scope: run-eigene Evidenzstruktur und begrenzte Live-Host-Beobachtung

## Task Status

| task_id | status | evidence |
|---|---|---|
| LHT-01 | done | `BROWNFIELD_ANALYSIS.md`: `pass`; vorhandene sichere Headless-Pfade, aktuelle Versionen und Host-Grenzen inventarisiert |
| LHT-02 | done | `OBSERVATION_SCHEMA.json`; run-spezifische Pflichtfelder und Enums |
| LHT-03 | done | `HOST_CONFORMANCE_MATRIX.json` mit 36 eindeutigen Host-/Fall-Slots |
| LHT-04 | done | synthetische Wegwerf-Git-Workspaces; jeweils nach Probe entfernt; Vorher-/Nachher-Status erfasst |
| LHT-05 | done | Codex authentifiziert; Claude unauthentifiziert; OpenCode Agent/Provider ausführbar; nur redigierte Felder persistiert |
| LHT-06 | done | Codex: 8 `pass`, 4 `limitation`, Workspace unverändert |
| LHT-07 | done | Claude Code: 12 `host_unavailable`; kein Loginversuch |
| LHT-08 | done | OpenCode: 12 gültige serielle Einzelbeobachtungen, 8 `pass`, 4 `limitation`; explizites Modell, terminale Deny-Permissions und unveränderte Wegwerf-Workspaces |
| LHT-09 | done | 36/36 klassifiziert; Redaction-Scan grün; keine Pass-Hochstufung und kein erfundener `product_gap` |
| LHT-10 | done | `HOST_CONFORMANCE_REPORT.md`; Ergebniszählung und 12×3-Fallmatrix sind JSON-paritätisch |
| LHT-11 | done | erneuerter TP Review 11/12 fully done plus erwartetes QA-Teilziel; TPR-LHC-001 nach direkter OpenCode-Evidenz `resolved`; Clean Review pass; Code Review not applicable |
| LHT-12 | done | erneuertes QA-Gate `pass`; separate exakte QA-Freigabe und UAT bleiben ausstehend |

## Test Status

| test_id | status | evidence |
|---|---|---|
| LHT-T01 | pass | Schema-/Pflichtfeldprüfung ohne Fehler |
| LHT-T02 | pass | 36 Zeilen, 36 eindeutige Host-/Fall-Schlüssel |
| LHT-T03 | pass | 16/16 Passes mit `authenticated_host_observed` und Evidenzreferenz |
| LHT-T04 | pass | 36/36 mit Host-, AGDF-Version und Beobachtungszeitpunkt |
| LHT-T05 | pass | alle Codex-/OpenCode-Beobachtungen bleiben ehrlich `instruction_only`; keine Universalgarantie |
| LHT-T06 | pass | acht Ausführungs-/Methodenartefakte ohne Secret-/Token-/Cookie-/privaten Absolutpfad-Treffer |
| LHT-T07 | pass | Codex- und OpenCode-Wegwerf-Workspaces unverändert; Claude nicht ausgeführt |
| LHT-T08 | pass | HC-05 bis HC-08 nicht durch Headless-Pass hochgestuft |
| LHT-T09 | pass | kein `product_gap`; keine stille Reparatur |
| LHT-T10 | pass | Berichtszählung und Fallmatrix stimmen mit JSON überein |
| LHT-T11 | pass | Worktree enthält nur `.agdf/control/` im neuen Scope |
| LHT-T12 | pass | Child-/Parent-Doctor, Child-Gate-Check und `git diff --check` nach QA-Artefakt |

## Aktuelle Evidenzgrenze

- Codex besitzt acht direkte Headless-Passes; vier UI-/Mehrturn-/Restart-Fälle bleiben
  ehrliche `limitation`.
- Claude Code ist in dieser Umgebung für alle zwölf Fälle `host_unavailable`.
- OpenCode besitzt acht direkte serielle Headless-Passes; vier native-UI-, echte-Mehrturn- oder
  Restart-Fälle bleiben ehrliche `limitation`.
- Die Herstellerdokumentation begründet nur die Ausführungsmethode; zwölf direkte,
  authentifizierte OpenCode-Beobachtungen tragen die Klassifikation.
- Produkt-, Runtime-, Plugin-, Host- und Konfigurationsänderungen wurden nicht durchgeführt.
