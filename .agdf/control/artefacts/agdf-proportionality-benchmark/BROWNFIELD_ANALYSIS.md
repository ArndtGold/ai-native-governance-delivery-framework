# Brownfield Analysis: AGDF Proportionality Benchmark

Mode: `pre_implementation_analysis`
Status: `done`
Decision: `pass`
Date: 2026-07-28
Run: `agdf-proportionality-benchmark`
Related TP: `.agdf/control/artefacts/agdf-proportionality-benchmark/TP.md` Revision 2

## Scope

PB2-T01 prüft vor CD+Tests den aktuellen Worktree, bestehende Eval-/Recorder-Owner,
Wiederverwendung, zulässige Schreibpfade, Regressionen sowie die reale Codex-Surface mit
explizitem Modell, Authentifizierung, Isolation und begrenztem Ausführungsbudget.

## Evidence

| Owner / Pfad | Beobachtete Fähigkeit | Entscheidung |
|---|---|---|
| `create-agdf/lib/skill-evals/live-recorder.js` | vorhandener Codex-/Claude-Adapter mit strukturiertem Schema, ephemeral read-only Ausführung, Timeout und Mutationsprüfung | Adapterausführung wiederverwenden beziehungsweise ohne Semantikänderung verallgemeinern |
| `create-agdf/lib/skill-evals/workspace.js` | sichere Wegwerf-Fixtures, Workspace-Snapshot, Changed-Path- und Mutationsprüfung | direkt wiederverwenden/erweitern |
| `create-agdf/lib/delivery-path-search/transports/read-only-guard.js` | read-only Prozesswächter mit Repository-Vorher-/Nachher-Zustand und Timeout | direkt wiederverwenden |
| `create-agdf/lib/skill-evals/index.js` | sichere Pfadauflösung, stabile Fingerprints und deterministisches Gradingmuster | Muster und gemeinsame Primitive wiederverwenden; keinen Skill-Grader zweckentfremden |
| `create-agdf/scripts/record-skill-evals.js` | expliziter manueller Recorder mit Surface-/Modellwahl und optionaler Persistenz | Script-Konvention übernehmen |
| Parent-Baseline 1.0.0 | alleiniger Owner für 40 Sollfälle, Sollpfade, Kritikalität, Quellen und Schwellen | read-only konsumieren |
| `plugin/meta/contracts/modes.md`, `gate-transition.md`, `plugin/skills/gate-check/SKILL.md` und Plugin-Router | tatsächliche Behavior Owner der Agent-Pfadwahl | fingerprinten und in Blind-Prompt einbinden; nicht verändern |
| genehmigtes SD/TP Revision 2 | trennt variable Live-Beobachtung von deterministischem Grading und verbietet zweite Routing-Autorität | Implementierungsgrenze ist eindeutig |

## Current Coverage

- current_coverage: `partially_done`
- fully_done: Baseline, normative Routing-/Gate-/Mode-Owner, sichere Fixture-/Snapshot-Primitiven,
  read-only Agentprozess, strukturierte Codex-Ausgabe, Skill-Eval-Fingerprint/Grading und
  Package-Script-Konventionen.
- partially_done: der bestehende Live-Recorder ist auf Skill-Evals zugeschnitten und persistiert nur
  bestandene Ergebnisse; seine generische sichere Ausführungs-Seam muss ohne Verhaltensänderung
  extrahiert oder parametrierbar gemacht werden.
- not_done: Proportionality-Contracts, Blind-Corpus, Observation-Store, Source-Fingerprint,
  Recorder-Orchestrierung, Grader, Aggregation, Berichte und die verbindliche 40×3-Serie.

## Worktree And Scope Isolation

- Der Worktree enthält umfangreiche bereits vorhandene AGDF-Control-Artefakte mehrerer Runs.
- In den vorgesehenen Produktpfaden `create-agdf/`, `evals/` und `plugin/` wurde vor PB2-T02 kein
  konkurrierender uncommitted Produktdiff beobachtet.
- Fremde Runs und bestehende Control-Artefakte bleiben außerhalb des Mutation Targets.
- Die Implementierung darf nur die im TP benannten Proportionality-Pfade, den minimal nötigen
  gemeinsamen Agent-Adapter-Seam, `create-agdf/package.json` sowie run-eigene Evidenz ändern.
- Vor jeder Phase wird der Ausgangszustand pfadgenau erfasst; neu auftretende Überschneidung stoppt
  die Arbeit zur Reconciliation.

## Live Preflight

| Feld | Festgelegter Wert / Evidenz |
|---|---|
| surface | `codex` |
| model | explizit `gpt-5.6-sol`; kein impliziter Default |
| runtime | `codex-cli 0.145.0` |
| authentication | `codex login status`: `Logged in using ChatGPT` |
| AGDF version | surface-lokaler Validator und Plugin `0.11.4` |
| execution | `codex exec --sandbox read-only --ephemeral --ignore-user-config --output-schema ...` |
| preflight case | bestehender `gate-check-normal` Skill-Eval-Fall |
| result | `pass`; strukturierte Ausgabe gültig; `changed_paths: []`; keine Persistenz |
| timeout | `120000 ms` je Agentaufruf |
| concurrency | `1` für die erste verbindliche Serie |
| valid coverage target | genau drei gültige Wiederholungen je 40 Fälle = 120 gültige Observationen |
| attempt budget | höchstens 130 Agentaufrufversuche; danach `evidence_gap` und Stopp |
| retry boundary | nur technisch/strukturell ungültige Versuche; nie ein gültiges Under-/Over-/Ambiguous-Ergebnis zur Qualitätsoptimierung wiederholen |

