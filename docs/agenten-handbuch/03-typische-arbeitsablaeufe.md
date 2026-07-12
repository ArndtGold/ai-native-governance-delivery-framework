# Typische Arbeitsabläufe

AGDF wählt nach dem frühen Bestandscheck den kleinsten belastbaren Arbeitsmodus. Das verhindert
gleichzeitig unnötige Bürokratie und unkontrollierte Abkürzungen.

## Quick Task

Ein Quick Task passt für eine eng begrenzte Frage, Prüfung oder lokale Änderung ohne neue
Produktsemantik. Der Agent hält Ergebnis, Evidenz, Rest-Risiko und nächsten Schritt kompakt fest.

Beispiel:

```text
Du: Prüfe, ob die Readme auf einen nicht vorhandenen Link verweist.

Agent: Prüft den Link, korrigiert ihn falls nötig und dokumentiert die Prüfung kompakt.
```

Ein Quick Task ist nicht passend, sobald eine neue Nutzerfähigkeit, ein verändertes Verhalten,
Architektur-, Daten-, Sicherheits- oder Freigabefragen betroffen sind.

## Strukturierte Lieferung

Eine strukturierte Lieferung passt, wenn der Agent eine fachliche Entscheidung, bestehende
Systemgrenzen oder nachvollziehbare Akzeptanzkriterien absichern muss. Das
[Banking-Beispiel](../../examples/sample-banking-flow.md) ist dafür die zentrale Referenz: Es trennt
Limitprüfung, manuelle Prüfung und dauerhafte Limitbelastung, schützt Nicht-Ziele und ergänzt Tests
für Annahme, spätere Freigabe und Ablehnung.

Übertragen auf die Bedienung bedeutet das: Der Agent prüft zunächst den Bestand, leitet daraus
Anforderungen, Solution Design und Task- und Testplan ab und beginnt erst nach `Approval: TP` mit der
Umsetzung. Die Gate-Details stehen in [02 – Gates](../02-gates.md).

## Gute Arbeitsaufträge

Ein hilfreicher Auftrag nennt Ziel, Betroffene und erkennbare Grenzen:

```text
Eine zur manuellen Prüfung markierte Echtzeitüberweisung darf das Tageslimit noch
nicht belasten. Normale SEPA-Überweisungen und die bestehende Sicherheitsprüfung
dürfen sich nicht verändern.
```

Wenn du eine Präferenz hast, nenne sie direkt: „keine Übergangslösung“, „keine neue Datenbank“ oder
„nur Dokumentation“. Der Agent prüft trotzdem, ob diese Präferenz mit bestehenden Quellen und dem
aktuellen Gate vereinbar ist.

Weiter: [Mehrere Runs](04-mehrere-runs.md).
