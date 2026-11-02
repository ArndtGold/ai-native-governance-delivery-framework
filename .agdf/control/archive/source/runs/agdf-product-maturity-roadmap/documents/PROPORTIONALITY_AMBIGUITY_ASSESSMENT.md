# Produktbefund: 27 Ambiguitätsfälle des Proportionalitäts-Benchmarks

Status: `assessed`
Date: 2026-07-29
Parent task: `RMP-07`
Source run: `agdf-proportionality-benchmark`
Decision: `separate_benchmark_protocol_remediation_warranted`

## Kurzentscheidung

Die 27 blockierenden Benchmarkfälle belegen **keine 27 Routing-Produktfehler**. Sie zerfallen in:

- 26 Fälle mit einem gemeinsamen Messstufenfehler: Der Sollwert beschreibt einen späteren,
  post-UR/post-Brownfield Delivery Path, während das Blind-Fixture ausdrücklich einen pre-UR Zustand
  ohne genehmigte UR und ohne Mode/Slice Decision bereitstellt.
- einen Fall (`PB-008`) mit einem Baseline-Semantikfehler: Der Tasktext beschreibt das Einführen
  eines Zielauswahlverhaltens, die Sollbegründung dagegen nur eine read-only Zielklärung.
- null belegte Fälle, in denen die aktuelle Routinglogik bei ausreichender, stufengerechter Evidenz
  einen falschen Delivery Path gewählt hat.

Ein separater Remediation-Scope ist gerechtfertigt. Sein Gegenstand ist das
**stufengerechte Beobachtungs- und Gradingprotokoll des Benchmarks**, nicht die Abschwächung oder
Vorwegnahme der kanonischen Gate-/Brownfield-Semantik.

## Evidenz

Die frische Serie
`codex-gpt-5.6-sol-agdf-0.11.4-20260728-v2` enthält 120/120 gültige Observationen:

| Befund | Ergebnis |
|---|---:|
| blockierende Fälle | 27/40 |
| blockierende Observationen | 81/120 |
| Observationen mit gewähltem Pfad in den 27 Fällen | 0/81 |
| Observationen mit ausdrücklichem Hinweis auf fehlende Mode/Slice Decision | 77/81 |
| betroffene Fälle mit diesem Hinweis | 27/27 |
| kritische Under-Governance | 0 |
| Over-Governance im Small-Segment | 0/8 |

Das neutrale Fixture sagt ausdrücklich:

- kein Delivery Path ist vorselektiert;
- fehlt eine approval- oder Brownfield-abhängige Evidenz, muss der Agent Ambiguität melden.

Nur `PB-009` bis `PB-014` erhalten einen abweichenden Control-State-Kontext mit genehmigter UR,
abgeschlossener Brownfield-Analyse und gespeicherter `quick_task`-Entscheidung. Diese sechs Fälle
werden vollständig korrekt als `compact_delivery` beobachtet. Das bestätigt, dass der Agent
evidenzierten Control State verwendet und fehlenden State nicht erfindet.

## Fallklassifikation

| Fälle | Baseline-Soll | Produktbewertung | Begründung |
|---|---|---|---|
| `PB-008` | `quick_task` | `baseline_semantic_mismatch` | Tasktext fordert neues Aktivierungs-/Zielauswahlverhalten; Sollbegründung bewertet dagegen reine read-only Orientierung. Ohne Trennung beider Intents existiert kein eindeutiger Sollpfad. |
| `PB-015`–`PB-020` | `verified_change` | `protocol_stage_mismatch` | Verified Change setzt eine genehmigte UR und eine Brownfield-Eignungsentscheidung mit Compact Record voraus; das Fixture enthält beides absichtlich nicht. |
| `PB-021`–`PB-030` | `structured_slice` | `protocol_stage_mismatch` | Structured Slice ist eine post-UR Brownfield-Entscheidung. Der One-Shot-Prompt verlangt ihren Endwert aus einem pre-UR Zustand. |
| `PB-031`–`PB-040` | `structured_delivery` | `protocol_stage_mismatch` | Auch ein breiter Tasktext ersetzt keine genehmigte UR und keine evidenzierte Brownfield Mode/Slice Decision; Fail-Closed ist im bereitgestellten Zustand korrekt. |

