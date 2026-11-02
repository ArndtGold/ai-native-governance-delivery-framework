# Product Requirements Document: Stufengerechte Proportionalitätsbeobachtung

Status: `approved`
Gate: PRD
Revision: 1
Date: 2026-07-29
Run: `agdf-staged-proportionality-observation`
Based on: genehmigte UR Revision 1 und Brownfield Review `structured_slice`
Gate approval: exaktes `Approval: PRD` am 2026-07-29 nach Revalidierung von Run, Gate, Revision 1 und dauerhaftem Artefakt

## 1. Problem

Der vorhandene Proportionalitäts-Benchmark stellt einem frischen Agenten einen pre-UR Zustand bereit
und verlangt zugleich einen späteren Delivery Path. Für 26 gated Fälle ist dieser Endpfad erst nach
UR und Brownfield entscheidbar. Die aktuelle Agentlogik reagiert deshalb korrekt fail-closed, wird
aber gegen einen Sollwert aus einer späteren Lifecycle-Stufe gegradet.

Zusätzlich beschreibt `PB-008` im Tasktext eine neue Zielauswahlfunktion, während seine
Sollbegründung nur eine read-only Zielklärung bewertet.

Das Produktgap liegt im Beobachtungs- und Gradingvertrag des Benchmarks, nicht in einer belegten
falschen Routingentscheidung.

## 2. Produktziel

Der Benchmark beobachtet zwei getrennte Aussagen:

1. welche nächste Lifecycle-Stufe im bereitgestellten Zustand zulässig ist;
2. welcher nicht autorisierende Delivery-Path-Kandidat bei ausreichender stufengerechter Evidenz
   resultiert.

Die zweite Aussage ist ausschließlich Benchmark-Evidenz. Sie erzeugt oder verändert keinen echten
AGDF-Control-State und ersetzt keine reale Brownfield Review.

## 3. Begriffe und Autoritätsgrenze

| Begriff | Bedeutung |
|---|---|
| `next_permissible_stage` | normalisierte Beobachtung der nächsten kanonisch zulässigen Stufe im bereitgestellten Lifecycle-Zustand |
| `eventual_delivery_path` | nicht autorisierende Benchmark-Klassifikation des späteren Pfadkandidaten bei ausreichender synthetischer Evidenz |
| `scenario` | eine isolierte, blind ausgeführte Beobachtung eines Falls auf genau einer Lifecycle-Stufe |
| `intake` | Zustand vor genehmigter UR, sofern der Fall nicht ungated ist |
| `brownfield_candidate` | synthetischer Benchmark-Zustand mit genehmigter UR und redigiertem Evidenzpack, aber ohne vorselektierten Mode/Slice-Wert |
| `post_brownfield_decision` | synthetischer Zustand mit bereits evidenzierter Mode/Slice Decision, wenn gerade deren kanonische Präsentationsabbildung geprüft wird |
| `not_evaluable_yet` | bewusster Ergebniszustand, wenn ein Axis in der aktuellen Scenario-Stufe noch nicht bewertet werden darf |

Synthetischer Fixture-State ist nur Eingabe einer read-only Messung. Er ist keine echte
Nutzerfreigabe, keine persistierte Brownfield Review und keine Berechtigung für Repositorymutation.
Der Agent darf einen Pfadkandidaten klassifizieren, aber keinen realen Control State erzeugen,
persistieren oder als für den Repository-Run autorisierend ausgeben.

## 4. Nutzer- und Systemablauf

### 4.1 Ungated Fälle

Für Trivial Change und ungated Quick Task genügt ein `intake`-Scenario:

1. der Blind-Prompt enthält Task, neutralen Repositorykontext und aktuelle kanonische Quellen;
2. der Agent klassifiziert `next_permissible_stage`;
3. der Agent darf zugleich den Delivery Path klassifizieren, weil keine Approval-/Brownfield-Stufe
   fehlt;
4. beide Achsen werden getrennt gegradet.

### 4.2 Gated Fälle

Gated Fälle erhalten mindestens zwei voneinander isolierte Scenarios:

1. `intake` prüft, dass die nächste zulässige Stufe erkannt und kein Endpfad erfunden wird;
2. `brownfield_candidate` stellt eine synthetisch genehmigte UR und ein redigiertes Evidenzpack
   bereit, enthält aber keinen erwarteten Pfad, keine Baseline-Begründung und keine vorselektierte
   Mode/Slice Decision;
