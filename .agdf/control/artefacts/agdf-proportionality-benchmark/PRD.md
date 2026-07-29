# PRD: AGDF Proportionality Benchmark

Status: approved
Gate: PRD
Revision: 2
Gate approval: exaktes `Approval: PRD` am 2026-07-28 nach Revalidierung von Run, Gate, Revision 6 und dauerhaftem Artefakt
Supersedes: genehmigte Revision 1 nach PB-T02-`requirements_gap`
Based on: genehmigte Child-UR, Brownfield Review `structured_slice`, Pre-Implementation Brownfield Analysis und Nutzerentscheidung „Frische Agent-Läufe“
Date: 2026-07-28
Owner: user / agent

## 1. Produktziel

Die aktuelle AGDF-Routingqualität gegen die versionierte 40-Fall-Baseline messen, indem ein
unterstützter Coding-Agent jeden Fall mehrfach frisch klassifiziert. Corpus, Ausgabevertrag,
Grading, Soll-Ist-Vergleich, Schwellen, Aggregation und Replay sind deterministisch; die eigentliche
Agent-Entscheidung wird ausdrücklich als variable Live-Beobachtung behandelt.

Der Benchmark erzeugt Diagnose- und QA-Evidenz. Er verändert keine Routing-, Gate-, Approval-,
Brownfield-, Interaction- oder Release-Regel.

## 2. Verbindlicher Baseline-Eingang

Der Benchmark verwendet
`PROPORTIONALITY_BENCHMARK_BASELINE.json` Version `1.0.0` unverändert.

Vor jeder Ausführung muss er fail-closed prüfen:

- exakt 40 eindeutige `case_id`;
- exakt die sechs Pfade `trivial_change`, `quick_task`, `compact_delivery`, `verified_change`,
  `structured_slice`, `structured_delivery`;
- mindestens 10 adversariale Fälle, aktuell 19;
- je Fall `task_summary`, `expected_delivery_path`, `rationale` und auflösbare redigierte
  `evidence_ref`;
- keine vorab eingetragenen Ist-, Klassifikations-, Beobachtungs- oder Pass-Felder;
- Baseline-Version und genehmigte Schwellenwerte.

Eine nicht passende oder still veränderte Baseline macht den Lauf ungültig.

## 3. Frische Routing-Beobachtung

Jeder Baseline-Fall wird über mindestens einen unterstützten, im Lauf festgelegten Agent-Adapter
mindestens dreimal frisch ausgeführt. Für einen vergleichbaren Erstbenchmark müssen Surface,
AGDF-Version, Modell, Adaptervertrag und relevante Konfiguration innerhalb einer Serie konstant
bleiben.

Der Agent erhält:

- den redigierten `task_summary`;
- den notwendigen synthetischen Repository-/Control-State-Kontext;
- die aktuellen kanonischen Mode-, Gate-, Scope- und Brownfield-Instruktionen;
- einen engen strukturierten Ausgabevertrag.

Der Agent erhält nicht:

- `expected_delivery_path`;
- Baseline-`rationale`;
- frühere Beobachtungen oder deren Ergebnis;
- gewünschte Fehlerklasse oder Schwellenstatus.

Jede Ausführung liefert ausschließlich beobachtbare Felder: gewählter normalisierter Pfad, kurze
Challenge-/Why-kompatible Begründung, Ambiguitätsindikator und referenzierte Entscheidungsgründe.
Hidden Reasoning wird weder angefordert noch persistiert.

Ein Modelllauf ist keine deterministische Evidenz. Seine Provenienz lautet
`live_agent_observation`. Der gleiche Lauf kann abweichen; genau diese Varianz muss der Benchmark
sichtbar machen.

## 4. Deterministische Replay- und Grading-Lane

Nach der Live-Aufzeichnung werden Beobachtungen mit Source-Fingerprint, Surface, Host-/CLI-Version,
AGDF-Version, Modell, Adapterversion, Zeitpunkt und Fall-ID persistiert.

Der Offline-Runner:

1. validiert Corpus, Beobachtungsschema, Provenienz und Redaction;
2. verwirft fehlende, stale, fremde oder unvollständige Beobachtungen;
3. normalisiert ausschließlich zulässige beobachtete Pfade;
4. berechnet Fehlerklassen, Verteilungen und Schwellen deterministisch;
5. erzeugt Maschinen- und Markdown-Bericht aus demselben Ergebnisobjekt.

Source-Fingerprints umfassen mindestens den Fallinput, Agent-Routing-Eintrag, `gate-check`-Skill,
relevante Mode-/Gate-/Scope-Contracts und den Normalisierungs-/Grading-Code. Änderungen machen
betroffene Beobachtungen stale; ein normaler Testlauf schreibt Fingerprints nie automatisch um.