## Produktinterpretation

Der Benchmark vermischt zwei verschiedene Fragen:

1. **Was ist jetzt zulässig?**  
   Im bereitgestellten pre-UR Zustand: Gate-Check, Zielklärung oder UR-Etablierung; kein späterer
   Delivery Path darf erfunden werden.
2. **Welcher Delivery Path wird nach den erforderlichen Vorstufen gewählt?**  
   Diese Frage ist erst mit genehmigter UR und ausreichender Brownfield-Evidenz entscheidbar.

Die aktuelle Live-Serie beantwortet die erste Frage korrekt fail-closed, wird aber gegen Sollwerte
der zweiten Frage gegradet. Deshalb sind die 27 Ergebnisse echte und erhaltenswerte
Live-Beobachtungen, aber kein gültiger Nachweis gegen die erwartete Pfadqualität.

## Abgrenzung zu einem Routing-Produktfehler

Nicht belegt sind:

- eine falsche Pfadwahl bei vollständigem stufengerechtem Control State;
- Under-Governance;
- Over-Governance bei eindeutig trivialen oder ungated Quick Tasks;
- die Notwendigkeit, Gate-, Approval-, Brownfield- oder Mode-Semantik zu lockern;
- die Notwendigkeit, aus Tasktext einen nicht autoritativen Endpfad als autorisierte Entscheidung
  auszugeben.

Belegt ist:

- ein Produktgap im Benchmark-Vertrag zwischen beobachtetem Lifecycle-Zeitpunkt und gegradetem
  Endzustand;
- ein Baseline-Intent-Gap in `PB-008`;
- eine fehlende getrennte Metrik für `next_permissible_stage` und `eventual_delivery_path`.

## Kleinster separater Remediation-Scope

Vorgeschlagener Child-Run: `agdf-staged-proportionality-observation`

Der Child soll:

1. das Beobachtungsmodell in `next_permissible_stage` und `eventual_delivery_path` trennen;
2. gated Fälle stufenweise beobachten, ohne dass der Agent Approvals oder Brownfield-Entscheidungen
   erfindet;
3. die für eine spätere Mode/Slice-Entscheidung nötigen redigierten Tatsachen bereitstellen, ohne
   Sollpfad oder Sollbegründung zu leaken;
4. `PB-008` in read-only Zielklärung und tatsächliche Produktänderung aufteilen oder eindeutig
   umformulieren;
5. die bestehende Serie v2 unverändert als historische Evidenz erhalten;
6. eine neue frische Serie erst nach eigener UR, PRD, SD, TP und Brownfield-Freigabe aufzeichnen;
7. Gate-, Approval-, Brownfield-, Mode- und Interaction-Owner unverändert lassen, solange keine
   gesonderte Evidenz einen Routingfehler belegt.

## Stop-Bedingungen

- Das neue Protokoll leakt erwarteten Pfad oder Baseline-Begründung in die Agent-Beobachtung.
- Ein Agent soll seine eigene Approval- oder Brownfield-Autorität erzeugen.
- Ambiguität wird pauschal als korrekt, Over- oder Under-Governance umgedeutet.
- Die historische v2-Serie wird überschrieben oder nachträglich reklassifiziert.
- Eine Änderung der Runtime-Routingsemantik wird ohne getrennten Produktbefund in denselben Scope
  aufgenommen.

## Gate-Grenze

Diese Bewertung schließt den Produktbefund, autorisiert aber keine Remediation. Der vorgeschlagene
Child-Run benötigt eine eigene dauerhafte UR und ein separates exaktes `Approval: UR`. Parent- oder
Benchmark-Approvals werden nicht vererbt.

## Next Action

Die eigenständige Child-UR für `agdf-staged-proportionality-observation` liegt zur Prüfung vor.
Bei Zustimmung ist exakt `Approval: UR` erforderlich. Bis dahin bleiben Benchmark-Nachoptimierung,
neue Live-Serie, Child-QA, UAT, VCS und Release gesperrt.
