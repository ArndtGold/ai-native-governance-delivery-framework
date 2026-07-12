# Schnellstart

Du musst keine AGDF Befehle lernen. Beschreibe dem Coding Agent einfach dein Ziel. Der Agent analysiert die Aufgabe, erstellt die benötigten Artefakte und fragt dich an den wichtigen Entscheidungspunkten nach einer Freigabe.

Du entscheidest bewusst, wann ein Schritt wirklich freigegeben wird.

## Ein vollständiges Beispiel

Damit du einen vollständigen Ablauf einer fachlich kritischen Brownfield Änderung siehst, nutzen wir das   [Banking Beispiel](../../examples/sample-banking-flow.md).

Das Beispiel zeigt nachvollziehbar,

* warum eine zur manuellen Prüfung markierte Echtzeitüberweisung das Tageslimit noch nicht belasten darf,
* welche bestehenden Funktionen davon betroffen sind,
* wie der Agent die Auswirkungen analysiert,
* und wie Tests die Fachregel absichern.

Die Unterhaltung beginnt mit einer fachlichen Anforderung:

```text
Dein Prompt:
> Eine zur manuellen Prüfung markierte Echtzeitüberweisung darf das Tageslimit noch nicht belasten.

Coding Agent:
Erstellt oder aktualisiert die User Requirement (UR), dokumentiert offene Fragen und fordert die Freigabe der UR an.

Dein Prompt:
> Approval: UR
```

Eine Anweisung wie `Leg los` oder `Mach weiter` startet zwar die Arbeit des Agents, ersetzt aber niemals eine Gate Freigabe.

Eine Freigabe hat immer dieses Format:

```text
Approval: <GateName>
```

Beispiele:

```text
Approval: UR
Approval: PRD
Approval: SD
Approval: TP
Approval: QA
Approval: UAT
```

## Was der Coding Agent übernimmt

Sobald ein Gate freigegeben wurde, kann der Coding Agent

* bestehende Artefakte analysieren,
* Anforderungen ergänzen,
* Entwürfe erstellen,
* Code implementieren,
* Tests schreiben und ausführen,
* Reviews vorbereiten,
* sowie Nachweise dokumentieren.

Er entscheidet jedoch niemals selbst, dass ein menschliches Gate bestanden wurde. Diese Entscheidung bleibt immer beim Menschen.

Dadurch bleiben Freigaben und Entscheidungen dauerhaft nachvollziehbar und liegen nicht nur im Chat, sondern als Artefakte im Repository, in der Regel unter `.agdf/control/`.

## Typischer Ablauf

Eine strukturierte Änderung durchläuft normalerweise folgende Schritte:

```text
Wunsch
→ User Requirement (UR)
→ Brownfield Review
→ Product Requirements Document (PRD)
→ Solution Design (SD)
→ Task und Testplan (TP)
→ Umsetzung und Tests
→ Quality Assurance (QA)
→ User Acceptance Testing (UAT)
```

Nicht jede Änderung benötigt jeden Schritt in voller Tiefe.

Nach dem Brownfield Review kann der Agent kleine Änderungen als **Quick Task** einstufen. Größere oder risikoreiche Änderungen bleiben im vollständigen Prozess. Die Entscheidung wird vom Agenten mit einer Begründung dokumentiert.

Die vollständige Bedeutung und Reihenfolge der Gates erklärt [02 – Gates](../02-gates.md).

Weiter: [Gates und Freigaben](02-gates-und-freigaben.md).
