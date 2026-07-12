# Fehlerbehebung

AGDF meldet fehlende Voraussetzungen absichtlich sichtbar. Die Meldung beschreibt normalerweise den
aktuellen Gate, die fehlende Freigabe und den nächsten erlaubten Schritt.

## „Approval: … fehlt“

Prüfe zuerst, ob das zugehörige Artefakt existiert und der Inhalt deiner Entscheidung entspricht. Gib
die Freigabe dann exakt an, zum Beispiel:

```text
Approval: TP
```

`TP` steht für Task- und Testplan. Die Begriffe und Gate-Reihenfolge sind in
[02 – Gates](../02-gates.md) beschrieben.

„OK“, „weiter“ oder „leg los“ sind nützliche Arbeitsanweisungen, aber keine Gate-Freigaben.

## Mehrere aktive Runs

Wenn der Agent keinen Run automatisch wählen kann, nenne das Vorhaben eindeutig oder bitte um eine
Liste aktiver Runs. Fortgeschrittene Nutzer können die technische Auswahl mit `--run` oder
`AGDF_RUN_ID` verwenden; Details stehen im
[Control-Scaffold](../../plugin/control/README.md).

## Legacy-Projektion oder Drift

Ältere Repositories können noch eine `AGDF_RUN.md` besitzen. Nach einer expliziten Migration ist die
kanonische Run-Datei maßgeblich; die alte Datei ist nur eine erkennbare Kompatibilitätsprojektion.
Meldet AGDF Drift oder Mixed Authority, lasse die Projektion neu erzeugen oder entferne sie erst,
wenn keine älteren Verbraucher mehr darauf angewiesen sind. Siehe die technische Anleitung im
[Control-Scaffold](../../plugin/control/README.md).

## Der Agent sagt „blockiert“

Lies den genannten Befund nicht als allgemeines Scheitern. Häufig fehlt lediglich eine präzise
Entscheidung, ein Artefaktverweis oder ein Nachweis. Korrigiere genau diesen Punkt; der Agent soll den
Rest des Prozesszustands nicht stillschweigend verändern.

Zurück zum [Handbuch-Index](README.md).
