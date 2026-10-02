# 02 - Gates

Dieses Dokument beschreibt, wie Gates bewertet werden.

Ein Gate ist ein bewusster Haltepunkt.
An diesem Punkt wird entschieden, ob die Arbeit weitergehen darf, nachgeschärft werden muss oder gestoppt wird.

Ein Gate prüft nicht, ob ein Dokument schön formuliert ist.
Es prüft, ob Grundlage, Freigabe, Annahmen, Risiken und Nachweise ausreichen.

## Kernaussage in fünf Sätzen

Ein Gate ist ein Haltepunkt mit einer klaren Entscheidung.
Es prüft, ob die Grundlage trägt.
Es prüft, ob die nötige Freigabe vorliegt.
Es prüft, ob wichtige Nachweise sichtbar sind.
Wenn harte Voraussetzungen fehlen, geht die Arbeit nicht still weiter.

## Grundregel

Vor jedem Weitergehen müssen fünf Fragen beantwortet werden:

1. Worauf basiert die Entscheidung?
2. Was ist freigegeben?
3. Welche Annahmen sind noch offen?
4. Welche Nachweise liegen vor?
5. Was darf als Nächstes passieren?

Wenn eine dieser Fragen nicht belastbar beantwortet werden kann, ist das Gate nicht bestanden.

Das ist der einfache Kern von fail closed.

Fail closed bedeutet:

- Fehlende Grundlagen werden nicht übersprungen.
- Annahmen werden nicht als Fakten behandelt.
- Fehlende Nachweise werden nicht als erledigt dargestellt.
- Harte Voraussetzungen stoppen den nächsten Schritt.
- Spätere Arbeit darf frühere Entscheidungen nicht still umdeuten.

## Status

Jedes Gate endet mit genau einem Status.

pass bedeutet:
Die Grundlage trägt. Die nötige Freigabe liegt vor. Der nächste Schritt darf beginnen.

revise bedeutet:
Es fehlt noch etwas. Die Arbeit muss nachgeschärft und erneut geprüft werden.

block bedeutet:
Ein harter Blocker ist offen. Die Arbeit darf nicht weitergehen, bis der Blocker geklärt ist.

pass mit Grenzen bedeutet:
Der nächste Schritt ist nur in einem klar begrenzten Rahmen erlaubt.

pass mit Grenzen ist selten.
Der Status ist nur sinnvoll, wenn klar ist:

- Was ist erlaubt?
- Was ist nicht erlaubt?
- Welches Risiko bleibt?
- Welcher Nachweis fehlt noch?
- Wann muss erneut geprüft werden?

## Gute Gate-Entscheidungen

Eine Gate-Entscheidung muss kurz und belastbar sein.

Sie sollte enthalten:

- Gate
- Status
- Grundlage
- kurze Begründung
- offene Punkte
- nächster Schritt

Eine gute Entscheidung sagt nicht nur, was entschieden wurde.
Sie sagt auch, worauf die Entscheidung beruht.

## Harte Blocker

Ein Gate muss blockieren, wenn eine dieser Situationen vorliegt:

- Eine harte Voraussetzung fehlt.
- Eine nötige Freigabe fehlt.
- Scope oder Akzeptanzkriterien widersprechen sich.
- Ein späteres Artefakt deutet ein früheres Artefakt still um.
- Brownfield-Kontext wird ignoriert.
- Bestehende Verantwortung ist unklar.
- Es entstehen parallele Strukturen ohne Entscheidung.
- Eine Annahme wird als Fakt behandelt.
- Sicherheit, Datenschutz oder Compliance sind betroffen und ungeklärt.
- Qualität wird behauptet, aber nicht belegt.

## Brownfield

Brownfield bedeutet:
Die Arbeit betrifft ein bestehendes System.

Dann reicht es nicht, nur die neue Idee zu verstehen.
Es muss auch verstanden werden:

- Welches bestehende Verhalten gilt?
- Welche Module oder Prozesse sind betroffen?
- Wer besitzt die Verantwortung?
- Welche technischen Schulden gibt es?
- Welche Tests schützen bestehendes Verhalten?
- Welche Risiken entstehen durch die Änderung?

