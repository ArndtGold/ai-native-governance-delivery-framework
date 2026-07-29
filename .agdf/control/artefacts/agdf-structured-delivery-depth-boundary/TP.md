# Task/Test Plan: Structured Delivery Depth Boundary

Status: `approved`
Gate: TP
Revision: 1
Date: 2026-07-29
Run: `agdf-structured-delivery-depth-boundary`
Based on: genehmigte UR, genehmigtes PRD und genehmigtes SD jeweils Revision 1
Approval: Exaktes `Approval: TP` am 2026-07-29 nach Revalidierung von Run, Gate, Revision 1 und Artefakt.

## 1. Ziel

Die genehmigte Structured-Depth-Produktsemantik mit genau einem normativen Modes-Owner,
fail-closed Brownfield-Evidenz, deterministischer Propagations-/Eval-Evidenz und unveränderten
kompakten Pfaden umsetzen.

## 2. Eintrittsbedingungen

Vor Implementierung müssen erfüllt sein:

- exaktes `Approval: TP`;
- run-spezifischer Doctor und Gate Check ohne Block-/Revise-Befund;
- `pre_implementation_analysis` für die genehmigten Kandidatenpfade;
- Baseline-Commit, Kandidatenhashes und aktueller tracked/untracked Worktree-Snapshot;
- Bestätigung, dass alle kanonischen Kandidatenpfade frei von fremden Änderungen sind;
- unveränderte Ausschlussgrenze für `evals/proportionality/**`, Proportionalitätsimplementierung,
  Live Recorder, Benchmarkartefakte und QA-Transition-Child.

## 3. Aufgabenplan

| Task ID | Aufgabe | PRD-Bezug | Zielpfade | Akzeptanz |
|---|---|---|---|---|
| SDB-T01 | Pre-Implementation Brownfield Analysis durchführen; Owner, Reuse, Kandidatenstatus, Baselinehashes, Propagation und Regressionen bestätigen. | P01, P10, P11 | `BROWNFIELD_ANALYSIS.md` | pass; keine fremde Kandidatenänderung; Allowlist und Ausschlüsse dauerhaft erfasst |
| SDB-T02 | `Structured Depth Decision` als vollständigen normativen Abschnitt im Modes Contract ergänzen. | P01–P10 | `plugin/meta/contracts/modes.md` | Eintrittsvoraussetzungen, sechs Triggerfamilien, sieben Slice-Checks, unresolved-Regel, Proxy-Verbot, Gate-Parität und neun Reason Codes vollständig |
| SDB-T03 | Gate Transition auf den Modes-Owner ausrichten und unresolved → bestehenden `block`-Pfad festlegen, ohne Matrixduplikation. | P01, P05, P07, P09, P11 | `plugin/meta/contracts/gate-transition.md` | genau ein normativer Owner; bestehende Mode-/Gate-/Approval-Werte unverändert |
| SDB-T04 | Brownfield Skill um Structured-Depth-Fakten, Matrixanwendung, atomare Persistenz, rejected alternative und Recovery erweitern. | P02–P09, P11 | `plugin/skills/brownfield-analysis/SKILL.md` | positive Entscheidungen nur mit vollständiger Evidenz; missing/conflicting → block; keine numerische Proxy-Entscheidung |
| SDB-T05 | Brownfield-Review-Template um Metadaten und sieben evidenzierte Slice-Checks ergänzen. | P03, P05, P06, P08, P11 | `plugin/control/templates/artefacts/BROWNFIELD_REVIEW.md` | alle SD-4-Felder und Check-IDs vorhanden; keine zweite Semantik |
| SDB-T06 | Runtime Integrity um Owner-, Referenz-, Reason-Code-, Skill- und Template-Invarianten erweitern. | P01, P03, P05, P11, P12 | `plugin/scripts/check-runtime-integrity.mjs` | fehlende/gedriftete Depth-Grenze scheitert verständlich; Source- und Installed-Mode grün |
| SDB-T07 | Negative Runtime-Integrity-Fixtures für entfernten Modes-Owner, fehlende Templatefelder und fehlende Skill-Recovery ergänzen. | P01, P05, P11, P12 | `create-agdf/scripts/runtime-integrity-negative-test.js` | jede gezielte Entfernung erzeugt den erwarteten Fail-Closed-Befund |
| SDB-T08 | Sechs deterministische Brownfield-Depth-Fälle ergänzen: bounded multi-owner, single-owner policy, broad migration, missing, conflicting und numeric-proxy adversarial. | P02–P06, P08, P12 | `evals/cases/brownfield-analysis.json` | erwartete Skill-Aktionen und verbotene Fehlklassifikationen pro Fall explizit |
| SDB-T09 | Deterministic Replay und ausschließlich den Brownfield-Skill-Fingerprint aktualisieren; Evidenzgrenze unverändert lassen. | P11, P12 | `evals/observations/deterministic-replay.json`, `evals/manifest.json` | alle Offline-Evals 100%; Replay bleibt ausdrücklich kein Live-Host-Nachweis |
| SDB-T10 | Bestehende Context-Graph-Knoten um Modes-owned Depth-Invariante, Slice-/Full-Tiefe und unresolved Recovery ergänzen. | P01, P05–P07, P10 | `.agdf/control/CONTEXT_GRAPH.md` | bestehende drei Knoten aktualisiert; kein neuer Knoten; Reconciliation resolved |
| SDB-T11 | Kanonische Assets über bestehenden Sync propagieren und Idempotenz prüfen. | P01, P11 | abgeleitete `create-agdf/generated/**`-Flächen | zweiter Sync erzeugt keine weitere Abweichung; Package-/Surface-Parität grün |
| SDB-T12 | Fokussierte Runtime-Integrity-, Eval-, Control-State- und Packageprüfungen ausführen. | P01–P12 | Tests/Evidenz | alle in Abschnitt 5 definierten fokussierten Befehle grün |
| SDB-T13 | Vollständige Package-Smoke-Suite und run-spezifischen versionsgleichen Doctor/Gate Check ausführen. | P07, P09, P11, P12 | gesamte unterstützte Runtime | vollständige Suite grün; keine neue Warn-/Blockklasse im Child |
| SDB-T14 | CD+Tests, Task Plan Review, Clean Implementation Review und Code Review mit Task-/Testtraceability dokumentieren; QA vorbereiten. | P01–P12 | Child-Artefakte | 14/14 Tasks evidenziert oder klar abweichend; keine offenen Review-Blocker vor QA |

