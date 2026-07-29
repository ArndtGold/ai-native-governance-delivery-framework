# User Requirements: Structured Delivery Depth Boundary

Status: `approved`
Gate: UR
Revision: 1
Date: 2026-07-29
Run: `agdf-structured-delivery-depth-boundary`
Source finding: `SPF-05`
Gate approval: exaktes `Approval: UR` am 2026-07-29 nach Revalidierung von Run, Gate, Revision 1
und dauerhaftem Artefakt

## 1. Nutzerproblem

AGDF kennt nach der Brownfield Review die beiden formalen Pfade `structured_slice` und
`structured_delivery`, beschreibt ihre Grenze aber nur abstrakt. Für eine kleine formale Slice
genügt „einige formale Artefakte, bewusst klein und begrenzt“; für Structured Delivery nennt der
Vertrag breite Produkt-, Architektur-, Runtime-, Policy-, Persistence-, Release- oder
Cross-Owner-Wirkung. Daraus lässt sich bei realen Kombinationen aus mehreren Ownern, Consumern,
Migrationen und Produktsemantik keine reproduzierbare Entscheidung ableiten.

Die Staged-Benchmarkfälle `PB-022`, `PB-028` und `PB-029` zeigen das konkret: Aus weitgehend
identischen neutralen Fakten entstehen sowohl `structured_slice` als auch `structured_delivery`.
Das ist ein Requirements-Gap, kein hinreichender Beleg für Modell- oder Implementierungsfehler.

## 2. Ziel

AGDF soll nach genehmigter UR und Brownfield Review eine einzige kanonische, beobachtbare und
fail-closed Entscheidungsgrenze zwischen `structured_slice` und `structured_delivery` besitzen.
Die Grenze bestimmt die notwendige Artefakttiefe innerhalb der bestehenden Gate-Reihenfolge; sie
erzeugt weder ein neues Gate noch eine zusätzliche Nutzerfreigabe.

## 3. Anforderungen

### SDB-1 — Kanonischer Owner

Die normative Tiefengrenze liegt einmalig im Modes Contract. Gate Transition, Skills,
Runtimeflächen und Benchmarks konsumieren oder referenzieren diese Grenze und pflegen keine zweite
abweichende Policy.

### SDB-2 — Beobachtbare Entscheidungsdimensionen

Die Entscheidung berücksichtigt mindestens:

- kanonische Owner und Authority-Grenzen;
- betroffene Consumer und notwendige Koordination;
- Produkt- und Nutzersemantik;
- Runtime-, Architektur-, Policy-/Permission-, Security-, Persistence- und Datenwirkung;
- externe API- und CLI-Contract-Wirkung;
- Migrationsbreite, Rückrollbarkeit und Kompatibilitätsfenster;
- Release-, Deployment- und Cross-Host-Wirkung;
- Nachweisbarkeit, Validierung und offene unbekannte Fakten.

### SDB-3 — Structured Slice

`structured_slice` ist nur wählbar, wenn der formale Change als begrenzte, eigenständig prüfbare
Slice beschrieben ist, alle entscheidenden Impact-Fakten bekannt sind und keine zwingende
Full-Depth-Dimension vorliegt. PRD, SD und TP bleiben erforderlich, dürfen aber nachweisbar auf die
genehmigte Slice begrenzt werden.

### SDB-4 — Structured Delivery

`structured_delivery` ist erforderlich, wenn eine entscheidende Full-Depth-Dimension vorliegt oder
der Change mehrere nicht innerhalb einer Slice beherrschbare Authority-, Architektur-, Runtime-,
Policy-, Persistence-, Migration-, Release- oder Cross-Host-Grenzen koordiniert.

### SDB-5 — Keine simplen Proxy-Schwellen

Datei-, Owner-, Consumer- oder Derived-Path-Anzahlen sind Evidenzsignale, aber keine alleinigen
Entscheidungsschwellen. Mehrere Owner dürfen nicht automatisch Full Delivery bedeuten; umgekehrt
darf ein einzelner Owner entscheidende Architektur-, Policy-, Persistence- oder Release-Wirkung
nicht zu einer Slice herabstufen.

### SDB-6 — Fail-Closed bei fehlenden Fakten

