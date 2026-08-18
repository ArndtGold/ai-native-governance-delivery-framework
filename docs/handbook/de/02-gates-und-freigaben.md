# Gates und Freigaben

Ein Gate ist ein bewusster Entscheidungspunkt. Der Agent hält dort an und zeigt dir:

- was bereits vorliegt;
- was noch fehlt;
- welche Entscheidung nötig ist;
- welcher Schritt danach erlaubt ist;
- welche Arbeit weiterhin verboten bleibt.

Eine Freigabe und das zugehörige Artefakt sind zwei getrennte Voraussetzungen. Eine Approval-Zeile
allein öffnet den nächsten Schritt nicht, wenn das erforderliche Artefakt fehlt oder nicht belastbar
ist.

## Nutzer-Gates und interne Schritte

Die Nutzer-Gates sind:

- **UR:** User Requirement
- **PRD:** Product Requirements Document
- **SD:** Solution Design
- **TP:** Task- und Testplan
- **QA:** Quality Assurance
- **UAT:** User Acceptance Testing

Dazwischen liegen interne Pflichtschritte. Dazu gehören je nach Pfad Brownfield Review,
Mode/Slice-Entscheidung, Pre-Implementation Brownfield Analysis, CD+Tests, verpflichtender Code
Review und weitere Qualitätsreviews. Diese Schritte benötigen keine eigene Approval-Zeile, dürfen
aber nicht still übersprungen werden.

## Deine Rolle

Du entscheidest über Ziel, fachliche Richtung und Nutzer-Gates. Der Agent bereitet Inhalte und
Nachweise vor, bewertet den aktuellen Zustand und nennt den nächsten erlaubten Schritt.

| Deine Freigabe | Was danach erlaubt ist |
|---|---|
| `Approval: UR` | Brownfield Review und begründete Auswahl des passenden Delivery-Pfads. Noch keine Implementierung. |
| `Approval: PRD` | Erstellung des Solution Designs. Noch keine Implementierung. |
| `Approval: SD` | Erstellung des Task- und Testplans. Noch keine Implementierung. |
| `Approval: TP` | Pre-Implementation Brownfield Analysis. Erst ein tragfähiges Ergebnis erlaubt anschließend CD+Tests. |
| `Approval: QA` | Vorbereitung des UAT, wenn der zugehörige QA-Bericht `pass` ist. Noch keine Veröffentlichung. |
| `Approval: UAT` | Orchestration Report und Delivery Closeout dürfen vorbereitet werden. Git- und Release-Aktionen bleiben separat beauftragt. |

Die verbindliche Übergangslogik steht im
[Runtime Contract](../../../plugin/meta/agdf-runtime-contract.md).

## Exakte Freigabe

Eine Freigabe hat immer dieses Format:

```text
Approval: <GateName>
```

Zum Beispiel:

```text
Approval: UR
```

Zusätze verändern den Wert. `Approval: UR (Recommended)` ist daher keine gültige Freigabe. Eine
Anweisung wie `Leg los`, `Mach weiter`, `Approved` oder `Sieht gut aus` ersetzt ebenfalls keine
Approval-Zeile.

Eine Oberfläche darf eine Auswahlhilfe anzeigen. Autoritativ bleibt der unveränderte exakte Wert,
der gegen den aktuell ausgewählten Run, das aktuelle Gate und die Artefaktrevision geprüft wird.

## Warum der Agent stoppt

Ein Stopp ist häufig eine korrekte Schutzreaktion und kein technischer Fehler. Typische Gründe sind:

- Eine Anforderung oder ein Gate-Artefakt ist noch nicht freigegeben.
- Mehrere Runs sind aktiv und das gewünschte Vorhaben ist nicht eindeutig.
- Ein QA-Bericht ist `pass`, aber `Approval: QA` fehlt.
- Ein Review enthält einen offenen Befund.
- Ein notwendiger Nachweis oder eine Context-Graph-Aktion fehlt.
- Installation, Repository-Aktivierung oder Versionsstand sind nicht belastbar nachgewiesen.

Der Agent soll den Blocker, den fehlenden Nachweis und genau einen erlaubten nächsten Schritt nennen.

## Überarbeitung und Rückrouting

Wenn ein Entwurf nicht passt, beschreibst du die gewünschte Korrektur statt das Gate freizugeben.
Der Befund wird an den frühesten zuständigen Schritt zurückgeführt:

- fehlende oder widersprüchliche Produktanforderung → PRD, bei geändertem Nutzerziel gegebenenfalls UR;
- fehlende Architektur- oder Eigentümerentscheidung → SD;
- fehlende Aufgabe, Prüfung oder Evidenzplanung → TP;
- nicht erfüllte Umsetzung → CD+Tests;
- fehlender Nachweis → zuständige Evidence Obligation.

Der Agent darf einen Befund nicht still in einem späteren Gate reparieren oder neu klassifizieren.

## QA ist nicht UAT

**Quality Assurance prüft die Lieferung.** `qa-gate` entscheidet genau `pass`, `revise` oder
`block`. Ein grüner Testlauf allein reicht nicht. Planabdeckung, Lösungsgüte, Code Review,
Brownfield-Fit und relevante sichtbare Evidenz müssen zusammenpassen.

**User Acceptance Testing prüft den Nutzen.** Dabei entscheidest du aus fachlicher oder menschlicher
Sicht, ob das Ergebnis die gewünschte Anforderung erfüllt. Eine erfolgreiche QA-Entscheidung ersetzt
diese Abnahme nicht.

QA-Bericht und `Approval: QA` sind getrennt. Ebenso bleibt `Approval: UAT` eine bewusste menschliche
Entscheidung.

Weiter: [Typische Arbeitsabläufe](03-typische-arbeitsablaeufe.md).
