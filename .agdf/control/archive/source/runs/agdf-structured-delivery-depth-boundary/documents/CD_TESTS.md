# CD+Tests: Structured Delivery Depth Boundary

Status: `done`
Decision: `pass`
Date: 2026-07-29
Evidence revision: 2026-08-19
Run: `agdf-structured-delivery-depth-boundary`
Based on: genehmigter TP Revision 1 und bestandene Pre-Implementation Brownfield Analysis

## Ergebnis

Die Structured-Depth-Grenze ist innerhalb der genehmigten Allowlist umgesetzt. `modes.md` ist der
einzige normative Owner; Gate Transition, Brownfield Skill und Review-Template konsumieren diese
Semantik. Runtime Integrity prüft die strukturellen Invarianten, zehn deterministische Depth-Fälle
decken einschließlich eigener Fälle für alle sechs Full-Depth-Triggerfamilien die genehmigten
Entscheidungsgrenzen ab, und drei bestehende Context-Graph-Knoten sind
reconciled. Es wurde keine zweite Policy-Engine, kein neuer Mode/Gate/Approval-Wert und kein neues
öffentliches Schema eingeführt.

## Task-Evidenz

| Task | Status | Evidenz |
|---|---|---|
| SDB-T01 | done | `BROWNFIELD_ANALYSIS.md`; Baseline-Commit, zehn Kandidatenhashes, Reuse und Ausschlüsse |
| SDB-T02 | done | `plugin/meta/contracts/modes.md`: vollständiger `Structured Depth Decision` Owner |
| SDB-T03 | done | `gate-transition.md`: Owner-Verweis und unresolved → bestehender `block` |
| SDB-T04 | done | Brownfield Skill: Facts, Matrixkonsum, positive/unresolved Persistenz und Recovery |
| SDB-T05 | done | Brownfield-Template: sieben Metadatenfelder und sieben Check-IDs |
| SDB-T06 | done | Runtime Integrity: Owner-, Reason-Code-, Check-, Skill- und Template-Invarianten |
| SDB-T07 | done | drei neue negative Mutationen für Ownersektion, Templatefeld und Skill-Recovery |
| SDB-T08 | done | sechs geplante Depth-Fälle plus vier QA-Evidenzfälle für die übrigen Full-Depth-Triggerfamilien |
| SDB-T09 | done_with_deviation | 58 Replay-Beobachtungen grün; siehe Provenienzabweichung |
| SDB-T10 | done | drei vorhandene Context-Graph-Knoten erweitert, kein neuer Knoten |
| SDB-T11 | done | zwei Sync-Läufe: jeweils 169 Dateien, SHA-256 `4e7f0586…f071e36` |
| SDB-T12 | done | alle fokussierten Tests grün |
| SDB-T13 | done | vollständiger Smoke-Test und run-spezifischer Doctor/Gate Check grün |
| SDB-T14 | done | CD+Tests, TP Review, Clean Review und Code Review dokumentiert; QA vorbereitet |

## Implementierte Entscheidungsfälle

| Fall | Ergebnis |
|---|---|
| bounded multi-owner | `structured_slice`, `bounded_structured_slice` |
| single-owner policy | `structured_delivery`, `authority_policy_security_depth` |
| broad migration | `structured_delivery`, `persistence_migration_depth` |
| architecture/runtime boundary | `structured_delivery`, `architecture_runtime_depth` |
| external/public contract | `structured_delivery`, `external_contract_depth` |
| release/cross-host activation | `structured_delivery`, `release_cross_host_depth` |
| unbounded owner/consumer coordination | `structured_delivery`, `unbounded_consumer_coordination` |
| missing fact | `block`, `depth_facts_missing`, Owner-Evidenz und Re-Evaluation |
| conflicting facts | `block`, `depth_facts_conflicting`, Konflikt zum Owner |
| numeric proxy | Proxy abgelehnt; vollständige Depth Facts erforderlich |

## Testevidenz

