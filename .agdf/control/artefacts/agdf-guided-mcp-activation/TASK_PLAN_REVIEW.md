# Task Plan Review: Geführte MCP-Aktivierung während der AGDF-Installation

- revision: 4
- date: 2026-09-09
- based_on: approved TP Revision 2 and CD+Tests Revision 5
- decision: `pass`
- authorizes: `false`

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| GMA-01 | fully_done | Brownfield Analysis Revision 2 bestätigt Owner und Integrationsgrenzen. | none | none |
| GMA-02 | fully_done | Parser- und Registrytests prüfen exklusive Optionen, absolute Ziele und Scopes. | none | none |
| GMA-03 | fully_done | OpenCode-`--dir`-Kompatibilität ist in Service-, CLI- und Smoke-Tests belegt. | none | none |
| GMA-04 | fully_done | Geschlossener Preflight- und Ergebnisvertrag einschließlich `authorizes: false`. | none | none |
| GMA-05 | fully_done | Interaktionstests belegen Auswahl ohne Default, Wiederholung, EOF und Cancel. | none | none |
| GMA-06 | fully_done | Vier Oberflächen besitzen ausschließlich lesende Status-Fixtures vor Auswahl. | none | none |
| GMA-07 | fully_done | Service-Sequenztests belegen die Owner-Reihenfolge. | none | none |
| GMA-08 | fully_done | Plugin-only und Abbruch rufen kein MCP-Enable auf. | none | none |
| GMA-09 | fully_done | Full nutzt den bestehenden MCP-Lifecycle nach gesunder Plugin-Verifikation. | none | none |
| GMA-10 | fully_done | Getrennte Fehlerphasen und Recovery-Aktionen sind positiv und negativ getestet. | none | none |
| GMA-11 | fully_done | Ein Locale-Owner rendert die vollständige deutsche und englische Reise. | none | none |
| GMA-12 | fully_done | Status und gekoppelte Deaktivierung verwenden vorhandene Owner. | none | none |
| GMA-13 | fully_done | Uninstall bleibt Preview-first und revalidiert MCP-Eigentum und Rest-Scope. | none | none |
| GMA-14 | fully_done | Lokaler Wrapper bereitet versionsgleiche Checkout-Pakete erst beim Enable vor. | none | none |
| GMA-15 | fully_done | Installations-, Paket-, Beitrags- und Architekturdokumentation sind aktualisiert. | none | none |
| GMA-16 | fully_done | Fokus-Suiten, Paketbau, Runtime Integrity und serieller Smoke bestehen. | none | none |
| GMA-17 | fully_done | Drei bestehende Context-Graph-Knoten enthalten die implementierte Beziehung. | none | none |
| GMA-18 | fully_done | CD+Tests Revision 5 trennt alle sechs Evidenzebenen. | none | none |
| GMA-19 | fully_done | `mcp_by_scope.project` und `.user` sind mit Status, Herkunft, Pfad, Blocker, Entfernung und Invocation-Quelle geschlossen validiert. | none | none |
| GMA-20 | fully_done | `project | user | back` ohne Default, Back-Schleife, Retry und EOF sind im Interaktions- und Servicetest belegt. | none | none |
| GMA-21 | fully_done | Beide Scopes werden read-only inspiziert; nur der gewählte Scope erreicht `enable`; Projektpriorität sperrt gezielt User. | none | none |
| GMA-22 | fully_done | Scope-Karte und Ergebnis unterscheiden Ziel, Reichweite, Invocation, Registrierungspfad und wirksame Quelle in Deutsch und Englisch. | none | none |
| GMA-23 | fully_done | Gültiges, fehlendes, relatives, nicht existentes und dateibasiertes `INIT_CWD` sind getestet; Fehler stoppt vor Vorbereitung. | none | none |
| GMA-24 | fully_done | Wrapper transportiert nur validiertes cwd samt Quelle; Argumente und OpenCode-Verhalten bleiben unverändert. | none | none |
| GMA-25 | fully_done | Vollständige Fokusmatrix und serieller Gesamtsmoke bestehen auf dem finalen Produktstand. | none | none |
| GMA-26 | fully_done | Einsteigerdokumente erklären Scope, Priorität, Ziel, Aufrufverzeichnis und MCP-freies 0.14.5 eindeutig. | none | none |
| GMA-27 | fully_done | Context Graph reconciled; aktuelle Task-, Clean- und Code-Reviews beziehen TP Revision 2 ein. | none | none |
| GMA-28 | fully_done | CD+Tests, QA Report und UAT Preparation wurden für Revision 2 erneuert; direkte Host- und UAT-Spuren bleiben `unverified`. | none | none |

