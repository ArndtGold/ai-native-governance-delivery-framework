# UR: UR-Erstellung von gate-check trennen

Status: draft
Gate: UR
Gate approval: open
Date: 2026-10-04
Owner: Arndt Gold

## 1. Problem

AGDF bündelt derzeit die fachliche Formulierung einer User Requirement mit der Steuerung ihres Intake: Die von gate-check zurückgegebene Fortsetzung enthält sowohl `write_ur` als auch die Registrierung und erneute Gate-Prüfung. Damit ist die Verantwortung für das Erstellen des Bedarfs nicht eindeutig von der Verantwortung für Kontrolle und Freigabe getrennt.

Betroffen sind Nutzer, die einen neuen Bedarf einbringen, Coding-Agenten, die ihn formulieren und bearbeiten, sowie Maintainer der gemeinsamen AGDF-Verträge und Hostprojektionen. Sie benötigen eine nachvollziehbare Zuständigkeit vom ursprünglichen Auftrag bis zur prüfbaren UR.

Ausgangspunkt ist die Entscheidung im Gespräch: „UR-Erstellung von gate-check trennen“. Dies ist der erste abgegrenzte Schritt der besprochenen Verantwortungstrennung.

## 2. Goal

Die UR-Erstellung erhält einen eigenen fachlichen Skill. Er klärt den vom Nutzer eingebrachten Bedarf und erstellt oder überarbeitet die zugehörige UR. gate-check prüft den kanonischen Zustand und die Voraussetzungen für den nächsten Schritt; der Dispatcher ordnet die verantwortliche Tätigkeit zu. Der Nutzer entscheidet über die Freigabe.

Für Agenten und Nutzer muss erkennbar sein, wer den Bedarf formuliert, wer seine Gate-Bereitschaft prüft und wer ihn freigibt. Es bleibt eine kanonische UR pro gebundenem Run.

## 3. Scope

- Einen dedizierten UR-Erstellungsskill mit klaren Eingaben, Ergebnissen und Grenzen definieren und in den bestehenden kanonischen Skillkatalog aufnehmen.
- Die fachliche UR-Erstellung aus dem bisherigen gate-check-Intake an diesen Skill übergeben. Die Steuerung darf nicht weiterhin einen konkurrierenden Formulierungsweg anbieten.
- Der Skill arbeitet aus dem ursprünglichen Nutzerauftrag und dem bestätigten Kontext. Er klärt Problem, gewünschtes Ergebnis, betroffene Nutzer, Umfang, Nicht-Ziele, erkennbare Erfolgssignale, bestehende verbindliche Quellen sowie Risiken und offene Fragen. Er kennzeichnet Annahmen und fragt nur nach Informationen, die den Bedarf wesentlich verändern oder seine Formulierung verhindern.
- Run-Zuordnung, Zielbindung und Revisionsprüfung bleiben beim bestehenden Intake und den kanonischen Kontrolloperationen. Der neue Skill erstellt keine eigenen Kontrollzustände und überträgt keine Freigaben.
- Die Übergabe liefert einen prüfbaren UR-Entwurf am gebundenen Artefaktpfad. Registrierung und erneute Prüfung verwenden die bestehenden kanonischen Operationen; offene fachliche Klärung und Freigabebereitschaft müssen unterscheidbar bleiben.
- Betroffene Verträge, Dokumentation und generierte Hostprojektionen konsistent nachführen. Das Routing, die Bindungsgrenzen und die unveränderte menschliche Freigabe mit passenden Nachweisen prüfen.

## 4. Non-Goals

- PRD-, Solution-Design- oder Taskplan-Erstellung in diesem Schritt neu ordnen.
- Brownfield Analysis als Task 0 oder abschließende Reviews in den Taskplan verschieben.
- UAT, QA, Closeout oder Release-Zuständigkeiten ändern.
- Neue Gates, zusätzliche Genehmigungen, parallele Artefakte oder eine zweite Source of Truth einführen.
- Technische Lösungen oder Implementierungsberechtigung allein aus der UR ableiten.
- Bestehende Runs migrieren oder bereits erteilte Freigaben neu interpretieren.
- Veröffentlichung, Release, Commit oder Push automatisch auslösen.

## 5. Acceptance Signals

Der Bedarf ist für die nachfolgende Analyse und Planung hinreichend klar, wenn:

1. Fachliche UR-Erstellung, Kontrollprüfung, Routing und menschliche Freigabe eindeutig getrennte Verantwortlichkeiten haben.
2. Der UR-Erstellungsskill einen neuen Bedarf und fachliche Überarbeitungen einer noch nicht freigegebenen UR ohne automatische Zustimmung bearbeiten kann.
3. Die vorgeschlagene Übergabe auf genau das bestätigte Ziel, den Run und die gültige Revision begrenzt ist und dieselbe kanonische UR verwendet.
4. gate-check nach der Übergabe weiterhin die tatsächliche Freigabebereitschaft ermittelt und die bestehende Freigabe `Approval: UR` nicht ersetzt oder vorwegnimmt.
5. Die erforderlichen Änderungen an Skillkatalog, Laufzeitvertrag, Routing und Hostprojektionen in der anschließenden Planung nachvollziehbar abgegrenzt werden können.

Die späteren Umsetzungsnachweise sollen insbesondere neue UR-Erstellung, fehlende wesentliche Angaben, Überarbeitung, falsche oder veraltete Bindung und den Übergang zur bestehenden Freigabeprüfung abdecken. Frische native Hostbeobachtungen sind von Quell-, Paket- und Protokollprüfungen zu unterscheiden.

## 6. Existing Source Of Truth

