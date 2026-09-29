# PRD: Adaptive Codex-CLI-Aktivierungsmatrix

Status: draft
Gate: PRD
Gate approval: open
Based on: `UR.md`, `BROWNFIELD_REVIEW.md`
Date: 2026-09-29
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Der vorhandene Maintenance-Probe prüft die zehn bestehenden Aktivierungsfälle zunächst je einmal in einem frischen Codex-CLI-Prozess mit eigenem Wegwerf-Repository. Ein Fall erhält genau zwei zusätzliche, voneinander frische Läufe, wenn sein Erstlauf die bestehende Erwartung nicht erfüllt, nicht vollständig beendet wird oder der Aufruf ihn vorab ausdrücklich als Grenzfall auswählt. Die Entscheidung wird pro Fall im Ergebnis sichtbar. Der unveränderte Aktivierungsbefund wird nicht mit Zielbindungs- oder Suchaufwand verwechselt.

Der A4-Erklärungsfall erhält im Prompt eine konkret benannte Quelle aus der isolierten AGDF-Plugin-Kopie. So bleibt er einer der zehn Aktivierungsfälle, während seine Datei-/Shell-Suche als eigener Aufwand im Ergebnis erscheint. Der Nutzer des Probes sieht pro Sitzung die verfügbaren Token-Kategorien, Laufzeit und Suchaufrufe sowie explizite Unbekannt-Werte, falls Codex sie nicht liefert.

## 2. UX Intent And Success

- ui_ux_impact: `low`
- ux_intent_definition: direkt definierte, begrenzte Semantik der CLI-Zusammenfassung; laut Brownfield Review keine zusätzliche UX-Intent-Definition erforderlich.
- primary_user_intent: die Aktivierungsgrenze live prüfen und nur auffällige oder vorab ausgewählte Fälle zusätzlich beproben.
- success_signal: Ein unauffälliger Standardlauf endet mit zehn frischen Sitzungen; bei einer Abweichung oder benanntem Grenzfall gibt es für genau diesen Fall drei Sitzungen und einen sichtbaren Auslöser.
- primary_decision_or_action: Testbetreiber kann vor dem Start Grenzfall-IDs angeben und nach dem Lauf pro Fall Auslöser, Befund und Verbrauch prüfen.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Standardmatrix | Zehn Erstläufe; zusätzliche Läufe nur bei automatisch erkanntem Auslöser | Fall-Ergebnis, Laufzahl, Auslöser, Messwerte | Strukturierte Codex-Ereignisse, `git status` und bestehende `grade`-Erwartung | `summary.txt` und `observation.json` des Harness |
| Vorab markierte Grenzfälle | Ausgewählte gültige Fall-IDs erhalten nach dem Erstlauf genau zwei weitere Sitzungen | ausgewählte IDs, Laufzahl, Auslöser `preselected_boundary` | explizite CLI-Eingabe vor dem Start | dieselben Ergebnisdateien |
| Unvollständige Telemetrie | Aktivierungsbewertung bleibt gültig, fehlende Messwerte sind unbekannt | `unknown`/`null` und bekannte Werte getrennt | verfügbare strukturierte JSONL-Ereignisse | `observation.json` und Zusammenfassung |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Start über den bestehenden `npm run native:codex-activation-matrix`; das bisherige `--runs <n>` bleibt als ausdrücklich angeforderter fester Wiederholungsmodus erhalten. Ohne `--runs` gilt die adaptive Erstprüfung.
- blockers_and_visible_next_actions: Ungültige Grenzfall-ID, fehlendes AGDF-Profil oder fehlende Authentifizierung stoppen vor dem ersten Codex-Lauf mit konkreter Fehlermeldung. Eine unvollständige Sitzung löst die beiden Wiederholungen aus und bleibt als Fehler sichtbar.
- recovery_paths: Fehlgeschlagene Einzel-Sitzungen bleiben in den Rohprotokollen und können durch einen neuen vollständigen Matrixlauf erneut geprüft werden. Es gibt keine stillschweigende Nachwertung als Erfolg.
- relevant_state_transitions: Jeder Fall startet bei `pending`, erhält `first_completed`, danach bei unauffälligem Befund `done` oder bei Auslöser `repeat_pending`; nach zwei weiteren frischen Sitzungen `done`. Laufabbruch bleibt als beobachtete Abweichung im Ergebnis. Die Matrix schreibt nur lokale Evidenzdateien und ändert kein AGDF-Gate.

## 5. Acceptance Criteria

- criterion_id: AC-001
  - observable_success: Im Standardmodus werden alle zehn vorhandenen Fälle je einmal in einem neuen Codex-CLI-Prozess und eigenen Wegwerf-Repository ausgeführt. Bei zehn vollständig beendeten und erwartungsgemäß bewerteten Erstläufen umfasst das Ergebnis genau zehn Sitzungen.
- criterion_id: AC-002
  - observable_success: Ein Erstlauf mit `ok: false`, unvollständiger Sitzung, Timeout oder Spawn-Fehler führt für diesen Fall zu genau zwei weiteren frischen Sitzungen. Die drei Einzelbefunde bleiben sichtbar; ein späterer Erfolg überschreibt die ursprüngliche Abweichung nicht.
- criterion_id: AC-003
  - observable_success: Vor Beginn benannte gültige Grenzfall-IDs führen unabhängig vom Erstbefund zu genau zwei weiteren frischen Sitzungen für diese IDs. Ungültige IDs werden vor dem Start abgewiesen. Der Ergebnisdatensatz enthält pro Fall `preselected_boundary`, `first_run_deviation` oder beide Auslöser und die tatsächliche Laufzahl.
