# Solution Design: Stufengerechte Proportionalitätsbeobachtung

Status: `approved`
Gate: SD
Revision: 1
Date: 2026-07-29
Run: `agdf-staged-proportionality-observation`
Based on: genehmigtes PRD Revision 1 und Brownfield Review `structured_slice`
Gate approval: exaktes `Approval: SD` am 2026-07-29 nach Revalidierung von Run, Gate, Revision 1 und dauerhaftem Artefakt

## 1. Designziel

Die bestehende Proportionalitäts-Pipeline wird profil- und scenariofähig erweitert. Derselbe
Loader-, Prompt-, Recorder-, Grading- und Reportpfad unterstützt:

- `legacy-v1`: historische Baseline-/Observation-Semantik ohne Neuinterpretation;
- `staged-v2`: getrennte Beobachtung von `next_permissible_stage` und
  `eventual_delivery_path`.

Es entsteht kein zweiter Runner, Agent-Executor, Reporter oder Routing-Owner.

## 2. Architekturentscheidung

### AD-1 — Versionierte Profile statt Pipeline-Fork

Ein Profil beschreibt:

- Profil-, Schema-, Baseline-, Corpus-, Fixture-, Adapter- und Runner-Version;
- Datenpfade;
- Observation-Vertrag;
- Source-Fingerprint-Regeln;
- Freshness-/historische Replay-Regeln.

`loadCorpus` wird zu einem profilfähigen Loader erweitert. Die bestehenden Funktionen bleiben die
gemeinsamen Ausführungspunkte und erhalten expliziten Profilkontext.

Vorgesehene Profile:

| Profil | Zweck | Status |
|---|---|---|
| `legacy-v1` | bestehende 40-Fall-Baseline und historische Observationen lesen/replayen | read-only |
| `staged-v2` | neue Scenario-basierte Live-Beobachtung und getrenntes Grading | aktiv |

Die CLI akzeptiert `--profile`. Neue Aufzeichnungen müssen `--profile staged-v2` explizit setzen.
Legacy-Aufrufe dürfen auf `legacy-v1` zurückfallen, aber eine neue Serien-ID darf nicht ohne
persistierten Profilwert geschrieben werden.

### AD-2 — Dateien und Owner

Bestehende Owner werden erweitert:

```text
create-agdf/lib/proportionality-benchmark/
  blind-prompt.js
  contracts.js
  corpus-loader.js
  evaluator.js
  index.js
  live-recorder.js
  report.js
  source-fingerprint.js

create-agdf/scripts/
  record-proportionality-benchmark.js
  run-proportionality-benchmark.js
  proportionality-benchmark-test.js

evals/proportionality/
  manifest.json                         # bestehendes legacy-v1 Profil
  cases.json                            # bestehende v1-Fallliste
  fixtures/catalog.json                 # bestehendes v1-Fixture
  staged-manifest.json                  # neues staged-v2 Profil
  staged-scenarios.json                 # blinde Scenario-Eingänge
  fixtures/staged-catalog.json          # strukturierte neutrale Evidenzpacks
  legacy-v1-provenance.json             # historische Integritäts-/Fingerprintgrenze
  observations/<series_id>/             # bestehende, profilvalidierte Serienablage
```

Neue Baseline:

```text
.agdf/control/artefacts/agdf-staged-proportionality-observation/
  STAGED_PROPORTIONALITY_BASELINE.json
```

Bestehende v1-Dateien werden nicht verschoben oder umgeschrieben.

### AD-3 — Scenario-Modell

`staged-v2` enthält exakt 40 Fälle und 72 Pflichtscenarios:

- 40 `intake`-Scenarios, eines je Fall;
- 6 `post_brownfield_decision`-Scenarios für `PB-009` bis `PB-014`;
- 26 `brownfield_candidate`-Scenarios für `PB-015` bis `PB-040`.

Bei drei Wiederholungen entstehen 216 Pflichtobservationen.

Blind persistierter Scenario-Eingang:

