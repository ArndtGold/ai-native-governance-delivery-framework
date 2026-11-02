# UR: Klare nächste Schritte in AGDF-Karten

Status: draft
Gate: UR
Gate approval: open
Date: 2026-09-28
Owner: Arndt Gold

## 1. Problem

AGDF-Zielklärungs-, Kontrollsetup- und Statuskarten zeigen Zustände und technische Felder, lassen aber offen, wer jetzt handeln muss, was genau erwartet wird und welche Antwort den Ablauf fortsetzt. Bei nicht katalogisierten Run-Aktionen kann die Statuskarte außerdem eine konkrete Anweisung durch einen generischen QA-Schritt ersetzen. Dadurch kann der Nutzer weder sicher antworten noch erkennen, ob Codex ohne weitere Eingabe fortfahren soll.

## 2. Goal

Jede handlungsrelevante Karte macht auf einen Blick deutlich, wer als Nächstes handelt, welche konkrete Aktion erwartet wird, welche exakte Antwort oder Information der Nutzer gegebenenfalls liefern soll und was danach geschieht. Unklare Aktionen werden offengelegt statt durch eine unzutreffende Standardformulierung ersetzt.

## 3. Scope

- Zielklärungs-Karten nennen die benötigten Zielangaben: Repository-Pfad oder URL sowie bei Fortsetzung einer bestehenden Lieferung die exakte Run-ID; für neue Vorhaben wird eine eindeutige Antwortoption genannt. Sie enthalten ein kopierbares Antwortbeispiel.
- Kontrollsetup-Karten trennen klar zwischen „Einrichtung autorisieren“ und „Abbrechen“, erklären knapp die jeweilige Wirkung und sagen ausdrücklich, dass Setup keine Gate-Freigabe oder Implementierungsberechtigung erteilt.
- Statuskarten unterscheiden „Du bist dran“, „Codex ist dran“ und „Keine Antwort nötig“. Sie zeigen die konkrete, für den ausgewählten Run geltende Aktion und die nächste erwartete Nutzerantwort, falls erforderlich.
- Die Karten bleiben lokalisiert für alle registrierten Sprachen und erhalten die bestehende nicht-autorisierende Autoritätsgrenze.

## 4. Non-Goals

- Request-Activation-Regeln, Zielauswahl, Gate-Übergänge, Approval-Semantik oder Run-Auswahl ändern.
- Fehlende Host-, Modellprofil- oder QA-Evidenz des bestehenden Runs ersetzen oder als erledigt markieren.
- Eine Freigabe aus natürlichsprachlichem Karteninhalt, einer Beispielantwort oder einer Host-Berechtigung ableiten.
- Host-Plugins installieren, aktualisieren oder neu starten.

## 5. Acceptance Signals

- Eine ungelöste Zielkarte nennt die konkret benötigten Angaben und enthält mindestens ein Antwortbeispiel für ein bestehendes Ziel und eine neue Lieferung.
- Eine Setup-Karte nennt die exakten erlaubten Nutzerantworten, deren konkrete Wirkung und die danach folgende Aktion; sie sagt, welche Freigabe weiterhin offen bleibt.
- Eine Statuskarte nennt explizit den nächsten Akteur. Bei erforderlicher Nutzereingabe enthält sie die konkrete Eingabe oder Entscheidung. Ohne erforderliche Nutzereingabe sagt sie ausdrücklich, dass keine Antwort nötig ist und was Codex als Nächstes tut.
- Die Run-spezifische nächste Aktion wird nicht stillschweigend durch eine generische QA- oder Gate-Formulierung ersetzt. Wenn Akteur oder Aktion aus dem kanonischen Zustand nicht sicher bestimmbar sind, fordert die Karte eine gezielte Klärung statt zu raten.
- Die kanonische gerenderte Ausgabe erfüllt diese Signale in allen registrierten Sprachen.
- Alle Karten bleiben `authorizes: false`; Gate-Freigabe bleibt ausschließlich an die bestehende exakte Freigabeverarbeitung gebunden.

## 6. Existing Source Of Truth

- `plugin/meta/contracts/interaction.md` und `plugin/meta/contracts/task-target-resolution.md`
- `plugin/meta/agdf-interaction-locales.json`
- `create-agdf/lib/interaction-presentation.js` und `create-agdf/lib/control-evaluation/gate-check.js`
- Aktuelle Beobachtungen in `.agdf/control/artefacts/agdf-request-activation-boundary/QA_REPORT.md` und dessen `RUN_STATE.md`

## 7. Risks And Unknowns

- Run-spezifische Freitextaktionen können sprachlich variieren; ihre Bedeutung und ihr Akteur dürfen nicht aus unsicherer Wortsuche geraten werden.
- Zielklärungs- und Setup-Karten haben unterschiedliche Antwortverträge. Ein gemeinsamer, zu allgemeiner Text könnte erneut unklar werden.
- Beispiele und Antwortoptionen dürfen niemals als Gate-Freigabe missverstanden oder automatisch verbucht werden.
- Brownfield Review muss klären, welche vorhandenen Renderer, Locale-Validierungen und Host-Projektionen denselben Kartenvertrag verwenden.

## 8. Next Step

Diese UR prüfen und ausschließlich mit folgender Antwort freigeben:

`Approval: UR`
