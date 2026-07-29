# SD: AGDF Proportionality Benchmark

Status: approved
Gate: SD
Revision: 2
Gate approval: exaktes `Approval: SD` am 2026-07-28 nach Revalidierung von Run, Gate, Revision 7 und dauerhaftem Artefakt
Supersedes: genehmigte Revision 1 mit verworfenen Decision-Fixtures
Based on: genehmigtes Child-PRD Revision 2 und Brownfield-`requirements_gap`
Date: 2026-07-28
Owner: user / agent

## 1. Lösungsziel

Der Benchmark erhält zwei strikt getrennte Lanes:

1. Eine explizite Live-Recording-Lane führt 40 redigierte Real-Task-Fälle je mindestens dreimal
   erwartungsblind über einen unterstützten Coding-Agent aus.
2. Eine deterministische Offline-Lane validiert, replayt, gradet und aggregiert die versiegelten
   Beobachtungen gegen die unveränderte Baseline.

Die Pfadentscheidung bleibt beobachtetes Agentverhalten. Die Lösung erzeugt weder einen neuen
Task→Pfad-Classifier noch neue Routing-, Gate- oder Mode-Semantik.

## 2. Ownership und Layout

```text
evals/proportionality/
  manifest.json
  cases.json
  fixtures/catalog.json
  observations/<series-id>/<case-id>/<repeat>.json
create-agdf/lib/proportionality-benchmark/
  contracts.js
  corpus-loader.js
  blind-prompt.js
  source-fingerprint.js
  live-recorder.js
  evaluator.js
  report.js
  index.js
create-agdf/scripts/
  record-proportionality-benchmark.js
  run-proportionality-benchmark.js
  proportionality-benchmark-test.js
```

- Parent `PROPORTIONALITY_BENCHMARK_BASELINE.json` bleibt alleiniger Owner für Sollpfade,
  Adversarialität, Begründung, Quellen und Schwellen.
- `plugin/meta/contracts/modes.md`, `gate-transition.md`, `plugin/skills/gate-check/SKILL.md` und der
  Plugin-Routing-Eintrag bleiben Behavior Owner.
- `cases.json` besitzt ausschließlich Blind-Input, Fixture-Referenz und relevante Source-Owner,
  niemals Sollpfad oder Baseline-Begründung.
- Observation-Dateien sind unveränderte, normalisierte Live-Evidenz.
- `proportionality-benchmark/` besitzt nur sichere Aufzeichnung, Schema/Fingerprint,
  deterministisches Grading, Aggregation und Bericht.
- Delivery Path Search bleibt advisory und wird nicht als Router importiert.

Die Dateinamen dürfen im TP minimal angepasst werden, die Trennung von Baseline, Blind-Corpus,
Live-Observation und Offline-Grading ist verbindlich.

## 3. Blind-Corpus

Der Corpus-Builder liest 40 Fall-IDs und `task_summary` aus der Baseline, erzeugt aber vor dem
Agentaufruf eine Positivliste:

- `case_id`;
- redigierter `task_summary`;
- synthetischer Fixture-Kontext;
- aktuelle allgemeine Routing-/Mode-/Gate-Instruktionen;
- strukturierter Ausgabevertrag.

Er verwirft und testet als verboten:

- `expected_delivery_path`;
- Baseline-`rationale`;
- Baseline-Schwellen;
- vorherige Beobachtungen;
- erwartete Fehlerklasse;
- historische Pfadlabels aus `evidence_ref`.

`evidence_ref` wird nur vom Offline-Loader auf Auflösbarkeit geprüft. Es gelangt nicht in den
Agentprompt.

Fixtures enthalten synthetische Repository-/Control-State-Fakten, die für den Fallkontext notwendig
sind, aber keinen Pfad, Modus, Gate-Ausgang oder gewünschtes Ergebnis vorgeben. Kann ein Fall ohne
solche Vorgaben nicht fair dargestellt werden, blockiert die Corpus-Validierung statt den Ausgang zu
codieren.

