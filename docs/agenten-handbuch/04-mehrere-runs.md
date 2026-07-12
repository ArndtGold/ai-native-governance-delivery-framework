# Mehrere Runs

Ein Run ist der langlebige Steuerungszustand eines Vorhabens. Mehrere Vorhaben können gleichzeitig
aktiv sein, ohne dieselbe mutable Statusdatei zu teilen.

## Was sich für dich ändert

- Ein Coding-Agent kann mehrere Vorhaben im gleichen Repository sauber trennen.
- Bei genau einem aktiven Run ist normalerweise keine Auswahl nötig.
- Bei mehreren aktiven Runs muss der gewünschte Run explizit gewählt werden.
- Ein nicht eindeutig ausgewählter Run führt zu einem kontrollierten Ambiguitätsfehler, nicht zu einer
  stillen Auswahl.

Fortgeschrittene Aufrufe können einen Run mit `--run <run_id>` oder über `AGDF_RUN_ID` auswählen. Die
technische Referenz und die genaue Priorität stehen im
[Control-Scaffold](../../plugin/control/README.md). Im normalen Agentengespräch genügt meist, das
Vorhaben eindeutig zu benennen oder den Agenten nach den aktiven Runs zu fragen.

## Lifecycle

Aktive Runs bleiben getrennt von abgeschlossenen, ersetzten oder abgebrochenen Runs. Abgeschlossene
Runs werden nicht automatisch gelöscht: Sie bleiben als nachvollziehbarer Arbeitsnachweis erhalten,
nehmen aber nicht mehr an der automatischen Auswahl aktiver Arbeit teil.

## Parallel arbeiten

Wenn zwei Personen an unterschiedlichen Vorhaben arbeiten, besitzen die Runs getrennte kanonische
Statusdateien. Änderungen am selben Run bleiben dagegen sichtbar und werden nicht durch einen
automatischen Union-Merge versteckt.

Weiter: [Abschluss und Auslieferung](05-abschluss-und-auslieferung.md).