Offline-Replay belegt reproduzierbares Grading aufgezeichneter Beobachtungen. Es wird nie als frische
Agent-, Host- oder Modellbeobachtung ausgegeben.

## 5. Normalisierte Delivery Paths

Der Benchmark berichtet genau sechs Pfade:

| Benchmark-Pfad | Kanonische Bedeutung |
|---|---|
| `trivial_change` | ungated Non-Normative Trivial Change Boundary |
| `quick_task` | ungated Quick Task |
| `compact_delivery` | nach genehmigter UR und Brownfield gewählter gespeicherter Modus `quick_task` |
| `verified_change` | bestehender fail-closed Verified-Change-Pfad |
| `structured_slice` | Brownfield-Entscheidung für formal begrenzten Slice |
| `structured_delivery` | voller strukturierter Delivery-Pfad |

`compact_delivery` ist kein siebter Runtime-Modus. Der Agent muss den notwendigen Gate-/
Brownfield-Kontext in seiner strukturierten Ausgabe sichtbar machen; fehlt er, ist die Beobachtung
`ambiguous`.

## 6. Ergebnis pro Beobachtung und Fall

Jede Beobachtung enthält mindestens:

- `observation_id`, `case_id`, Baseline-Version und Wiederholungsindex;
- `surface`, Host-/CLI-Version, AGDF-Version, Modell und Adapterversion;
- Source-Fingerprint und Beobachtungszeitpunkt;
- `observed_delivery_path` oder `null`;
- `ambiguous`;
- kurze code-owned Begründung und Entscheidungsgrund-Referenzen;
- Redaction-, Mutation- und Ausführungsstatus.

Zulässige Fehlerklassen je gültiger Beobachtung:

- `correct`;
- `under_governance`;
- `over_governance`;
- `ambiguous`.

Der Fallbericht zeigt die vollständige Pfadverteilung. Ein `consensus_delivery_path` entsteht nur,
wenn alle erforderlichen gültigen Wiederholungen denselben Pfad liefern. Jede gemischte Verteilung,
fehlende Beobachtung oder ungültige Ausgabe macht den Fall `ambiguous`; Ambiguität besitzt keinen
Rang und wird nie als Erfolg gezählt.

## 7. Schwellen

Der Bericht enthält Gesamtzahlen, Coverage je Sollpfad, adversariale Coverage, Beobachtungs- und
Fallverteilungen, Fehlerklassen, Ambiguität, kritische Unter-Governance, Small-Segment-
Über-Governance und blockierende IDs.

### Kritische Unter-Governance

Jede einzelne `under_governance`-Beobachtung eines Falls mit neuer Produktsemantik, Gate-,
Sicherheits-, Persistenz-, Architektur- oder vergleichbar schutzrelevanter Wirkung blockiert. Die
zulässige Anzahl ist `0`. Ein späterer korrekter Wiederholungslauf neutralisiert den Treffer nicht.

### Small-Segment-Über-Governance

Das kleine Segment besteht aus den acht Fällen mit erwartetem `trivial_change` oder `quick_task`.
Die primäre Fallrate ist:

`unanimous_over_governance_small_cases / all_small_segment_cases * 100`

Sie muss höchstens `10 %` betragen. Bei acht Fällen verletzt ein einstimmig überklassifizierter Fall
die Schwelle. Gemischte Beobachtungen werden nicht als Über-Governance versteckt, sondern blockieren
separat als `ambiguous`.

### Gesamtentscheidung

Der Benchmark blockiert bei:

- kritischer Unter-Governance;
- mehr als 10 % Small-Segment-Über-Governance;
- irgendeinem `ambiguous`-Fall;
- fehlender/staler Beobachtung;
- Baseline-, Schema-, Redaction-, Mutation- oder Provenienzfehler.

## 8. Bericht und Aussagegrenze

Maschinenbericht und kompakte Markdown-Zusammenfassung stammen aus demselben Ergebnisobjekt.

Der Bericht darf belegen:

- welche frischen Agent-Ausführungen unter welcher Version/Configuration beobachtet wurden;
- wie oft jeder Pfad je Fall gewählt wurde;
- wie Soll und beobachtete Entscheidungen abweichen;
- ob die genehmigten Schwellen für diese konkrete Serie erfüllt sind.

Er darf nicht behaupten:

- dass Modellrouting deterministisch ist;
- dass nicht beobachtete Hosts/Modelle dasselbe Verhalten zeigen;
- dass Offline-Replay eine frische Live-Ausführung ist;
- dass ein Gap repariert wurde;
- dass QA, UAT, Release oder allgemeine Produktreife allein durch den Benchmark bestanden sind.

