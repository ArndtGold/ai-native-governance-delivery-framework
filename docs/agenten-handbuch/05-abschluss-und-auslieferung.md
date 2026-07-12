# Abschluss und Auslieferung

Ein grüner Testlauf ist ein wichtiger Nachweis, aber kein automatischer Abschluss. AGDF trennt
Implementierung, Qualitätsentscheidung, Nutzerakzeptanz und Delivery-Aktionen.

## Nach der Umsetzung

Der Agent sammelt Tests, Reviews und die Abdeckung des Task- und Testplans (TP). Danach entscheidet
der **Quality-Assurance-Gate (QA)**:

- `pass`: Die geplante Lieferung ist mit ausreichender Evidenz umgesetzt.
- `revise`: Es gibt behebbare Lücken oder fehlende Evidenz.
- `block`: Ein harter Widerspruch, ein Sicherheits-, SoT- oder Qualitätsproblem verhindert den Schritt.

Auch bei QA `pass` bleibt deine explizite `Approval: QA` nötig, bevor die **User Acceptance Testing
(UAT)** geöffnet wird. Die ausführliche Einordnung steht in [02 – Gates](../02-gates.md).

## User Acceptance Testing (UAT)

In UAT prüfst du das Ergebnis aus Anwendersicht. Gute UAT-Rückmeldungen beziehen sich auf die
vereinbarten Akzeptanzkriterien, etwa:

```text
Eine zur manuellen Prüfung markierte Echtzeitüberweisung belastet das Tageslimit
noch nicht. Eine später freigegebene Zahlung wird genau einmal gezählt.
Approval: UAT
```

Wenn etwas nicht passt, beschreibe den Befund. Der Agent bleibt nachvollziehbar im passenden
Arbeitszustand, statt einen Abschluss zu behaupten.

## Git und Release

Commit, Push, Pull Request und Release sind eigenständige Handlungen. Ein QA- oder UAT-Status erteilt
nicht automatisch die Erlaubnis, sie auszuführen. Gib dafür eine klare zusätzliche Anweisung, wenn du
sie wirklich möchtest.

Weiter: [Fehlerbehebung](06-fehlerbehebung.md).
