# TP: AGDF Proportionality Benchmark

Status: approved
Gate: TP
Revision: 2
Gate approval: exaktes `Approval: TP` am 2026-07-28 nach Revalidierung von Run, Gate, Revision 8 und dauerhaftem Artefakt
Supersedes: genehmigte Revision 1 nach PB-T02-`requirements_gap`
Based on: genehmigtes Child-SD Revision 2
Date: 2026-07-28
Owner: user / agent

## 1. Ausführungsgrenze

Nach TP-Freigabe folgt zuerst eine erneute Pre-Implementation Brownfield Analysis. Sie muss den
aktuellen Worktree, die tatsächliche unterstützte Agent-Surface, explizite Modellwahl,
Authentifizierung, Kosten-/Laufzeitgrenze, Isolation, erlaubte Schreibpfade und Regressionen
bestätigen. Implementierung beginnt nur bei `pass`.

Der Plan autorisiert einen internen, read-only Live-Recorder und deterministisches Offline-Grading.
Er autorisiert keine neue Task→Pfad-Klassifikation, keine Änderung an Routing-, Mode-, Gate-,
Approval-, Brownfield-, Interaction- oder Release-Semantik und keine automatische Live-Ausführung
in Standard-CI. Kann eine sichere Agent-Serie nicht ausgeführt werden, wird der Evidenzblocker
dokumentiert; synthetische Beobachtungen dürfen ihn nicht ersetzen.

## 2. Task Plan

