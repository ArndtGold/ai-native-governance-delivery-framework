# UR: Lesende AGDF-Operationen über MCP statt Shell

Status: draft
Gate: UR
Gate approval: open
Date: 2026-09-29
Owner: Arndt Gold

## 1. Problem

Der AGDF-MCP-Server exponiert nur `agdf_dispatch`. Alle Folgeschritte eines Runs laufen über einzelne Shell-Aufrufe der CLI: `gate-check --json`, `doctor --json`, `delivery-map --json`, `contract --module`, `run-present`. Skills und Verträge nennen diese Kommandos rund 40 Mal. Jeder Shell-Aufruf ist pfadbasiert zu berechtigen, scheitert an Host-spezifischen Formen wie `&`, leidet unter Windows-Quoting und ist auf eine 240 Zeichen lange Argument-Grammatik gedeckelt. Der Small-Path-Baseline vom 2026-09-25 zeigt 27 von 45 Schritten als Zustandsbuchhaltung und Troubleshooting; die MCP-Probe zeigt für den Dispatch 3 Turns und 0,28 USD ohne Denial gegenüber 4 Turns, 0,57 USD und einem Denial über die Shell. Zusätzlich muss der Agent nach einem `presentation_required`-Ergebnis erst ein weiteres Kommando ausführen, bevor er den Freigabetext überhaupt sehen kann.

## 2. Goal

Alle lesenden Kontroll-Operationen eines Runs sind für Hosts, die den AGDF-MCP-Server anbieten, über eine kleine, typisierte Tool-Oberfläche erreichbar, ohne dass eine Shell nötig ist. Ein Dispatch-Ergebnis, das eine Freigabepräsentation verlangt, macht den exakten Prüftext ohne zusätzlichen Schritt sichtbar. Die Shell-Binding bleibt der deklarierte Fallback für Hosts ohne MCP. Der Kontrollzustand wird durch diesen Slice über MCP nicht geschrieben.

## 3. Scope

- Ein lesendes MCP-Tool mit einer `operation`-Auswahl, das die heutigen Read-only-Kommandos abdeckt: Doctor, Gate-Check mit Statuskarte, Delivery-Map und Vertragsmodule. Es liefert dieselben strukturierten Ergebnisse und denselben kanonischen Markdown-Text wie die CLI.
- Das Dispatch-Ergebnis `presentation_required` enthält den kanonischen Prüftext der aktuellen Gate-Präsentation, sodass der Agent ihn direkt zeigen kann; die verbindliche Bindung an eine `presentation_id` und die Freigabeverarbeitung bleiben unverändert.
- Skills und Verträge steuern lesende Operationen MCP-first an, wenn der Host das Tool listet, und fallen ansonsten auf die bestehende Binding zurück.
- Die Tool-Beschreibungen bleiben knapp, weil jedes Schema in jeder Session Kontext kostet; das gate-check-Budget von 6900 Bytes und die Fingerprint-Locks bleiben eingehalten.
- Die bestehende Lese-Grenze des MCP-Servers (`control-read-boundary`) gilt für jede neue Operation.

## 4. Non-Goals

- Schreibende Operationen über MCP: `run-create`, `run-update`, `run-step`, `run-approve` und die persistierende `run-present`-Bindung bleiben in diesem Slice Shell-only.
- Request-Activation-Regeln, Zielauswahl, Gate-Übergänge, Approval-Semantik oder Run-Auswahl ändern.
- Host-Installer, MCP-Lifecycle-Adapter oder Codex-Freigaben pro Aufruf ändern; Veröffentlichung von `@agdf/mcp-server` auf npm.
- Repository-Arbeit wie Edits, Tests oder Git hinter MCP legen.

## 5. Acceptance Signals

- Für jede lesende Operation liefert das MCP-Tool ein Ergebnis, das byteweise dem `--json`-Ergebnis der entsprechenden CLI entspricht, inklusive Statuskarte und Status-Präsentation.
- Ein unbekannter oder schreibender `operation`-Wert wird vom Schema abgelehnt; kein Aufruf des Tools verändert eine Datei unter `.agdf/control`.
- Ein `presentation_required`-Dispatch zeigt den exakten Prüftext der Gate-Präsentation; sein Digest entspricht dem der kanonischen Präsentation, und ohne gültige `presentation_id` ist keine Freigabe bindbar.
- Skills und Verträge enthalten für lesende Operationen keinen Shell-Aufruf mehr als primären Weg; der Fallback bleibt als deklarierter Pfad vorhanden.
- Instruction-Footprint, Smoke-Test und Skill-Evals bestehen; das gate-check-Budget wird nicht überschritten.
- Der Small-Path-Baseline mit MCP zeigt weniger Schritte als die 45 der Messung vom 2026-09-25; das Ziel sind unter 35 Schritte.
- Jede neue Tool-Antwort bleibt `authorizes: false`.

## 6. Existing Source Of Truth

- `agdf-mcp-server/src/server.js` und `create-agdf/lib/mcp-dispatch-runtime.js`
- `create-agdf/lib/skill-dispatch/contract.js` und `create-agdf/lib/skill-dispatch/service.js`
- `create-agdf/lib/cli/command-registry.js` und `create-agdf/lib/cli/application.js`
- `create-agdf/lib/control-read-boundary.js`
- `plugin/meta/contracts/interaction.md`, `plugin/meta/contracts/gate-transition.md` und die zehn Skills unter `plugin/skills/`
- Memos zu MCP-Probe und Small-Path-Baseline vom 2026-09-25

## 7. Risks And Unknowns

- Die Argumentprüfung der lesenden Kommandos liegt heute in der CLI; sie muss als aufrufbare Funktionen herausgelöst werden, ohne einen zweiten Codepfad zu schaffen.
- Ob der Prüftext im Dispatch-Ergebnis ohne persistierte Präsentation gezeigt werden darf oder ob die Vorschau eine Bindung voraussetzt, muss Brownfield Review anhand des Interaktionsvertrags klären.
- Zusätzliche Tool-Schemata erhöhen den Kontext jeder Session; der Nutzen muss gegen das Payload-Budget gemessen werden.
- Codex verlangt pro MCP-Aufruf eine Freigabe; der Schrittgewinn kann dort geringer ausfallen als unter Claude.
- Copilot und OpenCode haben keine belegte MCP-Nutzung; der Fallback muss dort weiterhin vollständig funktionieren.

## 8. Next Step

Diese UR prüfen und ausschließlich mit folgender Antwort freigeben:

`Approval: UR`
