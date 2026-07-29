# Product Requirements: Structured Delivery Depth Boundary

Status: `approved`
Gate: PRD
Revision: 1
Date: 2026-07-29
Run: `agdf-structured-delivery-depth-boundary`
Based on: genehmigte UR Revision 1, Brownfield Review `structured_delivery`, UX Intent `ready`
Gate approval: exaktes `Approval: PRD` am 2026-07-29 nach Revalidierung von Run, Gate, Revision 1
und dauerhaftem Artefakt

## 1. Produktentscheidung

AGDF erhält eine einzige normative Tiefenentscheidung für formale Delivery-Pfade:

1. Bestehende kompakte Pfade werden ausschließlich nach ihren unveränderten Regeln bewertet.
2. Sind sie nicht anwendbar, prüft Brownfield Review die strukturierten Tiefenfakten.
3. Genau eines von drei Ergebnissen ist zulässig:
   - `structured_slice`;
   - `structured_delivery`;
   - `depth_unresolved` als nicht autorisierender Informationsgap.

`depth_unresolved` ist kein neuer persistierter Delivery Mode. Operativ bleibt die Mode/Slice
Decision offen oder blockiert, bis ausreichende Evidenz vorliegt.

## 2. Nutzer und Nutzen

Primäre Nutzer sind Auftraggeber, Maintainer und ausführende Coding Agents, die nach genehmigter UR
entscheiden müssen, wie tief die formale Ausarbeitung eines Changes sein muss.

Der Nutzen:

- nachvollziehbare statt intuitive Zeremonietiefe;
- kleine, beherrschbare formale Slices bleiben klein;
- hohe Wirkung kann nicht durch geringe Datei- oder Ownerzahl verborgen werden;
- fehlende Fakten werden sichtbar statt durch konservativ klingende Scheingenauigkeit ersetzt;
- Benchmarkmessung folgt der Produktsemantik und definiert sie nicht.

## 3. Eintrittsvoraussetzungen

Eine Structured-Depth-Entscheidung ist nur zulässig, wenn:

- eine dauerhafte UR genehmigt ist;
- Brownfield Review den bestehenden Systemkontext untersucht;
- Quick Task/Compact Delivery und Verified Change nach ihren bestehenden Voraussetzungen
  ausgeschlossen oder explizit eskaliert wurden;
- die entscheidenden Depth Facts dauerhaft evidenziert sind.

Ohne diese Voraussetzungen wird keine strukturierte Tiefenklasse gewählt.

## 4. Entscheidungsmodell

### 4.1 Zwingende Full-Depth-Trigger

`structured_delivery` ist zwingend, sobald mindestens eine der folgenden Wirkungen tatsächlich
vorliegt:

1. **Authority, Policy oder Security**
   - neue oder veränderte Authority-/Trust-Grenze;
   - Permission-, Sicherheits-, Compliance- oder normative Policy-Änderung;
   - mehrere unabhängige Entscheidungsowner müssen koordiniert freigeben.
2. **Architektur oder Runtime**
   - neue oder veränderte Ausführungs-, Orchestrierungs-, Durable-Execution-, Concurrency-,
     Failure- oder Recovery-Grenze;
   - Architekturverantwortung oder Laufzeitverhalten wird über eine lokale Slice hinaus verändert.
3. **Persistence, Daten oder Migration**
   - persistentes Schema, Datenbedeutung, Datenmigration oder irreversible Zustandsüberführung;
   - koordinierter Cutover, längeres Kompatibilitätsfenster oder nicht lokal rückrollbare Migration.
4. **Externer oder öffentlicher Contract**
   - externe API, öffentliches CLI-Verhalten, Protokoll, Dateiformat oder kompatibilitätsrelevanter
     Integrationscontract;
   - Versionierung oder unabhängige Consumer-Koordination ist erforderlich.
5. **Release, Deployment oder Cross-Host**
   - eigener Rollout-, Deployment-, Rollback-, Feature-Flag- oder Releaseplan;
   - koordinierte Aktivierung über Hosts, Produkte oder Betriebsgrenzen.
6. **Nicht begrenzbare Consumer-/Owner-Koordination**
   - der Change kann nicht als unabhängig akzeptierbare und rückrollbare Slice geliefert werden;
   - mehrere Consumer oder Owner benötigen einen gemeinsamen Cutover oder ein gemeinsames
     Kompatibilitätsfenster.

Ein einzelner Trigger genügt aufgrund seiner Wirkung, nicht aufgrund einer Anzahl.

### 4.2 Bounded-Slice-Test