Persistiert werden keine Secrets, Tokens, Cookies, Hidden Reasoning, privaten Vollprompts,
vollständigen privaten Attachments oder unnötigen absoluten Benutzerpfade.

## 9. Akzeptanzkriterien

| ID | Kriterium |
|---|---|
| PBM-1 | Baseline 1.0.0 wird mit exakt 40 eindeutigen Fällen geladen; jede Invariantenverletzung stoppt fail-closed. |
| PBM-2 | Alle sechs Sollpfade und mindestens 10 adversariale Fälle sind abgedeckt. |
| PBM-3 | Alle 40 Fälle besitzen mindestens drei frische, erwartungsblind erzeugte `live_agent_observation`-Datensätze auf einer konstanten unterstützten Serie. |
| PBM-4 | Sollpfad, jede Beobachtung, Provenienz, Fehlerklasse, Verteilung, Konsens und Fingerprint sind getrennt maschinenlesbar. |
| PBM-5 | Gemischte, fehlende oder ungültige Wiederholungen machen den Fall `ambiguous`; Ambiguität blockiert und besitzt keinen Rang. |
| PBM-6 | Kritische Unter-Governance beträgt auf Beobachtungsebene `0`; jeder Treffer blockiert. |
| PBM-7 | Einstimmige Über-Governance im acht Fälle umfassenden kleinen Segment beträgt höchstens `10 %`; gemischte Fälle blockieren separat. |
| PBM-8 | `compact_delivery` bleibt kontextabhängige Projektion von `quick_task`; kein neuer Runtime-Modus oder Task→Pfad-Classifier entsteht. |
| PBM-9 | JSON und Markdown stammen aus demselben Ergebnisobjekt und zeigen Verteilung, exakte Raten und blockierende IDs. |
| PBM-10 | Source-Fingerprint macht geänderte Routing-Owner stale; automatisches Observation-/Golden-Rewrite ist verboten. |
| PBM-11 | Negative Tests beweisen Under-/Over-/Ambiguous-, Stale-, Schema-, Redaction-, Mutation-, Provenienz- und Schwellen-Fail-Closed-Verhalten. |
| PBM-12 | Bestehende Skill-Evals, Gate-/Mode-/Verified-Change-Tests und Delivery Path Search bleiben unverändert kompatibel. |
| PBM-13 | Modell-/Hostvarianz und Offline-/Live-Evidenzgrenze sind im Bericht sichtbar; kein Determinismus- oder Cross-Host-Claim entsteht. |
| PBM-14 | Der Run verändert keine Routingentscheidung und repariert keinen gefundenen Gap automatisch. |

## 10. Nicht-Ziele

- neuer code-owned Task→Pfad-Classifier oder neue Routing-Policy;
- Änderung bestehender Mode-, Gate-, Approval-, Brownfield-, Scope- oder Interaction-Semantik;
- Delivery Path Search als Routing-Autorität;
- deterministischer Claim für die Agententscheidung;
- automatische Reparatur, Re-Kalibrierung oder Schwellenänderung;
- Cross-Host-, native UI-, Mehrturn-, Restart- oder Provider-Conformance;
- Commit, Push, Pull Request, Release oder Veröffentlichung.

## 11. Risiken und Stop-Bedingungen

- Kein unterstützter oder sicher isolierbarer Agent-Adapter: Ausführung blockiert.
- Erwarteter Pfad gelangt in Agentinput: Evidenz ungültig.
- Weniger als drei gültige Wiederholungen: Fall `ambiguous`, Gesamtblock.
- Ein Baseline-Sollpfad widerspricht kanonischen Ownern: Run stoppt; keine stille Umdeutung.
- Agentoutput erfordert Hidden Reasoning oder freie Nachinterpretation: Beobachtung ungültig.
- Bericht und Ergebnisobjekt driften: Evidenz ungültig.
- Jede Schwellenverletzung bleibt sichtbar und wird nicht durch Wiederholung, Ausschluss oder
  Nenneränderung neutralisiert.

## 12. Revisionsentscheidung

Die Nutzerentscheidung vom 2026-07-28 wählt „Frische Agent-Läufe“ gegenüber:

- neuem kanonischen Classifier; und
- reduziertem Replay-only-Claim.

Damit wird der Widerspruch aus `BROWNFIELD_ANALYSIS.md` aufgelöst: Die Pfadentscheidung selbst ist
variable Live-Evidenz, während Bewertung und Replay deterministisch bleiben.

## 13. Nächster Schritt

Revidiertes PRD prüfen. Nach erneuter PRD-Freigabe werden SD und TP nur für Live-Recorder,
Blind-Input, Wiederholungs-/Provenienzmodell, deterministisches Grading und Bericht gezielt
revidiert. Implementierung bleibt gesperrt.