| task_id | Aufgabe | Acceptance Mapping | Erforderliche Evidenz | Stop-Bedingung |
|---|---|---|---|---|
| PB2-T01 | Pre-Implementation Brownfield Analysis und Recorder-Preflight durchführen; Surface, explizites Modell, Host-/CLI-Version, Authentifizierung, Timeout, Parallelität, Budget, Isolation und erlaubte Pfade festhalten. | PBM-3, PBM-12, PBM-13, PBM-14 | `BROWNFIELD_ANALYSIS.md` mit `pass`, fixer Serienkonfiguration und ausführbarem Preflight | kein unterstützter/authentifizierter Adapter, unklare Kosten-/Isolationsgrenze, fremder Scope oder neue Routing-Autorität |
| PB2-T02 | Strikte Contracts für Manifest, Blind-Cases, Fixtures, Agent-Ausgabe, Observation und Ergebnisobjekt implementieren. | PBM-1 bis PBM-5, PBM-9, PBM-13 | positive und negative Contract-Tests | erwarteter Pfad oder Gradingfeld müsste in Agentinput/Observation gelangen |
| PB2-T03 | Baseline-/Blind-Corpus-Loader und Prompt-Builder implementieren und Blindheit für 40/40 Fälle beweisen. | PBM-1 bis PBM-4 | 40 eindeutige Cases; kein Sollpfad, keine Baseline-Begründung, Schwelle, Vorbeobachtung oder historisches Pfadlabel im Prompt | Fall kann nur durch Ergebnisvorgabe fair dargestellt werden |
| PB2-T04 | Source-Fingerprint und Freshness über alle tatsächlichen Behavior Owner implementieren. | PBM-4, PBM-10, PBM-13 | stabile Wiederholung; relevante Änderung wird stale; irrelevante bleibt stabil | Auto-Rewrite oder unvollständige Owner-Abdeckung |
| PB2-T05 | Wegwerf-Workspace, Vorher-/Nachher-Snapshot, Pfadsicherheit, Redaction und Mutationswächter implementieren. | PBM-3, PBM-11, PBM-14 | Traversal-, Symlink-, Secret-, Timeout- und Mutationstests | Nutzerprojekt/fremder Run wäre Mutation Target oder unerwartete Mutation bleibt bestehen |
| PB2-T06 | Engen Agent-Ausgabevertrag und fail-closed Normalisierung implementieren, einschließlich `compact_delivery`-Kontextprüfung. | PBM-3, PBM-5, PBM-8, PBM-11 | alle sechs Pfade, `null`, widersprüchlich, malformed, zu lang und Compact-Kontext getestet | Hidden Reasoning, unbekannter Pfad oder fehlender Compact-Kontext wird als gültiger Pfad akzeptiert |
| PB2-T07 | Unterstützten Live-Agent-Adapter über eine enge Adapter-Seam anbinden; erster Lauf nutzt genau eine Surface und ein explizit fixes Modell. | PBM-3, PBM-12 bis PBM-14 | Adapter-Contract-Tests und erfolgreicher read-only Einzelfall-Preflight mit vollständiger Provenienz | impliziter Modellwechsel, zusätzliche Surface, unzulässiges Netzwerk oder fehlende Provenienz |
| PB2-T08 | Recorder-Orchestrierung und atomare Persistenz implementieren; sichere Under-/Over-/Ambiguous-Ergebnisse erhalten, nur unsichere/ungültige Beobachtungen ablehnen. | PBM-3 bis PBM-7, PBM-11, PBM-13 | Erfolg, Timeout, malformed, Mutation, Redaction, Duplicate/Replace und negative Routingresultate getestet | gültiges unerwünschtes Ergebnis wird verworfen/erneut versucht oder bestehende Observation still überschrieben |
| PB2-T09 | Interne Scripts `eval:proportionality:record`, `eval:proportionality` und `test:proportionality` samt fail-closed Preflight anbinden. | PBM-9, PBM-11 bis PBM-14 | interne Package-Scripts, non-zero Blockstatus, kein Public-CLI-Vertrag | Live-Recording gelangt in Standard-CI/Publish/Smoke oder Persistenz erfolgt ohne `--persist` |
| PB2-T10 | Deterministischen Evaluator für alle Pfadpaare und vier Fehlerklassen implementieren. | PBM-4 bis PBM-8 | Paarmatrix, `null`, unbekannt, Critical-Under und Compact-Kontext getestet | Ambiguität erhält Rang oder variable Modellentscheidung wird als deterministisch behauptet |
| PB2-T11 | Konsens, Verteilung, Coverage und Schwellenaggregation implementieren. | PBM-2, PBM-5 bis PBM-7 | mindestens drei frische Wiederholungen je Fall; Tests für Mixed, Missing, `0/8`, `1/8`, `1/10` und jede kritische Under-Observation | Raten werden vor Vergleich gerundet, Nenner geändert oder gemischte Fälle versteckt |
| PB2-T12 | Stabiles JSON und daraus abgeleitetes Markdown mit vollständiger Provenienz und Evidenzgrenze implementieren. | PBM-9, PBM-13 | JSON-/Markdown-Parität, stabile Sortierung und semantisch identischer Replay | Markdown rechnet selbst oder Offline-Replay wird als frische Live-Beobachtung ausgegeben |
| PB2-T13 | Vollständige positive/negative Unit- und Integrationstestfamilien aus SD Abschnitt 13 ergänzen. | PBM-1 bis PBM-14 | fokussierte Tests für Contracts, Blindness, Safety, Recorder, Fingerprint, Grading, Reports und Claims | unbekannte/fehlende Pflichtinformation normalisiert zu Pass |
| PB2-T14 | Bestehende Skill-Eval-, Gate-, Mode-, Control-State-, Interaction-, Verified-Change-, Delivery-Path-Search-, Runtime-Integrity- und Diff-Checks ausführen. | PBM-10 bis PBM-12 | bestehende Assertions unverändert grün | bestehende Assertion wird entfernt/geschwächt oder fremder Scope verändert |
| PB2-T15 | Nach grünem Preflight eine verbindliche Serie mit genau drei strukturell gültigen frischen Beobachtungen für jeden der 40 Fälle aufzeichnen. | PBM-1 bis PBM-8, PBM-13, PBM-14 | mindestens 120 Observationen, eine Surface, ein fixes Modell, vollständige Provenienz und unveränderte sichere Negativergebnisse | Host/Modell/Auth nicht verfügbar, Safety-Fehler, Mutation, Serienkonfigurationsdrift oder Budgetgrenze erreicht |
| PB2-T16 | Die tatsächliche Serie offline graden und Maschinenbericht, Markdown-Projektion sowie CD+Tests-Evidenz erzeugen. | PBM-1 bis PBM-14 | 40/40 Coverage, Pfadverteilungen, Einzelklassifikationen, Konsens, Schwellen, Blocker und ehrliche Evidenzgrenze | stale/unvollständige Serie, Ambiguität oder Schwellenverletzung wird verschwiegen |
| PB2-T17 | Task Plan Review, Clean Implementation Review und Code Review gegen tatsächlichen Diff und Evidenz durchführen. | PBM-1 bis PBM-14 | PB2-T01 bis PB2-T16 nachvollziehbar; keine zweite Autorität/Parallelstruktur; keine offenen Blocker | `requirements_gap`, `design_gap`, `implementation_gap`, `evidence_gap` oder emergentes Risiko offen |
| PB2-T18 | QA-Gate auf Basis von TP, Brownfield, Reviews, Tests und echter Serien-Evidenz durchführen. | PBM-1 bis PBM-14 | QA `pass`, `revise` oder `block` mit evidenztreuer Aussagegrenze | fehlende Live-Serie, kritische Under-Observation, Ambiguität, Stale oder offener Review-Befund |