Brownfield blockiert nicht automatisch.
Brownfield verlangt aber eine bewusste Entscheidung, wie bestehende Struktur verändert wird.

## Ablauf

Der vollständige Ablauf ist:

1. G-00 User Requirement (UR). Freigabe: Mensch.
2. Brownfield Review mit Mode/Slice Decision. Kommt immer nach dem UR und wählt den Weg.
3. UX Intent Definition. Nur wenn der Auftrag die Bedienung deutlich betrifft. Das bewertet der Brownfield Review.
4. G-01 Product Requirements Doc (PRD). Freigabe: Mensch.
5. G-02 Solution Design (SD). Freigabe: Mensch.
6. G-03 Task und Test Plan (TP). Freigabe: Mensch.
7. Brownfield Analyse. Ist sie bestanden, ist G-04 Implementation Entry erfüllt und die Umsetzung darf beginnen.
8. Umsetzung und Tests (CD+Tests) mit Umsetzungsnachweisen.
9. Task Plan Review, Clean Implementation Review und Code Review.
10. QA Gate. `qa-gate` bewertet, die Freigabe erteilt der Mensch.
11. UAT. Freigabe: Mensch.
12. OR, der Abschlussbericht.

Nur die Schritte mit „Freigabe: Mensch“ sind Gates, die ein Mensch freigeben muss.
Die anderen Schritte führt der Agent aus und hält das Ergebnis fest.
Sie sind trotzdem Pflicht. Nur die UX Intent Definition hängt von einer Bedingung ab.

Das ist der strukturierte Weg.
Für kleine Änderungen wählt die Mode/Slice Decision einen kurzen Weg: Quick Task oder Verified Change.
Dann entfallen PRD, SD, TP, Brownfield Analyse, die Reviews, QA und UAT.
Der kurze Weg endet mit einem kurzen Abschluss.
Verified Change kann in den strukturierten Weg wechseln, wenn sich die Änderung als größer herausstellt.
Ist der Weg nicht klar genug, stoppt die Arbeit, bis die Lücke geklärt ist.

Das folgende Bild zeigt den Ablauf so, wie die Software ihn umsetzt. Es unterscheidet, wer bei
welchem Schritt entscheidet, und zeigt die kurzen Wege für kleine Änderungen.

![Ablauf von UR bis OR: Gates mit Freigabe durch den Menschen, Pflichtschritte des Agenten, die bedingte UX Intent Definition und die kurzen Wege Quick Task und Verified Change](architecture/diagrams/07-gate-steps.svg)