3. der Agent klassifiziert einen nicht autorisierenden `eventual_delivery_path`;
4. Stufen- und Pfadergebnis werden separat gegradet.

### 4.3 Compact-Delivery-Abbildung

Fälle, die ausdrücklich die Abbildung einer bereits gespeicherten `quick_task`-Entscheidung auf
`compact_delivery` prüfen, verwenden `post_brownfield_decision`. Das Fixture muss genehmigte UR,
abgeschlossene Brownfield Review und gespeicherten `quick_task`-Kontext sichtbar enthalten.

## 5. Produktanforderungen

### SPR-1 — Versioniertes Scenario-Modell

Jeder Baseline-Fall besitzt mindestens ein Scenario mit eindeutiger `scenario_id`,
`lifecycle_stage`, zu prüfenden Achsen und einer ausschließlich offline verfügbaren
Erwartungsdefinition.

### SPR-2 — Endliches Stage-Vokabular

`next_permissible_stage` verwendet ein endliches, normalisiertes Messvokabular, das im SD aus den
bestehenden Gate-/Mode-Ownern abgeleitet wird. Es definiert keine Gate-Reihenfolge und keine neue
Legalität.

Mindestens abbildbar sind:

- ungated Ausführung;
- UR;
- Brownfield Review;
- PRD;
- SD;
- TP;
- Implementierungs-Brownfield-Analyse;
- CD+Tests;
- CR;
- QA;
- UAT;
- OR;
- blockiert.

### SPR-3 — Getrennte strukturierte Ausgabe

Die Agent-Ausgabe trennt:

- beobachtete nächste Stufe oder `null`;
- beobachteten Delivery Path oder `null`;
- Evaluierbarkeitsstatus je Achse;
- kurze sichtbare Begründung;
- begrenzte Entscheidungsgründe.

Unbekannte Felder, widersprüchliche Kombinationen oder unzulässige Werte werden abgelehnt oder
fail-closed normalisiert.

### SPR-4 — Nicht autorisierende Pfadklassifikation

`eventual_delivery_path` ist eine Messausgabe. Sie darf:

- keine echte Mode/Slice Decision persistieren;
- keinen Run fortschalten;
- keine Approval als erteilt ausgeben;
- keine Implementierung autorisieren;
- nicht als Ersatz für Brownfield Review oder Gate-Check verwendet werden.

### SPR-5 — Blindheit

Kein Agent-Eingang enthält:

- erwartete Stage oder erwarteten Pfad;
- Baseline-Begründung oder Evidenzreferenz;
- Gradingklasse oder Threshold;
- frühere Observation;
- direkte oder abgeleitete Pfadsynonyme, die den Sollwert verraten.

Leakage-Checks prüfen strukturierte Felder und gerenderten Prompt.

### SPR-6 — Redigiertes Brownfield-Evidenzpack

Ein `brownfield_candidate`-Scenario enthält nur die Tatsachen, die für eine proportionale
Klassifikation nötig sind, beispielsweise:

- kanonische Owner und begrenzte abgeleitete Pfade;
- Produkt-, Runtime-, Policy-, Persistenz-, Architektur-, Sicherheits-, CLI-, Release- und
  Cross-Host-Wirkung;
- Baseline-Sauberkeit und deterministische Validierung;
- bekannte Eskalationsgrenzen.

Das Evidenzpack enthält keine Pfadentscheidung und keine wertenden Formulierungen, die einen
Sollpfad kodieren. Das SD muss eine maschinenprüfbare Leakage-Grenze definieren.

### SPR-7 — PB-008-Eindeutigkeit

`PB-008` wird als read-only Zielklärung eindeutig neu formuliert. Der Fall darf nicht zugleich das
Implementieren einer neuen Aktivierungs- oder Zielauswahlsemantik verlangen. Der neue Corpus behält
exakt 40 Baseline-Fälle.

### SPR-8 — Versionierung und historische Integrität

- Baseline-, Corpus-, Fixture-, Observation-, Adapter- und Runner-Semantik erhalten explizite
  Versionen.
- Baseline 1.0.0, v1-Observationen, v2-Live-Serie, Vorgänger-Report und Vorgänger-QA bleiben
  unverändert.
- Neue Serien verwenden neue IDs und dürfen bestehende Dateien ohne expliziten
  Replacement-Provenance-Pfad nicht überschreiben.
