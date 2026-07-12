# Schnellstart

Du musst für einen normalen Auftrag keine AGDF-CLI-Befehle lernen. Beschreibe dem Coding-Agenten das
Ziel, prüfe den entstandenen Arbeitsrahmen und gib Freigaben bewusst, wenn du den nächsten Schritt
wirklich erlauben möchtest.

## Ein vollständiger Fall

Nutze das vorhandene [Banking-Beispiel](../../examples/sample-banking-flow.md), wenn du den Ablauf
einer fachlich kritischen Brownfield-Änderung vollständig sehen möchtest. Dort wird nachvollziehbar,
warum eine zur manuellen Prüfung markierte Echtzeitüberweisung das Tageslimit noch nicht belasten darf,
welche bestehenden Pfade betroffen sind und wie Tests die Fachregel absichern.

Im Agentengespräch beginnt derselbe Weg mit einer präzisen Absicht und einer expliziten Freigabe:

```text
Dein Prompt: > Eine zur manuellen Prüfung markierte Echtzeitüberweisung darf das Tageslimit
    noch nicht belasten.

Coding-Agent: Erstellt oder aktualisiert die **User Requirement (UR)**, benennt offene Fragen und
        fordert Approval: UR an.

Dein Prompt: > Approval: UR
```

Eine konkrete Arbeitsanweisung wie „leg los“ zeigt dem Agenten, dass er arbeiten soll. Sie ersetzt
aber keine Gate-Freigabe. Eine Freigabe hat immer die Form:

```text
Approval: <GateName>
```

Beispiele sind `Approval: UR`, `Approval: PRD`, `Approval: SD`, `Approval: TP`, `Approval: QA` und
`Approval: UAT`.

## Was der Coding-Agent selbst erledigt

Innerhalb eines geöffneten Schritts kann der Coding-Agent analysieren, vorhandene Artefakte lesen,
Entwürfe erstellen, implementieren, testen und Reviews vorbereiten. Er darf aber nicht selbst
entscheiden, dass ein menschliches Gate passiert ist.

Das ist nützlich, weil die Unterhaltung dadurch nicht zur einzigen Quelle für Entscheidungen wird.
Wichtige Ergebnisse und Nachweise liegen im Repository, meist unter `.agdf/control/`.

## Der Weg bis User Acceptance Testing (UAT)

Bei einer strukturierten Lieferung entsteht gewöhnlich diese Folge. Das Banking-Beispiel zeigt die
fachliche Seite von UR bis QA; die folgenden Handbuchkapitel ergänzen die Bedienperspektive bis UAT:

```text
Wunsch → User Requirement (UR) → Brownfield Review → Product Requirements Document (PRD)
→ Solution Design (SD) → Task- und Testplan (TP) → Umsetzung/Tests → Quality Assurance (QA)
→ User Acceptance Testing (UAT)
```

Nicht jede Aufgabe durchläuft jeden Schritt in voller Tiefe. Nach dem frühen Brownfield Review kann
eine kleine Aufgabe als Quick Task geführt werden. Größere oder risikoreichere Änderungen bleiben
strukturiert. Die konkrete Entscheidung dokumentiert der Agent mit Begründung.

Die vollständige Bedeutung und Reihenfolge der Gates erklärt [02 – Gates](../02-gates.md).

Weiter: [Gates und Freigaben](02-gates-und-freigaben.md).