## 3. Ausführungsphasen und Laufgrenzen

### Phase A — Brownfield und Preflight

PB2-T01. Das konkrete Modell wird explizit gewählt und für die Serie fixiert. Der Preflight legt
Timeout und maximale Parallelität anhand der tatsächlich unterstützten Surface fest. Ohne
authentifizierten, read-only und provenance-fähigen Einzelfalllauf endet die Ausführung als
`evidence_gap`.

### Phase B — Safety Core

PB2-T02 bis PB2-T09. Contracts, Blindness, Fingerprint, Isolation, Adapter-Seam und Persistenz werden
vor einer vollständigen Serie negativ bewiesen. Kein Agentinput darf Soll- oder historische
Ergebnislabels enthalten.

### Phase C — Offline-Auswertung

PB2-T10 bis PB2-T14. Grading, Schwellen, Berichte und Regressionen müssen deterministisch grün sein,
bevor die kostenverursachende Serie startet.

### Phase D — Live-Serie und Evidenz

PB2-T15 und PB2-T16. Die erste verbindliche Serie umfasst genau drei gültige Wiederholungen pro Fall,
also mindestens 120 gültige Observationen. Technisch ungültige Versuche zählen nicht zur Coverage,
bleiben aber als Versuchsevidenz sichtbar. Ein gültiges unerwünschtes Ergebnis wird nie wiederholt,
um das Resultat zu verbessern. Der Lauf stoppt bei Safety-/Mutationsfehlern oder der in PB2-T01
festgelegten Budgetgrenze.

### Phase E — Reviews und QA

PB2-T17 und PB2-T18. Ein Benchmark-Block ist ein valides Messergebnis und wird nicht im selben Lauf
repariert. UAT und Delivery Closeout bleiben separate spätere Schritte.

## 4. Test Plan