```json
{
  "scenario_id": "PB-015:brownfield_candidate",
  "case_id": "PB-015",
  "lifecycle_stage": "brownfield_candidate",
  "requested_axes": ["eventual_delivery_path"],
  "task_summary": "...",
  "repository_context": "...",
  "control_state_context": "...",
  "evidence_pack_id": "EP-PB-015"
}
```

Nicht enthalten sind Sollwerte, Begründung, Evidenzreferenz, Grading oder Threshold.

Offline-Baseline:

```json
{
  "scenario_id": "PB-015:brownfield_candidate",
  "case_id": "PB-015",
  "expected_next_permissible_stage": null,
  "expected_delivery_path": "verified_change",
  "stage_required": false,
  "path_required": true,
  "rationale": "...",
  "evidence_ref": "..."
}
```

Blind-Corpus und Offline-Baseline werden erst im Evaluator über `scenario_id` verbunden.

### AD-4 — Stage-Vokabular

Das Messvokabular lautet:

```text
ungated_execution
ur
brownfield_review
prd
sd
tp
brownfield_analysis
cd_tests
cr
qa
uat
or
blocked
```

Es ist eine normalisierte Observationsebene. Die Legalität und Reihenfolge bleiben ausschließlich in
`plugin/meta/contracts/gate-transition.md`. Der Source Fingerprint bindet diese Quelle ein.

### AD-5 — Strukturierter Agent-Vertrag v2

Agent-Ausgabe:

```json
{
  "schema_version": "2",
  "observed_next_permissible_stage": "ur",
  "stage_evaluability": "evaluated",
  "observed_delivery_path": null,
  "path_evaluability": "not_evaluable_yet",
  "rationale": "...",
  "decision_grounds": ["..."]
}
```

Erlaubte Evaluierbarkeitswerte:

- `evaluated`;
- `not_evaluable_yet`.

Invarianten:

- `evaluated` verlangt einen nicht-null Wert auf der betreffenden Achse;
- `not_evaluable_yet` verlangt `null`;
- nicht angeforderte Achsen müssen `not_evaluable_yet` sein;
- angeforderte Achsen müssen `evaluated` sein;
- unbekannte Felder oder widersprüchliche Kombinationen sind
  `PROPORTIONALITY_OUTPUT_INVALID`;
- `compact_delivery` verlangt weiterhin sichtbare UR-, Brownfield- und `quick_task`-Gründe;
- Redaction- und Größenlimits bleiben bestehen.

Schema v1 bleibt für `legacy-v1` lesbar. Neue staged Serien akzeptieren ausschließlich Schema v2.

### AD-6 — Nicht autorisierende Semantik

Jede staged Prompt-Instruktion enthält explizit:

- read-only Klassifikation;
- synthetischer Fixture-State ist keine echte Approval;
- Ausgabe ist kein Control-State-Artefakt;
- keine Datei- oder Toolmutation;
- keine Persistenz einer Mode/Slice Decision;
- nur die angeforderten Achsen klassifizieren.

`brownfield_candidate` enthält die synthetische Tatsache einer genehmigten UR und ein neutrales
Evidenzpack. Der Agent klassifiziert einen Kandidaten, behauptet aber nicht, eine echte Brownfield
Review im Repository abgeschlossen zu haben.

### AD-7 — Strukturierte Evidenzpacks

Freitext wird minimiert. Ein Evidenzpack verwendet neutrale Tatsachenfelder:

```json
{
  "canonical_owner_count": 1,
  "source_path_count": 1,
  "derived_path_count": 2,
  "baseline_clean": true,
  "deterministic_validation": true,
  "deterministic_propagation": true,
  "impacts": {
    "product_semantics": false,
    "gate": false,
    "permission": false,
    "security": false,
    "persistence": false,
    "architecture": false,
    "external_api": false,
    "cli_contract": false,
    "runtime": false,
    "release": false,
    "cross_host": false
  },
  "bounded_facts": ["..."],
  "known_escalation_conditions": ["..."]
}
```

Das Schema erlaubt ausreichende Routingtatsachen, aber keine Felder wie `expected_*`,
`recommended_*`, `delivery_path`, `mode`, `slice`, `classification` oder `rationale`.