`structured_slice` ist nur zulässig, wenn **alle** folgenden Aussagen positiv evidenziert sind:

1. Der Change besitzt genau ein kohärentes Nutzer-/Produktergebnis mit klarer Akzeptanzgrenze.
2. Authority und Source of Truth sind bekannt; keine neue Trust-, Policy-, Permission- oder
   Security-Grenze entsteht.
3. Betroffene Owner und Consumer sind identifiziert; ihre Zusammenarbeit passt in die
   Slice-Grenze und benötigt keinen gemeinsamen externen Cutover.
4. Architektur-, Runtime-, Persistence-, Daten-, externe API-, öffentliche CLI-, Release- und
   Cross-Host-Wirkung sind nachweislich nicht Full-Depth-relevant.
5. Migration und Propagation sind begrenzt, kompatibel, testbar und lokal rückrollbar.
6. Fehler-, Recovery- und Rollbackverhalten bleiben innerhalb der Slice beherrschbar.
7. Die Slice kann mit eigenen Akzeptanzsignalen geprüft und abgenommen werden, ohne unbekannte
   spätere Arbeit als Voraussetzung zu verstecken.

Mehrere Dateien, Owner, Consumer oder Derived Paths verletzen den Test nicht automatisch.
Produktsemantik allein erzwingt ebenfalls keine Full Delivery.

### 4.3 Unvollständige oder widersprüchliche Fakten

Ist mindestens eine entscheidende Aussage des Bounded-Slice-Tests unbekannt oder widersprüchlich
und liegt zugleich kein belegter Full-Depth-Trigger vor, lautet das Ergebnis `depth_unresolved`.

Die sichtbare Projektion muss:

- die fehlenden oder widersprüchlichen Fakten benennen;
- genau den zuständigen Evidenz-/Produktowner nennen, soweit bekannt;
- PRD-/SD-/TP- oder Implementierungsfortschritt sperren;
- nach Evidenzergänzung eine erneute Brownfield-/Mode-Slice-Bewertung erlauben.

Unbekannt wird nicht automatisch zu `structured_delivery`; das würde Informationsgaps verbergen
und Zeremonie ohne Produktentscheidung erzeugen.

## 5. Sichtbare Entscheidungsbegründung

Jede positive Depth Decision zeigt:

- `decision`: `structured_slice` oder `structured_delivery`;
- ausschlaggebende Depth-Dimensionen;
- Ergebnis des Bounded-Slice-Tests;
- verworfene Alternative mit Grund;
- Evidenzreferenzen;
- erforderliches nächstes Gate.

Ein Informationsgap zeigt stattdessen:

- `decision: unresolved` in der Darstellung, ohne neuen persistierten Modewert;
- fehlende/widersprüchliche Dimensionen;
- zulässige Evidenz- oder Klärungsaktion;
- verbotene spätere Artefakt- und Implementierungsschritte.

## 6. Artefakttiefe

Structured Slice und Structured Delivery behalten dieselbe Gate-Reihenfolge:

`UR → PRD → SD → TP → Brownfield Analysis → CD+Tests → CR → QA → UAT → OR`

Structured Slice unterscheidet sich durch begrenzten Inhalt, nicht durch ausgelassene Gates:

- PRD beschreibt nur das kohärente Slice-Ergebnis, Akzeptanzsignale und Nicht-Ziele.
- SD beschreibt nur betroffene Owner, Contracts, Propagation, Kompatibilität und Recovery der Slice.
- TP enthält nur zur Slice tracebare Tasks und Tests.
- Scope-Wachstum oder ein neu belegter Full-Depth-Trigger erzwingt Re-Evaluation vor Fortsetzung.

Structured Delivery deckt alle betroffenen Authority-, Architektur-, Runtime-, Consumer-,
Migrations-, Betriebs- und Releasegrenzen vollständig ab.

## 7. Kalibrierung der bestehenden Benchmarkfälle

Die historischen neutralen Evidence Packs für `PB-022`, `PB-028` und `PB-029` enthalten identische
Owner-/Path-Zahlen und negative grobe Impactflags, aber keine vollständige Evidenz zu Authority,
Consumerkoordination, Migrationsrückrollbarkeit, Recovery und Cutover.

Produktentscheidung:

- Die Packs sind für eine positive Depth Decision nicht vollständig.
- Unter dieser PRD würden alle drei konsistent `depth_unresolved` ergeben.
- Historische r2-/r3-Resultate werden nicht umgewertet.
- Ein späterer Benchmark-v3-Run darf die Packs mit vollständigen neutralen Depth Facts neu
  versionieren und dann eine neue Blindserie durchführen.

