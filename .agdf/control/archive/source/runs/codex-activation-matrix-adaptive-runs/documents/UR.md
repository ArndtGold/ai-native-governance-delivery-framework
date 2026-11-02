# UR: Gezielte Wiederholungen der Codex-Aktivierungsmatrix

Status: draft
Gate: UR
Gate approval: open
Date: 2026-09-29
Owner: Arndt Gold

## 1. Problem

Die Codex-CLI-Aktivierungsmatrix führt zehn Fälle pauschal je dreimal in frischen Sitzungen aus. Die 30 Sitzungen kosten Zeit und Tokens, auch wenn der erste Lauf eines Falls unauffällig ist. Der AGDF-Erklärungsfall A4 enthält zusätzlich eine ungebundene Dokumentensuche, deren Aufwand die Messung der Aktivierungsgrenze überlagert. Die bisherige Auswertung enthält keine vollständige Aufschlüsselung von Cache-Anteil, Laufzeit und Suchaktivität pro Sitzung.

## 2. Goal

Die Matrix prüft jeden der zehn Fälle zunächst einmal live in einer frischen Codex-CLI-Sitzung. Nur vorher definierte Grenzfälle oder Abweichungen erhalten zwei weitere, jeweils frische Sitzungen. Ergebnis und Verbrauch lassen sich pro Sitzung nachvollziehen, ohne Suchaufwand mit Aktivierungsverhalten oder Brutto-Tokens mit Abrechnungskosten gleichzusetzen.

## 3. Scope

- Zehn Erstläufe als Standard; für vorab definierte Grenzfälle oder beobachtete Abweichungen genau zwei zusätzliche frische Sitzungen pro betroffenem Fall.
- Wiederholungsauslöser und Bewertung vor der Ausführung explizit und reproduzierbar festlegen. Erwartetes `target_unresolved` bei mehrdeutigem Ziel nicht als Aktivierungsfehler zählen.
- A4 als getrennt ausgewiesenen Dokumentensuche-Fall führen oder mit einer konkreten zu erklärenden Quelle begrenzen; der Aktivierungsbefund bleibt separat sichtbar.
- Pro Sitzung gecachte und nicht gecachte Input-Tokens, Output-Tokens, Laufzeit und Datei-/Shell-Suchen erfassen, soweit die Codex-JSONL-Ereignisse diese Werte verlässlich liefern. Fehlende Werte als unbekannt ausweisen.
- Zusammenfassung und Dokumentation an den neuen Standard anpassen und weiterhin Rohprotokolle sowie frische Sitzungen je Lauf erhalten.

## 4. Non-Goals

- Die AGDF-Request-Activation-Regeln oder die zehn fachlichen Erwartungen ändern.
- Aus Sitzungszahl oder Brutto-Tokens eine exakte Kostenersparnis behaupten.
- Bestehende 30/30-Evidenz als gleichwertig mit künftiger 10/10-Evidenz darstellen.
- AGDF-Gates, Freigaben oder Run-Zustände durch den Test-Harness verändern.

## 5. Acceptance Signals

- Bei zehn unauffälligen Fällen beendet die Matrix zehn frische Sitzungen; ein begründeter Wiederholungsauslöser führt nur für den jeweiligen Fall zu insgesamt drei frischen Sitzungen.
- Die Ergebnisdatei dokumentiert pro Fall den Auslöser und die tatsächlich ausgeführten Läufe; die Auswertung trennt Aktivierung, Zielbindung und Dokumentensuche.
- Jede Sitzung enthält die verfügbaren Token-Kategorien, Laufzeit und nachvollziehbare Suchzählung; nicht verfügbare Angaben erscheinen als unbekannt statt als Null.
- Der A4-Suchaufwand ist getrennt auswertbar oder durch eine vorgegebene Quelle begrenzt.
- Bestehende Nachweise bleiben historisch unverändert; künftige Ergebnisberichte benennen die adaptive Stichprobe und ihre Grenzen.

## 6. Existing Source Of Truth

- `scripts/native-probes/codex-activation-matrix.mjs`
- `scripts/native-probes/README.md`
- `scripts/native-probes/evidence/codex-activation-matrix-20260928.md` und `.json`
- `plugin/meta/contracts/request-activation.md`

## 7. Risks And Unknowns

- Die Codex-JSONL-Struktur und die Verfügbarkeit von Cache- und Suchereignissen können je CLI-Version variieren; die Messdefinition muss an tatsächlichen Rohereignissen überprüft werden.
- Adaptive Wiederholungen liefern weniger Evidenz über die Streuung unauffälliger Fälle als eine vollständige Dreifachmatrix. Die Auswertung muss diese Grenze offenlegen.
- Die Kriterien für Grenzfälle müssen vor dem Lauf feststehen, damit ein günstiges Erstergebnis keine nachträgliche Auswahl steuert.

## 8. Next Step

Diese UR prüfen und ausschließlich mit folgender Antwort freigeben:

`Approval: UR`
