# QA Gate: Geführte MCP-Aktivierung während der AGDF-Installation

- run: `agdf-guided-mcp-activation`
- revision: 4
- date: 2026-09-09
- decision_owner: `qa-gate`
- decision: `pass`
- decisive_reason: TP Revision 2 ist vollständig umgesetzt; 28/28 Aufgaben und 13/13 Kriterien sind mit aktueller Repository-, Paket- und Protokollevidenz belegt, Brownfield-, Clean- und Code-Review bestehen, der Context Graph ist reconciled und kein normalisiertes Finding bleibt offen.
- required_next_step: Exakte Freigabe `Approval: QA` für Run-Revision `AF703D59-0686-4024-864D-4D7DDF15C36C` anfordern. UAT, Release und VCS-Aktionen bleiben bis dahin gesperrt.
- authorizes: `false`

QA Report Revision 3 und seine frühere Freigabe gelten ausschließlich für TP Revision 1. Dieser
Bericht entscheidet neu aus der freigegebenen und implementierten PRD-, SD- und TP-Revision 2.

## Quality Readiness

| Dimension | Quelle | Ergebnis | Entscheidender Nachweis |
|---|---|---|---|
| Plan coverage | `task-plan-review` | `pass` | Revision 4: 28/28 Aufgaben `fully_done`, 13/13 Kriterien `done`, alle anwendbaren UX-Fidelity-Zeilen `fulfilled`. |
| Solution integrity | `clean-implementation-review` | `pass` | Revision 4: bestehende Setup-, MCP-, Consent-, Locale- und Wrapper-Owner bleiben singular; keine parallele Zustands- oder Prioritätsarchitektur. |
| Code quality | `code-review` | `pass` | Revision 5: Pfad-, Scope-, Prioritäts-, Nullmutations-, Reihenfolge-, Sprach- und Kompatibilitätsgrenzen im tatsächlichen Diff geprüft; kein offenes Finding. |
| QA decision | `qa-gate`, alleiniger Entscheidungs-Owner | `pass` | Aktuelle Artefaktkette, serieller Gesamtsmoke, Dokumentation und Context Graph sind für den freigegebenen Repository-Scope vollständig. |

## QA Gate

- decision: `pass`
- evidence: Approved TP Revision 2; Brownfield Analysis Revision 2 `pass`; CD+Tests Revision 5; Task Plan Review Revision 4 `pass`; Clean Implementation Review Revision 4 `pass`; Code Review Revision 5 `pass`; Dual-Scope-, Interaction-, CLI-, Wrapper-, Lifecycle-, Locale-, Paket- und Sicherheitstests; vollständiger serieller Smoke; Runtime Integrity; MCP-Protokolltests; `npm audit`; `git diff --check`; Context Graph reconciled.
- missing_evidence: Direkt installierte und frisch gestartete Setup-Reisen für Codex, Claude Code, GitHub Copilot und OpenCode, native Windows-Ausführung sowie menschliche UAT GMA-U01 bis GMA-U09 bleiben `unverified`.
- risks: Native Hostversionen können abweichende Berechtigungs-, Discovery- oder Darstellungszustände zeigen. Diese Lücken begrenzen Host- und Supportaussagen. Sie blockieren die Repository-QA nicht, weil TP Revision 2 diese Spuren ausdrücklich nach QA trennt und kein Ergebnis geladenes Hostverhalten behauptet.
- required_next_step: Exakt `Approval: QA` für diesen Run und diese Revision anfordern. Danach darf UAT vorbereitet und ausgeführt werden; Release bleibt gesperrt.
- impact_codes: `GMCP-01` bis `GMCP-20`; `AC-01` bis `AC-13`

## Nachweis gegen TP Revision 2