Ein Leakage-Scanner prüft:

- verbotene Schlüssel;
- alle sechs Pfadwerte und normalisierte Schreibvarianten;
- Baseline-Begründung und Evidenzreferenz;
- Gradingwerte und Threshold-Namen;
- frühere Observationen.

`bounded_facts` und `known_escalation_conditions` erhalten zusätzlich eine explizite Reviewliste im
TP; rein semantische Leakage kann nicht ausschließlich durch Tokensicherheit bewiesen werden.

### AD-8 — PB-008

Der staged-v2-Tasktext lautet sinngemäß:

> Bei zwei plausiblen Mutation Targets ausschließlich die Zielklärung durchführen, keine
> Repositoryaktivierung vornehmen und die explizite Auswahl des Nutzers abwarten.

Er erwartet im `intake`-Scenario:

- `next_permissible_stage: ungated_execution`;
- `eventual_delivery_path: quick_task`.

Das Implementieren neuer Zielauswahlsemantik ist ausdrücklich nicht Teil dieses Falls.

### AD-9 — Stage-Grading

Der Stage-Grader verwendet die erwartete Stage der Offline-Baseline und eine aus dem kanonischen
Gate-Vertrag abgeleitete Vergleichsprojektion:

- identischer Wert: `stage_correct`;
- beobachtete ungated Ausführung oder spätere Gate-Stufe trotz früherem erforderlichem Gate:
  `stage_unsafe_advance`;
- unnötig frühere oder blockierendere Stufe: `stage_over_governance`;
- null, unbekannt oder nicht vergleichbar: `stage_ambiguous`.

`blocked` ist nur korrekt, wenn die Baseline `blocked` erwartet.

Der Grader definiert keine operative Gate-Erlaubnis. Die Vergleichsprojektion wird durch fokussierte
Tests gegen den kanonischen Gate-Owner gebunden.

### AD-10 — Path-Grading

Der bestehende Pfadrang bleibt:

```text
trivial_change < quick_task < compact_delivery <
verified_change < structured_slice < structured_delivery
```

Klassifikationen:

- identisch: `path_correct`;
- niedriger: `path_under_governance`;
- höher: `path_over_governance`;
- null/uneindeutig: `path_ambiguous`;
- nicht angeforderte Achse: `not_evaluable_yet`.

`not_evaluable_yet` ist nur gültig, wenn das Scenario die Achse nicht anfordert und für gated Fälle
ein späteres Pflichtscenario dieselbe Achse abdeckt.

### AD-11 — Reportstatus

Der staged Report blockiert bei:

- irgendeinem `stage_unsafe_advance`;
- irgendeinem `stage_over_governance`;
- irgendeinem `stage_ambiguous` auf einer Pflichtachse;
- kritischer `path_under_governance`;
- `path_ambiguous` auf einer Pflichtachse;
- Small-Segment Over-Governance über `10 %`;
- Coverage-, Leakage-, Redaction-, Mutation-, Duplicate-, Provenienz- oder Freshness-Fehler;
- Drift eines geschützten historischen Artefakts.

Der Report besteht nur bei vollständiger Scenario-Coverage und allen Schwellen innerhalb der
genehmigten Grenzen.

### AD-12 — Serien- und Persistenzvertrag

Neue Observationen ergänzen:

- `profile_id`;
- `protocol_version`;
- `scenario_id`;
- `lifecycle_stage`;
- Schema-, Corpus- und Fixture-Version.

Observation-ID:

```text
<series_id>:<scenario_id>:<repeat>
```

Persistenz bleibt atomar und standardmäßig nicht überschreibend. Eine Serie darf nur Observationen
desselben Profils und derselben vollständigen Provenienz enthalten.

### AD-13 — Source Fingerprint und Freshness

`staged-v2` fingerprintet:

- Profil und Scenario;
- Evidenzpack;
- relevante Behavior Sources;
- gemeinsame Benchmark-Implementierungsowner;
- Adapterversion.

`legacy-v1` vergleicht historische Observation-Fingerprints nicht mit verändertem aktuellem Code,
sondern mit `legacy-v1-provenance.json`. Ein Legacy-Replay wird als `historical` ausgewiesen und
erzeugt keinen neuen Freshness-Claim.

