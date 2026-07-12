# Fehlerbehebung

Wenn der Agent anhält, bedeutet das nicht automatisch, dass etwas schiefgelaufen ist.

Meist fehlt nur eine Voraussetzung oder eine Entscheidung.

Der Agent sollte dir immer sagen,

* warum er angehalten hat,
* was noch fehlt,
* und wie du weitermachen kannst.

## „Approval: … fehlt“

Fehlt eine Freigabe, prüfe zuerst, ob das zugehörige Artefakt vollständig ist und deiner Entscheidung entspricht.

Gib die Freigabe anschließend genau so ein:

```text
Approval: TP
```

`TP` steht für **Task und Testplan**.

Eine Antwort wie

```text
OK
Weiter
Leg los
```

ist eine normale Arbeitsanweisung, ersetzt aber keine Gate Freigabe.

Die Reihenfolge der Gates findest du unter [02 Gates](../02-gates.md).

## Mehrere aktive Runs

Gibt es mehrere aktive Runs, weiß der Agent nicht automatisch, welchen du meinst.

Nenne deshalb das gewünschte Vorhaben oder bitte den Agenten, alle aktiven Runs aufzulisten.

Wenn du mit der Kommandozeile arbeitest, kannst du einen Run auch direkt auswählen, zum Beispiel mit `--run` oder `AGDF_RUN_ID`.

## Drift oder Mixed Authority

In älteren Projekten kann zusätzlich noch eine Datei `AGDF_RUN.md` vorhanden sein.

Nach einer Migration ist jedoch die neue Run Datei maßgeblich.

Meldet AGDF **Drift** oder **Mixed Authority**, stimmen beide Dateien nicht mehr überein.

Lass die Projektion neu erzeugen oder entferne die alte Datei, sobald sie nicht mehr benötigt wird.

Die technischen Details findest du im [Control Scaffold](../../plugin/control/README.md).

## Der Agent meldet „blockiert“

Eine Blockierung bedeutet nicht, dass die Arbeit gescheitert ist.

Meist fehlt nur

* eine Entscheidung,
* ein Nachweis,
* eine Freigabe,
* oder ein Verweis auf ein Artefakt.

Korrigiere genau diesen Punkt.

Der Agent bleibt im aktuellen Arbeitsstand und setzt die Arbeit erst fort, wenn die Voraussetzung erfüllt ist.

Zurück zum [Handbuch Index](README.md).


Zurück zum [Handbuch-Index](README.md).
