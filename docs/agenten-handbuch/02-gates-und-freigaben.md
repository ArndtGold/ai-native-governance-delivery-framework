# Gates und Freigaben

Ein Gate ist ein bewusster Haltepunkt. Der Agent zeigt, welche Information, welches Artefakt oder
welche Freigabe fehlt, statt den nächsten Schritt plausibel zu erraten.

Die Begriffe bedeuten: **User Requirement (UR)**, **Product Requirements Document (PRD)**,
**Solution Design (SD)**, **Task- und Testplan (TP)**, **Quality Assurance (QA)** und
**User Acceptance Testing (UAT)**. Für die vollständige Gate-Logik siehe [02 – Gates](../02-gates.md).

## Deine Rolle

Du entscheidest über fachliche Richtung und Freigaben. Der Agent macht den Zustand transparent und
bereitet den jeweils erlaubten nächsten Schritt vor.

| Deine Entscheidung | Wirkung |
|---|---|
| `Approval: UR` | Die User Requirement ist freigegeben; der bestehende Kontext darf bewertet und der Arbeitsmodus festgelegt werden. |
| `Approval: PRD` | Das Product Requirements Document ist freigegeben; die fachlichen Anforderungen dürfen in eine Lösung überführt werden. |
| `Approval: SD` | Das Solution Design ist freigegeben; der Task- und Testplan darf entstehen. |
| `Approval: TP` | Der Task- und Testplan ist freigegeben; Umsetzung und Tests dürfen nach der Vorbereitungsanalyse beginnen. |
| `Approval: QA` | Ein bestandener Quality-Assurance-Bericht öffnet User Acceptance Testing. |
| `Approval: UAT` | Das User Acceptance Testing ist festgehalten; der Abschluss kann vorbereitet werden. |

Die Tabelle ist eine Bedienhilfe. Die vollständige und verbindliche Beschreibung steht im
[Runtime Contract](../../plugin/meta/agdf-runtime-contract.md).

## Warum ein Agent stoppt

Ein Stopp ist kein Fehler, wenn eine Entscheidung fehlt. Häufige Beispiele:

- Die UR ist noch nicht freigegeben.
- Mehrere Runs sind aktiv und es fehlt die Auswahl.
- Ein QA-Bericht ist zwar positiv, aber `Approval: QA` fehlt noch.
- Ein Artefakt nennt eine offene Risiko- oder Context-Graph-Aktion.

Lies zuerst die vom Agenten genannte fehlende Freigabe und den nächsten erlaubten Schritt. Wenn die
Richtung stimmt, antworte mit der exakten Approval-Zeile. Wenn nicht, beschreibe die gewünschte
Korrektur; der Agent bleibt im aktuellen Gate und überarbeitet den Entwurf.

## Quality Assurance (QA) ist nicht User Acceptance Testing (UAT)

Quality Assurance bewertet, ob die geplante Lieferung nachweisbar umgesetzt wurde. User Acceptance
Testing ist deine Akzeptanz aus
Nutzersicht. Deshalb genügt ein grüner Testlauf weder für `Approval: QA` noch für `Approval: UAT`.

Weiter: [Typische Arbeitsabläufe](03-typische-arbeitsablaeufe.md).
