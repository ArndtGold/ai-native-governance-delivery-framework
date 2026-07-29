# User Requirements: Stufengerechte Proportionalitätsbeobachtung

Status: `approved`
Gate: UR
Revision: 1
Date: 2026-07-29
Run: `agdf-staged-proportionality-observation`
Parent: `agdf-product-maturity-roadmap`
Gate approval: exaktes `Approval: UR` am 2026-07-29 nach Revalidierung von Run, Gate, Revision 1 und dauerhaftem Artefakt

## Ausgangslage

Der abgeschlossene Implementierungs- und Testumfang des Runs
`agdf-proportionality-benchmark` erzeugte eine frische Serie mit 120/120 gültigen Observationen.
27/40 Fälle blieben fail-closed mehrdeutig. Der separat bewertete Produktbefund zeigt:

- 26 Fälle vergleichen einen pre-UR Beobachtungszustand mit einem post-UR/post-Brownfield Sollpfad;
- `PB-008` vermischt im Tasktext eine Produktänderung mit einer read-only Zielklärung;
- keine Observation belegt eine falsche Routingentscheidung bei vollständiger stufengerechter
  Evidenz;
- die historische Serie ist valide Ist-Evidenz und darf nicht nachträglich optimiert oder
  umgedeutet werden.

## Nutzerziel

Als AGDF-Maintainer möchte ich Proportionalität stufengerecht beobachten können, damit der Benchmark
sowohl die aktuell zulässige nächste Stufe als auch den späteren Delivery Path belastbar bewertet,
ohne dass ein Agent Approval-, Brownfield- oder Mode-State erfindet und ohne dass die erwartete
Antwort in das Blind-Fixture gelangt.

## Anforderungen

### SPO-1 — Zwei getrennte Beobachtungsfragen

Der Benchmark trennt mindestens:

- `next_permissible_stage` für den tatsächlich bereitgestellten Lifecycle-Zustand;
- `eventual_delivery_path` erst für einen Zustand, der alle kanonisch erforderlichen Vorstufen
  evidenziert.

Beide Ergebnisse werden separat gespeichert, begründet und gegradet.

### SPO-2 — Stufengerechte gated Fälle

Für approval- oder Brownfield-abhängige Fälle muss das Beobachtungsprotokoll die notwendigen
Vorstufen explizit abbilden. Kein Agent darf eine Nutzerfreigabe, abgeschlossene Brownfield Review
oder Mode/Slice Decision selbst erzeugen oder als vorhanden behaupten.

### SPO-3 — Blindheit und Autoritätsgrenze

Agent-seitige Eingaben enthalten weder erwarteten Pfad noch Baseline-Begründung, Gradingklasse oder
abgeleitete Synonyme. Mode-, Gate-, Approval-, Brownfield- und Interaction-Owner bleiben
kanonische Autorität; der Benchmark schafft keine zweite Routinglogik.

### SPO-4 — Eindeutige Baseline-Intents

`PB-008` wird so getrennt oder umformuliert, dass read-only Zielklärung und das Implementieren
neuen Zielauswahlverhaltens nicht denselben Testfall bilden. Alle Baseline-Sollwerte werden gegen
den Lifecycle-Zeitpunkt validiert, für den sie gelten.

### SPO-5 — Historische Evidenz bleibt unverändert

Die Serie `codex-gpt-5.6-sol-agdf-0.11.4-20260728-v2`, ihr Report und ihre QA-Entscheidung bleiben
unverändert erhalten. Eine neue Serie erhält eine neue Version, Serien-ID und vollständige
Provenienz.

### SPO-6 — Messbare neue Live-Evidenz

Nach allen erforderlichen Freigaben zeichnet der Child eine frische, wiederholte Agent-Serie mit
mindestens drei gültigen Observationen je Fall auf. Offline-Grading und Replay bleiben
deterministisch von der Live-Aufzeichnung getrennt.

### SPO-7 — Getrennte Qualitätsaussagen

Der Bericht unterscheidet mindestens:

- korrekte oder falsche aktuelle nächste Stufe;
- korrekten, falschen oder weiterhin nicht evaluierbaren späteren Delivery Path;
- Over-Governance;
- Under-Governance;
- Protokoll-/Evidenzambiguität.

Ambiguität darf nicht pauschal als korrekt, Over- oder Under-Governance gezählt werden.

### SPO-8 — Schutzwirkung bleibt erhalten

Die bestehende Nulltoleranz für kritische Under-Governance und die Grenze für Over-Governance im
eindeutig trivialen beziehungsweise ungated Small-Segment bleiben erhalten. Eine
Benchmarkverbesserung darf keine Gate-, Approval-, Brownfield-, Test-, Review-, Evidenz- oder
QA-Pflicht abschwächen.

## Akzeptanzsignale

- Alle 40 Fälle besitzen einen expliziten beobachteten Lifecycle-Zeitpunkt.
- Kein gated Sollpfad wird aus einem pre-UR Fixture als autorisierte Endentscheidung verlangt.
- `PB-008` hat einen eindeutigen Intent und genau einen stufengerechten Sollwert je Beobachtungsfrage.
- Blindheits-, Redaction-, Mutation-, Schema-, Provenienz- und Leakage-Tests bestehen.
- Mindestens 120 frische gültige Observationen werden unter fixer Surface-, Modell-, Runtime-,
  AGDF-, Baseline- und Adapter-Provenienz aufgenommen.
- Der neue Report bewertet aktuelle Stufe und späteren Pfad getrennt.
- Historische v2-Dateien und der blockierte Ausgangsrun bleiben byte-identisch oder werden durch
  einen geeigneten Integritätstest als unverändert nachgewiesen.
- Kritische Under-Governance bleibt `0`; Small-Segment Over-Governance bleibt höchstens `10 %`.

## Nicht-Ziele

- Änderung oder Lockerung kanonischer Gate-, Approval-, Brownfield-, Mode- oder
  Interaction-Semantik;
- ein freier Tasktext-Classifier als neue Routing-Autorität;
- automatische Nutzerfreigaben oder Agent-Selbstfreigaben;
- nachträgliche Reparatur, Überschreibung oder QA-Freigabe des Runs
  `agdf-proportionality-benchmark`;
- Cross-Surface-Produktclaims ohne eigene authentifizierte Host-Evidenz;
- Commit, Push, PR, Release oder Veröffentlichung.

## Evidenzgrenze

Repository- und deterministische Testevidenz belegen das Protokoll. Eine spätere frische Serie
belegt versionsgebundene Live-Agent-Beobachtungen auf den tatsächlich ausgeführten Surfaces. Sie
belegt weder universelle Modellstabilität noch nicht ausgeführte Hosts.

## Stop-Bedingungen

- Die erwartete Antwort oder Baseline-Begründung gelangt in Agent-Eingaben.
- Der Agent soll Approval- oder Brownfield-State erfinden.
- Ein Fixture präselektiert den Sollpfad statt nur kanonisch notwendige Tatsachen bereitzustellen.
- Die historische v2-Evidenz müsste überschrieben werden.
- Die Lösung erfordert neue Routing-, Gate- oder Approval-Semantik; dieser Gap ist dann separat
  upstream zu entscheiden.
- Eine erforderliche Freigabe fehlt.

## Gate-Grenze

Diese UR autorisiert noch keine Brownfield Review, PRD, SD, TP, Implementierung oder Live-Serie.
Nach exaktem `Approval: UR` folgt zuerst die Brownfield Review und die proportionale
Mode/Slice-Entscheidung. Parent- und Vorgänger-Approvals werden nicht vererbt.

Exakter Freigabewert: `Approval: UR`