Damit wird weder `structured_slice` noch `structured_delivery` zur gewünschten Baseline
zurückgerechnet.

## 8. Normalisierte Begründungskategorien

Die Produktsemantik benötigt mindestens diese stabilen Kategorien:

- `bounded_structured_slice`;
- `authority_policy_security_depth`;
- `architecture_runtime_depth`;
- `persistence_migration_depth`;
- `external_contract_depth`;
- `release_cross_host_depth`;
- `unbounded_consumer_coordination`;
- `depth_facts_missing`;
- `depth_facts_conflicting`.

Die technische Repräsentation und genaue Feldstruktur gehören in SD. Die Kategorien dürfen keine
zweite Mode- oder Gate-Taxonomie bilden.

## 9. Produktanforderungen und Akzeptanzkriterien

| ID | Anforderung | Akzeptanzkriterium |
|---|---|---|
| SDB-P01 | Ein normativer Owner | Modes Contract besitzt die vollständige Matrix; Konsumenten referenzieren oder projizieren sie ohne abweichende Vollkopie. |
| SDB-P02 | Full-Depth-Trigger | Jeder Trigger aus 4.1 erzwingt unabhängig von kleinen Datei-/Ownerzahlen `structured_delivery`. |
| SDB-P03 | Bounded Slice | `structured_slice` ist nur möglich, wenn alle sieben Bounded-Slice-Aussagen positiv evidenziert sind. |
| SDB-P04 | Keine Proxy-Schwelle | Reine Owner-/Datei-/Consumer-/Derived-Path-Zahlen entscheiden keinen Pfad. |
| SDB-P05 | Fail-closed Informationsgap | Fehlende oder widersprüchliche entscheidende Fakten halten die Mode/Slice Decision offen/blockiert und benennen Recovery. |
| SDB-P06 | Sichtbare Begründung | Positive und unresolved Entscheidungen zeigen die in Abschnitt 5 definierten Informationen. |
| SDB-P07 | Gate-Parität | Slice und Full Delivery verwenden dieselbe bestehende Gate-Reihenfolge und Approval-Semantik. |
| SDB-P08 | Scope-Reevaluation | Neu auftretender Full-Depth-Trigger stoppt die bisherige Slice und erzwingt erneute Bewertung. |
| SDB-P09 | Kompakte Pfade stabil | Trivial, Quick/Compact und Verified Change behalten ihre heutigen Voraussetzungen und Übergänge. |
| SDB-P10 | Benchmarktrennung | PB-022/028/029 bleiben historische Evidenz; v3 benötigt neue vollständige Facts und eigenen Run. |
| SDB-P11 | Oberflächenkonsistenz | Run State, Statusdarstellung, Skills, Runtime Integrity und Evals widersprechen der kanonischen Matrix nicht. |
| SDB-P12 | Deterministische Evidenz | Positive, negative, kumulative, widersprüchliche und missing-fact Fälle sind automatisiert prüfbar. |

## 10. Nicht-Ziele

- keine neue Gate-Reihenfolge, Approval-Formel oder Nutzerfreigabe;
- kein persistierter `depth_unresolved`-Mode;
- keine Abschaffung von `structured_slice` oder `structured_delivery`;
- keine Änderung kompakter Pfade;
- keine Benchmark-v3-, Corpus-, Fixture-, Adapter- oder Baselineänderung;
- keine rückwirkende Umwertung historischer Beobachtungen;
- keine technische Komponenten-, Schema- oder Dateientscheidung vor SD;
- keine Implementierung, VCS-, Release-, Reinstall- oder Live-Host-Aktion.

## 11. Offene SD-Fragen

- Wie wird die normative Matrix so repräsentiert, dass Skills und Runtime sie ohne Drift
  konsumieren?
- Welche bestehenden Run-State-Felder reichen aus, und welche maschinenprüfbaren Evidenzfelder
  fehlen gegebenenfalls?
- Wie projiziert der Gate-Checker `depth_unresolved`, ohne einen neuen Modewert einzuführen?
- Welche generierten Runtimeflächen werden synchronisiert?
- Welche Runtime-Integrity-, Control-State-, Skill-Eval- und Package-Tests beweisen die Matrix?
- Wie werden aktive fremde Benchmarkänderungen während der Implementierung isoliert?

## 12. Gate-Grenze

Dieses PRD autorisiert weder SD noch Implementierung. Zur Freigabe ist der exakte Wert erforderlich:

`Approval: PRD`