- Alte Serien bleiben mit ihrem historischen Profil deterministisch lesbar oder replaybar.

### SPR-9 — Getrenntes Grading

Das Offline-Grading produziert mindestens:

- `stage_correct`;
- `stage_unsafe_advance`;
- `stage_over_governance`;
- `stage_ambiguous`;
- `path_correct`;
- `path_under_governance`;
- `path_over_governance`;
- `path_ambiguous`;
- `not_evaluable_yet`;
- `protocol_invalid`.

Stage- und Pfadmetriken werden nicht zu einer Rangzahl vermischt.

### SPR-10 — Schwellenwerte und Blocker

- Kritische Pfad-Under-Governance bei neuer Produktsemantik, Gate-, Sicherheits-, Persistenz-,
  Architektur-, Runtime-, Policy- oder Releasewirkung bleibt `0`.
- Over-Governance bei eindeutig trivialen oder ungated Quick Tasks bleibt höchstens `10 %`.
- `stage_unsafe_advance`, Leakage, Mutation, Redaction-Fehler, Provenienzdrift, Stale,
  unvollständige Pflichtcoverage und unerlaubte Path-Ambiguität blockieren.
- `not_evaluable_yet` blockiert nicht, wenn der Axis im betreffenden Scenario ausdrücklich nicht
  angefordert ist und ein späteres Pflichtscenario ihn abdeckt.

### SPR-11 — Frische wiederholte Live-Evidenz

Nach genehmigtem TP und bestandener Pre-Implementation Brownfield Analysis werden mindestens drei
gültige Observationen pro Pflichtscenario aufgezeichnet. Die Gesamtzahl beträgt mindestens 120 und
steigt entsprechend, wenn gated Fälle mehrere Pflichtscenarios besitzen.

Jede Serie fixiert:

- Surface;
- Runtime-/CLI-Version;
- explizites Modell;
- AGDF-Version;
- Baseline-, Corpus-, Fixture-, Adapter-, Schema- und Runner-Version;
- Source Fingerprint;
- Zeitstempel und Wiederholungsindex.

### SPR-12 — Read-only Safety

Der bestehende gemeinsame Agent-Executor, Disposable Workspace, Toolverbot, Mutationsvergleich,
Redaction, Timeout, Attempt-Limit, Duplicate-Schutz und atomare Persistenz bleiben bindend.

### SPR-13 — Berichte

JSON und Markdown zeigen getrennt:

- Scenario-Coverage;
- Stage-Korrektheit und Stage-Sicherheitsverstöße;
- Pfad-Korrektheit, Under-/Over-Governance und Ambiguität;
- `not_evaluable_yet`;
- Freshness und Provenienz;
- historische Evidenzgrenze;
- blockierende IDs und Gründe.

Der Bericht behauptet weder Produktreife noch Cross-Surface-Konformität außerhalb der tatsächlich
ausgeführten Serie.

### SPR-14 — Eine Pipeline

Die Lösung erweitert die bestehende Proportionalitäts-Pipeline. Ein zweiter Runner, zweiter
Agent-Executor, zweiter Mode-/Gate-Owner oder unabhängiger Reporter ist nicht zulässig.

## 6. Akzeptanzkriterien

