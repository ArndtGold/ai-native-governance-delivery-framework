# CD+Tests: AGDF Proportionality Benchmark

Status: `done`
Benchmark decision: `block`
Date: 2026-07-28
Run: `agdf-proportionality-benchmark`
Approved TP: Revision 2

## Delivered

- gemeinsamer read-only Structured-Agent-Executor für bestehenden Skill-Recorder und neuen
  Proportionality-Recorder;
- strikte Baseline-, Corpus-, Fixture-, Agent-Output- und Observation-Contracts;
- 40-Fall-Blind-Corpus mit notwendigem, ergebnisfreiem Control-State-Kontext;
- Source-Fingerprint über Behavior Owner, Blind-Prompt, Outputvertrag, Normalisierung und Adapter;
- Wegwerf-Fixture, Vorher-/Nachher-Snapshot, Mutationsstopp, Redaction und atomare Persistenz;
- expliziter Codex-Recorder mit fixer Surface-/Modell-/AGDF-/Baseline-/Adapter-Serie,
  120-Sekunden-Timeout, Parallelität 1, maximal 130 Versuchen und sicherer Resume-Funktion;
- deterministischer Evaluator für alle sechs Pfade, vier Fehlerklassen, Konsens, Coverage,
  Freshness, kritische Under-Governance und Small-Segment-Over-Governance;
- stabiles gemeinsames Ergebnisobjekt für JSON und Markdown;
- interne Package-Scripts `eval:proportionality:record`, `eval:proportionality` und
  `test:proportionality`; kein öffentlicher CLI-Befehl und kein Live-Recording in Standard-CI.

## Implementation Paths

- `create-agdf/lib/live-agent/read-only-structured.js`
- `create-agdf/lib/proportionality-benchmark/`
- `create-agdf/scripts/record-proportionality-benchmark.js`
- `create-agdf/scripts/run-proportionality-benchmark.js`
- `create-agdf/scripts/proportionality-benchmark-test.js`
- `create-agdf/package.json`
- `evals/proportionality/`

## Focused And Regression Evidence

| Check | Result |
|---|---|
| `npm --prefix create-agdf run test:proportionality` | pass |
| `npm --prefix create-agdf run test:skill-evals` | pass |
| `npm --prefix create-agdf run eval:skills` | pass, 47/47 Fälle, 10 Skills |
| `npm --prefix create-agdf run test:control-state` | pass |
| `npm --prefix create-agdf run test:interaction-presentation` | pass |
| `npm --prefix create-agdf run test:verified-change` | pass |
| Delivery Path Search focused/unit/generator | pass |
| Runtime Integrity layout/negative/source | pass |
| Package build/contents | pass |
| `npm --prefix create-agdf run smoke-test` | pass einschließlich `test:proportionality` |
| `git diff --check` | pass |
| deterministischer Report-Replay | pass; zweimal SHA-256 `c2f5bd65846e9c1aec34230df78c04297ed397c668c206ade98bac62caeeb1f6` |

## Live Recording Evidence

### Historische Serie — nicht als aktuelle Evidenz verwendet

- series: `codex-gpt-5.6-sol-agdf-0.11.4-20260728`
- 120 gültige Observationen aus 121 Versuchen;
- ein dokumentierter `GENERATOR_TIMEOUT`, keine Mutation/Redaction-Verletzung;
- nach Review als stale erkannt, weil der ursprüngliche Fingerprint Outputvertrag,
  Normalisierung und Baseline-Provenienz nicht vollständig abdeckte;
- bleibt historische Implementierungsevidenz und wird vom aktuellen Evaluator fail-closed abgelehnt.

### Verbindliche frische Serie

- series: `codex-gpt-5.6-sol-agdf-0.11.4-20260728-v2`
- surface: `codex`
- runtime: `codex-cli 0.145.0`
- model: explizit `gpt-5.6-sol`
- AGDF: `0.11.4`
- baseline: `1.0.0`
- adapter: `1.1.0`
- 40/40 Fälle × genau drei Wiederholungen = 120/120 gültige Observationen;
- 120 Versuche, 0 ungültige Versuche, 0 Mutationen, 0 Redaction-Verletzungen;
- `attempts.json` und jede Observation wurden atomar unter
  `evals/proportionality/observations/<series-id>/` persistiert.

## Deterministic Benchmark Result

Quelle:

- `PROPORTIONALITY_BENCHMARK_REPORT.json`
- `PROPORTIONALITY_BENCHMARK_REPORT.md`

| Ergebnis | Wert |
|---|---:|
| Status | `block` |
| Freshness | `fresh` |
| gültige Observationen | 120 |
| Fälle | 40 |
| adversariale Fälle | 19 |
| vollständig korrekt | 13 |
| ambiguous/block | 27 |
| kritische Under-Governance | 0 |
| Small-Segment Over-Governance | 0/8 = 0 % |

Blockierende IDs:

`PB-008`, `PB-015` bis `PB-040`.

Die 27 Fälle sind mehrdeutig, weil die aktuelle Agent-Routinglogik ohne evidenzierte UR-/
Brownfield-/Mode-Slice-Vorstufe keinen späteren Delivery Path vorwegnimmt. Das ist ein valides
Live-Messergebnis. Es wurde weder verworfen noch im selben Run durch Prompt-, Corpus- oder
Wiederholungsoptimierung repariert.

## Evidence Boundary

Die Serie belegt Live-Routingbeobachtungen auf genau einer authentifizierten Codex-Surface mit
deterministischem Offline-Grading. Sie belegt keine Cross-Surface-Konformität, keine deterministische
Modellentscheidung und keine Produktreife. Replay ersetzt keine frische Agentbeobachtung.

## Next Step

Pflichtreviews und QA gegen den blockierenden Benchmark-Befund ausführen. UAT, VCS und Release
bleiben gesperrt.