- criterion_id: AC-004
  - observable_success: Die bestehende Aktivierungsbewertung bleibt maßgeblich. Ein `target_unresolved` nach erwartungsgemäßem Dispatcher-Aufruf ist keine automatische Abweichung, solange der konkrete Fall keine eindeutige Zielbindung verlangt. Zielbindung und Aktivierung werden getrennt ausgewiesen.
- criterion_id: AC-005
  - observable_success: A4 benennt eine konkrete AGDF-Quelle aus der isolierten Plugin-Kopie im Testprompt. Ergebnisdateien weisen A4 und dessen Suchaufwand getrennt aus; die historische 30/30-Evidenz wird nicht umgeschrieben.
- criterion_id: AC-006
  - observable_success: Jede Sitzung enthält gecachte Input-Tokens, nicht gecachte Input-Tokens, gesamte Input-Tokens, Output-Tokens, Laufzeit und nachvollziehbare Datei-/Shell-Suchzählungen, soweit die strukturierten Codex-Ereignisse sie liefern. Fehlende Cache- oder Suchtelemetrie wird als unbekannt gespeichert und nicht als Null oder Kostenwert ausgegeben.
- criterion_id: AC-007
  - observable_success: Zusammenfassung und README erklären den adaptiven Standard, die Auslöser, die A4-Quellbindung und die begrenzte Aussagekraft der Stichprobe. Sie unterscheiden die mögliche Reduktion von 30 auf zehn Sitzungen von tatsächlichen Token- und Abrechnungskosten.

## 6. Non-Goals

- Keine Änderung an AGDF-Dispatcher, Request-Activation-Vertrag, Gate-Zuständen oder fachlicher Erwartung der zehn Fälle.
- Keine automatische Schätzung von Geldkosten aus Brutto-Tokens oder Cache-Anteil.
- Keine Gleichsetzung einer künftigen adaptiven Matrix mit der historischen vollständigen 30/30-Matrix.
- Kein zweiter Runner und keine Änderung an Claude-Probe oder Desktop-App.

## 7. Users And Roles

- Testbetreiber: startet die Matrix, markiert optional Grenzfälle und prüft die Ergebnisdateien.
- AGDF-Run-Owner: entscheidet über die fachliche Freigabe dieser PRD.
- Codex-CLI und installierte Plugin-Kopie: liefern Live-Ereignisse; sie erteilen keine AGDF-Gate-Freigabe.

## 8. Constraints

- Jede tatsächliche Wiederholung ist ein frischer CLI-Prozess mit eigenem Fixture und isoliertem AGDF-Datenpfad.
- Strukturierte Ereignisse und `git status` bleiben Bewertungsgrundlage; Modelltext wird nicht als Aktivierungsbeweis verwendet.
- Ältere Ergebnisdateien bleiben lesbar und unverändert; neue Felder sind additiv.
- Keine Aussage über Cache oder Suchaktivität, wenn die verwendete CLI-Version dafür keine auswertbaren Ereignisse liefert.

## 9. Evidence Requirements

- Deterministische Prüfung der Auslöser: zehn unauffällige Erstläufe, ein abweichender Erstlauf und ein vorab markierter Grenzfall.
- Parserprüfung mit repräsentativen Codex-JSONL-Ereignissen für Cache-Felder, fehlende Felder und Suchereignisse.
- Mindestens ein frischer Codex-CLI-Lauf mit isoliertem installierten Plugin für die tatsächliche Ereignisstruktur; weitergehende Aktivierungsquote nur aus wirklich ausgeführten Sitzungen behaupten.
- Prüfung der Ergebnisdateien auf pro Fall/Lauf korrekte Laufzahl, Auslöser und unbekannte Werte.

## 10. Risks And Open Questions

- Cache- und Suchfelder können je Codex-CLI-Version abweichen. Das technische Parsing und die Zählregeln gehören in SD; nicht vorhandene Felder bleiben unbekannt.
- Adaptive Wiederholung reduziert die Streuungsevidenz bei unauffälligen Fällen. Der Bericht nennt die tatsächliche Stichprobe.
- Ein expliziter fester Wiederholungsmodus für Vergleichsläufe soll ohne stillen Bedeutungswechsel erhalten bleiben.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Wiederholungsauslöser | before_prd | resolved | `ok: false` oder unvollständiger Erstlauf löst zwei weitere frische Sitzungen aus; vorab ausgewählte Fall-IDs ebenso. Erwartetes `target_unresolved` allein ist kein Auslöser. | Arndt Gold (PRD Owner) |
| Behandlung von A4 | before_prd | resolved | A4 bleibt einer der zehn Fälle und erhält eine explizite Quelle aus der isolierten Plugin-Kopie; Suchaufwand wird getrennt ausgewiesen. | Arndt Gold (PRD Owner) |
| Bedeutung fehlender Telemetrie | before_prd | resolved | Fehlende Cache- oder Suchwerte erscheinen als unbekannt; keine Kostenableitung. | Arndt Gold (PRD Owner) |
| Bestehender `--runs`-Aufruf | before_prd | resolved | Explizites `--runs <n>` behält die feste Anzahl pro Fall; ohne Flag gilt der adaptive Modus. | Arndt Gold (PRD Owner) |
| Konkrete JSONL-Feld- und Sucherkennung | later_sd | open | An den tatsächlichen strukturierten Ereignissen der Codex-CLI-Version festlegen. | SD Owner |

## 11. Next Step

Diese PRD für den abgegrenzten Slice prüfen und ausschließlich mit folgender Antwort freigeben:

`Approval: PRD`