## 4. Live-Recording-Lane

Ein expliziter Maintainer-Befehl wählt:

- `surface`;
- Modell beziehungsweise konfigurierten Default;
- Serien-ID;
- exakt drei oder mehr Wiederholungen;
- optional einzelne Fall-ID zur Diagnose.

Für die erste verbindliche Serie wird genau eine unterstützte Surface mit konstantem Modell,
AGDF-Version, Adaptervertrag und relevanter Konfiguration verwendet. Cross-Surface-Vergleich ist
nicht erforderlich und wird nicht behauptet.

Jeder Aufruf:

1. validiert Fall, Serie, Wiederholungsindex und Source-Fingerprint;
2. materialisiert eine Wegwerf-Fixture;
3. erfasst den Vorher-Zustand;
4. ruft den Agenten read-only mit Blind-Prompt und JSON-Schema auf;
5. erfasst den Nachher-Zustand und blockiert unerlaubte Mutation;
6. normalisiert nur beobachtbare Ausgabefelder;
7. prüft Schema, Redaction und Provenienz;
8. persistiert die sichere Beobachtung atomar nur bei explizitem `--persist`.

Anders als ein Conformance-Recorder darf diese Lane eine sichere Beobachtung nicht wegen
`under_governance`, `over_governance` oder `ambiguous` verwerfen. Diese Ergebnisse sind der
Messgegenstand. Abgelehnt werden nur ungültige, unsichere, mutierende, nicht redigierbare oder
provenienzlose Beobachtungen.

## 5. Agent-Ausgabevertrag

Der Agent liefert ausschließlich:

- `schema_version`;
- `observed_delivery_path` aus den sechs Pfaden oder `null`;
- `ambiguous` als Boolean;
- kurze sichtbare `rationale`;
- `decision_grounds` als begrenzte Liste kanonischer, für die Entscheidung relevanter Gründe.

Der Vertrag fordert kein Hidden Reasoning. Freitext wird längenbegrenzt und auf verbotene
Datenklassen geprüft. Unbekannter Pfad, widersprüchliche Kombinationen oder unvollständige Ausgabe
werden als ungültige Beobachtung gespeichert oder fail-closed als `ambiguous` normalisiert; die
genaue Trennung wird im TP negativ getestet.

`compact_delivery` ist nur gültig, wenn `decision_grounds` genehmigte UR plus abgeschlossene
Brownfield-Entscheidung und gespeicherten `quick_task`-Kontext sichtbar machen. Andernfalls wird die
Beobachtung `ambiguous`.

## 6. Observation-Vertrag

Eine persistierte Observation enthält:

- `observation_id`, `case_id`, Serien-ID und Wiederholungsindex;
- `evidence_kind: live_agent_observation`;
- Surface, Runtime-/Hostversion, AGDF-Version, Modell und Adapterversion;
- Source-Fingerprint und UTC-Zeitpunkt;
- beobachteten Pfad, Ambiguität, kurze Begründung und Entscheidungsgründe;
- Ausführungs-, Redaction- und Mutationsstatus;
- keine Baseline-Soll- oder Gradingfelder.

Die Kombination aus Serie, Fall und Wiederholungsindex ist eindeutig. Persistenz überschreibt
keine vorhandene Beobachtung ohne explizites Replace-Flag; dieses Flag bleibt außerhalb normaler
CI-/Eval-Läufe und muss alte/neue Provenienz sichtbar machen.

## 7. Source-Fingerprint und Freshness

Der Fingerprint umfasst mindestens:

- Blind-Case und Fixture;
- `gate-check`-Skill sowie Plugin-Routing-Eintrag;
- `modes.md`, `gate-transition.md` und relevante Scope-/Interaction-Verträge;
- Agent-Ausgabevertrag, Normalisierung und Adapterversion.