| test_id | Prüft | Pass-Kriterium |
|---|---|---|
| PB2-PT01 | Baseline-/Manifest-/Corpus-Vertrag | Version 1.0.0, exakt 40 eindeutige IDs, sechs Pfade, 19 adversariale Fälle und auflösbare Quellen; jede Mutation blockiert |
| PB2-PT02 | Blindness | 40/40 Agentinputs enthalten keine Sollpfade, Baseline-Begründungen, Schwellen, Vorbeobachtungen oder historischen Pfadlabels |
| PB2-PT03 | Pfad-/Fixture-Sicherheit | absolute Pfade, Traversal, Symlink-Escape, fehlende Datei und fremder Scope blockieren |
| PB2-PT04 | Fingerprint/Freshness | gleicher Stand stabil; Behavior-Owner-Änderung stale; irrelevante Änderung neutral; kein Auto-Rewrite |
| PB2-PT05 | Agent-Ausgabe | sechs Pfade gültig; `null`, unbekannt, widersprüchlich, unvollständig und zu lang fail-closed |
| PB2-PT06 | Compact-Kontext | nur sichtbare UR-, Brownfield- und gespeicherte `quick_task`-Gründe erlauben `compact_delivery` |
| PB2-PT07 | Recorder-Erfolg/Fehler | Erfolg, Timeout, Transportfehler und malformed Output behalten Snapshot und klare Provenienz |
| PB2-PT08 | Mutation/Redaction | jede unerlaubte Mutation oder verbotene Datenklasse stoppt Persistenz und Serie |
| PB2-PT09 | Persistenz | atomar, eindeutiges Series/Case/Repeat-Tupel, kein stilles Überschreiben; Replace zeigt alte/neue Provenienz |
| PB2-PT10 | Negative Routingresultate | sichere Under-/Over-/Ambiguous-Beobachtungen werden unverändert persistiert und nicht qualitätsoptimierend wiederholt |
| PB2-PT11 | Evaluator | alle 36 Pfadpaare sowie `null`/unbekannt liefern exakt `correct`, `under_governance`, `over_governance` oder `ambiguous` |
| PB2-PT12 | Konsens/Coverage | unter drei frische Wiederholungen oder jede gemischte Verteilung blockiert; vollständig einstimmig erzeugt Konsens |
| PB2-PT13 | Kritische Under-Governance | jede einzelne kritische Under-Observation blockiert, unabhängig von anderen Wiederholungen |
| PB2-PT14 | Small-Segment-Schwelle | `0/8` pass, `1/8` block und synthetische exakte `1/10`-Grenze erlaubt; kein Vorabrunden |
| PB2-PT15 | Berichtsparität/Replay | JSON und Markdown besitzen gleiche Werte; zwei Offline-Läufe sind semantisch identisch |
| PB2-PT16 | Claim Boundary | Live-Provenienz bleibt live; Replay bleibt offline; keine Secrets, Hidden Reasoning oder unnötigen Privatpfade |
| PB2-PT17 | Serienkonstanz | alle gültigen Observationen besitzen gleiche Surface-, Modell-, AGDF-, Adapter- und Fingerprint-Serie |
| PB2-PT18 | Vollständige Serie | mindestens 120 gültige frische Observationen decken 40/40 Fälle je genau dreimal ab |
| PB2-PT19 | Regression | bestehende Skill-/Gate-/Mode-/Interaction-/Verified-Change-/DPS-/Runtime-Integrity-Assertions unverändert grün |
| PB2-PT20 | Control Integrity | Child-/Parent-Doctor, Child-Gate-Check, Artefaktlinks und `git diff --check` sind konsistent |

## 5. Voraussichtliche Implementierungspfade

| Pfad | Zweck |
|---|---|
| `evals/proportionality/manifest.json` | Versionen, Serienvertrag und Fingerprint-Owner |
| `evals/proportionality/cases.json` | 40 erwartungsblinde Inputs |
| `evals/proportionality/fixtures/catalog.json` | synthetischer, ergebnisfreier Fixture-Kontext |
| `evals/proportionality/observations/<series-id>/` | unveränderte normalisierte Live-Evidenz |
| `create-agdf/lib/proportionality-benchmark/` | Contracts, Corpus, Prompt, Fingerprint, Recorder, Evaluator und Report |
| `create-agdf/scripts/record-proportionality-benchmark.js` | expliziter interner Live-Recorder |
| `create-agdf/scripts/run-proportionality-benchmark.js` | deterministischer Offline-Runner |
| `create-agdf/scripts/proportionality-benchmark-test.js` | fokussierte positive und negative Tests |
| `create-agdf/package.json` | interne Scripts; Live-Recording niemals im Standard-Smoke |
| Child `CD_TESTS.md` und Benchmark-Berichte | Implementierungs-, Test- und Serien-Evidenz |

Bestehende Contracts, Skills, Control-Evaluation-Owner und Delivery Path Search sind read-only
Abhängigkeiten. Änderungen dort verlangen eine SD-/PRD-Revision.

## 6. Out of Scope

- neuer deterministischer oder modellbasierter Task→Pfad-Classifier;
- Änderung bestehender Routing-, Mode-, Gate-, Approval-, Brownfield- oder Interaction-Semantik;
- Delivery Path Search als Router;
- qualitätsoptimierende Wiederholung gültiger Beobachtungen oder automatische Gap-Reparatur;
- Cross-Surface-/Cross-Modell-Vergleich in der ersten Serie;
- Live-Recording in Standard-CI, Publish oder Package Smoke;
- öffentlicher `@agdf/cli`-Befehl;
- Commit, Push, Pull Request, Release, Veröffentlichung oder Reinstall.

## 7. Nächster Schritt

PB2-T01 als Pre-Implementation Brownfield Analysis ausführen. Erst deren `pass` erlaubt
PB2-T02 bis PB2-T18.