## 4. Zulässiger Implementierungsscope

### Kanonische Source-Allowlist

- `plugin/meta/contracts/modes.md`
- `plugin/meta/contracts/gate-transition.md`
- `plugin/skills/brownfield-analysis/SKILL.md`
- `plugin/control/templates/artefacts/BROWNFIELD_REVIEW.md`
- `plugin/scripts/check-runtime-integrity.mjs`
- `create-agdf/scripts/runtime-integrity-negative-test.js`
- `evals/cases/brownfield-analysis.json`
- `evals/manifest.json`
- `evals/observations/deterministic-replay.json`
- `.agdf/control/CONTEXT_GRAPH.md`
- Child-Control-Artefakte unter
  `.agdf/control/artefacts/agdf-structured-delivery-depth-boundary/**`
- Child-Run-State, Parent-Backlog und WS-02-Koordinationszeile

### Abgeleitete Pfade

- ausschließlich durch `npm --prefix create-agdf run sync-package-assets`;
- `create-agdf/generated/**` bleibt Build-/Testartefakt und wird nicht als neuer kanonischer Owner
  behandelt.

### Ausgeschlossen

- `evals/proportionality/**`
- `create-agdf/lib/proportionality-benchmark/**`
- `create-agdf/lib/skill-evals/live-recorder.js`
- Proportionalitäts-/Staged-Berichte und Benchmarkartefakte
- `create-agdf/lib/control-evaluation/gate-policy.js` und QA-Transition-Testscope
- neue Mode-, Gate-, Approval-, CLI-Flag- oder öffentliche JSON-Schemawerte
- öffentliche Produktcopy, VCS, Release, Reinstall und Live-Host-Ausführung