Freshness-Werte der neuen Pipeline:

- `fresh`;
- `stale`;
- `historical`.

Der bestehende Vorgänger-Report mit `fresh` bleibt byte-identisch und wird nicht neu erzeugt.

### AD-14 — Historische Integrität

`legacy-v1-provenance.json` hält mindestens:

- SHA-256 von Baseline 1.0.0, bestehendem Manifest, Cases und Fixture;
- erlaubte historische Source Fingerprints pro Fall/Serie;
- SHA-256 von Vorgänger-Report JSON, Vorgänger-QA und v2-`attempts.json`.

Fokussierte Tests vergleichen die geschützten Dateien mit dem Manifest und zusätzlich die drei
bereits im Brownfield Review fixierten Kernhashes. Abweichung blockiert staged Aufnahme und QA.

### AD-15 — CLI

Gemeinsame Scripts:

```text
record-proportionality-benchmark --profile staged-v2 ...
run-proportionality-benchmark --profile staged-v2 --series ...
```

Regeln:

- `--profile staged-v2` ist für neue staged Aufzeichnung Pflicht;
- `legacy-v1` bleibt als expliziter Replay-/Kompatibilitätswert verfügbar;
- Profil und Serie müssen zusammenpassen;
- unbekanntes Profil oder Mischserie scheitert deterministisch;
- keine neuen separaten staged Executables.

### AD-16 — Reportprojektion

JSON ist das kanonische Ergebnisobjekt. Markdown projiziert mindestens:

- Profil/Protokoll und vollständige Provenienz;
- 40 Fälle, 72 Scenarios und Observation-Coverage;
- Stage-Ergebniszahlen;
- Path-Ergebniszahlen;
- `not_evaluable_yet`;
- blockierende Scenario- und Fall-IDs;
- historische Integrität;
- Evidenzgrenze und nicht beobachtete Hosts.

Die v1-Markdown-Projektion bleibt für Legacy-Replay verfügbar; staged-v2 erweitert denselben
Reporter über Profil-Dispatch.

## 3. Datenfluss

```text
staged-manifest + staged-scenarios + staged-fixtures
                        |
                        v
                 profile-aware loader
                        |
              blind scenario projection
                        |
                        v
         shared read-only structured agent executor
                        |
                        v
             schema-v2 normalization + safety
                        |
                 atomic observation store
                        |
                        v
      offline join with staged baseline by scenario_id
                        |
             stage grader + path grader
                        |
                        v
              canonical JSON report object
                        |
                 Markdown projection
```

Sollwerte betreten den Datenfluss erst beim Offline-Join.

## 4. Anforderungszuordnung

| PRD | Design |
|---|---|
| SPR-1, SPR-2 | AD-3, AD-4 |
| SPR-3, SPR-4 | AD-5, AD-6 |
| SPR-5, SPR-6 | AD-7 |
| SPR-7 | AD-8 |
| SPR-8 | AD-1, AD-13, AD-14 |
| SPR-9, SPR-10 | AD-9, AD-10, AD-11 |
| SPR-11, SPR-12 | AD-12, AD-15 und bestehender Recorder/Executor |
| SPR-13 | AD-16 |
| SPR-14 | AD-1, AD-2, AD-15 |

## 5. Testdesign

### Contract- und Schema-Tests

- v1/v2-Schema akzeptieren nur ihr Profil;
- alle Achsen-/Evaluierbarkeitsinvarianten;
- unbekannte Stage/Pfade/Felder;
- Compact-Delivery-Gründe;
- Redaction und Größenlimits.

### Corpus- und Leakage-Tests

- exakt 40 Fälle und 72 Pflichtscenarios;
- 40 Intake-, 6 Post-Decision- und 26 Brownfield-Candidate-Scenarios;
- jeder gated Fall besitzt Intake plus Pfadscenario;
- keine Soll-/Grading-/Threshold-/Evidenzreferenz im Blind-Corpus;
- verbotene Schlüssel und Pfadtoken in Evidenzpacks;
- PB-008 eindeutiger read-only Intent.

