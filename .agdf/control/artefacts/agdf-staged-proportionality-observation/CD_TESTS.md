# CD+Tests: Stufengerechte Proportionalitätsbeobachtung

Status: `done`
Decision: `implemented_and_tested_with_product_block`
Date: 2026-07-29
Run: `agdf-staged-proportionality-observation`
Based on: genehmigter TP Revision 1

## Implementierung

Die bestehende Proportionalitäts-Pipeline wurde ohne zweiten Runner, Executor, Reporter oder
Routingowner um die Profile `legacy-v1` und `staged-v2` erweitert. Staged-v2 trennt aktuelle nächste
Stufe und späteren Delivery Path über 40 Fälle und 72 blinde Scenarios. Historische v1-Evidenz wird
über eine feste Provenienzdatei als `historical` statt fälschlich als aktuell frisch replayt.

Umgesetzt wurden insbesondere:

- Schema v2, Achseninvarianten und nicht autorisierender Blind-Prompt;
- 40 Intake-, 6 Post-Brownfield-Decision- und 26 Brownfield-Candidate-Scenarios;
- Leakage-Prüfung und `PB-008` als read-only Zielklärung;
- profilfähiger Loader, Recorder, Fingerprint, Evaluator, Reporter und bestehende CLIs;
- atomare Observation-Persistenz, Duplicate-/Replacement-Schutz und Attempt-Log;
- synthetische 216er Pass-/Negativserien sowie Legacy-Integritätsprüfung;
- explizite Corpus-/Fixture-Provenienz, AD-10-Pfadvokabular und vollständige 13×13-Stage-Projektion;
- adversariale Leakage-, CLI-Profil- und Provenienzdrifttests;
- neue Live-Serie
  `codex-gpt-5.6-sol-agdf-0.11.4-staged-v2-20260729-r3` mit Adapter `2.1.0`,
  Corpus/Fixture `2.0.0`.

## Ausführungsabweichung

Eine erste persistierte Serie wurde nach 21 gültigen und fünf wiederholten
`PROPORTIONALITY_OUTPUT_INVALID`-Versuchen bei `PB-008:intake` kontrolliert beendet. Ursache war,
dass der Prompt die genehmigte AD-5-Invariante für angeforderte Achsen nicht explizit transportierte.
Nach der wortgleichen Klarstellung wurden fokussierte Tests, vollständiger Package-Smoke und ein
3/3-PB-008-Smoke erneut ausgeführt. Die abgebrochene Serie wurde weder überschrieben noch als
Benchmark-Evidenz verwendet. Die technisch vollständige r2-Serie wurde nach dem Code Review
ebenfalls unverändert unter `STAGED_PROPORTIONALITY_REPORT_R2.*` bewahrt; wegen der
provenienzrelevanten Korrekturen wurde ausschließlich r3 als aktuelle Evidenz verwendet.

## Testevidenz

| Prüffeld | Ergebnis | Evidenz |
|---|---|---|
| AGDF Doctor | pass | 0 Findings |
| fokussierte Proportionalitätstests | pass | v1/v2, 40/72, adversariale Leakage, CLI-Mismatch, 13×13 Stage, 6×6 Path, Provenienz, Safety, Freshness und Reports |
| synthetische Vollserie | pass | 216/216; Missing, Mixed, Stale, Critical Under, Stage Over und 10/12,5-%-Grenzen geprüft |
| vollständiger Package-Smoke | pass | nach Adapter 2.1; Runtime Integrity, 47/47 Skill-Evals, Package und Routing grün |
| Diffqualität | pass | `git diff --check` |
| historische Integrität | pass | Report `c2f5…1f6`, QA `053b…682`, Attempts `026f…be0`; r2-Reports `dccd…c20`/`f386…e2cc` unverändert |
| staged Evidenzreferenzen | pass | 40/40 auflösbar |
| Live-Preflight | pass | Codex 0.145.0, `gpt-5.6-sol`, Ziel leer, 72 × 3, Limit 230 |
| Live-Serie r3 | pass technisch | 216/216 gültig, 217 Versuche, ein Timeout-Retry bei `PB-024:brownfield_candidate`, 0 Mutation/Redaction/Contractfehler |
| Offline-Replay | pass deterministisch | JSON und Markdown in zwei Läufen byte-identisch |
| fachlicher Reportstatus | block | Stage-Abweichung, Critical Under und Mixed/Ambiguous |

## Live-Ergebnis

- Freshness: `fresh`
- gültige Observationen: `216/216`
- Stage-Abweichungen: `PB-008:intake`, `PB-010:intake`, `PB-011:intake`
- Critical Under: `PB-010:intake`, `PB-011:intake`
- Mixed/Ambiguous: acht Scenarios
- Small-Segment Over-Governance: `0/8` (`0 %`)
- deterministischer Reportstatus: `block`

Berichte:

- `STAGED_PROPORTIONALITY_REPORT.json`
- `STAGED_PROPORTIONALITY_REPORT.md`

## Geschlossene Reviewbefunde

- `CR-SPT-01`: `corpus_version` und `fixture_version` werden geladen, persistiert,
  serienweit geprüft und bei Resume gegen Drift validiert;
- `CR-SPT-02`: staged Pfadklassifikationen verwenden exakt
  `path_correct | path_under_governance | path_over_governance | path_ambiguous`;
- `CR-SPT-03`: alle 169 Kombinationen des 13×13-Stage-Vokabulars werden deterministisch als
  correct, unsafe advance oder over-governance projiziert;
- `TPR-SPT-01`: adversariale Leakage- und vollständige CLI-Missing-/Mismatch-Tests sind grün.

Der verbleibende Block ist damit kein Implementierungs- oder Evidenzgap des Benchmarks, sondern ein
reproduzierbar gemessener Produktbefund innerhalb der genehmigten Conformance-Grenzen.