Baseline-Sollpfad und -Begründung werden nicht in den Live-Prompt aufgenommen, dürfen aber im
Offline-Corpus-Fingerprint enthalten sein.

Eine Behavior-Owner-Änderung macht Observationen stale. Offline-Eval blockiert dann. Automatische
Fingerprint-, Observation- oder Golden-Aktualisierung ist verboten.

## 8. Deterministische Offline-Lane

Der Offline-Runner:

1. validiert Baseline 1.0.0, Blind-Corpus, Manifest und vollständige Observation-Serie;
2. fordert je Fall mindestens drei gültige, frische Wiederholungen;
3. verbindet Soll und Observationen erst nach abgeschlossener Aufnahme über `case_id`;
4. klassifiziert jede Beobachtung deterministisch;
5. bildet Pfadverteilung und einstimmigen Konsens je Fall;
6. berechnet kritische Unter-Governance, Small-Segment-Over-Governance und Ambiguität;
7. erzeugt stabiles JSON und Markdown aus einem Ergebnisobjekt;
8. beendet jeden Schema-, Stale-, Coverage-, Ambiguous- oder Schwellenblock ungleich null.

Pfadrangfolge für den reinen Vergleich:

`trivial_change < quick_task < compact_delivery < verified_change < structured_slice < structured_delivery`

Sie ist keine Runtime-Policy und wird nicht außerhalb des Benchmark-Evaluators verwendet.

## 9. Aggregationsregeln

- Gleicher Beobachtungs- und Sollpfad: `correct`.
- Beobachtung leichter als Soll: `under_governance`.
- Beobachtung schwerer als Soll: `over_governance`.
- `null`, ungültiger Kontext oder explizite Mehrdeutigkeit: `ambiguous`.

Ein Fall besitzt nur bei identischen gültigen Wiederholungen einen Konsenspfad. Gemischte
Verteilungen blockieren als `ambiguous`.

Jede kritische `under_governance`-Beobachtung blockiert, auch wenn andere Wiederholungen korrekt
sind. Small-Segment-Over-Governance wird auf einstimmig überklassifizierten Fällen gegen acht
Sollfälle berechnet; gemischte Fälle blockieren separat. Raten werden vor dem Vergleich nicht
gerundet.

## 10. Bericht

Das stabile JSON enthält:

- Baseline-, Corpus-, Observation-, Runner- und Adapterversionen;
- konkrete Series-/Surface-/Modell-/AGDF-Provenienz;
- Wiederholungszahl und Freshness;
- 40 Fälle mit Sollpfad, Beobachtungsverteilung, Einzelklassifikationen, Konsens und Fallstatus;
- Coverage, adversariale Coverage, exakte Nenner/Raten und blockierende IDs;
- Evidenzgrenze `live routing observations with deterministic offline grading`.

Markdown zeigt dieselben Kerndaten kompakt und führt keine eigene Berechnung durch.

Volatile Aufzeichnungszeitpunkte dürfen bei einem Replay erhalten bleiben, beeinflussen aber nicht
die semantische Sortierung. Zwei Offline-Läufe über dieselbe Serie liefern semantisch identisches
JSON.

## 11. Sicherheit und Isolation

- Wegwerf-Workspaces; keine Nutzerprojekte oder fremden Runs als Mutation Target.
- Read-only Agentaufruf; Vorher-/Nachher-Snapshot auch bei Fehler und Timeout.
- Kein Netzwerk außer dem ausdrücklich gewählten Agentadapter.
- Keine Secrets, Tokens, Cookies, Accounts, privaten Vollprompts, vollständigen Attachments,
  Hidden Reasoning oder unnötigen absoluten Benutzerpfade.
- Prompt- und Observation-Dateien werden über Positivlisten erzeugt.
- Live-Aufzeichnung läuft nie automatisch in Standard-CI, Publish oder Package Smoke.
- Ein unerwarteter Zustandswechsel stoppt die Serie.