Jede notwendige Änderung außerhalb der Allowlist stoppt die Implementierung und wird als
TP-/SD-Revision geroutet.

## 5. Testplan

### SDB-V01 — Source-Syntax und Patchintegrität

- `node --check plugin/scripts/check-runtime-integrity.mjs`
- `node --check create-agdf/scripts/runtime-integrity-negative-test.js`
- `git diff --check -- <genehmigte Allowlist>`

Erwartung: Exit 0; keine Whitespace-/Syntaxfehler.

### SDB-V02 — Runtime Integrity Source/Installed

- `node plugin/scripts/check-runtime-integrity.mjs`
- `npm --prefix create-agdf run test:runtime-integrity-layout`

Erwartung: Source- und installierter Packageaufbau akzeptieren genau dieselben Depth-Invarianten.

### SDB-V03 — Runtime Integrity Negative

- `npm --prefix create-agdf run test:runtime-integrity-negative`

Erwartung: Entfernte Modes-Ownersektion, fehlendes Depth-Templatefeld und fehlende Skill-Recovery
scheitern jeweils mit dem vorgesehenen Befund; unveränderte Negativfälle bleiben grün.

### SDB-V04 — Deterministische Skill-Evals

- `npm --prefix create-agdf run test:skill-evals`
- `npm --prefix create-agdf run eval:skills`

Erwartung:

- bisherige 47 plus sechs neue Fälle = mindestens 53/53 pass;
- bounded multi-owner → `structured_slice`;
- single-owner policy und broad migration → `structured_delivery`;
- missing/conflicting → block und Evidenz-/Owner-Recovery;
- numeric proxy wird als alleinige Grundlage abgelehnt;
- Evidenzboundary bleibt „deterministic replay, not live host execution“.

### SDB-V05 — Gate-/Control-Kompatibilität

- `npm --prefix create-agdf run test:control-state`
- `npm --prefix create-agdf run test:interaction-presentation`
- `npm --prefix create-agdf run test:verified-change`

Erwartung: bestehende Quick-/Compact-/Verified-Change-Grenzen, Gate-Reihenfolge, Breadcrumb,
Approval-Interaktion und bestehender `block`-Pfad unverändert grün.

### SDB-V06 — Propagation und Packaging

- `npm --prefix create-agdf run sync-package-assets`
- Sync ein zweites Mal und Snapshot/Diff vergleichen
- `npm --prefix create-agdf run test:package-contents`
- `npm --prefix create-agdf run test:package-build`

Erwartung: idempotente Ableitung; Codex-/Copilot-/OpenCode-/Packageflächen enthalten die
kanonischen Inhalte; keine zweite Policy.

### SDB-V07 — Vollständige Regression

- `npm --prefix create-agdf run smoke-test`

Erwartung: vollständige create-agdf-Suite grün, einschließlich Runtime Integrity, Skill-Evals,
Proportionalität, Delivery Path Search, OpenCode-Hardening, Packaging und Routing.

### SDB-V08 — Scope-Isolation

- Kandidatenhashes und `git status --porcelain` gegen SDB-T01-Baseline vergleichen;
- alle durch den Child neu veränderten Produktpfade gegen die Source-Allowlist prüfen;
- bestätigen, dass ausgeschlossene Proportionalitäts-/Staged-/Live-Recorder-Pfade gegenüber der
  Baseline unverändert sind.

Erwartung: keine Child-Mutation in ausgeschlossenen Pfaden; fremde bestehende Änderungen bleiben
isoliert und werden nicht als Testfehler oder Autorität umgedeutet.

### SDB-V09 — AGDF Control und Context Graph

- versionsgleicher `doctor --run agdf-structured-delivery-depth-boundary --json`
- versionsgleicher `gate-check --run agdf-structured-delivery-depth-boundary --json`
- `doctor --all-active --json` auf neue Backlog-Vokabularbefunde prüfen
- Context-Graph-Reconciliation gegen SDB-T10 prüfen

Erwartung: Child ohne Block-/Revise-Befund; keine neue Backlog-Status-/Labelabweichung;
Context Graph `resolved`.

