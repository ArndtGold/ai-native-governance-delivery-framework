# Schutzkorrektur: gebundene Quellenrevision

Status: Vorschau; noch nicht angewendet

Die gemeinsame Sandbox wurde ohne Modellaufruf auf diesem Host geprüft. Sie blockiert Schreiböffnungen am Original-Repository und an config.toml, erlaubt eigene temporäre Testdateien und lässt Codex 0.163.0 den bestehenden ChatGPT-Anmeldestatus erkennen. Die drei globalen Einstellungsdateien und der gesamte Original-ROOT stehen weiterhin im Schutzprofil; ihre vorhandenen Hashes bleiben unverändert. Die T7-Aufgabe wurde dabei nicht ausgeführt.

## Auswirkung dieser einen Revision

- UR und PRD einschließlich ihrer Freigaben bleiben exakt erhalten.
- Die fehlerhafte Schutzkomposition in SD und TP wird zur Überarbeitung geöffnet. Neue SD-/TP-Freigaben folgen erst für die korrigierten Dokumente.
- Der vorhandene Code, bestandene Tests und alle ursprünglichen Beobachtungen bleiben erhalten. Die bisherige Erfüllung betroffener oder nicht eindeutig zugeordneter Analysen und Nachweise wird archiviert und neu bewertet. Deshalb folgt zuerst die erforderliche Brownfield-Neubewertung, danach die erneuerte SD und TP.
- Modell gpt-6.1-sol, Reasoning low, dieselben zwei ungenutzten Modellsitzungen, Aufgabe, strenge Prüfer und alle MCP-/Copilot-Grenzen bleiben unverändert.
- Diese Quellenrevision genehmigt selbst keine Implementierung, Modellsitzung, QA, UAT oder Git-Aktion.

Die Vorschau wurde vom kanonischen Owner akzeptiert. Aktueller Run-Zustand bleibt unverändert bei CD+Tests, Revision 13.

## Exakte technische Bindung

- Vorschau-Digest: sha256:30f5c27006431bc6e1f3b1b190a1f4e49598b97075b0f4bbac463ce3ce7eb519
- Archiv-Digest: sha256:4106362b77d2591fbb4e3d4ffdf3b87090ff7f780edcc1a3772801c2157476cc
- Vorgang: b1c5f54c-c386-4b49-8a11-ed0a925852a4

```text
Apply source revision: mcp-codex-guided-inspection-20261025-01 369522fc-4274-481b-8897-6d0cf0ae9469 b1c5f54c-c386-4b49-8a11-ed0a925852a4 SD sha256:30f5c27006431bc6e1f3b1b190a1f4e49598b97075b0f4bbac463ce3ce7eb519
```

Mit der ausdrücklichen Antwort **Quellenrevision anwenden** bestätigst du die Anwendung genau dieser vorgelegten, gebundenen Vorschau. Die technischen IDs sind bereits ermittelt; es ist keine Auswahl oder neue Angabe erforderlich. Der Owner prüft vor Anwendung erneut Quelle, Revision und Digest.