## Akzeptanzkriterien

| Kriterium | Status | Evidenzstärke | Nachweis |
|---|---|---|---|
| AC-01 bis AC-10 | done | high | Erneuter serieller Gesamtsmoke bestätigt die bestehende Installations-, Fehler-, Restart- und Entfernungsreise. |
| AC-11 | done | high | Locale-Registry, Interaction- und CLI-Ausgabetests belegen vollständige Sprachpakete und englischen Fallback. |
| AC-12 | done | high | Ergebnisverträge und Artefakte trennen Repository-, Paket-, Protokoll- und Hostaussagen. |
| AC-13 | done | high im geplanten Repository-Scope | Dual-Scope-Preflight, zweite Auswahl, native Priorität, Invocation-Herkunft und Nullmutation sind direkt getestet. |

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| Erste Auswahl ohne Default | decision_required | GMA-05, GMA-20 | gerenderte CLI-Fixtures und Interaktionstest | fulfilled | none |
| Getrennte Scope-Auswahl ohne Default | scope_decision_required | GMA-20 | gerenderte Scope-Karte, Reader-Aufruf mit `default: null` | fulfilled | none |
| Project, User und Back verständlich getrennt | scope_decision_required | GMA-20, GMA-22 | vollständige deutsche und englische Scope-Ausgabe | fulfilled | none |
| Beide Scopes vor Auswahl sichtbar | preflight | GMA-19, GMA-21, GMA-22 | scopespezifische Status-, Pfad-, Quellen- und Entfernungsausgabe | fulfilled | none |
| Native Priorität sichtbar und wirksam | preflight_blocked_scope | GMA-21, GMA-22 | Konfliktfixture zeigt `project_override` und blockierten User-Scope | fulfilled | none |
| Ursprüngliche Projektwurzel statt `create-agdf` | invocation_context | GMA-23, GMA-24 | Wrapperfixture prüft normalisiertes cwd und `npm_init_cwd`/`process_cwd` | fulfilled | none |
| Back, EOF und ungültige Eingabe ohne Mutation | decision_required | GMA-20, GMA-25 | Interaction- und Service-Negativtests | fulfilled | none |
| Nur gewählter Scope wird verändert | mutation | GMA-21, GMA-25 | exakte Aufruffolge endet mit `mcp.enable.user` oder `project` | fulfilled | none |
| Statuskarte trennt Invocation und Registrierung | result | GMA-19, GMA-22 | Text- und JSON-Projektion mit getrennten Feldern | fulfilled | none |
| Versionsgrenze für Einsteiger | documentation | GMA-26 | vier öffentliche Dokumentationsflächen | fulfilled | none |

Die sichtbare Evidenz ist eine direkt gerenderte Repository-CLI-Ausgabe. Sie beweist die geplante
Darstellung, aber keine tatsächlich geladene Hostoberfläche. TP Revision 2 führt direkte Host- und
menschliche UAT bewusst als spätere getrennte Spuren.

## Summary

- fully_done: 28/28
- partially_done: 0
- not_done: 0
- out_of_scope_changes: keine diesem Run zugeordnet; parallele Änderungen am Run `agdf-host-adapter-compatibility` wurden nicht als Evidenz verwendet
- risks: geladene Hostdarstellung, native Windows-Ausführung und menschliche Verständlichkeit bleiben unverified
- required_next_step: Clean Implementation Review und Code Review konsumieren diese aktuelle TP-Abdeckung; danach entscheidet allein `qa-gate`

TP Review: pass — 28/28 tasks fully_done.
