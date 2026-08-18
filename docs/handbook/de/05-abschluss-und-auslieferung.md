# Abschluss und Auslieferung

Ein erfolgreicher Testlauf bedeutet noch nicht, dass die Arbeit abgeschlossen oder auslieferbar ist.
AGDF trennt Umsetzung, Reviews, Quality Assurance, fachliche Abnahme und Auslieferung.

## Nach der Umsetzung

Für eine strukturierte Lieferung dokumentiert CD+Tests:

- welche Aufgaben umgesetzt wurden;
- welche Dateien oder Artefakte betroffen sind;
- welche Tests und Prüfungen liefen;
- welche Nachweise sichtbar sind;
- was nicht geprüft wurde;
- welche Risiken verbleiben.

Danach folgen die für den Scope erforderlichen Reviews. Der Code Review ist bei Codeänderungen ein
verpflichtender interner Schritt. Task Plan Review und Clean Implementation Review liefern weitere
Evidenz zu Planabdeckung und Lösungsgüte. Keiner dieser Reviews entscheidet allein QA.

## Quality Assurance

`qa-gate` ist der einzige Eigentümer der endgültigen QA-Entscheidung:

| Ergebnis | Bedeutung |
|---|---|
| `pass` | Planabdeckung, Lösungsgüte, Reviews und Evidenz reichen für den nächsten Gate-Entscheid aus. |
| `revise` | Eine korrigierbare Lücke oder fehlende Evidenz muss an den zuständigen Schritt zurückgeführt werden. |
| `block` | Eine harte Voraussetzung oder ein kritisches Risiko verhindert den Übergang. |

Ein QA-Bericht mit `pass` ist noch keine menschliche Freigabe. Erst das exakte

```text
Approval: QA
```

öffnet das UAT. Ein `revise`- oder `block`-Befund wird an den frühesten zuständigen Eigentümer
zurückgeführt. Das kann UR, PRD, SD, TP, CD+Tests oder eine Evidence Obligation sein.

## User Acceptance Testing

Im UAT prüfst du das Ergebnis aus Sicht der Nutzer und des vereinbarten Zwecks. Repository-Tests
oder ein QA-Bericht ersetzen diese Beobachtung nicht.

Beispiel:

```text
Eine zur manuellen Prüfung markierte Echtzeitüberweisung belastet das Tageslimit
noch nicht. Eine später freigegebene Zahlung wird genau einmal gezählt.
```

Entspricht das beobachtete Ergebnis der Anforderung, kannst du exakt freigeben:

```text
Approval: UAT
```

Passt das Ergebnis nicht, dokumentierst du den beobachteten Befund. Der Agent ordnet ihn dem
frühesten betroffenen Artefakt, der Umsetzung oder einer fehlenden Evidenz zu. Er behauptet nicht
selbst, dass UAT bestanden wurde.

## Orchestration Report und Delivery Closeout

Nach dem erforderlichen QA-/UAT-Weg fasst der Orchestration Report den Lauf zusammen. Er nennt
Gate-Status, gelieferten und bewusst nicht gelieferten Scope, Planabdeckung, Lösungsgüte, Evidenz,
Risiken und den nächsten erlaubten Schritt.

Delivery Closeout bereitet den operativen Git-Handoff vor. Weder Report noch Closeout führen
automatisch einen Commit, Push, Pull Request, Release, Deployment oder eine externe Veröffentlichung
aus.

## Git und Release

Git- und Release-Aktionen benötigen einen ausdrücklichen Auftrag mit klarem Ziel. Das gilt auch nach
erfolgreicher QA und UAT für:

- Staging;
- Commit;
- Push;
- Pull Request;
- Tag oder Release;
- Deployment, Plugin-Einreichung oder Veröffentlichung.

Repository-Evidenz beweist keine externe Ausführung. Ein lokaler Build ist kein Deployment, ein
Plugin-Bundle keine Installation und eine vorbereitete Einreichung keine Veröffentlichung.

Weiter: [Fehlerbehebung](06-fehlerbehebung.md).