## 12. Script- und CI-Integration

Interne Scripts:

- `eval:proportionality:record` für explizite Live-Aufzeichnung;
- `eval:proportionality` für deterministisches Offline-Grading;
- `test:proportionality` für Contracts, Safety, Recorder-Seams, Grader und Berichte.

Es entsteht kein öffentlicher `@agdf/cli`-Befehl.

Nur Offline-Grading einer bewusst eingecheckten vollständigen Serie darf nach Stabilitätsnachweis in
Aggregate Smoke/CI aufgenommen werden. Live-Aufzeichnung bleibt manuell beziehungsweise separat
credentialled.

## 13. Teststrategie

- Blindness: Agentinput enthält in 40/40 Fällen keinen Sollpfad, keine Baseline-Begründung, Schwelle
  oder frühere Observation.
- Contracts: ungültige Baseline, Corpus, Observation, Serien-ID, Wiederholungszahl und Provenienz.
- Recorder: Erfolg, Timeout, malformed output, Mutation, Redaction, atomare Persistenz,
  Duplicate/Replace und Persistenz sicherer negativer Routingresultate.
- Fingerprint: stabile Wiederholung, relevante Stale-Änderung, irrelevante Stabilität und kein
  Auto-Rewrite.
- Grading: alle Pfadpaare, kritische Unter-Governance, `0/8`, `1/8`, exakte 10-%-Grenze,
  gemischte Verteilung und fehlende Wiederholung.
- Reports: stabile Sortierung, semantische Replay-Gleichheit, JSON-/Markdown-Parität und
  Provenienzgrenze.
- Regression: Skill Evals, Gate/Mode/Control-State, Interaction, Verified Change, Delivery Path
  Search, Runtime Integrity und Diff-Check ohne geschwächte Assertions.

## 14. Akzeptanzabbildung

| PRD | SD-Entscheidung |
|---|---|
| PBM-1, PBM-2 | strikter Baseline-/Corpus-Loader |
| PBM-3 | explizite Blind-Live-Serie mit mindestens 120 Observationen |
| PBM-4 | getrennte Baseline-, Blind-Case-, Observation- und Gradingverträge |
| PBM-5 | vollständige Wiederholung plus Einstimmigkeit; sonst `ambiguous` |
| PBM-6 | jede kritische Under-Observation blockiert |
| PBM-7 | einstimmige Small-Case-Rate plus separater Mixed-Block |
| PBM-8 | Kontextvalidierung für Compact; kein neuer Runtime-Modus/Classifier |
| PBM-9 | ein Ergebnisobjekt für JSON und Markdown |
| PBM-10 | Behavior-Owner-Fingerprint und verbotenes Auto-Rewrite |
| PBM-11 | vollständige negative Contract-/Safety-/Grading-Familien |
| PBM-12 | additive interne Integration und unveränderte Regressionen |
| PBM-13 | vollständige Series-/Surface-/Modell-/AGDF-Provenienz und ehrliche Evidenzgrenze |
| PBM-14 | read-only Diagnose ohne Reparaturpfad |

## 15. Verworfene Alternativen

- Decision-Fixtures, die Pfad/Modus bereits als Input enthalten;
- neuer deterministischer Task→Pfad-Classifier;
- Sollpfad oder Baseline-Begründung im Agentprompt;
- sichere Under-/Over-/Ambiguous-Beobachtung vor Persistenz verwerfen;
- Replay als frische Agent-Ausführung ausgeben;
- Live-Aufzeichnung automatisch in Standard-CI ausführen;
- Delivery Path Search zum Router machen.

## 16. Nächster Schritt

TP Revision 2 prüfen. Erst nach exaktem `Approval: TP` folgt eine erneute Pre-Implementation
Brownfield Analysis; Implementierung und Live-Aufzeichnung bleiben bis zu deren `pass` gesperrt.