- `plugins/agdf/meta/agdf-plugin.definition.json`: kanonischer Skillkatalog und Hostprojektionen.
- `plugins/agdf/skills/gate-check/SKILL.md`: bestehender Einstieg und Kontrollgrenze.
- `plugins/agdf/control/templates/artefacts/UR.md`: bestehende UR-Struktur.
- `plugins/agdf/meta/contracts/gate-transition.md` und `task-target-resolution.md`: Gate- und Zielbindung.
- `packages/core/lib/skill-dispatch/delivery-intake.js` und `service.js`: aktueller Intake und Dispatch.
- Bestehende kanonische Run-Registrierung, Artefaktbindung, Revisionsprüfung und Freigabepräsentation; keine parallelen Schreiber.
- `docs/02-gates.md`: fachliche Bedeutung des UR-Gates.

## 7. Risks And Unknowns

- Brownfield Review und Design müssen klären, wie der UR-Skill nur in einem zulässigen, gebundenen Intake aufgerufen wird und wie eine Überarbeitung sicher zum Kontrollpfad zurückkehrt.
- Der Katalog, seine Größenbudgets und die generierten Hostprojektionen gehen bisher von zehn Skills aus. Der zusätzliche Skill muss konsistent und ohne unbemerkte Vergrößerung der automatisch geladenen Anweisungen integriert werden.
- Die UR-Erstellung darf weder eine ungeklärte Run-Zuordnung ersetzen noch eine Produktentscheidung erfinden. Ein fehlender wesentlicher Bedarf muss als offene Frage sichtbar bleiben.
- Der konkrete Skillname und das genaue Übergabeformat werden in PRD und Design festgelegt. Die fachliche Trennung selbst ist das gewünschte Ergebnis.
- Gemeinsam genutzte Kontrolloperationen müssen weiterhin der einzige Weg für Registrierung und revisionsgebundene Freigabe bleiben.

## 8. Next Step

Diese UR prüfen und nur mit der bestehenden, ausdrücklich gebundenen Freigabe bestätigen:

`Approval: UR`

Danach folgt die bestehende Brownfield Review mit Mode/Slice Decision. Diese UR allein erteilt keine Implementierungsfreigabe.

## AGDF Approval Summary (de; source=en)

- Problem: Der bisherige Intake bündelt die fachliche UR-Formulierung mit Registrierung und Gate-Steuerung. Nutzer, Coding-Agenten und Maintainer brauchen eindeutige Zuständigkeiten vom ursprünglichen Auftrag bis zur prüfbaren UR.
- Ziel: Ein eigener Skill erstellt und überarbeitet die UR aus dem Nutzerbedarf. gate-check prüft den Kontrollzustand und die Voraussetzungen; der Dispatcher routet die Tätigkeit. Der Nutzer gibt die UR frei.
- Umfang: Den UR-Skill definieren und im kanonischen Katalog aufnehmen; die Formulierung an ihn übergeben; Eingaben, Ergebnisse und Rückgabe an den Kontrollpfad festlegen; betroffene Verträge, Dokumentation und Hostprojektionen konsistent nachführen.
- Fachlicher Inhalt: Problem, Ergebnis, betroffene Nutzer, Umfang, Nicht-Ziele, Erfolgssignale, verbindliche Quellen sowie Risiken und offene Fragen klären. Annahmen kennzeichnen und nur wesentliche fehlende Informationen erfragen.
- Kontrollgrenzen: Bestehende Ziel-, Run- und Revisionsbindung sowie kanonische Registrierung und Freigabe verwenden. Genau eine UR am gebundenen Artefaktpfad; offene Klärung von Freigabebereitschaft unterscheiden. Keine selbst erteilte Zustimmung oder Implementierungsberechtigung.
- Erfolgssignale: Erstellung, Prüfung, Routing und Freigabe haben getrennte Verantwortlichkeiten. Neue und überarbeitete Entwürfe bleiben gebunden. gate-check ermittelt weiterhin die tatsächliche Bereitschaft für Approval: UR. Die anschließende Planung grenzt Katalog-, Vertrags-, Routing- und Projektionsänderungen nachvollziehbar ab.
- Nachweise: Neue UR, wesentliche fehlende Angaben, Überarbeitung, falsche und veraltete Bindung sowie Übergang zur bestehenden Freigabe prüfen. Quell-, Paket- und Protokollnachweise von frischen nativen Hostbeobachtungen unterscheiden.
- Nicht-Ziele: PRD, Design, Taskplan, Task 0, Reviews, QA, UAT, Closeout und Release in diesem Schritt nicht neu ordnen. Keine zusätzlichen Gates, parallelen Quellen, Run-Migrationen oder automatisch ausgelösten VCS- und Veröffentlichungsaktionen.
- Quellen: Kanonischer Skillkatalog, bestehender gate-check-Skill, UR-Vorlage, Gate- und Zielverträge, Core-Intake und Dispatch, kanonische Kontrolloperationen sowie die fachliche Gate-Dokumentation.
- Offene Punkte: Brownfield Review und Design klären zulässigen Aufruf und Überarbeitungspfad, Skillname und Übergabeformat. Der zusätzliche Skill muss die bisherigen Annahmen zu zehn Skills und die Anweisungsbudgets konsistent berücksichtigen. Die ursprüngliche Nutzerentscheidung und bestehende Kontrolloperationen bleiben maßgeblich.
- Entscheidung: Freigegeben wird dieser begrenzte Bedarf zur Trennung der UR-Erstellung. Danach folgt Brownfield Review mit Mode/Slice Decision; die UR-Freigabe allein erlaubt keine Implementierung.
