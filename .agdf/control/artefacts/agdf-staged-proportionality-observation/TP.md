# Task and Test Plan: Stufengerechte Proportionalitätsbeobachtung

Status: `approved`
Gate: TP
Revision: 1
Date: 2026-07-29
Run: `agdf-staged-proportionality-observation`
Based on: genehmigtes SD Revision 1
Gate approval: exaktes `Approval: TP` am 2026-07-29 nach Revalidierung von Run, Gate, Revision 1 und dauerhaftem Artefakt

## 1. Ziel und Ausführungsgrenze

Die bestehende Proportionalitäts-Pipeline profil- und scenariofähig erweitern, historische
Benchmark-Evidenz unverändert bewahren, 40 Fälle über 72 Pflichtscenarios stufengerecht beobachten
und nach vollständiger Offline-Validierung eine neue frische Serie mit mindestens 216 gültigen
Observationen aufzeichnen.

Nach `Approval: TP` folgt zuerst eine Pre-Implementation Brownfield Analysis. Erst deren `pass`
erlaubt Code- oder Datendateiänderungen. Sie muss insbesondere die bereits vorhandenen,
uncommittierten Vorgänger-Benchmarkänderungen als explizite Ausgangsbasis inventarisieren und
fremden aktiven Scope isolieren.

Dieser TP autorisiert weder eine Änderung kanonischer Routing-/Gate-Semantik noch automatische VCS-
oder Release-Aktionen.

## 2. Aufgabenplan