| Validierung | Ergebnis |
|---|---|
| SDB-V01 Syntax/Patch | `node --check` für beide JS-Dateien und `git diff --check`: pass |
| SDB-V02 Runtime Integrity | Source: 10 Skills/16 Control Files pass; Installed/Layout pass |
| SDB-V03 Negative Integrity | bestehende und drei neue Negativfälle pass |
| SDB-V04 Skill-Evals | `test:skill-evals` pass; `eval:skills` 58/58 pass; every Full-Depth reason code has exactly one dedicated positive case; deterministic replay, not live host execution |
| SDB-V05 Gate/Control | Control State, Interaction Presentation und Verified Change pass |
| SDB-V06 Packaging | zweifacher Sync byte-identisch; Package Contents 240 Dateien; Package Build pass |
| SDB-V07 Vollregression | `npm --prefix create-agdf run smoke-test`: pass einschließlich Proportionalität, Delivery Path Search, OpenCode und Routing |
| SDB-V08 Isolation | zehn Child-Kandidaten geändert; 715 bereits fremde ausgeschlossene Statuszeilen nicht durch den Child mutiert |
| SDB-V09 Control/Graph | run-spezifischer Doctor 0 Findings; Gate Check bei `CD+Tests`; All-Active nur 12 erklärte Warnungen in zwei fremden Runs; drei bestehende Graphknoten reconciled |

## Provenienzabweichung zu SDB-T09

Der TP erwartete, dass ausschließlich der Brownfield-Fingerprint geändert werden müsse. Der
fokussierte Eval-Lauf widerlegte diese Annahme fail-closed: `gate-transition.md` ist bereits als
`relevant_source` für sechs weitere Skillfamilien registriert. Seine genehmigte Änderung
invalidierte daher deterministisch auch deren Provenienz.

Aktualisiert wurden nur die tatsächlich neu berechneten Fingerprints für:

- `brownfield-analysis`;
- `delivery-path-search`;
- `ux-intent-definition`;
- `clean-implementation-review`;
- `delivery-closeout`;
- `gate-check`;
- `release-or`.

Die Beobachtungsinhalte der bestehenden Fälle wurden nicht verändert. Nach der
Provenienzaktualisierung bestanden alle damals 53 Fälle. Dies erweitert weder Produktsemantik noch
Mutationsscope; es korrigiert eine nachweislich falsche TP-Annahme innerhalb des bereits
genehmigten `evals/manifest.json`-Pfads.

## QA Evidence Gap Closure — 2026-08-19

The QA assessment identified that four approved Full-Depth trigger families had static contract
coverage but no dedicated semantic eval case. The existing eval owner was extended with one positive
case each for `architecture_runtime_depth`, `external_contract_depth`,
`release_cross_host_depth`, and `unbounded_consumer_coordination`. The change stays inside the
approved allowlist and the SD requirement to add at least the originally listed cases. Corpus version
`1.5.2`, the Brownfield fingerprint and deterministic replay were updated through the existing
provenance path. Focused verification passes at 58/58 cases.

## Scope-Isolation

- Child-Produktpfade entsprechen der Source-Allowlist.
- `evals/proportionality/**`, `create-agdf/lib/proportionality-benchmark/**`,
  `create-agdf/lib/skill-evals/live-recorder.js`,
  `create-agdf/lib/control-evaluation/gate-policy.js` und ihre fremden Artefakte wurden nicht
  mutiert.
- Der vollständige bestehende Proportionalitätstest ist weiterhin grün.
- `create-agdf/generated/**` wurde ausschließlich durch `sync-package-assets` erzeugt und bleibt
  abgeleitet.

## Evidenzgrenze

Repositorytests beweisen Contract-, Struktur-, Eval- und Packagekonsistenz. Instruction-Assertions
beweisen nicht die semantische Befolgung durch jedes Modell, und deterministic replay ist kein
direkter Live-Host-Nachweis. Diese Grenze ist für QA offen ausgewiesen und kein versteckter
Pass-Claim.

## Nächster Schritt

Task Plan Review, Clean Implementation Review und Code Review durchführen; offene Befunde vor dem
QA Gate lösen oder fail-closed routen.
