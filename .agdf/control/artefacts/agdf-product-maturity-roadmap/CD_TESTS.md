# CD+Tests: AGDF Product Maturity Roadmap

Status: in_progress
Date: 2026-07-28
Scope: Parent Phase A und Vorbereitung der separaten Child-UR

## Task Status

| task_id | status | evidence |
|---|---|---|
| RMP-01 | done | `BASELINE_REGISTER.md` mit BL-01 bis BL-10 |
| RMP-02 | done | aktuelle Gate-Checks für sechs angrenzende Runs plus verlinkte abgeschlossene ORs |
| RMP-03 | done | `WORKSTREAM_REGISTER.md` mit WS-00 bis WS-05 |
| RMP-04 | done | `CONFORMANCE_SCOPE.md` mit HC-01 bis HC-12, Schema, Redaction und Gap-Routing |
| RMP-05 | done | eigenständiger Run `agdf-live-host-conformance-matrix`; UR, PRD, SD und TP separat genehmigt; Brownfield `pass`; 36-Zeilen-Matrix mit 16 Passes, 8 Limitierungen und 12 `host_unavailable`; TPR-LHC-001 `resolved`; Child-QA und UAT genehmigt; OR `pass` |
| RMP-06 | done | Child-OR unverändert als `BL-11` mit `user_accepted` verlinkt; WS-01 `completed`; acht Limitierungen und zwölf Claude-`host_unavailable` bleiben sichtbar |
| RMP-07 | done | Assessment zunächst `no_child_scope_yet`; danach validierte Baseline Version `1.0.0` mit 40 realen Fällen, sechs Pfaden, 19 adversarialen Fällen und 40/40 Quellen; `PROPORTIONALITY_BENCHMARK_SCOPE.md` ist `ready_for_child_ur` |
| RMP-08 | done | `STAGED_PRODUCT_FINDINGS_ASSESSMENT.md` und `ENFORCEMENT_CLOSURE_SCOPE.md`: QA-Block-Approval-Projektion mit Garantie, Surface, Ist-/Zielklasse, Owner und negativem Test; kein Autoritätsbypass behauptet |
| RMP-09 | pending | abhängig von stabilen Target-/Routing-/Enforcement-Zuständen |
| RMP-10 | pending | aggregierte PMR-Abnahme erst nach Child-Evidenz |
| RMP-11 | pending | nach abgeschlossenem Workstream |
| RMP-12 | pending | Roadmap-Reviews/QA/UAT erst nach vollständiger Aggregation |

## Phase-A-Prüfung

- RMP-T01: pass; alle relativen Links in Baseline-, Workstream- und Conformance-Artefakt lösen auf.
- RMP-T02: pass; sechs angrenzende Runs wurden per ausgewähltem `gate-check` gelesen und nicht
  gegenüber ihrem kanonischen Zustand hochgestuft.
- RMP-T03: pass; Parent-Artefact-Chain enthält keine Child-Freigabe.
- RMP-T04: pass; Roadmap-Worktree-Scope enthält nur `.agdf/control`-Artefakte und Backlog-Zeile,
  keine Runtime-/Plugin-Datei.
- RMP-T05: pass für Phase A; jede Baseline-Zeile besitzt eine explizite Evidenzklasse und Grenze.
- RMP-T06: pass; 12/12 PMR-3-Pflichtfälle, drei Full Surfaces, Redaction und Recovery vorhanden.
- RMP-T07: pass als Scope-Vertrag; `pass`, `limitation`, `product_gap`, `host_unavailable` und
  `invalid_evidence` besitzen getrenntes Routing ohne stille Reparatur.
- RMP-T08: pass; Scope-Entwurf bewahrt 40-Fall-/25%-/0-/10%-Kriterien, fail-closed `ambiguous`
  und bestehende Gate-/Mode-Owner; Details in `PROPORTIONALITY_BASELINE_TESTS.md`.
- RMP-T09: pass für Scope-Ableitung; `SPF-06` besitzt konkreten gemeinsamen Host-Gap,
  bestehenden Owner `gate-policy.js` und einen negativen Umgehungs-/Approval-Test.
- RMP-T10 bis RMP-T11: noch nicht ausführbar; Structured-Depth- und spätere Child-Evidenz fehlen
  planmäßig.
- RMP-T12 Phase A: `doctor` pass mit 0 Findings; `delivery-map` pass; keine defekten Links;
  `git diff --check` pass.
- RMP-T12 Child-UR-Vorbereitung: Parent und Child `doctor` jeweils pass mit 0 Findings;
  Parent bleibt bei internem `CD+Tests`, Child ist eindeutig bei UR mit fehlendem
  `Approval: UR`; `git diff --check` bleibt pass.

## Evidenzgrenze

Phase A erfüllt weder PMR-1 bis PMR-7 vollständig noch Roadmap-QA. Sie schafft ausschließlich eine
korrekte, verlinkte Baseline und den separaten Conformance-Scope.

## Staged-r3-Folgebewertung

Die r3-Evidenz wurde ohne Regrading oder Tuning in drei getrennte Pfade zerlegt:

- Benchmark-v3-Remediation für semantische und unvollständige Fixtures;
- eigener Product-Semantics-Child für `structured_slice` versus `structured_delivery`;
- eigener enger Enforcement-Child für die unzulässige QA-Approval-Aufforderung bei `block`.

Der QA-Transition-Befund ist technisch schließbar. Die bestehende dauerhafte QA-`pass`-Prüfung
verhindert bereits den UAT-Fortschritt; der Scope korrigiert die widersprüchliche Status- und
Approval-Projektion, ohne eine neue Gate-Semantik einzuführen.
