# Mehrere Runs

Ein **Run** ist der Arbeitsstand eines Vorhabens.

So können mehrere Aufgaben gleichzeitig im gleichen Repository bearbeitet werden, ohne sich gegenseitig zu beeinflussen.

## Was sich für dich ändert

Normalerweise musst du dich um Runs nicht kümmern.

* Gibt es nur einen aktiven Run, arbeitet der Agent automatisch damit.
* Gibt es mehrere aktive Runs, fragt der Agent nach, welchen Run du meinst.
* Ist deine Angabe nicht eindeutig, stoppt der Agent und bittet um eine Auswahl.

Dadurch arbeitet der Agent immer am richtigen Vorhaben.

## Mehrere Aufgaben gleichzeitig

Angenommen, du arbeitest gleichzeitig an

* einem Fehler,
* einer neuen Funktion,
* und einer Dokumentationsänderung.

Für jedes Vorhaben kann AGDF einen eigenen Run führen.

Jeder Run besitzt seinen eigenen Arbeitsstand, seine eigenen Artefakte und seine eigenen Freigaben. Änderungen eines Runs beeinflussen die anderen nicht.

## Abgeschlossene Runs

Ein abgeschlossener Run bleibt erhalten.

Dadurch kannst du später jederzeit nachvollziehen,

* welche Entscheidung getroffen wurde,
* welche Nachweise vorlagen,
* und wie die Änderung entstanden ist.

Abgeschlossene Runs werden jedoch nicht mehr für neue Arbeiten verwendet.

## Für fortgeschrittene Anwender

Wenn du mit der Kommandozeile arbeitest, kannst du einen Run auch direkt auswählen, zum Beispiel mit:

```text
--run <run_id>
```

oder über die Umgebungsvariable:

```text
AGDF_RUN_ID
```

Im normalen Gespräch mit dem Coding Agent ist das meist nicht nötig. Es genügt, das gewünschte Vorhaben eindeutig zu benennen oder den Agenten nach den aktiven Runs zu fragen.


Weiter: [Abschluss und Auslieferung](05-abschluss-und-auslieferung.md).