## 6. Entscheidungsfall-Matrix

| Test ID | Ausgangsfakten | Erwartete Entscheidung | Primärer Reason Code |
|---|---|---|---|
| SDB-D01 | mehrere Owner/Consumer; alle sieben Checks pass; keine Trigger | `structured_slice` | `bounded_structured_slice` |
| SDB-D02 | ein Owner; Policy-/Permission-Impact belegt | `structured_delivery` | `authority_policy_security_depth` |
| SDB-D03 | koordinierter Cutover oder nicht lokaler Rollback | `structured_delivery` | `persistence_migration_depth` oder `unbounded_consumer_coordination` |
| SDB-D04 | entscheidender Check unknown | `block` | `depth_facts_missing` |
| SDB-D05 | Impactflag und Evidence widersprechen sich | `block` | `depth_facts_conflicting` |
| SDB-D06 | nur Owner-/Pathzahlen vorhanden | keine positive Entscheidung ohne vollständige Facts | `depth_facts_missing` |
| SDB-D07 | Quick/Compact-Voraussetzungen vollständig | unveränderter kompakter Pfad; Depth nicht anwendbar | `not_applicable` |
| SDB-D08 | Verified Change vollständig eligible | unveränderter `verified_change`; Depth erst bei Eskalation | `not_applicable` |

## 7. Requirement-Traceability

| PRD | Tasks | Tests |
|---|---|---|
| SDB-P01 | T02–T06, T10–T11 | V02, V03, V06, V09 |
| SDB-P02 | T02, T04, T08 | D02, D03, V04 |
| SDB-P03 | T02, T04–T05, T08 | D01, V03, V04 |
| SDB-P04 | T02, T04, T08 | D06, V04 |
| SDB-P05 | T02–T08 | D04, D05, V02–V04 |
| SDB-P06 | T04–T05, T08 | D01–D06, V04 |
| SDB-P07 | T02–T03, T12–T13 | V05, V07 |
| SDB-P08 | T02, T04, T08 | D02, D03, V04 |
| SDB-P09 | T02–T03, T12 | D07, D08, V05 |
| SDB-P10 | T01, T09, T14 | V08, Reviewevidenz |
| SDB-P11 | T03–T07, T10–T13 | V02–V07, V09 |
| SDB-P12 | T06–T09, T12–T14 | V03, V04, V07, Reviews |

## 8. Review- und QA-Reihenfolge

Nach Implementierung und Tests:

1. Task Plan Review gegen SDB-T01 bis SDB-T14;
2. Clean Implementation Review gegen zweiten Policy-Owner, Proxy-Engine, Shims und unnötige
   Schemaerweiterung;
3. Code Review auf Korrektheit, Regression, Security, Kompatibilität und Wartbarkeit;
4. QA Gate mit PRD-/TP-Traceability, Brownfield Fit, Lösungskonsistenz und offengelegter
   Instruction-Enforcement-Grenze;
5. erst nach QA-`pass` und exaktem `Approval: QA` UAT;
6. OR und Delivery Closeout ohne automatische VCS-Aktion.

## 9. Stop-/Revisionsbedingungen

- ein neuer Mode-, Gate-, Approval-, CLI- oder öffentlicher JSON-Wert wird erforderlich;
- maschinenprüfbare semantische Policy-Engine statt agent-native Contract wird erforderlich;
- ein ausgeschlossener Benchmark-/Proportionalitätspfad müsste verändert werden;
- ein kanonischer Kandidatenpfad enthält fremde Änderungen oder Scope kann nicht isoliert werden;
- bestehende kompakte Pfade müssten semantisch geändert werden;
- vollständige Suite scheitert an einem eigenen Befund, der nicht innerhalb der genehmigten
  Allowlist sauber lösbar ist.

Dann stoppt CD+Tests und routet zur frühesten betroffenen SD-/TP-/PRD-Revision.

## 10. Gate-Grenze

Dieser TP autorisiert keine Implementierung. Zur Freigabe ist der exakte Wert erforderlich:

`Approval: TP`