| Prüfbereich | Ergebnis | Evidenzgrenze |
|---|---|---|
| Aufgaben und Kriterien | pass | 28/28 Aufgaben vollständig, 13/13 Kriterien erledigt. |
| Interaktive Entscheidungen | pass | Setup- und Scope-Auswahl sind getrennt, ohne Default, mit Back, Retry, EOF und Nullmutation. |
| Dual-Scope-Preflight | pass | Projekt und User werden read-only mit Status, Pfad, Quelle, Verfügbarkeit, Blocker und Entfernung geprüft. |
| Native Priorität | pass | Projekt-Override sperrt nur User; ein sicherer Project-Scope bleibt auswählbar; Prioritätssemantik stammt vom Adapter. |
| Gewählte Mutation | pass | Exakte Aufrufzählung beweist nur `mcp.enable.<selected_scope>`. |
| Lokaler Aufrufkontext | pass | `INIT_CWD`/`process.cwd()` wird vor Vorbereitung validiert und per realpath samt Quelle transportiert. |
| Fehlergrenze | pass | Relativ, fehlend, Datei und leer stoppen mit stabilem Code vor `release:prepare`. |
| Sprache und Darstellung | pass | Text und JSON trennen Invocation, Scope, Registrierungspfad und effektive Quelle; Deutsch/Englisch und englischer Fallback sind vollständig. |
| Kompatibilität | pass | Nicht-TTY, explizites Full, Project-Default nur nichtinteraktiv und OpenCode-`--dir` bleiben vertragsgemäß. |
| Version | pass | AGDF 0.14.5 ist auf allen Einstiegsflächen ausdrücklich MCP-frei; die Änderung ist unreleased. |
| Brownfield-Fit | pass | Keine bestehende Mutations-, Adapter-, Consent-, Locale-, Paket- oder Governance-Autorität wurde dupliziert. |
| Dokumentation und Context Graph | pass | Einsteigerdokumente und drei bestehende Architekturbeziehungen entsprechen dem implementierten Stand. |

## Normalized Findings

GMA-UAT-04 und GMA-UAT-05 sind mit CD+Tests Revision 5, Task Plan Review Revision 4 und Code Review
Revision 5 gelöst. GMA-CR-06 wurde im aktuellen Code Review gefunden und vor der QA-Entscheidung
durch geschlossene Scope-Adaptervalidierung, einen Nullmutationstest und einen erneuten seriellen
Gesamtsmoke gelöst. Es gibt kein offenes, fehlendes, unbekanntes oder widersprüchliches
normalisiertes Finding.

## Testevidenz

| Prüfung | Ergebnis |
|---|---|
| Fokus-Suiten für Contract, Interaction, Service und CLI | pass |
| Lokaler Wrapper einschließlich dateibasiertem `INIT_CWD` | pass |
| MCP-Lifecycle für vier Adapter | pass |
| `npm --prefix create-agdf run smoke-test` | pass |
| `release:prepare`, öffentliche Profile und Copilot-Budget | pass; 95 Dateien, 818949 Bytes |
| Paketbau und Paketinhalt | pass; byteidentisch, 471 Dateien |
| MCP-Server-Vertrag und beide Protokollgenerationen | pass |
| Runtime Integrity | pass; 10 Skills und 16 Control-Dateien |
| `npm audit --json` | pass; 0 bekannte Schwachstellen |
| `git diff --check` | pass |

## Context Graph

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-MCP-DISPATCH-ADAPTER`; `CG-CREATE-AGDF-CLI-COMPOSITION`; `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: Die drei Einträge mit Datum 2026-09-09 enthalten Dual-Scope-Status, zweite Auswahl, native Priorität und validierten Invocation-Transport mit Verweis auf CD+Tests Revision 5.

## Verbleibende Evidenzspuren

| Spur | Status | Auswirkung |
|---|---|---|
| GMA-H01 bis GMA-H04 | unverified | Keine Aussage über tatsächlich geladene Unterstützung der vier Hosts. |
| GMA-H05 | unverified | Keine native Windows-Unterstützungsaussage. |
| GMA-U01 bis GMA-U09 | unverified | Keine Nutzerabnahme oder bestätigte Einsteigerverständlichkeit. |

QA: pass — TP Revision 2 ist im Repository-Scope vollständig belegt; direkte Host- und UAT-Spuren bleiben getrennt.
