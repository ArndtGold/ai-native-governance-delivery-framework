# Beispiel - Ein kleiner Brownfield Change

Dieses Beispiel zeigt, wie der Entwurf in einem kleinen Vorhaben genutzt werden kann.

Es geht nicht um ein perfektes Prozessmodell.
Es geht um die Frage:

Wie bleibt ein KI-gestützter Arbeitslauf nachvollziehbar, ohne schwerfällig zu werden?

## Ausgangslage

Ein bestehendes Produkt hat eine Suche.
Nutzer können Suchergebnisse filtern.

Ein Team möchte ergänzen:

Die Suche soll leere Ergebnisse besser erklären.

Heute sieht der Nutzer nur eine leere Liste.
Künftig soll sichtbar werden, ob keine Daten vorhanden sind oder ob der Filter zu eng ist.

## G-00 User Requirement

Das Team klärt zuerst das Anliegen.

Problem:
Nutzer verstehen leere Suchergebnisse nicht.

Ziel:
Die Oberfläche soll verständlich erklären, warum keine Ergebnisse angezeigt werden.

Betroffen:
Suche, Filter, Ergebnisliste, Texte, Tests.

Brownfield-Hinweis:
Die Suche existiert bereits.
Das bestehende Verhalten darf nicht unbemerkt verändert werden.

Entscheidung:
pass.

Nächster Schritt:
Brownfield Review.

## Brownfield Review

Das Team prüft den bestehenden Kontext.

Gefunden:

- Es gibt bereits eine Komponente für die Ergebnisliste.
- Es gibt bereits einen Empty State.
- Es gibt Filterlogik im Frontend.
- Es gibt Tests für Suchergebnisse, aber keine Tests für leere Filterergebnisse.

Risiko:
Ein neuer Empty State könnte bestehende Texte oder Tests umgehen.

Entscheidung:
pass.

Folge:
Das PRD muss zwischen zwei Fällen unterscheiden:

- Keine Daten vorhanden.
- Filter schränken die Ergebnisse zu stark ein.

## G-01 Product Requirements Doc

Der Produktvertrag hält fest:

Scope:
Leere Suchergebnisse sollen verständlich erklärt werden.

Akzeptanzkriterien:

- Wenn keine Daten vorhanden sind, erscheint ein passender Hinweis.
- Wenn Filter zu eng sind, erscheint ein Hinweis mit Filterbezug.
- Bestehende erfolgreiche Suchergebnisse bleiben unverändert.

Nicht-Ziel:
Die Suchlogik selbst wird nicht neu gebaut.

Entscheidung:
pass.

## G-02 Solution Design

Das Design beschreibt den Lösungsweg.

Vorschlag:

- Bestehende Ergebnislisten-Komponente weiterverwenden.
- Bestehenden Empty State erweitern.
- Keine neue Suchkomponente bauen.
- Filterzustand als Grundlage für den passenden Hinweis nutzen.

Entscheidung:
pass.

## G-03 Task und Test Plan

Der Plan zerlegt die Arbeit.

Aufgabe 1:
Empty State erweitert zwischen keine Daten und Filter zu eng unterscheiden.

Aufgabe 2:
Texte ergänzen.

Aufgabe 3:
Tests für beide leeren Fälle ergänzen.

Nachweise:

- Unit Test für Empty State.
- Integrationstest für Filterfall.
- Screenshot oder kurze Beschreibung des sichtbaren Zustands.

Entscheidung:
pass.

## Brownfield Analyse pro Aufgabe

Das Team prüft vor der Umsetzung:

- Welche Komponente ist zuständig?
- Gibt es schon einen Empty State?
- Welche Tests schützen das bestehende Verhalten?
- Entsteht eine zweite Anzeige für denselben Zustand?

Ergebnis:
Bestehende Komponente wird erweitert.
Keine neue Parallelstruktur.

Entscheidung:
pass.

## G-04 Implementation Entry

Vor der Umsetzung ist klar:

- PRD ist freigegeben.
- Design ist abgeschlossen.
- Task und Test Plan ist abgeschlossen.
- Brownfield wurde geprüft.
- Erwartete Nachweise sind bekannt.

Entscheidung:
pass.

## Umsetzung und Nachweise

Nach der Umsetzung werden sichtbar gemacht:

- Geänderte Dateien.
- Zugehörige Aufgaben.
- Gelaufene Tests.
- Testergebnisse.
- Nicht geprüfte Punkte.
- Offene Risiken.

Beispiel:

- Empty State Komponente erweitert.
- Tests für beide leeren Fälle ergänzt.
- Bestehende Suche bleibt unverändert.
- Keine offenen Risiken bekannt.

## Task Plan Review

Das Team prüft:

- Aufgabe 1 erledigt?
- Aufgabe 2 erledigt?
- Aufgabe 3 erledigt?
- Sind die Akzeptanzkriterien belegt?
- Wurde Scope hinzugefügt?

Ergebnis:
Alle Aufgaben erledigt.
Nachweise liegen vor.

Entscheidung:
pass.

## QA Gate

QA prüft:

- Akzeptanzkriterien erfüllt?
- Tests nachvollziehbar?
- Keine neue Parallelstruktur?
- Kein ungeklärtes Risiko?

Entscheidung:
pass.

## Qualitätsvertrag für den Agentenlauf

Zusätzlich kann geprüft werden:

Hat der Agent gezeigt, worauf seine Aussage erledigt beruht?

Erwartete Nachweise:

- Aufgabe genannt.
- Änderung genannt.
- Test genannt.
- Ergebnis genannt.
- Offene Risiken genannt.

Wenn diese Nachweise fehlen, ist nicht automatisch das Produkt falsch.
Aber der Agentenlauf ist nicht ausreichend belegt.

## Ergebnis

Der Change bleibt klein.
Trotzdem ist nachvollziehbar:

- Warum die Änderung erlaubt war.
- Welche bestehende Logik betroffen war.
- Warum keine neue Komponente gebaut wurde.
- Welche Tests die Änderung belegen.
- Warum das Ergebnis freigegeben werden kann.

Das ist der praktische Nutzen des Entwurfs.
