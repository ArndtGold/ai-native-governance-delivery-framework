# Gates und Freigaben

Ein Gate ist ein fester Entscheidungspunkt.

Der Agent hält dort an und zeigt dir,

* was bereits vorliegt,
* was noch fehlt,
* welche Entscheidung nötig ist,
* und welcher Schritt danach erlaubt ist.

Er darf eine fehlende Freigabe nicht selbst annehmen oder überspringen.

Die wichtigsten Gates sind:

* **UR:** User Requirement
* **PRD:** Product Requirements Document
* **SD:** Solution Design
* **TP:** Task und Testplan
* **QA:** Quality Assurance
* **UAT:** User Acceptance Testing

Die vollständige Gate Logik findest du unter [02 Gates](../02-gates.md).

## Deine Rolle

Du entscheidest über die fachliche Richtung und gibst die Gates frei.

Der Agent bereitet die Inhalte vor, zeigt offene Punkte und nennt den nächsten erlaubten Schritt.

| Deine Freigabe  | Was danach erlaubt ist                                                                                                 |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `Approval: UR`  | Die Anforderung ist freigegeben. Der Agent darf den bestehenden Kontext prüfen und den passenden Arbeitsweg festlegen. |
| `Approval: PRD` | Die fachlichen Anforderungen sind freigegeben. Der Agent darf daraus eine technische Lösung entwickeln.                |
| `Approval: SD`  | Das Lösungsdesign ist freigegeben. Der Agent darf den Task und Testplan erstellen.                                     |
| `Approval: TP`  | Der Task und Testplan ist freigegeben. Umsetzung und Tests dürfen beginnen.                                            |
| `Approval: QA`  | Die Qualitätsprüfung ist freigegeben. Das User Acceptance Testing darf beginnen.                                       |
| `Approval: UAT` | Die fachliche Abnahme ist dokumentiert. Der Abschluss darf vorbereitet werden.                                         |

Eine Freigabe hat immer dieses Format:

```text
Approval: <GateName>
```

Zum Beispiel:

```text
Approval: UR
```

Eine Anweisung wie `Leg los`, `Mach weiter` oder `Sieht gut aus` ersetzt keine Freigabe.

Die verbindliche Beschreibung der Gates steht im [Runtime Contract](../../plugin/meta/agdf-runtime-contract.md).

## Warum der Agent stoppt

Ein Stopp bedeutet nicht automatisch, dass ein Fehler aufgetreten ist.

Meist fehlt eine Entscheidung oder eine Voraussetzung.

Typische Gründe sind:

* Die aktuelle Anforderung wurde noch nicht freigegeben.
* Es sind mehrere Runs aktiv und der passende Run wurde noch nicht ausgewählt.
* Der QA Bericht ist positiv, aber `Approval: QA` fehlt.
* Ein Artefakt enthält noch ein offenes Risiko.
* Eine notwendige Analyse oder Context Graph Aktion ist noch nicht abgeschlossen.

Der Agent soll dir immer sagen,

1. warum er stoppt,
2. was noch fehlt,
3. und was als Nächstes erlaubt ist.

Stimmt der aktuelle Stand, gibst du das Gate mit der passenden Approval Zeile frei.

Stimmt der Stand noch nicht, beschreibst du die gewünschte Korrektur. Der Agent bleibt im aktuellen Gate und überarbeitet die Inhalte.

## QA ist nicht UAT

**Quality Assurance prüft die Lieferung.**

Dabei wird bewertet, ob die geplanten Änderungen umgesetzt, getestet und ausreichend nachgewiesen wurden.

**User Acceptance Testing prüft den Nutzen.**

Dabei entscheidest du aus fachlicher oder menschlicher Sicht, ob das Ergebnis die gewünschte Anforderung erfüllt.

Ein erfolgreicher Testlauf reicht deshalb nicht automatisch für:

```text
Approval: QA
```

und auch nicht für:

```text
Approval: UAT
```

Beide Freigaben bleiben bewusste Entscheidungen.

Weiter: [Typische Arbeitsabläufe](03-typische-arbeitsablaeufe.md).


Weiter: [Typische Arbeitsabläufe](03-typische-arbeitsablaeufe.md).
