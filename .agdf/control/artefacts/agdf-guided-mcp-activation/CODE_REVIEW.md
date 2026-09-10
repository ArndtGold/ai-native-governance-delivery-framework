# Code Review: Geführte MCP-Aktivierung während der AGDF-Installation

- revision: 5
- date: 2026-09-09
- based_on: approved TP Revision 2, CD+Tests Revision 5, Task Plan Review Revision 4 and Clean Implementation Review Revision 4
- decision: `pass`
- authorizes: `false`

## Code Review

- decision: `pass`
- findings: keine offenen funktionalen, Sicherheits-, Datenintegritäts-, Kompatibilitäts- oder Wartbarkeitsfindings im geprüften Run-Scope; GMA-CR-06 wurde während des Reviews behoben
- missing_evidence: direkte geladene Hostreise und native Windows-Ausführung; diese Grenzen sind keine behauptete Repositoryevidenz
- risks: Host-UI und Berechtigungsmodelle können nach realer Installation abweichen; die Versionsgrenze muss bei Veröffentlichung bewusst geändert werden
- required_next_step: `qa-gate` mit der aktuellen TP-, Brownfield-, Clean-, Code-, Test-, Dokumentations- und Context-Graph-Evidenz ausführen

## Geprüfter Diff-Scope

- Setup-Vertrag, Interaktion, Darstellung und Service
- CLI-Parser, Application-Verdrahtung und lokale Wrappergrenze
- Locale-Registry und Payload-Größeninvariante
- Fokus-, Lifecycle-, Paket-, Smoke- und Wrappertests
- Einsteiger- und Architekturdokumentation
- Context-Graph-Beziehungen und Run-Artefakte

## Prüfergebnisse

| Schwerpunkt | Ergebnis | Konkrete Evidenz |
|---|---|---|
| Eingabevalidierung | pass | `INIT_CWD` verlangt nicht leer, absolut, vorhanden und Verzeichnis; Fehlercode bleibt stabil und stoppt vor `release:prepare`. |
| Scope-Bindung | pass | Interaktiv existiert kein Scope-Default; Service validiert die gewählte Option erneut und ruft nur diesen Scope mit `enable` auf. |
| Native Priorität | pass | Setup liest Adapterstatus und blockiert nur den betroffenen Scope; es rekonstruiert keine Hostpriorität. |
| Nullmutation | pass | Back, Cancel, EOF, gesperrter Scope, Plugin-only und ungültiger Wrapperkontext besitzen negative Aufrufzählungen. |
| Reihenfolge | pass | Beide Statusaufrufe liegen vor Auswahl; Paketbezug und MCP-Enable liegen nach Plugin-Verifikation. |
| Fehler und Recovery | pass | Preflight, Auswahl, Runtime-Check, Plugin-Operation, Plugin-Verifikation und MCP-Enable behalten getrennte Phasen. |
| Pfad- und Shellgrenze | pass | Ziel muss absolut sein; Wrapper normalisiert realpath; bestehende gequotete Entfernungskommandos bleiben getestet. |
| Sprache | pass | Neue Codes sind in vollständigen deutschen und englischen Paketen registriert; Registry und Renderer scheitern bei Drift geschlossen. |
| Kompatibilität | pass | Nicht-TTY bleibt plugin-only; explizites nichtinteraktives Full bleibt project-default; OpenCode-`--dir` bleibt im Plugin-only-Modus unverändert. |
| Reproduzierbarkeit | pass | Isolierter Sync, Payload-Budget, byteidentischer Paketbau, Paketinhalt und serieller Smoke bestehen. |
| Autoritätsgrenze | pass | Preflight und Ergebnis bleiben `authorizes: false`; User-Scope erzeugt keine Governance-Ziel- oder Gate-Autorität. |

## Behobenes Finding

- [medium] GMA-CR-06, `create-agdf/lib/install-setup/service.js`: Ein fehlerhafter injizierter
  Scope-Adapter konnte einen Wert außerhalb `project | user | back | cancel` liefern. Bei einem
  falsy Wert wäre die Auswahl ohne Fortschritt erneut aufgerufen worden. Der Service validiert die
  Adapterantwort jetzt selbst und stoppt mit `AGDF_INSTALL_SETUP_SCOPE_SELECTION_INVALID` vor
  Consent oder Mutation. Der Service-Test belegt die exakte Nullmutations-Aufruffolge.

GMA-CR-06 ist als `implementation_gap` nach `CD+Tests` geroutet und mit Code plus fokussiertem
Regressionstest `resolved`.

## Frühere Findings

GMA-UAT-04 und GMA-UAT-05 aus Revision 4 sind gelöst. Das ursprüngliche npm-Aufrufverzeichnis wird
validiert transportiert, und Full Setup verlangt interaktiv eine zweite bewusste Scope-Auswahl. Die
neuen positiven, negativen und Nichtmutationsfälle sind in CD+Tests Revision 5 und Task Plan Review
Revision 4 belegt. Frühere Review-Passes und QA Report Revision 3 bleiben historische Evidenz für TP
Revision 1 und werden nicht als Freigabe dieser Revision übertragen.

Es gibt kein offenes, fehlendes, unbekanntes oder widersprüchliches normalisiertes Finding.

Code Review: pass — Scope-, Pfad-, Prioritäts-, Nullmutations- und Kompatibilitätsgrenzen sind im tatsächlichen Diff belegt.
