# Abschluss und Auslieferung

Ein erfolgreicher Testlauf bedeutet noch nicht, dass die Arbeit abgeschlossen ist.

AGDF trennt bewusst

* die Umsetzung,
* die Qualitätsprüfung,
* die fachliche Abnahme,
* und die eigentliche Auslieferung.

So bleibt jede Entscheidung nachvollziehbar.

## Nach der Umsetzung

Nach der Implementierung sammelt der Agent

* Testergebnisse,
* Reviews,
* Nachweise,
* und den Status des Task und Testplans.

Anschließend bewertet das **Quality Assurance Gate (QA)** die Lieferung.

Es gibt drei mögliche Ergebnisse:

| Ergebnis | Bedeutung                                                               |
| -------- | ----------------------------------------------------------------------- |
| `pass`   | Die geplante Änderung wurde ausreichend umgesetzt und nachgewiesen.     |
| `revise` | Es fehlen noch Nachweise oder einzelne Punkte müssen verbessert werden. |
| `block`  | Ein schwerwiegendes Problem verhindert die Freigabe.                    |

Auch bei einem erfolgreichen QA Ergebnis entscheidet nicht der Agent.

Erst mit

```text
Approval: QA
```

gibst du die Arbeit für das **User Acceptance Testing (UAT)** frei.

Die vollständige Beschreibung der Gates findest du unter [02 Gates](../02-gates.md).

## User Acceptance Testing (UAT)

Im UAT prüfst du das Ergebnis aus Sicht des Nutzers.

Dabei geht es nicht darum, ob der Code funktioniert, sondern ob die vereinbarte Anforderung erfüllt wurde.

Zum Beispiel:

```text
Eine zur manuellen Prüfung markierte Echtzeitüberweisung belastet das Tageslimit
noch nicht.

Eine später freigegebene Zahlung wird genau einmal gezählt.

Approval: UAT
```

Wenn das Ergebnis noch nicht passt, beschreibst du den Befund.

Der Agent bleibt im aktuellen Arbeitsstand und überarbeitet die Lösung. Er behauptet niemals selbst, dass eine Änderung abgeschlossen ist.

## Git und Release

Auch nach einem erfolgreichen QA oder UAT führt der Agent keine Git Aktionen selbstständig aus.

Ein

* Commit,
* Push,
* Pull Request
* oder Release

ist immer eine eigene Entscheidung.

Wenn der Agent diese Schritte ausführen soll, musst du sie ausdrücklich beauftragen.

Weiter: [Fehlerbehebung](06-fehlerbehebung.md).