Fehlen entscheidende Impact-, Authority-, Migrations- oder Release-Fakten, darf keine scheinpräzise
Tiefenentscheidung ausgegeben werden. Die Projektion benennt die fehlenden Fakten und hält die
Mode/Slice Decision offen oder blockiert, bis Brownfield-Evidenz die Grenze trägt. Ein
Benchmark-Kandidat bleibt nicht autorisierend.

### SDB-7 — Sichtbare Begründung

Die Mode/Slice Decision dokumentiert mindestens Ergebnis, ausschlaggebende Signale, verworfene
Alternative, Evidenz und erforderliche nächste Artefakttiefe. Nutzer- und Maschinenprojektion
bleiben inhaltlich konsistent.

### SDB-8 — Bestehende Grenzen bewahren

Trivial Change, Quick Task/Compact Delivery und Verified Change bleiben unverändert. Die neue
Tiefengrenze greift erst, nachdem kompakte Pfade aufgrund ihrer bestehenden Voraussetzungen
ausgeschlossen oder bewusst eskaliert wurden.

### SDB-9 — Entscheidungs- und Regressionsevidenz

Automatisierte Decision-Matrix, Runtime-Integrity-Prüfungen und deterministische Skill-Evals decken
mindestens ab:

- begrenzte Produktsemantik mit mehreren Ownern, aber ohne Full-Depth-Wirkung;
- einzelner Owner mit entscheidender Architektur-, Policy-, Persistence- oder Release-Wirkung;
- breite Consumer-/Migrationswirkung;
- Cross-Host-/Runtime-Koordination;
- unvollständige oder widersprüchliche Fakten;
- unveränderte Quick-/Compact-/Verified-Change-Grenzen;
- `PB-022`, `PB-028` und `PB-029` als neutrale, nicht autorisierende Kalibrierfälle.

### SDB-10 — Benchmark-Unabhängigkeit

Die Produktentscheidung wird aus dem Runtime Contract und belastbaren Brownfield-Fällen
abgeleitet, nicht aus einem gewünschten Benchmarkscore. Erst nach genehmigter und geprüfter
Structured-Depth-Semantik darf ein separater Benchmark-v3-Run Baselines, Fixtures oder Adapter
ändern.

## 4. Nicht-Ziele

- keine Änderung der Gate-Reihenfolge oder exakten Approval-Formeln;
- kein neues Delivery-Mode-Label;
- keine automatische Pfadwahl vor genehmigter UR und Brownfield Review;
- keine Benchmark-v3-, Corpus-, Fixture- oder Baseline-Änderung in diesem Run;
- keine rückwirkende Umwertung historischer r2-/r3-Evidenz;
- keine Implementierung der Unified Journey;
- keine automatische VCS-, Release-, Reinstall- oder Live-Host-Aktion.

## 5. Akzeptanzsignale

- Zwei Prüfer gelangen aus denselben vollständigen Fakten zur selben Depth-Klasse oder demselben
  fail-closed Informationsgap.
- Die Entscheidung erklärt, warum die Alternative nicht passt.
- Identische neutrale Fakten werden nicht allein wegen unterschiedlicher Taskformulierungen
  unterschiedlich klassifiziert.
- Hohe Wirkung kann nicht durch geringe Datei-/Ownerzahlen verborgen werden.
- Fehlende entscheidende Fakten erzeugen keinen erfundenen `structured_slice`- oder
  `structured_delivery`-Kandidaten.
- Alle abgeleiteten Runtimeflächen, Matrixprüfungen, Skill-Evals und vollständigen Package-Tests
  bleiben konsistent.

## 6. Evidenz und Source of Truth

- `.agdf/control/artefacts/agdf-product-maturity-roadmap/STAGED_PRODUCT_FINDINGS_ASSESSMENT.md`;
- `.agdf/control/artefacts/agdf-staged-proportionality-observation/QA_REPORT.md`;
- `plugin/meta/contracts/modes.md`;
- `plugin/meta/contracts/gate-transition.md`;
- `evals/proportionality/staged-scenarios.json`;
- `evals/proportionality/fixtures/staged-catalog.json`.

## 7. Gate-Grenze

Diese UR autorisiert keine Produkt-, Contract-, Benchmark- oder Codeänderung. Nach exaktem
`Approval: UR` folgt die Brownfield Review. Wegen neuer normativer Produktsemantik ist mindestens
ein strukturierter Pfad zu erwarten; die konkrete Tiefe wird erst nach Brownfield-Evidenz
festgelegt.

Exakter Freigabewert:

`Approval: UR`
