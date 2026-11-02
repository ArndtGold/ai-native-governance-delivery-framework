# Methodische Herstellerreferenz: OpenCode

Status: method_basis
Date: 2026-07-28
Host: OpenCode `1.18.3`

## Offizielle Quellen

- OpenCode CLI: <https://dev.opencode.ai/docs/cli/>
- OpenCode Models: <https://opencode.ai/docs/models>
- OpenCode Agents: <https://opencode.ai/docs/agents/>

## Abgeleitete Testmethode

Die Herstellerdokumentation beschreibt `opencode run` als nicht-interaktiven Ausführungspfad,
die explizite Modellauswahl über `--model provider/model` und Agent-spezifische
Permission-Overrides. Daraus wurde für die erneute Fallevidenz folgende Methode abgeleitet:

- jeder Fall wird einzeln und seriell mit `opencode run` ausgeführt;
- das Modell wird explizit als `opencode/glm-5.2` gesetzt;
- der vorhandene Agent `agdf-evaluator` bleibt mit terminalem Tool-Deny aktiv;
- jeder Fall verwendet einen separaten synthetischen Wegwerf-Git-Workspace;
- die Antwort wird als angefordertes JSON ausgewertet; ein reiner Markdown-Codezaun wird vor
  dem JSON-Parsing entfernt, ohne den Inhalt umzudeuten;
- Vorher-/Nachher-Git-Status wird je Fall verglichen.

## Evidenzgrenze

Diese Dokumentation ist keine Live-Host-Evidenz und ersetzt keinen Fallnachweis. Sie begründet
lediglich den verwendeten Herstellerpfad. Die eigentliche Conformance-Klassifikation stammt aus
den seriellen, authentifizierten OpenCode-Beobachtungen im
`OPENCODE_HEADLESS_BUNDLE.md`.

Die bei parallelen Versuchen beobachteten Timeouts werden nicht als dokumentierte
Herstellereigenschaft oder Produkt-Gap behauptet. Die serielle Ausführung ist eine konservative
Testentscheidung für diese konkrete Umgebung.