### Grading-Tests

- vollständige Stage-Matrix für correct/unsafe/over/ambiguous;
- vollständige Path-Rangmatrix;
- `not_evaluable_yet` nur auf nicht angeforderter Achse;
- fehlendes Folgescenario blockiert;
- 0 Critical Under;
- Small-Segment-Grenze exakt `10 %` pass, darüber block;
- Stage-Abweichung blockiert.

### Safety- und Provenienztests

- Workspace-Mutation;
- Redaction;
- Duplicate und atomare Persistenz;
- Serien-/Profil-/Runtime-/Modell-/Versionsdrift;
- Source-Fingerprint;
- historische SHA-256-Integrität;
- Legacy-Replay ist `historical`, nicht `fresh`.

### Integrations- und Reporttests

- deterministisches staged JSON;
- deterministische Markdown-Projektion;
- 216 synthetische Pass-Observationen;
- fehlende/mixed/stale/invalid Observationen;
- Legacy-v1-Reportpfad;
- fokussierter Test und vollständiger Package-Smoke.

### Live-Evidenz

Nach genehmigtem TP und Brownfield-Preflight:

- eine neue explizite `staged-v2`-Serie;
- mindestens 216 gültige Observationen;
- drei Wiederholungen je Pflichtscenario;
- fixe Surface, Runtime, Modell-, AGDF- und Profilprovenienz;
- deterministischer Offline-Replay.

## 6. Sicherheits- und Autoritätsgrenzen

- Keine Tool- oder Dateimutation durch den Agenten.
- Keine echte Approval- oder Control-State-Erzeugung im Fixture.
- Keine Sollwerte vor Offline-Grading.
- Keine Änderung kanonischer Behavior Sources im genehmigten Scope.
- Keine Wiederverwendung der Vorgänger-Serien-ID.
- Keine Cross-Surface-Aussage ohne ausgeführte Host-Evidenz.
- Keine automatische Live-Aufzeichnung im Test- oder Buildlauf.

## 7. Fehler- und Recovery-Modell

| Fehler | Verhalten |
|---|---|
| Profil unbekannt | deterministischer CLI-/Loader-Fehler |
| Scenario/Baseline nicht bijektiv | Corpus-Validierung blockiert |
| requested axis nicht evaluiert | Observation ungültig |
| nicht angeforderte Achse klassifiziert | Observation ungültig |
| Leakage | Aufnahme vor Agentaufruf oder Persistenz blockieren |
| Mutation/Redaction | Serie sofort blockieren |
| Provenienzdrift | Observation/Serie ablehnen |
| Historischer Hash driftet | staged Aufnahme und QA blockieren |
| Host nicht verfügbar | keine Replay-Substitution; fehlende Live-Evidenz ausweisen |
| Routingsemantik müsste geändert werden | Run stoppen und Produktgap upstream routen |

## 8. Explizit verworfene Alternativen

1. **Zweiten staged Runner bauen:** verworfen wegen Parallelstruktur.
2. **Pre-UR-Prompt einfach zur Pfadprognose auffordern:** verworfen, weil dies Fail-Closed-Semantik
   in eine scheinbar autorisierte Entscheidung umdeutet.
3. **Brownfield-Pfad im Fixture vorselektieren:** verworfen, weil es den Sollwert leakt.
4. **Historische v2-Serie neu graden:** verworfen, weil die Evidenzgrenze rückwirkend verändert
   würde.
5. **Alle 27 Fälle als Routingfehler behandeln:** verworfen, weil keine stufengerechte falsche
   Pfadwahl belegt ist.
6. **Neue Gate-/Mode-Semantik einführen:** verworfen, weil außerhalb UR/PRD und ohne Gap-Evidenz.

## 9. Implementierungsgrenze

Dieses SD autorisiert noch keinen TP und keine Implementierung. Nach exaktem `Approval: SD` darf ein
Task-/Testplan mit konkreten Tasks, Stop-Bedingungen und Evidenzkommandos erstellt werden.

Exakter Freigabewert: `Approval: SD`