Der Preflight belegt Surface, Authentifizierung, Modellauflösung, strukturierten Output und
read-only Isolation. Er ist noch keine Proportionality-Observation und wird nicht als Teil der
120er-Serie gezählt.

## Reuse Strategy

- reuse_strategy: `extend`.
- Sichere Workspace-, Pfad-, Snapshot-, Mutation- und Prozesswächter wiederverwenden.
- Den vorhandenen strukturierten Live-Agent-Aufruf als kleine gemeinsame Seam extrahieren oder
  parametrierbar machen, sodass Skill-Evals unverändert bleiben und der Proportionality-Recorder sein
  eigenes Schema einsetzen kann.
- Proportionality-spezifische Contracts, Normalisierung, Persistenz, Grading und Reports im
  genehmigten neuen Owner `create-agdf/lib/proportionality-benchmark/` halten.
- Bestehenden Skill-Eval-Grader nicht erweitern, weil dessen Pass-only-Persistenz dem Messziel
  widerspricht.
- Keine Änderungen an Behavior Ownern, Delivery Path Search, Gate-/Mode-Semantik oder Baseline.

## Change And Regression Impact

| Bereich | Auswirkung | Pflichtprüfung |
|---|---|---|
| gemeinsame Live-Agent-Seam | interne Refaktorierung ohne CLI-/Prompt-Semantikänderung | bestehende Skill-Recorder-Unit-/Integrationstests |
| neue Proportionality-Module | additive interne Funktionalität | vollständige PB2-PT01 bis PB2-PT18 |
| `create-agdf/package.json` | drei interne Scripts | Package-/Smoke-Regression; Live-Script nicht in Standard-CI |
| `evals/proportionality/` | neuer versionierter Corpus und Observation-Owner | Blindness, Pfadsicherheit, 40/40 Join, Freshness |
| Runtime-/Plugin-Verträge | read-only Fingerprint-/Prompt-Eingang | Runtime Integrity und Diff-Prüfung ohne Änderungen |
| öffentliche CLI/API | keine | Package-Contents-Test bestätigt keinen neuen öffentlichen Befehl |

Keine Datenmigration, öffentliche API, UI-/UX-Fläche, Host-Konfiguration oder Releaseänderung ist
erforderlich.

## Risks And Controls

| Risiko | Kontrolle |
|---|---|
| zweite Routing-Autorität | Agent entscheidet anhand bestehender Owner; Offline-Code vergleicht nur |
| Sollpfad-Leakage | Positivlisten-Prompt und 40/40-Blindness-Test |
| parallele Recorder-Infrastruktur | gemeinsame sichere Adapter-/Workspace-Primitiven wiederverwenden |
| bestehender Recorder verwirft negative Resultate | getrennte Proportionality-Persistenz erhält sichere Negativergebnisse |
| Modell-/Konfigurationsdrift | eine fixe Surface-/Modell-/AGDF-/Adapter-Serie und Source-Fingerprint |
| Kosten-/Laufzeitausweitung | Parallelität 1, 120 Sekunden, maximal 130 Versuche |
| fremde Worktree-Mutation | pfadgenauer Baseline-Snapshot, Wegwerf-Fixtures und fail-closed Stop |
| falscher Live-Claim | Provenienz `live_agent_observation`; Replay bleibt ausdrücklich offline |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-DOCUMENTATION-CEREMONY-BOUNDARY`; `CG-DELIVERY-PATH-SEARCH`
- context_graph_required_action: `link`
- context_graph_gate_effect: `none`
- context_graph_evidence: Die Implementierung erweitert Eval-Evidenz und verlinkt bestehende
  Autoritätsknoten; sie erzeugt keinen neuen Policy- oder Routing-Knoten.

## Decision

- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `none`
- artefact: `.agdf/control/artefacts/agdf-proportionality-benchmark/BROWNFIELD_ANALYSIS.md`
- transparency: Die revidierte Architektur passt in bestehende Eval- und Recorder-Konventionen.
  Eine kleine gemeinsame Adapter-Seam verhindert Doppelstruktur; Proportionality-Grading bleibt
  separat, weil sichere negative Ergebnisse der Messgegenstand sind.
- missing_evidence: Implementierungs-, Test-, 120er-Serien-, Review- und QA-Evidenz.
- required_next_step: PB2-T02 bis PB2-T14 implementieren und testen; erst danach PB2-T15 als
  begrenzte Live-Serie ausführen.

## Implementation Boundary

CD+Tests ist jetzt für PB2-T02 bis PB2-T18 zulässig. Nicht autorisiert sind Änderungen an
Routing-/Gate-/Mode-/Approval-/Brownfield-/Interaction-Semantik, Live-Aufzeichnung in Standard-CI,
Cross-Surface-Vergleich, VCS-Aktionen, Release, Veröffentlichung oder Reinstall.
