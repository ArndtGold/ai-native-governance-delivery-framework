# Typische Arbeitsabläufe

Nach dem ersten Bestandscheck wählt AGDF den kleinsten Arbeitsablauf, der für die Aufgabe ausreicht.

So vermeidet AGDF unnötigen Aufwand, ohne wichtige Prüfungen oder Freigaben zu überspringen.

Grundsätzlich gibt es zwei Wege:

* Quick Task für kleine und klar begrenzte Aufgaben
* strukturierte Lieferung für fachlich oder technisch relevante Änderungen

## Quick Task

Ein Quick Task eignet sich für eine kleine, klar begrenzte Aufgabe.

Typische Beispiele sind:

* eine Frage zum bestehenden Code,
* eine Prüfung,
* eine kleine Korrektur,
* oder eine lokale Änderung ohne neues Produktverhalten.

Der Agent dokumentiert dabei kurz:

* das Ergebnis,
* den Nachweis,
* verbleibende Risiken,
* und den nächsten Schritt.

Beispiel:

```text
Du:
Prüfe, ob die Readme auf einen nicht vorhandenen Link verweist.

Agent:
Prüft den Link, korrigiert ihn bei Bedarf und dokumentiert das Ergebnis.
```

Ein Quick Task reicht nicht aus, wenn die Änderung

* eine neue Funktion für Nutzer einführt,
* bestehendes Verhalten verändert,
* mehrere Teile des Systems betrifft,
* Architektur oder Daten verändert,
* Sicherheitsfragen berührt,
* oder eine bewusste Freigabe benötigt.

In diesen Fällen verwendet der Agent eine strukturierte Lieferung.

## Strukturierte Lieferung

Eine strukturierte Lieferung ist für Änderungen gedacht, die fachlich oder technisch abgesichert werden müssen.

Das gilt besonders, wenn

* eine fachliche Entscheidung nötig ist,
* bestehende Systemgrenzen betroffen sind,
* mehrere Komponenten zusammenspielen,
* Risiken geprüft werden müssen,
* oder klare Akzeptanzkriterien erforderlich sind.

Das [Banking Beispiel](../../examples/sample-banking-flow.md) zeigt diesen Ablauf vollständig.

Dort wird festgelegt, dass eine Echtzeitüberweisung während der manuellen Prüfung das Tageslimit noch nicht belasten darf.

Gleichzeitig wird geprüft, dass

* normale Überweisungen unverändert bleiben,
* die bestehende Sicherheitsprüfung nicht verändert wird,
* die spätere Freigabe korrekt berücksichtigt wird,
* eine Ablehnung keine dauerhafte Belastung auslöst,
* und die Fachregel durch Tests nachgewiesen wird.

Der Agent geht dabei schrittweise vor:

```text
Bestand prüfen
→ Anforderungen festhalten
→ Lösung entwerfen
→ Aufgaben und Tests planen
→ Approval: TP
→ Umsetzung und Tests
→ Qualitätsprüfung
→ fachliche Abnahme
```

Mit der Umsetzung beginnt der Agent erst nach:

```text
Approval: TP
```

Die einzelnen Gates werden unter [02 Gates](../02-gates.md) beschrieben.

## Gute Arbeitsaufträge

Ein guter Arbeitsauftrag beschreibt zuerst das Ziel.

Zusätzlich sollte er nennen,

* was betroffen ist,
* was unverändert bleiben muss,
* und welche Grenzen bereits bekannt sind.

Beispiel:

```text
Eine zur manuellen Prüfung markierte Echtzeitüberweisung darf das Tageslimit noch
nicht belasten.

Normale SEPA Überweisungen und die bestehende Sicherheitsprüfung dürfen sich nicht
verändern.
```

Du kannst auch technische oder fachliche Vorgaben nennen.

Zum Beispiel:

```text
Keine Übergangslösung.
Keine neue Datenbank.
Nur die Dokumentation ändern.
```

Solche Vorgaben helfen dem Agenten bei der Planung. Er prüft trotzdem, ob sie zum bestehenden System, zu den vorhandenen Quellen und zum aktuellen Gate passen.

Weiter: [Mehrere Runs](04-mehrere-runs.md).