| task_id | Aufgabe | Deckt ab | Akzeptanzevidenz | Stop-/Eskalationsbedingung |
|---|---|---|---|---|
| SPT-T01 | Pre-Implementation Brownfield Analysis ausführen: vorhandene/uncommittierte Vorgängeränderungen, Kandidatenpfade, fremden Scope, historische Hashes, gemeinsame Owner, Authentifizierung, Modell, Timeout, Attempt-Limit, Kosten-/Budgetgrenze und erlaubte Live-Pfade festhalten. | SPR-8, SPR-11, SPR-12, SPR-14; AD-1, AD-2, AD-12–AD-15 | `BROWNFIELD_ANALYSIS.md` mit `pass`, Baseline-Inventar und ausführbarem Preflight | fremder überlappender Scope nicht isolierbar; historische Hashabweichung; Host/Modell nicht verfügbar; unklare Kosten- oder Mutationsgrenze |
| SPT-T02 | `legacy-v1-provenance.json` aus aktueller historischer Evidenz erzeugen und feste Integritätsprüfungen für Baseline, Manifest, Cases, Fixture, Vorgänger-Report, Vorgänger-QA, v2-Attempts und historische Source Fingerprints ergänzen. | SPR-8; SPA-7, SPA-8; AD-13, AD-14 | deterministische Hash-/Provenienztests; alle geschützten Dateien unverändert | irgendeine geschützte Datei müsste geändert oder ein unbekannter historischer Fingerprint akzeptiert werden |
| SPT-T03 | Profilvertrag und profilfähigen Loader für `legacy-v1` und `staged-v2` implementieren; bestehende v1-Dateien an Ort und Stelle erhalten. | SPR-1, SPR-8, SPR-14; AD-1–AD-3 | beide Profile laden; unbekannte/mischende Profile scheitern; Legacy bleibt lesbar | zweite aktive Pipeline oder stille Profilvermischung nötig |
| SPT-T04 | Schema-v2-Vertrag, Stage-Vokabular, Evaluierbarkeitsinvarianten und profilabhängige Normalisierung implementieren; Schema v1 lesbar halten. | SPR-2–SPR-4; AD-4–AD-6 | positive/negative Contracttests für beide Profile | v2-Ausgabe kann echten Control State autorisieren oder v1-Kompatibilität geht verloren |
| SPT-T05 | `STAGED_PROPORTIONALITY_BASELINE.json` mit exakt 40 Fällen und 72 Sollscenarios erstellen; Sollwerte ausschließlich offline speichern. | SPR-1, SPR-7, SPR-8; SPA-1–SPA-4; AD-3, AD-8 | Baseline-Schema, Bijektion, Fall-/Scenario-Zahlen und 40/40 Evidenzreferenzen grün | Sollwert widerspricht kanonischem Owner oder Evidenzreferenz ist nicht auflösbar/redigierbar |
| SPT-T06 | `staged-manifest.json`, `staged-scenarios.json` und `fixtures/staged-catalog.json` mit 40 Intake-, 6 Post-Decision- und 26 Brownfield-Candidate-Scenarios erstellen; `PB-008` eindeutig read-only formulieren. | SPR-1, SPR-5–SPR-7; AD-3, AD-7, AD-8 | 72 blinde Pflichtscenarios, 32 gated Folgescenarios, PB-008-Intenttest | gated Fall ohne Folgescenario; PB-008 bleibt doppeldeutig |
| SPT-T07 | Strukturelle Leakage-Prüfung für verbotene Schlüssel, Pfadwerte/-varianten, Baseline-Begründungen, Evidenzreferenzen, Gradingwerte, Thresholds und frühere Observationen implementieren; freie Facts reviewbar projizieren. | SPR-5, SPR-6; SPA-5; AD-7 | positive und adversariale Leakage-Tests | notwendige Routingtatsachen lassen sich nicht ohne Sollwert-Leakage ausdrücken |
| SPT-T08 | Blind-Prompt profil-/scenariofähig machen und die nicht autorisierende, read-only Achsengrenze explizit transportieren. | SPR-3–SPR-6; AD-5–AD-7 | Prompt-Snapshots ohne Sollwerte; requested/non-requested axes korrekt | Prompt behauptet echte Approval/Brownfield-Autorität oder enthält Offline-Daten |
| SPT-T09 | Recorder und Observation-Persistenz um Profil, Protocol, Scenario, Lifecycle, Schema-/Corpus-/Fixture-Version und neue Observation-ID erweitern; atomaren Duplicate-/Replacement-Schutz erhalten. | SPR-8, SPR-11, SPR-12; AD-12, AD-15 | Persistenz-, Duplicate-, Profile-Mismatch- und Provenienztests | alte Serie würde überschrieben oder Profile können gemischt werden |
| SPT-T10 | Source Fingerprint profil-/scenariofähig machen; staged Freshness gegen aktuelle Quellen, Legacy-Replay gegen historische Provenienz prüfen. | SPR-8, SPR-11; AD-13, AD-14 | `fresh`, `stale`, `historical` deterministisch getestet | Legacy-Replay erzeugt falschen Freshness-Claim oder staged Drift bleibt unerkannt |
| SPT-T11 | Stage-Grader für `stage_correct`, `stage_unsafe_advance`, `stage_over_governance` und `stage_ambiguous` implementieren und gegen den kanonischen Gate-Owner binden. | SPR-2, SPR-9, SPR-10; AD-9 | vollständige Stage-Vergleichsmatrix; jede Abweichung blockiert | Grader wird zweite operative Gate-Autorität oder Unsafe Advance wird nicht erkannt |
| SPT-T12 | Path-Grader und `not_evaluable_yet`-Validierung erweitern; bestehenden Pfadrang und Compact-Delivery-Schutz erhalten. | SPR-4, SPR-9, SPR-10; AD-10 | vollständige Pfadmatrix; missing follow-up, ambiguous und critical under blockieren | nicht angeforderte Achse wird als Erfolg gezählt oder Critical Under bleibt unblockiert |
| SPT-T13 | Gemeinsamen Evaluator um Scenario-Coverage, getrennte Stage-/Path-Metriken, Schwellen und historische Integrität erweitern. | SPR-9, SPR-10, SPR-13; AD-11 | synthetischer Pass sowie alle Blocker deterministisch | Stage und Path werden wieder in eine unklare Rangmetrik vermischt |
| SPT-T14 | Gemeinsamen Reporter um staged-v2 JSON-/Markdown-Projektion erweitern; Legacy-Projektion erhalten. | SPR-13, SPR-14; SPA-10, SPA-14; AD-16 | deterministische Snapshots/Replay beider Profile | Report behauptet Cross-Surface-/Produktreife oder verliert Blocker/Provenienz |
| SPT-T15 | Bestehende Record-/Run-Scripts und npm-Aufrufe um `--profile` erweitern; staged Aufzeichnung verlangt explizit `staged-v2`; keine neuen Executables. | SPR-8, SPR-11, SPR-14; AD-15 | CLI-Hilfe, Unknown-/Mismatch-/Missing-Profile-Tests | stiller staged Default oder zweiter Runner nötig |
| SPT-T16 | Contract-, Corpus-, Fixture-, Leakage-, PB-008-, Legacy- und historische Integritätstests vollständig ergänzen. | SPA-1–SPA-8, SPA-13 | fokussierter Test grün; alle Negativfälle schlagen gezielt fehl | Assertion wird übersprungen/abgeschwächt oder semantische Leakage bleibt ungeprüft |
| SPT-T17 | Stage-/Path-Grading-, Threshold-, Safety-, Mutation-, Redaction-, Duplicate-, Provenienz-, Freshness- und Reporttests ergänzen. | SPA-6, SPA-9–SPA-12, SPA-14 | fokussierter Test grün; genaue Blockgründe verifiziert | ein Safety-/Threshold-Fehler bleibt passfähig |
| SPT-T18 | Synthetische vollständige staged-v2-Passserie mit 216 Observationen evaluieren sowie missing, mixed, stale, leakage, mutation, critical-under und small-over negative Serien prüfen. | SPR-9–SPR-13; SPA-9–SPA-12 | deterministischer JSON-/Markdown-Pass und gezielte Blocks | Coverage-/Provenienz-/Thresholdberechnung ist nicht deterministisch |
| SPT-T19 | Vollständigen Package-Smoke, Runtime Integrity, Doctor, Diff-/Whitespace- und historische Hashprüfung ausführen. | SPR-8, SPR-12, SPR-14; SPA-7, SPA-12, SPA-13 | alle Kommandos grün, keine fremde Scope-Regression | irgendein bestehender Test/Validator scheitert oder historische Datei driftet |
| SPT-T20 | Unmittelbar vor Live-Aufnahme Surface, explizites Modell, Authentifizierung, Versionen, 72 Scenarios, 216 Pflichtobservationen, Timeout, Attempt-Limit, Budget, leeres neues Serienziel und Mutationsschutz erneut preflighten. | SPR-11, SPR-12; SPA-9, SPA-14 | Preflight-Protokoll `pass` mit fixer Serienkonfiguration | Host/Auth/Modell unklar; Ziel existiert; Budget oder Safety-Grenze nicht belastbar |
| SPT-T21 | Neue frische staged-v2-Serie mit drei gültigen Observationen je 72 Pflichtscenario aufzeichnen; fehlgeschlagene Versuche transparent im Attempt-Log halten. | SPR-11, SPR-12; SPA-9 | mindestens 216/216 gültige Observationen mit konsistenter Provenienz und 0 Mutationen/Redaction-Fehlern | Attempt-Limit erreicht; Safety-Fehler; Provenienzdrift; Nutzer unterbricht Kostenlauf |
| SPT-T22 | Neue Serie offline evaluieren, JSON-/Markdown-Bericht und `CD_TESTS.md` erzeugen; historischen Integritätsbeleg wiederholen. | SPR-9–SPR-13; SPA-7, SPA-9–SPA-14 | deterministischer identischer Replay; getrennte Stage-/Path-Ergebnisse | Report blockiert, Replay differiert oder historische Evidenz driftet |
| SPT-T23 | Task Plan Review, Clean Implementation Review und Code Review gegen tatsächlichen Diff, 24/24 Tasks, Parallelstruktur, Safety und Wartbarkeit ausführen; Findings beheben oder offen blockieren. | alle | drei dauerhafte Review-Artefakte; TP-Coverage je task_id | offenes relevantes Reviewfinding oder nicht erfüllter Task |
| SPT-T24 | QA-Gate auf Basis von TP, Brownfield, Implementierung, Tests, Reviews, Live-Serie und Evidenzgrenzen durchführen. | alle | `QA_REPORT.md` mit `pass`, `revise` oder `block` | Stage-Abweichung, Path-Ambiguität, Critical Under, Small Over >10 %, Leakage/Safety/History-Drift oder fehlende Live-Evidenz |

