# Beispiel - KI-gestützten Lieferprozess in einem Bankenumfeld

Dieses Beispiel zeigt einen KI-gestützten Lieferprozess in einem Bankenumfeld.

## Ausgangslage

Eine Bank betreibt ein bestehendes System für Online-Überweisungen.

Kundinnen und Kunden können normale SEPA-Überweisungen und Echtzeitüberweisungen auslösen. Für Echtzeitüberweisungen gilt ein Tageslimit.

Zusätzlich gibt es eine Sicherheitsprüfung. Sie kann einzelne Zahlungen zur manuellen Prüfung markieren.

## Problem

Ein Fehler tritt nur in einer bestimmten Kombination auf:

* Die Zahlung ist eine Echtzeitüberweisung.
* Das Tageslimit ist noch nicht ausgeschöpft.
* Die Sicherheitsprüfung markiert die Zahlung zur manuellen Prüfung.
* Die Zahlung wird deshalb nicht sofort ausgeführt.

Im bestehenden System wird der Betrag trotzdem schon auf das Tageslimit angerechnet.

Das ist fachlich falsch.

Eine Zahlung darf erst dann auf das Tageslimit zählen, wenn sie zur Ausführung angenommen wurde.

## Warum der Fall fachwertkritisch ist

Der Fehler verändert keinen Text und keine reine Anzeige.

Er verändert einen fachlichen Wert: das verfügbare Tageslimit.

Dadurch kann eine spätere Zahlung zu Unrecht abgelehnt werden.

## G-00 Klärung des Anliegens

Das Team klärt zuerst den genauen Schnitt.

Ziel:

Eine zur manuellen Prüfung markierte Echtzeitüberweisung darf das Tageslimit noch nicht belasten.

Nicht-Ziele:

* Die Sicherheitsprüfung wird nicht neu bewertet.
* Die Limitlogik wird nicht neu gebaut.
* Der Freigabeprozess für manuelle Prüfungen wird nicht geändert.
* Es wird keine Sonderregel nur für die Oberfläche eingeführt.

Entscheidung: pass.

Nächster Schritt: Brownfield Review.

## Brownfield Review

Das Team prüft den bestehenden Ablauf.

Gefunden:

* Die Limitprüfung läuft vor der finalen Annahme der Zahlung.
* Die Sicherheitsprüfung kann die Zahlung in den Status `MANUAL_REVIEW` verschieben.
* Das Tageslimit wird aktuell schon beim ersten positiven Limitcheck reserviert.
* Die spätere Ablehnung oder manuelle Freigabe läuft über einen anderen Pfad.

Risiko:

Ein einfacher Fix könnte echte Limitreservierungen entfernen.

Ein anderer einfacher Fix könnte nur die Oberfläche korrigieren, obwohl das Limit im Bestand weiterhin falsch bleibt.

Entscheidung: pass.

## G-01 Product Requirements Doc

Der Produktvertrag hält fest:

Akzeptanzkriterien:

* Eine angenommene Echtzeitüberweisung belastet das Tageslimit.
* Eine zur manuellen Prüfung markierte Echtzeitüberweisung belastet das Tageslimit noch nicht.
* Eine später freigegebene Zahlung belastet das Tageslimit genau einmal.
* Eine später abgelehnte Zahlung belastet das Tageslimit nicht.
* Bestehende Limitregeln für normale SEPA-Überweisungen bleiben unverändert.

Entscheidung: pass.

## G-02 Solution Design

Das Design trennt drei fachliche Schritte:

* Prüfung: Darf die Zahlung grundsätzlich ausgeführt werden?
* Vormerkung: Muss die Zahlung manuell geprüft werden?
* Belastung: Zählt die Zahlung bereits gegen das Tageslimit?

Lösungsregel:

Das Tageslimit wird erst belastet, wenn die Zahlung den Status `ACCEPTED_FOR_EXECUTION` erreicht.

Für `MANUAL_REVIEW` wird keine dauerhafte Limitbelastung geschrieben.

Entscheidung: pass.

## G-03 Task und Test Plan

Der Plan macht die Qualitätsanforderung ausführbar.

Aufgaben:

1. Test für angenommene Echtzeitüberweisung ergänzen.
2. Test für Echtzeitüberweisung mit manueller Prüfung ergänzen.
3. Test für spätere Freigabe ergänzen.
4. Test für spätere Ablehnung ergänzen.
5. Bestehende SEPA-Limit-Tests erneut ausführen.
6. Änderung im Limitbuchungspfad minimal umsetzen.

Nachweise:

* Fokustest für den neuen Fehlerfall.
* Regressionstest für angenommene Echtzeitüberweisung.
* Regressionstest für normale SEPA-Überweisung.
* Build oder Pipeline-Lauf.

Entscheidung: pass.

## G-04 Implementation Entry

Vor der Umsetzung ist klar:

* Der Fehler ist fachlich verstanden.
* Die betroffenen Pfade sind bekannt.
* Die Akzeptanzkriterien sind testbar.
* Die Nicht-Ziele schützen vor unnötigem Umbau.
* Die erwarteten Nachweise sind festgelegt.

Entscheidung: pass.

## Umsetzung

Die Änderung bleibt klein.

Geändert wird nur der Punkt, an dem das Tageslimit dauerhaft belastet wird.

Die Fachregel lautet:

Eine Zahlung im Status `MANUAL_REVIEW` ist noch nicht zur Ausführung angenommen. Deshalb darf sie das Tageslimit noch nicht dauerhaft belasten.

Eine Zahlung im Status `ACCEPTED_FOR_EXECUTION` darf das Tageslimit belasten.

## G-05 Umsetzungsevidenz

Nach der Umsetzung werden sichtbar gemacht:

* Welche Datei oder Komponente geändert wurde.
* Welche Fachregel geändert wurde.
* Welche Tests ergänzt wurden.
* Welche bestehenden Tests weiter grün sind.
* Welche Risiken geprüft wurden.
* Welche Punkte bewusst nicht geändert wurden.

Beispielhafte Evidenz:

* Neue Tests für `MANUAL_REVIEW`, spätere Freigabe und spätere Ablehnung.
* Bestehende Tests für angenommene Echtzeitüberweisung bleiben grün.
* Bestehende Tests für normale SEPA-Überweisung bleiben grün.
* Kein öffentlicher Zahlungsauftrag-Vertrag wurde geändert.

Entscheidung: pass.

## Review

Das Team prüft:

* Wird das Tageslimit nur bei angenommener Ausführung belastet?
* Wird eine spätere Freigabe genau einmal gezählt?
* Bleibt eine spätere Ablehnung ohne Limitbelastung?
* Bleiben bestehende SEPA-Regeln unverändert?
* Ist die Fachregel im Code oder in der Regeldefinition klar erkennbar?

Ergebnis:

Ein Review findet ein mögliches Risiko:

Bei späterer Freigabe könnte dieselbe Zahlung doppelt gezählt werden.

Nacharbeit:

Der Testplan wird um einen Fall ergänzt, der die doppelte Belastung verhindert.

Entscheidung: pass.

## QA

QA prüft:

* Sind alle Akzeptanzkriterien belegt?
* Ist der Fehler am fachlichen Ursprung behoben?
* Sind bestehende Zahlungsarten geschützt?
* Gibt es keine reine Anzeigekorrektur als Hauptfix?
* Sind offene Risiken sichtbar?

Entscheidung: pass.

## Qualitätsvertrag für den Agentenlauf

Der Agentenlauf ist nur dann ausreichend belegt, wenn er zeigt:

* welches fachliche Problem gelöst wurde,
* welche Grenze bewusst nicht überschritten wurde,
* welche bestehende Logik geschützt wurde,
* welche Änderung umgesetzt wurde,
* welche Tests den neuen Fehlerfall abdecken,
* welche Tests bestehendes Verhalten schützen,
* welche Risiken nach dem Review offen oder erledigt sind.

Wenn diese Nachweise fehlen, ist nicht automatisch das Produkt falsch.

Aber der Agentenlauf ist nicht ausreichend auditierbar.

Der praktische Nutzen:

Eine kleine Änderung an einem fachlichen Wert wird nicht nur behauptet. Sie wird durch einen ausführbaren Qualitätsvertrag belegbar gemacht.
