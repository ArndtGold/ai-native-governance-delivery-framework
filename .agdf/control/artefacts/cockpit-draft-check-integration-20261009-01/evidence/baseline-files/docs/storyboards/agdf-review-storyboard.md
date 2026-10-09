# Storyboard: Ein Widerspruch. Eine klare Entscheidung.

Stand: 8. Oktober 2026. Konzept mit erfundenem Beispielrun; alle Aktionen sind simuliert. Das Storyboard beschreibt einen möglichen Arbeitsablauf und ist keine Aussage über bereits implementierte Funktionen oder eine Freigabe zur Umsetzung.

[Interaktives Storyboard öffnen](agdf-review-storyboard.html) — die HTML-Datei lokal im Browser öffnen und die sechs Szenen durchklicken. In Szene 4 lässt sich der vorgeschlagene Änderungswunsch bearbeiten; Szene 5 übernimmt den bearbeiteten Text.

## Ausgangssituation

Ein Nutzer möchte die Änderungen an einem PRD prüfen. Sein letzter Prüfstand ist r17, der aktuelle Entwurf r18. Er startet im Chat mit: „Prüfe mit mir die Änderungen am PRD für Cockpit-Aktionen.“

Die Geschichte folgt der Frage „Kann ich das freigeben?“ bis zu einem belegten Änderungswunsch. Navigation, Vergleich und Quellenbezug bleiben im selben Arbeitskontext.

## Die sechs Szenen

| Szene | Sichtbare Situation und Aktion | Gedanke des Nutzers | Ersparte Arbeit |
| --- | --- | --- | --- |
| 1. Ankommen | Prüfauftrag, Ziel, Run sowie alter und aktueller Prüfstand sind zugeordnet. Der Nutzer öffnet die Änderungen. | „Kann ich das freigeben?“ | Den Prüfauftrag und den richtigen Dokumentstand im Chat zusammensuchen. |
| 2. Fokussieren | Drei Abschnitte wurden geändert. Ein ausdrücklich als KI-Hinweis gekennzeichneter möglicher Widerspruch lenkt die Prüfung auf § 3.2. | „Welche Änderung muss ich wirklich verstehen?“ | Das gesamte Dokument erneut lesen und relevante Unterschiede selbst suchen. |
| 3. Verstehen | r17 und r18 stehen nebeneinander. Der Entwurf ersetzt die Statusanzeige durch direktes Speichern. Daneben steht die verknüpfte genehmigte UR: Verbindliche Statusänderungen erfolgen über den Core. | „Das ist mehr als ein neuer Button.“ | Zwischen Dokumenten wechseln und die Verbindung zwischen Änderung und Anforderung herstellen. |
| 4. Formulieren | Ein bearbeitbarer Änderungswunsch ist mit PRD r18, § 3.2 und UR r4, § 4 verbunden. | „Ich kann genau sagen, was geändert werden muss.“ | Den Fund im Chat neu beschreiben, Abschnittsnamen kopieren und Quellen erneut zuordnen. |
| 5. Entscheiden | Ziel, Run, Revision, Abschnitt, Änderungswunsch und Wirkung sind vor der simulierten Aktion sichtbar. | „Ich weiß, worauf sich meine Entscheidung bezieht.“ | Ein unbestimmtes „Bitte ändern“ mit anschließendem Klären von Ziel, Stand und Wirkung. |
| 6. Gewissheit | Die simulierte Core-Bestätigung nennt den gespeicherten Änderungswunsch. Die Freigabe bleibt offen; als nächster Schritt folgt die PRD-Überarbeitung. | „Erledigt. Jetzt ist klar, wie es weitergeht.“ | Nachfragen, ob der Wunsch angekommen ist und ob versehentlich eine Freigabe erteilt wurde. |

## Entscheidender Moment

Der Quellenvergleich führt zu einer anderen Handlung als einer vorschnellen Freigabe: Der Nutzer fordert gezielt eine Überarbeitung an. Er muss den Fund anschließend nicht erneut im Chat erklären.

Der Vorschlag für § 3.2 lautet:

> Die Oberfläche soll eine Freigabe an den Core übermitteln. Der Core prüft Ziel, Run und Revision und speichert das Ergebnis. Bitte § 3.2 entsprechend überarbeiten.

## Grenzen des Konzepts

- Die Daten, Revisionen und Beispielquelle sind erfunden.
- Der KI-Hinweis unterstützt die Prüfung; der Nutzer beurteilt die Änderung anhand der Quelle.
- Verbindliche Aktionen benötigen eine Anbindung an den Core. Das Storyboard verändert keine echten Runs oder Freigaben.
- Vor dem Speichern muss der Core den aktuellen Stand erneut prüfen. Bei einer neuen Revision wird die Aktion zur erneuten Prüfung angehalten; dieser Fehlerpfad ist in den sechs Szenen nicht durchgespielt.
- Szenen 1–3 zeigen Lesen und Vergleichen. Szenen 4–6 ergänzen einen Änderungswunsch und dessen verbindliche Speicherung als mögliche spätere Funktion.

## Nutzen prüfen

Bei einer späteren Erprobung messen: Zeit vom Prüfauftrag bis zur fundierten Entscheidung, nötige Chat-Rückfragen und verlorene Quellen- oder Revisionsbezüge. Das Storyboard enthält keine gemessenen Zeitersparnisse.