## 3. Phasen und Reihenfolge

### Phase A — Pre-Implementation Brownfield

Nur `SPT-T01`. Kein Code und keine Corpusdatei darf vorher geändert werden.

### Phase B — Profile, Verträge und Corpus

`SPT-T02` bis `SPT-T08`.

Reihenfolge:

1. historische Grenze fixieren;
2. Profil-/Schemaowner erweitern;
3. Offline-Baseline und Blind-Scenarios getrennt erstellen;
4. Leakage prüfen;
5. Prompt darauf aufbauen.

### Phase C — Recorder, Grading und Reporting

`SPT-T09` bis `SPT-T15`.

Gemeinsame Owner werden erweitert; ein zweiter staged Runner ist verboten.

### Phase D — Offline-Testevidenz

`SPT-T16` bis `SPT-T19`.

Alle Offline- und vollständigen Regressionstests müssen grün sein, bevor irgendein Live-Aufruf
zulässig ist.

### Phase E — Live-Evidenz

`SPT-T20` bis `SPT-T22`.

Die Serie wird einmal mit fixer Konfiguration aufgenommen. Gültige blockierende Resultate werden
nicht im selben Run durch Prompt-, Fixture-, Baseline- oder Wiederholungsoptimierung repariert.

### Phase F — Reviews und QA