*Erklärung der Schrittarten im [Dispatcher-Dokument](architecture/02-dispatcher.md#schrittklassen).
[Diagrammquelle](architecture/diagrams/07-gate-steps.dot).*

## G-00 User Requirement

G-00 prüft, ob aus einem Anliegen ein sinnvoller nächster Schritt werden kann.

Es geht um Orientierung:

- Was ist das Problem?
- Was ist das Ziel?
- Wer ist betroffen?
- Welche Risiken sind sichtbar?
- Welche Fragen sind offen?
- Kann bestehender Systemkontext betroffen sein?

pass, wenn Problem und Ziel ausreichend klar sind.

revise, wenn Ziel, Nutzer, Kontext oder Ergebnis noch zu unklar sind.

block, wenn Ziele sich widersprechen, Verantwortung unklar ist oder eine wichtige Richtungsentscheidung fehlt.

Nächster Schritt:
Bei pass folgt immer der Brownfield Review.
Er wählt den Weg und entscheidet, ob vor dem PRD noch eine UX Intent Definition nötig ist.
Ist kein bestehender Kontext betroffen, hält der Review das fest (`not_applicable`).

## Brownfield Review nach G-00

Der Brownfield Review liegt früh.
Er soll verhindern, dass das PRD auf einer falschen Annahme entsteht.

Er fragt:

- Welche bestehende Logik kann betroffen sein?
- Welches Verhalten muss geschützt werden?
- Welche Verantwortung ist bereits vorhanden?
- Welche Systemgrenzen gibt es?
- Welche Risiken müssen ins PRD?
- Muss vor dem PRD eine fachliche Entscheidung getroffen werden?

pass, wenn die wichtigsten Brownfield-Risiken für das PRD sichtbar sind.

revise, wenn Systemkontext, Verantwortung oder bestehendes Verhalten noch zu unklar sind.

block, wenn unklar ist, welches bestehende Verhalten fachlich gelten soll.

## G-01 Product Requirements Doc

G-01 prüft, ob ein belastbarer Produktvertrag vorliegt.

Das PRD beschreibt, was fachlich gelten soll.
Es hält Scope, Akzeptanzkriterien, Nicht-Ziele, Annahmen, Risiken und Erfolgskriterien fest.

pass, wenn:

- Scope und Nicht-Ziele klar getrennt sind.
- Akzeptanzkriterien prüfbar sind.
- Annahmen und Risiken sichtbar sind.
- Brownfield-Erkenntnisse berücksichtigt sind.
- Das PRD freigegeben ist.

revise, wenn Scope, Kriterien, Risiken oder Nicht-Ziele noch unscharf sind.

block, wenn Scope widersprüchlich ist, eine Freigabe fehlt oder das PRD bestehendes Verhalten ohne Entscheidung verändern würde.

## G-02 Solution Design

G-02 prüft, ob es ein tragfähiges Lösungskonzept gibt.

Das Design beschreibt, wie das PRD erfüllt werden soll.
Es bleibt auf Entwurfsebene.
Es ist keine Implementierungsanleitung.

pass, wenn:

- Das Design auf das PRD zurückführt.
- Die wichtigsten Entscheidungen erklärt sind.
- Komponenten und Verantwortung verständlich sind.
- Schnittstellen und Datenflüsse passend beschrieben sind.
- Sicherheits-, Datenschutz- und Betriebsfragen berücksichtigt sind.
- Bestehende Systemgrenzen respektiert werden.

revise, wenn Verantwortung, Grenzen, Risiken oder Entscheidungen unklar sind.

block, wenn kein freigegebenes PRD vorliegt oder das Design den Produktvertrag verändert.

## G-03 Task und Test Plan

G-03 prüft, ob aus Produktvertrag und Design ein umsetzbarer Plan entstanden ist.

Der Plan verbindet Aufgaben mit Tests und Nachweisen.
Er beschreibt, was getan wird, warum es getan wird und wie es später geprüft wird.

pass, wenn:

- Aufgaben aus PRD und Design ableitbar sind.
- Jede wichtige Aufgabe einen Zweck hat.
- Akzeptanzkriterien durch Tests oder Nachweise abgedeckt sind.
- Abhängigkeiten sichtbar sind.
- Risiken in Aufgaben, Tests oder Review-Punkte übersetzt wurden.
- Brownfield-Fragen für die spätere Analyse sichtbar sind.

revise, wenn Aufgaben, Tests, Reihenfolge oder Nachweise noch unklar sind.

block, wenn PRD oder Design fehlen, Akzeptanzkriterien nicht prüfbar sind oder der Plan Scope hinzufügt.

## Brownfield Analyse pro Aufgabe

Diese Prüfung kommt auf dem strukturierten Weg immer nach der Freigabe des TP und vor G-04.
Sie gilt für den ganzen freigegebenen Plan und prüft darin jede Aufgabe einzeln.

Sie fragt pro Aufgabe:

- Welche bestehenden Artefakte sind betroffen?
- Was ist bereits vorhanden?
- Was wird wiederverwendet?
- Was wird erweitert?
- Was muss neu entstehen?
- Welche Regressionen können entstehen?
- Drohen parallele Strukturen?

pass, wenn der Eingriff fachlich und technisch sauber begründet ist.

revise, wenn bestehende Module, Verantwortung, Tests oder Risiken noch nicht ausreichend geprüft wurden.

block, wenn eine zweite Wahrheitsquelle, ein zweiter Zustandsweg oder eine parallele Verantwortung entstehen würde.

## G-04 Implementation Entry

G-04 prüft, ob die Umsetzung starten darf.

G-04 entscheidet nicht, ob das Ergebnis fertig ist.
G-04 entscheidet nur, ob die Implementierung auf einer freigegebenen Grundlage beginnen darf.

pass, wenn:

- PRD, Design und Task und Test Plan vorliegen.
- Das PRD freigegeben ist.
- Die Brownfield Analyse bestanden ist.
- Klar ist, was umgesetzt werden darf.
- Klar ist, was nicht umgesetzt werden darf.
- Klar ist, welche Nachweise nach der Umsetzung erwartet werden.

revise, wenn einzelne Aufgaben, Nachweise oder Zuständigkeiten noch unklar sind.

block, wenn eine harte Grundlage fehlt oder die Umsetzung Scope überschreiten würde.

## Umsetzungsnachweise

Nach der Umsetzung müssen die Nachweise sichtbar sein.

Umsetzungsnachweise sind kein Ersatz für QA.
Sie sind die Grundlage für Task Plan Review und QA Gate.

Sie sollte zeigen:

- Welche Dateien oder Artefakte wurden geändert?
- Zu welchen Aufgaben gehören die Änderungen?
- Welche Tests und Checks liefen?
- Was war das Ergebnis?
- Was wurde nicht geprüft?
- Welche Risiken bleiben?
- Welche Screenshots, Logs oder Build-Ergebnisse belegen sichtbares Verhalten?

Fertig darf nicht behauptet werden, wenn Nachweise fehlen.

## Task Plan Review

Der Task Plan Review prüft nach der Umsetzung, ob der genehmigte Plan wirklich erfüllt wurde.

Er beantwortet eine einfache Frage:
Wurde umgesetzt, was im Task und Test Plan vorgesehen war?

pass, wenn:

- Alle wichtigen Aufgaben erledigt sind.
- Akzeptanzkriterien bewertet wurden.
- Nachweise vorliegen.
- Abweichungen dokumentiert und akzeptiert sind.
- Keine zentrale Lücke offen ist.

revise, wenn Aufgaben teilweise erledigt sind oder Nachweise fehlen.

block, wenn wichtige Aufgaben fehlen, zentrale Nachweise fehlen oder die Umsetzung deutlich vom Plan abweicht.

## QA Gate

Das QA Gate prüft, ob das Ergebnis freigegeben werden kann.

QA prüft nicht nur, ob Code vorhanden ist.
QA prüft, ob das Ergebnis mit den vorhandenen Nachweisen verantwortbar ist.

pass, wenn:

- Relevante Akzeptanzkriterien erfüllt sind.
- Tests und Checks nachvollziehbar sind.
- Defekte sichtbar und akzeptiert oder behoben sind.
- Offene Risiken akzeptiert oder nicht blockierend sind.
- Brownfield-Auswirkungen ausreichend geprüft sind.

revise, wenn Korrekturen oder Nachweise fehlen, aber nacharbeitbar sind.

block, wenn kritische Defekte, harte Risiken oder Sicherheits-, Datenschutz- oder Compliance-Probleme offen sind.

## Verhältnis zu Werkzeugen

Gates ersetzen keine Werkzeuge.

Jira, Azure DevOps, GitHub Issues, Pull Requests und Pipelines können zeigen, woran gearbeitet wurde.
Sie entscheiden aber nicht automatisch, ob die Arbeit verantwortbar weitergehen darf.

Ein Agent darf nicht nur deshalb weiterarbeiten, weil er ein Ticket lesen, einen Branch öffnen oder eine Pipeline starten kann.
Er muss prüfen, ob die Voraussetzungen des Gates erfüllt sind.

Werkzeuge liefern Informationen.
Gates liefern Entscheidungen.

## Kurzform

Vor jedem Weitergehen:

- Ist die Grundlage klar?
- Ist die nötige Freigabe vorhanden?
- Sind Annahmen sichtbar?
- Sind Risiken sichtbar?
- Sind Nachweise vorhanden?
- Ist klar, was nicht geprüft wurde?
- Ist der nächste Schritt erlaubt?

Wenn nicht, ist das Gate nicht pass.

## Nächster Schritt

Gates brauchen belastbare Grundlagen.
Das nächste Dokument beschreibt deshalb die Artefakte, auf denen Gate-Entscheidungen beruhen:

[03 - Artefakte](03-artefakte.md)
