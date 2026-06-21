# Glossar

Dieses Glossar hält die wichtigsten Begriffe des Entwurfs einfach und einheitlich.
Es ist kein Wörterbuch für alle Fachbegriffe.
Es soll verhindern, dass zentrale Begriffe in jedem Kapitel anders verwendet werden.

## Entwurf

Der Entwurf ist das gesamte Vorhaben in diesem Repository.
Er beschreibt eine mögliche Arbeitsweise für Softwareentwicklung mit KI-Agenten.
Er ist noch kein fertiger Standard, kein Tool und kein Rollout-Prozess.

## Ansatz

Der Ansatz ist die Grundidee hinter dem Entwurf.
Er lautet: KI-Agenten sollen nicht nur liefern, sondern in einem nachvollziehbaren Arbeitsrahmen arbeiten.

## Modell

Das Modell beschreibt den Ablauf.
Es ordnet Arbeit in Gates, Artefakte, Nachweise und Entscheidungen.

## Gate

Ein Gate ist ein bewusster Haltepunkt.
Es prüft, ob die Grundlage trägt, ob Freigaben vorliegen und ob genug Nachweise sichtbar sind.
Ein Gate kann weitergehen lassen, Nacharbeit verlangen oder blockieren.

## Artefakt

Ein Artefakt ist ein gespeicherter Arbeitsstand.
Es hält fest, was gilt, worauf es basiert, welche Annahmen bestehen und welche Nachweise vorliegen.

## Produktvertrag

Der Produktvertrag beschreibt verbindlich, was fachlich gelten soll.
Er hält Scope, Akzeptanzkriterien, Nicht-Ziele, Annahmen und Erfolgsmessung fest.
Spätere Arbeit darf ihn nicht still umdeuten.

## Kontextgraph

Der Kontextgraph zeigt Beziehungen zwischen Artefakten, Entscheidungen, Tests, Nachweisen und bestehenden Systemteilen.
Er ist kein Tool-Memory.
Er gehört zum Projekt und soll Projektwissen auffindbar machen.

## Fachliche Landkarte

Die fachliche Landkarte ist kein zweites Projektgedächtnis.
Sie beschreibt den fachlichen Ausschnitt aus Artefakten und Kontextgraph, der für eine Aufgabe wichtig ist.
Dazu gehören Begriffe, Regeln, Grenzen, Risiken und Nachweise.

## Domain Driven Delivery

Domain Driven Delivery verbindet Fachlichkeit und Lieferung.
Der Begriff meint hier keinen Zwang zu einem vollständigen DDD-Modell.
Er beschreibt, dass Anforderungen, Design, Tasks, Tests, Reviews und Gates auf fachliche Begriffe, Regeln und Grenzen zurückführen sollen.

## Qualitätsvertrag

Ein Qualitätsvertrag macht eine Regel prüfbar.
Er beschreibt, welche Regel gilt, welcher Nachweis erwartet wird und was passiert, wenn der Nachweis fehlt.

## Nachweis

Ein Nachweis zeigt, worauf eine Aussage beruht.
Das kann ein Testlauf, ein Build, ein Review-Ergebnis, ein Screenshot, ein Log oder eine begründete Einschränkung sein.

## Brownfield

Brownfield bedeutet: Die Arbeit betrifft ein bestehendes System.
Dann müssen vorhandenes Verhalten, bestehende Verantwortung, technische Schulden und Risiken verstanden werden, bevor geändert wird.

## Fail closed

Fail closed bedeutet: Wenn eine harte Voraussetzung fehlt, geht die Arbeit nicht einfach weiter.
Es wird geklärt, nachgearbeitet oder bewusst blockiert.