`SPT-T23` und `SPT-T24`.

## 4. Testplan

| test_id | Prüffeld | Kommando/Mechanismus | Erwartung |
|---|---|---|---|
| SPT-PT01 | AGDF Control State | version-matched `doctor --run agdf-staged-proportionality-observation --json` | `pass`, keine Findings |
| SPT-PT02 | fokussierte Benchmarktests | `npm --prefix create-agdf run test:proportionality` | alle v1/v2-, Corpus-, Leakage-, Grading-, Safety- und Reporttests grün |
| SPT-PT03 | Legacy-Integrität | Hash-/Provenienztest aus `test:proportionality` plus `shasum -a 256` der drei Kernartefakte | fixierte Hashes unverändert |
| SPT-PT04 | Profil-CLI | Record-/Run-Script mit `legacy-v1`, `staged-v2`, unknown, missing und mismatch | korrekte Werte pass; invalid deterministisch fail |
| SPT-PT05 | Scenario-Coverage | Loader-/Corpus-Test | 40 Fälle, 72 Scenarios, 40/6/26-Verteilung, 32 gated Folgescenarios |
| SPT-PT06 | Blindheit/Leakage | strukturierte und gerenderte Promptprüfung | kein Sollwert, keine Begründung/Referenz/Klasse/Threshold/frühere Observation |
| SPT-PT07 | Contract v2 | positive/negative Structured-Output-Matrix | Achsen und Evaluierbarkeit konsistent; Unknown/Widerspruch fail |
| SPT-PT08 | Stage-Grading | vollständige Stage-Matrix | correct/unsafe/over/ambiguous exakt; Abweichungen block |
| SPT-PT09 | Path-Grading | vollständige 6×6-Matrix plus not-evaluable/follow-up | correct/under/over/ambiguous exakt; Critical Under block |
| SPT-PT10 | Thresholds | synthetische Grenzserien | 10 % Small Over pass; darüber block; 0 Critical Under |
| SPT-PT11 | Safety | Mutation, Redaction, Duplicate, Replacement, atomare Persistenz | alle Negativfälle fail-closed |
| SPT-PT12 | Provenienz/Freshness | Profile/Version/Runtime/Model/Fingerprint drift | staged `fresh/stale`, legacy `historical`; Mischserie fail |
| SPT-PT13 | synthetische Gesamtserie | 216 Pass-Observationen und negative Varianten | Passobjekt deterministisch; gezielte Blockgründe |
| SPT-PT14 | Report | JSON-/Markdown-Doppelrender | byte-identischer Replay, vollständige getrennte Metriken |
| SPT-PT15 | Package-Smoke | `npm --prefix create-agdf run smoke-test` | vollständig grün |
| SPT-PT16 | Runtime Integrity | vorhandener Runtime-Integrity-Check im Package-Smoke | grün; keine generierte Oberflächendrift |
| SPT-PT17 | Diffqualität | `git diff --check` | grün |
| SPT-PT18 | Live-Preflight | read-only Einzelprobe auf fixer Surface/Modell plus Serienzielprüfung | authentifiziert, schema-valid, mutationsfrei, Ziel leer |
| SPT-PT19 | Live-Serie | `npm --prefix create-agdf run eval:proportionality:record -- --profile staged-v2 --surface <surface> --model <model> --series <series_id> --repeats 3 --persist ...` | mindestens 216 gültige Observationen, Attempt-Limit nicht überschritten |
| SPT-PT20 | Live-Offline-Report | `npm --prefix create-agdf run eval:proportionality -- --profile staged-v2 --series <series_id> ...` zweimal | identische JSON-/Markdown-Ergebnisse |
| SPT-PT21 | Pflichtreviews | Task Plan Review, Clean Implementation Review, Code Review | keine offenen relevanten Findings |
| SPT-PT22 | QA | `qa-gate` | evidenztreu `pass`, `revise` oder `block`; keine automatische Freigabe |

Die konkreten Werte für `<surface>`, `<model>`, `<series_id>`, Timeout und Attempt-Limit werden in
`SPT-T01` festgelegt und in `SPT-T20` unmittelbar vor dem kostenpflichtigen Lauf revalidiert.

## 5. Anforderungs- und Designabdeckung