| ID | Akzeptanzkriterium |
|---|---|
| SPA-1 | Exakt 40 Fälle besitzen eindeutige versionierte Pflichtscenarios und einen expliziten Lifecycle-Zeitpunkt. |
| SPA-2 | Jeder gated Fall besitzt ein `intake`-Scenario sowie ein getrenntes Scenario, in dem der spätere Pfad ohne Sollwert-Leakage evaluierbar ist. |
| SPA-3 | Kein pre-UR Scenario verlangt einen autorisierten späteren Delivery Path. |
| SPA-4 | `PB-008` bewertet ausschließlich read-only Zielklärung und hat einen eindeutigen Sollwert je angeforderter Achse. |
| SPA-5 | Blindheits- und Leakage-Tests finden weder erwartete Werte noch Begründungen, Referenzen, Gradingklassen, Thresholds oder Pfadsynonyme im Agent-Eingang. |
| SPA-6 | Ungültige oder widersprüchliche strukturierte Ausgaben scheitern deterministisch fail-closed. |
| SPA-7 | Historische Kernartefakte bestehen den SHA-256-Integritätstest; keine v2-Datei wird verändert. |
| SPA-8 | Alte Profil-/Seriendaten bleiben deterministisch lesbar oder replaybar; neue Daten sind versionsklar getrennt. |
| SPA-9 | Mindestens drei gültige Observationen pro Pflichtscenario und mindestens 120 insgesamt besitzen konsistente Provenienz und keine Mutation/Redaction-Verletzung. |
| SPA-10 | Stage- und Pfad-Grading sowie JSON-/Markdown-Projektion sind deterministisch und getrennt. |
| SPA-11 | Kritische Under-Governance ist `0`; Small-Segment Over-Governance ist höchstens `10 %`; jede Überschreitung blockiert. |
| SPA-12 | Fokussierter Proportionalitätstest und vollständiger Package-Smoke bestehen. |
| SPA-13 | Die neue Serie verändert keine Mode-, Gate-, Approval-, Brownfield- oder Interaction-Semantik. |
| SPA-14 | Der finale QA-Bericht trennt Repository-/Replay-Evidenz, Live-Surface-Evidenz und nicht verifizierte Hosts. |

## 7. Nicht-funktionale Anforderungen

- Deterministische Offline-Auswertung identischer persistierter Inputs.
- Fail-closed bei fehlender, widersprüchlicher oder stale Evidenz.
- Atomare, nicht überschreibende Persistenz.
- Begrenzte Prompt-, Rationale- und Decision-Ground-Größen.
- Keine Secrets, privaten Prompts, Hidden Reasoning oder absoluten Nutzerpfade.
- Ausführbare Tests ohne Netzwerk; nur die ausdrücklich genehmigte Live-Aufzeichnung benötigt einen
  authentifizierten Agent-Host.
- Keine neue Produktionsabhängigkeit.

## 8. Nicht-Ziele

- Änderung kanonischer Gate-, Mode-, Approval-, Brownfield- oder Interaction-Semantik;
- automatische echte Brownfield Reviews oder Nutzerfreigaben;
- Nutzung des Benchmark-Ergebnisses als operative Run-Autorität;
- Korrektur anderer Routing- oder Host-Conformance-Gaps;
- nachträgliche Regraduierung oder QA-Freigabe des Vorgänger-Runs;
- universelle Modell- oder Cross-Surface-Claims;
- Commit, Push, PR, Release oder Veröffentlichung.

## 9. Evidenzplan

1. Schema-/Corpus-/Fixture- und Versionsprüfungen.
2. Negative Leakage-, Redaction-, Mutation-, Duplicate-, Provenienz- und Stale-Tests.
3. Lifecycle-Konsistenz- und PB-008-Intenttests.
4. Deterministische Stage-/Pfad-Gradingmatrix.
5. Historische SHA-256- und Legacy-Replay-Prüfung.
6. Fokussierter Proportionalitätstest.
7. Vollständiger Package-Smoke.
8. Frische authentifizierte Agent-Serie nach genehmigtem TP und Brownfield-Preflight.
9. Deterministischer JSON-/Markdown-Replay derselben Serie.
10. Pflichtreviews, QA und UAT.

## 10. Risiken und Recovery

| Risiko | Fail-closed Recovery |
|---|---|
| Fixture leakt Sollpfad | Aufnahme stoppen, Scenario als `protocol_invalid` markieren, PRD/SD-Gap öffnen |
| Synthetischer State wirkt autorisierend | Ausgabe ablehnen; keine Control-State-Mutation; Contract/Test korrigieren |
| Pflichtscenario fehlt | Coverage blockiert |
| Historische Datei driftet | Aufnahme und QA blockieren; Originalzustand wiederherstellen, ohne Evidenz umzuschreiben |
| Agent-Ausgabe ist widersprüchlich | fail-closed normalisieren oder als ungültig verwerfen |
| Neue Routingsemantik wird nötig | diesen Run stoppen und separaten Produktgap upstream entscheiden |
| Authentifizierter Host fehlt | Live-Evidenz als `host_unavailable`/fehlend ausweisen; kein Replay-Ersatz |

## 11. Gate-Grenze

Dieses PRD autorisiert keine SD-, TP- oder Implementierungsarbeit. Nach exaktem `Approval: PRD`
darf das fokussierte Solution Design erstellt werden.

Exakter Freigabewert: `Approval: PRD`