| Bereich | Tasks |
|---|---|
| SPR-1/2, AD-3/4 | SPT-T03–SPT-T06, SPT-T11 |
| SPR-3/4, AD-5/6 | SPT-T04, SPT-T08, SPT-T12 |
| SPR-5/6, AD-7 | SPT-T06–SPT-T08, SPT-T16 |
| SPR-7, AD-8 | SPT-T05, SPT-T06, SPT-T16 |
| SPR-8, AD-1/13/14 | SPT-T01–SPT-T03, SPT-T09, SPT-T10, SPT-T19, SPT-T22 |
| SPR-9/10, AD-9–11 | SPT-T11–SPT-T13, SPT-T17, SPT-T18, SPT-T22 |
| SPR-11/12, AD-12/15 | SPT-T09, SPT-T15, SPT-T17, SPT-T19–SPT-T22 |
| SPR-13, AD-16 | SPT-T13, SPT-T14, SPT-T18, SPT-T22 |
| SPR-14, AD-1/2/15 | SPT-T03, SPT-T15, SPT-T23 |
| Pflichtreviews/QA | SPT-T23, SPT-T24 |

## 6. Erlaubte Implementierungspfade

Voraussichtlich:

- `create-agdf/lib/proportionality-benchmark/**`;
- `create-agdf/scripts/record-proportionality-benchmark.js`;
- `create-agdf/scripts/run-proportionality-benchmark.js`;
- `create-agdf/scripts/proportionality-benchmark-test.js`;
- `create-agdf/package.json`, soweit nur vorhandene Proportionalitätsscripts angepasst werden;
- `evals/proportionality/staged-manifest.json`;
- `evals/proportionality/staged-scenarios.json`;
- `evals/proportionality/fixtures/staged-catalog.json`;
- `evals/proportionality/legacy-v1-provenance.json`;
- neue staged Observation-Serie;
- run-eigene Artefakte unter
  `.agdf/control/artefacts/agdf-staged-proportionality-observation/`;
- zugehöriger Run State, Backlog und Parent-Verlinkungen.

Nur `SPT-T01` darf diese Liste verengen oder bei evidenziertem Bedarf kontrolliert ergänzen. Eine
Erweiterung auf kanonische Mode-/Gate-/Approval-/Interaction-Owner ist nicht zulässig und muss als
neuer Produktgap upstream geroutet werden.

## 7. Historisch geschützte Pfade

Mindestens unverändert:

- `.agdf/control/artefacts/agdf-proportionality-benchmark/PROPORTIONALITY_BENCHMARK_REPORT.json`;
- `.agdf/control/artefacts/agdf-proportionality-benchmark/PROPORTIONALITY_BENCHMARK_REPORT.md`;
- `.agdf/control/artefacts/agdf-proportionality-benchmark/QA_REPORT.md`;
- `evals/proportionality/observations/codex-gpt-5.6-sol-agdf-0.11.4-20260728-v2/**`;
- bestehende Baseline 1.0.0 und ihre Evidenzreferenzen, außer einer ausdrücklich neuen,
  separat versionierten staged Baseline.

## 8. Globale Stop-Bedingungen

- Pre-Implementation Brownfield Analysis ist nicht `pass`.
- Historische Kernartefakte oder Source Fingerprints driften.
- Bestehender fremder Scope überlappt unauflösbar mit Kandidatenpfaden.
- Lösung erzeugt einen zweiten Runner, Agent-Executor, Reporter oder Routing-Owner.
- Fixture oder Prompt leakt Sollpfad, Begründung, Grading oder Threshold.
- Agent-Ausgabe könnte echten Control State oder Approval autorisieren.
- PB-008 bleibt semantisch doppeldeutig.
- Eine der 72 Pflichtscenarios fehlt oder ist nicht bijektiv.
- Offline-Tests oder vollständiger Package-Smoke sind nicht vollständig grün.
- Live-Preflight ist nicht authentifiziert, nicht mutationsfrei oder kosten-/budgetseitig unklar.
- Gültige Live-Serie zeigt Stage-Abweichung, Path-Ambiguität, Critical Under oder Small Over über
  `10 %`.
- Eine erforderliche Freigabe fehlt.

## 9. Gate-Grenze

Dieser TP autorisiert noch keine Implementierung. Nach exaktem `Approval: TP` folgt zuerst
`SPT-T01` als Pre-Implementation Brownfield Analysis. Nur deren `pass` öffnet CD+Tests.

Exakter Freigabewert: `Approval: TP`
